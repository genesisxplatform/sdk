import { ComponentType, useEffect, useReducer } from 'react';
import {
  getComponentElement,
  hasComponentElement,
  hasComponentElementFailed,
  loadComponentElement
} from '@gxpl/components/elements';
import { useCntrlContext } from '../provider/useCntrlContext';

type ComponentElement = {
  Element: ComponentType<any> | undefined;
  isPending: boolean;
  isFailed: boolean;
};

export const pendingElementProps = {
  dangerouslySetInnerHTML: { __html: '' },
  suppressHydrationWarning: true
};

export function useComponentElement(componentId: string): ComponentElement {
  const sdk = useCntrlContext();
  const [, refresh] = useReducer((count: number) => count + 1, 0);
  const Element = sdk.getComponent(componentId)?.element ?? getComponentElement(componentId);
  const isLoading = !Element && hasComponentElement(componentId);
  const isFailed = isLoading && hasComponentElementFailed(componentId);
  const isPending = isLoading && !isFailed;
  if (isPending) {
    loadComponentElement(componentId).catch(() => undefined);
  }

  useEffect(() => {
    if (!isLoading) return;
    let cancelled = false;
    loadComponentElement(componentId)
      .catch((error) => {
        console.error(`Failed to load component "${componentId}":`, error);
      })
      .then(() => {
        if (!cancelled) refresh();
      });
    return () => {
      cancelled = true;
    };
  }, [componentId, isLoading]);

  return { Element, isPending, isFailed };
}
