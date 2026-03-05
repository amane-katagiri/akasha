import { z } from "zod";

export const schema = z.object({
  RAKUTEN_APP_ID: z.string(),
  RAKUTEN_APP_ACCESS_KEY: z.string(),
  RAKUTEN_APP_ORIGIN: z.string(),
  ADMIN_TOKEN: z.string(),
});
