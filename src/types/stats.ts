import {z} from 'zod';

export const statsSchema = z.object({
  name: z.string(),
  players: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      stats: z.object({
        points: z.number(),
        assists: z.number(),
        rebounds: z.number(),
        fouls: z.number(),
      }),
    })
  ),
});
