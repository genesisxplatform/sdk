import { FC, useEffect, useId, useRef, useState } from 'react';
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
  const imgStateParams = interactionCtrl?.getState<any>(['strokeWidth', 'radius', 'strokeFill']);

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
  const strokeFill = getStyleFromItemStateAndParams(imgStateParams?.styles?.strokeFill?.[0], itemStrokeFill?.[0]) ?? itemStrokeFill?.[0];
  const opacity = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.opacity, itemOpacity);
  const blur = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.blur, itemBlur);

  const stroke = strokeFill
    ? getFill(strokeFill) ?? 'transparent'
    : 'transparent';
    const inlineStyles = {
      ...(radius !== undefined ? { borderRadius: `${radius * 100}vw` } : {}),
      ...(strokeWidth !== undefined ? {
        borderColor: stroke,
        borderWidth: `${strokeWidth * 100}vw`,
        borderRadius: radius !== undefined ? `${radius * 100}vw` : 'inherit',
        borderStyle: 'solid',
      } : {}),
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
