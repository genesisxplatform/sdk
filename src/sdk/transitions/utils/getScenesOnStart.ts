import { getAxis } from './getAxis';
import { normalizeOpacity } from './normalizeOpacity';
import type { Direction, TransitionScene } from './types';

export function getScenesOnFadeStart({ from, to }: FromTo, progress: number) {
  const common = {
    startX: 0,
    startY: 0,
    x: 0,
    y: 0
  };
  const sceneFrom = {
    id: from,
    styles: {
      ...common,
      opacity: 1,
    }
  };
  const sceneTo = {
    id: to,
    styles: {
      ...common,
      opacity: normalizeOpacity(progress),
    }
  };
  return [sceneFrom, sceneTo];
}

export function getScenesOnSlideStart(
  { from, to }: FromTo,
  delta: Delta,
  direction: Direction,
  window: Window
): TransitionScene[] {
  const common = {
    opacity: 1,
  };
  const sceneFrom = {
    id: from,
    styles: {
      ...common,
      startX: 0,
      startY: 0,
      x: delta.x,
      y: delta.y
    }
  };
  const startX = getNextSceneSlideStartX(direction, window);
  const startY = getNextSceneSlideStartY(direction, window);
  const sceneTo = {
    id: to,
    styles: {
      ...common,
      startX,
      startY,
      x: startX + delta.x,
      y: startY + delta.y,
    }
  };
  return [sceneFrom, sceneTo];
}


function getNextSceneSlideStartX(direction: Direction, window: Window) {
  const axis = getAxis(direction);
  if (axis !== 'horizontal') return 0;
  return direction === 'east' ? window.innerWidth : -window.innerWidth;
}

function getNextSceneSlideStartY(direction: Direction, window: Window) {
  const axis = getAxis(direction);
  if (axis !== 'vertical') return 0;
  return direction === 'north' ? -window.innerHeight : window.innerHeight;
}

type Delta = {
  x: number;
  y: number;
};

type FromTo = {
  from: string;
  to: string;
};
