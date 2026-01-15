import { FC, useEffect, useState } from 'react';
import { Article as TArticle } from '../../../sdk/types/article/Article';
import { KeyframeAny } from '../../../sdk/types/keyframe/Keyframe';
import { TransitionMachineContext } from '../../provider/TransitionMachineContext';
import { Article } from '../Article';

interface Props {
  articlesData: Record<string, {
    article: TArticle;
    keyframes: KeyframeAny[];
  }>;
}

export const Scenes: FC<Props> = ({ articlesData }) => {
  const scenes = TransitionMachineContext.useSelector(({ context }) => context.scenes);
  return (
    <div>
      {scenes.map((scene) => {
        const { article, keyframes } = articlesData[scene.id];
        if (!article || !keyframes) return null;
        return (
          <Article
            article={article}
            keyframes={keyframes}
            key={article.id}
            styles={scene.styles}
          />
        );
      })}
    </div>
  );
};
