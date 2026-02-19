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
      prevElX = success ? -window.innerWidth : window.innerWidth * offset;
    } else if (direction === 'west') {
      prevElX = success ? window.innerWidth : -window.innerWidth * offset;
    }
    let prevElY = 0;
    if (direction === 'north') {
      prevElY = success ? window.innerHeight : -window.innerHeight * offset;
    } else if (direction === 'south') {
      prevElY = success ? -window.innerHeight : window.innerHeight * offset;
    }
    return {
      ...s,
      styles: {
        ...s.styles,
        zIndex: isNextActiveScene ? 1 : 2,
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
