import { z } from "zod";

import { schema as envSchema } from "./schema/env";
import { schema as openbdZodSchema } from "./schema/openbd";
import { schema as rakutenSchema } from "./schema/rakuten";
import { Json } from "./utils";

export type BookInfo = {
  isbn: string;
  title: string;
  source: "openBd" | "rakuten" | null;
  raw?: Json;
};
export const getBookInfo = async (
  isbn: string,
  env: z.infer<typeof envSchema>
): Promise<BookInfo | null> => {
  const openBd = await getBookInfoByOpenBd(isbn);
  const openBdTitle =
    openBd[0]?.onix?.DescriptiveDetail?.TitleDetail?.TitleElement;
  if (openBdTitle?.TitleText?.content !== undefined) {
    return {
      title: `${openBdTitle.TitleText.content}${
        openBdTitle.PartNumber === undefined ? "" : ` ${openBdTitle.PartNumber}`
      }`,
      isbn,
      source: "openBd",
      raw: openBd,
    };
  }
  const rakuten = await getBookInfoByRakuten(isbn, env.RAKUTEN_APP_ID);
  if (rakuten.Items !== undefined && rakuten.Items.length !== 0) {
    return {
      title: rakuten.Items[0].Item.title,
      isbn,
      source: "rakuten",
      raw: rakuten,
    };
  }
  return null;
};

const OPENBD_API_ROOT = "https://api.openbd.jp/v1";
const getBookInfoByOpenBd = async (isbn: string) =>
  openbdZodSchema
    .nullable()
    .array()
    .nonempty()
    .parse(
      await (
        await fetch(
          `${OPENBD_API_ROOT}/get?` +
            new URLSearchParams({
              isbn: isbn,
            })
        )
      ).json()
    );

const RAKUTEN_API_ROOT = "https://app.rakuten.co.jp/services/api";
const getBookInfoByRakuten = async (isbn: string, appId: string) =>
  rakutenSchema.parse(
    await (
      await fetch(
        `${RAKUTEN_API_ROOT}/BooksBook/Search/20170404?` +
          new URLSearchParams({
            applicationId: appId,
            isbn: isbn,
          })
      )
    ).json()
  );
