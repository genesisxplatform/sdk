export type Direction = 'north' | 'east' | 'south' | 'west';

type SlideRelation = {
  to: string;
  type: 'slide';
  direction: Direction;
};

type FadeRelation = {
  to: string;
  type: 'fade';
  direction: Direction;
};

type RevealRelation = {
  to: string;
  type: 'reveal';
  direction: Direction;
  offset: number;
  mode: 'normal' | 'reverse';
};

export type Relation = SlideRelation | FadeRelation | RevealRelation;

export type Transition = PreparingTransition | ActiveTransition | InstantTransition | SettlingTransition;

export type PreparingTransition = {
  stage: 'preparing';
  startX: number;
  startY: number;
};

type ActiveTransitionBase = {
  stage: 'active';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  duration?: number;
  from: string;
  to: string;
};

type ActiveSlideTransition = ActiveTransitionBase & {
  type: 'slide';
  direction: Direction;
};

type ActiveFadeTransition = ActiveTransitionBase & {
  type: 'fade';
  direction: Direction;
};

type ActiveRevealTransition = ActiveTransitionBase & {
  type: 'reveal';
  direction: Direction;
  offset: number;
  mode: 'normal' | 'reverse';
};

export type ActiveTransition = ActiveSlideTransition | ActiveFadeTransition | ActiveRevealTransition;

export type SettlingTransition = {
  stage: 'settling';
  type: 'slide' | 'fade' | 'reveal';
  success: boolean;
  from: string;
  to: string;
};

type InstantTransitionBase = {
  stage: 'active';
  from: string;
  to: string;
  duration?: number;
};

type InstantSlideTransition = InstantTransitionBase & {
  type: 'slide';
  direction: Direction;
  offset?: number;
};

type InstantFadeTransition = InstantTransitionBase & {
  type: 'fade';
};

type InstantRevealTransition = InstantTransitionBase & {
  type: 'reveal';
  direction: Direction;
  offset: number;
  mode: 'normal' | 'reverse';
};

export type InstantTransition = InstantSlideTransition | InstantFadeTransition | InstantRevealTransition;

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
