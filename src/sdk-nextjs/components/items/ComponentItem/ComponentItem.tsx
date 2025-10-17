import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { FC, useId, useState } from 'react';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useComponentItem } from './useComponentItem';
import { useItemAngle } from '../useItemAngle';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';
import { ComponentItem as TComponentItem } from '../../../../sdk/types/article/Item';

export const ComponentItem: FC<ItemProps<TComponentItem>> = ({ item, sectionId, onResize, interactionCtrl }) => {
  const sdk = useCntrlContext();
  const itemAngle = useItemAngle(item, sectionId);
  const component = sdk.getComponent(item.params.componentId);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const { opacity: itemOpacity, blur: itemBlur } = useComponentItem(item, sectionId);
  useRegisterResize(ref, onResize);
  const stateParams = interactionCtrl?.getState<number>(['opacity', 'angle', 'blur']);
  const angle = getStyleFromItemStateAndParams(stateParams?.styles?.angle, itemAngle);
  const opacity = getStyleFromItemStateAndParams(stateParams?.styles?.opacity, itemOpacity);
  const blur = getStyleFromItemStateAndParams(stateParams?.styles?.blur, itemBlur);
  const Element = component ? component.element : undefined;
  const parameters = item.params.parameters;
  return (
    <>
      <div
        className={`custom-component-${item.id}`}
        ref={setRef}
        style={{
          opacity,
          transform: `rotate(${angle}deg)`,
          ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
          willChange: blur !== 0 && blur !== undefined ? 'transform' : 'unset',
          transition: stateParams?.transition ?? 'none'
        }}
      >
        {parameters && Element && (
          <Element
            content={item.params.content}
            {...parameters}
          />
        )}
      </div>
      <JSXStyle id={item.id}>{`
        .custom-component-${item.id} {
          width: 100%;
          height: 100%;
          pointer-events: auto;
          transform: rotate(${item.area.angle}deg);
          opacity: ${item.params.opacity};
          filter: blur(${item.params.blur}vw);
          ${item.params.blur !== 0 ? 'will-change: transform;' : ''}
        }
      `}
      </JSXStyle>
    </>
  );
};
