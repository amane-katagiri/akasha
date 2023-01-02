DROP TABLE IF EXISTS shelves;
CREATE TABLE shelves (
    shelf_id TEXT NOT NULL,
    acl_group_id TEXT NOT NULL DEFAULT "default",
    shelf_name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    PRIMARY KEY (`shelf_id`)
);

DROP TABLE IF EXISTS acls;
CREATE TABLE acls (
    acl_id TEXT NOT NULL,
    acl_group_id TEXT NOT NULL,
    scope TEXT NOT NULL,
    power TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    PRIMARY KEY (`acl_id`)
);
INSERT INTO acls (acl_id, acl_group_id, scope, power) VALUES ('af4850ca-4624-423b-9dde-d85d2544a536', 'default', 'all', 'full');

DROP TABLE IF EXISTS books;
CREATE TABLE books (
    shelf_id TEXT NOT NULL,
    isbn TEXT NOT NULL,
    title TEXT, 
    source TEXT,
    raw TEXT,
    created_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (DATETIME('now', 'localtime')),
    PRIMARY KEY (`shelf_id`, `isbn`)
);