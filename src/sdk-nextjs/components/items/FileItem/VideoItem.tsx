import { FC, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
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
import { VideoItem as TVideoItem } from '../../../../sdk/types/article/Item';
import { useExemplary } from '../../../common/useExemplary';
import { AssetsCacheContext } from '../../../assets/AssetsCacheProvider';
import { useCacheVideo } from '../../../assets/useCacheVideo';
import { useCacheImage } from '../../../assets/useCacheImage';
import { getCacheAssetKey } from '../../../assets/getCacheAssetKey';

export const VideoItem: FC<ItemProps<TVideoItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange, articleId }) => {
  const id = useId();
  const {
    radius: itemRadius,
    strokeWidth: itemStrokeWidth,
    strokeFill: itemStrokeFill,
    opacity: itemOpacity,
    blur: itemBlur
  } = useFileItem(item, sectionId);
  const { videoCache, imageCache } = useContext(AssetsCacheContext);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoCacheKey = getCacheAssetKey(item.params.url, item.id, articleId ?? '');
  const coverCacheKey = item.params.coverUrl ? getCacheAssetKey(item.params.coverUrl, item.id, articleId ?? '') : null;
  const isScrollPausedRef = useRef(false);
  const [userPaused, setUserPaused] = useState(false);
  const [isVideoInteracted, setIsVideoInteracted] = useState(false);
  const itemAngle = useItemAngle(item, sectionId);
  const [videoWrapper, setVideoWrapper] = useState<HTMLDivElement | null>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const fxCanvas = useRef<HTMLCanvasElement | null>(null);
  const { url, hasGLEffect } = item.params;
  const isInitialRef = useRef(true);
  const area = item.area;
  const params = item.params;
  const exemplary = useExemplary();
  const width = area && exemplary ? area.width * exemplary : 0;
  const height = area && exemplary ? area.height * exemplary : 0;
  const { controlsValues, fragmentShader } = useItemFXData(item, sectionId);
  const rect = useElementRect(videoWrapper);
  const rectWidth = Math.floor(rect?.width ?? 0);
  const rectHeight = Math.floor(rect?.height ?? 0);
  const scrollPlayback = params.scrollPlayback;
  const hasScrollPlayback = scrollPlayback !== null;
  const wrapperStateParams = interactionCtrl?.getState<number>(['angle', 'opacity', 'blur']);
  const videoStateParams = interactionCtrl?.getState<any>(['strokeWidth', 'radius', 'strokeFill']);
  const angle = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.angle, itemAngle);
  const opacity = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.opacity, itemOpacity);
  const blur = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.blur, itemBlur);
  const strokeWidth = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.strokeWidth, itemStrokeWidth);
  const radius = getStyleFromItemStateAndParams(wrapperStateParams?.styles?.radius, itemRadius);
  const strokeFill = getStyleFromItemStateAndParams(videoStateParams?.styles?.strokeFill?.[0], itemStrokeFill?.[0]) ?? itemStrokeFill?.[0];
  const stroke = strokeFill
    ? getFill(strokeFill) ?? 'transparent'
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
  useRegisterResize(videoWrapper, onResize);
  const inlineStyles = {
      transform: `translateZ(0)`,
      borderRadius: `${radius * 100}vw`,
      ...(strokeWidth !== undefined ? {
        borderWidth: `${strokeWidth * 100}vw`,
        borderColor: stroke,
        borderRadius: radius !== undefined ? `${radius * 100}vw` : 'inherit',
        borderStyle: 'solid',
      } : {}),
    transition: videoStateParams?.transition ?? 'none'
  };
  const isInteractive = opacity !== 0;
  const isVideoVisible = !hasScrollPlayback && !hasGLEffect;
  useCacheVideo(
    videoCacheKey,
    videoWrapper,
    isVideoVisible,
    params,
    inlineStyles,
    video,
    setVideo,
    `video video-${item.id}`
  );

  const onCoverMouseEnter= useCallback(() => {
    if (!video || params.play !== 'on-hover') return;
    setIsVideoInteracted(true);
    video.play();
  }, [video, params]);

  const onCoverClick = useCallback(() => {
    if (!video) return;
    setIsVideoInteracted(true);
    video.play();
  }, [video, params]);

  const renderCover = isVideoVisible && ((params.play === 'on-click' || params.play === 'on-hover') && item.params.coverUrl && !isVideoInteracted);
  useCacheImage(
    coverCacheKey,
    !!renderCover,
    {},
    videoWrapper,
    `video-cover-${item.id}`,
    onCoverMouseEnter,
    onCoverClick
  );

  useEffect(() => {
    if (!video || !videoCache.has(url)) return;
    const onPlay = () => {
      setIsVideoPlaying(true);
      setUserPaused(false);
    };
    const onPause = () => {
      if (!isScrollPausedRef.current) {
        setUserPaused(true);
      }
      setIsVideoPlaying(false);
    };
    const onMouseEnter = () => {
      if (!video || params.play !== 'on-hover') return;
      video.play();
    };
    const onMouseLeave = () => {
      if (!video || params.play !== 'on-hover') return;
      video.pause();
    };
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('mouseenter', onMouseEnter);
    video.addEventListener('mouseleave', onMouseLeave);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('mouseenter', onMouseEnter);
      video.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [video, videoCache, params]);

  useEffect(() => {
    if (!params || !video || params.play !== 'on-click' || !videoWrapper) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (userPaused || !isVideoInteracted) return;
        if (entry.isIntersecting) {
          isScrollPausedRef.current = false;
          video.play();
        } else {
          isScrollPausedRef.current = true;
          video.pause();
        }
      }
    );
    observer.observe(videoWrapper);
    return () => observer.disconnect();
  }, [params, video, videoWrapper, userPaused, isVideoInteracted]);

  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);

  return (
    <LinkWrapper link={item.link}>
      <div
        className={`video-wrapper-${item.id}`}
        ref={setVideoWrapper}
        style={{
          opacity,
          transform: `rotate(${angle}deg) translateZ(0)`,
          filter: `blur(${blur * 100}vw)`,
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
            {isVideoVisible && !videoCache.has(videoCacheKey) && (
              <video
                poster={item.params.coverUrl ?? ''}
                ref={setVideo}
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
                  if (!video || params.play !== 'on-hover') return;
                  video.play();
                }}
                onMouseLeave={() => {
                  if (!video || params.play !== 'on-hover') return;
                  video.pause();
                }}
                loop
                controls={params.controls}
                playsInline
                className={`video video-${item.id}`}
                style={inlineStyles}
              >
                <source src={item.params.url} />
              </video>
            )}
            {renderCover && coverCacheKey && !imageCache.has(coverCacheKey) && (
              <img
                onMouseEnter={() => {
                  if (!video || params.play !== 'on-hover') return;
                  setIsVideoInteracted(true);
                  video.play();
                }}
                src={item.params.coverUrl ?? ''}
                className={`video-cover-${item.id}`}
                onClick={() => {
                  if (!video) return;
                  setIsVideoInteracted(true);
                  video.play();
                }}
              />
            )}
            {(params.play === 'on-click' && !params.controls && (
              <div
                className={`video-overlay-${item.id}`}
                onClick={() => {
                  if (!video) return;
                  setIsVideoInteracted(true);
                  if (isVideoPlaying) {
                    video.pause();
                  } else {
                    video.play();
                  }
                }}
              />
            ))}
          </>
        )}
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
          border-color: ${stroke};
          border-radius: ${radius * 100}vw;
          border-width: ${strokeWidth * 100}vw;
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
