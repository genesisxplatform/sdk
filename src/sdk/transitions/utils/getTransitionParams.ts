import { Relation } from './types';

export function getTransitionParamsFromRelation(
  relation: Relation
  ) {
  if (relation.type === 'slide') {
    return {
      type: relation.type,
      from: relation.from,
      to: relation.to,
    };
  }
  if (relation.type === 'reveal') {
    return {
      offset: relation.offset,
      mode: relation.mode,
      type: relation.type,
      from: relation.from,
      to: relation.to,
    };
  }
  if (relation.type === 'fade') {
    return {
      type: relation.type,
      from: relation.from,
      to: relation.to,
    };
  }
  throw new Error(`Unknown transition type`);
}
