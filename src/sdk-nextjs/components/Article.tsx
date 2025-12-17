import { FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { Article as TArticle } from '../../sdk/types/article/Article';
import { Section } from './Section/Section';
import { Item } from './items/Item';
import { ArticleRectContext } from '../provider/ArticleRectContext';
import { Scene } from './Scene';
import { InteractionsProvider } from '../provider/InteractionsContext';
import { WebglContextManagerContext } from '../provider/WebGLContextManagerContext';
import { WebGLContextManager } from '@cntrl-site/effects';
import { KeyframesContext } from '../provider/KeyframesContext';
import { Keyframes } from '../provider/Keyframes';
import { KeyframeAny } from '../../sdk/types/keyframe/Keyframe';
import { Sections } from './Section/Sections';
import { useArticleRectObserver } from '../utils/ArticleRectManager/useArticleRectObserver';

interface Props {
  article: TArticle;
  keyframes: KeyframeAny[];
  styles: {
    x: number;
    y: number;
    opacity: number;
    startX: number;
    startY: number;
  } | undefined;
}

export const Article: FC<Props> = ({ article, styles, keyframes }) => {
  const articleRectObserver = useArticleRectObserver();
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const id = useId();
  const keyframesRepo = useMemo(() => new Keyframes(keyframes), [keyframes]);
  const webglContextManager = useMemo(() => new WebGLContextManager(), []);

  return (
    <ArticleRectContext.Provider value={articleRectObserver}>
      <InteractionsProvider article={article}>
        <KeyframesContext.Provider value={keyframesRepo}>
          <Scene
            elRef={sceneRef}
            id={article.id}
            styles={styles}
          >
            <WebglContextManagerContext.Provider value={webglContextManager}>
              <Sections article={article} container={sceneRef.current} />
            </WebglContextManagerContext.Provider>
          </Scene>
        </KeyframesContext.Provider>
        
        <JSXStyle id={id}>{`
       .article {
         position: relative;
         overflow: clip;
       }
      `}</JSXStyle>
      </InteractionsProvider>
    </ArticleRectContext.Provider>
  );
};
