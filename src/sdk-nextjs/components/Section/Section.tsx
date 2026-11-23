import React, { FC, ReactElement, useEffect, useId, useRef, useMemo, useState } from 'react';
import JSXStyle from 'styled-jsx/style';

import { useCntrlContext } from '../../provider/useCntrlContext';
import { useSectionRegistry } from '../../utils/ArticleRectManager/useSectionRegistry';
import { CntrlColor } from '@cntrl-site/color';
import { SectionVideo } from './SectionVideo';
import { SectionImage } from './SectionImage';
import { isOverflowClipSupported } from '../../utils/checkOverflowClipSupport';
import { SectionHeight, SectionHeightMode, Section as TSection } from '../../../sdk/types/article/Section';
import { getSectionBackground, getSectionColorCss, readActiveVariants } from '../../../sdk/variants/variants';

type SectionChild = ReactElement<any, any>;
const DEFAULT_COLOR = 'rgba(0, 0, 0, 0)';

interface Props {
  section: TSection;
  children: SectionChild[];
  data?: any;
  articleId: string;
}

export const Section: FC<Props> = ({ section, data, children, articleId }) => {
  const id = useId();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { customSections } = useCntrlContext();
  const { height, color, hidden } = section;
  const SectionComponent = section.name ? customSections.getComponent(section.name) : undefined;
  useSectionRegistry(section.id, sectionRef.current);

  // The variant the head script chose. Read after mount, so the first render matches the
  // server's; media is not mounted before that either (it waits for `sectionRef`).
  const [activeVariants, setActiveVariants] = useState<string[]>([]);
  useEffect(() => {
    setActiveVariants(readActiveVariants());
  }, []);
  const sectionMedia = useMemo(
    () => getSectionBackground(section, activeVariants).media,
    [section, activeVariants]
  );

  const media = useMemo(() => {
    if (sectionMedia && !isOverflowClipSupported()) {
      return {
        ...sectionMedia,
        position: 'local'
      };
    }
    return sectionMedia;
  }, [sectionMedia]);

  if (SectionComponent) return <div ref={sectionRef}><SectionComponent data={data}>{children}</SectionComponent></div>;

  return (
    <>
      <div
        className={`section-${section.id}`}
        id={section.name}
        ref={sectionRef}
      >
        {media && media.size !== 'none' && sectionRef.current && (
          <div className={`section-background-overlay-${section.id}`}>
            <div
              key={`section-background-wrapper-${section.id}`}
              className={`section-background-wrapper-${section.id}`}
              style={{
                transform: media.position === 'fixed' ? 'translateY(-100vh)' : 'unset',
                height: media.position === 'fixed' ? `calc(${getSectionHeight(height)} + 200vh)` : getSectionHeight(height)
              }}
            >
              {media.type === 'video' && (
                <SectionVideo container={sectionRef.current} sectionId={section.id} media={media} articleId={articleId} />
              )}
              {media.type === 'image' && (
                <SectionImage media={media} sectionId={section.id} articleId={articleId} />
              )}
            </div>
          </div>
        )}
        {children}
      </div>
      <JSXStyle id={id}>{`
        .section-${section.id} {
          height: ${getSectionHeight(height)};
          position: relative;
          display: ${hidden ? 'none' : 'block'};
          background-color: ${CntrlColor.parse(color ?? DEFAULT_COLOR).fmt('rgba')};
          overflow: clip;
        }
        ${getSectionColorCss(`.section-${section.id}`, section.variants, c => CntrlColor.parse(c ?? DEFAULT_COLOR).fmt('rgba'))}
        .section-background-overlay-${section.id} {
          height: ${getSectionHeight(height)};
          width: 100%;
          position: relative;
          overflow: clip;
        }
        .section-background-wrapper-${section.id} {
          transform: ${media?.position === 'fixed' ? 'translateY(-100vh)' : 'unset'};
          position: relative;
          height: ${media?.position === 'fixed' ? `calc(${getSectionHeight(height)} + 200vh)` : getSectionHeight(height)};
          width: 100%;
        }
      `}
    </JSXStyle>
    </>
  );
};

export function getSectionHeight(heightData: SectionHeight): string {
  const { units, vhUnits, mode } = heightData;
  if (mode === SectionHeightMode.ViewportHeightUnits) return `${vhUnits}%`;
  if (mode === SectionHeightMode.ControlUnits) return `${units * 100}vw`;
  return '0';
}
