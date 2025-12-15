import { FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import JSXStyle from 'styled-jsx/style';
import { Article as TArticle } from '../../sdk/types/article/Article';
import { Section } from './Section/Section';
import { Item } from './items/Item';
import { useArticleRectObserver } from '../utils/ArticleRectManager/useArticleRectObserver';
import { ArticleRectContext } from '../provider/ArticleRectContext';
import { Scene } from './Scene';
import { InteractionsProvider } from '../provider/InteractionsContext';
import { WebglContextManagerContext } from '../provider/WebGLContextManagerContext';
import { WebGLContextManager } from '@cntrl-site/effects';
import { KeyframesContext } from '../provider/KeyframesContext';
import { Keyframes } from '../provider/Keyframes';
import { KeyframeAny } from '../../sdk/types/keyframe/Keyframe';
import { FixedSectionLayersWrapper } from './FixedSectionLayersWrapper/FixedSectionLayersWrapper';

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
  const articleRef = useRef<HTMLDivElement | null>(null);
  const articleRectObserver = useArticleRectObserver(articleRef.current);
  const id = useId();
  const [articleHeight, setArticleHeight] = useState(1);
  const keyframesRepo = useMemo(() => new Keyframes(keyframes), [keyframes]);

  useEffect(() => {
    if (!articleRectObserver) return;
    return articleRectObserver.on('resize', (rect) => {
      setArticleHeight(rect.height / rect.width);
    });
  }, [articleRectObserver]);

  const webglContextManager = useMemo(() => new WebGLContextManager(), []);

  return (
    <ArticleRectContext.Provider value={articleRectObserver}>
      <InteractionsProvider article={article}>
        <KeyframesContext.Provider value={keyframesRepo}>
          <WebglContextManagerContext.Provider value={webglContextManager}>
            <FixedSectionLayersWrapper styles={styles}>
              {article.fixedSections.flatMap((section) => {
                return section.items.map(item => (
                  <Item
                    item={item}
                    key={item.id}
                    sectionId={section.id}
                    articleHeight={articleHeight}
                  />
                ))
              })}
            </FixedSectionLayersWrapper>
            <Scene id={article.id} styles={styles}>
              <div className="article" ref={articleRef}>
                {article.scrollableSections.map((section) => {
                  const data = {};
                  return (
                    <Section
                      section={section}
                      key={section.id}
                      data={data}
                    >
                      {section.items.map(item => (
                        <Item
                          item={item}
                          key={item.id}
                          sectionId={section.id}
                          articleHeight={articleHeight}
                        />
                      ))}
                    </Section>
                  );
                })}
              </div>
            </Scene>
          </WebglContextManagerContext.Provider>
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
