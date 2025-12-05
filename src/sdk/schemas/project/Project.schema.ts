import { z } from 'zod';
import { FontFileTypes } from '../../types/project/Fonts';

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
    id: z.string().min(1)
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
  relations: z.array(z.object({
    from: z.string().min(1),
    to: z.string().min(1),
    type: z.enum(['slide', 'fade']),
    direction: z.enum(['north', 'east', 'south', 'west'])
  }))
});
