import { CSSProperties, FC, PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import { useLayoutDeviation } from '../common/useLayoutDeviation';
import { TransitionMachineContext } from '../provider/TransitionMachineContext';
import { Direction } from '../../sdk/transitions/utils/types';
import { useInteractionsRegistry } from '../provider/InteractionsContext';
import { useComponentPortalContent } from '../common/useComponentPortalContent';

interface Props {
  id: string;
  elRef: React.RefObject<HTMLDivElement>;
  styles: {
    x: number;
    y: number;
    opacity: number;
    zIndex?: number;
    startX: number;
    startY: number;
  } | undefined;
}

export const Scene: FC<PropsWithChildren<Props>> = ({ children, id, styles: sceneStyles, elRef }) => {
  const { layoutDeviation } = useLayoutDeviation();
  const interactionsRegistry = useInteractionsRegistry();
  const portalRef = useRef<HTMLDivElement>(null);
  const hasPortalContent = useComponentPortalContent(portalRef);
  const layoutDeviationStyle = { '--layout-deviation': layoutDeviation } as CSSProperties;
  const actorRef = TransitionMachineContext.useActorRef();
  const { isControlledTransitioning, isSettling, isInstantTransitioning } = TransitionMachineContext.useSelector((state) => {
    return {
      isControlledTransitioning: state.matches('transitioning'),
      isSettling: state.matches('settling'),
      isInstantTransitioning: state.matches('instant_transitioning')
     }
  });
  const type = TransitionMachineContext.useSelector((state) => {
    const { transition } = state.context;
    if (!transition || !('type' in transition)) return undefined;
    return transition.type;
  });

  const duration = TransitionMachineContext.useSelector((state) => {
    const { transition } = state.context;
    if (!transition || !('duration' in transition)) return undefined;
    return transition.duration;
  });

  const isTransitioningRef = useRef(false);
  const isTransitioning = isControlledTransitioning || isInstantTransitioning;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (hasPortalContent) return;
    const { context } = actorRef.getSnapshot();
    const { transitionReady } = context;

    if (isTransitionDisabled(transitionReady)) return;
    const touch = e.touches[0];
    actorRef.send({
      type: 'SWIPE_PREPARE',
      touchData: {
        startX: touch.clientX,
        startY: touch.clientY,
      }
    });
  }, [actorRef, hasPortalContent]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (hasPortalContent) return;
    const touch = e.touches[0];
    const { context } = actorRef.getSnapshot();
    const { transition, transitionReady } = context;
    const el = elRef.current;
    if (!el || !transition || !('startX' in transition) || !('startY' in transition)) return;
    const deltaX = touch.clientX - transition.startX;
    const deltaY = touch.clientY - transition.startY;
    const direction = getDirectionFromDelta(deltaX, deltaY);
    // Scroll boundaries only gate the *start* of a swipe. Once the transition is active the scene
    // carries a transform, which makes it the containing block of its `position: fixed` descendants:
    // they join its scrollable overflow and inflate `scrollHeight`, so re-measuring here would
    // cancel the gesture mid-swipe. The scene is `overflow: hidden` while transitioning anyway, and
    // the direction is already locked in by the machine.
    if (transition.stage === 'preparing' && (!transitionReady[direction] || !canTransition(direction, el))) {
      actorRef.send({ type: 'SWIPE_CANCEL' });
      return;
    }
    if (transition.stage === 'preparing') {
      actorRef.send({
        type: 'SWIPE_START',
        direction,
        touchData: {
          x: touch.clientX,
          y: touch.clientY,
        }
      });
    } else if (transition.stage === 'active') {
      actorRef.send({
        type: 'SWIPE_PROGRESS_UPDATE',
        touchData: {
          x: touch.clientX,
          y: touch.clientY,
        }
      });
    }
  }, [actorRef, hasPortalContent]);

  const handleTouchEnd = useCallback(() => {
    const { context } = actorRef.getSnapshot();
    const { transition } = context;
    if (!transition || transition.stage !== 'active') {
      actorRef.send({ type: 'SWIPE_CANCEL' });
      return;
    }
    actorRef.send({
      type: 'SWIPE_END',
    });
  }, [actorRef]);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: true });
    el.addEventListener('touchend', handleTouchEnd);
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    const el = elRef.current;
    if (!isSettling || !el) return;
    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== el) return;
      const { context } = actorRef.getSnapshot();
      const { transition } = context;
      if (!transition || transition.stage !== 'settling') {
        throw new Error('Transition not found');
      }
      const { type } = transition;
      const propType = type === 'slide' || type === 'reveal' ? 'transform' : 'opacity';
      if (e.propertyName !== propType) return;
      actorRef.send({
        type: 'SETTLE_END',
      });
    };
    el.addEventListener('transitionend', handleTransitionEnd);
    return () => {
      el.removeEventListener('transitionend', handleTransitionEnd);
    };
  }, [actorRef, isSettling]);

  useEffect(() => {
    const scene = elRef.current;
    if (!isTransitioning || isTransitioningRef.current || !scene) return;
    isTransitioningRef.current = true;
    const { context } = actorRef.getSnapshot();
    const { transition } = context;
    if (!transition || transition.stage !== 'active') return;
    const { to, type } = transition;
    if (type !== 'fade' && transition.direction === 'north' && to === id && !transition.sceneSectionId) {
      scene.scrollTo({ top: scene.scrollHeight });
    }
    if (transition.sceneSectionId && to === id) {
      const sectionId = transition.sceneSectionId;
      const performScroll = () => {
        const section = scene.querySelector<HTMLElement>(`#${sectionId}`);
        if (!section) return;
        const sectionRect = section.getBoundingClientRect();
        const sceneRect = scene.getBoundingClientRect();
        const top = sectionRect.top - sceneRect.top + scene.scrollTop;
        scene.scrollTo({ top });
      };
      requestAnimationFrame(() => requestAnimationFrame(performScroll));
    }
  }, [isTransitioning, actorRef, id]);

  useEffect(() => {
    if (!interactionsRegistry || !actorRef) return;
    const { context } = actorRef.getSnapshot();
    const { transition } = context;
    if (!transition || transition.stage !== 'active') return;
    const { from, to } = transition;
    if (from === id) {
      interactionsRegistry.notifySceneOutTransition();
    }
    if (to === id) {
      setTimeout(() => {
        interactionsRegistry.notifySceneInTransition();
      }, 0);
    }
  }, [interactionsRegistry, id, isTransitioning, actorRef]);

  useEffect(() => {
    if (isSettling && actorRef && interactionsRegistry) {
      const { context } = actorRef.getSnapshot();
      const { transition } = context;
      if (!transition || transition.stage !== 'settling' || transition.success) return;
      interactionsRegistry.notifySceneOutTransitionCancel();
    }
  }, [isSettling, actorRef, interactionsRegistry]);

  const isFixed = isControlledTransitioning || isSettling || isInstantTransitioning;
  const transitionStyle = type === 'slide' || type === 'reveal' ? 'transform' : 'opacity';
  return (
    <>
      <div
        ref={elRef}
        className="article-wrapper"
        style={{
          ...layoutDeviationStyle,
          width: '100vw',
          height: '100%',
          zIndex: sceneStyles?.zIndex ?? 1,
          position: isFixed ? 'fixed' : 'absolute',
          transform: sceneStyles && (sceneStyles.x !== 0 || sceneStyles.y !== 0) ? `translate(${sceneStyles.x}px, ${sceneStyles.y}px)` : 'none',
          transition: isSettling || isInstantTransitioning ? `${transitionStyle} ${duration ?? 250}ms ease-out` : 'none',
          overflowY: isFixed || hasPortalContent ? 'hidden' : 'scroll',
          overflowX: 'clip',
          opacity: sceneStyles?.opacity ?? 1,
          'WebkitOverflowScrolling': 'touch' // prevent glitch on Safari (fast scroll to top/bottom sides)
        }}
      >
        {children}
      </div>
      <div id="component-portal" ref={portalRef} />
    </>
  );
};

function isTransitionDisabled(transitionReady: { north: boolean; east: boolean; south: boolean; west: boolean; }) {
  return !transitionReady.north && !transitionReady.east && !transitionReady.south && !transitionReady.west;
}

function getDirectionFromDelta(deltaX: number, deltaY: number): Direction {
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX > 0 ? 'west' : 'east';
  }
  return deltaY > 0 ? 'north' : 'south';
}

function canTransition(direction: Direction, el: HTMLElement) {
  const boundary = el.getBoundingClientRect();
  switch (direction) {
    case 'north':
      return el.scrollTop <= 0;
    case 'south':
      // `clientHeight` rather than the bounding rect: it shares the coordinate space of
      // `scrollTop`/`scrollHeight`, so a scaled ancestor cannot skew the comparison.
      return el.scrollTop + el.clientHeight + 1 >= el.scrollHeight;
    case 'west':
      return el.scrollLeft === 0;
    case 'east':
      return Math.abs(el.scrollLeft + boundary.width - window.innerWidth) < 1;
  }
}
