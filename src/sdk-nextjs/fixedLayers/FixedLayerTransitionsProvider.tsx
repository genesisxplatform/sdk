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
  
  const { isSettling, isActive, startScene } = TransitionMachineContext.useSelector((state) => ({
    startScene: state.context.input.startScene,
    isSettling: state.matches('settling'),
    isActive: state.matches('active'),
   }));
  const transitionsRegistry = useMemo(() => new FixedLayerTransitionsRegistry(fixedLayer, startScene), [fixedLayer, startScene]);

   useEffect(() => {
    if (isSettling && actorRef) {
      const { context } = actorRef.getSnapshot();
      const { transition } = context;
      if (!transition || transition.stage !== 'settling') return;
      transitionsRegistry.notifyPrepareTransition(transition.to);
    }
   }, [isSettling, actorRef, transitionsRegistry]);
   useEffect(() => {
    if (isActive && actorRef) {
      const { context } = actorRef.getSnapshot();
      const { scenes } = context;
      const [activeScene] = scenes;
      transitionsRegistry.notifyOnActiveSceneChange(activeScene.id);
    }
   }, [isActive, actorRef, transitionsRegistry]);
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
