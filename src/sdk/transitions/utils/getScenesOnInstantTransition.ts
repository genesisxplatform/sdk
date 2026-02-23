import type { Direction, InstantTransition, TransitionScene } from './types';

export function getScenesOnInstantTransition(
  scenes: TransitionScene[],
  transition: InstantTransition,
  window: Window
): TransitionScene[] {
  const { type, to } = transition;
  if (type === 'slide' && transition.direction) {
    return getScenesOnInstantSlideTransition(scenes, to, transition.direction, window);
  } else if (type === 'reveal' && transition.direction) {
    return getScenesOnInstantRevealTransition(scenes, to, transition.direction, transition.offset, transition.mode, window);
  } else if (type === 'fade') {
    return getScenesOnInstantFadeTransition(scenes);
  }
  
  return scenes;
}

function getScenesOnInstantRevealTransition(
  scenes: TransitionScene[],
  to: string,
  direction: Direction,
  offset: number,
  mode: 'normal' | 'reverse',
  window: Window
): TransitionScene[] {
  let fromFinalX = 0;
  let fromFinalY = 0;
  
  if (direction === 'east') {
    fromFinalX = -window.innerWidth * (mode === 'normal' ? 1 : offset);
  } else if (direction === 'west') {
    fromFinalX = window.innerWidth * (mode === 'normal' ? 1 : offset);
  } else if (direction === 'north') {
    fromFinalY = window.innerHeight * (mode === 'normal' ? 1 : offset);
  } else if (direction === 'south') {
    fromFinalY = -window.innerHeight * (mode === 'normal' ? 1 : offset);
  }
  
  return scenes.map((scene) => {
    const isToScene = scene.id === to;
    return {
      ...scene,
      styles: {
        ...scene.styles,
        x: isToScene ? 0 : fromFinalX,
        y: isToScene ? 0 : fromFinalY,
      }
    };
  });
}

function getScenesOnInstantSlideTransition(
  scenes: TransitionScene[],
  to: string,
  direction: Direction,
  window: Window
): TransitionScene[] {
  let fromFinalX = 0;
  let fromFinalY = 0;
  
  if (direction === 'east') {
    fromFinalX = -window.innerWidth;
  } else if (direction === 'west') {
    fromFinalX = window.innerWidth;
  } else if (direction === 'north') {
    fromFinalY = window.innerHeight;
  } else if (direction === 'south') {
    fromFinalY = -window.innerHeight;
  }
  
  return scenes.map((scene) => {
    const isToScene = scene.id === to;
    return {
      ...scene,
      styles: {
        ...scene.styles,
        x: isToScene ? 0 : fromFinalX,
        y: isToScene ? 0 : fromFinalY,
      }
    };
  });
}

function getScenesOnInstantFadeTransition(scenes: TransitionScene[]): TransitionScene[] {
  return scenes.map((scene) => {
    return {
      ...scene,
      styles: {
        ...scene.styles,
        opacity: 1,
      }
    };
  });
}
