import { createContext, CSSProperties, FC, PropsWithChildren, useEffect, useState } from 'react';
import { Section, SectionVideo } from '../../../sdk/types/article/Section';

export const SectionVideoCacheContext = createContext<Map<string, HTMLVideoElement>>(new Map());

interface Props {
  sections: Section[];
}

export const SectionVideoCacheProvider: FC<PropsWithChildren<Props>> = ({ children, sections }) => {
  const [sectionVideoCache, setSectionVideoCache] = useState<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    sections.forEach((section) => {
      if (section.media?.type === 'video' && section.media.play === 'auto') {
        setSectionVideoCache(prev => prev.set(section.id, getSectionVideo(section.media as SectionVideo)));
      }
    });
  }, [sections]);
  return <SectionVideoCacheContext.Provider value={sectionVideoCache}>{children}</SectionVideoCacheContext.Provider>;
};

function getSectionVideo(sectionVideo: SectionVideo) {
  const { size, offsetX } = sectionVideo;
  const isContainHeight = size === 'contain-height';
  const hasOffsetX = offsetX !== null && size === 'contain';
  const video = document.createElement('video');
  video.src = sectionVideo.url;
  video.autoplay = false;
  video.loop = true;
  video.muted = true;
  video.controls = false;
  video.playsInline = true;
  video.preload = 'auto';
  const style: CSSProperties = {
    objectFit: isContainHeight ? 'cover' : (size ?? 'cover') as CSSProperties['objectFit'],
    width: isContainHeight ? 'auto' : '100%',
    transform: isContainHeight ? 'translateX(-50%)' : 'none',
    left: isContainHeight ? '50%' : (hasOffsetX ? `${offsetX * 100}vw` : '0'),
    height: '100%',
    position: 'relative'
  }
  Object.assign(video.style, style);
  video.load();
  // video.play().catch(() => {});
  return video;
}