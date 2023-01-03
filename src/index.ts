import { Context, Hono, Next } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { poweredBy } from "hono/powered-by";
import { prettyJSON } from "hono/pretty-json";
import { validator } from "hono/validator";
import { v4 as uuidv4 } from "uuid";

import { Bindings } from "./bindings";
import { getBookInfo } from "./librarian";
import { schema as envSchema } from "./schema/env";

// derived from miniflare/d1 and better-sqlite3
type D1Error = Error & {
  cause?: { message?: string; code?: string };
};

const app = new Hono<{ Bindings: Bindings }>();
app.use("*", poweredBy());
app.use("*", prettyJSON());

const SHELF_PARAM_NAME = ":shelf{[0-9a-f-]+}";
const ISBN_PARAM_NAME = ":isbn{[0-9]+}";

const getD1ErrorCode = (e: unknown) => (e as D1Error)?.cause?.code ?? `${e}`;

const adminAuth = async (
  c: Context,
  next: Next
): Promise<Response | undefined | void> =>
  await bearerAuth({ token: envSchema.parse(c.env).ADMIN_TOKEN })(c, next);

app
  .all("/shelf", adminAuth)
  .post(
    validator((v) => ({
      name: v.body("name").isRequired().message("本棚の名前がありません。"),
    })),
    async (c) => {
      const shelfId = uuidv4();
      const shelfName = c.req.valid().name;
      try {
        await c.env.DB.prepare(
          `INSERT INTO shelves (shelf_id, shelf_name, acl_group_id)
           VALUES(?, ?, (SELECT acl_group_id FROM acls WHERE acl_group_id = ?));`
        )
          .bind(shelfId, shelfName, "default")
          .run();
        c.status(201);
      } catch (e) {
        const errorCode = getD1ErrorCode(e);
        if (errorCode === "SQLITE_CONSTRAINT_NOTNULL") {
          c.status(400);
          return c.body("この権限は利用できません。");
        }
        c.status(500);
        return c.json({
          error: errorCode,
        });
      }
      return c.json({ shelfId, shelfName });
    }
  )
  .get(async (c) => {
    try {
      const results =
        (
          await c.env.DB.prepare(
            `SELECT shelf_id, shelf_name FROM shelves;`
          ).all<{
            shelf_id: string;
            shelf_name: string;
          }>()
        ).results ?? [];
      if (results.length === 0) {
        c.status(404);
      }
      return c.json(results);
    } catch (e) {
      c.status(500);
      return c.json({
        error: getD1ErrorCode(e),
      });
    }
  });

app
  .get(`/shelf/${SHELF_PARAM_NAME}`, async (c) => {
    try {
      const result =
        (await c.env.DB.prepare(
          `SELECT shelf_id, shelf_name FROM shelves WHERE shelf_id = ?;`
        )
          .bind(c.req.param("shelf"))
          .first<{
            shelf_id: string;
            shelf_name: string;
          }>()) ?? null;
      if (result === null) {
        c.status(404);
        return c.json(undefined);
      }
      return c.json(result);
    } catch (e) {
      c.status(500);
      return c.json({
        error: getD1ErrorCode(e),
      });
    }
  })
  .put(
    adminAuth,
    validator((v) => ({
      name: v.body("name").isRequired().message("本棚の名前がありません。"),
    })),
    async (c) => {
      const shelfId = c.req.param("shelf");
      const shelfName = c.req.valid().name;
      try {
        const result = (await c.env.DB.prepare(
          `UPDATE shelves SET shelf_name = ?,
           updated_at = DATETIME('now', 'localtime') WHERE shelf_id = ?;`
        )
          .bind(shelfName, shelfId)
          .run()) as unknown as { changes: number };
        if ((result?.changes ?? 0) === 0) {
          c.status(404);
          return c.json(undefined);
        }
      } catch (e) {
        c.status(500);
        return c.json({
          error: getD1ErrorCode(e),
        });
      }
      return c.json({ shelfId, shelfName });
    }
  )
  .delete(adminAuth, async (c) => {
    const shelfId = c.req.param("shelf");
    c.status(204);
    try {
      const result = (
        await c.env.DB.batch([
          c.env.DB.prepare(
            `DELETE FROM shelves WHERE
             shelf_id = (SELECT shelf_id FROM shelves WHERE shelf_id = ?)`
          ).bind(shelfId),
          c.env.DB.prepare(
            `DELETE FROM books WHERE
             shelf_id = (SELECT shelf_id FROM shelves WHERE shelf_id = ?)`
          ).bind(shelfId),
        ])
      )[0] as unknown as { results?: { changes?: number } };
      if ((result?.results?.changes ?? 0) === 0) {
        c.status(404);
      }
    } catch (e) {
      c.status(500);
      return c.json({
        error: getD1ErrorCode(e),
      });
    }
    return c.json(undefined);
  });

