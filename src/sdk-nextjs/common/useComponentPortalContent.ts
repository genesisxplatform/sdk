import { RefObject, useEffect, useState } from 'react';

export function useComponentPortalContent(portalRef: RefObject<HTMLElement>): boolean {
  const [hasPortalContent, setHasPortalContent] = useState(false);

  useEffect(() => {
    const portal = portalRef.current;
    if (!portal) return;
    let frameId = 0;
    const update = () => {
      frameId = 0;
      setHasPortalContent(hasVisibleContent(portal));
    };
    const scheduleUpdate = () => {
      if (frameId !== 0) return;
      frameId = requestAnimationFrame(update);
    };
    update();
    const observer = new MutationObserver(scheduleUpdate);
    observer.observe(portal, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden']
    });
    return () => {
      observer.disconnect();
      if (frameId !== 0) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [portalRef]);

  return hasPortalContent;
}

function hasVisibleContent(portal: HTMLElement): boolean {
  return Array.from(portal.children).some((child) => (
    child.getClientRects().length > 0 && getComputedStyle(child).visibility !== 'hidden'
  ));
}
