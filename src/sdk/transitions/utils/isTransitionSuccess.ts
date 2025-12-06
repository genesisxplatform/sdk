import { getAxis } from './getAxis';
import { isOverThreshold } from './isOverThreshold';
import type { ActiveTransition } from './types';

export function isTransitionSuccess(transition: ActiveTransition, threshold: number) {
  const { currentX, startX, currentY, startY, direction } = transition;
  const deltaX = currentX - startX;
  const deltaY = currentY - startY;
  const axis = getAxis(direction);
  const transitionSuccess = axis === 'horizontal'
    ? isOverThreshold(deltaX, threshold)
    : isOverThreshold(deltaY, threshold);
  return transitionSuccess;
}
