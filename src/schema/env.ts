import { z } from "zod";

export const schema = z.object({
  RAKUTEN_APP_ID: z.string(),
  ADMIN_TOKEN: z.string(),
});
