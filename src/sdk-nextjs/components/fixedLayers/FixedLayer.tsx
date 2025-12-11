import { FC, useId, useMemo, useRef } from 'react';
import { TFixedLayer } from '../../../sdk/types/project/FixedLayer';
import { ArticleRectContext } from '../../provider/ArticleRectContext';
import { useArticleRectObserver } from '../../utils/ArticleRectManager/useArticleRectObserver';
import { WebglContextManagerContext } from '../../provider/WebGLContextManagerContext';
import { WebGLContextManager } from '@cntrl-site/effects';
import JSXStyle from 'styled-jsx/style';
import { Item } from '../items/Item';
import { FixedLayerTransitionsProvider } from '../../fixedLayers/FixedLayerTransitionsProvider';

interface Props {
  layer: TFixedLayer;
  type: 'background' | 'foreground';
}

export const FixedLayer: FC<Props> = ({ layer, type }) => {
  const fixedLayerRef = useRef<HTMLDivElement | null>(null);
  const id = useId();
  const articleRectObserver = useArticleRectObserver(fixedLayerRef.current);
  const webglContextManager = useMemo(() => new WebGLContextManager(), []);
  return (
    <ArticleRectContext.Provider value={articleRectObserver}>
      <FixedLayerTransitionsProvider fixedLayer={layer}>
        <WebglContextManagerContext.Provider value={webglContextManager}>
          <div className={`fixed-layer-${type}`} ref={fixedLayerRef}>
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