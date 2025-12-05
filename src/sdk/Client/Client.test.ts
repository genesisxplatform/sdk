import { Client } from './Client';
import { projectMock } from './__mock__/projectMock';
import { articleMock } from './__mock__/articleMock';
import { keyframesMock } from './__mock__/keyframesMock';

describe('Client', () => {
  it('throws an error when no project ID passed to the connect URL', async () => {
    const projectId = '';
    const apiKey = 'MY_API_KEY';
    const apiUrl = `https://${projectId}:${apiKey}@api.cntrl.site/`;
    expect(() => new Client(apiUrl)).toThrow(new Error('Project ID is missing in the URL.'));
    expect(() => new Client('https://api.cntrl.site'))
      .toThrow(new Error('Project ID is missing in the URL.'));
  });

  it('throws an error when no API key passed to the connect URL', async () => {
    const projectId = 'whatever';
    const apiKey = '';
    const apiUrl = `https://${projectId}:${apiKey}@api.cntrl.site/`;
    expect(() => new Client(apiUrl)).toThrow(new Error('API key is missing in the URL.'));
  });

  it('returns page data with all articles', async () => {
    const projectId = 'projectId';
    const API_BASE_URL = 'api-test.cntrl.site';
    const articleMock2 = { ...articleMock, id: 'articleId2' };
    const fetchesMap: Record<string, unknown> = {
      [`https://${API_BASE_URL}/projects/${projectId}?buildMode=default`]: projectMock,
      [`https://${API_BASE_URL}/projects/${projectId}/articles/articleId?buildMode=default`]: {
        article: articleMock,
        keyframes: keyframesMock
      },
      [`https://${API_BASE_URL}/projects/${projectId}/articles/articleId2?buildMode=default`]: {
        article: articleMock2,
        keyframes: keyframesMock
      }
    };
    const apiKey = 'MY_API_KEY';
    let fetchCalledTimes = 0;
    const apiUrl = `https://${projectId}:${apiKey}@${API_BASE_URL}/`;
    const fetch = async (url: string) => {
      fetchCalledTimes += 1;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fetchesMap[url]),
        statusText: ''
      });
    };
    const client = new Client(apiUrl, fetch);
    const pageData = await client.getPageData();
    expect(fetchCalledTimes).toBe(3);
    expect(pageData.project).toEqual(projectMock);
    expect(pageData.articlesData).toEqual({
      articleId: {
        article: articleMock,
        keyframes: keyframesMock
      },
      articleId2: {
        article: articleMock2,
        keyframes: keyframesMock
      }
    });
  });

  it('throws an error upon project fetch failure', async () => {
    const projectId = 'MY_PROJECT_ID';
    const apiKey = 'MY_API_KEY';
    const apiUrl = `https://${projectId}:${apiKey}@api.cntrl.site/`;
    const fetch = async () => Promise.resolve({
      ok: false,
      statusText: 'reason',
      json: () => Promise.resolve()
    });
    const client = new Client(apiUrl, fetch);
    await expect(client.getPageData()).rejects.toEqual(new Error('Failed to fetch project with id #MY_PROJECT_ID: reason'));
  });

  it('throws an error upon article fetch failure', async () => {
    const projectId = 'projectId';
    const API_BASE_URL = 'api-test.cntrl.site';
    const fetchesMap: Record<string, unknown> = {
      [`https://${API_BASE_URL}/projects/${projectId}?buildMode=default`]: projectMock
    };
    const apiKey = 'MY_API_KEY';
    const apiUrl = `https://${projectId}:${apiKey}@${API_BASE_URL}/`;
    const fetch = async (url: string) => {
      const data = fetchesMap[url];
      if (data) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(data),
          statusText: ''
        });
      }
      return Promise.resolve({
        ok: false,
        statusText: 'Article not found',
        json: () => Promise.resolve()
      });
    };
    const client = new Client(apiUrl, fetch);
    await expect(client.getPageData()).rejects.toEqual(new Error('Failed to fetch article with id #articleId: Article not found'));
  });
});
