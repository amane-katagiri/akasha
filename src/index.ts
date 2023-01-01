import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { prettyJSON } from "hono/pretty-json";
import { validator } from "hono/validator";

import { getBookInfo } from "./librarian";
import { schema as envSchema } from "./schema/env";

const app = new Hono();

app.use("*", poweredBy());
app.use("*", prettyJSON());

app.post("/shelf", async (c) => {
  return c.json({ todo: "本棚を作る" });
});

app
  .get("/shelf/:shelf{[0-9a-f]+}", (c) => {
    return c.json({ todo: "本棚の情報を返す" });
  })
  .put(async (c) => {
    return c.json({ todo: "本棚の情報を編集する" });
  })
  .delete((c) => {
    return c.json({ todo: "本棚を削除する" });
  });

app
  .post(
    "/shelf/:shelf{[0-9a-f]+}/book",
    validator((v) => ({
      isbn: v
        .body("content")
        .isRequired()
        .match(/^(978|979)[0-9]{10}$/)
        .message("書籍のISBN-13ではありません。"),
    })),
    async (c) => {
      try {
        const isbn = c.req.valid().isbn;
        const book = await getBookInfo(isbn, envSchema.parse(c.env));
        // TODO: D1に本を登録する
        return c.text(
          book === null
            ? `本の情報がありませんでした。ISBN:${isbn}のみ登録します。`
            : `「${book.title}」を登録しました。`
        );
      } catch (e) {
        return c.text(`エラーが発生しました: ${e}`);
      }
    }
  )
  .get((c) => {
    return c.json({ todo: "本の一覧を返す" });
  });

app
  .get("/shelf/:shelf{[0-9a-f]+}/book/:isbn{[0-9]+}", async (c) => {
    return c.json({ todo: "本の情報を返す" });
  })
  .delete((c) => {
    return c.json({ todo: "本を削除する" });
  });

export default app;
