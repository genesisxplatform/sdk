import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo } from 'react';
import { InteractionsRegistry } from '../interactions/InteractionsRegistry';
import { Article } from '../../sdk/types/article/Article';
import { ArticleRectContext } from './ArticleRectContext';
import { InOutTransitionContext } from './InOutTransitionContext';
import { TransitionMachineContext } from './TransitionMachineContext';

export const InteractionsContext = createContext<InteractionsRegistry | undefined>(undefined);

interface Props {
  article: Article;
}

export const InteractionsProvider: FC<PropsWithChildren<Props>> = ({ article, children }) => {
  const articleRectObserver = useContext(ArticleRectContext);
  const startScene = TransitionMachineContext.useSelector((state) => (state.context.input.startScene));
  const { isStartSceneInitialized, setIsStartSceneInitialized } = useContext(InOutTransitionContext);
  const registry = useMemo(() => {
    return new InteractionsRegistry(article, isStartSceneInitialized);
   // do not add isStartSceneInitialized to the dependencies array, it will cause infinite re-render
  }, [article]);

  useEffect(() => {
    if (!registry || !articleRectObserver) return;
    const handleScroll = () => {
      registry.notifyScroll(articleRectObserver.scroll * articleRectObserver.width);
    };
    return articleRectObserver.on('scroll', handleScroll);
  }, [registry, articleRectObserver]);

  const notifyLoad = useCallback(() => {
    if (startScene === article.id) {
      setIsStartSceneInitialized(true);
    }
    if (!registry) return;
    requestAnimationFrame(() => {
      setTimeout(() => {
        registry.notifyLoad();
      }, 0);
    });
  }, [registry, startScene, article.id]);

  useEffect(() => {
    if (document.readyState === 'complete') {
      notifyLoad();
    } else {
      window.addEventListener('load', notifyLoad);
    }

    return () => window.removeEventListener('load', notifyLoad);
  }, [notifyLoad]);

  return (
    <InteractionsContext.Provider value={registry}>
      {children}
    </InteractionsContext.Provider>
  );
};

export function useInteractionsRegistry(): InteractionsRegistry | undefined {
  const registry = useContext(InteractionsContext);
  return registry;
}
