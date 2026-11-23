/**
 * SQL problems: Basic Joins (SQL 50 topic 2). Question numbers and titles follow LeetCode's public SQL 50 plan;
 * every statement, table, row, test, solution and explanation is our own words and our own data (see ../sql-types.ts).
 * Answers run on Postgres (PGlite) in the browser.
 * - 1378 Replace Employee ID With The Unique Identifier (Easy)
 */
import type {SqlProblemSeed} from "../sql-types";

export const sql: SqlProblemSeed[] = [
  {
    kind: "sql",
    lc: 1378,
    topic: "sql-basic-joins",
    title: "Replace Employee ID With The Unique Identifier",
    difficulty: "Easy",
    statement: `A company keeps its staff list in \`staff\` and the door badges it has issued in \`badge_codes\`. Not everyone has been given a badge yet, and a badge row can outlive the person it was issued to.

Write a query that shows **every** staff member's \`full_name\` next to their \`badge_code\`.

- Staff without a badge still appear, with \`NULL\` as the badge code.
- Badge rows whose \`staff_id\` is not in \`staff\` must not appear.
- Return two columns, \`full_name\` then \`badge_code\`. Two different people can share a name, so keep both rows.
- The rows can come back in any order.`,
    tables: [
      {name: "staff", note: "One row per person.", columns: [{name: "staff_id", type: "integer", pk: true}, {name: "full_name", type: "text"}]},
      {name: "badge_codes", note: "At most one badge per person; no foreign key, so orphan rows are possible.", columns: [{name: "staff_id", type: "integer", pk: true}, {name: "badge_code", type: "text"}]},
    ],
    examples: [
      {
        tables: [
          {name: "staff", columns: ["staff_id", "full_name"], rows: [[1, "Maya Ortiz"], [2, "Ben Hale"], [3, "Ines Duarte"], [4, "Sam Whitlock"]]},
          {name: "badge_codes", columns: ["staff_id", "badge_code"], rows: [[1, "B-1001"], [3, "B-1003"]]},
        ],
        result: {columns: ["full_name", "badge_code"], rows: [["Maya Ortiz", "B-1001"], ["Ben Hale", null], ["Ines Duarte", "B-1003"], ["Sam Whitlock", null]]},
        explanation: "Ben and Sam have no badge row, so their badge code is NULL, but they are still listed.",
      },
    ],
    tests: [
      {
        name: "sample",
        ordered: false,
        setup: `CREATE TABLE staff (staff_id integer PRIMARY KEY, full_name text NOT NULL);
CREATE TABLE badge_codes (staff_id integer PRIMARY KEY, badge_code text NOT NULL);
INSERT INTO staff VALUES (1, 'Maya Ortiz'), (2, 'Ben Hale'), (3, 'Ines Duarte'), (4, 'Sam Whitlock');
INSERT INTO badge_codes VALUES (1, 'B-1001'), (3, 'B-1003');`,
        expected: {columns: ["full_name", "badge_code"], rows: [["Maya Ortiz", "B-1001"], ["Ben Hale", null], ["Ines Duarte", "B-1003"], ["Sam Whitlock", null]]},
      },
      {
        name: "everyone has a badge",
        ordered: false,
        setup: `CREATE TABLE staff (staff_id integer PRIMARY KEY, full_name text NOT NULL);
CREATE TABLE badge_codes (staff_id integer PRIMARY KEY, badge_code text NOT NULL);
INSERT INTO staff VALUES (10, 'Lee Park'), (11, 'Ada Cole');
INSERT INTO badge_codes VALUES (10, 'L-10'), (11, 'A-11');`,
        expected: {columns: ["full_name", "badge_code"], rows: [["Lee Park", "L-10"], ["Ada Cole", "A-11"]]},
      },
      {
        name: "no badges issued",
        ordered: false,
        setup: `CREATE TABLE staff (staff_id integer PRIMARY KEY, full_name text NOT NULL);
CREATE TABLE badge_codes (staff_id integer PRIMARY KEY, badge_code text NOT NULL);
INSERT INTO staff VALUES (1, 'Rosa Quill'), (2, 'Tom Birch');`,
        expected: {columns: ["full_name", "badge_code"], rows: [["Rosa Quill", null], ["Tom Birch", null]]},
      },
      {
        name: "two people share a name",
        ordered: false,
        setup: `CREATE TABLE staff (staff_id integer PRIMARY KEY, full_name text NOT NULL);
CREATE TABLE badge_codes (staff_id integer PRIMARY KEY, badge_code text NOT NULL);
INSERT INTO staff VALUES (5, 'Chris Moy'), (6, 'Chris Moy'), (7, 'Chris Moy');
INSERT INTO badge_codes VALUES (7, 'X-7');`,
        expected: {columns: ["full_name", "badge_code"], rows: [["Chris Moy", null], ["Chris Moy", null], ["Chris Moy", "X-7"]]},
      },
      {
        name: "badge row without a person",
        ordered: false,
        setup: `CREATE TABLE staff (staff_id integer PRIMARY KEY, full_name text NOT NULL);
CREATE TABLE badge_codes (staff_id integer PRIMARY KEY, badge_code text NOT NULL);
INSERT INTO staff VALUES (1, 'Solo Vance');
INSERT INTO badge_codes VALUES (99, 'GHOST-99');`,
        expected: {columns: ["full_name", "badge_code"], rows: [["Solo Vance", null]]},
      },
      {
        name: "empty staff list",
        ordered: false,
        setup: `CREATE TABLE staff (staff_id integer PRIMARY KEY, full_name text NOT NULL);
CREATE TABLE badge_codes (staff_id integer PRIMARY KEY, badge_code text NOT NULL);
INSERT INTO badge_codes VALUES (3, 'B-3');`,
        expected: {columns: ["full_name", "badge_code"], rows: []},
      },
    ],
    solution: `SELECT s.full_name, b.badge_code
FROM staff AS s
LEFT JOIN badge_codes AS b ON b.staff_id = s.staff_id`,
    approaches: [
      {
        id: "left-join",
        title: "LEFT JOIN from staff to badge_codes",
        optimal: true,
        explanation: "The question is about *every* person, so `staff` must be the preserved (left) side. A `LEFT JOIN` keeps each staff row and fills `badge_code` with `NULL` when no badge matches. Badge rows with no matching person are never reached, because the join starts from staff. Because `badge_codes.staff_id` is the primary key, no staff row can be duplicated.",
        code: `SELECT s.full_name, b.badge_code
FROM staff AS s
LEFT JOIN badge_codes AS b ON b.staff_id = s.staff_id`,
      },
      {
        id: "scalar-subquery",
        title: "Look the badge up with a scalar subquery",
        optimal: false,
        explanation: "For each staff row, run a subquery that fetches the badge code; it returns `NULL` when nothing matches. This is correct only because a person has at most one badge: a second matching row would make Postgres raise an error. The planner usually turns it into a join anyway, but the join states the intent more directly and survives schema changes.",
        code: `SELECT s.full_name,
       (SELECT b.badge_code FROM badge_codes AS b WHERE b.staff_id = s.staff_id) AS badge_code
FROM staff AS s`,
      },
    ],
    hints: [
      "Which table must keep all of its rows, whatever happens in the other one?",
      "What does a LEFT JOIN put in the right-hand columns when there is no match?",
    ],
    clarify: [
      {question: "Can a person hold more than one badge?", answer: "No. `staff_id` is the primary key of `badge_codes`, so there is at most one."},
      {question: "Should badge rows for people who are not in staff be listed?", answer: "No. Only staff members are listed."},
    ],
    followUps: ["How would you list only the people who have no badge, and what is the join-based way to write it?"],
    mysqlNote: "The LEFT JOIN is identical in MySQL. The usual trip-ups are quoting and case: MySQL quotes identifiers with backticks, while Postgres uses double quotes and folds unquoted names to lower case, so an alias like `AS \"Badge\"` keeps its capital letter only when quoted.",
  },
];
