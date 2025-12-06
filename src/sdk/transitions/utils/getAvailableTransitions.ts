import type { Relation } from './types';

export function getAvailableTransitions(scene: string, relations: Relation[]) {
  const availableTransitions = {
    north: relations.some((r) => r.from === scene && r.direction === 'north'),
    east: relations.some((r) => r.from === scene && r.direction === 'east'),
    south: relations.some((r) => r.from === scene && r.direction === 'south'),
    west: relations.some((r) => r.from === scene && r.direction === 'west')
  };
  return availableTransitions;
}
