import { z } from 'zod';
import { ItemAreaSchema } from './ItemArea.schema';
import { AreaAnchor, DimensionMode } from '../../types/article/ItemArea';

const UrlLinkSchema = z.object({
  url: z.string().min(1),
  target: z.string().min(1)
});

export const SceneLinkSchema = z.discriminatedUnion('animation', [
  z.object({
    animation: z.literal('fade'),
    type: z.literal('scene'),
    duration: z.number(),
    value: z.string(),
    sceneSectionId: z.string().optional()
  }),
  z.object({
    animation: z.literal('slide'),
    type: z.literal('scene'),
    duration: z.number(),
    value: z.string(),
    direction: z.enum(['north', 'west', 'south', 'east']),
    sceneSectionId: z.string().optional()
  }),
  z.object({
    animation: z.literal('reveal'),
    type: z.literal('scene'),
    duration: z.number(),
    value: z.string(),
    direction: z.enum(['north', 'west', 'south', 'east']),
    offset: z.number(),
    mode: z.enum(['normal', 'reverse']),
    sceneSectionId: z.string().optional()
  })
]);
export const Link = z.union([UrlLinkSchema, SceneLinkSchema]);

export const CompoundSettingsSchema = z.object({
  positionAnchor: z.nativeEnum(AreaAnchor),
  widthMode: z.nativeEnum(DimensionMode),
  heightMode: z.nativeEnum(DimensionMode),
});

export const ItemBaseSchema = z.object({
  id: z.string().min(1),
  area: ItemAreaSchema,
  hidden: z.boolean(),
  link: Link.optional(),
  compoundSettings: CompoundSettingsSchema.optional(),
});
