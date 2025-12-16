import { z } from 'zod';
import { FontFileTypes } from '../../types/project/Fonts';
import { ItemSchema } from '../article/Item.schema';
import { SectionMediaSchema } from '../article/Section.schema';
import { InteractionSchema } from '../article/Interaction.schema';

const FixedLayerTransitionSchema = z.object({
  from: z.string(),
  to: z.string(),
  itemsTransitions: z.record(z.string(), z.record(z.string(), z.object({
    timing: z.string(),
    duration: z.number(),
    delay: z.number()
  }))),
  id: z.string()
});

export const FixedLayerSchema = z.object({
  id: z.string().min(1),
  items: z.array(ItemSchema),
  name: z.string().optional(),
  hidden: z.boolean(),
  color: z.nullable(z.string()),
  media: SectionMediaSchema.optional(),
  interactions: z.array(InteractionSchema),
  transitions: z.array(FixedLayerTransitionSchema),
});

export const ProjectSchema = z.object({
  id: z.string().min(1),
  html: z.object({
    head: z.string(),
    afterBodyOpen: z.string(),
    beforeBodyClose: z.string()
  }),
  meta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    opengraphThumbnail: z.string().optional(),
    keywords: z.string().optional(),
    favicon: z.string().optional()
  }),
  exemplary: z.number().positive(),
  pages: z.array(z.object({
    articleId: z.string().min(1),
    id: z.string().min(1),
    isStartScene: z.boolean().default(false)
  })),
  fonts: z.object({
    google: z.string(),
    adobe: z.string(),
    custom: z.array(z.object({
      name: z.string().min(1),
      style: z.string().min(1),
      weight: z.number(),
      files: z.array(
        z.object({
          type: z.nativeEnum(FontFileTypes),
          url: z.string()
        })
      )
    }))
  }),
  scenesAssets: z.array(z.string()),
  relations: z.array(z.object({
    from: z.string().min(1),
    to: z.string().min(1),
    type: z.enum(['slide', 'fade']),
    direction: z.enum(['north', 'east', 'south', 'west'])
  })),
  foreground: FixedLayerSchema,
  background: FixedLayerSchema
});
