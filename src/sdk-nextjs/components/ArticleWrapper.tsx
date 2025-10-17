import React, { CSSProperties, FC, PropsWithChildren } from 'react';
import { useLayoutDeviation } from '../common/useLayoutDeviation';

export const ArticleWrapper: FC<PropsWithChildren<{}>> = ({ children }) => {
  const { layoutDeviation } = useLayoutDeviation();
  const layoutDeviationStyle = { '--layout-deviation': layoutDeviation } as CSSProperties;

  return (
    <div
      className="article-wrapper"
      style={{
        ...layoutDeviationStyle
      }}
    >
      {children}
    </div>
  );
};
