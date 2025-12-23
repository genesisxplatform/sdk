import { CSSProperties, useContext, useEffect, useState } from 'react';
import { AssetsCacheContext } from './AssetsCacheProvider';

export const useCacheImage = (
  key: string | null,
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
    if (!container || !key) return;
    const image = imageCache.get(key);
    if (!image) return;
    if (!renderImage && container.contains(image)) {
      container.removeChild(image);
      return;
    }
    if (!renderImage) return;
    image.className = className;
    if (!container.contains(image)) {
      container.appendChild(image);
    }
    setImage(image);
  }, [container, imageCache, key, renderImage]);
  useEffect(() => {
    if (!image) return;
    if (onClick) {
      image.addEventListener('click', onClick);
    }
    if (onMouseEnter) {
      image.addEventListener('mouseenter', onMouseEnter);
    }
    return () => {
      if (onMouseEnter) {
        image.removeEventListener('mouseenter', onMouseEnter);
      }
      if (onClick) {
        image.removeEventListener('click', onClick);
      }
    };
  }, [onMouseEnter, onClick, image])
  if (image) {
    Object.assign(image.style, style);
  }
};