import { FC, useEffect, useId, useState } from 'react';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { ItemProps } from '../Item';
import JSXStyle from 'styled-jsx/style';
import { useRegisterResize } from '../../../common/useRegisterResize';
import { useItemAngle } from '../useItemAngle';
import { LinkWrapper } from '../LinkWrapper';
import { useCodeEmbedItem } from './useCodeEmbedItem';
import { CodeEmbedItem as TCodeEmbedItem } from '../../../../sdk/types/article/Item';
import { FontFaceGenerator } from '../../../../sdk/FontFaceGenerator/FontFaceGenerator';
import { useExemplary } from '../../../common/useExemplary';

export const CodeEmbedItem: FC<ItemProps<TCodeEmbedItem>> = ({ item, sectionId, onResize, interactionCtrl, onVisibilityChange }) => {
  const id = useId();
  const { fonts } = useCntrlContext();
  const fontGoogleTags = fonts?.google;
  const fontAdobeTags = fonts?.adobe;
  const fontCustomTags = new FontFaceGenerator(fonts?.custom ?? []).generate();
  const { blur: itemBlur, opacity: itemOpacity } = useCodeEmbedItem(item, sectionId);
  const itemAngle = useItemAngle(item, sectionId);
  const html = decodeBase64(item.params.html);
  const exemplary = useExemplary();
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  useRegisterResize(ref, onResize);
  const stateParams = interactionCtrl?.getState<number>(['angle', 'blur', 'opacity']);
  const blur = (stateParams?.styles?.blur ?? itemBlur) as number;
  const opacity = stateParams?.styles?.opacity ?? itemOpacity;
  const angle = stateParams?.styles?.angle ?? itemAngle;

  useEffect(() => {
    if (!ref) return;
    const scripts = ref.querySelectorAll('script');
    for (const script of scripts) {
      const newScript = document.createElement('script');
      for (const attr of script.getAttributeNames()) {
        newScript.setAttribute(attr, script.getAttribute(attr)!);
      }
      newScript.textContent = script.textContent;
      script.parentNode!.removeChild(script);
      ref.appendChild(newScript);
    }
  }, [html]);

  useEffect(() => {
    if (!ref) return;
    const iframe: HTMLIFrameElement | null = ref.querySelector(`[data-embed="${item.id}"]`);
    if (!iframe) return;
    const htmlWithStyles = `
      ${fontGoogleTags}
      ${fontAdobeTags}
      <style>
      ${fontCustomTags}
        html, body {
          height: 100%;
          margin: 0 !important;
          padding: 0 !important;
        }
      </style>
      ${html}
    `;
    iframe.srcdoc = htmlWithStyles;
  }, [html, item.params.iframe, ref]);

  const isInteractive = opacity !== 0;
  useEffect(() => {
    onVisibilityChange?.(isInteractive);
  }, [isInteractive, onVisibilityChange]);

  return (
    <LinkWrapper url={item.link?.url} target={item.link?.target}>
      <div
        className={`embed-wrapper-${item.id}`}
        style={{
          transform: `rotate(${angle}deg)`,
          ...(blur !== undefined ? { filter: `blur(${blur * 100}vw)` } : {}),
          willChange: blur !== 0 && blur !== undefined ? 'transform' : 'unset',
          transition: stateParams?.transition ?? 'none'
        }}
        ref={setRef}
      >
        {item.params.iframe ? (
          <iframe
            data-embed={item.id}
            className={`embed-${item.id}`}
            style={{
              border: 'unset'
            }}
          />
        ) : (
          <div
            className={`embed-${item.id}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
      <JSXStyle id={id}>{`
      .embed-wrapper-${item.id} {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: ${item.params.opacity};
        transform: rotate(${item.area.angle}deg);
        filter: ${item.params.blur !== 0 ? `blur(${item.params.blur * 100}vw)` : 'unset'};
        ${item.params.blur !== 0 ? 'will-change: transform;' : ''}
      }
      .embed-${item.id} {
        transform: ${item.params.scale ? 'scale(var(--layout-deviation))' : 'none'};
        transform-origin: top left;
        z-index: 1;
        border: none;
        width: ${item.params.scale ? `${item.area.width * exemplary}px` : '100%'};
        height: ${item.params.scale ? `${item.area.height * exemplary}px` : '100%'};
      }
    `}</JSXStyle>
    </LinkWrapper>
  );
};

export function decodeBase64(str: string): string {
  const binary = atob(str);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
