type ArticleId = string;

export type RelationTrigger =
  | { type: 'auto'; delay: number }
  | { type: 'video-end'; videoType: 'item' | 'section'; videoId: string };

export type SlideRelation = {
  to: ArticleId;
  type: 'slide';
  from: ArticleId;
  direction: 'north' | 'east' | 'south' | 'west';
  trigger?: RelationTrigger;
};

export type FadeRelation = {
  to: ArticleId;
  type: 'fade';
  direction: 'north' | 'east' | 'south' | 'west';
  from: ArticleId;
  trigger?: RelationTrigger;
};

export type RevealRelation = {
  to: ArticleId;
  type: 'reveal';
  from: ArticleId;
  direction: 'north' | 'east' | 'south' | 'west';
  offset: number;
  mode: 'normal' | 'reverse';
  trigger?: RelationTrigger;
};

export type Relation = SlideRelation | FadeRelation | RevealRelation;
