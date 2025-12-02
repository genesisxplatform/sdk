import { assign, fromPromise, setup } from 'xstate';
import { getScenesOnInit } from './utils/getScenesOnInit';
import { getAvailableTransitions } from './utils/getAvailableTransitions';
import { findRelation } from './utils/findRelation';
import type { Direction, InstantTransition, Relation, Transition, TransitionScene } from './utils/types';
import { isTransitionSuccess } from './utils/isTransitionSuccess';
import { getScenesOnFadeStart, getScenesOnSlideStart } from './utils/getScenesOnStart';
import { getScenesOnFadeProgressUpdate, getScenesOnSlideProgressUpdate } from './utils/getScenesOnProgressUpdate';
import { getScenesOnFadeEnd, getScenesOnSlideEnd } from './utils/getScenesOnEnd';
import { getScenesOnInstantTransition } from './utils/getScenesOnInstantTransition';
import { isActiveSwipeTransition } from './utils/isActiveSwipeTransition';
import { getDeltaAndProgress } from './utils/getDeltaAndProgress';

const SWIPE_SUCCESS_THRESHOLD = 130;

export const transitionMachine = 
setup({
  types: {
    input: {} as TransitionMachineInput,
    context: {} as TransitionContext,
    events: {} as TransitionEvents,
  },
  actors: {
    waitForNextFrame: fromPromise(() => {
      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    }),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBcBOBDAdrAlsnA9pgHToDG+AbmAMQDKA6gJIAKAogPosBKbLAgrwDaABgC6iUAAcCufEUkgAHogBMqgOzEAHAEZdAVm0BmPSIMBOCxoBsAGhABPRABZdx4iI2qLLi9o1jHw0RYwBfMIc0LDlCEnIqWgAVbn4AOTomJKYAeTSOFKYAcSK2blEJJBAZWIUqlQRVGwMdA10rYw19AxttbQdnRpEbYg1-awsRdWMejQMIqIxsPDjiKVQwKXRUHEwoemZ2DjokwSSKxRqVutAGm31PDSftCxnQgyCB13dHnz8AoLWUILEDRZbyEjrTbbXb7RisTgAYXSiLYABkLlUrhDFA0ZhZiKp3ETOkEXF57E5EEFdMQgi9jC5tEYmT0QWDaiQOddMLCDgiuNwckVeHQ6BwAKosAAi-CSbEx0lkPNxiA0LhcxBcIXxIn0IRsGi+CBpdNUL2abimnQs7KWnOI3IhfPhRzYaWliuqypx9UQ-i0vhCUx6TMZRqpCDcHi8PnaNIMGuadpiPOIu1gyCwyA4TrifIgRDA6cwlAIAGti3miCXM9nc-aebCELsy2R0BCKl7sXFVQhbC1VC5TCILLo+pox8bVCJtISrKELG1jCINaoU+DVrAwMhkAAbF1sJJJNGcd2e8SXH29v0IaxaYzGQ0WVSddpdXTG4mjUcuV+BDU-3mEFMAICA4EUatMCvTk+26HR2nUSZVysSlBhcQdfxnbQ-10JkiQ3B0EhwagYJVW9dBsDw9BfHwRBQiw0LUHxRjmRMbHuHoDDGGxCLTKEth2PYyN9W5XENYhdD1Npmnce5R2NYcRhQtp1Q4ywTHCSJQUbCFHV0-NhKxa8bmURBtD1OlhmMfR6OMVDjEUp9PD8VSXHU-wtMWVM9IzLNMBzKDYREm8xIQAxZ1GGxWQXVQPg46dhkJNjGKXEkZ3XbSoOIbddwPIylVgiipJaQwIsfSx7N0Wxp1fYhosNYYXgMf9tF4iIwiAA */
  id: 'transition',
  initial: 'active',
  context: ({ input }) => {
    const { scenes, startScene, relations } = input;
    const transitionScenes = getScenesOnInit(startScene, scenes);
    const availableTransitions = getAvailableTransitions(startScene, relations);
    return {
      input,
      transitionReady: availableTransitions,
      transition: null,
      scenes: transitionScenes
    };
  },
  states: {
    active: {
      on: {
        SWIPE_PREPARE: {
          target: 'preparing',
          actions: assign({
            transition: ({ event }) => {
              return {
                stage: 'preparing',
                startX: event.touchData.startX,
                startY: event.touchData.startY,
              };
            }
          })
        },
        TRANSITION_TRIGGER: {
          target: 'instant_transitioning',
          actions: assign({
            transition: ({ context, event }) => {
              const { scenes } = context;
              const { to, transition } = event;
              const activeScene = scenes[0];
              if (!activeScene) {
                throw new Error('Active scene not found');
              }
              const from = activeScene.id;
              return {
                stage: 'active',
                from,
                to,
                ...(transition === 'slide' ? { direction: event.direction } : {}),
                type: transition
              };
            },
            scenes: ({ context, event }) => {
              const { scenes } = context;
              const activeScene = scenes[0];
              if (!activeScene) {
                throw new Error('Active scene not found');
              }
              const { to, transition } = event;
              const newScenes = transition === 'slide'
                ? getScenesOnSlideStart({ from: activeScene.id, to }, { x: 0, y: 0 }, event.direction)
                : getScenesOnFadeStart({ from: activeScene.id, to }, 0);
              return newScenes;
            }
          })
        }
      },
    },
    preparing: {
      on: {
        SWIPE_START: {
          target: 'transitioning',
          actions: assign({
            transition: ({ context, event }) => {
              const { direction } = event;
              const { input, transition, scenes } = context;
              const activeScene = scenes[0];
              if (!activeScene) return null;
              const relation = findRelation(input.relations, activeScene.id, direction);
              if (!transition || !('startX' in transition) || !('startY' in transition)) return null;
              return {
                stage: 'active',
                type: relation.type,
                from: relation.from,
                to: relation.to,
                direction,
                startX: transition?.startX,
                startY: transition?.startY,
                currentX: event.touchData.x,
                currentY: event.touchData.y,
              };
            },
            scenes: ({ context, event }) => {
              const { direction } = event;
              const { input, transition, scenes } = context;
              const activeScene = scenes[0];
              if (!activeScene) return context.scenes;
              const relation = findRelation(input.relations, activeScene.id, direction);
              if (!transition || !('startX' in transition) || !('startY' in transition)) return context.scenes;
              const start = { x: transition.startX, y: transition.startY };
              const { deltaX, deltaY, progress } = getDeltaAndProgress(event.touchData, start, direction);
              const newScenes = relation.type === 'slide'
                ? getScenesOnSlideStart(relation, { x: deltaX, y: deltaY }, direction)
                : getScenesOnFadeStart(relation, progress);
              return newScenes;
            }
          })
        },
        SWIPE_CANCEL: {
          target: 'active',
          actions: assign({
            transition: null
          })
        }
      }
    },
    transitioning: {
      on: {
        SWIPE_PROGRESS_UPDATE: {
          actions: assign({
            transition: ({ context, event }) => {
              const { transition } = context;
              if (!transition || transition.stage !== 'active') return null;
              return {
                ...transition,
                stage: 'active',
                currentX: event.touchData.x,
                currentY: event.touchData.y,
              };
            },
            scenes: ({ context, event }) => {
              const { transition, scenes } = context;
              if (!isActiveSwipeTransition(transition)) return scenes;
              const start = { x: transition.startX, y: transition.startY };
              const { deltaX, deltaY, progress } = getDeltaAndProgress(event.touchData, start, transition.direction);
              const newScenes = transition.type === 'slide'
                ? getScenesOnSlideProgressUpdate(scenes, { x: deltaX, y: deltaY })
                : getScenesOnFadeProgressUpdate(scenes, transition.to, progress);
              return newScenes;
            }
          })
        },
        SWIPE_END: {
          target: 'settling',
          actions: assign({
            transition: ({ context }) => {
              const { transition } = context;
              if (!isActiveSwipeTransition(transition)) return null;
              const transitionSuccess = isTransitionSuccess(transition, SWIPE_SUCCESS_THRESHOLD);
              return {
                stage: 'settling',
                success: transitionSuccess,
                type: transition.type,
                from: transition.from,
                to: transition.to,
              };
            },
            scenes: ({ context }) => {
              const { transition, scenes } = context;
              if (!isActiveSwipeTransition(transition)) return scenes;
              const { type } = transition;
              const transitionSuccess = isTransitionSuccess(transition, SWIPE_SUCCESS_THRESHOLD);
              const newScenes = type === 'slide'
                ? getScenesOnSlideEnd(scenes, transition, transitionSuccess)
                : getScenesOnFadeEnd(scenes);
              return newScenes;
            },
          })
        }
      }
    },
    instant_transitioning: {
      invoke: {
        src: 'waitForNextFrame',
        onDone: {
          target: 'settling',
          actions: assign({
            scenes: ({ context }) => {
              const { transition, scenes } = context;
              if (!transition || transition.stage !== 'active' || !('type' in transition)) {
                return scenes;
              }
              return getScenesOnInstantTransition(scenes, transition as InstantTransition);
            },
            transition: ({ context }) => {
              const { transition } = context;
              if (!transition || transition.stage !== 'active' || !('type' in transition)) {
                return null;
              }
              return {
                stage: 'settling',
                success: true,
                type: transition.type,
                from: transition.from,
                to: transition.to,
              };
            }
          })
        }
      }
    },
    settling: {
      on: {
        SETTLE_END: {
          target: 'active',
          actions: assign({
            transition: null,
            scenes: ({ context }) => {
              const { transition, scenes } = context;
              if (!transition || transition.stage !== 'settling') return scenes;
              const activeScene = scenes.find((s) => {
                const next = transition.success ? transition.to : transition.from;
                return s.id === next;
              });
              if (!activeScene) return scenes;
              return [activeScene];
            },
            transitionReady: ({ context }) => {
              const { transition, input: { relations } } = context;
              if (!transition || transition.stage !== 'settling') return context.transitionReady;
              const next = transition.success ? transition.to : transition.from;
              const availableTransitions = getAvailableTransitions(next, relations);
              return availableTransitions;
            }
          })
        }
      }
    }
  },
});

export type TransitionContext = {
  transitionReady: {
    [key in Direction]: boolean;
  };
  transition: Transition | null;
  scenes: TransitionScene[];
  input: TransitionMachineInput;
};

export type TransitionEvents =
  | { type: 'SWIPE_PREPARE'; touchData: { startX: number; startY: number; }; }
  | { type: 'TRANSITION_TRIGGER'; transition: 'slide'; to: string; direction: Direction; }
  | { type: 'TRANSITION_TRIGGER'; transition: 'fade'; to: string; }
  | { type: 'SWIPE_START'; direction: Direction; touchData: { x: number; y: number; }; }
  | { type: 'SWIPE_CANCEL'; }
  | { type: 'SWIPE_END'; }
  | { type: 'SETTLE_END'; }
  | { type: 'SWIPE_PROGRESS_UPDATE'; touchData: { x: number; y: number; }; };

export type TransitionTypeStates = 
  | { value: 'active'; context: TransitionContext; }
  | { value: 'preparing'; context: TransitionContext; }
  | { value: 'transitioning'; context: TransitionContext; }
  | { value: 'instant_transitioning'; context: TransitionContext; }
  | { value: 'settling'; context: TransitionContext; };

export type TransitionMachineInput = {
  startScene: string;
  scenes: Scene[];
  relations: Relation[];
};

type Scene = {
  id: string;
};
