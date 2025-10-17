import { useCntrlContext } from '../provider/useCntrlContext';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ArticleRectContext } from '../provider/ArticleRectContext';

interface LayoutData {
  layoutId: string;
  exemplary: number;
  start: number;
  end: number;
}

type UseCurrentLayoutReturn = {
  layoutDeviation: number;
};

export function useLayoutDeviation(): UseCurrentLayoutReturn {
  const { exemplary } = useCntrlContext();
  const articleRectObserver = useContext(ArticleRectContext);
  const [deviation, setDeviation] = useState(1);
  useEffect(() => {
    if (!articleRectObserver) return;
    return articleRectObserver.on('resize', () => {
      const articleWidth = articleRectObserver.width;
      setDeviation(articleWidth / exemplary);
    });
  }, [articleRectObserver, exemplary]);

  return { layoutDeviation: deviation };
}
