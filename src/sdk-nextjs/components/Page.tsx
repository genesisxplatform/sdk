import { FC } from 'react';
import HTMLReactParser from 'html-react-parser';
import { CNTRLHead } from './Head';
import { Project } from '../../sdk/types/project/Project';
import { Article as TArticle } from '../../sdk/types/article/Article';
import { KeyframeAny } from '../../sdk/types/keyframe/Keyframe';
import { TransitionMachineContext } from '../provider/TransitionMachineContext';
import { Scenes } from './Scenes/Scenes';
import { FixedLayer } from './fixedLayers/FixedLayer';
import { PreviewWrapper } from './Preview/PreviewWrapper';
import { PreviewListener } from './Preview/PreviewListener';
import { AssetsCacheProvider } from '../assets/AssetsCacheProvider';

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
  const startScene = project.pages.find(page => page.isStartScene)?.articleId ?? Object.keys(articlesData)[0];
  const scenes = Object.values(articlesData).map(({ article }) => ({ id: article.id }));
  const { relations, scenesAssets } = project;
  return (
    <>
      <CNTRLHead project={project} />
      {afterBodyOpen}
        <PreviewWrapper relations={relations} startScene={startScene}>
          <TransitionMachineContext.Provider
            options={{
              input: {
                startScene,
                relations,
                scenes,
              }
            }}
          >
            <PreviewListener />
            <AssetsCacheProvider assets={scenesAssets}>
              {project.foreground && !project.foreground.hidden && <FixedLayer layer={project.foreground} type="foreground" />}
              <Scenes articlesData={articlesData} />
              {project.background && !project.background.hidden && <FixedLayer layer={project.background} type="background" />}
            </AssetsCacheProvider>
          </TransitionMachineContext.Provider>
        </PreviewWrapper>
      {beforeBodyClose}
    </>
  );
};

type SectionName = string;
