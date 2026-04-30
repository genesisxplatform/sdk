import { Direction } from './types';

type Event = { transition: 'slide'; to: string; direction: Direction; duration: number; sceneSectionId?: string; }
| { transition: 'reveal'; to: string; direction: Direction; duration: number; offset: number; mode: 'normal' | 'reverse'; sceneSectionId?: string; }
| { transition: 'fade'; to: string; duration: number; sceneSectionId?: string; }

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
      type: transition,
    };
  }
  if (transition === 'reveal' && isTransitionEvent(event, transition)) {
    return {
      offset: event.offset,
      mode: event.mode,
      direction: event.direction,
      type: transition,
      ...(event.sceneSectionId ? { sceneSectionId: event.sceneSectionId } : {}),
    };
  }
  if (transition === 'fade' && isTransitionEvent(event, transition)) {
    return {
      type: transition,
      ...(event.sceneSectionId ? { sceneSectionId: event.sceneSectionId } : {}),
    };
  }
  throw new Error(`Unknown transition type`);
}
