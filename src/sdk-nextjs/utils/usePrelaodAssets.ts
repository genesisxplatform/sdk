import { useEffect } from 'react';

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

export function usePreloadAssets(assets: { url: string, id: string }[]) {
  useEffect(() => {
    assets.forEach(({ url, id }) => {
      if (isVideoAsset(url)) {
        const video = document.createElement('video');
        video.src = url;
        video.preload = 'auto';
        video.style.display = 'none';
        document.body.appendChild(video);
        video.addEventListener('loadeddata', () => {
          setTimeout(() => {
            if (video.parentNode) {
              video.parentNode.removeChild(video);
            }
          }, 1000);
        });
      } 
      if (isImageAsset(url)) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [assets]);
}
