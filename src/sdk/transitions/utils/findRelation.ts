import type { Direction, Relation } from './types';

export function findRelation(relations: Relation[], from: string, direction: Direction): Relation {
  const relation = relations.find((r) => r.from === from && r.direction === direction);
  if (!relation) {
    throw new Error(`Relation not found for direction: "${direction}".`);
  }
  return relation;
}
