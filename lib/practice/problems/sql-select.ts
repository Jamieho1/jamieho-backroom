/**
 * SQL problems: Select (SQL 50 topic 1). Question numbers and titles follow LeetCode's public SQL 50 plan; every
 * statement, table, row, test, solution and explanation is our own words and our own data (see ../sql-types.ts).
 * Answers run on Postgres (PGlite) in the browser.
 * - 1757 Recyclable and Low Fat Products (Easy)
 */
import type {SqlProblemSeed} from "../sql-types";

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
];
