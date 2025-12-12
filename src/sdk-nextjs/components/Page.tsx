import { FC } from 'react';
import HTMLReactParser from 'html-react-parser';
import { CNTRLHead } from './Head';
import { Project } from '../../sdk/types/project/Project';
import { Article as TArticle } from '../../sdk/types/article/Article';
import { KeyframeAny } from '../../sdk/types/keyframe/Keyframe';
import { TransitionMachineContext } from '../provider/TransitionMachineContext';
import { Scenes } from './Scenes/Scenes';
import { FixedLayer } from './fixedLayers/FixedLayer';

export interface PageProps {
  project: Project;
  articlesData: Record<string, {
    article: TArticle;
    keyframes: KeyframeAny[];
  }>;
}

export const Page: FC<PageProps> = ({ project, articlesData }) => {
  const afterBodyOpen = HTMLReactParser(project.html.afterBodyOpen);
  const beforeBodyClose = HTMLReactParser(project.html.beforeBodyClose);
  const startScene = Object.keys(articlesData)[0];
  const scenes = Object.values(articlesData).map(({ article }) => ({ id: article.id }));
  const { relations } = project;
  return (
    <>
      <CNTRLHead project={project} />
      {afterBodyOpen}
      <TransitionMachineContext.Provider
        options={{
          input: {
            startScene,
            relations,
            scenes,
          }
        }}
      >
        {project.foreground && !project.foreground.hidden && <FixedLayer layer={project.foreground} type="foreground" />}
        <Scenes articlesData={articlesData} />
        {project.background && !project.background.hidden && <FixedLayer layer={project.background} type="background" />}
      </TransitionMachineContext.Provider>
      {beforeBodyClose}
    </>
  );
};

type SectionName = string;
