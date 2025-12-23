import { Relation } from './Relation';
import { Fonts } from './Fonts';
import { Meta } from './Meta';
import { Page } from './Page';
import { TFixedLayer } from './FixedLayer';

export interface AdditionalHTML {
  head: string;
  afterBodyOpen: string;
  beforeBodyClose: string;
}

export interface Project {
  id: string;
  html: AdditionalHTML;
  meta: Meta;
  exemplary: number;
  pages: Page[];
  fonts: Fonts;
  relations: Relation[];
  scenesAssets: { url: string, id: string }[];
  foreground: TFixedLayer;
  background: TFixedLayer;
}
