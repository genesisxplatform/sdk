import { CSSProperties, FC, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AssetsCacheContext } from '../../assets/AssetsCacheProvider';
import { useCacheVideo } from '../../assets/useCacheVideo';
import { useCacheImage } from '../../assets/useCacheImage';
import { getCacheAssetKey } from '../../assets/getCacheAssetKey';

export type TSectionVideo = {
  url: string;
  size: string;
  type: 'video';
  play: 'on-click' | 'auto';
  position: string;
  coverUrl: string | null;
  offsetX: number | null;
};

interface Props {
  container: HTMLDivElement;
  sectionId: string;
  media: TSectionVideo;
}

export const SectionVideo: FC<Props> = ({ container, sectionId, media }) => {
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [videoWrapper, setVideoWrapper] = useState<HTMLDivElement | null>(null);
  const [coverImageWrapper, setCoverImageWrapper] = useState<HTMLDivElement | null>(null);
  const [isVideoWidthOverflow, setIsVideoWidthOverflow] = useState(false);
  const { url, size, position, offsetX, coverUrl, play } = media;
  const key = getCacheAssetKey(url, sectionId);
  const coverKey = coverUrl ? getCacheAssetKey(coverUrl, sectionId) : null;
  const [isPlaying, setIsPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [isClickedOnCover, setIsClickedOnCover] = useState(false);

  const handleCoverClick = () => {
    if (!video || play !== 'on-click') return;
    setIsClickedOnCover(true);
    if (isPlaying) {
      video.pause();
      setUserPaused(true);
    } else {
      video.play();
      setUserPaused(false);
    }
  };
  const isContainHeight = size === 'contain-height';
  const hasOffsetX = offsetX !== null && size === 'contain';
  const styles: CSSProperties = {
    objectFit: isContainHeight ? 'cover' : (size ?? 'cover') as CSSProperties['objectFit'],
    width: isContainHeight && !isVideoWidthOverflow ? 'auto' : '100%',
    transform: isContainHeight ? 'translateX(-50%)' : 'none',
    left: isContainHeight ? '50%' : (hasOffsetX ? `${offsetX * 100}vw` : '0'),
    opacity: !isClickedOnCover && play === 'on-click' && coverUrl ? 0 : 1,
    height: '100%',
    position: 'relative'
  };
  const videoParams = useMemo(() => ({
    play,
    muted: play === 'auto',
    controls: play === 'on-click'
  }), [play]);

  useCacheVideo(
    key,
    videoWrapper,
    true,
    videoParams,
    styles,
    video,
    setVideo,
    `section-video-${sectionId}`
  );

  useEffect(() => {
    if (!video) return;
    const onPlay = () => {
      setIsPlaying(true);
    };
    const onPause = () => {
      setIsPlaying(false);
    };
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [video]);

  useEffect(() => {
    if (!video || !videoWrapper) return;
    video.addEventListener('loadedmetadata', () => {
      const h = video.videoHeight;
      const w = video.videoWidth;
      const width = (videoWrapper.clientHeight / h) * w;
      if (width > videoWrapper.clientWidth) {
        setIsVideoWidthOverflow(true);
      } else {
        setIsVideoWidthOverflow(false);
      }
    });
  }, [video, videoWrapper]);

  useEffect(() => {
    if (!video || play !== 'on-click') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (userPaused || !isClickedOnCover) return;
        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
        }
      }
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [container, play, userPaused, isClickedOnCover]);

  const coverStyles: CSSProperties = {
    opacity: isPlaying ? 0 : 1,
    left: isContainHeight ? '50%' : (hasOffsetX ? `${offsetX * 100}vw` : '0'),
    width: isContainHeight ? 'auto' : '100%',
    objectFit: isContainHeight ? 'unset' : (size ?? 'cover') as CSSProperties['objectFit'],
    transform: isContainHeight ? 'translateX(-50%)' : 'none',
    height: '100%',
    position: 'relative',
    pointerEvents: 'none',
    transition: 'opacity 0.1s ease-in-out'
  };
  const renderCover = coverUrl && play === 'on-click' && !isClickedOnCover;
  useCacheImage(coverKey, !!renderCover, coverStyles, coverImageWrapper, `video-background-${sectionId}-cover`);

  return (
    <>
      <div
        ref={setVideoWrapper}
        className={`section-video-wrapper-${sectionId}`}
        style={{
          position: position === 'fixed' ? 'sticky' : 'relative',
          height: position === 'fixed' ? '100vh' : '100%',
          top: position === 'fixed' ? '100vh' : '0',
          overflow: 'hidden',
          width: '100%'
        }}
      >
        {play === 'on-click' && !isClickedOnCover && (
          <div
            className={`video-background-${sectionId}-cover-container`}
            style={{
              position: 'absolute',
              pointerEvents: 'all',
              left: 0,
              width: '100%',
              zIndex: 1,
              height: '100%',
              top: 0
            }}
            onClick={handleCoverClick}
            ref={setCoverImageWrapper}
          />
        )}
      </div>
    </>
  );
};
