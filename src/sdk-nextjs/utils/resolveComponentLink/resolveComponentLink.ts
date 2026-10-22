import { ClickLink, Link } from '../../../sdk/types/article/Item';

/**
 * A link stored in a component's settings, in the editor's shape: ids, not names.
 * Item links are converted to the SDK shape by the public API; component settings
 * are not, so the SDK does the same conversion here.
 */
export type ComponentLink =
  | { type: 'url' | 'anchor'; value: string; target: 'self' | 'blank' }
  | ClickLink;

export interface ComponentLinkMaps {
  /** Page id → article id (scenes are addressed by article id on the site). */
  pageIdArticleIdMap: Record<string, string>;
  /** Section id → section name (sections render with `id={section.name}`). */
  sectionIdNameMap: Record<string, string | undefined>;
}

/** Mirrors `prefillItemLink` in public-api-server's ItemsPrefillManager. */
export function resolveComponentLink(link: ComponentLink | null | undefined, maps: ComponentLinkMaps): Link | undefined {
  if (!link || !link.value) return undefined;
  if (link.type === 'scene') {
    const articleId = maps.pageIdArticleIdMap[link.value];
    if (articleId === undefined) return undefined;
    const sceneSectionName = link.sceneSectionId ? maps.sectionIdNameMap[link.sceneSectionId] : undefined;
    const { sceneSectionId: _sceneSectionId, ...rest } = link;
    return {
      ...rest,
      value: articleId,
      ...(sceneSectionName ? { sceneSectionId: sceneSectionName } : {}),
    };
  }
  if (link.type === 'anchor') {
    const name = maps.sectionIdNameMap[link.value];
    if (!name) return undefined;
    return { type: 'anchor', target: `_${link.target}`, url: `#${name}` };
  }
  return { type: 'url', target: `_${link.target}`, url: link.value };
}
