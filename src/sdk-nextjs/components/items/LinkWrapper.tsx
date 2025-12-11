import React, { ReactElement, ReactNode } from 'react';
import { Link } from '../../../sdk/types/article/Item';
import { TransitionMachineContext } from '../../provider/TransitionMachineContext';

interface Props {
  children: ReactElement | ReactNode[];
  link?: Link;
}

export const LinkWrapper: React.FC<Props> = ({ link, children }) => {
  const actorRef = TransitionMachineContext.useActorRef();
  const validUrl = link && 'url' in link ? buildValidUrl(link.url) : 'javascript:void(0)';
  const targetParams = link && 'target' in link && link.target === '_blank' ? { target: link.target, rel: 'noreferrer' } : {};
  const handleGoToScene = () => {
    if (!actorRef || !link || !('value' in link)) return;
    actorRef.send({
      type: 'TRANSITION_TRIGGER',
      transition: link.animation as 'slide' | 'fade',
      to: link.value,
      direction: link.direction
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
  if (link && 'value' in link) {
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
