import { FillLayer, ImageItem, VideoItem } from '../../../../sdk/types/article/Item';
import { KeyframeType } from '../../../../sdk/types/keyframe/Keyframe';
import { useKeyframeValue } from '../../../common/useKeyframeValue';

const DEFAULT_FILL = [
  {
    id: 'default',
    type: 'solid' as const,
    value: 'rgba(0, 0, 0, 1)',
    blendMode: 'normal'
  }
];

export function useFileItem(item: ImageItem | VideoItem, sectionId: string) {
  const radius = useKeyframeValue<number>(
    item,
    KeyframeType.BorderRadius,
    (item) => 'radius' in item.params ? item.params.radius : 0,
    (animator, scroll, value) => animator.getRadius({ radius: value }, scroll).radius,
    sectionId
  );
  const strokeWidth = useKeyframeValue<number>(
    item,
    KeyframeType.BorderWidth,
    (item) => 'strokeWidth' in item.params ? item.params.strokeWidth : 0,
    (animator, scroll, value) => animator.getBorderWidth({ borderWidth: value }, scroll).borderWidth,
    sectionId
  );

  const opacity = useKeyframeValue<number>(
    item,
    KeyframeType.Opacity,
    (item) => 'opacity' in item.params ? item.params.opacity : 1,
    (animator, scroll, value) => animator.getOpacity({ opacity: value }, scroll).opacity,
    sectionId
  );

  const strokeFill = useKeyframeValue<FillLayer[]>(
    item,
    KeyframeType.BorderFill,
    (item) => 'strokeFill' in item.params ? item.params.strokeFill : DEFAULT_FILL,
    (animator, scroll, value) => animator.getBorderFill(value, scroll),
    sectionId
  );

  const blur = useKeyframeValue<number>(
    item,
    KeyframeType.Blur,
    (item) => 'blur' in item.params ? item.params.blur : 0,
    (animator, scroll, value) => animator.getBlur({ blur: value }, scroll).blur,
    sectionId
  );

  return { radius, strokeWidth, opacity, strokeFill, blur };
}
