import { Section } from './Section';
import { Interaction } from './Interaction';

export interface Article {
  id: string;
  scrollableSections: Section[];
  fixedSections: Section[];
  interactions: Interaction[];
}
