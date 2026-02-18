export type Relation = {
  type: 'slide' | 'fade' | 'reveal';
  from: string;
  to: string;
  offset?: number;
  direction: Direction;
};

export type Direction = 'north' | 'east' | 'south' | 'west';

export type Transition = PreparingTransition | ActiveTransition | InstantTransition | SettlingTransition;

export type PreparingTransition = {
  stage: 'preparing';
  startX: number;
  startY: number;
};

export type ActiveTransition = {
  stage: 'active';
  direction: Direction;
  duration?: number;
  type: 'slide' | 'fade' | 'reveal';
  offset?: number;
  from: string;
  to: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

export type SettlingTransition = {
  stage: 'settling';
  type: 'slide' | 'fade' | 'reveal';
  success: boolean;
  offset?: number;
  from: string;
  to: string;
};

export type InstantTransition = {
  stage: 'active';
  type: 'slide' | 'fade' | 'reveal';
  from: string;
  to: string;
  offset?: number;
  direction?: Direction;
  duration?: number;
};

export type TransitionScene = {
  id: string;
  styles: TransitionSceneStyle;
};

export type TransitionSceneStyle = {
  startX: number;
  startY: number;
  x: number;
  y: number;
  opacity: number;
  zIndex?: number;
};
