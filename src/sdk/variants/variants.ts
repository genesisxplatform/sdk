/**
 * Page variants (`?gx_v=<value id>`), the page half of the contract in
 * docs/dynamic-sites/03-page-contract.md.
 *
 * A page carries every variant. A swappable item arrives from the API as a
 * base plus one copy per value that has its own content:
 *   - a copy has `variant.value` and renders with `data-gx-variant="<value>"`;
 *   - the base has `variant.replacedBy` and renders with
 *     `data-gx-base="<value> <value>"`, the values that have a copy.
 * An inline head script puts the active value ids on `<html data-gx-v="…">`
 * before the first paint, and the CSS below hides every copy that is not
 * active and every base that an active value replaces. Nothing is swapped
 * after load, so nothing flickers. With no parameter, an unknown value or no
 * JavaScript, the base page shows.
 */

export const VARIANT_PARAM = 'gx_v';
export const ACTIVE_VARIANTS_ATTR = 'data-gx-v';
export const VARIANT_ATTR = 'data-gx-variant';
export const VARIANT_BASE_ATTR = 'data-gx-base';

/** Value ids travel in a URL and sit inside CSS attribute selectors. */
const VALUE_ID = /^[a-z0-9-]{1,32}$/;
/** More ids than a page has dimensions is a malformed link; stop reading. */
const MAX_ACTIVE = 8;

export interface ItemVariant {
  /** On a copy: the value id it shows for. */
  value?: string;
  /** On the base: the value ids that have a copy, and so hide the base. */
  replacedBy?: string[];
  /** On a copy: the id of the swappable item it was made from. */
  source?: string;
}

export interface ProjectVariants {
  dimensions: {
    id: string;
    /** The dimension's name as the designer wrote it ("Occasion"). */
    name?: string;
    /** Value ids: what `gx_v` carries. */
    values: string[];
    /** Each value id's name ("Everyday Wellness"). Read by the export's gx-variants.json, never by the page. */
    valueNames?: Record<string, string>;
  }[];
}

export function isVariantValueId(id: unknown): id is string {
  return typeof id === 'string' && VALUE_ID.test(id);
}

/** Every value id the page knows, once each. */
export function getVariantValues(variants: ProjectVariants | undefined): string[] {
  if (!variants) return [];
  const values = variants.dimensions.flatMap(d => d.values).filter(isVariantValueId);
  return [...new Set(values)];
}

/**
 * Hides, for each value: its copies while it is not active, and the bases it
 * replaces while it is. It only ever hides, so a shown item keeps whatever
 * `display` its own styles give it.
 */
export function getVariantsCss(variants: ProjectVariants | undefined): string {
  return getVariantValues(variants).map(value => (
    `html:not([${ACTIVE_VARIANTS_ATTR}~="${value}"]) [${VARIANT_ATTR}="${value}"],`
    + `html[${ACTIVE_VARIANTS_ATTR}~="${value}"] [${VARIANT_BASE_ATTR}~="${value}"]`
    + '{display:none!important}'
  )).join('\n');
}

/** The value ids a query string asks for: `gx_v=performance` or `gx_v=performance.female`. */
export function parseVariantParam(search: string): string[] {
  const match = /[?&]gx_v=([^&#]*)/.exec(search);
  if (!match) return [];
  let raw: string;
  try {
    raw = decodeURIComponent(match[1]);
  } catch {
    return [];
  }
  const ids: string[] = [];
  for (const id of raw.split('.')) {
    if (ids.length >= MAX_ACTIVE) break;
    if (isVariantValueId(id) && !ids.includes(id)) ids.push(id);
  }
  return ids;
}

/**
 * The selection script. Inline it, synchronously, in `<head>`: it runs before
 * the body exists and touches only an attribute of `<html>`, which React does
 * not hydrate. It is `parseVariantParam` written out for old browsers, and it
 * needs no page data: an id the page does not know matches no CSS rule.
 */
export const variantsHeadScript = '(function(){try{'
  + 'var m=/[?&]gx_v=([^&#]*)/.exec(location.search);if(!m)return;'
  + 'var p=decodeURIComponent(m[1]).split("."),a=[];'
  + `for(var i=0;i<p.length&&a.length<${MAX_ACTIVE};i++)`
  + 'if(/^[a-z0-9-]{1,32}$/.test(p[i])&&a.indexOf(p[i])<0)a.push(p[i]);'
  + `if(a.length)document.documentElement.setAttribute("${ACTIVE_VARIANTS_ATTR}",a.join(" "))`
  + '}catch(e){}})();';

/** The attribute an item's root element carries. */
export function getVariantAttributes(variant: ItemVariant | undefined): Record<string, string> {
  if (!variant) return {};
  if (isVariantValueId(variant.value)) return { [VARIANT_ATTR]: variant.value };
  const replacedBy = (variant.replacedBy ?? []).filter(isVariantValueId);
  return replacedBy.length > 0 ? { [VARIANT_BASE_ATTR]: replacedBy.join(' ') } : {};
}

/** What the head script chose. Browser only; `[]` on the server. */
export function readActiveVariants(): string[] {
  if (typeof document === 'undefined') return [];
  const attr = document.documentElement.getAttribute(ACTIVE_VARIANTS_ATTR);
  return attr ? attr.split(' ').filter(isVariantValueId) : [];
}

/** Whether an item (or an asset of one) is on screen under the active values. */
export function isVariantShown(variant: Pick<ItemVariant, 'value' | 'replacedBy'> | undefined, active: string[]): boolean {
  if (!variant) return true;
  if (variant.value !== undefined) return active.includes(variant.value);
  return !(variant.replacedBy ?? []).some(value => active.includes(value));
}

/** A section's background: the two things a variant value can replace. */
interface SectionBackground<M> {
  color: string | null;
  media?: M;
}

/**
 * The background a section shows under the active values: the base, with whatever the
 * first active value that has its own background replaces. A section belongs to one
 * dimension, so at most one of its values is active on a well-formed link.
 */
export function getSectionBackground<M>(
  section: SectionBackground<M> & { variants?: { value: string; color?: string | null; media?: M | null }[] },
  active: string[]
): SectionBackground<M> {
  const own = (section.variants ?? []).find(variant => active.includes(variant.value));
  return {
    color: own && own.color !== undefined ? own.color : section.color,
    media: own && own.media !== undefined ? own.media ?? undefined : section.media
  };
}

/**
 * The colour half of a section's variants as CSS, so it is right on the first paint: the
 * selector is stronger than the section's own rule. Media is picked in script instead,
 * because a section's media is only ever mounted after the page has loaded.
 */
export function getSectionColorCss(
  selector: string,
  variants: { value: string; color?: string | null }[] | undefined,
  format: (color: string | null) => string
): string {
  return (variants ?? [])
    .filter(variant => variant.color !== undefined && isVariantValueId(variant.value))
    .map(variant => `html[${ACTIVE_VARIANTS_ATTR}~="${variant.value}"] ${selector}{background-color:${format(variant.color ?? null)}}`)
    .join('\n');
}
