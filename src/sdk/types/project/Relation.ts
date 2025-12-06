export interface Relation {
  from: ArticleId;
  to: ArticleId;
  type: 'slide' | 'fade';
  direction: 'north' | 'east' | 'south' | 'west';
}

type ArticleId = string;
