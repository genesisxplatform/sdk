import { CSSProperties, FC, PropsWithChildren } from 'react';
import { useLayoutDeviation } from '../../common/useLayoutDeviation';
import { TransitionMachineContext } from '../../provider/TransitionMachineContext';

interface Props {
  styles: {
    x: number;
    y: number;
    opacity: number;
    startX: number;
    startY: number;
  } | undefined;
}

export const FixedSectionLayersWrapper: FC<PropsWithChildren<Props>> = ({ styles, children }) => {
  const { layoutDeviation } = useLayoutDeviation();
  const layoutDeviationStyle = { '--layout-deviation': layoutDeviation } as CSSProperties;
  const { isSettling, isInstantTransitioning } = TransitionMachineContext.useSelector((state) => ({
    isSettling: state.matches('settling'),
    isInstantTransitioning: state.matches('instant_transitioning'),
  }));
  const type = TransitionMachineContext.useSelector((state) => {
    const { transition } = state.context;
    if (!transition || !('type' in transition)) return undefined;
    return transition.type;
  });
  const transitionStyle = type === 'slide' ? 'transform' : 'opacity';
  const inlineStyles: CSSProperties = {
    ...layoutDeviationStyle,
    position: 'fixed',
    width: '100vw',
    height: '100%',
    transform: `translate(${styles?.x}px, ${styles?.y}px)`,
    transition: isSettling || isInstantTransitioning ? `${transitionStyle} 0.25s ease-out` : 'none',
    overflow: 'hidden',
    pointerEvents: 'none'
  };
  return (
    <div style={inlineStyles}>
      {children}
    </div>
  );
};
