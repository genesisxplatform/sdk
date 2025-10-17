import { useKeyframeValue } from '../../../common/useKeyframeValue';
import { CodeEmbedItem } from '../../../../sdk/types/article/Item';
import { KeyframeType } from '../../../../sdk/types/keyframe/Keyframe';
import { AreaAnchor } from '../../../../sdk/types/article/ItemArea';

export function useCodeEmbedItem(item: CodeEmbedItem, sectionId: string) {

  const blur = useKeyframeValue(
    item,
    KeyframeType.Blur,
    (item) => 'blur' in item.params ? item.params.blur : 0,
    (animator, scroll, value) => animator.getBlur({ blur: value }, scroll).blur,
    sectionId
  );

  const opacity = useKeyframeValue(
    item,
    KeyframeType.Opacity,
    (item) => 'opacity' in item.params ? item.params.opacity : 1,
    (animator, scroll, value) => animator.getOpacity({ opacity: value }, scroll).opacity,
    sectionId
  );

  return { blur, opacity };
}