app
  .post(
    `/shelf/${SHELF_PARAM_NAME}/book`,
    validator((v) => ({
      isbn: v
        .body("content")
        .isRequired()
        .match(/^(978|979)[0-9]{10}$/)
        .message("書籍のISBN-13ではありません。"),
      title: v.body("title").isOptional(),
    })),
    async (c) => {
      try {
        const shelfId = c.req.param("shelf");
        const isbn = c.req.valid().isbn;
        const title = c.req.valid().title;
        const book = await getBookInfo(isbn, envSchema.parse(c.env));

        try {
          await c.env.DB.prepare(
            book !== null
              ? `INSERT INTO books (shelf_id, isbn, title, source, raw)
                 VALUES ((SELECT shelf_id FROM shelves WHERE shelf_id = ?1), ?2, ?3, ?4, ?5)
                 ON CONFLICT DO UPDATE SET shelf_id = ?1, isbn = ?2, title = ?3,
                 source = ?4, raw = ?5, updated_at = DATETIME('now', 'localtime');`
              : title !== undefined
              ? `INSERT INTO books (shelf_id, isbn, title, source, raw)
                 VALUES ((SELECT shelf_id FROM shelves WHERE shelf_id = ?1), ?2, ?3, ?4, ?5)
                 ON CONFLICT DO UPDATE SET shelf_id = ?1, isbn = ?2, title = ?3,
                 updated_at = DATETIME('now', 'localtime');`
              : `INSERT OR IGNORE INTO books (shelf_id, isbn, title, source, raw)
                 VALUES ((SELECT shelf_id FROM shelves WHERE shelf_id = ?1), ?2, ?3, ?4, ?5);`
          )
            .bind(
              shelfId,
              isbn,
              book?.title ?? title,
              book?.source,
              JSON.stringify(book?.raw)
            )
            .run();
          return c.body(
            book !== null || title !== undefined
              ? `「${book?.title ?? title}」を登録・更新しました。`
              : `本の情報がありませんでした。ISBN:${isbn}のみ登録・更新します。`
          );
        } catch (e) {
          const errorCode = getD1ErrorCode(e);
          if (errorCode === "SQLITE_CONSTRAINT_NOTNULL") {
            c.status(400);
            return c.body("この本棚には登録できません。");
          }
          c.status(500);
          return c.json({
            error: errorCode,
          });
        }
      } catch (e) {
        c.status(500);
        return c.body(`エラーが発生しました: ${e}`);
      }
    }
  )
  .get(async (c) => {
    try {
      const results =
        (
          await c.env.DB.prepare(
            `SELECT shelf_id, isbn, title, source, raw FROM books
             WHERE shelf_id = (SELECT shelf_id FROM shelves WHERE shelf_id = ?);`
          )
            .bind(c.req.param("shelf"))
            .all<{
              shelf_id: string;
              isbn: string;
              title?: string;
              source?: string;
              raw?: string;
            }>()
        ).results ?? [];
      if (results.length === 0) {
        c.status(404);
      }
      return c.json(results);
    } catch (e) {
      c.status(500);
      return c.json({
        error: getD1ErrorCode(e),
      });
    }
  });

app
  .get(`/shelf/${SHELF_PARAM_NAME}/book/${ISBN_PARAM_NAME}`, async (c) => {
    try {
      const result =
        (await c.env.DB.prepare(
          `SELECT shelf_id, isbn, title, source, raw FROM books
           WHERE shelf_id = (SELECT shelf_id FROM shelves WHERE shelf_id = ?) AND isbn = ?;`
        )
          .bind(c.req.param("shelf"), c.req.param("isbn"))
          .first<{
            shelf_id: string;
            isbn: string;
            title?: string;
            source?: string;
            raw?: string;
          }>()) ?? null;
      if (result === null) {
        c.status(404);
        return c.json(undefined);
      }
      return c.json(result);
    } catch (e) {
      c.status(500);
      return c.json({
        error: getD1ErrorCode(e),
      });
    }
  })
  .delete(async (c) => {
    c.status(204);
    try {
      const result = (await c.env.DB.prepare(
        `DELETE FROM books WHERE
         shelf_id = (SELECT shelf_id FROM shelves WHERE shelf_id = ?) AND isbn = ?`
      )
        .bind(c.req.param("shelf"), c.req.param("isbn"))
        .run()) as unknown as { changes: number };
      if ((result?.changes ?? 0) === 0) {
        c.status(404);
      }
    } catch (e) {
      c.status(500);
      return c.json({
        error: getD1ErrorCode(e),
      });
    }
    return c.json(undefined);
  });

export default app;
