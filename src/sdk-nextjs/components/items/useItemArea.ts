import { useKeyframeValue } from '../../common/useKeyframeValue';
import { ItemAny } from '../../../sdk/types/article/Item';
import { KeyframeType } from '../../../sdk/types/keyframe/Keyframe';

export function useItemArea(
  item: ItemAny,
  sectionId: string,
  stateValues: { top?: number; left?: number; width?: number; height?: number }
) {
  const position = useKeyframeValue<{ top: number; left: number }>(
    item,
    KeyframeType.Position,
    (item) => item.area,
    (animator, scroll, value) => animator.getPositions(value, scroll),
    sectionId
  );
  const dimensions = useKeyframeValue<{ width: number; height: number }>(
    item,
    KeyframeType.Dimensions,
    (item) => item.area,
    (animator, scroll, value) => animator.getDimensions(value, scroll),
    sectionId
  );
  const width = (stateValues.width ?? dimensions?.width) as number;
  const height = (stateValues.height ?? dimensions?.height) as number;
  const top = (stateValues.top ?? position?.top) as number;
  const left = (stateValues.left ?? position?.left) as number;
  return { width, height, top, left };
}
