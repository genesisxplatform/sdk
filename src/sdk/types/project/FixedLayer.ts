import { Interaction } from '../article/Interaction';
import { ItemAny } from '../article/Item';
import { SectionMedia } from '../article/Section';

type ItemIdentifier = string;
type PropertyName = string;

export type TransitionTiming = {
  timing: string;
  duration: number;
  delay: number;
};

export type FixedLayerTransition = {
  from: string;
  to: string;
  itemsTransitions: Record<ItemIdentifier, Record<PropertyName, TransitionTiming>>;
  id: string;
};

export interface TFixedLayer {
  id: string;
  name?: string;
  hidden: boolean;
  items: ItemAny[];
  color: string | null;
  media?: SectionMedia;
  transitions: FixedLayerTransition[];
  interactions: Interaction[];
}
