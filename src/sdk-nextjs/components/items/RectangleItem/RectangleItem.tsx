import { FC, useEffect, useId, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useRectangleItem } from './useRectangleItem';
import { useItemAngle } from '../useItemAngle';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';
import { getFill } from '../../../utils/getFill';
import { areFillsVisible } from '../../../utils/areFillsVisible/areFillsVisible';
import { RectangleItem as TRectangleItem } from '../../../../sdk/types/article/Item';
import { FillLayer } from '../../../../sdk/types/article/Item';

export const RectangleItem: FC<ItemProps<TRectangleItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const {
    fill: itemFill,
    radius: itemRadius,
    strokeWidth: itemStrokeWidth,
    strokeFill: itemStrokeFill,
    blur: itemBlur,
    backdropBlur: itemBackdropBlur
  } = useRectangleItem(item, sectionId);
  const itemAngle = useItemAngle(item, sectionId);
  const stateParams = interactionCtrl?.getState<any>(['angle', 'strokeWidth', 'radius', 'blur', 'backdropBlur', 'strokeFill']);
  const stateFillParams = interactionCtrl?.getState<FillLayer[]>(['fill']);
  const stateFillLayers = stateFillParams?.styles?.fill;
  const solidTransition = stateFillParams?.transition ?? 'none';
  const styles = stateParams?.styles ?? {};
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  const backdropBlur = getStyleFromItemStateAndParams(styles?.backdropBlur, itemBackdropBlur);
  const radius = getStyleFromItemStateAndParams(styles?.radius, itemRadius);
  const strokeWidth = getStyleFromItemStateAndParams(styles?.strokeWidth, itemStrokeWidth);
  const strokeFill = getStyleFromItemStateAndParams(styles?.strokeFill?.[0], itemStrokeFill?.[0]) ?? itemStrokeFill?.[0];
  const angle = getStyleFromItemStateAndParams(styles?.angle, itemAngle);
  const blur = getStyleFromItemStateAndParams(styles?.blur, itemBlur);
  const backdropFilterValue = backdropBlur ? `blur(${backdropBlur * 100}vw)` : undefined;
  const isInteractive = areFillsVisible(stateFillLayers ?? itemFill ?? []) || (strokeWidth !== 0 && areFillsVisible(strokeFill ? [strokeFill] : itemStrokeFill ?? []));
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);

  const stroke = strokeFill
    ? getFill(strokeFill) ?? 'transparent'
    : 'transparent';

  return (
    <LinkWrapper link={item.link}>
      <>
        <div
          className={`rectangle-${item.id}`}
          ref={setRef}
          style={{
            ...(angle !== undefined ? { transform: `rotate(${angle}deg)` } : {}),
            ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
            willChange: blur !== 0 && blur !== undefined ? 'transform' : 'unset',
            ...(backdropFilterValue !== undefined
              ? { backdropFilter: backdropFilterValue, WebkitBackdropFilter: backdropFilterValue }
              : {}
            ),
            transition: stateParams?.transition ?? 'none'
          }}
        >
          {itemFill && itemFill.map((fill, i) => {
            const stateFillLayer = stateFillLayers?.find((layer) => layer.id === fill.id);
            const value = stateFillLayer
              ? (getStyleFromItemStateAndParams<FillLayer>(stateFillLayer, fill) ?? fill)
              : fill;
            const background = value
              ? getFill(value) ?? 'transparent'
              : 'transparent';

            return (
              <Fill
                fill={value}
                itemId={item.id}
                background={background}
                transition={stateParams?.transition || ''}
                solidTransition={solidTransition}
                radius={radius}
                strokeWidth={strokeWidth}
                key={`fill-${i}-${fill.id}`}
                fillId={fill.id}
                isHighest={i === itemFill.length - 1}
                borderColor={stroke}
              />
            );
          })}
        </div>
        <JSXStyle id={id}>{`
        .rectangle-${item.id} {
          position: absolute;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          border-radius: ${item.params.radius * 100}vw
          transform: rotate(${item.area.angle}deg);
          filter: ${item.params.blur !== 0 ? `blur(${item.params.blur * 100}vw)` : 'unset'};
          ${item.params.blur !== 0 ? 'will-change: transform;' : ''}
          backdrop-filter: ${item.params.backdropBlur !== 0 ? `blur(${item.params.backdropBlur * 100}vw)` : 'unset'};
          -webkit-backdrop-filter: ${item.params.backdropBlur !== 0 ? `blur(${item.params.backdropBlur * 100}vw)` : 'unset'};
        },
        .image-fill-${item.id} {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transform-origin: center center;
          z-index: 1;
          background-position: center;
        },
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};

function Fill({ 
    fillId,
    fill,
    itemId,
    background,
    transition,
    solidTransition,
    radius,
    strokeWidth,
    isHighest,
    borderColor,
  }: { fillId: string; fill: FillLayer; itemId: string; background: string; transition: string; solidTransition: string; radius: number; strokeWidth: number; isHighest: boolean; borderColor: string; }) {
  const isRotatedImage = fill.type === 'image' && fill.rotation && fill.rotation !== 0;

  return (
    <div
      key={fillId}
      className={fill.type === 'image' ? `image-fill-${itemId}` : `fill-${itemId}`}
      style={{
        ...(fill.type === 'solid' ? {
          background,
          transition: transition && transition !== 'none' && transition.trim()
            ? `${solidTransition}, ${transition}`
            : solidTransition
        } : {}),
        ...(fill.type === 'image'
          ? {
              transform: `rotate(${fill.rotation}deg)`,
              backgroundImage: `url(${fill.src})`,
              backgroundSize: fill.behavior === 'repeat' ? `${fill.backgroundSize}%` : fill.behavior,
              backgroundRepeat: fill.behavior === 'repeat' ? 'repeat' : 'no-repeat',
              backgroundOrigin: 'border-box',
              opacity: fill.opacity
            }
          : { background }),
        position: 'absolute',
        mixBlendMode: fill.blendMode as any,
        top: 0,
        left: 0,
        borderRadius: `${radius * 100}vw`,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...(isHighest ? {
          borderColor,
          borderWidth: `${strokeWidth * 100}vw`,
          borderStyle: 'solid',
          boxSizing: 'border-box'
        } : {}),
        ...(isRotatedImage ? { overflow: 'hidden' } : {}),
        ...(fill.type !== 'solid' ? { transition } : {})
      }}
    >
    </div>
  );
};
