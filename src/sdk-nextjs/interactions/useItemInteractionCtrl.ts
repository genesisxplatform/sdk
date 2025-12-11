import { useMemo, useState } from 'react';
import { ItemInteractionController } from './ItemInteractionCtrl';
import { ItemInteractionCtrl } from './types';
import { useInteractionsRegistry } from '../provider/InteractionsContext';
import { useFixedLayerTransitionsRegistry } from '../fixedLayers/FixedLayerTransitionsProvider';

export function useItemInteractionCtrl(itemId: string, isInFixedLayer: boolean = false): ItemInteractionCtrl | undefined {
  const [_, triggerRender] = useState(0);
  const interactionsRegistry = useInteractionsRegistry();
  const fixedLayerTransitionsRegistry = useFixedLayerTransitionsRegistry();
  const registry = isInFixedLayer ? fixedLayerTransitionsRegistry : interactionsRegistry;
  const ctrl = useMemo(() => {
    if (!registry) return;
    return new ItemInteractionController(
      itemId,
      registry,
      () => triggerRender(prev => prev + 1)
    );
  }, [itemId, registry]);
  return ctrl;
}
