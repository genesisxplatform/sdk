type ArticleId = string;

export type SlideRelation = {
  to: ArticleId;
  type: 'slide';
  from: ArticleId;
  direction: 'north' | 'east' | 'south' | 'west';
};

export type FadeRelation = {
  to: ArticleId;
  type: 'fade';
  from: ArticleId;
};

export type RevealRelation = {
  to: ArticleId;
  type: 'reveal';
  from: ArticleId;
  direction: 'north' | 'east' | 'south' | 'west';
  offset: number;
  mode: 'normal' | 'reverse';
};

export type Relation = SlideRelation | FadeRelation | RevealRelation;
