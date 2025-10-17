import { useKeyframeValue } from '../../../common/useKeyframeValue';
import { KeyframeType } from '../../../../sdk/types/keyframe/Keyframe';
import { VimeoEmbedItem, YoutubeEmbedItem } from '../../../../sdk/types/article/Item';

export const useEmbedVideoItem = (item: VimeoEmbedItem | YoutubeEmbedItem, sectionId: string) => {
  const radius = useKeyframeValue(
    item,
    KeyframeType.BorderRadius,
    (item) => 'radius' in item.params ? item.params.radius : 0,
    (animator, scroll, value) => animator.getRadius({ radius: value }, scroll).radius,
    sectionId
  );
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

  return { radius, blur, opacity };
};
