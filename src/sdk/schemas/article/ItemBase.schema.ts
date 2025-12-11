import { z } from 'zod';
import { ItemAreaSchema } from './ItemArea.schema';
import { AreaAnchor, DimensionMode } from '../../types/article/ItemArea';

const UrlLinkSchema = z.object({
  url: z.string().min(1),
  target: z.string().min(1)
});

const ClickLinkSchema = z.object({
  value: z.string().min(1),
  animation: z.enum(['fade', 'slide', 'reveal']),
  duration: z.number(),
  direction: z.enum(['north', 'west', 'south', 'east'])
});

export const Link = z.union([UrlLinkSchema, ClickLinkSchema]);

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
