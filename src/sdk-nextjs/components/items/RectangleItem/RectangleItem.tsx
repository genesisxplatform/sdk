import { FC, useEffect, useId, useMemo, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useRectangleItem } from './useRectangleItem';
import { useItemAngle } from '../useItemAngle';
import { useCntrlContext } from '../../../provider/useCntrlContext';
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
  const isInteractive = areFillsVisible(stateFillLayers ?? itemFill ?? []) || (strokeWidth !== 0 && areFillsVisible(strokeFill ?? itemStrokeFill ?? []));
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);

  const stroke = strokeFill
    ? getFill(strokeFill) ?? 'transparent'
    : 'transparent';

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`rectangle-${item.id}`}
          ref={setRef}
          style={{
            ...(strokeFill ? {
              borderColor: stroke,
              borderWidth: strokeWidth !== undefined ? `${strokeWidth * 100}vw` : 0,
              borderRadius: radius !== undefined ? `${radius * 100}vw` : 'inherit',
              borderStyle: 'solid',
              ...(strokeFill.type === 'image' ? {
                backgroundPosition: 'center',
                backgroundSize: strokeFill.behavior === 'repeat' ? `${strokeFill.backgroundSize}%` : strokeFill.behavior,
                backgroundRepeat: strokeFill.behavior === 'repeat' ? 'repeat' : 'no-repeat'
              } : {})
            } : {}),
            borderRadius: `${radius * 100}vw`,
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
          <div
            className={`rectangle-border-${item.id}`}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 'inherit',
              pointerEvents: 'none',
              zIndex: 2,
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              ...(strokeWidth !== 0 && strokeValue ? {
                ...(strokeWidth ? { padding: `${strokeWidth * 100}vw` } : {}),
                ...(strokeValue.type === 'solid' ? { transition: strokeSolidTransition, background: stroke } : {}),
                ...(strokeValue.type === 'image' ? {
                  backgroundPosition: 'center',
                  backgroundSize: strokeValue.behavior === 'repeat' ? `${strokeValue.backgroundSize}%` : strokeValue.behavior,
                  backgroundRepeat: strokeValue.behavior === 'repeat' ? 'repeat' : 'no-repeat'
                } : {
                  background: stroke,
                }
                )
              } : { background: stroke }),
            }}
          />
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
                solidTransition={solidTransition}
                radius={radius}
                strokeWidth={strokeWidth}
                key={`fill-${i}-${fill.id}`}
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
    fill,
    itemId,
    background,
    solidTransition,
    radius,
    strokeWidth
  }: { fill: FillLayer; itemId: string; background: string; solidTransition: string; radius: number; strokeWidth: number; }) {
  const isRotatedImage = fill.type === 'image' && fill.rotation && fill.rotation !== 0;

  return (
    <div
      key={fill.id}
      className={fill.type === 'image' ? `image-fill-${itemId}` : `fill-${itemId}`}
      style={{
        ...(fill.type === 'solid' ? { background, transition: solidTransition } : {}),
        ...(fill.type === 'image'
          ? {
              transform: `rotate(${fill.rotation}deg)`,
              backgroundImage: `url(${fill.src})`,
              backgroundSize: fill.behavior === 'repeat' ? `${fill.backgroundSize}%` : fill.behavior,
              backgroundRepeat: fill.behavior === 'repeat' ? 'repeat' : 'no-repeat',
              opacity: fill.opacity
            }
          : { background }),
        position: 'absolute',
        mixBlendMode: fill.blendMode as any,
        top: 0,
        left: 0,
        borderRadius: `calc(${radius * 100}vw - ${strokeWidth * 100}vw)`,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...(isRotatedImage ? { overflow: 'hidden' } : {})
      }}
    >
    </div>
  );
};
