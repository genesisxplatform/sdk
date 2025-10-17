import { useKeyframeValue } from '../../../common/useKeyframeValue';
import { ComponentItem } from '../../../../sdk/types/article/Item';
import { KeyframeType } from '../../../../sdk/types/keyframe/Keyframe';

export function useComponentItem(item: ComponentItem, sectionId: string) {
  const opacity = useKeyframeValue(
    item,
    KeyframeType.Opacity,
    (item) => 'opacity' in item.params ? item.params.opacity : 1,
    (animator, scroll, value) => animator.getOpacity({ opacity: value }, scroll).opacity,
    sectionId
  );
  const blur = useKeyframeValue(
    item,
    KeyframeType.Blur,
    (item) => 'blur' in item.params ? item.params.blur : 0,
    (animator, scroll, value) => animator.getBlur({ blur: value }, scroll).blur,
    sectionId
  );
  return {
    opacity,
    blur
  };
}
