/**
 * SQL problems: Subqueries (SQL 50 topic 6). Question numbers and titles follow LeetCode's public SQL 50 plan;
 * every statement, table, row, test, solution and explanation is our own words and our own data
 * (see ../sql-types.ts). Answers run on Postgres (PGlite) in the browser.
 * - 1978 Employees Whose Manager Left the Company (Easy)
 * - 626 Exchange Seats (Medium)
 * - 1341 Movie Rating (Medium)
 * - 1321 Restaurant Growth (Medium)
 * - 602 Friend Requests II: Who Has the Most Friends (Medium)
 * - 585 Investments in 2016 (Medium)
 * - 185 Department Top Three Salaries (Hard)
 */
import type {SqlCell, SqlProblemSeed} from "../sql-types";

const t = (name: string, setup: string, columns: string[], rows: SqlCell[][], ordered = false) => ({name, setup, expected: {columns, rows}, ordered});

export const sql: SqlProblemSeed[] = [
  {
    kind: "sql",
    lc: 1978,
    topic: "sql-subqueries",
    title: "Employees Whose Manager Left the Company",
    difficulty: "Easy",
    statement: `\`payroll_people\` lists the people who work at a company now. \`manager_id\` points at another row's \`employee_id\`. It is \`NULL\` for people who have no manager. When a manager leaves, their row is deleted, but the people they managed keep the old \`manager_id\`.

Find the people who:

- earn a salary **strictly below 25000**, and
- have a manager id that **no longer exists** in the table. People with no manager at all (\`NULL\`) are not included.

Return \`employee_id\`, sorted ascending.`,
    tables: [
      {name: "payroll_people", columns: [{name: "employee_id", type: "integer", pk: true}, {name: "name", type: "text"}, {name: "manager_id", type: "integer", note: "NULL if no manager."}, {name: "salary", type: "integer"}]},
    ],
    examples: [
      {
        tables: [{name: "payroll_people", columns: ["employee_id", "name", "manager_id", "salary"], rows: [[1, "Ava", null, 90000], [2, "Bo", 1, 20000], [3, "Cal", 9, 24000], [4, "Dee", 8, 25000], [5, "Eve", 2, 10000], [6, "Fay", 7, 24999]]}],
        result: {columns: ["employee_id"], rows: [[3], [6]]},
        explanation: "Cal's manager 9 and Fay's manager 7 are not in the table, and both earn less than 25000. Dee's manager is also gone, but Dee earns exactly 25000. Bo and Eve have managers who still work there.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE payroll_people (employee_id integer PRIMARY KEY, name text NOT NULL, manager_id integer, salary integer NOT NULL);
INSERT INTO payroll_people VALUES (1, 'Ava', NULL, 90000), (2, 'Bo', 1, 20000), (3, 'Cal', 9, 24000), (4, 'Dee', 8, 25000), (5, 'Eve', 2, 10000), (6, 'Fay', 7, 24999);`, ["employee_id"], [[3], [6]], true),
      t("people with no manager are not included", `CREATE TABLE payroll_people (employee_id integer PRIMARY KEY, name text NOT NULL, manager_id integer, salary integer NOT NULL);
INSERT INTO payroll_people VALUES (1, 'A', NULL, 100), (2, 'B', NULL, 200);`, ["employee_id"], [], true),
      t("sorted by id", `CREATE TABLE payroll_people (employee_id integer PRIMARY KEY, name text NOT NULL, manager_id integer, salary integer NOT NULL);
INSERT INTO payroll_people VALUES (8, 'H', 99, 10), (2, 'B', 98, 20), (5, 'E', 97, 24999), (1, 'Boss', NULL, 50000);`, ["employee_id"], [[2], [5], [8]], true),
      t("every manager still works there", `CREATE TABLE payroll_people (employee_id integer PRIMARY KEY, name text NOT NULL, manager_id integer, salary integer NOT NULL);
INSERT INTO payroll_people VALUES (1, 'A', NULL, 50000), (2, 'B', 1, 10), (3, 'C', 2, 10);`, ["employee_id"], [], true),
    ],
    solution: `SELECT e.employee_id
FROM payroll_people e
WHERE e.salary < 25000
  AND e.manager_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM payroll_people m WHERE m.employee_id = e.manager_id
  )
ORDER BY e.employee_id`,
    approaches: [
      {
        id: "not-exists",
        title: "NOT EXISTS: no row for the manager id",
        optimal: true,
        explanation: "For each low-paid person, the subquery looks for a row whose id equals their `manager_id`. `NOT EXISTS` is true when none is found. It is safe with NULLs. Without `manager_id IS NOT NULL`, a person with no manager would also pass `NOT EXISTS`, because nothing equals NULL, so that condition is needed.",
        code: `SELECT e.employee_id
FROM payroll_people e
WHERE e.salary < 25000
  AND e.manager_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM payroll_people m WHERE m.employee_id = e.manager_id
  )
ORDER BY e.employee_id`,
      },
      {
        id: "left-join-anti",
        title: "LEFT JOIN the manager and keep the misses",
        optimal: false,
        explanation: "Join each person to their manager's row with a `LEFT JOIN`. When the manager is gone, every `m` column is NULL, so `m.employee_id IS NULL` finds the missing managers. This is the 'anti-join' pattern. It gives the same rows as `NOT EXISTS`; the explicit `manager_id IS NOT NULL` is still required.",
        code: `SELECT e.employee_id
FROM payroll_people e
LEFT JOIN payroll_people m ON m.employee_id = e.manager_id
WHERE e.salary < 25000
  AND e.manager_id IS NOT NULL
  AND m.employee_id IS NULL
ORDER BY e.employee_id`,
      },
      {
        id: "not-in",
        title: "NOT IN a list of current employee ids",
        optimal: false,
        explanation: "`manager_id NOT IN (SELECT employee_id FROM payroll_people)` reads almost like English. It is safe here only because `employee_id` is a primary key and never NULL. If the subquery could return a NULL, `NOT IN` would match nothing at all, which is why many teams prefer `NOT EXISTS`.",
        code: `SELECT employee_id
FROM payroll_people
WHERE salary < 25000
  AND manager_id NOT IN (SELECT employee_id FROM payroll_people)
ORDER BY employee_id`,
      },
    ],
    hints: [
      "How do you check that a row for the manager id exists?",
      "What does `NOT EXISTS` return for a person whose manager_id is NULL?",
      "Is 25000 itself included?",
    ],
    clarify: [
      {question: "Does someone with no manager count as 'manager left'?", answer: "No. A NULL manager_id means they never had one."},
      {question: "Is the salary limit strict?", answer: "Yes. Exactly 25000 is excluded."},
    ],
    followUps: ["How would you find people whose manager's own manager has left?"],
  },
  {
    kind: "sql",
    lc: 626,
    topic: "sql-subqueries",
    title: "Exchange Seats",
    difficulty: "Medium",
    statement: `\`theatre_seats\` lists the guest in each seat. Seat ids go 1, 2, 3 and so on with no gaps. A seat may be empty, shown by a \`NULL\` guest.

Swap the guests of seats 1 and 2, then 3 and 4, and so on. If the number of seats is odd, the last guest stays where they are. The seat ids stay the same; only the guests move.

Return \`id\` and \`student\` for every seat, sorted by \`id\`.`,
    tables: [
      {name: "theatre_seats", columns: [{name: "id", type: "integer", pk: true}, {name: "student", type: "text", note: "NULL for an empty seat."}]},
    ],
    examples: [
      {
        tables: [{name: "theatre_seats", columns: ["id", "student"], rows: [[1, "Ana"], [2, "Bea"], [3, "Cleo"], [4, "Dev"], [5, "Eli"]]}],
        result: {columns: ["id", "student"], rows: [[1, "Bea"], [2, "Ana"], [3, "Dev"], [4, "Cleo"], [5, "Eli"]]},
        explanation: "Seats 1 and 2 swap, seats 3 and 4 swap. Seat 5 has no partner, so Eli stays.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE theatre_seats (id integer PRIMARY KEY, student text);
INSERT INTO theatre_seats VALUES (3, 'Cleo'), (1, 'Ana'), (5, 'Eli'), (2, 'Bea'), (4, 'Dev');`, ["id", "student"], [[1, "Bea"], [2, "Ana"], [3, "Dev"], [4, "Cleo"], [5, "Eli"]], true),
      t("even number of seats", `CREATE TABLE theatre_seats (id integer PRIMARY KEY, student text);
INSERT INTO theatre_seats VALUES (1, 'A'), (2, 'B'), (3, 'C'), (4, 'D');`, ["id", "student"], [[1, "B"], [2, "A"], [3, "D"], [4, "C"]], true),
      t("one seat only", `CREATE TABLE theatre_seats (id integer PRIMARY KEY, student text);
INSERT INTO theatre_seats VALUES (1, 'Solo');`, ["id", "student"], [[1, "Solo"]], true),
      t("an empty seat moves too", `CREATE TABLE theatre_seats (id integer PRIMARY KEY, student text);
INSERT INTO theatre_seats VALUES (1, 'A'), (2, NULL), (3, 'C');`, ["id", "student"], [[1, null], [2, "A"], [3, "C"]], true),
      t("no seats", `CREATE TABLE theatre_seats (id integer PRIMARY KEY, student text);`, ["id", "student"], [], true),
    ],
    solution: `SELECT id,
       CASE WHEN id % 2 = 1 AND next_id IS NOT NULL THEN next_student
            WHEN id % 2 = 0 THEN prev_student
            ELSE student
       END AS student
FROM (
  SELECT id, student,
         LEAD(id) OVER w AS next_id,
         LEAD(student) OVER w AS next_student,
         LAG(student) OVER w AS prev_student
  FROM theatre_seats
  WINDOW w AS (ORDER BY id)
) s
ORDER BY id`,
    approaches: [
      {
        id: "lead-lag",
        title: "LEAD and LAG pick the neighbour's guest",
        optimal: true,
        explanation: "`LEAD` reads the next seat and `LAG` the previous one in one pass. An odd seat takes the next guest, unless there is no next seat (the last odd seat). An even seat takes the previous guest. The test is on `next_id`, not on the guest, so an empty (NULL) seat still moves correctly.",
        code: `SELECT id,
       CASE WHEN id % 2 = 1 AND next_id IS NOT NULL THEN next_student
            WHEN id % 2 = 0 THEN prev_student
            ELSE student
       END AS student
FROM (
  SELECT id, student,
         LEAD(id) OVER w AS next_id,
         LEAD(student) OVER w AS next_student,
         LAG(student) OVER w AS prev_student
  FROM theatre_seats
  WINDOW w AS (ORDER BY id)
) s
ORDER BY id`,
      },
      {
        id: "self-join-neighbours",
        title: "Join each seat to the seat before and after it",
        optimal: false,
        explanation: "Two `LEFT JOIN`s on `id + 1` and `id - 1` bring the neighbours onto each row, and a `CASE` chooses between them. Checking `n.id IS NOT NULL` (the seat exists) rather than the guest keeps empty seats correct. It works on any database, but joins the table three times.",
        code: `SELECT s.id,
       CASE WHEN s.id % 2 = 1 AND n.id IS NOT NULL THEN n.student
            WHEN s.id % 2 = 0 THEN p.student
            ELSE s.student
       END AS student
FROM theatre_seats s
LEFT JOIN theatre_seats n ON n.id = s.id + 1
LEFT JOIN theatre_seats p ON p.id = s.id - 1
ORDER BY s.id`,
      },
    ],
    hints: [
      "Which seats take the guest from the seat after them, and which from the seat before?",
      "What happens to the last seat if the count is odd?",
      "Should you check that the neighbour seat exists, or that its guest is not NULL?",
    ],
    clarify: [
      {question: "Do the ids move?", answer: "No. The ids stay; the guests move."},
      {question: "What about an empty seat?", answer: "It swaps like any other seat, so the NULL moves to the neighbour."},
    ],
    followUps: ["How would you rotate guests three places so that seat 1 gets the guest from seat 3?"],
  },
  {
    kind: "sql",
    lc: 1341,
    topic: "sql-subqueries",
    title: "Movie Rating",
    difficulty: "Medium",
    statement: `A film club records ratings in \`film_ratings\`. A rating can be \`NULL\` when someone skipped scoring.

Return **two rows** in one column called \`results\`:

1. The **name of the member who made the most ratings** (count every row). If several members tie, return the name that comes first alphabetically.
2. The **title of the film with the highest average rating in March 2025** (dates from 2025-03-01 up to but not including 2025-04-01). Ignore NULL ratings when averaging. If films tie, return the title that comes first alphabetically.

The member row comes first. If a part has no answer (for example, no ratings in March), leave that row out.`,
    tables: [
      {name: "film_catalog", columns: [{name: "movie_id", type: "integer", pk: true}, {name: "title", type: "text"}]},
      {name: "members", columns: [{name: "user_id", type: "integer", pk: true}, {name: "name", type: "text"}]},
      {name: "film_ratings", note: "One row per rating.", columns: [{name: "movie_id", type: "integer"}, {name: "user_id", type: "integer"}, {name: "rating", type: "integer", note: "NULL if skipped."}, {name: "created_at", type: "date"}]},
    ],
    examples: [
      {
        tables: [
          {name: "film_catalog", columns: ["movie_id", "title"], rows: [[1, "Alpha"], [2, "Bravo"], [3, "Cargo"]]},
          {name: "members", columns: ["user_id", "name"], rows: [[1, "Dina"], [2, "Evan"], [3, "Dana"]]},
          {name: "film_ratings", columns: ["movie_id", "user_id", "rating", "created_at"], rows: [[1, 1, 5, "2025-03-02"], [2, 1, 4, "2025-03-05"], [3, 1, 3, "2025-02-20"], [1, 2, 4, "2025-03-10"], [2, 2, 2, "2025-03-11"], [3, 3, 5, "2025-04-01"]]},
        ],
        result: {columns: ["results"], rows: [["Dina"], ["Alpha"]]},
        explanation: "Dina made 3 ratings, the most. In March, Alpha averages 4.5 and Bravo 3. Cargo has no ratings in March.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE film_catalog (movie_id integer PRIMARY KEY, title text NOT NULL);
CREATE TABLE members (user_id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE film_ratings (movie_id integer NOT NULL, user_id integer NOT NULL, rating integer, created_at date NOT NULL);
INSERT INTO film_catalog VALUES (1, 'Alpha'), (2, 'Bravo'), (3, 'Cargo');
INSERT INTO members VALUES (1, 'Dina'), (2, 'Evan'), (3, 'Dana');
INSERT INTO film_ratings VALUES (1, 1, 5, '2025-03-02'), (2, 1, 4, '2025-03-05'), (3, 1, 3, '2025-02-20'), (1, 2, 4, '2025-03-10'), (2, 2, 2, '2025-03-11'), (3, 3, 5, '2025-04-01');`, ["results"], [["Dina"], ["Alpha"]], true),
      t("ties are broken alphabetically", `CREATE TABLE film_catalog (movie_id integer PRIMARY KEY, title text NOT NULL);
CREATE TABLE members (user_id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE film_ratings (movie_id integer NOT NULL, user_id integer NOT NULL, rating integer, created_at date NOT NULL);
INSERT INTO film_catalog VALUES (1, 'Beta'), (2, 'Aero');
INSERT INTO members VALUES (1, 'Zed'), (2, 'Amy');
INSERT INTO film_ratings VALUES (1, 1, 4, '2025-03-01'), (2, 1, 4, '2025-03-02'), (1, 2, 4, '2025-03-03'), (2, 2, 4, '2025-03-04');`, ["results"], [["Amy"], ["Aero"]], true),
      t("a skipped rating does not win", `CREATE TABLE film_catalog (movie_id integer PRIMARY KEY, title text NOT NULL);
CREATE TABLE members (user_id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE film_ratings (movie_id integer NOT NULL, user_id integer NOT NULL, rating integer, created_at date NOT NULL);
INSERT INTO film_catalog VALUES (1, 'Skipped'), (2, 'Real');
INSERT INTO members VALUES (1, 'U');
INSERT INTO film_ratings VALUES (1, 1, NULL, '2025-03-05'), (2, 1, 3, '2025-03-06');`, ["results"], [["U"], ["Real"]], true),
      t("month boundaries", `CREATE TABLE film_catalog (movie_id integer PRIMARY KEY, title text NOT NULL);
CREATE TABLE members (user_id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE film_ratings (movie_id integer NOT NULL, user_id integer NOT NULL, rating integer, created_at date NOT NULL);
INSERT INTO film_catalog VALUES (1, 'Mar1'), (2, 'Apr1');
INSERT INTO members VALUES (1, 'U');
INSERT INTO film_ratings VALUES (1, 1, 1, '2025-03-01'), (2, 1, 5, '2025-04-01');`, ["results"], [["U"], ["Mar1"]], true),
      t("no ratings in March", `CREATE TABLE film_catalog (movie_id integer PRIMARY KEY, title text NOT NULL);
CREATE TABLE members (user_id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE film_ratings (movie_id integer NOT NULL, user_id integer NOT NULL, rating integer, created_at date NOT NULL);
INSERT INTO film_catalog VALUES (1, 'F');
INSERT INTO members VALUES (1, 'Solo');
INSERT INTO film_ratings VALUES (1, 1, 4, '2025-02-10');`, ["results"], [["Solo"]], true),
      t("no ratings at all", `CREATE TABLE film_catalog (movie_id integer PRIMARY KEY, title text NOT NULL);
CREATE TABLE members (user_id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE film_ratings (movie_id integer NOT NULL, user_id integer NOT NULL, rating integer, created_at date NOT NULL);
INSERT INTO film_catalog VALUES (1, 'F');
INSERT INTO members VALUES (1, 'Solo');`, ["results"], [], true),
    ],
    solution: `WITH top_member AS (
  SELECT m.name AS results
  FROM film_ratings r
  JOIN members m ON m.user_id = r.user_id
  GROUP BY m.user_id, m.name
  ORDER BY COUNT(*) DESC, m.name
  LIMIT 1
),
top_film AS (
  SELECT f.title AS results
  FROM film_ratings r
  JOIN film_catalog f ON f.movie_id = r.movie_id
  WHERE r.created_at >= DATE '2025-03-01' AND r.created_at < DATE '2025-04-01'
  GROUP BY f.movie_id, f.title
  ORDER BY AVG(r.rating) DESC NULLS LAST, f.title
  LIMIT 1
)
SELECT results FROM top_member
UNION ALL
SELECT results FROM top_film`,
    approaches: [
      {
        id: "order-limit-one",
        title: "Two CTEs, each with ORDER BY ... LIMIT 1",
        optimal: true,
        explanation: "Each part is a 'top one' problem: group, sort best first with the tie-break as the second sort key, and take one row. `NULLS LAST` matters in Postgres, because in a descending sort NULL averages (films with only skipped ratings) would otherwise come first. A half-open date range (`>=` start, `<` next month) includes the whole of March and nothing of April. `UNION ALL` stacks the two answers, member first.",
        code: `WITH top_member AS (
  SELECT m.name AS results
  FROM film_ratings r
  JOIN members m ON m.user_id = r.user_id
  GROUP BY m.user_id, m.name
  ORDER BY COUNT(*) DESC, m.name
  LIMIT 1
),
top_film AS (
  SELECT f.title AS results
  FROM film_ratings r
  JOIN film_catalog f ON f.movie_id = r.movie_id
  WHERE r.created_at >= DATE '2025-03-01' AND r.created_at < DATE '2025-04-01'
  GROUP BY f.movie_id, f.title
  ORDER BY AVG(r.rating) DESC NULLS LAST, f.title
  LIMIT 1
)
SELECT results FROM top_member
UNION ALL
SELECT results FROM top_film`,
      },
      {
        id: "row-number-window",
        title: "ROW_NUMBER over the grouped results",
        optimal: false,
        explanation: "Number the grouped rows with `ROW_NUMBER() OVER (ORDER BY ...)` using the same sort keys, and keep number 1. It gives the same answers, and is easy to change to 'top three' later, but is longer than `LIMIT 1` for a single winner.",
        code: `WITH member_rank AS (
  SELECT m.name AS results,
         ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC, m.name) AS rn
  FROM film_ratings r
  JOIN members m ON m.user_id = r.user_id
  GROUP BY m.user_id, m.name
),
film_rank AS (
  SELECT f.title AS results,
         ROW_NUMBER() OVER (ORDER BY AVG(r.rating) DESC NULLS LAST, f.title) AS rn
  FROM film_ratings r
  JOIN film_catalog f ON f.movie_id = r.movie_id
  WHERE r.created_at >= DATE '2025-03-01' AND r.created_at < DATE '2025-04-01'
  GROUP BY f.movie_id, f.title
)
SELECT results FROM member_rank WHERE rn = 1
UNION ALL
SELECT results FROM film_rank WHERE rn = 1`,
      },
    ],
    hints: [
      "Treat the two answers as two separate queries, then stack them.",
      "How do you break a tie in ORDER BY? Add a second key.",
      "In a descending sort in Postgres, where do NULL averages go, and how do you change that?",
    ],
    clarify: [
      {question: "Which row comes first?", answer: "The member. The film row is second."},
      {question: "Is a skipped (NULL) rating counted as a rating for the member count?", answer: "Yes. Count every row for the member. Only the average ignores NULL."},
    ],
    followUps: ["How would you return the top three films instead of one, keeping ties together?"],
    mysqlNote: "MySQL has no `NULLS LAST`; it already sorts NULLs last in a descending sort, so just write `ORDER BY AVG(r.rating) DESC, f.title`. Wrap each `SELECT ... LIMIT 1` in brackets when you use `UNION ALL` in MySQL, instead of using CTEs.",
  },
  {
    kind: "sql",
    lc: 1321,
    topic: "sql-subqueries",
    title: "Restaurant Growth",
    difficulty: "Medium",
    statement: `\`till_receipts\` has one row for each receipt printed at a restaurant. Several receipts can share a day. Every calendar day from the first to the last day in the table has at least one receipt (no missing days).

For each day, look at a **7-day moving window**: that day and the 6 days before it. Return a row only for days that have 6 earlier days of data, so the first row is the 7th day.

Return:

- \`visited_on\`: the day;
- \`amount\`: the total of all receipts in the 7-day window;
- \`average_amount\`: \`amount\` divided by 7, rounded to 2 decimal places.

Sort by \`visited_on\`.`,
    tables: [
      {name: "till_receipts", columns: [{name: "receipt_id", type: "integer", pk: true}, {name: "customer", type: "text"}, {name: "visit_date", type: "date"}, {name: "amount", type: "integer"}]},
    ],
    examples: [
      {
        tables: [{name: "till_receipts", columns: ["receipt_id", "customer", "visit_date", "amount"], rows: [[1, "a", "2025-01-01", 30], [2, "b", "2025-01-01", 20], [3, "a", "2025-01-02", 100], [4, "c", "2025-01-03", 60], [5, "b", "2025-01-04", 90], [6, "a", "2025-01-05", 80], [7, "d", "2025-01-06", 70], [8, "c", "2025-01-07", 120], [9, "a", "2025-01-08", 50], [10, "e", "2025-01-09", 150]]}],
        result: {columns: ["visited_on", "amount", "average_amount"], rows: [["2025-01-07", 570, 81.43], ["2025-01-08", 570, 81.43], ["2025-01-09", 620, 88.57]]},
        explanation: "Daily totals are 50, 100, 60, 90, 80, 70, 120, 50, 150. The first 7-day window ends on 7 January: 570. Sliding by one day swaps 50 for 50, so 8 January is also 570. Then 100 leaves and 150 enters: 620.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE till_receipts (receipt_id integer PRIMARY KEY, customer text NOT NULL, visit_date date NOT NULL, amount integer NOT NULL);
INSERT INTO till_receipts VALUES (1, 'a', '2025-01-01', 30), (2, 'b', '2025-01-01', 20), (3, 'a', '2025-01-02', 100), (4, 'c', '2025-01-03', 60), (5, 'b', '2025-01-04', 90), (6, 'a', '2025-01-05', 80), (7, 'd', '2025-01-06', 70), (8, 'c', '2025-01-07', 120), (9, 'a', '2025-01-08', 50), (10, 'e', '2025-01-09', 150);`, ["visited_on", "amount", "average_amount"], [["2025-01-07", 570, 81.43], ["2025-01-08", 570, 81.43], ["2025-01-09", 620, 88.57]], true),
      t("exactly seven days, many receipts a day", `CREATE TABLE till_receipts (receipt_id integer PRIMARY KEY, customer text NOT NULL, visit_date date NOT NULL, amount integer NOT NULL);
INSERT INTO till_receipts VALUES (1, 'a', '2025-02-01', 5), (2, 'b', '2025-02-01', 5), (3, 'a', '2025-02-02', 10), (4, 'a', '2025-02-03', 10), (5, 'a', '2025-02-04', 10), (6, 'a', '2025-02-05', 10), (7, 'a', '2025-02-06', 10), (8, 'a', '2025-02-07', 10);`, ["visited_on", "amount", "average_amount"], [["2025-02-07", 70, 10]], true),
      t("rounding of the average", `CREATE TABLE till_receipts (receipt_id integer PRIMARY KEY, customer text NOT NULL, visit_date date NOT NULL, amount integer NOT NULL);
INSERT INTO till_receipts VALUES (1, 'a', '2025-03-01', 1), (2, 'a', '2025-03-02', 1), (3, 'a', '2025-03-03', 1), (4, 'a', '2025-03-04', 1), (5, 'a', '2025-03-05', 1), (6, 'a', '2025-03-06', 1), (7, 'a', '2025-03-07', 1), (8, 'a', '2025-03-08', 2);`, ["visited_on", "amount", "average_amount"], [["2025-03-07", 7, 1], ["2025-03-08", 8, 1.14]], true),
      t("fewer than seven days of data", `CREATE TABLE till_receipts (receipt_id integer PRIMARY KEY, customer text NOT NULL, visit_date date NOT NULL, amount integer NOT NULL);
INSERT INTO till_receipts VALUES (1, 'a', '2025-04-01', 10), (2, 'a', '2025-04-02', 10), (3, 'a', '2025-04-03', 10);`, ["visited_on", "amount", "average_amount"], [], true),
      t("empty table", `CREATE TABLE till_receipts (receipt_id integer PRIMARY KEY, customer text NOT NULL, visit_date date NOT NULL, amount integer NOT NULL);`, ["visited_on", "amount", "average_amount"], [], true),
    ],
    solution: `WITH daily AS (
  SELECT visit_date, SUM(amount) AS total
  FROM till_receipts
  GROUP BY visit_date
),
windowed AS (
  SELECT visit_date,
         SUM(total) OVER (ORDER BY visit_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS amount,
         ROW_NUMBER() OVER (ORDER BY visit_date) AS day_no
  FROM daily
)
SELECT visit_date AS visited_on, amount, ROUND(amount / 7.0, 2) AS average_amount
FROM windowed
WHERE day_no >= 7
ORDER BY visit_date`,
    approaches: [
      {
        id: "moving-window",
        title: "Daily totals, then a 7-row moving SUM",
        optimal: true,
        explanation: "First total each day (several receipts may share a day). Then `SUM(total) OVER (ORDER BY visit_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)` adds the current day and the six before it. Because no day is missing, 'six rows back' means 'six days back'. `ROW_NUMBER() >= 7` drops the early days that do not have a full window. Dividing by `7.0` avoids integer division.",
        code: `WITH daily AS (
  SELECT visit_date, SUM(amount) AS total
  FROM till_receipts
  GROUP BY visit_date
),
windowed AS (
  SELECT visit_date,
         SUM(total) OVER (ORDER BY visit_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS amount,
         ROW_NUMBER() OVER (ORDER BY visit_date) AS day_no
  FROM daily
)
SELECT visit_date AS visited_on, amount, ROUND(amount / 7.0, 2) AS average_amount
FROM windowed
WHERE day_no >= 7
ORDER BY visit_date`,
      },
      {
        id: "self-join-window",
        title: "Self join on the date range",
        optimal: false,
        explanation: "Join each day `d` to every day `w` between `d - 6` and `d`, then sum. `HAVING` keeps only days at least six days after the first day. It uses no window function and it is the classic answer for older databases, but it compares many pairs of rows.",
        code: `WITH daily AS (
  SELECT visit_date, SUM(amount) AS total
  FROM till_receipts
  GROUP BY visit_date
)
SELECT d.visit_date AS visited_on,
       SUM(w.total) AS amount,
       ROUND(SUM(w.total) / 7.0, 2) AS average_amount
FROM daily d
JOIN daily w ON w.visit_date BETWEEN d.visit_date - 6 AND d.visit_date
GROUP BY d.visit_date
HAVING d.visit_date >= (SELECT MIN(visit_date) + 6 FROM daily)
ORDER BY d.visit_date`,
      },
    ],
    hints: [
      "Several receipts can share a day. What should you do first?",
      "Which window frame covers the current row and the 6 rows before it?",
      "How do you skip the first six days?",
    ],
    clarify: [
      {question: "Can days be missing?", answer: "No. Every day between the first and last has a receipt."},
      {question: "What is the average divided by?", answer: "Always 7, since only full windows are listed."},
    ],
    followUps: ["How would you change the query if some days could be missing from the data?"],
    mysqlNote: "MySQL 8 has the same window frame syntax. Date arithmetic differs: use `DATE_SUB(d.visit_date, INTERVAL 6 DAY)` or `DATEDIFF(d.visit_date, w.visit_date) BETWEEN 0 AND 6` in the self join. `ROUND(amount / 7, 2)` already returns a decimal in MySQL, because `/` is not integer division there.",
  },
  {
    kind: "sql",
    lc: 602,
    topic: "sql-subqueries",
    title: "Friend Requests II: Who Has the Most Friends",
    difficulty: "Medium",
    statement: `\`friend_links\` stores accepted friend requests. A row means \`requester_id\` asked \`accepter_id\` and they became friends. Friendship goes both ways, so a person's friends include the people they asked and the people who asked them. No pair appears twice.

Find the person with the **most friends**. If several people tie for the most, return all of them.

Return \`id\` and \`num\` (the number of friends). The rows can come back in any order.`,
    tables: [
      {name: "friend_links", columns: [{name: "requester_id", type: "integer"}, {name: "accepter_id", type: "integer"}, {name: "accept_date", type: "date"}]},
    ],
    examples: [
      {
        tables: [{name: "friend_links", columns: ["requester_id", "accepter_id", "accept_date"], rows: [[1, 2, "2025-01-01"], [1, 3, "2025-01-02"], [2, 3, "2025-01-03"], [3, 4, "2025-01-04"]]}],
        result: {columns: ["id", "num"], rows: [[3, 3]]},
        explanation: "Person 3 is friends with 1, 2 and 4. Persons 1 and 2 have two friends each, and 4 has one.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE friend_links (requester_id integer NOT NULL, accepter_id integer NOT NULL, accept_date date NOT NULL);
INSERT INTO friend_links VALUES (1, 2, '2025-01-01'), (1, 3, '2025-01-02'), (2, 3, '2025-01-03'), (3, 4, '2025-01-04');`, ["id", "num"], [[3, 3]]),
      t("everyone ties", `CREATE TABLE friend_links (requester_id integer NOT NULL, accepter_id integer NOT NULL, accept_date date NOT NULL);
INSERT INTO friend_links VALUES (1, 2, '2025-02-01'), (3, 4, '2025-02-02');`, ["id", "num"], [[1, 1], [2, 1], [3, 1], [4, 1]]),
      t("one person asks everyone", `CREATE TABLE friend_links (requester_id integer NOT NULL, accepter_id integer NOT NULL, accept_date date NOT NULL);
INSERT INTO friend_links VALUES (5, 6, '2025-03-01'), (5, 7, '2025-03-02'), (5, 8, '2025-03-03');`, ["id", "num"], [[5, 3]]),
      t("a person who only accepts requests", `CREATE TABLE friend_links (requester_id integer NOT NULL, accepter_id integer NOT NULL, accept_date date NOT NULL);
INSERT INTO friend_links VALUES (1, 9, '2025-04-01'), (2, 9, '2025-04-02'), (3, 9, '2025-04-03'), (1, 2, '2025-04-04');`, ["id", "num"], [[9, 3]]),
      t("no friendships", `CREATE TABLE friend_links (requester_id integer NOT NULL, accepter_id integer NOT NULL, accept_date date NOT NULL);`, ["id", "num"], []),
    ],
    solution: `WITH ends AS (
  SELECT requester_id AS id FROM friend_links
  UNION ALL
  SELECT accepter_id FROM friend_links
),
counts AS (
  SELECT id, COUNT(*) AS num
  FROM ends
  GROUP BY id
)
SELECT id, num
FROM counts
WHERE num = (SELECT MAX(num) FROM counts)`,
    approaches: [
      {
        id: "union-all-max",
        title: "Stack both columns, count, keep the maximum",
        optimal: true,
        explanation: "Every row is one friendship, which counts for both people. `UNION ALL` puts both columns in one list of ids, keeping duplicates, so a person's count is the number of times their id appears. Comparing with `MAX(num)` returns everyone tied for first. `UNION` (without `ALL`) would remove repeated ids and ruin the counts.",
        code: `WITH ends AS (
  SELECT requester_id AS id FROM friend_links
  UNION ALL
  SELECT accepter_id FROM friend_links
),
counts AS (
  SELECT id, COUNT(*) AS num
  FROM ends
  GROUP BY id
)
SELECT id, num
FROM counts
WHERE num = (SELECT MAX(num) FROM counts)`,
      },
      {
        id: "rank-window",
        title: "RANK() the counts and keep rank 1",
        optimal: false,
        explanation: "Count friends per person, then `RANK() OVER (ORDER BY num DESC)` gives rank 1 to every tied leader. Keeping rank 1 returns all of them. It does the same job as the `MAX` filter, with a window function instead of a scalar subquery.",
        code: `SELECT id, num
FROM (
  SELECT id, num, RANK() OVER (ORDER BY num DESC) AS rnk
  FROM (
    SELECT id, COUNT(*) AS num
    FROM (
      SELECT requester_id AS id FROM friend_links
      UNION ALL
      SELECT accepter_id FROM friend_links
    ) ends
    GROUP BY id
  ) counts
) ranked
WHERE rnk = 1`,
      },
    ],
    hints: [
      "Does a friendship count for the requester only, or for both people?",
      "How can you put two columns into one list of ids?",
      "Why would LIMIT 1 be wrong when two people tie?",
    ],
    clarify: [
      {question: "What if two people tie?", answer: "Return all of them."},
      {question: "Can a pair appear twice?", answer: "No."},
    ],
    followUps: ["How would you list the friend ids of that person as well?"],
  },
  {
    kind: "sql",
    lc: 585,
    topic: "sql-subqueries",
    title: "Investments in 2016",
    difficulty: "Medium",
    statement: `An insurer stores policies in \`cover_policies\`. Each policy has an insured value for 2015 (\`tiv_2015\`), one for 2016 (\`tiv_2016\`, \`NULL\` if not valued yet) and a location (\`lat\`, \`lon\`). Neither \`tiv_2015\`, \`lat\` nor \`lon\` is ever \`NULL\`.

Add up \`tiv_2016\` for every policy that meets **both** rules:

- its \`tiv_2015\` is the same as the \`tiv_2015\` of **at least one other** policy;
- its location (\`lat\` **and** \`lon\` together) is **not shared** with any other policy.

Round the total to 2 decimal places and return it as one column, \`tiv_2016\`. If no policy qualifies, the single row holds \`NULL\`.`,
    tables: [
      {name: "cover_policies", columns: [{name: "pid", type: "integer", pk: true}, {name: "tiv_2015", type: "numeric(10,2)"}, {name: "tiv_2016", type: "numeric(10,2)", note: "NULL if not valued."}, {name: "lat", type: "numeric(6,2)"}, {name: "lon", type: "numeric(6,2)"}]},
    ],
    examples: [
      {
        tables: [{name: "cover_policies", columns: ["pid", "tiv_2015", "tiv_2016", "lat", "lon"], rows: [[1, 10, 5, 10, 10], [2, 20, 20, 20, 20], [3, 10, 30, 20, 20], [4, 10, 40, 40, 40]]}],
        result: {columns: ["tiv_2016"], rows: [[45]]},
        explanation: "The 2015 value 10 is shared by policies 1, 3 and 4. Policy 3 shares its location with policy 2, so it is out. Policy 2's 2015 value is unique, so it is out too. Policies 1 and 4 qualify: 5 + 40 = 45.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE cover_policies (pid integer PRIMARY KEY, tiv_2015 numeric(10,2) NOT NULL, tiv_2016 numeric(10,2), lat numeric(6,2) NOT NULL, lon numeric(6,2) NOT NULL);
INSERT INTO cover_policies VALUES (1, 10, 5, 10, 10), (2, 20, 20, 20, 20), (3, 10, 30, 20, 20), (4, 10, 40, 40, 40);`, ["tiv_2016"], [[45]]),
      t("nobody qualifies", `CREATE TABLE cover_policies (pid integer PRIMARY KEY, tiv_2015 numeric(10,2) NOT NULL, tiv_2016 numeric(10,2), lat numeric(6,2) NOT NULL, lon numeric(6,2) NOT NULL);
INSERT INTO cover_policies VALUES (1, 5, 1, 1, 1), (2, 5, 2, 1, 1);`, ["tiv_2016"], [[null]]),
      t("an unvalued 2016 policy adds nothing", `CREATE TABLE cover_policies (pid integer PRIMARY KEY, tiv_2015 numeric(10,2) NOT NULL, tiv_2016 numeric(10,2), lat numeric(6,2) NOT NULL, lon numeric(6,2) NOT NULL);
INSERT INTO cover_policies VALUES (1, 5, NULL, 1, 1), (2, 5, 7, 2, 2);`, ["tiv_2016"], [[7]]),
      t("same lat but different lon is a different place", `CREATE TABLE cover_policies (pid integer PRIMARY KEY, tiv_2015 numeric(10,2) NOT NULL, tiv_2016 numeric(10,2), lat numeric(6,2) NOT NULL, lon numeric(6,2) NOT NULL);
INSERT INTO cover_policies VALUES (1, 9, 1, 1, 2), (2, 9, 2, 1, 3), (3, 8, 100, 5, 5);`, ["tiv_2016"], [[3]]),
      t("empty table", `CREATE TABLE cover_policies (pid integer PRIMARY KEY, tiv_2015 numeric(10,2) NOT NULL, tiv_2016 numeric(10,2), lat numeric(6,2) NOT NULL, lon numeric(6,2) NOT NULL);`, ["tiv_2016"], [[null]]),
    ],
    solution: `SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016
FROM (
  SELECT tiv_2016,
         COUNT(*) OVER (PARTITION BY tiv_2015) AS same_value,
         COUNT(*) OVER (PARTITION BY lat, lon) AS same_place
  FROM cover_policies
) p
WHERE same_value > 1 AND same_place = 1`,
    approaches: [
      {
        id: "window-counts",
        title: "Two window counts, one scan",
        optimal: true,
        explanation: "`COUNT(*) OVER (PARTITION BY tiv_2015)` says how many policies share this policy's 2015 value (it includes the policy itself, so more than 1 means 'shared with another'). `PARTITION BY lat, lon` does the same for the location pair. The `WHERE` then applies both rules. `SUM` ignores NULL values and returns NULL over zero rows, which is what the question wants.",
        code: `SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016
FROM (
  SELECT tiv_2016,
         COUNT(*) OVER (PARTITION BY tiv_2015) AS same_value,
         COUNT(*) OVER (PARTITION BY lat, lon) AS same_place
  FROM cover_policies
) p
WHERE same_value > 1 AND same_place = 1`,
      },
      {
        id: "in-subqueries",
        title: "Two IN subqueries with HAVING",
        optimal: false,
        explanation: "One subquery lists 2015 values that occur more than once. Another lists (lat, lon) pairs that occur exactly once. The outer query keeps policies matching both. It is easy to read in steps, but scans the table three times. It is safe with NULLs here because the three columns are never NULL.",
        code: `SELECT ROUND(SUM(tiv_2016), 2) AS tiv_2016
FROM cover_policies
WHERE tiv_2015 IN (SELECT tiv_2015 FROM cover_policies GROUP BY tiv_2015 HAVING COUNT(*) > 1)
  AND (lat, lon) IN (SELECT lat, lon FROM cover_policies GROUP BY lat, lon HAVING COUNT(*) = 1)`,
      },
    ],
    hints: [
      "How can each row know how many rows share its 2015 value?",
      "Is a location the same when only the latitude matches?",
      "What does SUM return when no rows are left?",
    ],
    clarify: [
      {question: "Does 'at least one other' include the policy itself?", answer: "No. The value must be shared with a different policy."},
      {question: "What if no policy qualifies?", answer: "Return one row with NULL."},
    ],
    followUps: ["How would you list the qualifying policy ids together with the total?"],
  },
  {
    kind: "sql",
    lc: 185,
    topic: "sql-subqueries",
    title: "Department Top Three Salaries",
    difficulty: "Hard",
    statement: `\`staff_pay\` lists employees with their salary and department. A **top-three earner** is someone whose salary is one of the **three highest different salaries** in their own department. If two people earn the same, they share a place, and both are included.

Return \`department\` (the department's name), \`employee\` (the person's name) and \`salary\`. People with no department are ignored. The rows can come back in any order.`,
    tables: [
      {name: "staff_pay", columns: [{name: "id", type: "integer", pk: true}, {name: "name", type: "text"}, {name: "salary", type: "integer"}, {name: "department_id", type: "integer", note: "NULL if not assigned."}]},
      {name: "departments", columns: [{name: "id", type: "integer", pk: true}, {name: "name", type: "text"}]},
    ],
    examples: [
      {
        tables: [
          {name: "staff_pay", columns: ["id", "name", "salary", "department_id"], rows: [[1, "Ann", 90, 1], [2, "Bob", 80, 1], [3, "Cat", 80, 1], [4, "Dan", 70, 1], [5, "Eve", 60, 1], [6, "Fay", 50, 2], [7, "Gus", 40, 2]]},
          {name: "departments", columns: ["id", "name"], rows: [[1, "Sales"], [2, "Support"], [3, "Legal"]]},
        ],
        result: {columns: ["department", "employee", "salary"], rows: [["Sales", "Ann", 90], ["Sales", "Bob", 80], ["Sales", "Cat", 80], ["Sales", "Dan", 70], ["Support", "Fay", 50], ["Support", "Gus", 40]]},
        explanation: "Sales has the salaries 90, 80, 70, 60. The top three different salaries are 90, 80 and 70, so Ann, Bob, Cat and Dan are in. Eve is not. Legal has no staff.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE departments (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE staff_pay (id integer PRIMARY KEY, name text NOT NULL, salary integer NOT NULL, department_id integer);
INSERT INTO departments VALUES (1, 'Sales'), (2, 'Support'), (3, 'Legal');
INSERT INTO staff_pay VALUES (1, 'Ann', 90, 1), (2, 'Bob', 80, 1), (3, 'Cat', 80, 1), (4, 'Dan', 70, 1), (5, 'Eve', 60, 1), (6, 'Fay', 50, 2), (7, 'Gus', 40, 2);`, ["department", "employee", "salary"], [["Sales", "Ann", 90], ["Sales", "Bob", 80], ["Sales", "Cat", 80], ["Sales", "Dan", 70], ["Support", "Fay", 50], ["Support", "Gus", 40]]),
      t("a tie at the top", `CREATE TABLE departments (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE staff_pay (id integer PRIMARY KEY, name text NOT NULL, salary integer NOT NULL, department_id integer);
INSERT INTO departments VALUES (1, 'Ops');
INSERT INTO staff_pay VALUES (1, 'A', 100, 1), (2, 'B', 100, 1), (3, 'C', 90, 1), (4, 'D', 80, 1), (5, 'E', 70, 1);`, ["department", "employee", "salary"], [["Ops", "A", 100], ["Ops", "B", 100], ["Ops", "C", 90], ["Ops", "D", 80]]),
      t("fewer than three people, and an unassigned person", `CREATE TABLE departments (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE staff_pay (id integer PRIMARY KEY, name text NOT NULL, salary integer NOT NULL, department_id integer);
INSERT INTO departments VALUES (1, 'Solo'), (2, 'Empty');
INSERT INTO staff_pay VALUES (1, 'Only', 10, 1), (9, 'Nodept', 999, NULL);`, ["department", "employee", "salary"], [["Solo", "Only", 10]]),
      t("two departments rank separately", `CREATE TABLE departments (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE staff_pay (id integer PRIMARY KEY, name text NOT NULL, salary integer NOT NULL, department_id integer);
INSERT INTO departments VALUES (1, 'A'), (2, 'B');
INSERT INTO staff_pay VALUES (1, 'a1', 500, 1), (2, 'a2', 400, 1), (3, 'a3', 300, 1), (4, 'a4', 200, 1), (5, 'b1', 20, 2), (6, 'b2', 10, 2), (7, 'b3', 5, 2), (8, 'b4', 1, 2);`, ["department", "employee", "salary"], [["A", "a1", 500], ["A", "a2", 400], ["A", "a3", 300], ["B", "b1", 20], ["B", "b2", 10], ["B", "b3", 5]]),
      t("no staff", `CREATE TABLE departments (id integer PRIMARY KEY, name text NOT NULL);
CREATE TABLE staff_pay (id integer PRIMARY KEY, name text NOT NULL, salary integer NOT NULL, department_id integer);
INSERT INTO departments VALUES (1, 'Sales');`, ["department", "employee", "salary"], []),
    ],
    solution: `SELECT d.name AS department, r.name AS employee, r.salary
FROM (
  SELECT name, salary, department_id,
         DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk
  FROM staff_pay
) r
JOIN departments d ON d.id = r.department_id
WHERE r.rnk <= 3`,
    approaches: [
      {
        id: "dense-rank",
        title: "DENSE_RANK within each department",
        optimal: true,
        explanation: "`DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC)` restarts the ranking in each department and gives equal salaries the same rank with no gaps afterwards. So ranks 1 to 3 are exactly the three highest different salaries. `RANK` would leave a gap after a tie (1, 2, 2, 4), and `ROW_NUMBER` would split ties, so both give wrong answers here. The inner join drops people with no department.",
        code: `SELECT d.name AS department, r.name AS employee, r.salary
FROM (
  SELECT name, salary, department_id,
         DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) AS rnk
  FROM staff_pay
) r
JOIN departments d ON d.id = r.department_id
WHERE r.rnk <= 3`,
      },
      {
        id: "correlated-count",
        title: "Count the higher different salaries (no window function)",
        optimal: false,
        explanation: "A person is in the top three when fewer than three different salaries in their department are higher than theirs. A correlated subquery counts those with `COUNT(DISTINCT ...)`. It works on any database, but runs a subquery for every row, so it is slow on big tables.",
        code: `SELECT d.name AS department, e.name AS employee, e.salary
FROM staff_pay e
JOIN departments d ON d.id = e.department_id
WHERE (
  SELECT COUNT(DISTINCT x.salary)
  FROM staff_pay x
  WHERE x.department_id = e.department_id AND x.salary > e.salary
) < 3`,
      },
    ],
    hints: [
      "Which ranking function leaves no gap after a tie?",
      "What must the window be partitioned by?",
      "Without window functions: how could you count how many different salaries are above a given one?",
    ],
    clarify: [
      {question: "If two people share the third-highest salary, are both included?", answer: "Yes."},
      {question: "Should departments with no staff appear?", answer: "No."},
    ],
    followUps: ["How would you change the query to return the top three people by salary, with exactly three per department?"],
    mysqlNote: "MySQL 8 supports `DENSE_RANK()` exactly like this. In MySQL 5.7 there are no window functions, so the correlated `COUNT(DISTINCT ...)` version is the usual answer.",
  },
];
