export interface Relation {
  from: ArticleId;
  to: ArticleId;
  type: 'slide' | 'fade' | 'reveal';
  offset?: number;
  direction: 'north' | 'east' | 'south' | 'west';
}

type ArticleId = string;
