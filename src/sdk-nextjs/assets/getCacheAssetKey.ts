export function getCacheAssetKey(url: string, id: string, articleId: string) {
  return `${url}-${id}-${articleId}`;
}
