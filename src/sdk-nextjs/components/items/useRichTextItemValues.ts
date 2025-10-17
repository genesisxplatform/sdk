import { RichTextItem } from '../../../sdk/types/article/Item';
import { KeyframeType } from '../../../sdk/types/keyframe/Keyframe';
import { useKeyframeValue } from '../../common/useKeyframeValue';

const DEFAULT_COLOR = 'rgba(0, 0, 0, 1)';

export const useRichTextItemValues = (item: RichTextItem, sectionId: string) => {
  const blur = useKeyframeValue<number>(
    item,
    KeyframeType.Blur,
    (item) => 'blur' in item.params ? item.params.blur : 0,
    (animator, scroll, value) => animator.getBlur({ blur: value }, scroll).blur,
    sectionId
  );

  const letterSpacing = useKeyframeValue<number>(
    item,
    KeyframeType.LetterSpacing,
    (item) => 'letterSpacing' in item.params ? item.params.letterSpacing : 0,
    (animator, scroll, value) => animator.getLetterSpacing({ letterSpacing: value }, scroll).letterSpacing,
    sectionId
  );

  const wordSpacing = useKeyframeValue<number>(
    item,
    KeyframeType.WordSpacing,
    (item) => 'wordSpacing' in item.params ? item.params.wordSpacing : 0,
    (animator, scroll, value) => animator.getWordSpacing({ wordSpacing: value }, scroll).wordSpacing,
    sectionId
  );

  const color = useKeyframeValue<string>(
    item,
    KeyframeType.TextColor,
    (item) => 'color' in item.params ? item.params.color : DEFAULT_COLOR,
    (animator, scroll, value) => animator.getTextColor({ color: value }, scroll).color,
    sectionId
  );

  const fontSize = item.params.fontSize;
  const lineHeight = item.params.lineHeight;

  return { blur, letterSpacing, wordSpacing, color, fontSize, lineHeight };
};
