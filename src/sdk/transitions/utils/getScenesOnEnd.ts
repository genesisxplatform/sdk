import type { ActiveTransition, TransitionScene } from './types';

export function getScenesOnSlideEnd(
  scenes: TransitionScene[],
  transition: ActiveTransition,
  success: boolean
) {
  const { from, to, direction } = transition;
  return scenes.map((s) => {
    const isNextActiveScene = success ? s.id === to : s.id === from;
    let prevElX = 0;
    if (direction === 'east') {
      prevElX = success ? -window.innerWidth : window.innerWidth;
    } else if (direction === 'west') {
      prevElX = success ? window.innerWidth : -window.innerWidth;
    }
    let prevElY = 0;
    if (direction === 'north') {
      prevElY = success ? window.innerHeight : -window.innerHeight;
    } else if (direction === 'south') {
      prevElY = success ? -window.innerHeight : window.innerHeight;
    }
    return {
      ...s,
      styles: {
        ...s.styles,
        x: isNextActiveScene ? 0 : prevElX!,
        y: isNextActiveScene ? 0 : prevElY!
      }
    };
  });
}

export function getScenesOnRevealEnd(
  scenes: TransitionScene[],
  transition: ActiveTransition,
  success: boolean,
  offset: number,
  mode: 'normal' | 'reverse'
) {
  const { from, to, direction } = transition;
  return scenes.map((s) => {
    const isNextActiveScene = success ? s.id === to : s.id === from;
    let prevElX = 0;
    if (direction === 'east') {
      prevElX = success ? -window.innerWidth * (mode === 'normal' ? 1 : offset) : window.innerWidth * (mode === 'normal' ? offset : 1);
    } else if (direction === 'west') {
      prevElX = success ? window.innerWidth * (mode === 'normal' ? 1 : offset) : -window.innerWidth * (mode === 'normal' ? offset : 1);
    }
    let prevElY = 0;
    if (direction === 'north') {
      prevElY = success ? window.innerHeight * (mode === 'normal' ? 1 : offset) : -window.innerHeight * (mode === 'normal' ? offset : 1);
    } else if (direction === 'south') {
      prevElY = success ? -window.innerHeight * (mode === 'normal' ? 1 : offset) : window.innerHeight * (mode === 'normal' ? offset : 1);
    }
    const zIndex = mode === 'reverse' ? (isNextActiveScene ? 1 : 0) : (isNextActiveScene ? 0 : 1);
    return {
      ...s,
      styles: {
        ...s.styles,
        zIndex,
        x: isNextActiveScene ? 0 : prevElX!,
        y: isNextActiveScene ? 0 : prevElY!
      }
    };
  });
}

export function getScenesOnFadeEnd(scenes: TransitionScene[]) {
  return scenes.map((s) => {
    return {
      ...s,
      styles: {
        ...s.styles,
        opacity: 1
      }
    };
  });
}
