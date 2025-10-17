import { RichTextBlock, RichTextStyle, TextAlign, TextTransform, VerticalAlign } from './RichText';
import { ArticleItemType } from './ArticleItemType';
import { AreaAnchor, ItemArea } from './ItemArea';
import { ItemState } from './ItemState';
import { FXControlAny, FXCursor } from './FX';
import { CompoundSettings } from './CompoundSettings';

export type ItemAny = Item<ArticleItemType>;

export interface Item<T extends ArticleItemType> {
  id: string;
  type: T;
  area: ItemArea;
  hidden: boolean;
  link?: Link;
  items?: T extends (ArticleItemType.Group | ArticleItemType.Compound) ? ItemAny[] : never;
  sticky: StickyParams | null;
  compoundSettings?: CompoundSettings;
  state: ItemState<T>;
  params: ItemParamsMap[T];
}

export interface ItemParamsMap {
  [ArticleItemType.Image]: ImageParams;
  [ArticleItemType.Video]: VideoParams;
  [ArticleItemType.RichText]: RichTextParams;
  [ArticleItemType.Rectangle]: RectangleParams;
  [ArticleItemType.VimeoEmbed]: VimeoEmbedParams;
  [ArticleItemType.YoutubeEmbed]: YoutubeEmbedParams;
  [ArticleItemType.Custom]: CustomParams;
  [ArticleItemType.Group]: GroupParams;
  [ArticleItemType.Compound]: CompoundParams;
  [ArticleItemType.CodeEmbed]: CodeEmbedParams;
  [ArticleItemType.Component]: ComponentParams;
}

interface ParamsBase {
  pointerEvents?: 'never' | 'when_visible' | 'always';
}

interface ImageParams extends MediaParams {}

interface MediaParams extends ParamsBase {
  url: string;
  hasGLEffect?: boolean;
  fragmentShader: string | null;
  FXControls?: FXControlAny[];
  opacity: number;
  radius: number;
  strokeWidth: number;
  strokeFill: FillLayer[];
  blur: number;
  isDraggable?: boolean;
}

interface VideoParams extends MediaParams {
  coverUrl: string | null;
  play: 'on-hover' | 'on-click' | 'auto';
  muted: boolean;
  controls: boolean;
  scrollPlayback: ScrollPlaybackParams | null;
}

interface RichTextParams extends ParamsBase {
  text: string;
  blocks?: RichTextBlock[];
  rangeStyles?: RichTextStyle[];
  textAlign: TextAlign;
  sizing: string;
  blur: number;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  textTransform: TextTransform;
  verticalAlign: VerticalAlign;
  color: string;
  typeFace: string;
  fontStyle: string;
  fontWeight: number;
  fontVariant: string;
  isDraggable?: boolean;
}

interface RectangleParams extends ParamsBase {
  ratioLock: boolean;
  radius: number;
  strokeWidth: number;
  fill: FillLayer[];
  strokeFill: FillLayer[];
  blur: number;
  backdropBlur: number;
  blurMode: 'default' | 'backdrop';
  isDraggable?: boolean;
}

interface CustomParams extends ParamsBase {
  name: string;
  isDraggable?: boolean;
}

interface GroupParams extends ParamsBase {
  opacity: number;
  blur: number;
  isDraggable?: boolean;
}

interface CompoundParams extends ParamsBase {
  overflow: 'hidden' | 'visible';
  opacity: number;
  isDraggable?: boolean;
}

interface CodeEmbedParams extends ParamsBase {
  html: string;
  scale: boolean;
  iframe: boolean;
  areaAnchor: AreaAnchor;
  opacity: number;
  blur: number;
  isDraggable?: boolean;
}

interface VimeoEmbedParams extends ParamsBase {
  url: string;
  coverUrl: string | null;
  play: 'on-hover' | 'on-click' | 'auto';
  controls: boolean;
  loop: boolean;
  muted: boolean;
  pictureInPicture: boolean;
  radius: number;
  blur: number;
  opacity: number;
}

interface YoutubeEmbedParams extends ParamsBase {
  url: string;
  coverUrl: string | null;
  play: 'on-hover' | 'on-click' | 'auto';
  controls: boolean;
  loop: boolean;
  radius: number;
  blur: number;
  opacity: number;
}

interface ComponentParams extends ParamsBase {
  componentId: string;
  content?: any;
  parameters?: any;
  opacity: number;
  blur: number;
}

export type FillLayer = SolidFillLayer | LinearGradientFillLayer | RadialGradientFillLayer | ConicGradientFillLayer | ImageLayer;

type ColorPoint = {
  id: string;
  value: string;
  position: number;
}

export type SolidFillLayer = {
  id: string;
  type: 'solid';
  value: string;
  blendMode: string;
};

export type LinearGradientFillLayer = {
  id: string;
  type: 'linear-gradient';
  colors: ColorPoint[];
  start: [number, number];
  end: [number, number];
  angle: number;
  blendMode: string;
};

export type RadialGradientFillLayer = {
  id: string;
  type: 'radial-gradient';
  colors: ColorPoint[];
  diameter: number;
  center: [number, number];
  angle: number;
  blendMode: string;
};

export type ConicGradientFillLayer = {
  id: string;
  type: 'conic-gradient';
  colors: ColorPoint[];
  center: [number, number];
  angle: number;
  blendMode: string;
};

export type ImageLayer = {
  id: string;
  type: 'image';
  src: string;
  behavior: string;
  backgroundSize: number;
  opacity: number;
  blendMode: string;
  rotation?: number;
};
export interface ScrollPlaybackParams {
  from: number;
  to: number;
}

export interface StickyParams {
  from: number;
  to?: number;
}

export interface Link {
  url: string;
  target: string;
}

export type VideoItem = Item<ArticleItemType.Video>;
export type RectangleItem = Item<ArticleItemType.Rectangle>;
export type ImageItem = Item<ArticleItemType.Image>;
export type RichTextItem = Item<ArticleItemType.RichText>;
export type VimeoEmbedItem = Item<ArticleItemType.VimeoEmbed>;
export type YoutubeEmbedItem = Item<ArticleItemType.YoutubeEmbed>;
export type CustomItem = Item<ArticleItemType.Custom>;
export type GroupItem = Item<ArticleItemType.Group>;
export type CodeEmbedItem = Item<ArticleItemType.CodeEmbed>;
export type CompoundItem = Item<ArticleItemType.Compound>;
export type ComponentItem = Item<ArticleItemType.Component>;
