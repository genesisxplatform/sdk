import { FC, useEffect, useId, useMemo, useState } from 'react';
import { CntrlColor } from '@cntrl-site/color';
import { RichTextItem as TRichTextItem } from '../../../../sdk/types/article/Item';
import JSXStyle from 'styled-jsx/style';
import { ItemProps } from '../Item';
import { useRichTextItem } from './useRichTextItem';
import { useRichTextItemValues } from '../useRichTextItemValues';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { getFontFamilyValue } from '../../../utils/getFontFamilyValue';
import { useExemplary } from '../../../common/useExemplary';
import { useItemAngle } from '../useItemAngle';
import { getStyleFromItemStateAndParams } from '../../../utils/getStyleFromItemStateAndParams';

export const RichTextItem: FC<ItemProps<TRichTextItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const itemAngle = useItemAngle(item, sectionId);
  const {
    blur: itemBlur,
    wordSpacing: itemWordSpacing,
    letterSpacing: itemLetterSpacing,
    color: itemColor,
    fontSize,
    lineHeight
  } = useRichTextItemValues(item, sectionId);
  const exemplary = useExemplary();
  useRegisterResize(ref, onResize);
  const stateParams = interactionCtrl?.getState<number | string>(['angle', 'blur', 'letterSpacing', 'wordSpacing', 'color']);
  const stateStyles = stateParams?.styles ?? {};
  const transition = stateParams?.transition ?? 'none';
  const textColor = useMemo(() => {
    const color = getStyleFromItemStateAndParams(stateParams?.styles?.color as string, itemColor);
    return color ? CntrlColor.parse(color) : undefined;
  }, [itemColor, stateStyles.color]);
  const angle = getStyleFromItemStateAndParams(stateStyles.angle, itemAngle);
  const blur = getStyleFromItemStateAndParams(stateStyles.blur, itemBlur);
  const letterSpacing = getStyleFromItemStateAndParams(stateStyles.letterSpacing, itemLetterSpacing);
  const wordSpacing = getStyleFromItemStateAndParams(stateStyles.wordSpacing, itemWordSpacing);
  const colorAlpha = textColor?.getAlpha();
  const rangeStyles = item.params.rangeStyles ?? [];
  const rangeColors = rangeStyles.filter((style) => style.style === 'COLOR');
  const hasVisibleRangeColors = rangeColors.some((color) => {
    const alpha = CntrlColor.parse(color.value!).getAlpha();
    return alpha > 0;
  });
  const isInteractive = colorAlpha !== 0 || hasVisibleRangeColors;
  const [content, styles] = useRichTextItem(item);
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);
  const color = CntrlColor.parse(item.params.color);

  return (
    <>
      <div
        ref={setRef}
        className={`rich-text-wrapper-${item.id}`}
        style={{
          filter: `blur(${blur as number * 100}vw)` ,
          ...(textColor ? { color: `${textColor.fmt('rgba')}` } : {}),
          transform: `rotate(${angle}deg)`,
          letterSpacing: `${letterSpacing as number * exemplary}px`,
          wordSpacing: `${wordSpacing as number * exemplary}px`,
          fontSize: `${Math.round(fontSize * exemplary)}px`,
          lineHeight: `${lineHeight * exemplary}px`,
          willChange: blur !== 0 && blur !== undefined ? 'transform' : 'unset',
          transition
        }}
      >
        {content}
      </div>
      <JSXStyle id={id}>
        {styles}
        {`
          .rich-text-wrapper-${item.id} {
            font-size: ${item.params.fontSize * 100}vw;
            line-height: ${item.params.lineHeight * 100}vw;
            letter-spacing: ${item.params.letterSpacing * 100}vw;
            word-spacing: ${item.params.wordSpacing * 100}vw;
            font-family: ${getFontFamilyValue(item.params.typeFace)};
            font-weight: ${item.params.fontWeight};
            font-style: ${item.params.fontStyle ? item.params.fontStyle : 'normal'};
            vertical-align: ${item.params.verticalAlign};
            font-variant: ${item.params.fontVariant};
            color: ${color.fmt('rgba')};
            transform: rotate(${item.area.angle}deg);
            filter: ${item.params.blur !== 0 ? `blur(${item.params.blur * 100}vw)` : 'unset'};
            text-transform: ${item.params.textTransform};
            ${item.params.blur !== 0 ? 'will-change: transform;' : ''}
          }
          @supports not (color: oklch(42% 0.3 90 / 1)) {
            .rich-text-wrapper-${item.id} {
              color: ${color.fmt('rgba')};
            }
          }
        `}
      </JSXStyle>
    </>
  );
};
