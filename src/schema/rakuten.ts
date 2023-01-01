import { z } from "zod";

export const schema = z.object({
  Items: z
    .object({ Item: z.object({ title: z.string() }) })
    .array()
    .optional(),
});
