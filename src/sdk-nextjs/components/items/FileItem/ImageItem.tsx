import { FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useFileItem } from './useFileItem';
import { useItemAngle } from '../useItemAngle';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { useImageFx } from '../../../utils/effects/useImageFx';
import { useElementRect } from '../../../utils/useElementRect';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';
import { useItemFXData } from '../../../common/useItemFXData';
import { getFill } from '../../../utils/getFill';
import { FillLayer } from '../../../../sdk/types/article/Item';
import { ImageItem as TImageItem } from '../../../../sdk/types/article/Item';
import { useExemplary } from '../../../common/useExemplary';

export const ImageItem: FC<ItemProps<TImageItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const {
    radius: itemRadius,
    strokeWidth: itemStrokeWidth,
    opacity: itemOpacity,
    strokeFill: itemStrokeFill,
    blur: itemBlur
  } = useFileItem(item, sectionId);
  const itemAngle = useItemAngle(item, sectionId);
  const [wrapperRef, setWrapperRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(wrapperRef, onResize);
  const { url, hasGLEffect } = item.params;
  const fxCanvas = useRef<HTMLCanvasElement | null>(null);
  const isInitialRef = useRef(true);

  const { controlsValues, fragmentShader } = useItemFXData(item, sectionId);
  const area = item.area;
  const exemplary = useExemplary();
  const width = area.width * exemplary;
  const height = area.height * exemplary;
  const params = item.params;
  const wrapperStateParams = interactionCtrl?.getState<number>(['angle', 'opacity', 'blur']);
  const imgStateParams = interactionCtrl?.getState<number>(['strokeWidth', 'radius']);
  const stateStrokeFillParams = interactionCtrl?.getState<FillLayer[]>(['strokeFill']);
  const stateStrokeFillLayers = stateStrokeFillParams?.styles?.strokeFill;
  const strokeSolidTransition = stateStrokeFillParams?.transition ?? 'none';

  useEffect(() => {
    isInitialRef.current = false;
  }, []);
  const isFXAllowed = useImageFx(
    fxCanvas.current,
    !!(hasGLEffect && !isInitialRef.current),
    {
      imageUrl: url,
      fragmentShader,
      controlsValues
    },
    width,
    height
  );
  const rect = useElementRect(wrapperRef);
  const rectWidth = Math.floor(rect?.width ?? 0);
  const rectHeight = Math.floor(rect?.height ?? 0);
  const radius = getStyleFromItemStateAndParams(imgStateParams?.styles?.radius, itemRadius);
  const strokeWidth = getStyleFromItemStateAndParams(imgStateParams?.styles?.strokeWidth, itemStrokeWidth);
  const angle = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.angle, itemAngle);
  const opacity = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.opacity, itemOpacity);
  const blur = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.blur, itemBlur);

  const strokeValue = stateStrokeFillLayers
    ? getStyleFromItemStateAndParams<FillLayer>(stateStrokeFillLayers[0], itemStrokeFill?.[0])
    : itemStrokeFill?.[0];
  const stroke = strokeValue
    ? getFill(strokeValue) ?? 'transparent'
    : 'transparent';
  const inlineStyles = {
    borderRadius: `${radius * 100}vw`,
    borderWidth: `${strokeWidth * 100}vw`,
    transition: imgStateParams?.transition ?? 'none'
  };
  const isInteractive = opacity !== 0;
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);
  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <>
        <div
          className={`image-wrapper-${item.id}`}
          ref={setWrapperRef}
          style={{
            opacity,
            transform: `rotate(${angle}deg)`,
            ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
            ...(strokeValue ? {
              '--stroke-background': stroke,
              ...(strokeValue.type === 'image' ? {
                '--stroke-background-position': 'center',
                '--stroke-background-size': strokeValue.behavior === 'repeat' ? `${strokeValue.backgroundSize}%` : strokeValue.behavior,
                '--stroke-background-repeat': strokeValue.behavior === 'repeat' ? 'repeat' : 'no-repeat'
              } : {})
            } : {}),
            willChange: blur !== 0 && blur !== undefined ? 'transform' : 'unset',
            transition: wrapperStateParams?.transition ?? 'none'
          }}
        >
          {hasGLEffect && isFXAllowed
            ? (
                <canvas
                  style={inlineStyles}
                  ref={fxCanvas}
                  className={`img-canvas image-${item.id}`}
                  width={rectWidth}
                  height={rectHeight}
                />
              )
            : (
                <img
                  alt=""
                  className={`image image-${item.id}`}
                  style={inlineStyles}
                  src={item.params.url}
                />
              )}
          <div
            className={`image-border-${item.id}`}
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
        </div>
        <JSXStyle id={id}>{`
        .image-wrapper-${item.id} {
          position: absolute;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          display: flex;
          opacity: ${params.opacity};
          transform: rotate(${area.angle}deg);
          filter: ${params.blur !== 0 ? `blur(${params.blur * 100}vw)` : 'unset'};
          ${params.blur !== 0 ? 'will-change: transform;' : ''}
        }
        .image {
          width: 100%;
          height: 100%;
          opacity: 1;
          object-fit: cover;
          pointer-events: none;
          border-style: solid;
          overflow: hidden;
          box-sizing: border-box;
        }
        .img-canvas {
          border: solid;
          width: 100%;
          height: 100%;
          pointer-events: none;
          border-width: 0;
          box-sizing: border-box;
        }
        .image-border-${item.id} {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          z-index: 2;
          -webkit-mask:
            linear-gradient(#fff 0 0) content-box,
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
        .image-${item.id} {
          border: solid;
          border-color: transparent;
          border-width: ${params.strokeWidth * 100}vw;
          border-radius: ${params.radius * 100}vw;
        }
      `}</JSXStyle>
      </>
    </LinkWrapper>
  );
};
