import { RichTextConverter } from '../../../utils/RichTextConverter/RichTextConverter';
import { useCntrlContext } from '../../../provider/useCntrlContext';
import { ReactNode } from 'react';
import { RichTextItem } from '../../../../sdk/types/article/Item';

const richTextConverter = new RichTextConverter();

export const useRichTextItem = (item: RichTextItem): [ReactNode[], string] => {
  const { exemplary } = useCntrlContext();
  const [content, styles] = richTextConverter.toHtml(item, exemplary);
  return [content, styles];
};
