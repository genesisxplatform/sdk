import { Fonts } from './Fonts';
import { Meta } from './Meta';
import { Page } from './Page';

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
}
