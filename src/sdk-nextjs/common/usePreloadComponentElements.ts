import { useEffect } from 'react';
import { hasComponentElement, loadComponentElement } from '@gxpl/components/elements';
import { Article } from '../../sdk/types/article/Article';
import { ComponentItem, ItemAny } from '../../sdk/types/article/Item';
import { ArticleItemType } from '../../sdk/types/article/ArticleItemType';

// Only the start scene is prerendered; the others mount when a transition starts. Fetch their
// component chunks after hydration so an incoming scene doesn't show empty components mid-transition.
export function usePreloadComponentElements(articles: Article[]) {
  useEffect(() => {
    const ids = new Set<string>();
    const visit = (items: ItemAny[] | undefined) => {
      for (const item of items ?? []) {
        if (item.type === ArticleItemType.Component) ids.add((item as ComponentItem).params.componentId);
        visit(item.items);
      }
    };
    for (const article of articles) {
      for (const section of article.sections) visit(section.items);
    }
    for (const id of ids) {
      if (hasComponentElement(id)) loadComponentElement(id).catch(() => undefined);
    }
  }, [articles]);
}
