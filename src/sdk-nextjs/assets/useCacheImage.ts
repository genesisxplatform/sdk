import { CSSProperties, useContext, useEffect, useState } from 'react';
import { AssetsCacheContext } from './AssetsCacheProvider';

export const useCacheImage = (
  url: string | undefined | null,
  renderImage: boolean,
  style: CSSProperties,
  container: HTMLElement | null,
  className: string = '',
  onMouseEnter?: () => void,
  onClick?: () => void,
) => {
  const { imageCache } = useContext(AssetsCacheContext);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!container || !renderImage || !url) return;
    const image = imageCache.get(url);
    if (!image) return;
    image.className = className;
    if (!container.contains(image)) {
      container.appendChild(image);
    }
    if (onMouseEnter) {
      image.addEventListener('mouseenter', onMouseEnter);
    }
    if (onClick) {
      image.addEventListener('click', onClick);
    }
    setImage(image);
    return () => {
      if (onMouseEnter) {
        image.removeEventListener('mouseenter', onMouseEnter);
      }
      if (onClick) {
        image.removeEventListener('click', onClick);
      }
    };
  }, [container, imageCache, url, renderImage]);
  if (image) {
    Object.assign(image.style, style);
  }
};