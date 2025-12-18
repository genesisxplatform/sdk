import { CSSProperties, FC, PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import { useLayoutDeviation } from '../common/useLayoutDeviation';
import { TransitionMachineContext } from '../provider/TransitionMachineContext';
import { Direction } from '../../sdk/transitions/utils/types';

interface Props {
  id: string;
  elRef: React.RefObject<HTMLDivElement>;
  styles: {
    x: number;
    y: number;
    opacity: number;
    startX: number;
    startY: number;
  } | undefined;
}

export const Scene: FC<PropsWithChildren<Props>> = ({ children, id, styles: sceneStyles, elRef }) => {
  const { layoutDeviation } = useLayoutDeviation();
  const layoutDeviationStyle = { '--layout-deviation': layoutDeviation } as CSSProperties;
  const actorRef = TransitionMachineContext.useActorRef();
  const { isControlledTransitioning, isSettling, isInstantTransitioning } = TransitionMachineContext.useSelector((state) => ({
   isControlledTransitioning: state.matches('transitioning'),
   isSettling: state.matches('settling'),
   isInstantTransitioning: state.matches('instant_transitioning')
  }));
  const type = TransitionMachineContext.useSelector((state) => {
    const { transition } = state.context;
    if (!transition || !('type' in transition)) return undefined;
    return transition.type;
  });
  const isTransitioningRef = useRef(false);
  const isTransitioning = isControlledTransitioning || isInstantTransitioning;

  const handleTouchStart = useCallback((e: TouchEvent) => {
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
  }, [actorRef]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const { context } = actorRef.getSnapshot();
    const { transition, transitionReady } = context;
    const el = elRef.current;
    if (!el || !transition || !('startX' in transition) || !('startY' in transition)) return;
    const deltaX = touch.clientX - transition.startX;
    const deltaY = touch.clientY - transition.startY;
    const direction = getDirectionFromDelta(deltaX, deltaY);
    const isTransitionAllowed = canTransition(direction, el);
    if ((!transitionReady[direction] && transition.stage === 'preparing') || !isTransitionAllowed) {
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
  }, [actorRef]);

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
      const { context } = actorRef.getSnapshot();
      const { transition } = context;
      if (!transition || transition.stage !== 'settling') {
        throw new Error('Transition not found');
      }
      const { type } = transition;
      const propType = type === 'slide' ? 'transform' : 'opacity';
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
    const { to, direction } = transition;
    if (direction === 'north' && to === id) {
      scene.scrollTo({ top: scene.scrollHeight });
    }
  }, [isTransitioning, actorRef, id]);

  const isFixed = isControlledTransitioning || isSettling || isInstantTransitioning;
  const transitionStyle = type === 'slide' ? 'transform' : 'opacity';

  return (
    <>
      <div
        ref={elRef}
        className="article-wrapper"
        style={{
          ...layoutDeviationStyle,
          width: '100vw',
          height: '100%',
          zIndex: 1,
          position: isFixed ? 'fixed' : 'absolute',
          transform: sceneStyles && (sceneStyles.x !== 0 || sceneStyles.y !== 0) ? `translate(${sceneStyles.x}px, ${sceneStyles.y}px)` : 'none',
          transition: isSettling || isInstantTransitioning ? `${transitionStyle} 0.25s ease-out` : 'none',
          overflowY: isFixed ? 'hidden' : 'scroll',
          overflowX: 'clip',
          opacity: sceneStyles?.opacity ?? 1,
          'WebkitOverflowScrolling': 'touch' // prevent glitch on Safari (fast scroll to top/bottom sides)
        }}
      >
        {children}
      </div>
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
  switch (direction) {
    case 'north':
      return el.scrollTop === 0;
    case 'south': {
      const isAllowed = el.scrollTop + el.clientHeight + 1 >= el.scrollHeight;
      return isAllowed;
    }
    case 'west':
      return el.scrollLeft === 0;
    case 'east':
      return el.scrollLeft + el.clientWidth === window.innerWidth;
  }
}
