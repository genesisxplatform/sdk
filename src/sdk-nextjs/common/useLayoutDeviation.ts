import { useCntrlContext } from '../provider/useCntrlContext';
import { useContext, useEffect, useState } from 'react';
import { ArticleRectContext } from '../provider/ArticleRectContext';

type UseCurrentLayoutReturn = {
  layoutDeviation: number;
};

export function useLayoutDeviation(): UseCurrentLayoutReturn {
  const { exemplary } = useCntrlContext();
  const articleRectObserver = useContext(ArticleRectContext);
  const [deviation, setDeviation] = useState(1);

  useEffect(() => {
    if (!articleRectObserver) return;
    const syncDeviation = () => setDeviation(articleRectObserver.width / exemplary);
    if (articleRectObserver.initialized) {
      syncDeviation();
    }
    const offInit = articleRectObserver.on('init', syncDeviation);
    const offResize = articleRectObserver.on('resize', syncDeviation);
    return () => {
      offInit();
      offResize();
    };
  }, [articleRectObserver, exemplary]);

  return { layoutDeviation: deviation };
}
