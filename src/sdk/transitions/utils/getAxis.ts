import type { Direction } from './types';

export function getAxis(direction: Direction) {
  return direction === 'east' || direction === 'west' ? 'horizontal' : 'vertical';
}
