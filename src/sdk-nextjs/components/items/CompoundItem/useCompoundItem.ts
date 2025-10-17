import { useKeyframeValue } from '../../../common/useKeyframeValue';
import { CompoundItem } from '../../../../sdk/types/article/Item';
import { KeyframeType } from '../../../../sdk/types/keyframe/Keyframe';

export function useCompoundItem(item: CompoundItem, sectionId: string) {
  const opacity = useKeyframeValue(
    item,
    KeyframeType.Opacity,
    (item) => 'opacity' in item.params ? item.params.opacity : 1,
    (animator, scroll, value) => animator.getOpacity({ opacity: value }, scroll).opacity,
    sectionId
  );

  return { opacity };
}
