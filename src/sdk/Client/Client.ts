import fetch from 'isomorphic-fetch';
import { URL } from 'url';
import { Project } from '../types/project/Project';
import { Article } from '../types/article/Article';
import { KeyframeAny } from '../types/keyframe/Keyframe';
import { ArticleSchema } from '../schemas/article/Article.schema';
import { ProjectSchema } from '../schemas/project/Project.schema';
import { KeyframesSchema } from '../schemas/keyframe/Keyframes.schema';

export class Client {
  private url: URL;
  constructor(
    APIUrl: string,
    private fetchImpl: FetchImpl = fetch
  ) {
    this.url = new URL(APIUrl);
    if (!this.url.username) {
      throw new Error('Project ID is missing in the URL.');
    }
    if (!this.url.password) {
      throw new Error('API key is missing in the URL.');
    }
  }

  async getPageData(buildMode: 'default' | 'self-hosted' = 'default'): Promise<CntrlPageData> {
    try {
      const project = await this.fetchProject(buildMode);
      const articlesIds = project.pages.map(page => page.articleId);
      const articlesDataArr = await Promise.all(articlesIds.map(articleId => this.fetchArticle(articleId, buildMode)));
      const articlesData = articlesDataArr.reduce<Record<string, ArticleData>>((acc, articleData) => {
        acc[articleData.article.id] = articleData;
        return acc;
      }, {});
      return {
        project,
        articlesData
      };
    } catch (e) {
      throw e;
    }
  }

  private async fetchProject(buildMode: 'default' | 'self-hosted' = 'default'): Promise<Project> {
    const { username: projectId, password: apiKey, origin } = this.url;
    const url = new URL(`/projects/${projectId}?buildMode=${buildMode}`, origin);
    const response = await this.request(url.href, apiKey);
    if (!response.ok) {
      throw new Error(`Failed to fetch project with id #${projectId}: ${response.statusText}`);
    }
    const data = await response.json();
    const project = ProjectSchema.parse(data);
    return project;
  }

  private async fetchArticle(articleId: string, buildMode: 'default' | 'self-hosted' = 'default'): Promise<ArticleData> {
    const { username: projectId, password: apiKey, origin } = this.url;
    const url = new URL(`/projects/${projectId}/articles/${articleId}?buildMode=${buildMode}`, origin);
    const response = await this.request(url.href, apiKey);
    if (!response.ok) {
      throw new Error(`Failed to fetch article with id #${articleId}: ${response.statusText}`);
    }
    const data = await response.json();
    const article = ArticleSchema.parse(data.article);
    const keyframes = KeyframesSchema.parse(data.keyframes);
    return { article, keyframes };
  }

  private request(url: string, apiKey: string): Promise<FetchImplResponse> {
    // Disabling gzip avoids node-fetch's "Premature close at Gunzip" error,
    // which occurs when the upstream socket is closed slightly before the
    // compressed body is fully read (seen during self-hosted exports). The
    // `compress` flag is node-fetch specific and ignored by browser fetch.
    const init: RequestInit & { compress?: boolean } = {
      compress: false,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Accept-Encoding': 'identity'
      }
    };
    return this.fetchImpl(url, init);
  }
}

interface FetchImplResponse {
  ok: boolean;
  json(): Promise<any>;
  statusText: string;
}

type FetchImpl = (url: string, init?: RequestInit) => Promise<FetchImplResponse>;
interface ArticleData {
  article: Article;
  keyframes: KeyframeAny[];
}
interface CntrlPageData {
  project: Project;
  articlesData: Record<string, ArticleData>;
}
