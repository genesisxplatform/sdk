import { getAxis } from './getAxis';
import type { Direction } from './types';

export function getDeltaAndProgress(
  current: Delta,
  start: Delta,
  direction: Direction,
  window: Window
) {
  const axis = getAxis(direction);
  const deltaX = axis === 'horizontal' ? current.x - start.x : 0;
  const deltaY = axis === 'vertical' ? current.y - start.y : 0;
  const progress = axis === 'horizontal'
    ? Math.abs(deltaX) / window.innerWidth
    : Math.abs(deltaY) / window.innerHeight;
  return { deltaX, deltaY, progress };
}

type Delta = {
  x: number;
  y: number;
};
