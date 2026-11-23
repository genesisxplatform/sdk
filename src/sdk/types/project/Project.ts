import { Relation } from './Relation';
import { Fonts } from './Fonts';
import { Meta } from './Meta';
import { Page } from './Page';
import { TFixedLayer } from './FixedLayer';
import { ItemVariant, ProjectVariants } from '../../variants/variants';

export interface AdditionalHTML {
  head: string;
  afterBodyOpen: string;
  beforeBodyClose: string;
}

export interface SceneAsset {
  url: string;
  id: string;
  articleId: string;
  /** Set when the asset belongs to the base or a copy of a swappable. */
  variant?: Pick<ItemVariant, 'value' | 'replacedBy'>;
}

export interface Project {
  id: string;
  html: AdditionalHTML;
  meta: Meta;
  exemplary: number;
  pages: Page[];
  fonts: Fonts;
  relations: Relation[];
  scenesAssets: SceneAsset[];
  variants?: ProjectVariants;
  foreground: TFixedLayer;
  background: TFixedLayer;
}
