import { FC, PropsWithChildren, useEffect, useState, createContext, useContext } from 'react';
import { Relation } from '../../../sdk/types/project/Relation';
import { Preview } from './Preview';

interface Props {
  relations: Relation[];
  startScene: string;
}

export const PreviewWrapper: FC<PropsWithChildren<Props>> = ({ children, relations, startScene }) => {
  const [isDesktop, setIsDesktop] = useState(false);
  const handleResize = () => {
    if (window.innerWidth < 768) {
      setIsDesktop(false);
    } else {
      setIsDesktop(true);
    }
  };
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (isDesktop) {
    return <Preview relations={relations} startScene={startScene}>{children}</Preview>;
  }
  return <>{children}</>;
};
