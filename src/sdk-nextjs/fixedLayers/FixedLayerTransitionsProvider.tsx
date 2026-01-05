import { FC, useMemo, PropsWithChildren, useContext, useEffect, createContext } from 'react';
import { TFixedLayer } from '../../sdk/types/project/FixedLayer';
import { ArticleRectContext } from '../provider/ArticleRectContext';
import { TransitionMachineContext } from '../provider/TransitionMachineContext';
import { FixedLayerTransitionsRegistry } from './FixedLayerTransitionsRegistry';

export const FixedLayerTransitionsContext = createContext<FixedLayerTransitionsRegistry | undefined>(undefined);

interface Props {
  fixedLayer: TFixedLayer;
}

export const FixedLayerTransitionsProvider: FC<PropsWithChildren<Props>> = ({ fixedLayer, children }) => {
  const actorRef = TransitionMachineContext.useActorRef();
  const { isSettling, isTransitioning, startScene } = TransitionMachineContext.useSelector((state) => ({
    startScene: state.context.input.startScene,
    isSettling: state.matches('settling'),
    isTransitioning: state.matches('transitioning') || state.matches('instant_transitioning'),
   }));
  const transitionsRegistry = useMemo(() => new FixedLayerTransitionsRegistry(fixedLayer, startScene), [fixedLayer, startScene]);

  useEffect(() => {
    if (isSettling && actorRef) {
      const { context } = actorRef.getSnapshot();
      const { transition } = context;
      if (!transition || transition.stage !== 'settling' || transition.success) return;
      transitionsRegistry.notifyOnActiveSceneChange(transition.from);
    }
  }, [isSettling, actorRef, transitionsRegistry]);

  useEffect(() => {
    if (isTransitioning && actorRef) {
      const { context } = actorRef.getSnapshot();
      const { transition } = context;
      if (!transition || transition.stage !== 'active') return;
      transitionsRegistry.notifyOnActiveSceneChange(transition.to);
    }
  }, [isTransitioning, actorRef, transitionsRegistry]);

  return (
    <FixedLayerTransitionsContext.Provider value={transitionsRegistry}>
      {children}
    </FixedLayerTransitionsContext.Provider>
  );
};

export function useFixedLayerTransitionsRegistry(): FixedLayerTransitionsRegistry | undefined {
  const registry = useContext(FixedLayerTransitionsContext);
  return registry;
}
