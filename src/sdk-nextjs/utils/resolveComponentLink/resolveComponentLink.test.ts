import { resolveComponentLink, ComponentLinkMaps } from './resolveComponentLink';

const maps: ComponentLinkMaps = {
  pageIdArticleIdMap: { 'page-thanks': 'article-thanks' },
  sectionIdNameMap: { 'section-hero': 'hero', 'section-footer': 'footer', 'section-unnamed': undefined },
};

describe('resolveComponentLink', () => {
  it('returns undefined for a missing or empty link', () => {
    expect(resolveComponentLink(undefined, maps)).toBeUndefined();
    expect(resolveComponentLink(null, maps)).toBeUndefined();
    expect(resolveComponentLink({ type: 'url', value: '', target: 'self' }, maps)).toBeUndefined();
  });

  it('keeps a url link and prefixes the target', () => {
    expect(resolveComponentLink({ type: 'url', value: 'example.com', target: 'blank' }, maps))
      .toEqual({ type: 'url', target: '_blank', url: 'example.com' });
  });

  it('turns an anchor section id into the section name', () => {
    expect(resolveComponentLink({ type: 'anchor', value: 'section-footer', target: 'self' }, maps))
      .toEqual({ type: 'anchor', target: '_self', url: '#footer' });
  });

  it('drops an anchor whose section has no name', () => {
    expect(resolveComponentLink({ type: 'anchor', value: 'section-unnamed', target: 'self' }, maps)).toBeUndefined();
    expect(resolveComponentLink({ type: 'anchor', value: 'section-gone', target: 'self' }, maps)).toBeUndefined();
  });

  it('turns a scene page id into its article id and the target section into its name', () => {
    expect(resolveComponentLink({
      type: 'scene',
      animation: 'slide',
      direction: 'north',
      duration: 300,
      value: 'page-thanks',
      sceneSectionId: 'section-hero',
    }, maps)).toEqual({
      type: 'scene',
      animation: 'slide',
      direction: 'north',
      duration: 300,
      value: 'article-thanks',
      sceneSectionId: 'hero',
    });
  });

  it('omits a scene section that cannot be resolved', () => {
    expect(resolveComponentLink({
      type: 'scene',
      animation: 'fade',
      duration: 200,
      value: 'page-thanks',
      sceneSectionId: 'section-gone',
    }, maps)).toEqual({ type: 'scene', animation: 'fade', duration: 200, value: 'article-thanks' });
  });

  it('drops a scene whose page is unknown', () => {
    expect(resolveComponentLink({ type: 'scene', animation: 'fade', duration: 200, value: 'page-gone' }, maps)).toBeUndefined();
  });
});
