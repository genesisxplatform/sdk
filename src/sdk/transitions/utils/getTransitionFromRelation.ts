import { Relation } from './types';

export function getTransitionFromRelation(transition: Relation) {
  if (transition.type === 'fade') {
    return {
      transition: transition.type,
      to: transition.to
    };
  }
  if (transition.type === 'reveal') {
    return {
      transition: transition.type,
      to: transition.to,
      offset: transition.offset,
      mode: transition.mode
    };
  }
  if (transition.type === 'slide') {
    return {
      transition: transition.type,
      to: transition.to,
    };
  }

  throw new Error(`Unknown transition type`);
}