import { createContext, CSSProperties, FC, PropsWithChildren, useEffect, useState } from 'react';

export const SectionVideoCacheContext = createContext<{ videoCache: Map<string, HTMLVideoElement>, imageCache: Map<string, HTMLImageElement> }>({ videoCache: new Map(), imageCache: new Map() });

interface Props {
  assets: string[];
}

export const SectionVideoCacheProvider: FC<PropsWithChildren<Props>> = ({ children, assets }) => {
  const [videoCache, setVideoCache] = useState<Map<string, HTMLVideoElement>>(new Map());
  const [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    assets.forEach(asset => {
      if (isVideoAsset(asset)) {
        const video = getSectionVideo(asset);
        setVideoCache(prev => prev.set(asset, video));
      } 
      if (isImageAsset(asset)) {
        const img = new Image();
        img.src = asset;
        setImageCache(prev => prev.set(asset, img));
      }
    });
  }, [assets]);
  return <SectionVideoCacheContext.Provider value={{ videoCache, imageCache }}>{children}</SectionVideoCacheContext.Provider>;
};

function getSectionVideo(url: string) {
  const video = document.createElement('video');
  video.src = url;
  video.preload = 'auto';
  video.playsInline = true;
  video.load();
  return video;
}

function isVideoAsset(url: string): boolean {
  const videoExtensions = ['.mp4', '.mov', '.webm'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.endsWith(ext));
}

function isImageAsset(url: string): boolean {
  const imageExtensions = ['.gif', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.endsWith(ext));
}