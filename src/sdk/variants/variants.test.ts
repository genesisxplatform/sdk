import {
  getSectionBackground,
  getSectionColorCss,
  getVariantAttributes,
  getVariantsCss,
  getVariantValues,
  isVariantShown,
  parseVariantParam,
  variantsHeadScript
} from './variants';

const variants = {
  dimensions: [
    { id: 'occasion', values: ['performance', 'wellness', 'tech'] },
    { id: 'gender', values: ['female', 'male'] }
  ]
};

/** Runs the real head script against a fake page and returns what it set on <html>. */
function runHeadScript(search: string): string | null {
  let attr: string | null = null;
  const document = { documentElement: { setAttribute: (_: string, value: string) => { attr = value; } } };
  new Function('location', 'document', variantsHeadScript)({ search }, document);
  return attr;
}

describe('getVariantValues', () => {
  it('lists every value once and drops ids that are not slugs', () => {
    expect(getVariantValues(variants)).toEqual(['performance', 'wellness', 'tech', 'female', 'male']);
    expect(getVariantValues({ dimensions: [{ id: 'd', values: ['ok', 'ok', 'Not OK', 'a"]{}', ''] }] })).toEqual(['ok']);
    expect(getVariantValues(undefined)).toEqual([]);
  });
});

describe('getVariantsCss', () => {
  it('writes one hiding rule per value and never a showing one', () => {
    const css = getVariantsCss({ dimensions: [{ id: 'occasion', values: ['performance'] }] });
    expect(css).toBe(
      'html:not([data-gx-v~="performance"]) [data-gx-variant="performance"],'
      + 'html[data-gx-v~="performance"] [data-gx-base~="performance"]{display:none!important}'
    );
    expect(getVariantsCss(variants).split('\n')).toHaveLength(5);
    expect(getVariantsCss(undefined)).toBe('');
  });
});

describe('the selection, in TypeScript and in the head script', () => {
  const cases: [string, string[]][] = [
    ['', []],
    ['?utm_source=x', []],
    ['?gx_v=performance', ['performance']],
    ['?utm_source=x&gx_v=tech&gclid=1', ['tech']],
    ['?gx_v=performance.female', ['performance', 'female']],
    ['?gx_v=performance.performance', ['performance']],
    ['?gx_v=', []],
    ['?gx_v=Performance', []],
    ['?gx_v=%22%3E%3Cscript%3E', []],
    ['?gx_v=%E0%A4%A', []],
    ['?xgx_v=tech', []],
    ['?gx_v=a.b.c.d.e.f.g.h.i.j', ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']]
  ];
  it.each(cases)('%s', (search, expected) => {
    expect(parseVariantParam(search)).toEqual(expected);
    expect(runHeadScript(search)).toBe(expected.length ? expected.join(' ') : null);
  });
});

describe('getVariantAttributes', () => {
  it('marks a copy with its value and a base with the values that replace it', () => {
    expect(getVariantAttributes({ value: 'tech', source: 'hero' })).toEqual({ 'data-gx-variant': 'tech' });
    expect(getVariantAttributes({ replacedBy: ['performance', 'tech'] })).toEqual({ 'data-gx-base': 'performance tech' });
  });
  it('marks nothing on an ordinary item or a malformed mark', () => {
    expect(getVariantAttributes(undefined)).toEqual({});
    expect(getVariantAttributes({ replacedBy: [] })).toEqual({});
    expect(getVariantAttributes({ value: 'a"] *{' })).toEqual({});
  });
});

describe('isVariantShown', () => {
  it('shows a copy only for its value, and a base unless a value replaces it', () => {
    expect(isVariantShown(undefined, ['tech'])).toBe(true);
    expect(isVariantShown({ value: 'tech' }, ['tech'])).toBe(true);
    expect(isVariantShown({ value: 'tech' }, [])).toBe(false);
    expect(isVariantShown({ replacedBy: ['tech'] }, [])).toBe(true);
    expect(isVariantShown({ replacedBy: ['tech'] }, ['tech'])).toBe(false);
    // wellness has no copy of this item, so its base stays
    expect(isVariantShown({ replacedBy: ['tech'] }, ['wellness'])).toBe(true);
  });
});

describe('section backgrounds', () => {
  const photo = { type: 'image', url: 'base.jpg' };
  const clip = { type: 'video', url: 'run.mp4' };
  const section = {
    color: 'white',
    media: photo,
    variants: [
      { value: 'performance', color: 'green', media: clip },
      { value: 'wellness', media: null },
      { value: 'tech', color: null }
    ]
  };

  it('shows the base with no active value, or one the section has nothing for', () => {
    expect(getSectionBackground(section, [])).toEqual({ color: 'white', media: photo });
    expect(getSectionBackground(section, ['female'])).toEqual({ color: 'white', media: photo });
    expect(getSectionBackground({ color: 'white' }, ['performance'])).toEqual({ color: 'white', media: undefined });
  });

  it('replaces only what the active value has of its own', () => {
    expect(getSectionBackground(section, ['performance'])).toEqual({ color: 'green', media: clip });
    expect(getSectionBackground(section, ['wellness'])).toEqual({ color: 'white', media: undefined });
    expect(getSectionBackground(section, ['female', 'tech'])).toEqual({ color: null, media: photo });
  });

  it('writes one colour rule per value that has a colour, stronger than the section rule', () => {
    const css = getSectionColorCss('.section-s1', section.variants, c => c ?? 'transparent');
    expect(css).toBe([
      'html[data-gx-v~="performance"] .section-s1{background-color:green}',
      'html[data-gx-v~="tech"] .section-s1{background-color:transparent}'
    ].join('\n'));
  });

  it('writes nothing for a section without variants or a value id that is not a slug', () => {
    expect(getSectionColorCss('.section-s1', undefined, c => c ?? '')).toBe('');
    expect(getSectionColorCss('.section-s1', [{ value: 'a"]{}', color: 'red' }], c => c ?? '')).toBe('');
  });
});
