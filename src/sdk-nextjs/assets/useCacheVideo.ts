import { CSSProperties, useContext, useEffect } from 'react';
import { AssetsCacheContext } from './AssetsCacheProvider';

export const useCacheVideo = (
  url: string,
  container: HTMLElement | null,
  renderVideo: boolean,
  params: {
    play: 'on-hover' | 'on-click' | 'auto';
    muted: boolean;
    controls: boolean;
  },
  style: CSSProperties,
  video: HTMLVideoElement | null,
  setVideo: (video: HTMLVideoElement) => void,
  className: string = '',
  onPlay?: () => void,
  onPause?: () => void,
  onMouseEnter?: () => void,
  onMouseLeave?: () => void,
) => {
  const { videoCache } = useContext(AssetsCacheContext);
  useEffect(() => {
    if (!container || !renderVideo) return;
    const { play, muted, controls } = params;
    const video = videoCache.get(url);
    if (!video) return;
    video.controls = play === "on-click" || controls;
    video.muted = play === "auto" || muted;
    video.autoplay = play === "auto";
    video.playsInline = true;
    video.loop = true;
    video.className = className;
    Object.assign(video.style, style);
    if (!container.contains(video)) {
      container.appendChild(video);
    }
    setVideo(video);
    if (onPlay) {
      video.addEventListener('play', onPlay);
    }
    if (onPause) {
      video.addEventListener('pause', onPause);
    }
    if (onPause) {
      video.addEventListener('pause', onPause);
    }
    if (play === "auto") {
      video.play().catch(() => {});
    }
    if (onMouseEnter) {
      video.addEventListener('mouseenter', onMouseEnter);
    }
    if (onMouseLeave) {
      video.addEventListener('mouseleave', onMouseLeave);
    }
    return () => {
      if (onMouseEnter) {
        video.removeEventListener('mouseenter', onMouseEnter);
      }
      if (onMouseLeave) {
        video.removeEventListener('mouseleave', onMouseLeave);
      }
      if (onPlay) {
        video.removeEventListener('play', onPlay);
      }
      if (onPause) {
        video.removeEventListener('pause', onPause);
      }
      if (onPause) {
        video.removeEventListener('pause', onPause);
      }
      video.pause();
    };
  }, [url, params, container, videoCache, className, renderVideo]);

  if (video) {
    Object.assign(video.style, style);
  }
};