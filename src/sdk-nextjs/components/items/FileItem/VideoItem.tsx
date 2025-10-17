import { FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { LinkWrapper } from '../LinkWrapper';
import { useFileItem } from './useFileItem';
import { useItemAngle } from '../useItemAngle';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { ScrollPlaybackVideo } from '../../ScrollPlaybackVideo';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';
import { useVideoFx } from '../../../utils/effects/useVideoFx';
import { useElementRect } from '../../../utils/useElementRect';
import { useItemFXData } from '../../../common/useItemFXData';
import { getFill } from '../../../utils/getFill';
import { FillLayer } from '../../../../sdk/types/article/Item';
import { VideoItem as TVideoItem } from '../../../../sdk/types/article/Item';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { useExemplary } from '../../../common/useExemplary';

export const VideoItem: FC<ItemProps<TVideoItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const {
    radius: itemRadius,
    strokeWidth: itemStrokeWidth,
    strokeFill: itemStrokeFill,
    opacity: itemOpacity,
    blur: itemBlur
  } = useFileItem(item, sectionId);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const isScrollPausedRef = useRef(false);
  const [userPaused, setUserPaused] = useState(false);
  const [isVideoInteracted, setIsVideoInteracted] = useState(false);
  const itemAngle = useItemAngle(item, sectionId);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const fxCanvas = useRef<HTMLCanvasElement | null>(null);
  const { url, hasGLEffect } = item.params;
  const isInitialRef = useRef(true);
  const area = item.area;
  const params = item.params;
  const exemplary = useExemplary();
  const width = area && exemplary ? area.width * exemplary : 0;
  const height = area && exemplary ? area.height * exemplary : 0;
  const { controlsValues, fragmentShader } = useItemFXData(item, sectionId);
  const rect = useElementRect(ref);
  const rectWidth = Math.floor(rect?.width ?? 0);
  const rectHeight = Math.floor(rect?.height ?? 0);
  const scrollPlayback = params.scrollPlayback;
  const hasScrollPlayback = scrollPlayback !== null;
  const wrapperStateParams = interactionCtrl?.getState<number>(['angle', 'opacity', 'blur']);
  const videoStateParams = interactionCtrl?.getState<number>(['strokeWidth', 'radius']);
  const stateStrokeFillParams = interactionCtrl?.getState<FillLayer[]>(['strokeFill']);
  const stateStrokeFillLayers = stateStrokeFillParams?.styles?.strokeFill;
  const strokeSolidTransition = stateStrokeFillParams?.transition ?? 'none';
  const angle = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.angle, itemAngle);
  const opacity = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.opacity, itemOpacity);
  const blur = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.blur, itemBlur);
  const strokeWidth = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.strokeWidth, itemStrokeWidth);
  const radius = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.radius, itemRadius);

  const strokeValue = stateStrokeFillLayers
    ? getStyleFromItemStateAndParams<FillLayer>(stateStrokeFillLayers[0], itemStrokeFill?.[0])
    : itemStrokeFill?.[0];
  const stroke = strokeValue
    ? getFill(strokeValue) ?? 'transparent'
    : 'transparent';
  useEffect(() => {
    isInitialRef.current = false;
  }, []);
  const isFXAllowed = useVideoFx(
    fxCanvas.current,
    !!(hasGLEffect && !isInitialRef.current),
    {
      videoUrl: url,
      fragmentShader,
      controls: controlsValues
    },
    width,
    height
  );
  useRegisterResize(ref, onResize);
  const inlineStyles = {
      borderRadius: `${radius * 100}vw`,
    borderWidth: `${strokeWidth * 100}vw`,
    transition: videoStateParams?.transition ?? 'none'
  };
  const isInteractive = opacity !== 0;
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);

  useEffect(() => {
    if (!videoRef || params.play !== 'on-click' || !ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (userPaused || !isVideoInteracted) return;
        if (entry.isIntersecting) {
          isScrollPausedRef.current = false;
          videoRef.play();
        } else {
          isScrollPausedRef.current = true;
          videoRef.pause();
        }
      }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [videoRef, ref, userPaused, isVideoInteracted]);

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <div
        className={`video-wrapper-${item.id}`}
        ref={setRef}
        style={{
          opacity,
          transform: `rotate(${angle}deg)`,
          filter: `blur(${blur * 100}vw)`,
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
        {hasScrollPlayback && (
          <ScrollPlaybackVideo
            sectionId={sectionId}
            src={item.params.url}
            playbackParams={scrollPlayback}
            style={inlineStyles}
            className={`video video-playback-wrapper video-${item.id}`}
          />
        )}
        {hasGLEffect && isFXAllowed && (
          <canvas
            style={inlineStyles}
            ref={fxCanvas}
            className={`video-canvas video-${item.id}`}
            width={rectWidth}
            height={rectHeight}
          />
        )}
        {!hasScrollPlayback && !hasGLEffect && (
          <>
            <video
              poster={item.params.coverUrl ?? ''}
              ref={setVideoRef}
              autoPlay={params.play === 'auto'}
              preload="auto"
              onClick={() => {
                setIsVideoInteracted(true);
              }}
              muted={params.muted}
              onPlay={() => {
                setIsVideoPlaying(true);
                setUserPaused(false);
              }}
              onPause={() => {
                if (!isScrollPausedRef.current) {
                  setUserPaused(true);
                }
                setIsVideoPlaying(false);
              }}
              onMouseEnter={() => {
                if (!videoRef || params.play !== 'on-hover') return;
                videoRef.play();
              }}
              onMouseLeave={() => {
                if (!videoRef || params.play !== 'on-hover') return;
                videoRef.pause();
              }}
              loop
              controls={params.controls}
              playsInline
              className={`video video-${item.id}`}
              style={inlineStyles}
            >
              <source src={item.params.url} />
            </video>
            {(params.play === 'on-click' || params.play === 'on-hover') && item.params.coverUrl && !isVideoInteracted && (
              <img
                onMouseEnter={() => {
                  if (!videoRef || params.play !== 'on-hover') return;
                  setIsVideoInteracted(true);
                  videoRef.play();
                }}
                src={item.params.coverUrl ?? ''}
                className={`video-cover-${item.id}`}
                onClick={() => {
                  if (!videoRef) return;
                  setIsVideoInteracted(true);
                  videoRef.play();
                }}
              />
            )}
            {(params.play === 'on-click' && !params.controls && (
              <div
                className={`video-overlay-${item.id}`}
                onClick={() => {
                  if (!videoRef) return;
                  setIsVideoInteracted(true);
                  if (isVideoPlaying) {
                    videoRef.pause();
                  } else {
                    videoRef.play();
                  }
                }}
              />
            ))}
          </>
        )}
        <div
          className={`video-border-${item.id}`}
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
        .video-wrapper-${item.id} {
          position: absolute;
          overflow: hidden;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          opacity: ${params.opacity};
          transform: rotate(${item.area.angle}deg);
          filter: ${params.blur !== 0 ? `blur(${params.blur * 100}vw)` : 'unset'};
          ${params.blur !== 0 ? 'will-change: transform;' : ''}
        }
        .video-overlay-${item.id} {
          position: absolute;
          top: 0;
          left: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }
        .video-border-${item.id} {
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
        .video-cover-${item.id} {
          position: absolute;
          top: 0;
          left: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .video {
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          opacity: 1;
          object-fit: cover;
          overflow: hidden;
          border-style: solid;
        }
        .video-${item.id} {
          border: solid;
          border-color: transparent;
          border-width: ${params.strokeWidth * 100}vw;
          border-radius: ${params.radius * 100}vw;
        }
        .video-playback-wrapper {
          display: flex;
          justify-content: center;
        }
        .video-canvas {
          border: solid;
          width: 100%;
          height: 100%;
          pointer-events: none;
          border-width: 0;
          box-sizing: border-box;
        }
    `}</JSXStyle>
    </LinkWrapper>
  );
};
