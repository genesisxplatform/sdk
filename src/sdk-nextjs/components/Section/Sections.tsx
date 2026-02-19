import { FC, useContext, useEffect, useState } from 'react';
import { ArticleRectContext } from '../../provider/ArticleRectContext';
import { Article as TArticle } from '../../../sdk/types/article/Article';
import { Section } from './Section';
import { Item } from '../items/Item';

interface Props {
  article: TArticle;
  container: HTMLElement | null;
}

export const Sections: FC<Props> = ({ article, container }) => {
  const articleRectObserver = useContext(ArticleRectContext);
  const [articleHeight, setArticleHeight] = useState(1);
  
  useEffect(() => {
    if (!articleRectObserver || !container) return;
    const rect = container.getBoundingClientRect();
    setArticleHeight(container.scrollHeight / rect.width);
    return articleRectObserver.init(container);
  }, [articleRectObserver || !container]);

  useEffect(() => {
    if (!articleRectObserver || !container) return;
    return articleRectObserver.on('resize', (rect) => {
      setArticleHeight(container.scrollHeight / rect.width);
    });
  }, [articleRectObserver, container]);

  return (
    <>
      {article.sections.map((section, i) => {
        const data = {};
        return (
          <Section
            articleId={article.id}
            section={section}
            key={section.id}
            data={data}
          >
            {article.sections[i].items.map(item => (
              <Item
                item={item}
                key={item.id}
                articleId={article.id}
                sectionId={section.id}
                articleHeight={articleHeight}
              />
            ))}
          </Section>
        );
      })}
    </>
  );
};