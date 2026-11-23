/**
 * SQL problems: Select (SQL 50 topic 1). Question numbers and titles follow LeetCode's public SQL 50 plan; every
 * statement, table, row, test, solution and explanation is our own words and our own data (see ../sql-types.ts).
 * Answers run on Postgres (PGlite) in the browser.
 * - 1757 Recyclable and Low Fat Products (Easy)
 * - 584 Find Customer Referee (Easy)
 * - 595 Big Countries (Easy)
 * - 1148 Article Views I (Easy)
 * - 1683 Invalid Tweets (Easy)
 */
import type {SqlCell, SqlProblemSeed} from "../sql-types";

const t = (name: string, setup: string, columns: string[], rows: SqlCell[][], ordered = false) => ({name, setup, expected: {columns, rows}, ordered});

export const sql: SqlProblemSeed[] = [
  {
    kind: "sql",
    lc: 1757,
    topic: "sql-select",
    title: "Recyclable and Low Fat Products",
    difficulty: "Easy",
    statement: `A grocery chain keeps its range in a table called \`catalogue_items\`. Every item has a fat level (either \`LOW\` or \`REGULAR\`) and a flag saying whether its packaging is recyclable. The flag is \`NULL\` when nobody has checked the packaging yet.

Write a query that returns the \`item_id\` of every item that is **low fat** and has **recyclable packaging**.

- An item with an unchecked packaging flag (\`NULL\`) does not count as recyclable.
- Return a single column named \`item_id\`.
- The rows can come back in any order.`,
    tables: [
      {
        name: "catalogue_items",
        note: "One row per item on the shelf.",
        columns: [
          {name: "item_id", type: "integer", pk: true},
          {name: "name", type: "text"},
          {name: "fat_level", type: "text", note: "Either 'LOW' or 'REGULAR'."},
          {name: "eco_packaging", type: "boolean", note: "NULL means not checked yet."},
        ],
      },
    ],
    examples: [
      {
        tables: [
          {
            name: "catalogue_items",
            columns: ["item_id", "name", "fat_level", "eco_packaging"],
            rows: [
              [1, "Oat milk", "LOW", true],
              [2, "Butter", "REGULAR", true],
              [3, "Yoghurt", "LOW", false],
              [4, "Rice cakes", "LOW", true],
              [5, "Crisps", "REGULAR", false],
            ],
          },
        ],
        result: {columns: ["item_id"], rows: [[1], [4]]},
        explanation: "Oat milk and Rice cakes are the only items that are both low fat and recyclable. Yoghurt is low fat but its packaging is not recyclable; Butter is recyclable but not low fat.",
      },
      {
        tables: [
          {
            name: "catalogue_items",
            columns: ["item_id", "name", "fat_level", "eco_packaging"],
            rows: [
              [1, "Tofu", "LOW", null],
              [2, "Hummus", "LOW", true],
            ],
          },
        ],
        result: {columns: ["item_id"], rows: [[2]]},
        explanation: "Tofu has not had its packaging checked, so it is left out.",
      },
    ],
    tests: [
      {
        name: "sample",
        ordered: false,
        setup: `CREATE TABLE catalogue_items (item_id integer PRIMARY KEY, name text NOT NULL, fat_level text NOT NULL, eco_packaging boolean);
INSERT INTO catalogue_items VALUES
 (1, 'Oat milk', 'LOW', true),
 (2, 'Butter', 'REGULAR', true),
 (3, 'Yoghurt', 'LOW', false),
 (4, 'Rice cakes', 'LOW', true),
 (5, 'Crisps', 'REGULAR', false);`,
        expected: {columns: ["item_id"], rows: [[1], [4]]},
      },
      {
        name: "unchecked packaging is NULL",
        ordered: false,
        setup: `CREATE TABLE catalogue_items (item_id integer PRIMARY KEY, name text NOT NULL, fat_level text NOT NULL, eco_packaging boolean);
INSERT INTO catalogue_items VALUES
 (1, 'Tofu', 'LOW', NULL),
 (2, 'Hummus', 'LOW', true),
 (3, 'Cheddar', 'REGULAR', NULL);`,
        expected: {columns: ["item_id"], rows: [[2]]},
      },
      {
        name: "nothing qualifies",
        ordered: false,
        setup: `CREATE TABLE catalogue_items (item_id integer PRIMARY KEY, name text NOT NULL, fat_level text NOT NULL, eco_packaging boolean);
INSERT INTO catalogue_items VALUES
 (1, 'Sausage rolls', 'REGULAR', true),
 (2, 'Diet cola', 'LOW', false);`,
        expected: {columns: ["item_id"], rows: []},
      },
      {
        name: "repeated names, non-contiguous ids",
        ordered: false,
        setup: `CREATE TABLE catalogue_items (item_id integer PRIMARY KEY, name text NOT NULL, fat_level text NOT NULL, eco_packaging boolean);
INSERT INTO catalogue_items VALUES
 (7, 'Water', 'LOW', true),
 (8, 'Water', 'LOW', true),
 (9, 'Water', 'REGULAR', true),
 (10, 'Water', 'LOW', NULL),
 (42, 'Water', 'LOW', true);`,
        expected: {columns: ["item_id"], rows: [[7], [8], [42]]},
      },
    ],
    solution: `SELECT item_id
FROM catalogue_items
WHERE fat_level = 'LOW'
  AND eco_packaging IS TRUE`,
    approaches: [
      {
        id: "where-both",
        title: "Filter with both conditions in one WHERE",
        optimal: true,
        explanation: "Both rules are plain row-level conditions, so one `WHERE` with `AND` does the whole job in a single pass over the table. `eco_packaging IS TRUE` is spelled out on purpose: it is false for both `false` and `NULL`, which is exactly what the question asks for, and it makes the NULL decision visible to the reader.",
        code: `SELECT item_id
FROM catalogue_items
WHERE fat_level = 'LOW'
  AND eco_packaging IS TRUE`,
      },
      {
        id: "intersect",
        title: "Intersect two filtered lists of ids",
        optimal: false,
        explanation: "Build the low-fat ids and the recyclable ids separately, then keep the ones present in both with `INTERSECT`. It gives the same rows but scans the table twice and de-duplicates the result for no benefit (the key is already unique), so it is worse than a single `WHERE`. It is still a useful shape when the two conditions come from different tables.",
        code: `SELECT item_id FROM catalogue_items WHERE fat_level = 'LOW'
INTERSECT
SELECT item_id FROM catalogue_items WHERE eco_packaging IS TRUE`,
      },
    ],
    hints: [
      "Two conditions must hold for the same row. Which logical operator joins them?",
      "A comparison with NULL is neither true nor false. Which rows does `WHERE` keep?",
    ],
    clarify: [
      {question: "Should an item with an unchecked (NULL) packaging flag be returned?", answer: "No. Only items whose packaging is known to be recyclable count."},
      {question: "Does the order of the returned ids matter?", answer: "No. Any order is accepted."},
    ],
    followUps: ["How would the query change if the question asked for items that are low fat OR recyclable, and how does NULL behave there?"],
    mysqlNote: "MySQL stores booleans as TINYINT(1), so `eco_packaging = 1` and `eco_packaging = TRUE` both work there. Postgres has a real boolean type: use `= true` or `IS TRUE`, and a comparison such as `= 1` is an error.",
  },
  {
    kind: "sql",
    lc: 584,
    topic: "sql-select",
    title: "Find Customer Referee",
    difficulty: "Easy",
    statement: `A hobby club records who invited each member. The \`invited_by\` column holds the \`member_id\` of the person who made the invitation, or \`NULL\` if the member joined without an invitation.

Write a query that returns the \`name\` of every member who was **not invited by member 2**.

- Members who joined without an invitation (\`NULL\`) must be included.
- Return one column named \`name\`. Two members can share a name, so keep both rows.
- The rows can come back in any order.`,
    tables: [
      {
        name: "club_members",
        note: "One row per member.",
        columns: [
          {name: "member_id", type: "integer", pk: true},
          {name: "name", type: "text"},
          {name: "invited_by", type: "integer", note: "member_id of the inviter; NULL if nobody invited them."},
        ],
      },
    ],
    examples: [
      {
        tables: [
          {name: "club_members", columns: ["member_id", "name", "invited_by"], rows: [[1, "Aiko", null], [2, "Bram", null], [3, "Cleo", 1], [4, "Dev", 2], [5, "Edda", 3], [6, "Finn", 2]]},
        ],
        result: {columns: ["name"], rows: [["Aiko"], ["Bram"], ["Cleo"], ["Edda"]]},
        explanation: "Dev and Finn were both invited by member 2, so they are left out. Aiko and Bram have no inviter (NULL) and stay in.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE club_members (member_id integer PRIMARY KEY, name text NOT NULL, invited_by integer);
INSERT INTO club_members VALUES (1, 'Aiko', NULL), (2, 'Bram', NULL), (3, 'Cleo', 1), (4, 'Dev', 2), (5, 'Edda', 3), (6, 'Finn', 2);`, ["name"], [["Aiko"], ["Bram"], ["Cleo"], ["Edda"]]),
      t("nobody was invited", `CREATE TABLE club_members (member_id integer PRIMARY KEY, name text NOT NULL, invited_by integer);
INSERT INTO club_members VALUES (1, 'Gus', NULL), (2, 'Hana', NULL);`, ["name"], [["Gus"], ["Hana"]]),
      t("same name more than once", `CREATE TABLE club_members (member_id integer PRIMARY KEY, name text NOT NULL, invited_by integer);
INSERT INTO club_members VALUES (1, 'Ivo', NULL), (2, 'Ivo', 2), (3, 'Ivo', 5), (4, 'Ivo', 2);`, ["name"], [["Ivo"], ["Ivo"]]),
      t("everyone was invited by member 2", `CREATE TABLE club_members (member_id integer PRIMARY KEY, name text NOT NULL, invited_by integer);
INSERT INTO club_members VALUES (3, 'Jun', 2), (4, 'Kit', 2);`, ["name"], []),
    ],
    solution: `SELECT name
FROM club_members
WHERE invited_by IS DISTINCT FROM 2`,
    approaches: [
      {
        id: "is-distinct-from",
        title: "IS DISTINCT FROM keeps the NULL rows",
        optimal: true,
        explanation: "\`invited_by <> 2\` is unknown when \`invited_by\` is NULL, and \`WHERE\` throws unknown rows away. \`IS DISTINCT FROM\` treats NULL as a normal value, so it is true for NULL and for every number except 2. One short condition covers both groups of members.",
        code: `SELECT name
FROM club_members
WHERE invited_by IS DISTINCT FROM 2`,
      },
      {
        id: "or-is-null",
        title: "Two conditions joined with OR",
        optimal: false,
        explanation: "Write \`invited_by <> 2 OR invited_by IS NULL\`. It returns the same rows and works in every SQL dialect, but it is longer, and it is easy to forget the NULL half. Prefer \`IS DISTINCT FROM\` in Postgres.",
        code: `SELECT name
FROM club_members
WHERE invited_by <> 2
   OR invited_by IS NULL`,
      },
    ],
    hints: [
      "Try the plain condition `invited_by <> 2` first. Which members does it lose?",
      "What does a comparison with NULL evaluate to, and what does WHERE do with that result?",
    ],
    clarify: [
      {question: "Should members with no inviter be returned?", answer: "Yes. Only members invited by member 2 are removed."},
      {question: "Do I need to remove duplicate names?", answer: "No. Each member is one row, even if two members share a name."},
    ],
    followUps: ["How would you list the members who were invited by someone, but not by member 2?"],
    mysqlNote: "MySQL has no \`IS DISTINCT FROM\`. Use its NULL-safe operator, \`NOT (invited_by <=> 2)\`, or the \`<> 2 OR ... IS NULL\` form, which works in both databases.",
  },
  {
    kind: "sql",
    lc: 595,
    topic: "sql-select",
    title: "Big Countries",
    difficulty: "Easy",
    statement: `A geography quiz keeps its facts in \`territories\`. The \`area\` is in square kilometres. Either figure can be \`NULL\` when it is not known.

A territory is **big** if its area is at least 3,000,000 **or** its population is at least 25,000,000.

Write a query that returns \`name\`, \`population\` and \`area\` (in that order) for every big territory. The rows can come back in any order.`,
    tables: [
      {
        name: "territories",
        note: "One row per territory.",
        columns: [
          {name: "name", type: "text", pk: true},
          {name: "continent", type: "text"},
          {name: "area", type: "integer", note: "Square kilometres; NULL if unknown."},
          {name: "population", type: "integer", note: "NULL if unknown."},
        ],
      },
    ],
    examples: [
      {
        tables: [
          {name: "territories", columns: ["name", "continent", "area", "population"], rows: [["Aldoria", "Asia", 652000, 32000000], ["Brevon", "Europe", 28000, 3000000], ["Cantor", "Africa", 3500000, 18000000], ["Dunmar", "Oceania", 2999999, 24999999], ["Esk", "Asia", 3000000, 100], ["Fenwick", "Americas", 500000, 25000000]]},
        ],
        result: {columns: ["name", "population", "area"], rows: [["Aldoria", 32000000, 652000], ["Cantor", 18000000, 3500000], ["Esk", 100, 3000000], ["Fenwick", 25000000, 500000]]},
        explanation: "Aldoria is big by population, Cantor by area. Esk and Fenwick sit exactly on a threshold, and \"at least\" includes it. Dunmar is one short on both figures.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE territories (name text PRIMARY KEY, continent text NOT NULL, area integer, population integer);
INSERT INTO territories VALUES ('Aldoria', 'Asia', 652000, 32000000), ('Brevon', 'Europe', 28000, 3000000), ('Cantor', 'Africa', 3500000, 18000000), ('Dunmar', 'Oceania', 2999999, 24999999), ('Esk', 'Asia', 3000000, 100), ('Fenwick', 'Americas', 500000, 25000000);`,
        ["name", "population", "area"], [["Aldoria", 32000000, 652000], ["Cantor", 18000000, 3500000], ["Esk", 100, 3000000], ["Fenwick", 25000000, 500000]]),
      t("unknown figures", `CREATE TABLE territories (name text PRIMARY KEY, continent text NOT NULL, area integer, population integer);
INSERT INTO territories VALUES ('Gale', 'Asia', NULL, 30000000), ('Harrow', 'Asia', NULL, NULL), ('Isle', 'Asia', 4000000, NULL), ('Jorn', 'Asia', NULL, 100);`,
        ["name", "population", "area"], [["Gale", 30000000, null], ["Isle", null, 4000000]]),
      t("identical figures", `CREATE TABLE territories (name text PRIMARY KEY, continent text NOT NULL, area integer, population integer);
INSERT INTO territories VALUES ('Twin North', 'Europe', 3100000, 26000000), ('Twin South', 'Europe', 3100000, 26000000), ('Small', 'Europe', 10, 10);`,
        ["name", "population", "area"], [["Twin North", 26000000, 3100000], ["Twin South", 26000000, 3100000]]),
      t("nothing is big", `CREATE TABLE territories (name text PRIMARY KEY, continent text NOT NULL, area integer, population integer);
INSERT INTO territories VALUES ('Pebble', 'Oceania', 12, 900), ('Dune', 'Africa', 2000000, 20000000);`,
        ["name", "population", "area"], []),
    ],
    solution: `SELECT name, population, area
FROM territories
WHERE area >= 3000000
   OR population >= 25000000`,
    approaches: [
      {
        id: "where-or",
        title: "One WHERE with OR",
        optimal: true,
        explanation: "The rule is a single row-level test: either condition is enough. \`OR\` says exactly that, and the table is read once. If one figure is NULL, \`NULL OR true\` is true, so a territory with one known big figure is kept, while \`NULL OR NULL\` is unknown and the row is dropped, which is the right answer.",
        code: `SELECT name, population, area
FROM territories
WHERE area >= 3000000
   OR population >= 25000000`,
      },
      {
        id: "union",
        title: "UNION of two filtered queries",
        optimal: false,
        explanation: "Select the big-by-area territories, select the big-by-population ones, and join them with \`UNION\`, which removes rows that appear in both. The answer is the same, but the table is scanned twice and a sort or hash removes duplicates. \`UNION\` is useful when the two sets come from different places, not for one table.",
        code: `SELECT name, population, area FROM territories WHERE area >= 3000000
UNION
SELECT name, population, area FROM territories WHERE population >= 25000000`,
      },
    ],
    hints: [
      "Is a territory big when both conditions hold, or when at least one does?",
      "Check the boundary: is a territory with exactly 3,000,000 km² big?",
    ],
    clarify: [
      {question: "What happens when a figure is NULL?", answer: "An unknown figure cannot make a territory big on its own. The territory is still big if the other figure meets its threshold."},
      {question: "Which column order should I return?", answer: "name, population, area."},
    ],
    followUps: ["How would you list territories that are big by area but not by population?"],
  },
  {
    kind: "sql",
    lc: 1148,
    topic: "sql-select",
    title: "Article Views I",
    difficulty: "Easy",
    statement: `A blog logs every time someone opens an article in \`article_views\`. A row is added for each view, so the same reader can appear many times. \`viewer_id\` is \`NULL\` for anonymous readers.

Find every author who has viewed **at least one of their own articles** (their \`author_id\` equals the \`viewer_id\` on a view of their article).

- Return one column named \`id\`, with each author once.
- Sort the ids in ascending order.`,
    tables: [
      {
        name: "article_views",
        note: "One row per view; no primary key, so duplicate rows are possible.",
        columns: [
          {name: "article_id", type: "integer"},
          {name: "author_id", type: "integer"},
          {name: "viewer_id", type: "integer", note: "NULL for anonymous readers."},
          {name: "view_date", type: "date"},
        ],
      },
    ],
    examples: [
      {
        tables: [
          {name: "article_views", columns: ["article_id", "author_id", "viewer_id", "view_date"], rows: [[1, 3, 5, "2024-03-01"], [1, 3, 6, "2024-03-01"], [2, 7, 7, "2024-03-02"], [2, 7, 6, "2024-03-02"], [4, 7, 1, "2024-03-04"], [3, 4, 4, "2024-03-05"], [3, 4, 4, "2024-03-06"]]},
        ],
        result: {columns: ["id"], rows: [[4], [7]]},
        explanation: "Author 7 read article 2 and author 4 read article 3. Author 4 did it twice but is listed once, and the ids are sorted.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE article_views (article_id integer, author_id integer NOT NULL, viewer_id integer, view_date date NOT NULL);
INSERT INTO article_views VALUES (1, 3, 5, '2024-03-01'), (1, 3, 6, '2024-03-01'), (2, 7, 7, '2024-03-02'), (2, 7, 6, '2024-03-02'), (4, 7, 1, '2024-03-04'), (3, 4, 4, '2024-03-05'), (3, 4, 4, '2024-03-06');`, ["id"], [[4], [7]], true),
      t("anonymous readers", `CREATE TABLE article_views (article_id integer, author_id integer NOT NULL, viewer_id integer, view_date date NOT NULL);
INSERT INTO article_views VALUES (1, 2, NULL, '2024-05-01'), (1, 2, NULL, '2024-05-02'), (1, 2, 2, '2024-05-03');`, ["id"], [[2]], true),
      t("ids come out sorted, not in insert order", `CREATE TABLE article_views (article_id integer, author_id integer NOT NULL, viewer_id integer, view_date date NOT NULL);
INSERT INTO article_views VALUES (10, 9, 9, '2024-06-01'), (11, 3, 3, '2024-06-01'), (12, 5, 5, '2024-06-02'), (12, 5, 5, '2024-06-02'), (12, 5, 5, '2024-06-02');`, ["id"], [[3], [5], [9]], true),
      t("nobody read their own article", `CREATE TABLE article_views (article_id integer, author_id integer NOT NULL, viewer_id integer, view_date date NOT NULL);
INSERT INTO article_views VALUES (1, 1, 2, '2024-07-01'), (2, 2, 1, '2024-07-01'), (3, 3, NULL, '2024-07-02');`, ["id"], [], true),
    ],
    solution: `SELECT DISTINCT author_id AS id
FROM article_views
WHERE author_id = viewer_id
ORDER BY id`,
    approaches: [
      {
        id: "distinct",
        title: "DISTINCT on the matching rows",
        optimal: true,
        explanation: "Keep only the views where reader and author are the same person, then \`DISTINCT\` collapses repeated views to one row per author, and \`ORDER BY\` sorts them. A NULL \`viewer_id\` never equals anything, so anonymous views drop out on their own. It is the shortest way to say what the question asks.",
        code: `SELECT DISTINCT author_id AS id
FROM article_views
WHERE author_id = viewer_id
ORDER BY id`,
      },
      {
        id: "group-by",
        title: "GROUP BY the author",
        optimal: false,
        explanation: "Filter the same way, then \`GROUP BY author_id\` to get one row per author. The result is identical and the plan is usually the same, but \`GROUP BY\` suggests that you want to aggregate something. When you only want unique values, \`DISTINCT\` states the intent more clearly.",
        code: `SELECT author_id AS id
FROM article_views
WHERE author_id = viewer_id
GROUP BY author_id
ORDER BY id`,
      },
    ],
    hints: [
      "Which condition says that the reader is the author?",
      "The same author can match many rows. How do you keep each id once?",
    ],
    clarify: [
      {question: "Should an author who viewed their own article three times appear three times?", answer: "No. Each author appears once."},
      {question: "Should the output column be called author_id?", answer: "No. Name it id."},
    ],
    followUps: ["How would you also return how many times each of those authors viewed their own articles?"],
  },
  {
    kind: "sql",
    lc: 1683,
    topic: "sql-select",
    title: "Invalid Tweets",
    difficulty: "Easy",
    statement: `A chat app stores short messages in \`chat_messages\`. A message is **too long** when its text has **more than 15 characters**. Exactly 15 characters is allowed. A message with no text at all (\`NULL\`) is not too long.

Write a query that returns the \`message_id\` of every message that is too long. Count characters, not bytes: an accented letter such as "é" is one character. The rows can come back in any order.`,
    tables: [
      {
        name: "chat_messages",
        note: "One row per message.",
        columns: [
          {name: "message_id", type: "integer", pk: true},
          {name: "body", type: "text", note: "NULL when the message has no text."},
        ],
      },
    ],
    examples: [
      {
        tables: [
          {name: "chat_messages", columns: ["message_id", "body"], rows: [[1, "On my way"], [2, "Meet at the cafe by noon"], [3, "abcdefghijklmno"], [4, "abcdefghijklmnop"]]},
        ],
        result: {columns: ["message_id"], rows: [[2], [4]]},
        explanation: "Message 3 has exactly 15 characters, so it is fine. Message 4 has 16, so it is too long.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE chat_messages (message_id integer PRIMARY KEY, body text);
INSERT INTO chat_messages VALUES (1, 'On my way'), (2, 'Meet at the cafe by noon'), (3, 'abcdefghijklmno'), (4, 'abcdefghijklmnop');`, ["message_id"], [[2], [4]]),
      t("no text", `CREATE TABLE chat_messages (message_id integer PRIMARY KEY, body text);
INSERT INTO chat_messages VALUES (1, NULL), (2, 'This message is long enough'), (3, NULL);`, ["message_id"], [[2]]),
      t("accents count once", `CREATE TABLE chat_messages (message_id integer PRIMARY KEY, body text);
INSERT INTO chat_messages VALUES (1, 'ééééééééééééééé'), (2, 'éééééééééééééééé');`, ["message_id"], [[2]]),
      t("spaces count too", `CREATE TABLE chat_messages (message_id integer PRIMARY KEY, body text);
INSERT INTO chat_messages VALUES (1, '               '), (2, '                '), (3, '');`, ["message_id"], [[2]]),
      t("every message is short", `CREATE TABLE chat_messages (message_id integer PRIMARY KEY, body text);
INSERT INTO chat_messages VALUES (1, 'ok'), (2, 'see you soon'), (3, 'abcdefghijklmno');`, ["message_id"], []),
    ],
    solution: `SELECT message_id
FROM chat_messages
WHERE CHAR_LENGTH(body) > 15`,
    approaches: [
      {
        id: "char-length",
        title: "CHAR_LENGTH(body) > 15",
        optimal: true,
        explanation: "\`CHAR_LENGTH\` counts characters, which is what the rule needs. For a NULL body it returns NULL, the comparison is unknown, and the row is dropped, so no extra NULL check is needed. The strict \`>\` keeps messages of exactly 15 characters.",
        code: `SELECT message_id
FROM chat_messages
WHERE CHAR_LENGTH(body) > 15`,
      },
      {
        id: "regex",
        title: "Regular expression for 16 or more characters",
        optimal: false,
        explanation: "The pattern \`.{16}\` matches any text with at least 16 characters, so \`body ~ '.{16}'\` gives the same rows. It works, but a regular expression is harder to read than a length check, and the number 16 hides the real rule (more than 15). Use it only when the length test is not available.",
        code: `SELECT message_id
FROM chat_messages
WHERE body ~ '.{16}'`,
      },
    ],
    hints: [
      "Which function counts the characters in a text value?",
      "Is the limit \"more than 15\" or \"at least 15\"? Pick the operator to match.",
    ],
    clarify: [
      {question: "Does a message of exactly 15 characters count as too long?", answer: "No. Only messages with 16 or more characters are too long."},
      {question: "What about a NULL body?", answer: "It is not too long and is not returned."},
    ],
    followUps: ["How would you list the messages that are empty or have no text?"],
    mysqlNote: "In MySQL, \`LENGTH()\` counts bytes, so an accented letter counts as two. Use \`CHAR_LENGTH()\` there. In Postgres, \`LENGTH()\` and \`CHAR_LENGTH()\` both count characters, and \`OCTET_LENGTH()\` counts bytes.",
  },
];
