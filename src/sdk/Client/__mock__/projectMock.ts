import { Project } from '../../types/project/Project';

export const projectMock: Project = {
  id: 'projectId',
  fonts: {
    google: '',
    adobe: '',
    custom: []
  },
  exemplary: 375,
  html: {
    beforeBodyClose: '',
    afterBodyOpen: '',
    head: ''
  },
  meta: {
    favicon: 'project favicon',
    title: 'project title',
    opengraphThumbnail: 'project opengraph',
    keywords: 'project keywords',
    description: 'project description'
  },
  pages: [{
    id: 'pageId',
    articleId: 'articleId',
    
  },
    {
      id: 'pageId2',
      articleId: 'articleId2',
    }],
  relations: [],
  foreground: {
    id: 'foregroundId',
    hidden: false,
    items: [],
    color: null,
    transitions: [],
    interactions: []
  },
  background: {
    id: 'backgroundId',
    hidden: false,
    items: [],
    color: null,
    transitions: [],
    interactions: []
  }
};
