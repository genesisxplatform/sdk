import { ItemAny } from '../../../sdk/types/article/Item';
import { KeyframeType } from '../../../sdk/types/keyframe/Keyframe';
import { useKeyframeValue } from '../../common/useKeyframeValue';

export const useItemScale = (item: ItemAny, sectionId: string) => {
  const scale = useKeyframeValue<number>(
    item,
    KeyframeType.Scale,
    (item) => item.area.scale,
    (animator, scroll, value) => animator.getScale({ scale: value }, scroll).scale,
    sectionId
  );

  return scale;
};
