import { FC, useContext, useEffect, useRef } from 'react';
import { TransitionMachineContext } from '../../provider/TransitionMachineContext';
import { AssetsCacheContext } from '../../assets/AssetsCacheProvider';
import { getCacheAssetKey } from '../../assets/getCacheAssetKey';
import { Relation } from '../../../sdk/types/project/Relation';
import { Article } from '../../../sdk/types/article/Article';
import { ArticleItemType } from '../../../sdk/types/article/ArticleItemType';

const TRANSITION_DURATION_MS = 250;
const POST_VIDEO_END_DELAY_MS = 2500;
const VIDEO_LOOKUP_TIMEOUT_MS = 1000;
const FIRE_RETRY_MS = 100;
const NATIVE_INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, select, textarea, iframe';
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

    // Intentional interactions only: links/CTAs, other interactive items, other videos.
    // Taps on empty space or plain content never cancel; the trigger video's own wrapper
    // (cover included) is exempt so starting it doesn't kill its own trigger.
    const armClickCancellation = () => {
      const interactiveItemIds = getInteractiveItemIds(article);
      const handleClick = (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (triggerSectionId && target.closest(`.section-video-wrapper-${triggerSectionId}`)) return;
        if (target.closest(NATIVE_INTERACTIVE_SELECTOR)) {
          disarm();
          return;
        }
        if (target.closest('[class*="section-video-wrapper-"]')) {
          disarm();
          return;
        }
        const itemWrapper = target.closest('[class*="item-wrapper-"]');
        const itemId = itemWrapper ? getItemIdFromWrapper(itemWrapper) : null;
        if (itemId !== null && interactiveItemIds.has(itemId)) {
          disarm();
        }
      };
      window.addEventListener('click', handleClick, { capture: true });
      teardowns.push(() => window.removeEventListener('click', handleClick, { capture: true }));
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
      const complete = () => {
        if (completed || disarmed) return;
        completed = true;
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
        // A loop restart is reported as a seek to 0 — only user scrubbing cancels.
        if (!isLoopWrap(video.currentTime, lastTime, video.duration) || video.paused) {
          disarm();
        }
      };
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      video.addEventListener('pause', handlePause);
      video.addEventListener('seeking', handleSeeking);
      teardowns.push(() => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('seeking', handleSeeking);
      });
    };

    if (trigger.type === 'auto') {
      armClickCancellation();
      const timer = window.setTimeout(fire, trigger.delay * 1000);
      teardowns.push(() => window.clearTimeout(timer));
    } else if (triggerSectionId !== null) {
      const section = article.sections.find(s => s.id === triggerSectionId);
      const media = section?.media;
      // Section (or its video) deleted → ignore the trigger entirely.
      if (media?.type !== 'video') return;
      armClickCancellation();
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

function getItemIdFromWrapper(wrapper: Element): string | null {
  const match = (wrapper.getAttribute('class') ?? '').match(/(?:^|\s)item-wrapper-(\S+)/);
  return match ? match[1] : null;
}

function getInteractiveItemIds(article: Article): Set<string> {
  const ids = new Set<string>();
  for (const section of article.sections) {
    for (const item of section.items) {
      if (item.link !== undefined) {
        ids.add(item.id);
      }
      if (item.type === ArticleItemType.Video || item.type === ArticleItemType.VimeoEmbed || item.type === ArticleItemType.YoutubeEmbed) {
        ids.add(item.id);
      }
    }
  }
  for (const interaction of article.interactions) {
    for (const interactionTrigger of interaction.triggers) {
      if ('itemId' in interactionTrigger && interactionTrigger.type === 'click') {
        ids.add(interactionTrigger.itemId);
      }
    }
  }
  return ids;
}
