export type Relation = {
  type: 'slide' | 'fade';
  from: string;
  to: string;
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
  type: 'slide' | 'fade';
  from: string;
  to: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export type SettlingTransition = {
  stage: 'settling';
  type: 'slide' | 'fade';
  success: boolean;
  from: string;
  to: string;
};

export type InstantTransition = {
  stage: 'active';
  type: 'slide' | 'fade';
  from: string;
  to: string;
  direction?: Direction;
};

export type TransitionScene = {
  id: string;
  styles: TransitionSceneStyle;
}

export type TransitionSceneStyle = {
  startX: number;
  startY: number;
  x: number;
  y: number;
  opacity: number;
};
