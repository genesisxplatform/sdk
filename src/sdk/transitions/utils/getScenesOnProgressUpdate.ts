import { normalizeOpacity } from './normalizeOpacity';
import type { TransitionScene } from './types';

export function getScenesOnSlideProgressUpdate(scenes: TransitionScene[], delta: Delta) {
  return scenes.map((scene) => ({
    ...scene,
    styles: {
      ...scene.styles,
      x: scene.styles.startX + delta.x,
      y: scene.styles.startY + delta.y
    }
  }));
}

export function getScenesOnFadeProgressUpdate(scenes: TransitionScene[], to: string, progress: number) {
  return scenes.map((scene) => {
    const isNextScene = scene.id === to;
    const value = isNextScene ? progress : 1;
    return {
      ...scene,
      styles: {
        ...scene.styles,
        opacity: normalizeOpacity(value)
      }
    };
  });
}

type Delta = {
  x: number;
  y: number;
};
