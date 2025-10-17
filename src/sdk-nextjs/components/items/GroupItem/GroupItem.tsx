import React, { FC, useEffect, useId, useState } from 'react';
import { Item, ItemProps } from '../Item';
import JSXStyle from 'styled-jsx/style';
import { LinkWrapper } from '../LinkWrapper';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useItemAngle } from '../useItemAngle';
import { useGroupItem } from './useGroupItem';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';
import { CompoundChild } from '../CompoundItem/CompoundChild';
import { GroupItem as TGroupItem } from '../../../../sdk/types/article/Item';

export const GroupItem: FC<ItemProps<TGroupItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange, isInCompound }) => {
  const id = useId();
  const { items } = item;
  const itemAngle = useItemAngle(item, sectionId);
  const { opacity: itemOpacity, blur: itemBlur } = useGroupItem(item, sectionId);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  const stateParams = interactionCtrl?.getState<number>(['opacity', 'angle', 'blur']);
  const angle = getStyleFromItemStateAndParams(stateParams?.styles?.angle, itemAngle);
  const opacity = getStyleFromItemStateAndParams(stateParams?.styles?.opacity, itemOpacity);
  const blur = getStyleFromItemStateAndParams(stateParams?.styles?.blur, itemBlur);
  const isInteractive = opacity !== 0 && opacity !== undefined;
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);
  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`group-${item.id}`}
          ref={setRef}
          style={{
            ...(opacity !== undefined ? { opacity } : {}),
            ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
            ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
            transition: stateParams?.transition ?? 'none',
            willChange: blur !== 0 && blur !== undefined ? 'transform' : 'unset',
          }}
        >
          {items && items.map(item => isInCompound ? (
            <CompoundChild
              item={item}
              key={item.id}
              sectionId={sectionId}
              isParentVisible={isInteractive}
            />
          ) : (
            <Item
              item={item}
              key={item.id}
              sectionId={sectionId}
              isParentVisible={isInteractive}
              isInGroup
            />
          ))}
        </div>
        <JSXStyle id={id}>{`
        .group-${item.id} {
          position: absolute;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          opacity: ${item.params.opacity};
          filter: ${item.params.blur !== 0 ? `blur(${item.params.blur * 100}vw)` : 'unset'};
          transform: rotate(${item.area.angle}deg);
        }
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};
