import type { ActiveTransition, Transition } from './types';

export function isActiveSwipeTransition(transition: Transition | null): transition is ActiveTransition {
  return transition !== null
    && transition.stage === 'active'
   && 'startX' in transition
   && 'startY' in transition
   && 'currentX' in transition
   && 'currentY' in transition
   && 'direction' in transition;
}
