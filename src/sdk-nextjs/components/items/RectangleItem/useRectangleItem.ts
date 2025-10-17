import { FillLayer, RectangleItem } from '../../../../sdk/types/article/Item';
import { KeyframeType } from '../../../../sdk/types/keyframe/Keyframe';
import { useKeyframeValue } from '../../../common/useKeyframeValue';

const defaultFill = [
  {
    id: 'default',
    type: 'solid' as const,
    value: 'rgba(0, 0, 0, 1)',
    blendMode: 'normal'
  }
];

export function useRectangleItem(item: RectangleItem, sectionId: string) {
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
  const fill = useKeyframeValue<FillLayer[]>(
    item,
    KeyframeType.Fill,
    (item) => 'fill' in item.params ? item.params.fill : defaultFill,
    (animator, scroll, value) => animator.getFill(value, scroll),
    sectionId
  );
  const strokeFill = useKeyframeValue<FillLayer[]>(
    item,
    KeyframeType.BorderFill,
    (item) => 'strokeFill' in item.params ? item.params.strokeFill : defaultFill,
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
  const backdropBlur = useKeyframeValue<number>(
    item,
    KeyframeType.BackdropBlur,
    (item) => 'backdropBlur' in item.params ? item.params.backdropBlur : 0,
    (animator, scroll, value) => animator.getBackdropBlur({ backdropBlur: value }, scroll).backdropBlur,
    sectionId
  );
  return { fill, strokeWidth, radius, strokeFill, blur, backdropBlur };
}
