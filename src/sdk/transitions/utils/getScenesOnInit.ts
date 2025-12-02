import type { TransitionScene } from './types';

export function getScenesOnInit(startScene: string, scenes: Scene[]): TransitionScene[] {
  const initialScene = scenes.find((scene) => scene.id === startScene);
  if (!initialScene) {
    throw new Error(`Initial scene not found: ${startScene}`);
  }
  const transitionScene = {
    id: initialScene.id,
    styles: {
      startX: 0,
      startY: 0,
      x: 0,
      y: 0,
      opacity: 1
    }
  };
  return [transitionScene];
}

type Scene = {
  id: string;
};
