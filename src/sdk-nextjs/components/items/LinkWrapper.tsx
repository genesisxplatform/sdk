import React, { ReactElement, ReactNode } from 'react';
import { Link } from '../../../sdk/types/article/Item';
import { TransitionMachineContext } from '../../provider/TransitionMachineContext';
import { getTransitionFromLink } from '../../../sdk/transitions/utils/getTransitionFromLink';

interface Props {
  children: ReactElement | ReactNode[];
  link?: Link;
}

export const LinkWrapper: React.FC<Props> = ({ link, children }) => {
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
  if (validUrl) {
    return (
      <a
        href={validUrl}
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
        role="button"
      >
        {children}
      </a>
    );
  }
  return <>{children}</>;
};

function buildValidUrl(url: string): string {
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
