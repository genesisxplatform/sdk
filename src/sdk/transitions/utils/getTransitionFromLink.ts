import { ClickLink } from '../../types/article/Item';
import { Relation } from './types';

export function getTransitionFromLink(link: ClickLink) {
  if (link.animation === 'fade') {
    return {
      transition: link.animation,
      to: link.value,
      duration: link.duration
    };
  }
  if (link.animation === 'reveal') {
    return {
      transition: link.animation,
      to: link.value,
      offset: link.offset,
      mode: link.mode,
      direction: link.direction,
      duration: link.duration
    };
  }
  if (link.animation === 'slide') {
    return {
      transition: link.animation,
      to: link.value,
      direction: link.direction,
      duration: link.duration
    };
  }

  throw new Error(`Unknown transition type`);
}