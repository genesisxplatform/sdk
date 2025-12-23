import { CSSProperties, useContext, useEffect } from 'react';
import { AssetsCacheContext } from './AssetsCacheProvider';

export const useCacheVideo = (
  key: string,
  container: HTMLElement | null,
  isVideoVisible: boolean,
  params: {
    play: 'on-hover' | 'on-click' | 'auto';
    muted: boolean;
    controls: boolean;
  },
  style: CSSProperties,
  video: HTMLVideoElement | null,
  setVideo: (video: HTMLVideoElement) => void,
  className: string = ''
) => {
  const { videoCache } = useContext(AssetsCacheContext);
  useEffect(() => {
    if (!container || !isVideoVisible) return;
    const { play, muted, controls } = params;
    const video = videoCache.get(key);
    if (!video) return;
    video.controls = controls;
    video.muted = play === "auto" || muted;
    video.autoplay = play === "auto";
    video.playsInline = true;
    video.loop = true;
    video.className = className;
    if (!container.contains(video)) {
      container.appendChild(video);
    }
    setVideo(video);
    if (play === "auto") {
      video.play().catch(() => {});
    }
    return () => {
      video.pause();
    };
  }, [key, params, container, videoCache, className, isVideoVisible]);

  if (video) {
    Object.assign(video.style, style);
  }
};