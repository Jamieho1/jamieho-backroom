/**
 * SQL problems: Basic Aggregate Functions (SQL 50 topic 3). Question numbers and titles follow LeetCode's public
 * SQL 50 plan; every statement, table, row, test, solution and explanation is our own words and our own data
 * (see ../sql-types.ts). Answers run on Postgres (PGlite) in the browser.
 * - 620 Not Boring Movies (Easy)
 */
import type {SqlProblemSeed} from "../sql-types";

export const sql: SqlProblemSeed[] = [
  {
    kind: "sql",
    lc: 620,
    topic: "sql-basic-aggregate",
    title: "Not Boring Movies",
    difficulty: "Easy",
    statement: `A cinema club keeps its film list in \`film_catalog\`. The genre is \`NULL\` for films that have not been classified yet.

Pick the films for the club's **tonight list**:

- the \`film_id\` must be an **odd** number;
- the genre must **not** be \`'Documentary'\`. A film with no genre recorded (\`NULL\`) is still allowed;
- show the highest \`audience_score\` first, and put films with the same score in ascending \`film_id\` order.

Return \`film_id\`, \`title\`, \`genre\` and \`audience_score\`, in that column order.`,
    tables: [
      {
        name: "film_catalog",
        note: "One row per film.",
        columns: [
          {name: "film_id", type: "integer", pk: true},
          {name: "title", type: "text"},
          {name: "genre", type: "text", note: "NULL when unclassified."},
          {name: "audience_score", type: "numeric(3,1)", note: "0.0 to 10.0."},
        ],
      },
    ],
    examples: [
      {
        tables: [
          {
            name: "film_catalog",
            columns: ["film_id", "title", "genre", "audience_score"],
            rows: [
              [1, "Harbour Lights", "Drama", 8.2],
              [2, "Paper Moon Run", "Comedy", 7.4],
              [3, "Salt Flats", "Documentary", 9.1],
              [4, "Deep Field", "Documentary", 8.8],
              [5, "Night Ferry", "Thriller", 8.2],
              [6, "Quiet Orchard", "Drama", 9.4],
              [7, "Tin Roof Summer", null, 6.9],
            ],
          },
        ],
        result: {
          columns: ["film_id", "title", "genre", "audience_score"],
          rows: [
            [1, "Harbour Lights", "Drama", 8.2],
            [5, "Night Ferry", "Thriller", 8.2],
            [7, "Tin Roof Summer", null, 6.9],
          ],
        },
        explanation: "Films 2, 4 and 6 have even ids. Film 3 is odd but a documentary. Films 1 and 5 tie on 8.2, so the lower id goes first. Film 7 has no genre, so it stays on the list.",
      },
    ],
    tests: [
      {
        name: "sample",
        ordered: true,
        setup: `CREATE TABLE film_catalog (film_id integer PRIMARY KEY, title text NOT NULL, genre text, audience_score numeric(3,1) NOT NULL);
INSERT INTO film_catalog VALUES
 (1, 'Harbour Lights', 'Drama', 8.2),
 (2, 'Paper Moon Run', 'Comedy', 7.4),
 (3, 'Salt Flats', 'Documentary', 9.1),
 (4, 'Deep Field', 'Documentary', 8.8),
 (5, 'Night Ferry', 'Thriller', 8.2),
 (6, 'Quiet Orchard', 'Drama', 9.4),
 (7, 'Tin Roof Summer', NULL, 6.9);`,
        expected: {columns: ["film_id", "title", "genre", "audience_score"], rows: [[1, "Harbour Lights", "Drama", 8.2], [5, "Night Ferry", "Thriller", 8.2], [7, "Tin Roof Summer", null, 6.9]]},
      },
      {
        name: "ties and larger ids",
        ordered: true,
        setup: `CREATE TABLE film_catalog (film_id integer PRIMARY KEY, title text NOT NULL, genre text, audience_score numeric(3,1) NOT NULL);
INSERT INTO film_catalog VALUES
 (1, 'A', 'Drama', 7.0),
 (3, 'B', 'Drama', 9.5),
 (5, 'C', 'Comedy', 7.0),
 (9, 'D', 'Drama', 9.5),
 (11, 'E', 'Comedy', 8.0);`,
        expected: {columns: ["film_id", "title", "genre", "audience_score"], rows: [[3, "B", "Drama", 9.5], [9, "D", "Drama", 9.5], [11, "E", "Comedy", 8], [1, "A", "Drama", 7], [5, "C", "Comedy", 7]]},
      },
      {
        name: "nothing qualifies",
        ordered: true,
        setup: `CREATE TABLE film_catalog (film_id integer PRIMARY KEY, title text NOT NULL, genre text, audience_score numeric(3,1) NOT NULL);
INSERT INTO film_catalog VALUES
 (1, 'X', 'Documentary', 5.0),
 (2, 'Y', 'Drama', 9.0),
 (4, 'Z', 'Comedy', 8.0);`,
        expected: {columns: ["film_id", "title", "genre", "audience_score"], rows: []},
      },
      {
        name: "unclassified genre stays",
        ordered: true,
        setup: `CREATE TABLE film_catalog (film_id integer PRIMARY KEY, title text NOT NULL, genre text, audience_score numeric(3,1) NOT NULL);
INSERT INTO film_catalog VALUES
 (1, 'P', NULL, 5.5),
 (3, 'Q', 'Drama', 6.0),
 (5, 'R', NULL, 6.0),
 (7, 'S', 'Documentary', 9.9);`,
        expected: {columns: ["film_id", "title", "genre", "audience_score"], rows: [[3, "Q", "Drama", 6], [5, "R", null, 6], [1, "P", null, 5.5]]},
      },
    ],
    solution: `SELECT film_id, title, genre, audience_score
FROM film_catalog
WHERE film_id % 2 = 1
  AND genre IS DISTINCT FROM 'Documentary'
ORDER BY audience_score DESC, film_id ASC`,
    approaches: [
      {
        id: "is-distinct-from",
        title: "IS DISTINCT FROM for the NULL-safe genre test",
        optimal: true,
        explanation: "`genre <> 'Documentary'` is unknown when the genre is NULL, so `WHERE` would drop unclassified films, which the question wants to keep. `IS DISTINCT FROM` treats NULL as an ordinary value and answers true or false, so one condition expresses the rule. The odd-id test is `film_id % 2 = 1`, and the two-key `ORDER BY` makes ties deterministic.",
        code: `SELECT film_id, title, genre, audience_score
FROM film_catalog
WHERE film_id % 2 = 1
  AND genre IS DISTINCT FROM 'Documentary'
ORDER BY audience_score DESC, film_id ASC`,
      },
      {
        id: "or-is-null",
        title: "Spell the NULL case out with OR",
        optimal: false,
        explanation: "Write the genre rule as `genre <> 'Documentary' OR genre IS NULL`, and group it in parentheses so it does not swallow the odd-id condition. It is equivalent and works in every SQL dialect, but it is longer and easy to get wrong when `AND` and `OR` are mixed without brackets.",
        code: `SELECT film_id, title, genre, audience_score
FROM film_catalog
WHERE MOD(film_id, 2) = 1
  AND (genre <> 'Documentary' OR genre IS NULL)
ORDER BY audience_score DESC, film_id ASC`,
      },
    ],
    hints: [
      "How do you test that a number is odd? Think about the remainder after dividing by 2.",
      "What does `genre <> 'Documentary'` evaluate to when genre is NULL?",
      "Which ORDER BY keys give a single, repeatable order?",
    ],
    clarify: [
      {question: "Is a film with no genre allowed on the list?", answer: "Yes. Only films known to be documentaries are excluded."},
      {question: "How are films with the same score ordered?", answer: "By ascending film_id."},
    ],
    followUps: ["How would the result change if unclassified films had to be excluded as well, and which condition would you simplify?"],
    mysqlNote: "MySQL has no `IS DISTINCT FROM`; its NULL-safe comparison is `<=>`, so the genre rule becomes `NOT (genre <=> 'Documentary')`. `%` and `MOD()` work in both databases. Sorting also differs for NULLs: Postgres puts NULLs first in a descending sort, MySQL puts them last, which does not matter here because the score is never NULL.",
  },
];
