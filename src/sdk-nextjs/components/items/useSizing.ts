import { ArticleItemType } from '../../../sdk/types/article/ArticleItemType';
import { ItemAny } from '../../../sdk/types/article/Item';
import { isItemType } from '../../utils/isItemType';

export function useSizing(item: ItemAny) {
  const sizing = isItemType(item, ArticleItemType.RichText)
    ? item.params.sizing
    : undefined;
  const sizingAxis = parseSizing(sizing);
  return sizingAxis;
}

export function parseSizing(sizing: string = 'manual'): Axis {
  const axisSizing = sizing.split(' ');
  return {
    y: axisSizing[0],
    x: axisSizing[1] ? axisSizing[1] : axisSizing[0]
  } as Axis;
}

interface Axis {
  x: 'manual' | 'auto';
  y: 'manual' | 'auto';
}
