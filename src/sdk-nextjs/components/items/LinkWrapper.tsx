import React, { CSSProperties, MouseEvent, ReactElement, ReactNode } from 'react';
import { Link } from '../../../sdk/types/article/Item';
import { TransitionMachineContext } from '../../provider/TransitionMachineContext';
import { getTransitionFromLink } from '../../../sdk/transitions/utils/getTransitionFromLink';

interface Props {
  children: ReactElement | ReactNode[];
  link?: Link;
  style?: CSSProperties;
}

export const LinkWrapper: React.FC<Props> = ({ link, children, style }) => {
  const actorRef = TransitionMachineContext.useActorRef();
  const validUrl = link && 'type' in link && (link.type === 'url' || link.type === 'anchor') && 'url' in link ? buildValidUrl(link.url) : '';
  const targetParams = link && 'target' in link && link.target === '_blank' ? { target: link.target, rel: 'noreferrer' } : {};
  const handleGoToScene = () => {
    if (!actorRef || !link || link.type !== 'scene') return;
    const transition = getTransitionFromLink(link);
    actorRef.send({
      type: 'TRANSITION_TRIGGER',
      ...transition,
    });
  };
  // On desktop the site renders inside a src-less preview iframe, whose base URL is inherited from
  // the parent page. A native `#section` jump there resolves to the full site URL and reloads the
  // whole site inside the iframe at its start scene, so scroll the current scene ourselves instead.
  const handleGoToAnchor = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!link || link.type !== 'anchor' || !validUrl.startsWith('#')) return;
    e.preventDefault();
    const scene = e.currentTarget.closest<HTMLElement>('.article-wrapper');
    const section = scene?.querySelector<HTMLElement>(`[id="${CSS.escape(validUrl.slice(1))}"]`);
    if (!scene || !section) return;
    const top = section.getBoundingClientRect().top - scene.getBoundingClientRect().top + scene.scrollTop;
    scene.scrollTo({ top, behavior: 'smooth' });
  };
  if (validUrl) {
    return (
      <a
        href={validUrl}
        style={style}
        onClick={handleGoToAnchor}
        {...targetParams}
      >
        {children}
      </a>
    );
  }
  if (link && link.type === 'scene') {
    return (
      <a
        onClick={handleGoToScene}
        style={style}
        role="button"
      >
        {children}
      </a>
    );
  }
  return <>{children}</>;
};

export function buildValidUrl(url: string): string {
  const prefixes = [
    'http://',
    'https://',
    '/',
    'mailto:',
    'tel:',
    'file:',
    'ftp:',
    'javascript',
    '#'
  ];
  const protocolCheck = prefixes.some(prefix => url.startsWith(prefix));
  if (protocolCheck) return url;
  return `//${url}`;
}
