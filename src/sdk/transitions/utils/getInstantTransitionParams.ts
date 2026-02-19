import { Direction } from './types';

type Event = { transition: 'slide'; to: string; direction: Direction; duration: number; }
| { transition: 'reveal'; to: string; direction: Direction; duration: number; offset: number; mode: 'normal' | 'reverse'; }
| { transition: 'fade'; to: string; duration: number; }

type Transition = 'slide' | 'reveal' | 'fade';

function isTransitionEvent<T extends Transition>(event: Event, transition: T): event is Extract<Event, { transition: T}> {
  return event.transition === transition;
}

export function getInstantTransitionParams(
  transition: Transition,
  event: Event
  ) {
  if (transition === 'slide' && isTransitionEvent(event, transition)) {
    return {
      direction: event.direction ?? 'north',
      type: transition
    };
  }
  if (transition === 'reveal' && isTransitionEvent(event, transition)) {
    return {
      offset: event.offset,
      mode: event.mode,
      direction: event.direction,
      type: transition
    };
  }
  if (transition === 'fade' && isTransitionEvent(event, transition)) {
    return {
      type: transition
    };
  }
  throw new Error(`Unknown transition type`);
}
