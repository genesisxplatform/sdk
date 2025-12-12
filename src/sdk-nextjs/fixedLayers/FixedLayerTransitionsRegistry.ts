import { ArticleItemType } from '../../sdk/types/article/ArticleItemType';
import { Interaction, InteractionItemTrigger } from '../../sdk/types/article/Interaction';
import { ItemAny } from '../../sdk/types/article/Item';
import { FixedLayerTransition, TFixedLayer, TransitionTiming } from '../../sdk/types/project/FixedLayer';
import { InteractionsRegistryPort, ItemInteractionCtrl } from '../interactions/types';
import { isItemType } from '../utils/isItemType';

const defaultTransitionDetails: TransitionTiming = {
  timing: 'ease-in-out',
  duration: 300,
  delay: 0
};

export class FixedLayerTransitionsRegistry implements InteractionsRegistryPort {
  private items: ItemAny[];
  private ctrls: Map<ItemId, ItemInteractionCtrl> = new Map();
  private interactions: Interaction[];
  private transitions: FixedLayerTransition[];
  private activeSceneId: string;
  private activeTransition: FixedLayerTransition | undefined;
  private itemsStages: ItemStages;
  
  constructor(fixedLayer: TFixedLayer, startSceneId: string) {
    this.items = this.unpackItems(fixedLayer);
    const interactions = fixedLayer.interactions ?? [];
    this.interactions = interactions;
    this.transitions = fixedLayer.transitions ?? [];
    this.activeSceneId = startSceneId;
    this.itemsStages = this.getDefaultItemStages();
  }

  register(itemId: ItemId, ctrl: ItemInteractionCtrl) {
    this.ctrls.set(itemId, ctrl);
  }

  getStatePropsForItem(itemId: string) {
    const { items } = this;
    const item = items.find((item) => item.id === itemId)!;
    const itemStages = this.itemsStages.filter((stage) => stage.itemId === itemId);
    itemStages.sort((a, b) => a.updated - b.updated);
    const itemStyles: StateProps = {};
    for (const stage of itemStages) {
      if (stage.type === 'active') {
        const params = item.state[stage.sceneId!] ?? {};
        for (const [key, stateDetails] of Object.entries(params)) {
          itemStyles[key] = {
            value: stateDetails.value
          };
        }
      }
      if (stage.type === 'transitioning') {
        const activeStateId = stage.to;
        const params = item.state[activeStateId] ?? {};
        for (const [key, stateDetails] of Object.entries(params)) {
          const transitionDetails = this.getTransitionDetails(itemId, key);
          if (!transitionDetails) continue;
          itemStyles[key] = {
            value: stateDetails.value,
            transition: {
              timing: transitionDetails.timing,
              duration: transitionDetails.duration,
              delay: transitionDetails.delay
            }
          };
        }
      }
    }
    return itemStyles;
  }

  private getTransitionDetails(itemId: string, key: string): TransitionTiming {
    if (!this.activeTransition) return defaultTransitionDetails;
    this.activeTransition
    const itemTransitions = this.activeTransition.itemsTransitions[itemId];
    if (!itemTransitions) return defaultTransitionDetails;
    return itemTransitions[key] ?? defaultTransitionDetails;
  }

  getItemAvailableTriggers(itemId: string): Set<TriggerType> {
    return new Set();
  }

  private unpackItems(layer: TFixedLayer): ItemAny[] {
      const items = this.getNestedItems(layer.items);
    return items;
  }

  private getNestedItems(items: ItemAny[]): ItemAny[] {
    const allItems: ItemAny[] = [];
    for (const item of items) {
      if (isItemType(item, ArticleItemType.Group) || isItemType(item, ArticleItemType.Compound)) {
        const groupChildren = item?.items ?? [];
        const nestedItems = this.getNestedItems(groupChildren);
        allItems.push(...nestedItems);
      }
      allItems.push(item);
    }
    return allItems;
  }

  private getDefaultItemStages(): ItemStages {
    const timestamp = Date.now();
    const { items } = this;
    const stages: ItemStages = [];
    for (const item of items) {
      const itemStatesMap = item.state;
      if (!itemStatesMap) continue;
      const itemSceneState = item.state[this.activeSceneId];
      if (!itemSceneState) continue;
        stages.push({
          itemId: item.id,
          type: 'active',
          sceneId: this.activeSceneId,
          updated: timestamp
        });
    }
    return stages;
  }

  notifyItemTrigger(itemId: string, triggerType: TriggerType): void {
    throw new Error('Not implemented');
  }

  notifyOnActiveSceneChange(sceneId: SceneId) {
    this.itemsStages = this.itemsStages.map((stage) => {
      return {
        itemId: stage.itemId,
        type: 'transitioning',
        from: this.activeSceneId,
        to: sceneId,
        updated: Date.now()
      };
    });
    const items = this.itemsStages.map((stage) => stage.itemId);
    this.notifyItemCtrlsChange(items);
    this.notifyTransitionStartForItems(sceneId);
    this.activeSceneId = sceneId;
  }

  notifyPrepareTransition(to: SceneId) {
    this.activeTransition = this.transitions.find((transition) => transition.to === to && transition.from === this.activeSceneId);
  }

  notifyTransitionStartForItems(activeStateId: string) {
    const itemsIds = this.itemsStages.map((stage) => stage.itemId);
    for (const itemId of itemsIds) {
      const ctrl = this.ctrls.get(itemId);
      const item = this.items.find((item) => item.id === itemId)!;
      const keys = Object.keys(item.state[activeStateId] ?? {});
      ctrl?.handleTransitionStart?.(keys);
    }
  }

  notifyTransitionEnd(itemId: string): void {
    const timestamp = Date.now();
    this.itemsStages = this.itemsStages.map((stage) => {
      if (stage.itemId !== itemId || stage.type !== 'transitioning') return stage;
      return {
        itemId,
        type: 'active',
        sceneId: stage.to,
        updated: timestamp
      };
    });
    this.ctrls.get(itemId)?.receiveChange();
  }

  private notifyItemCtrlsChange(itemsIds: string[]) {
    for (const itemId of itemsIds) {
      this.ctrls.get(itemId)?.receiveChange();
    }
  }
}

type ItemStages = (TransitioningStage | ActiveStage)[];
type TriggerType = InteractionItemTrigger['type'];
type SceneId = string;
type TransitioningStage = {
  itemId: string;
  type: 'transitioning';
  from: SceneId;
  to: SceneId;
  updated: number;
};
type ActiveStage = { type: 'active'; itemId: string; sceneId: SceneId; updated: number; };

type ItemId = string;
type StateProps = Record<string, {
  value?: string | number;
  transition?: {
    timing: string;
    duration: number;
    delay: number;
  };
}>;
