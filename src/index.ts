// SDK
export { Client as CntrlClient } from './sdk/Client/Client';
export { FontFaceGenerator } from './sdk/FontFaceGenerator/FontFaceGenerator';
export { ScrollPlaybackVideoManager } from './sdk/ScrollPlaybackVideoManager/ScrollPlaybackVideoManager';

// enums
export { SectionHeightMode } from './sdk/types/article/Section';
export { TextAlign, TextDecoration, TextTransform, VerticalAlign } from './sdk/types/article/RichText';
export { ArticleItemType } from './sdk/types/article/ArticleItemType';
export { AreaAnchor, AnchorSide, DimensionMode, PositionType } from './sdk/types/article/ItemArea';
export { KeyframeType } from './sdk/types/keyframe/Keyframe';

// types
export type { Article } from './sdk/types/article/Article';
export type { Section, SectionHeight } from './sdk/types/article/Section';
export type {
  Item, ImageItem, ItemAny, CustomItem, ItemParamsMap, RectangleItem, StickyParams, VideoItem, RichTextItem,
  Link, VimeoEmbedItem, YoutubeEmbedItem, GroupItem, CodeEmbedItem, CompoundItem, ComponentItem, FillLayer
} from './sdk/types/article/Item';
export type { RichTextBlock, RichTextEntity, RichTextStyle } from './sdk/types/article/RichText';
export type { ItemArea } from './sdk/types/article/ItemArea';
export type { ItemState, ItemStateParams, StateParams, ItemStatesMap } from './sdk/types/article/ItemState';
export type { Interaction, InteractionItemTrigger, InteractionScrollTrigger, InteractionState } from './sdk/types/article/Interaction';
export type { Project } from './sdk/types/project/Project';
export type { Meta } from './sdk/types/project/Meta';
export type { KeyframeValueMap, KeyframeAny } from './sdk/types/keyframe/Keyframe';
export type { CompoundSettings } from './sdk/types/article/CompoundSettings';
// SDK nextjs
import { cntrlSdkContext as sdk } from './sdk-nextjs/provider/defaultContext';
export { RichTextConverter } from './sdk-nextjs/utils/RichTextConverter/RichTextConverter';
export { Page } from './sdk-nextjs/components/Page';
export type { PageProps } from './sdk-nextjs/components/Page';
export { CNTRLHead as Head } from './sdk-nextjs/components/Head';

export { CntrlProvider } from './sdk-nextjs/provider/CntrlProvider';
export type { CustomItemComponent } from './sdk-nextjs/provider/CustomItemTypes';
export { useCntrlContext } from './sdk-nextjs/provider/useCntrlContext';
export const customItems = sdk.customItems;
export const customSections = sdk.customSections;
export const cntrlSdkContext = sdk;
