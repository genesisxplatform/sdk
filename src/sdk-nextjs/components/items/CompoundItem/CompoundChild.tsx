import React, {
  FC,
  useEffect,
  useId,
  useRef,
} from 'react';
import { useExemplary } from '../../../common/useExemplary';
import { useItemScale } from '../useItemScale';
import { useItemInteractionCtrl } from '../../../interactions/useItemInteractionCtrl';
import JSXStyle from 'styled-jsx/style';
import { ScaleAnchorMap } from '../../../utils/ScaleAnchorMap';
import { isItemType } from '../../../utils/isItemType';
import { RichTextWrapper } from '../RichTextWrapper';
import { itemsMap } from '../itemsMap';
import {
  getCompoundHeight,
  getCompoundLeft,
  getCompoundTop,
  getCompoundTransform,
  getCompoundWidth
} from '../../../utils/getCompoundBoundaryStyles';
import { useItemTriggers } from '../useItemTriggers';
import { parseSizing, useSizing } from '../useSizing';
import { useItemPointerEvents } from '../useItemPointerEvents';
import { useItemArea } from '../useItemArea';
import { ArticleItemType } from '../../../../sdk/types/article/ArticleItemType';
import { ItemAny } from '../../../../sdk/types/article/Item';
import { AreaAnchor } from '../../../../sdk/types/article/ItemArea';

interface ChildItemProps {
  item: ItemAny;
  sectionId: string;
  isParentVisible?: boolean;
}

const noop = () => null;

export const CompoundChild: FC<ChildItemProps> = ({ item, sectionId, isParentVisible = true }) => {
  const id = useId();
  const exemplary = useExemplary();
  const { handleVisibilityChange, allowPointerEvents } = useItemPointerEvents(
    item.params?.pointerEvents ?? 'when_visible',
    isParentVisible
  );
  const itemScale = useItemScale(item, sectionId);
  const interactionCtrl = useItemInteractionCtrl(item.id);
  const triggers = useItemTriggers(interactionCtrl);
  const wrapperStateProps = interactionCtrl?.getState<number>(['top', 'left', 'width', 'height']);
  const innerStateProps = interactionCtrl?.getState<number>(['scale']);
  const compoundSettings = item.compoundSettings;
  const { width, height, top, left } = useItemArea(item, sectionId, {
    top: wrapperStateProps?.styles?.top as number,
    left: wrapperStateProps?.styles?.left as number,
    width: wrapperStateProps?.styles?.width as number,
    height: wrapperStateProps?.styles?.height as number
  });
  const isInitialRef = useRef(true);
  const sizingAxis = useSizing(item);
  const ItemComponent = itemsMap[item.type] || noop;

  useEffect(() => {
    isInitialRef.current = false;
  }, []);

  const transformOrigin = compoundSettings ? ScaleAnchorMap[compoundSettings.positionAnchor] : 'top left';
  const isRichText = isItemType(item, ArticleItemType.RichText);
  const scale = innerStateProps?.styles?.scale ?? itemScale;
  const hasClickTriggers = interactionCtrl?.getHasTrigger(item.id, 'click') ?? false;
  const scaleAnchor = item.area.scaleAnchor as AreaAnchor;
  if (!compoundSettings) return null;
  return (
    <div
      className={`item-${item.id}`}
      onTransitionEnd={(e) => {
        e.stopPropagation();
        interactionCtrl?.handleTransitionEnd?.(e.propertyName);
      }}
      style={{
        top: getCompoundTop(compoundSettings, top),
        left: getCompoundLeft(compoundSettings, left),
        width: `${sizingAxis.x === 'manual'
          ? getCompoundWidth(compoundSettings, width, isRichText, exemplary)
          : 'max-content'}`,
        height: `${sizingAxis.y === 'manual'
          ? getCompoundHeight(compoundSettings, height)
          : 'unset'}`,
        transform: `${getCompoundTransform(compoundSettings)}`,
        transition: wrapperStateProps?.transition ?? 'none',
        cursor: hasClickTriggers ? 'pointer' : 'unset',
        pointerEvents: allowPointerEvents ? 'auto' : 'none'
      }}
      {...triggers}
    >
      <div
        className={`item-${item.id}-inner`}
        style={{
          transition: innerStateProps?.transition ?? 'none',
          transform: `scale(${scale})`,
        }}
      >
        <RichTextWrapper isRichText={isRichText} transformOrigin={transformOrigin}>
          <ItemComponent
            item={item}
            sectionId={sectionId}
            interactionCtrl={interactionCtrl}
            onVisibilityChange={handleVisibilityChange}
            isInCompound
          />
        </RichTextWrapper>
      </div>
      <JSXStyle id={id}>{`
        .item-${item.id}-inner {
          width: 100%;
          height: 100%;
          transform-origin: ${ScaleAnchorMap[scaleAnchor]};
          transform: scale(${item.area.scale});
        }
        .item-${item.id} {
          position: absolute;
          top: ${getCompoundTop(compoundSettings, item.area.top)};
          left: ${getCompoundLeft(compoundSettings, item.area.left)};
          transition: opacity 0.2s linear 0.1s;
          display: ${item.hidden ? 'none' : 'block'};
          width: ${sizingAxis.x === 'manual'
            ? `${getCompoundWidth(compoundSettings, item.area.width, isRichText)}`
            : 'max-content'};
          height: ${sizingAxis.y === 'manual' ? `${getCompoundHeight(compoundSettings, item.area.height)}` : 'unset'};
          transform: ${getCompoundTransform(compoundSettings)};
          z-index: ${item.area.zIndex};
        }
      `}
      </JSXStyle>
    </div>
  );
};
