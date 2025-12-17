import { CSSProperties, FC, useEffect, useId, useMemo, useRef, useState } from 'react';
import { TFixedLayer } from '../../../sdk/types/project/FixedLayer';
import { ArticleRectContext } from '../../provider/ArticleRectContext';
import { WebglContextManagerContext } from '../../provider/WebGLContextManagerContext';
import { WebGLContextManager } from '@cntrl-site/effects';
import JSXStyle from 'styled-jsx/style';
import { Item } from '../items/Item';
import { FixedLayerTransitionsProvider } from '../../fixedLayers/FixedLayerTransitionsProvider';
import { useCntrlContext } from '../../provider/useCntrlContext';
import { ArticleRectObserver } from '../../utils/ArticleRectManager/ArticleRectObserver';
import { useArticleRectObserver } from '../../utils/ArticleRectManager/useArticleRectObserver';

interface Props {
  layer: TFixedLayer;
  type: 'background' | 'foreground';
}

export const FixedLayer: FC<Props> = ({ layer, type }) => {
  const [fixedLayerRef, setFixedLayerRef] = useState<HTMLDivElement | null>(null);
  const { exemplary } = useCntrlContext();
  const id = useId();
  const [deviation, setDeviation] = useState(1);
  const articleRectObserver = useArticleRectObserver();
  const webglContextManager = useMemo(() => new WebGLContextManager(), []);

  useEffect(() => {
    if (!fixedLayerRef) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry.contentRect.width !== 0) {
        setDeviation(entry.contentRect.width / exemplary);
      }
    });
    observer.observe(fixedLayerRef);
    return () => observer.unobserve(fixedLayerRef);
  }, [fixedLayerRef, exemplary]);

  const layoutDeviationStyle = { '--layout-deviation': deviation } as CSSProperties;
  return (
    <ArticleRectContext.Provider value={articleRectObserver}>
      <FixedLayerTransitionsProvider fixedLayer={layer}>
        <WebglContextManagerContext.Provider value={webglContextManager}>
          <div
            className={`fixed-layer-${type}`}
            ref={setFixedLayerRef}
            style={layoutDeviationStyle}
          >
              {layer.items.map(item => (
                <Item
                  isInFixedLayer={true}
                  item={item}
                  key={item.id}
                  sectionId={layer.id}
                />
              ))}
          </div>
          <JSXStyle id={id}>{`
          .fixed-layer-${type} {
            position: fixed;
            top: 0;
            pointer-events: none;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: clip;
            ${type === 'foreground' ? 'z-index: 1;' : 'z-index: -1;'}
          }
        `}</JSXStyle>
        </WebglContextManagerContext.Provider>
      </FixedLayerTransitionsProvider>
    </ArticleRectContext.Provider >
  );
};
