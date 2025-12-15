import { z } from 'zod';
import { SectionSchema } from './Section.schema';
import { InteractionSchema } from './Interaction.schema';

export const ArticleSchema = z.object({
  id: z.string().min(1),
  scrollableSections: z.array(SectionSchema),
  fixedSections: z.array(SectionSchema),
  interactions: z.array(InteractionSchema)
});
