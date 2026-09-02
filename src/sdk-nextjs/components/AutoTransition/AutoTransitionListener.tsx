import { FC, useContext, useEffect, useRef } from 'react';
import { TransitionMachineContext } from '../../provider/TransitionMachineContext';
import { AssetsCacheContext } from '../../assets/AssetsCacheProvider';
import { getCacheAssetKey } from '../../assets/getCacheAssetKey';
import { Relation } from '../../../sdk/types/project/Relation';
import { Article } from '../../../sdk/types/article/Article';

const TRANSITION_DURATION_MS = 250;
const POST_VIDEO_END_DELAY_MS = 1000;
const VIDEO_LOOKUP_TIMEOUT_MS = 1000;
const FIRE_RETRY_MS = 100;
const TOUCH_MOVE_CANCEL_THRESHOLD_PX = 10;
const GRACE_CANCEL_EVENTS: Array<keyof WindowEventMap> = ['pointerdown', 'touchstart', 'wheel', 'keydown'];

interface Props {
  relations: Relation[];
  articlesData: Record<string, { article: Article }>;
}

interface Visit {
  sceneId: string;
  disarm: () => void;
}

// Fires a relation's auto-trigger ('auto' timer / 'video-end') for the active scene, the same
// way link clicks do (TRANSITION_TRIGGER). Lives above the scene lifecycle: scenes mount twice
// during a transition and unmount at SETTLE_END, so per-scene hooks can't own the timers.
export const AutoTransitionListener: FC<Props> = ({ relations, articlesData }) => {
  const actorRef = TransitionMachineContext.useActorRef();
  const isActive = TransitionMachineContext.useSelector((state) => state.matches('active'));
  const isTransitioning = TransitionMachineContext.useSelector((state) => state.matches('transitioning'));
  const { videoCache } = useContext(AssetsCacheContext);
  const visitRef = useRef<Visit | null>(null);

  useEffect(() => {
    if (!isActive) return;
    const sceneId = actorRef.getSnapshot().context.scenes[0]?.id;
    if (!sceneId) return;
    // The machine bounces active → preparing → active on every tap; only a real scene
    // change starts a new visit, so a stray tap neither cancels nor restarts a countdown.
    if (visitRef.current?.sceneId === sceneId) return;
    visitRef.current?.disarm();
    let disarmed = false;
    const teardowns: Array<() => void> = [];
    const disarm = () => {
      if (disarmed) return;
      disarmed = true;
      teardowns.forEach(teardown => teardown());
      teardowns.length = 0;
    };
    visitRef.current = { sceneId, disarm };

    const relation = relations.find(r => r.from === sceneId && r.trigger !== undefined);
    const trigger = relation?.trigger;
    const article = articlesData[sceneId]?.article;
    if (!relation || !trigger || !article) return;
    const fire = () => {
      if (disarmed) return;
      const snapshot = actorRef.getSnapshot();
      // Dropped outside `active` (mid-tap `preparing`): retry shortly instead of losing the
      // transition; a real swipe disarms via the `transitioning` effect below.
      if (!snapshot.matches('active')) {
        const retry = window.setTimeout(fire, FIRE_RETRY_MS);
        teardowns.push(() => window.clearTimeout(retry));
        return;
      }
      if (snapshot.context.scenes[0]?.id !== sceneId) {
        disarm();
        return;
      }
      disarm();
      if (relation.type === 'slide') {
        actorRef.send({
          type: 'TRANSITION_TRIGGER',
          transition: 'slide',
          to: relation.to,
          direction: relation.direction,
          duration: TRANSITION_DURATION_MS
        });
      } else if (relation.type === 'fade') {
        actorRef.send({
          type: 'TRANSITION_TRIGGER',
          transition: 'fade',
          to: relation.to,
          duration: TRANSITION_DURATION_MS
        });
      } else {
        actorRef.send({
          type: 'TRANSITION_TRIGGER',
          transition: 'reveal',
          to: relation.to,
          direction: relation.direction,
          offset: relation.offset,
          mode: relation.mode,
          duration: TRANSITION_DURATION_MS
        });
      }
    };

    const triggerSectionId = trigger.type === 'video-end' && trigger.videoType === 'section' ? trigger.videoId : null;

    // Any interaction cancels: click anywhere, scrolling (wheel / touch drag), keys. The one
    // exemption is a click inside the trigger video's own wrapper (cover included), so
    // tapping the cover to start the video keeps its trigger armed. Touch drags use a small
    // movement threshold so the finger jitter of a sloppy cover tap doesn't cancel, and the
    // machine's own programmatic scrollTo fires none of these events.
    const armInteractionCancellation = () => {
      const handleClick = (event: MouseEvent) => {
        const target = event.target;
        if (
          target instanceof Element
          && triggerSectionId
          && target.closest(`.section-video-wrapper-${triggerSectionId}`)
        ) return;
        disarm();
      };
      let touchStart: { x: number; y: number } | null = null;
      const handleTouchStart = (event: TouchEvent) => {
        const touch = event.touches[0];
        touchStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
      };
      const handleTouchMove = (event: TouchEvent) => {
        const touch = event.touches[0];
        if (!touchStart || !touch) return;
        if (Math.hypot(touch.clientX - touchStart.x, touch.clientY - touchStart.y) > TOUCH_MOVE_CANCEL_THRESHOLD_PX) {
          disarm();
        }
      };
      const cancel = () => disarm();
      window.addEventListener('click', handleClick, { capture: true });
      window.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
      window.addEventListener('touchmove', handleTouchMove, { capture: true, passive: true });
      window.addEventListener('wheel', cancel, { capture: true, passive: true });
      window.addEventListener('keydown', cancel, { capture: true, passive: true });
      teardowns.push(() => {
        window.removeEventListener('click', handleClick, { capture: true });
        window.removeEventListener('touchstart', handleTouchStart, { capture: true });
        window.removeEventListener('touchmove', handleTouchMove, { capture: true });
        window.removeEventListener('wheel', cancel, { capture: true });
        window.removeEventListener('keydown', cancel, { capture: true });
      });
    };

    // Once the video has completed, hold for a short grace window where any interaction
    // at all keeps the user in control; otherwise advance.
    const startGrace = () => {
      const graceTimer = window.setTimeout(fire, POST_VIDEO_END_DELAY_MS);
      teardowns.push(() => window.clearTimeout(graceTimer));
      const cancelOnAny = () => disarm();
      GRACE_CANCEL_EVENTS.forEach(eventName => window.addEventListener(eventName, cancelOnAny, { capture: true, passive: true }));
      teardowns.push(() => GRACE_CANCEL_EVENTS.forEach(eventName => window.removeEventListener(eventName, cancelOnAny, { capture: true })));
    };

    const watchVideo = (video: HTMLVideoElement) => {
      let lastTime = video.currentTime;
      let completed = false;
      const detachVideoListeners = () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('seeking', handleSeeking);
      };
      const complete = () => {
        if (completed || disarmed) return;
        completed = true;
        // The video has done its job — drop its listeners before grace starts. Around a
        // loop restart iOS Safari emits seeking/pause with orderings desktop never does,
        // and any of them arriving mid-grace would clear the grace timer. Real user
        // interaction during grace is caught by the blanket listeners startGrace attaches.
        detachVideoListeners();
        startGrace();
      };
      // Videos are unconditionally looped, so `ended` never fires for them: completion is
      // the playback position wrapping from the tail back to the start.
      const handleTimeUpdate = () => {
        const time = video.currentTime;
        const { duration } = video;
        if (!completed && isLoopWrap(time, lastTime, duration)) {
          complete();
        }
        lastTime = time;
      };
      const handleEnded = () => complete();
      const handlePause = () => disarm();
      const handleSeeking = () => {
        // A loop restart is reported as a seek to ~0 while playing. Don't require lastTime
        // to still sit near the duration (Chrome's ordering): on iOS this event can arrive
        // after the wrapped timeupdate already reset it. Only a seek that cannot be a loop
        // wrap — while paused, or landing past the first second — counts as scrubbing.
        if (video.paused || video.currentTime >= 1) {
          disarm();
        }
      };
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('pause', handlePause);
      video.addEventListener('seeking', handleSeeking);
      teardowns.push(detachVideoListeners);
    };

    if (trigger.type === 'auto') {
      armInteractionCancellation();
      const timer = window.setTimeout(fire, trigger.delay * 1000);
      teardowns.push(() => window.clearTimeout(timer));
    } else if (triggerSectionId !== null) {
      const section = article.sections.find(s => s.id === triggerSectionId);
      const media = section?.media;
      // Section (or its video) deleted → ignore the trigger entirely.
      if (media?.type !== 'video') return;
      armInteractionCancellation();
      const key = getCacheAssetKey(media.url, triggerSectionId, sceneId);
      const lookupStartedAt = performance.now();
      let lookupRafId: number | null = null;
      const tryAttach = () => {
        if (disarmed) return;
        const video = videoCache.get(key);
        if (video) {
          watchVideo(video);
          return;
        }
        if (performance.now() - lookupStartedAt > VIDEO_LOOKUP_TIMEOUT_MS) return;
        lookupRafId = requestAnimationFrame(tryAttach);
      };
      teardowns.push(() => {
        if (lookupRafId !== null) cancelAnimationFrame(lookupRafId);
      });
      tryAttach();
    }
  }, [isActive, actorRef, relations, articlesData, videoCache]);

  useEffect(() => {
    // A real swipe began (enough movement in a direction that has a relation) — cancel,
    // even if the swipe later fails and settles back to this scene.
    if (isTransitioning) {
      visitRef.current?.disarm();
    }
  }, [isTransitioning]);

  useEffect(() => () => {
    visitRef.current?.disarm();
    visitRef.current = null;
  }, []);

  return null;
};

function isLoopWrap(time: number, lastTime: number, duration: number): boolean {
  return Number.isFinite(duration) && duration > 0 && time < lastTime && lastTime > duration - 1 && time < 1;
}

