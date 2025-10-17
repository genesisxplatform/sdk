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

export interface Section {
  id: string;
  name?: string;
  height: SectionHeight;
  hidden: boolean;
  items: ItemAny[];
  color: string | null;
  media?: SectionMedia;
}
