import { ItemAny } from './Item';

export enum SectionHeightMode {
  ControlUnits = 'control-units' ,
  ViewportHeightUnits = 'viewport-height-units'
}

export interface SectionHeight {
  mode: SectionHeightMode;
  units: number;
  vhUnits?: number;
}

export type SectionVideo = {
  url: string;
  size: string;
  type: 'video';
  play: 'on-click' | 'auto';
  position: string;
  coverUrl: string | null;
  offsetX: number | null;
};

export type SectionImage = {
  url: string;
  type: 'image';
  size: string;
  position: string;
  offsetX: number | null;
};

export type SectionMedia = SectionVideo | SectionImage;

/**
 * A variant value's own background (docs/dynamic-sites/03-page-contract.md). A key that is
 * absent means "as the base"; `media: null` means the value shows no media.
 */
export interface SectionVariant {
  value: string;
  color?: string | null;
  media?: SectionMedia | null;
}

export interface Section {
  id: string;
  name?: string;
  height: SectionHeight;
  hidden: boolean;
  items: ItemAny[];
  color: string | null;
  media?: SectionMedia;
  /** Only the values whose background differs from the base. */
  variants?: SectionVariant[];
}
