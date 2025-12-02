import { createActorContext } from '@xstate/react';
import { transitionMachine } from '../../sdk/transitions/transitionMachine';

export const TransitionMachineContext = createActorContext(transitionMachine);
