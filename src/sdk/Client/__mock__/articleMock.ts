import { Article } from '../../types/article/Article';
import { SectionHeightMode } from '../../types/article/Section';

export const articleMock: Article = {
  id: 'articleId',
  sections: [
    {
      id: 'sectionId',
      items: [],
      height: {
        mode: SectionHeightMode.ControlUnits,
        units: 100
      },
      hidden: false,
      color: 'red'
    }
  ],
  interactions: []
};
