/**
 * SQL problems: Advanced Select and Joins (SQL 50 topic 5). Question numbers and titles follow LeetCode's public
 * SQL 50 plan; every statement, table, row, test, solution and explanation is our own words and our own data
 * (see ../sql-types.ts). Answers run on Postgres (PGlite) in the browser.
 * - 1731 The Number of Employees Which Report to Each Employee (Easy)
 * - 1789 Primary Department for Each Employee (Easy)
 * - 610 Triangle Judgement (Easy)
 * - 180 Consecutive Numbers (Medium)
 * - 1164 Product Price at a Given Date (Medium)
 * - 1204 Last Person to Fit in the Bus (Medium)
 * - 1907 Count Salary Categories (Medium)
 */
import type {SqlCell, SqlProblemSeed} from "../sql-types";

const t = (name: string, setup: string, columns: string[], rows: SqlCell[][], ordered = false) => ({name, setup, expected: {columns, rows}, ordered});

export const sql: SqlProblemSeed[] = [
  {
    kind: "sql",
    lc: 1731,
    topic: "sql-advanced-select-joins",
    title: "The Number of Employees Which Report to Each Employee",
    difficulty: "Easy",
    statement: `\`team_staff\` lists people and who they report to. \`reports_to\` is \`NULL\` for the person at the top. A **manager** is anyone who has at least one person reporting to them directly.

For every manager, return:

- \`employee_id\` and \`name\` of the manager;
- \`reports_count\`: how many people report directly to them;
- \`average_age\`: the average age of those people, **rounded to the nearest whole number** (half rounds up).

Sort by \`employee_id\`. Two different managers can share a name, so do not group by name alone.`,
    tables: [
      {name: "team_staff", columns: [{name: "employee_id", type: "integer", pk: true}, {name: "name", type: "text"}, {name: "reports_to", type: "integer", note: "NULL for the top person."}, {name: "age", type: "integer"}]},
    ],
    examples: [
      {
        tables: [{name: "team_staff", columns: ["employee_id", "name", "reports_to", "age"], rows: [[1, "Rhea", null, 50], [2, "Omar", 1, 30], [3, "Lena", 1, 31], [4, "Kit", 2, 25], [5, "Sol", 2, 26], [6, "Tara", 3, 40]]}],
        result: {columns: ["employee_id", "name", "reports_count", "average_age"], rows: [[1, "Rhea", 2, 31], [2, "Omar", 2, 26], [3, "Lena", 1, 40]]},
        explanation: "Rhea manages Omar (30) and Lena (31): the average is 30.5, which rounds to 31. Omar manages 25 and 26: 25.5 rounds to 26. Kit, Sol and Tara manage nobody, so they are not listed.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE team_staff (employee_id integer PRIMARY KEY, name text NOT NULL, reports_to integer, age integer NOT NULL);
INSERT INTO team_staff VALUES (6, 'Tara', 3, 40), (1, 'Rhea', NULL, 50), (2, 'Omar', 1, 30), (3, 'Lena', 1, 31), (4, 'Kit', 2, 25), (5, 'Sol', 2, 26);`, ["employee_id", "name", "reports_count", "average_age"], [[1, "Rhea", 2, 31], [2, "Omar", 2, 26], [3, "Lena", 1, 40]], true),
      t("two managers with the same name", `CREATE TABLE team_staff (employee_id integer PRIMARY KEY, name text NOT NULL, reports_to integer, age integer NOT NULL);
INSERT INTO team_staff VALUES (1, 'Sam', NULL, 60), (2, 'Sam', NULL, 55), (3, 'A', 1, 20), (4, 'B', 2, 30), (5, 'C', 2, 31);`, ["employee_id", "name", "reports_count", "average_age"], [[1, "Sam", 1, 20], [2, "Sam", 2, 31]], true),
      t("average rounds down", `CREATE TABLE team_staff (employee_id integer PRIMARY KEY, name text NOT NULL, reports_to integer, age integer NOT NULL);
INSERT INTO team_staff VALUES (1, 'M', NULL, 50), (2, 'x', 1, 20), (3, 'y', 1, 20), (4, 'z', 1, 21);`, ["employee_id", "name", "reports_count", "average_age"], [[1, "M", 3, 20]], true),
      t("nobody reports to anyone", `CREATE TABLE team_staff (employee_id integer PRIMARY KEY, name text NOT NULL, reports_to integer, age integer NOT NULL);
INSERT INTO team_staff VALUES (1, 'A', NULL, 40), (2, 'B', NULL, 41);`, ["employee_id", "name", "reports_count", "average_age"], [], true),
    ],
    solution: `SELECT m.employee_id, m.name,
       COUNT(*) AS reports_count,
       ROUND(AVG(e.age)) AS average_age
FROM team_staff e
JOIN team_staff m ON m.employee_id = e.reports_to
GROUP BY m.employee_id, m.name
ORDER BY m.employee_id`,
    approaches: [
      {
        id: "self-join",
        title: "Self join: each person joined to their manager",
        optimal: true,
        explanation: "Join the table to itself so that each person `e` meets their manager `m`. An inner join drops the top person (no manager) and keeps only people who do report to someone. Group by the manager's id and name, count, and average the ages. `ROUND` on a numeric value rounds half away from zero, so 30.5 becomes 31.",
        code: `SELECT m.employee_id, m.name,
       COUNT(*) AS reports_count,
       ROUND(AVG(e.age)) AS average_age
FROM team_staff e
JOIN team_staff m ON m.employee_id = e.reports_to
GROUP BY m.employee_id, m.name
ORDER BY m.employee_id`,
      },
      {
        id: "aggregate-then-join",
        title: "Aggregate by reports_to first, then look up the manager",
        optimal: false,
        explanation: "A CTE counts and averages per `reports_to` value. The main query joins it to the manager's own row to fetch the name. It splits the work into two readable steps, which helps when more columns are needed later. The result is the same.",
        code: `WITH team AS (
  SELECT reports_to, COUNT(*) AS c, ROUND(AVG(age)) AS a
  FROM team_staff
  WHERE reports_to IS NOT NULL
  GROUP BY reports_to
)
SELECT m.employee_id, m.name, team.c AS reports_count, team.a AS average_age
FROM team_staff m
JOIN team ON team.reports_to = m.employee_id
ORDER BY m.employee_id`,
      },
    ],
    hints: [
      "Which row plays the manager and which plays the report in a self join?",
      "Why is an inner join enough to leave out people with nobody reporting to them?",
      "Why group by the id and not only the name?",
    ],
    clarify: [
      {question: "Do indirect reports count?", answer: "No. Only people who report directly."},
      {question: "How is 30.5 rounded?", answer: "To 31."},
    ],
    followUps: ["How would you also show managers who have no direct reports, with a count of 0?"],
    mysqlNote: "The query is the same in MySQL. `ROUND(AVG(age))` also rounds half up there, but MySQL may return a decimal such as `31` or `31.0000` depending on the version, so cast to integer if you need a clean whole number.",
  },
  {
    kind: "sql",
    lc: 1789,
    topic: "sql-advanced-select-joins",
    title: "Primary Department for Each Employee",
    difficulty: "Easy",
    statement: `\`dept_membership\` says which departments each employee belongs to. \`primary_flag\` is \`'Y'\` for the department the employee calls their main one, and \`'N'\` for the others. An employee with several departments has exactly one \`'Y'\`. An employee with only one department may have \`'N'\` or \`NULL\` as the flag.

Return each employee's **primary department**:

- if the employee has only one department, return that one, whatever the flag says;
- otherwise return the department flagged \`'Y'\`.

Return \`employee_id\` and \`department_id\`. The rows can come back in any order.`,
    tables: [
      {name: "dept_membership", columns: [{name: "employee_id", type: "integer"}, {name: "department_id", type: "integer"}, {name: "primary_flag", type: "text", note: "'Y', 'N' or NULL."}]},
    ],
    examples: [
      {
        tables: [{name: "dept_membership", columns: ["employee_id", "department_id", "primary_flag"], rows: [[1, 1, "N"], [2, 1, "Y"], [2, 2, "N"], [3, 3, "N"], [4, 2, "N"], [4, 3, "Y"], [4, 4, "N"]]}],
        result: {columns: ["employee_id", "department_id"], rows: [[1, 1], [2, 1], [3, 3], [4, 3]]},
        explanation: "Employees 1 and 3 have one department each, so it is their answer even though the flag is N. Employees 2 and 4 have several, so the Y row wins.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE dept_membership (employee_id integer NOT NULL, department_id integer NOT NULL, primary_flag text);
INSERT INTO dept_membership VALUES (1, 1, 'N'), (2, 1, 'Y'), (2, 2, 'N'), (3, 3, 'N'), (4, 2, 'N'), (4, 3, 'Y'), (4, 4, 'N');`, ["employee_id", "department_id"], [[1, 1], [2, 1], [3, 3], [4, 3]]),
      t("single department with an unknown flag", `CREATE TABLE dept_membership (employee_id integer NOT NULL, department_id integer NOT NULL, primary_flag text);
INSERT INTO dept_membership VALUES (5, 9, NULL), (6, 1, 'Y'), (6, 2, NULL);`, ["employee_id", "department_id"], [[5, 9], [6, 1]]),
      t("three departments, one Y", `CREATE TABLE dept_membership (employee_id integer NOT NULL, department_id integer NOT NULL, primary_flag text);
INSERT INTO dept_membership VALUES (7, 1, 'N'), (7, 2, 'N'), (7, 3, 'Y');`, ["employee_id", "department_id"], [[7, 3]]),
      t("empty table", `CREATE TABLE dept_membership (employee_id integer NOT NULL, department_id integer NOT NULL, primary_flag text);`, ["employee_id", "department_id"], []),
    ],
    solution: `SELECT employee_id, department_id
FROM (
  SELECT employee_id, department_id, primary_flag,
         COUNT(*) OVER (PARTITION BY employee_id) AS departments
  FROM dept_membership
) m
WHERE departments = 1 OR primary_flag = 'Y'`,
    approaches: [
      {
        id: "window-count",
        title: "Count each employee's departments with a window function",
        optimal: true,
        explanation: "`COUNT(*) OVER (PARTITION BY employee_id)` adds the number of departments to every row without collapsing rows. Then one `WHERE` expresses the rule: only one department, or flagged Y. It reads the table once. A NULL flag makes `primary_flag = 'Y'` unknown, and unknown inside `OR` is fine when the first condition is true.",
        code: `SELECT employee_id, department_id
FROM (
  SELECT employee_id, department_id, primary_flag,
         COUNT(*) OVER (PARTITION BY employee_id) AS departments
  FROM dept_membership
) m
WHERE departments = 1 OR primary_flag = 'Y'`,
      },
      {
        id: "in-single-or-y",
        title: "Flagged Y, or employee found in a single-department list",
        optimal: false,
        explanation: "A subquery finds employees with exactly one row (`HAVING COUNT(*) = 1`). The outer query keeps rows flagged Y or belonging to those employees. It is easy to follow but reads the table twice.",
        code: `SELECT employee_id, department_id
FROM dept_membership
WHERE primary_flag = 'Y'
   OR employee_id IN (
     SELECT employee_id
     FROM dept_membership
     GROUP BY employee_id
     HAVING COUNT(*) = 1
   )`,
      },
      {
        id: "union",
        title: "UNION of the two cases",
        optimal: false,
        explanation: "Take every Y row, and add every row of employees with one department. `UNION` removes duplicates when an employee with one department also has a Y. It works but repeats the table scan and needs the de-duplication.",
        code: `SELECT employee_id, department_id FROM dept_membership WHERE primary_flag = 'Y'
UNION
SELECT employee_id, department_id
FROM dept_membership
WHERE employee_id IN (SELECT employee_id FROM dept_membership GROUP BY employee_id HAVING COUNT(*) = 1)`,
      },
    ],
    hints: [
      "Which employees have exactly one row?",
      "What happens to a row with a NULL flag in `primary_flag = 'Y'`?",
      "Can one WHERE combine the two rules with OR?",
    ],
    clarify: [
      {question: "Can an employee with one department have flag N?", answer: "Yes, and that department is still the answer."},
      {question: "Does every employee with several departments have a Y row?", answer: "Yes, exactly one."},
    ],
    followUps: ["How would you list employees who belong to several departments but have no Y row at all?"],
  },
  {
    kind: "sql",
    lc: 610,
    topic: "sql-advanced-select-joins",
    title: "Triangle Judgement",
    difficulty: "Easy",
    statement: `\`edge_sets\` holds three side lengths \`x\`, \`y\` and \`z\` on each row. Some lengths may be unknown (\`NULL\`).

Three lengths can make a triangle when **each side is shorter than the sum of the other two**. Equal to the sum is not enough, because the triangle would be flat. If any length is unknown, the answer is \`'No'\`.

Return every row with \`x\`, \`y\`, \`z\` and a column \`triangle\` that is \`'Yes'\` or \`'No'\`. The rows can come back in any order.`,
    tables: [
      {name: "edge_sets", note: "No key; the same triple can appear twice.", columns: [{name: "x", type: "integer", note: "May be NULL."}, {name: "y", type: "integer", note: "May be NULL."}, {name: "z", type: "integer", note: "May be NULL."}]},
    ],
    examples: [
      {
        tables: [{name: "edge_sets", columns: ["x", "y", "z"], rows: [[13, 15, 30], [10, 20, 15], [5, 5, 5], [3, 4, 7]]}],
        result: {columns: ["x", "y", "z", "triangle"], rows: [[13, 15, 30, "No"], [10, 20, 15, "Yes"], [5, 5, 5, "Yes"], [3, 4, 7, "No"]]},
        explanation: "13 + 15 is not more than 30. 10, 20, 15 passes all three checks. 3 + 4 equals 7, which is flat, so No.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE edge_sets (x integer, y integer, z integer);
INSERT INTO edge_sets VALUES (13, 15, 30), (10, 20, 15), (5, 5, 5), (3, 4, 7);`, ["x", "y", "z", "triangle"], [[13, 15, 30, "No"], [10, 20, 15, "Yes"], [5, 5, 5, "Yes"], [3, 4, 7, "No"]]),
      t("flat triangles are not triangles", `CREATE TABLE edge_sets (x integer, y integer, z integer);
INSERT INTO edge_sets VALUES (1, 1, 2), (6, 8, 10), (2, 5, 3);`, ["x", "y", "z", "triangle"], [[1, 1, 2, "No"], [6, 8, 10, "Yes"], [2, 5, 3, "No"]]),
      t("an unknown length means No", `CREATE TABLE edge_sets (x integer, y integer, z integer);
INSERT INTO edge_sets VALUES (NULL, 4, 5), (3, NULL, 3), (5, 5, NULL), (4, 4, 4);`, ["x", "y", "z", "triangle"], [[null, 4, 5, "No"], [3, null, 3, "No"], [5, 5, null, "No"], [4, 4, 4, "Yes"]]),
      t("repeated rows and empty case", `CREATE TABLE edge_sets (x integer, y integer, z integer);
INSERT INTO edge_sets VALUES (2, 3, 4), (2, 3, 4);`, ["x", "y", "z", "triangle"], [[2, 3, 4, "Yes"], [2, 3, 4, "Yes"]]),
      t("empty table", `CREATE TABLE edge_sets (x integer, y integer, z integer);`, ["x", "y", "z", "triangle"], []),
    ],
    solution: `SELECT x, y, z,
       CASE WHEN x + y > z AND x + z > y AND y + z > x THEN 'Yes' ELSE 'No' END AS triangle
FROM edge_sets`,
    approaches: [
      {
        id: "three-inequalities",
        title: "CASE with the three strict inequalities",
        optimal: true,
        explanation: "Check all three: x + y > z, x + z > y and y + z > x. If any value is NULL, a comparison is unknown, the `WHEN` is not true, and `CASE` falls through to `ELSE 'No'`. That gives the required answer for free, with no extra NULL handling.",
        code: `SELECT x, y, z,
       CASE WHEN x + y > z AND x + z > y AND y + z > x THEN 'Yes' ELSE 'No' END AS triangle
FROM edge_sets`,
      },
      {
        id: "greatest-side",
        title: "Compare the longest side with the other two",
        optimal: false,
        explanation: "Only the longest side can break the rule. It is a triangle when twice the longest side is less than the total of all three. It needs one comparison, but `GREATEST` ignores NULLs in Postgres, so the answer is still No only because `x + y + z` is NULL. That subtle point makes it less obvious than the three checks.",
        code: `SELECT x, y, z,
       CASE WHEN 2 * GREATEST(x, y, z) < x + y + z THEN 'Yes' ELSE 'No' END AS triangle
FROM edge_sets`,
      },
    ],
    hints: [
      "Write the three conditions a triangle must satisfy.",
      "Is 3, 4, 7 a triangle? What does that say about < versus <=?",
      "What does a comparison with NULL give, and what does CASE do with it?",
    ],
    clarify: [
      {question: "What if one side is NULL?", answer: "The answer is No."},
      {question: "Do I remove repeated rows?", answer: "No. Return every row."},
    ],
    followUps: ["How would you also label each triangle as equilateral, isosceles or scalene?"],
    mysqlNote: "The `CASE` query is identical in MySQL. In MySQL `GREATEST` returns NULL if any argument is NULL, so the `GREATEST` approach behaves differently there but still gives the right answers.",
  },
  {
    kind: "sql",
    lc: 180,
    topic: "sql-advanced-select-joins",
    title: "Consecutive Numbers",
    difficulty: "Medium",
    statement: `\`reading_stream\` stores a sensor's readings in the order they arrived. \`id\` goes 1, 2, 3 and so on with no gaps.

Find every number that appears **at least three times in a row** (three rows with consecutive ids and the same value). Return each such number once, even if it forms several runs or one long run. A \`NULL\` is not equal to another \`NULL\`, so \`NULL\` never counts.

Return one column named \`consecutivenums\` (Postgres writes unquoted names in lower case). The rows can come back in any order.`,
    tables: [
      {name: "reading_stream", columns: [{name: "id", type: "integer", pk: true}, {name: "num", type: "integer", note: "May be NULL."}]},
    ],
    examples: [
      {
        tables: [{name: "reading_stream", columns: ["id", "num"], rows: [[1, 1], [2, 1], [3, 1], [4, 2], [5, 1], [6, 2], [7, 2]]}],
        result: {columns: ["consecutivenums"], rows: [[1]]},
        explanation: "The value 1 appears in rows 1, 2 and 3. The value 2 appears twice in a row at the end, which is not enough.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE reading_stream (id integer PRIMARY KEY, num integer);
INSERT INTO reading_stream VALUES (1, 1), (2, 1), (3, 1), (4, 2), (5, 1), (6, 2), (7, 2);`, ["consecutivenums"], [[1]]),
      t("long run listed once, two numbers", `CREATE TABLE reading_stream (id integer PRIMARY KEY, num integer);
INSERT INTO reading_stream VALUES (1, 3), (2, 3), (3, 3), (4, 3), (5, 5), (6, 5), (7, 5);`, ["consecutivenums"], [[3], [5]]),
      t("equal values that are not next to each other", `CREATE TABLE reading_stream (id integer PRIMARY KEY, num integer);
INSERT INTO reading_stream VALUES (1, 1), (2, 1), (3, 2), (4, 1), (5, 1);`, ["consecutivenums"], []),
      t("NULLs never match", `CREATE TABLE reading_stream (id integer PRIMARY KEY, num integer);
INSERT INTO reading_stream VALUES (1, NULL), (2, NULL), (3, NULL), (4, 4), (5, 4);`, ["consecutivenums"], []),
      t("empty table", `CREATE TABLE reading_stream (id integer PRIMARY KEY, num integer);`, ["consecutivenums"], []),
    ],
    solution: `SELECT DISTINCT num AS consecutivenums
FROM (
  SELECT num,
         LAG(num, 1) OVER (ORDER BY id) AS one_before,
         LAG(num, 2) OVER (ORDER BY id) AS two_before
  FROM reading_stream
) r
WHERE num = one_before AND num = two_before`,
    approaches: [
      {
        id: "lag-window",
        title: "LAG: compare each row with the two before it",
        optimal: true,
        explanation: "`LAG(num, 1)` and `LAG(num, 2)` bring the previous two values onto the current row, in id order. If all three are equal, this row ends a run of three. `DISTINCT` returns each number once. It reads the table once with no joins. A NULL fails `num = one_before`, so NULL runs are ignored.",
        code: `SELECT DISTINCT num AS consecutivenums
FROM (
  SELECT num,
         LAG(num, 1) OVER (ORDER BY id) AS one_before,
         LAG(num, 2) OVER (ORDER BY id) AS two_before
  FROM reading_stream
) r
WHERE num = one_before AND num = two_before`,
      },
      {
        id: "triple-self-join",
        title: "Join the table to itself three times",
        optimal: false,
        explanation: "Join rows with id, id + 1 and id + 2 and require the same value. This works because ids have no gaps. It does not need window functions, but it joins three copies of the table and the idea is harder to extend to a run of ten.",
        code: `SELECT DISTINCT a.num AS consecutivenums
FROM reading_stream a
JOIN reading_stream b ON b.id = a.id + 1 AND b.num = a.num
JOIN reading_stream c ON c.id = a.id + 2 AND c.num = a.num`,
      },
    ],
    hints: [
      "Which window function gives you the value from the previous row?",
      "What must be true about three rows in a row?",
      "Why do you need DISTINCT?",
    ],
    clarify: [
      {question: "Can ids have gaps?", answer: "No. Ids run 1, 2, 3 with no gaps."},
      {question: "Is a run of four listed once or twice?", answer: "Once."},
    ],
    followUps: ["How would you find numbers that appear at least five times in a row without writing five joins?"],
    mysqlNote: "MySQL 8 supports `LAG` too. For MySQL 5.7 you need the three-way self join. The original question names the column `ConsecutiveNums`; in Postgres an unquoted alias is lower-cased, and the checker ignores letter case in column names.",
  },
  {
    kind: "sql",
    lc: 1164,
    topic: "sql-advanced-select-joins",
    title: "Product Price at a Given Date",
    difficulty: "Medium",
    statement: `\`price_changes\` records each time a product's price changed. Every row says that from \`change_date\` the product costs \`new_price\`. A product has at most one change per day. Before its first change a product costs **100**.

Find each product's price on **2025-06-15**. A change dated exactly 2025-06-15 already applies. Only products that appear in the table are returned.

Return \`product_id\` and \`price\`. The rows can come back in any order.`,
    tables: [
      {name: "price_changes", columns: [{name: "product_id", type: "integer"}, {name: "new_price", type: "integer"}, {name: "change_date", type: "date"}]},
    ],
    examples: [
      {
        tables: [{name: "price_changes", columns: ["product_id", "new_price", "change_date"], rows: [[1, 20, "2025-06-01"], [1, 40, "2025-06-10"], [1, 45, "2025-06-30"], [2, 150, "2025-07-01"], [3, 80, "2025-06-15"], [3, 90, "2025-05-01"]]}],
        result: {columns: ["product_id", "price"], rows: [[1, 40], [2, 100], [3, 80]]},
        explanation: "Product 1 was last changed on 10 June, before the target date, so 40. Product 2 changes only in July, so it is still at 100. Product 3 changed on the target date itself, so 80.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE price_changes (product_id integer NOT NULL, new_price integer NOT NULL, change_date date NOT NULL);
INSERT INTO price_changes VALUES (1, 20, '2025-06-01'), (1, 40, '2025-06-10'), (1, 45, '2025-06-30'), (2, 150, '2025-07-01'), (3, 80, '2025-06-15'), (3, 90, '2025-05-01');`, ["product_id", "price"], [[1, 40], [2, 100], [3, 80]]),
      t("latest change wins, not the highest price", `CREATE TABLE price_changes (product_id integer NOT NULL, new_price integer NOT NULL, change_date date NOT NULL);
INSERT INTO price_changes VALUES (4, 500, '2025-01-01'), (4, 300, '2025-02-01'), (5, 10, '2025-06-14'), (5, 5, '2025-06-16');`, ["product_id", "price"], [[4, 300], [5, 10]]),
      t("every change is in the future", `CREATE TABLE price_changes (product_id integer NOT NULL, new_price integer NOT NULL, change_date date NOT NULL);
INSERT INTO price_changes VALUES (9, 1, '2026-01-01'), (9, 2, '2026-02-01');`, ["product_id", "price"], [[9, 100]]),
      t("empty table", `CREATE TABLE price_changes (product_id integer NOT NULL, new_price integer NOT NULL, change_date date NOT NULL);`, ["product_id", "price"], []),
    ],
    solution: `WITH products AS (
  SELECT DISTINCT product_id FROM price_changes
),
latest AS (
  SELECT product_id, new_price,
         ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY change_date DESC) AS rn
  FROM price_changes
  WHERE change_date <= DATE '2025-06-15'
)
SELECT p.product_id, COALESCE(l.new_price, 100) AS price
FROM products p
LEFT JOIN latest l ON l.product_id = p.product_id AND l.rn = 1`,
    approaches: [
      {
        id: "row-number-left-join",
        title: "Latest change per product, then LEFT JOIN from all products",
        optimal: true,
        explanation: "`latest` keeps only changes on or before the date and numbers them newest first, so `rn = 1` is the price in force. The list of all products goes on the left of a `LEFT JOIN`, so products with no earlier change still appear, and `COALESCE` gives them 100. Using `<=` makes a change on the target day count.",
        code: `WITH products AS (
  SELECT DISTINCT product_id FROM price_changes
),
latest AS (
  SELECT product_id, new_price,
         ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY change_date DESC) AS rn
  FROM price_changes
  WHERE change_date <= DATE '2025-06-15'
)
SELECT p.product_id, COALESCE(l.new_price, 100) AS price
FROM products p
LEFT JOIN latest l ON l.product_id = p.product_id AND l.rn = 1`,
      },
      {
        id: "correlated-subquery",
        title: "Correlated subquery for each product",
        optimal: false,
        explanation: "For each product, a subquery picks the newest price on or before the date with `ORDER BY ... LIMIT 1`. It returns NULL when there is none, and `COALESCE` turns that into 100. It reads very naturally, but runs the subquery once per product.",
        code: `SELECT p.product_id,
       COALESCE((
         SELECT c.new_price
         FROM price_changes c
         WHERE c.product_id = p.product_id AND c.change_date <= DATE '2025-06-15'
         ORDER BY c.change_date DESC
         LIMIT 1
       ), 100) AS price
FROM (SELECT DISTINCT product_id FROM price_changes) p`,
      },
      {
        id: "distinct-on",
        title: "DISTINCT ON (Postgres only)",
        optimal: false,
        explanation: "`DISTINCT ON (product_id)` with `ORDER BY product_id, change_date DESC` keeps the newest row per product in one step. Join it to the product list for the default. It is short, but it is a Postgres feature that other databases do not have.",
        code: `SELECT p.product_id, COALESCE(l.new_price, 100) AS price
FROM (SELECT DISTINCT product_id FROM price_changes) p
LEFT JOIN (
  SELECT DISTINCT ON (product_id) product_id, new_price
  FROM price_changes
  WHERE change_date <= DATE '2025-06-15'
  ORDER BY product_id, change_date DESC
) l ON l.product_id = p.product_id`,
      },
    ],
    hints: [
      "For one product, which row is the price in force on the date?",
      "What should happen to a product that has no change on or before the date?",
      "Should the comparison with the date be < or <=?",
    ],
    clarify: [
      {question: "What price applies before the first change?", answer: "100."},
      {question: "Does a change on the target date count?", answer: "Yes."},
    ],
    followUps: ["How would you return the price of every product on every day of June?"],
    mysqlNote: "MySQL 8 supports `ROW_NUMBER()` and `COALESCE`, so the window version works. `DISTINCT ON` does not exist in MySQL.",
  },
  {
    kind: "sql",
    lc: 1204,
    topic: "sql-advanced-select-joins",
    title: "Last Person to Fit in the Bus",
    difficulty: "Medium",
    statement: `People wait in a queue to board a minibus. \`turn\` is the position in the queue (1 boards first). The bus can carry at most **1000 kg** in total.

People board in turn order. Boarding stops at the first person who would take the total **above** 1000 kg. Find the **name of the last person who boards**. A total of exactly 1000 kg is allowed.

Return one column, \`person_name\`. If even the first person is too heavy, return no rows.`,
    tables: [
      {name: "queue_board", columns: [{name: "person_id", type: "integer", pk: true}, {name: "person_name", type: "text"}, {name: "weight", type: "integer", note: "In kg."}, {name: "turn", type: "integer", note: "Unique queue position."}]},
    ],
    examples: [
      {
        tables: [{name: "queue_board", columns: ["person_id", "person_name", "weight", "turn"], rows: [[5, "Tess", 250, 1], [3, "Vic", 350, 2], [6, "Wes", 400, 3], [2, "Yan", 500, 4], [1, "Xan", 200, 6], [4, "Uma", 175, 5]]}],
        result: {columns: ["person_name"], rows: [["Wes"]]},
        explanation: "Running totals in turn order are 250, 600 and 1000. Adding Yan would reach 1500, so Wes is the last to board.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE queue_board (person_id integer PRIMARY KEY, person_name text NOT NULL, weight integer NOT NULL, turn integer NOT NULL UNIQUE);
INSERT INTO queue_board VALUES (5, 'Tess', 250, 1), (3, 'Vic', 350, 2), (6, 'Wes', 400, 3), (2, 'Yan', 500, 4), (1, 'Xan', 200, 6), (4, 'Uma', 175, 5);`, ["person_name"], [["Wes"]]),
      t("turn order is not id order", `CREATE TABLE queue_board (person_id integer PRIMARY KEY, person_name text NOT NULL, weight integer NOT NULL, turn integer NOT NULL UNIQUE);
INSERT INTO queue_board VALUES (3, 'C', 300, 1), (2, 'B', 400, 2), (1, 'A', 200, 3), (4, 'D', 200, 4);`, ["person_name"], [["A"]]),
      t("everyone fits", `CREATE TABLE queue_board (person_id integer PRIMARY KEY, person_name text NOT NULL, weight integer NOT NULL, turn integer NOT NULL UNIQUE);
INSERT INTO queue_board VALUES (1, 'A', 100, 1), (2, 'B', 100, 2), (3, 'C', 100, 3);`, ["person_name"], [["C"]]),
      t("the first person is too heavy", `CREATE TABLE queue_board (person_id integer PRIMARY KEY, person_name text NOT NULL, weight integer NOT NULL, turn integer NOT NULL UNIQUE);
INSERT INTO queue_board VALUES (1, 'Z', 1200, 1), (2, 'Y', 50, 2);`, ["person_name"], []),
      t("equal weights", `CREATE TABLE queue_board (person_id integer PRIMARY KEY, person_name text NOT NULL, weight integer NOT NULL, turn integer NOT NULL UNIQUE);
INSERT INTO queue_board VALUES (1, 'P', 500, 1), (2, 'Q', 500, 2), (3, 'R', 500, 3);`, ["person_name"], [["Q"]]),
    ],
    solution: `SELECT person_name
FROM (
  SELECT person_name, turn,
         SUM(weight) OVER (ORDER BY turn) AS total
  FROM queue_board
) running
WHERE total <= 1000
ORDER BY turn DESC
LIMIT 1`,
    approaches: [
      {
        id: "running-sum-window",
        title: "Running total with SUM() OVER (ORDER BY turn)",
        optimal: true,
        explanation: "`SUM(weight) OVER (ORDER BY turn)` gives each person the total weight of everyone up to and including them. Keep totals up to 1000 and take the latest turn. Weights are positive, so once the total passes 1000 it never comes back, and the last kept row is the last person to board. It is one pass over the data after sorting.",
        code: `SELECT person_name
FROM (
  SELECT person_name, turn,
         SUM(weight) OVER (ORDER BY turn) AS total
  FROM queue_board
) running
WHERE total <= 1000
ORDER BY turn DESC
LIMIT 1`,
      },
      {
        id: "self-join-sum",
        title: "Self join: add up everyone at or before each turn",
        optimal: false,
        explanation: "Join each person `a` to everyone `b` with a turn at or before theirs, group by `a`, and sum `b.weight`. `HAVING` keeps totals up to 1000. It needs no window function, but it compares every pair of rows, which is quadratic and slow on long queues.",
        code: `SELECT a.person_name
FROM queue_board a
JOIN queue_board b ON b.turn <= a.turn
GROUP BY a.turn, a.person_name
HAVING SUM(b.weight) <= 1000
ORDER BY a.turn DESC
LIMIT 1`,
      },
    ],
    hints: [
      "What running total does each person see when they board?",
      "Which window function gives a running total, and what must it be ordered by?",
      "After filtering totals up to 1000, how do you pick the last person?",
    ],
    clarify: [
      {question: "Is a total of exactly 1000 kg allowed?", answer: "Yes."},
      {question: "Can a lighter person behind a too-heavy one still board?", answer: "No. Boarding stops at the first overflow."},
    ],
    followUps: ["How would you list everyone who boards, with the running weight beside each name?"],
    mysqlNote: "MySQL 8 has the same window function. The `LIMIT 1` form is also the same.",
  },
  {
    kind: "sql",
    lc: 1907,
    topic: "sql-advanced-select-joins",
    title: "Count Salary Categories",
    difficulty: "Medium",
    statement: `\`pay_slips\` has one row per bank account with its monthly \`income\`. The income may be \`NULL\` when it is unknown.

Put each account in a category:

- \`'Low Salary'\`: income strictly below 3000;
- \`'Average Salary'\`: income from 3000 to 7000, both included;
- \`'High Salary'\`: income strictly above 7000.

Accounts with unknown income are not counted anywhere. Return one row for **each of the three categories**, even when a category has no accounts (its count is 0).

Return \`category\` and \`accounts_count\`. The rows can come back in any order.`,
    tables: [
      {name: "pay_slips", columns: [{name: "account_id", type: "integer", pk: true}, {name: "income", type: "integer", note: "NULL when unknown."}]},
    ],
    examples: [
      {
        tables: [{name: "pay_slips", columns: ["account_id", "income"], rows: [[1, 2500], [2, 3000], [3, 5200], [4, 7000], [5, 7001], [6, 9500], [7, 1000]]}],
        result: {columns: ["category", "accounts_count"], rows: [["Low Salary", 2], ["Average Salary", 3], ["High Salary", 2]]},
        explanation: "3000 and 7000 are both Average. 7001 is High.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE pay_slips (account_id integer PRIMARY KEY, income integer);
INSERT INTO pay_slips VALUES (1, 2500), (2, 3000), (3, 5200), (4, 7000), (5, 7001), (6, 9500), (7, 1000);`, ["category", "accounts_count"], [["Low Salary", 2], ["Average Salary", 3], ["High Salary", 2]]),
      t("a category with nobody in it", `CREATE TABLE pay_slips (account_id integer PRIMARY KEY, income integer);
INSERT INTO pay_slips VALUES (1, 100), (2, 4000);`, ["category", "accounts_count"], [["Low Salary", 1], ["Average Salary", 1], ["High Salary", 0]]),
      t("unknown income is not counted", `CREATE TABLE pay_slips (account_id integer PRIMARY KEY, income integer);
INSERT INTO pay_slips VALUES (1, NULL), (2, NULL), (3, 8000);`, ["category", "accounts_count"], [["Low Salary", 0], ["Average Salary", 0], ["High Salary", 1]]),
      t("empty table", `CREATE TABLE pay_slips (account_id integer PRIMARY KEY, income integer);`, ["category", "accounts_count"], [["Low Salary", 0], ["Average Salary", 0], ["High Salary", 0]]),
    ],
    solution: `SELECT c.category, COUNT(p.account_id) AS accounts_count
FROM (VALUES ('Low Salary'), ('Average Salary'), ('High Salary')) AS c(category)
LEFT JOIN (
  SELECT account_id,
         CASE WHEN income < 3000 THEN 'Low Salary'
              WHEN income <= 7000 THEN 'Average Salary'
              WHEN income > 7000 THEN 'High Salary'
         END AS category
  FROM pay_slips
) p ON p.category = c.category
GROUP BY c.category`,
    approaches: [
      {
        id: "values-left-join",
        title: "Label each account once, LEFT JOIN from a list of the three categories",
        optimal: true,
        explanation: "The `VALUES` list holds the three category names, so each always gets a row. The subquery labels each account with `CASE`; with no `ELSE`, an unknown income gets a NULL label and matches nothing. `COUNT(p.account_id)` counts only matched accounts, so empty categories show 0 (`COUNT(*)` would show 1). The table is read once.",
        code: `SELECT c.category, COUNT(p.account_id) AS accounts_count
FROM (VALUES ('Low Salary'), ('Average Salary'), ('High Salary')) AS c(category)
LEFT JOIN (
  SELECT account_id,
         CASE WHEN income < 3000 THEN 'Low Salary'
              WHEN income <= 7000 THEN 'Average Salary'
              WHEN income > 7000 THEN 'High Salary'
         END AS category
  FROM pay_slips
) p ON p.category = c.category
GROUP BY c.category`,
      },
      {
        id: "union-all-filter",
        title: "Three counts joined with UNION ALL",
        optimal: false,
        explanation: "Write one `SELECT` per category using `COUNT(*) FILTER (WHERE ...)` and stack them with `UNION ALL`. An aggregate without `GROUP BY` always returns one row, so empty categories give 0. It is very clear, but scans the table three times and repeats the thresholds.",
        code: `SELECT 'Low Salary' AS category, COUNT(*) FILTER (WHERE income < 3000) AS accounts_count FROM pay_slips
UNION ALL
SELECT 'Average Salary', COUNT(*) FILTER (WHERE income BETWEEN 3000 AND 7000) FROM pay_slips
UNION ALL
SELECT 'High Salary', COUNT(*) FILTER (WHERE income > 7000) FROM pay_slips`,
      },
    ],
    hints: [
      "If you group only the accounts, what happens to a category with nobody in it?",
      "How can you make sure all three category names always exist?",
      "Which count ignores the NULL produced by an unmatched LEFT JOIN?",
    ],
    clarify: [
      {question: "Which category is exactly 3000?", answer: "Average Salary. Both 3000 and 7000 are Average."},
      {question: "Where do accounts with unknown income go?", answer: "Nowhere. They are not counted."},
    ],
    followUps: ["How would you show each category's share of all accounts as a percentage?"],
    mysqlNote: "MySQL 8.0.19 and later accepts `VALUES ROW(...)`, but the usual MySQL answer builds the three names with `SELECT 'Low Salary' UNION ALL ...`. `COUNT(*) FILTER` does not exist in MySQL. Use `SUM(income < 3000)` or `COUNT(CASE WHEN ... THEN 1 END)` instead.",
  },
];
