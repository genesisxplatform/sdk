import { ItemAny } from '../../../sdk/types/article/Item';
import { KeyframeType } from '../../../sdk/types/keyframe/Keyframe';
import { useKeyframeValue } from '../../common/useKeyframeValue';

export const useItemAngle = (item: ItemAny, sectionId: string) => {
  const angle = useKeyframeValue(
    item,
    KeyframeType.Rotation,
    (item) => item.area.angle,
    (animator, scroll, value) => animator.getRotation({ angle: value }, scroll).angle,
    sectionId
  );
  return angle;
};
