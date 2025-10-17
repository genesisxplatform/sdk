import { ItemAny } from '../../../sdk/types/article/Item';
import { KeyframeType } from '../../../sdk/types/keyframe/Keyframe';
import { useKeyframeValue } from '../../common/useKeyframeValue';

  export function useStickyItemTop(item: ItemAny, sectionId: string, stateTop?: number) {
  const data = useKeyframeValue<{ top: number; left: number }>(
    item,
    KeyframeType.Position,
    (item) => item.area,
    (animator, scroll, value) => animator.getPositions(value, scroll),
    sectionId
  );
  const top = data.top;
  const sticky = item.sticky;
  return sticky ? (stateTop ?? top) - sticky.from : 0;
}
