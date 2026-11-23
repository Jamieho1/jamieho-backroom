/**
 * SQL problems: Basic Joins (SQL 50 topic 2). Question numbers and titles follow LeetCode's public SQL 50 plan;
 * every statement, table, row, test, solution and explanation is our own words and our own data (see ../sql-types.ts).
 * Answers run on Postgres (PGlite) in the browser.
 * - 1378 Replace Employee ID With The Unique Identifier (Easy)
 * - 1068 Product Sales Analysis I (Easy)
 * - 1581 Customer Who Visited but Did Not Make Any Transactions (Easy)
 * - 197 Rising Temperature (Easy)
 * - 1661 Average Time of Process per Machine (Easy)
 * - 577 Employee Bonus (Easy)
 * - 1280 Students and Examinations (Easy)
 * - 570 Managers with at Least 5 Direct Reports (Medium)
 * - 1934 Confirmation Rate (Medium)
 */
import type {SqlCell, SqlProblemSeed} from "../sql-types";

const t = (name: string, setup: string, columns: string[], rows: SqlCell[][], ordered = false) => ({name, setup, expected: {columns, rows}, ordered});

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
  {
    kind: "sql",
    lc: 1068,
    topic: "sql-basic-joins",
    title: "Product Sales Analysis I",
    difficulty: "Easy",
    statement: `A shop keeps its catalogue in \`shop_items\` and one row per sale line in \`sales_lines\`. Every sale line refers to an item that exists in the catalogue. The price is \`NULL\` when it was not recorded.

Write a query that shows, for **every sale line**, the item's name, the \`year\` of the sale and the \`price\`.

- Return three columns in this order: \`product_name\`, \`year\`, \`price\`.
- Items that have never been sold do not appear.
- Keep repeated lines as separate rows. The rows can come back in any order.`,
    tables: [
      {name: "shop_items", note: "One row per item in the catalogue.", columns: [{name: "item_code", type: "integer", pk: true}, {name: "item_name", type: "text"}]},
      {name: "sales_lines", note: "One row per sale line.", columns: [{name: "sale_id", type: "integer", pk: true}, {name: "item_code", type: "integer", note: "Refers to shop_items."}, {name: "year", type: "integer"}, {name: "quantity", type: "integer"}, {name: "price", type: "integer", note: "Price per unit; NULL if not recorded."}]},
    ],
    examples: [
      {
        tables: [
          {name: "shop_items", columns: ["item_code", "item_name"], rows: [[1, "Desk lamp"], [2, "Notebook"], [3, "Stapler"]]},
          {name: "sales_lines", columns: ["sale_id", "item_code", "year", "quantity", "price"], rows: [[1, 1, 2022, 3, 40], [2, 1, 2023, 2, 45], [3, 2, 2022, 10, 5]]},
        ],
        result: {columns: ["product_name", "year", "price"], rows: [["Desk lamp", 2022, 40], ["Desk lamp", 2023, 45], ["Notebook", 2022, 5]]},
        explanation: "The stapler has no sale lines, so it is not listed.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE shop_items (item_code integer PRIMARY KEY, item_name text NOT NULL);
CREATE TABLE sales_lines (sale_id integer PRIMARY KEY, item_code integer NOT NULL REFERENCES shop_items, year integer NOT NULL, quantity integer NOT NULL, price integer);
INSERT INTO shop_items VALUES (1, 'Desk lamp'), (2, 'Notebook'), (3, 'Stapler');
INSERT INTO sales_lines VALUES (1, 1, 2022, 3, 40), (2, 1, 2023, 2, 45), (3, 2, 2022, 10, 5);`, ["product_name", "year", "price"], [["Desk lamp", 2022, 40], ["Desk lamp", 2023, 45], ["Notebook", 2022, 5]]),
      t("price not recorded", `CREATE TABLE shop_items (item_code integer PRIMARY KEY, item_name text NOT NULL);
CREATE TABLE sales_lines (sale_id integer PRIMARY KEY, item_code integer NOT NULL REFERENCES shop_items, year integer NOT NULL, quantity integer NOT NULL, price integer);
INSERT INTO shop_items VALUES (1, 'Kettle');
INSERT INTO sales_lines VALUES (1, 1, 2021, 1, NULL), (2, 1, 2021, 2, 12);`, ["product_name", "year", "price"], [["Kettle", 2021, null], ["Kettle", 2021, 12]]),
      t("identical lines stay separate", `CREATE TABLE shop_items (item_code integer PRIMARY KEY, item_name text NOT NULL);
CREATE TABLE sales_lines (sale_id integer PRIMARY KEY, item_code integer NOT NULL REFERENCES shop_items, year integer NOT NULL, quantity integer NOT NULL, price integer);
INSERT INTO shop_items VALUES (5, 'Mug'), (6, 'Mug');
INSERT INTO sales_lines VALUES (1, 5, 2020, 1, 8), (2, 5, 2020, 1, 8), (3, 6, 2020, 4, 8);`, ["product_name", "year", "price"], [["Mug", 2020, 8], ["Mug", 2020, 8], ["Mug", 2020, 8]]),
      t("no sales yet", `CREATE TABLE shop_items (item_code integer PRIMARY KEY, item_name text NOT NULL);
CREATE TABLE sales_lines (sale_id integer PRIMARY KEY, item_code integer NOT NULL REFERENCES shop_items, year integer NOT NULL, quantity integer NOT NULL, price integer);
INSERT INTO shop_items VALUES (1, 'Ruler'), (2, 'Eraser');`, ["product_name", "year", "price"], []),
    ],
    solution: `SELECT i.item_name AS product_name, s.year, s.price
FROM sales_lines AS s
JOIN shop_items AS i ON i.item_code = s.item_code`,
    approaches: [
      {
        id: "inner-join",
        title: "INNER JOIN sale lines to items",
        optimal: true,
        explanation: "Each sale line needs one name from the catalogue, so an \`INNER JOIN\` on \`item_code\` pairs them up. It keeps only items that were sold, which the question asks for, and it returns one row per sale line. No \`DISTINCT\` is used because repeated lines must stay.",
        code: `SELECT i.item_name AS product_name, s.year, s.price
FROM sales_lines AS s
JOIN shop_items AS i ON i.item_code = s.item_code`,
      },
      {
        id: "scalar-subquery",
        title: "Fetch the name with a scalar subquery",
        optimal: false,
        explanation: "For each sale line, run a small subquery that looks up the item name. It is correct here because \`item_code\` is unique in the catalogue, so the subquery returns one value. It is more awkward than a join when you need several columns from the other table, and it would hide a missing item as NULL rather than dropping the row.",
        code: `SELECT (SELECT i.item_name FROM shop_items AS i WHERE i.item_code = s.item_code) AS product_name,
       s.year,
       s.price
FROM sales_lines AS s`,
      },
    ],
    hints: [
      "Which column connects a sale line to its item?",
      "Do you want items with no sale lines in the result? Choose the join type to match.",
    ],
    clarify: [
      {question: "Can a sale line refer to an item that is not in the catalogue?", answer: "No. Every sale line has a matching item."},
      {question: "Should repeated identical lines be collapsed?", answer: "No. One output row per sale line."},
    ],
    followUps: ["How would you list the items that have never been sold?"],
  },
  {
    kind: "sql",
    lc: 1581,
    topic: "sql-basic-joins",
    title: "Customer Who Visited but Did Not Make Any Transactions",
    difficulty: "Easy",
    statement: `A shop logs each visit in \`shop_visits\`. If the visitor buys something, a row is added to \`shop_orders\` for that visit (a visit can have several orders). An order counts even when its \`amount\` is \`NULL\` (for example a voided sale).

Find the customers who made visits **without any order**, and count how many such visits each one made.

- Return \`customer_id\` and \`count_no_trans\`.
- Customers with no empty visits do not appear.
- The rows can come back in any order.`,
    tables: [
      {name: "shop_visits", note: "One row per visit.", columns: [{name: "visit_id", type: "integer", pk: true}, {name: "customer_id", type: "integer"}]},
      {name: "shop_orders", note: "One row per order; a visit may have none, one or several.", columns: [{name: "order_id", type: "integer", pk: true}, {name: "visit_id", type: "integer"}, {name: "amount", type: "integer", note: "NULL for a voided sale."}]},
    ],
    examples: [
      {
        tables: [
          {name: "shop_visits", columns: ["visit_id", "customer_id"], rows: [[1, 101], [2, 102], [3, 101], [4, 103], [5, 101], [6, 104], [7, 103], [8, 102]]},
          {name: "shop_orders", columns: ["order_id", "visit_id", "amount"], rows: [[1, 1, 25], [2, 3, 40], [3, 3, 15], [4, 7, 60]]},
        ],
        result: {columns: ["customer_id", "count_no_trans"], rows: [[101, 1], [102, 2], [103, 1], [104, 1]]},
        explanation: "Visits 2, 4, 5, 6 and 8 have no order. Customer 102 made two of them (visits 2 and 8).",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE shop_visits (visit_id integer PRIMARY KEY, customer_id integer NOT NULL);
CREATE TABLE shop_orders (order_id integer PRIMARY KEY, visit_id integer NOT NULL, amount integer);
INSERT INTO shop_visits VALUES (1, 101), (2, 102), (3, 101), (4, 103), (5, 101), (6, 104), (7, 103), (8, 102);
INSERT INTO shop_orders VALUES (1, 1, 25), (2, 3, 40), (3, 3, 15), (4, 7, 60);`, ["customer_id", "count_no_trans"], [[101, 1], [102, 2], [103, 1], [104, 1]]),
      t("voided order still counts as an order", `CREATE TABLE shop_visits (visit_id integer PRIMARY KEY, customer_id integer NOT NULL);
CREATE TABLE shop_orders (order_id integer PRIMARY KEY, visit_id integer NOT NULL, amount integer);
INSERT INTO shop_visits VALUES (1, 7), (2, 7), (3, 8);
INSERT INTO shop_orders VALUES (1, 1, NULL), (2, 3, NULL);`, ["customer_id", "count_no_trans"], [[7, 1]]),
      t("many orders on one visit", `CREATE TABLE shop_visits (visit_id integer PRIMARY KEY, customer_id integer NOT NULL);
CREATE TABLE shop_orders (order_id integer PRIMARY KEY, visit_id integer NOT NULL, amount integer);
INSERT INTO shop_visits VALUES (1, 5), (2, 5), (3, 5), (4, 6);
INSERT INTO shop_orders VALUES (1, 1, 10), (2, 1, 20), (3, 1, 30), (4, 4, 5), (5, 4, 5);`, ["customer_id", "count_no_trans"], [[5, 2]]),
      t("every visit led to an order", `CREATE TABLE shop_visits (visit_id integer PRIMARY KEY, customer_id integer NOT NULL);
CREATE TABLE shop_orders (order_id integer PRIMARY KEY, visit_id integer NOT NULL, amount integer);
INSERT INTO shop_visits VALUES (1, 9), (2, 10);
INSERT INTO shop_orders VALUES (1, 1, 3), (2, 2, 4);`, ["customer_id", "count_no_trans"], []),
      t("no visits at all", `CREATE TABLE shop_visits (visit_id integer PRIMARY KEY, customer_id integer NOT NULL);
CREATE TABLE shop_orders (order_id integer PRIMARY KEY, visit_id integer NOT NULL, amount integer);`, ["customer_id", "count_no_trans"], []),
    ],
    solution: `SELECT v.customer_id, COUNT(*) AS count_no_trans
FROM shop_visits AS v
WHERE NOT EXISTS (SELECT 1 FROM shop_orders AS o WHERE o.visit_id = v.visit_id)
GROUP BY v.customer_id`,
    approaches: [
      {
        id: "not-exists",
        title: "NOT EXISTS for visits with no order",
        optimal: true,
        explanation: "\`NOT EXISTS\` says what the question says: keep a visit when no order points at it. It never multiplies visit rows, even when a visit has several orders, so \`COUNT(*)\` counts visits correctly. Then \`GROUP BY customer_id\` counts the empty visits of each customer.",
        code: `SELECT v.customer_id, COUNT(*) AS count_no_trans
FROM shop_visits AS v
WHERE NOT EXISTS (SELECT 1 FROM shop_orders AS o WHERE o.visit_id = v.visit_id)
GROUP BY v.customer_id`,
      },
      {
        id: "left-join-null",
        title: "LEFT JOIN, keep rows where the order is missing",
        optimal: false,
        explanation: "Join every visit to its orders with a \`LEFT JOIN\`, then keep rows where \`o.order_id IS NULL\`. The key column is used for the NULL test, not \`amount\`, because a voided order has a NULL amount but still exists. The plan is usually the same as \`NOT EXISTS\`, but the join form is easier to get wrong by testing the wrong column.",
        code: `SELECT v.customer_id, COUNT(*) AS count_no_trans
FROM shop_visits AS v
LEFT JOIN shop_orders AS o ON o.visit_id = v.visit_id
WHERE o.order_id IS NULL
GROUP BY v.customer_id`,
      },
    ],
    hints: [
      "First list the visits that have no matching order. How do you ask for \"no match\"?",
      "A voided order has a NULL amount. Which column proves that an order exists?",
    ],
    clarify: [
      {question: "Does an order with a NULL amount count as a transaction?", answer: "Yes. Any row in shop_orders for that visit counts."},
      {question: "Should customers who always bought something be listed with zero?", answer: "No. Only customers with at least one empty visit appear."},
    ],
    followUps: ["How would you also report the share of each customer's visits that had no order?"],
  },
  {
    kind: "sql",
    lc: 197,
    topic: "sql-basic-joins",
    title: "Rising Temperature",
    difficulty: "Easy",
    statement: `A river authority stores one water-level reading per day in \`river_levels\`. Some days may be missing, and the ids are not in date order. A reading can be \`NULL\` if the sensor failed.

Write a query that returns the \`id\` of every day whose level is **higher than the level on the previous calendar day**.

- Compare only with the day exactly one day earlier. If that day has no reading, the day does not qualify.
- Equal levels are not higher.
- Return one column named \`id\`. The rows can come back in any order.`,
    tables: [
      {name: "river_levels", note: "One row per date; each date appears at most once.", columns: [{name: "id", type: "integer", pk: true}, {name: "record_date", type: "date"}, {name: "level_cm", type: "integer", note: "NULL if the sensor failed."}]},
    ],
    examples: [
      {
        tables: [
          {name: "river_levels", columns: ["id", "record_date", "level_cm"], rows: [[1, "2024-02-03", 130], [2, "2024-02-01", 120], [3, "2024-02-02", 135], [4, "2024-02-04", 131]]},
        ],
        result: {columns: ["id"], rows: [[3], [4]]},
        explanation: "On 2 February the level rose from 120 to 135, and on 4 February from 130 to 131. On 3 February it fell.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE river_levels (id integer PRIMARY KEY, record_date date NOT NULL UNIQUE, level_cm integer);
INSERT INTO river_levels VALUES (1, '2024-02-03', 130), (2, '2024-02-01', 120), (3, '2024-02-02', 135), (4, '2024-02-04', 131);`, ["id"], [[3], [4]]),
      t("a gap in the dates", `CREATE TABLE river_levels (id integer PRIMARY KEY, record_date date NOT NULL UNIQUE, level_cm integer);
INSERT INTO river_levels VALUES (1, '2024-03-01', 100), (2, '2024-03-03', 150), (3, '2024-03-04', 160);`, ["id"], [[3]]),
      t("failed sensor", `CREATE TABLE river_levels (id integer PRIMARY KEY, record_date date NOT NULL UNIQUE, level_cm integer);
INSERT INTO river_levels VALUES (1, '2024-04-01', 90), (2, '2024-04-02', NULL), (3, '2024-04-03', 95), (4, '2024-04-04', 96);`, ["id"], [[4]]),
      t("equal and falling", `CREATE TABLE river_levels (id integer PRIMARY KEY, record_date date NOT NULL UNIQUE, level_cm integer);
INSERT INTO river_levels VALUES (1, '2024-05-01', 50), (2, '2024-05-02', 50), (3, '2024-05-03', 40);`, ["id"], []),
      t("across a month and year end", `CREATE TABLE river_levels (id integer PRIMARY KEY, record_date date NOT NULL UNIQUE, level_cm integer);
INSERT INTO river_levels VALUES (1, '2023-12-31', 10), (2, '2024-01-01', 11), (3, '2024-02-28', 5), (4, '2024-02-29', 6), (5, '2024-03-01', 7);`, ["id"], [[2], [4], [5]]),
    ],
    solution: `SELECT today.id
FROM river_levels AS today
JOIN river_levels AS yesterday
  ON yesterday.record_date = today.record_date - 1
WHERE today.level_cm > yesterday.level_cm`,
    approaches: [
      {
        id: "self-join",
        title: "Self-join each day to the day before",
        optimal: true,
        explanation: "Join the table to itself, matching each row with the row whose date is exactly one day earlier (\`date - 1\`). A missing day simply finds no partner, so gaps are handled by the join itself, and a NULL level makes the comparison unknown so those days are dropped. The ids are never used to find the previous day, because they are not in date order.",
        code: `SELECT today.id
FROM river_levels AS today
JOIN river_levels AS yesterday
  ON yesterday.record_date = today.record_date - 1
WHERE today.level_cm > yesterday.level_cm`,
      },
      {
        id: "lag",
        title: "LAG window function with a date check",
        optimal: false,
        explanation: "Sort by date and use \`LAG\` to bring the previous row's level and date onto each row. You must also check that the previous date is exactly one day earlier, otherwise a gap compares a day with an older one. It works and reads well, but it needs an extra subquery and the extra date check that the self-join gets for free.",
        code: `SELECT id
FROM (
  SELECT id, record_date, level_cm,
         LAG(level_cm) OVER w AS prev_level,
         LAG(record_date) OVER w AS prev_date
  FROM river_levels
  WINDOW w AS (ORDER BY record_date)
) AS x
WHERE level_cm > prev_level
  AND record_date - prev_date = 1`,
      },
    ],
    hints: [
      "You need two readings in one row: today's and the previous day's. Which join gives you that?",
      "Do not use id to find the day before. What do you use instead, and what if the day is missing?",
    ],
    clarify: [
      {question: "Are the ids in date order?", answer: "No. Always use the date to find the previous day."},
      {question: "What if the previous day has no reading?", answer: "Then the day cannot be compared and is not returned."},
    ],
    followUps: ["How would you return each rising day together with how much the level rose?"],
    mysqlNote: "In MySQL you cannot subtract an integer from a date as plain arithmetic in the same way. Use \`DATEDIFF(today.record_date, yesterday.record_date) = 1\` or \`DATE_SUB(today.record_date, INTERVAL 1 DAY)\`. In Postgres, \`date - 1\` gives the previous day.",
  },
  {
    kind: "sql",
    lc: 1661,
    topic: "sql-basic-joins",
    title: "Average Time of Process per Machine",
    difficulty: "Easy",
    statement: `Factory machines log events in \`job_events\`. Each job on a machine has a \`start\` event and an \`end\` event, and \`event_time\` is in seconds. An \`end\` time can be \`NULL\` if the machine never reported it.

For each machine, work out the **average processing time** of its jobs, where a job's time is its end time minus its start time.

- Round the average to **3 decimal places**.
- A job with a \`NULL\` end time is ignored in the average. A machine whose jobs all have a NULL end time still appears, with \`NULL\`.
- Return \`machine_id\` and \`processing_time\`. The rows can come back in any order.`,
    tables: [
      {name: "job_events", note: "Two rows per job: a start and an end. Job ids repeat across machines.", columns: [{name: "machine_id", type: "integer", pk: true}, {name: "job_id", type: "integer", pk: true}, {name: "event_type", type: "text", pk: true, note: "'start' or 'end'."}, {name: "event_time", type: "numeric(8,3)", note: "Seconds; NULL if not reported."}]},
    ],
    examples: [
      {
        tables: [
          {name: "job_events", columns: ["machine_id", "job_id", "event_type", "event_time"], rows: [[1, 1, "start", 2], [1, 1, "end", 5.5], [1, 2, "start", 10], [1, 2, "end", 12.25], [2, 1, "start", 1], [2, 1, "end", 1.4]]},
        ],
        result: {columns: ["machine_id", "processing_time"], rows: [[1, 2.875], [2, 0.4]]},
        explanation: "Machine 1: jobs took 3.5 and 2.25 seconds, so the average is 2.875. Machine 2 has one job of 0.4 seconds. Job 1 exists on both machines, so match jobs within a machine.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE job_events (machine_id integer NOT NULL, job_id integer NOT NULL, event_type text NOT NULL, event_time numeric(8,3), PRIMARY KEY (machine_id, job_id, event_type));
INSERT INTO job_events VALUES
 (1, 1, 'start', 2), (1, 1, 'end', 5.5), (1, 2, 'start', 10), (1, 2, 'end', 12.25),
 (2, 1, 'start', 1), (2, 1, 'end', 1.4), (2, 2, 'start', 3), (2, 2, 'end', 3.1), (2, 3, 'start', 4), (2, 3, 'end', 4.333),
 (3, 1, 'start', 0), (3, 1, 'end', 10);`, ["machine_id", "processing_time"], [[1, 2.875], [2, 0.278], [3, 10]]),
      t("rounding down to three places", `CREATE TABLE job_events (machine_id integer NOT NULL, job_id integer NOT NULL, event_type text NOT NULL, event_time numeric(8,3), PRIMARY KEY (machine_id, job_id, event_type));
INSERT INTO job_events VALUES (7, 1, 'start', 5), (7, 1, 'end', 6), (7, 2, 'start', 7), (7, 2, 'end', 7), (7, 3, 'start', 8), (7, 3, 'end', 8);`, ["machine_id", "processing_time"], [[7, 0.333]]),
      t("end time never reported", `CREATE TABLE job_events (machine_id integer NOT NULL, job_id integer NOT NULL, event_type text NOT NULL, event_time numeric(8,3), PRIMARY KEY (machine_id, job_id, event_type));
INSERT INTO job_events VALUES (4, 1, 'start', 1), (4, 1, 'end', NULL), (4, 2, 'start', 2), (4, 2, 'end', 4), (5, 1, 'start', 1), (5, 1, 'end', NULL);`, ["machine_id", "processing_time"], [[4, 2], [5, null]]),
      t("same job number on different machines", `CREATE TABLE job_events (machine_id integer NOT NULL, job_id integer NOT NULL, event_type text NOT NULL, event_time numeric(8,3), PRIMARY KEY (machine_id, job_id, event_type));
INSERT INTO job_events VALUES (1, 1, 'start', 0), (1, 1, 'end', 1), (2, 1, 'start', 100), (2, 1, 'end', 109);`, ["machine_id", "processing_time"], [[1, 1], [2, 9]]),
      t("no events", `CREATE TABLE job_events (machine_id integer NOT NULL, job_id integer NOT NULL, event_type text NOT NULL, event_time numeric(8,3), PRIMARY KEY (machine_id, job_id, event_type));`, ["machine_id", "processing_time"], []),
      t("worked example", `CREATE TABLE job_events (machine_id integer NOT NULL, job_id integer NOT NULL, event_type text NOT NULL, event_time numeric(8,3), PRIMARY KEY (machine_id, job_id, event_type));
INSERT INTO job_events VALUES (1, 1, 'start', 2), (1, 1, 'end', 5.5), (1, 2, 'start', 10), (1, 2, 'end', 12.25), (2, 1, 'start', 1), (2, 1, 'end', 1.4);`, ["machine_id", "processing_time"], [[1, 2.875], [2, 0.4]]),
    ],
    solution: `SELECT machine_id,
       ROUND(AVG(took), 3) AS processing_time
FROM (
  SELECT machine_id, job_id,
         MAX(event_time) FILTER (WHERE event_type = 'end')
         - MAX(event_time) FILTER (WHERE event_type = 'start') AS took
  FROM job_events
  GROUP BY machine_id, job_id
) AS jobs
GROUP BY machine_id`,
    approaches: [
      {
        id: "conditional-aggregation",
        title: "One row per job with FILTER, then average",
        optimal: true,
        explanation: "Group by machine and job, and pick out the end time and the start time with \`FILTER\`. Subtracting them gives one duration per job in a single pass over the table. Then average per machine. A NULL end time makes the duration NULL, and \`AVG\` skips NULLs, which is the rule in the statement.",
        code: `SELECT machine_id,
       ROUND(AVG(took), 3) AS processing_time
FROM (
  SELECT machine_id, job_id,
         MAX(event_time) FILTER (WHERE event_type = 'end')
         - MAX(event_time) FILTER (WHERE event_type = 'start') AS took
  FROM job_events
  GROUP BY machine_id, job_id
) AS jobs
GROUP BY machine_id`,
      },
      {
        id: "self-join",
        title: "Join the start rows to the end rows",
        optimal: false,
        explanation: "Join the table to itself so each start row meets the end row of the same machine **and** job. The join must use both columns, since job numbers repeat across machines. It is easy to read, but it reads the table twice and needs a careful join condition.",
        code: `SELECT s.machine_id,
       ROUND(AVG(e.event_time - s.event_time), 3) AS processing_time
FROM job_events AS s
JOIN job_events AS e
  ON e.machine_id = s.machine_id
 AND e.job_id = s.job_id
 AND s.event_type = 'start'
 AND e.event_type = 'end'
GROUP BY s.machine_id`,
      },
    ],
    hints: [
      "First get one number per job: the end time minus the start time. Then average those per machine.",
      "Two machines can both have a job 1. Which columns identify one job?",
    ],
    clarify: [
      {question: "What unit is the result in?", answer: "Seconds, the same unit as event_time, rounded to 3 decimal places."},
      {question: "What if a job has no end time?", answer: "It is ignored in the average. A machine with only such jobs shows NULL."},
    ],
    followUps: ["How would you find the machine whose slowest job took the longest?"],
    mysqlNote: "MySQL has no \`FILTER\` clause, so write \`MAX(CASE WHEN event_type = 'end' THEN event_time END)\`. \`ROUND\` on an exact decimal works the same way in both databases; in Postgres \`ROUND(x, 3)\` needs a \`numeric\` value, not a \`double precision\` one, so cast with \`::numeric\` if you work with floats.",
  },
  {
    kind: "sql",
    lc: 577,
    topic: "sql-basic-joins",
    title: "Employee Bonus",
    difficulty: "Easy",
    statement: `A company stores its people in \`team_members\` and the yearly awards it has paid in \`awards\`. Not everyone has an award row, and an award row can have a \`NULL\` bonus while the payment is pending.

Write a query that returns the \`name\` and \`bonus\` of every person whose bonus is **less than 1000**.

- A person with no award row, or with a \`NULL\` bonus, counts as having a bonus below 1000, and \`bonus\` is shown as \`NULL\`.
- A bonus of exactly 1000 is not below 1000.
- Return \`name\` then \`bonus\`. The rows can come back in any order.`,
    tables: [
      {name: "team_members", note: "One row per person.", columns: [{name: "member_id", type: "integer", pk: true}, {name: "name", type: "text"}, {name: "supervisor_id", type: "integer", note: "NULL for the top person."}, {name: "salary", type: "integer"}]},
      {name: "awards", note: "At most one row per person.", columns: [{name: "member_id", type: "integer", pk: true}, {name: "bonus", type: "integer", note: "NULL while pending."}]},
    ],
    examples: [
      {
        tables: [
          {name: "team_members", columns: ["member_id", "name", "supervisor_id", "salary"], rows: [[1, "Noor", null, 5200], [2, "Owen", 1, 4100], [3, "Pia", 1, 3900], [4, "Quin", 2, 3500]]},
          {name: "awards", columns: ["member_id", "bonus"], rows: [[2, 2000], [4, 800]]},
        ],
        result: {columns: ["name", "bonus"], rows: [["Noor", null], ["Pia", null], ["Quin", 800]]},
        explanation: "Owen's bonus of 2000 is too high. Noor and Pia have no award row, so they are included with a NULL bonus.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE team_members (member_id integer PRIMARY KEY, name text NOT NULL, supervisor_id integer, salary integer NOT NULL);
CREATE TABLE awards (member_id integer PRIMARY KEY, bonus integer);
INSERT INTO team_members VALUES (1, 'Noor', NULL, 5200), (2, 'Owen', 1, 4100), (3, 'Pia', 1, 3900), (4, 'Quin', 2, 3500);
INSERT INTO awards VALUES (2, 2000), (4, 800);`, ["name", "bonus"], [["Noor", null], ["Pia", null], ["Quin", 800]]),
      t("exactly 1000 and zero", `CREATE TABLE team_members (member_id integer PRIMARY KEY, name text NOT NULL, supervisor_id integer, salary integer NOT NULL);
CREATE TABLE awards (member_id integer PRIMARY KEY, bonus integer);
INSERT INTO team_members VALUES (1, 'Ravi', NULL, 1), (2, 'Sol', NULL, 1), (3, 'Tess', NULL, 1);
INSERT INTO awards VALUES (1, 1000), (2, 0), (3, 999);`, ["name", "bonus"], [["Sol", 0], ["Tess", 999]]),
      t("pending bonus is NULL", `CREATE TABLE team_members (member_id integer PRIMARY KEY, name text NOT NULL, supervisor_id integer, salary integer NOT NULL);
CREATE TABLE awards (member_id integer PRIMARY KEY, bonus integer);
INSERT INTO team_members VALUES (1, 'Uma', NULL, 1), (2, 'Vic', NULL, 1);
INSERT INTO awards VALUES (1, NULL), (2, 5000);`, ["name", "bonus"], [["Uma", null]]),
      t("same name twice", `CREATE TABLE team_members (member_id integer PRIMARY KEY, name text NOT NULL, supervisor_id integer, salary integer NOT NULL);
CREATE TABLE awards (member_id integer PRIMARY KEY, bonus integer);
INSERT INTO team_members VALUES (1, 'Wes', NULL, 1), (2, 'Wes', NULL, 1);
INSERT INTO awards VALUES (2, 400);`, ["name", "bonus"], [["Wes", null], ["Wes", 400]]),
      t("empty company", `CREATE TABLE team_members (member_id integer PRIMARY KEY, name text NOT NULL, supervisor_id integer, salary integer NOT NULL);
CREATE TABLE awards (member_id integer PRIMARY KEY, bonus integer);
INSERT INTO awards VALUES (1, 100);`, ["name", "bonus"], []),
    ],
    solution: `SELECT m.name, a.bonus
FROM team_members AS m
LEFT JOIN awards AS a ON a.member_id = m.member_id
WHERE a.bonus IS NULL
   OR a.bonus < 1000`,
    approaches: [
      {
        id: "left-join-is-null",
        title: "LEFT JOIN, then test NULL or below 1000",
        optimal: true,
        explanation: "A \`LEFT JOIN\` keeps every person and gives a NULL bonus when there is no award row. In \`WHERE\`, \`a.bonus < 1000\` is unknown for NULL, so the \`IS NULL\` half is needed to keep those people. This keeps the real bonus value in the output, with no invented zero.",
        code: `SELECT m.name, a.bonus
FROM team_members AS m
LEFT JOIN awards AS a ON a.member_id = m.member_id
WHERE a.bonus IS NULL
   OR a.bonus < 1000`,
      },
      {
        id: "coalesce",
        title: "COALESCE the bonus to 0 for the test",
        optimal: false,
        explanation: "Write \`COALESCE(a.bonus, 0) < 1000\` to turn a missing bonus into 0 for the comparison only, while still selecting the original \`a.bonus\`. It returns the same rows here. It hides the NULL rule inside a made-up zero, and it would be wrong if bonuses could be negative or if \"unknown\" must not be treated as small.",
        code: `SELECT m.name, a.bonus
FROM team_members AS m
LEFT JOIN awards AS a ON a.member_id = m.member_id
WHERE COALESCE(a.bonus, 0) < 1000`,
      },
    ],
    hints: [
      "Which join keeps people who have no award row?",
      "After the join, what does `bonus < 1000` give for a NULL bonus? How do you keep those rows?",
    ],
    clarify: [
      {question: "Is a person with no award row included?", answer: "Yes, with a NULL bonus."},
      {question: "Is a bonus of exactly 1000 included?", answer: "No. It must be below 1000."},
    ],
    followUps: ["How would you also include each person's supervisor name in the result?"],
    mysqlNote: "The query is the same in MySQL. If you use \`IFNULL(a.bonus, 0)\`, that is MySQL's two-argument form of \`COALESCE\`, which also works in Postgres.",
  },
  {
    kind: "sql",
    lc: 1280,
    topic: "sql-basic-joins",
    title: "Students and Examinations",
    difficulty: "Easy",
    statement: `A school has \`learners\`, a list of \`courses\`, and a log of every quiz a learner took in \`quiz_attempts\`. Every learner is supposed to take every course, but many have taken only some. A learner can take the same course's quiz more than once. The \`score\` is \`NULL\` while a quiz is being marked, and that attempt still counts.

Write a query that shows **every learner paired with every course** and how many attempts the learner has made on that course (0 if none).

- Return \`student_id\`, \`student_name\`, \`subject_name\`, \`attended_exams\`.
- Sort by \`student_id\`, then \`subject_name\`.`,
    tables: [
      {name: "learners", columns: [{name: "student_id", type: "integer", pk: true}, {name: "student_name", type: "text"}]},
      {name: "courses", columns: [{name: "subject_name", type: "text", pk: true}]},
      {name: "quiz_attempts", note: "One row per attempt.", columns: [{name: "attempt_id", type: "integer", pk: true}, {name: "student_id", type: "integer"}, {name: "subject_name", type: "text"}, {name: "score", type: "integer", note: "NULL while being marked."}]},
    ],
    examples: [
      {
        tables: [
          {name: "learners", columns: ["student_id", "student_name"], rows: [[1, "Wren"], [2, "Xan"]]},
          {name: "courses", columns: ["subject_name"], rows: [["Maths"], ["Music"]]},
          {name: "quiz_attempts", columns: ["attempt_id", "student_id", "subject_name", "score"], rows: [[1, 1, "Maths", 80], [2, 1, "Maths", null]]},
        ],
        result: {columns: ["student_id", "student_name", "subject_name", "attended_exams"], rows: [[1, "Wren", "Maths", 2], [1, "Wren", "Music", 0], [2, "Xan", "Maths", 0], [2, "Xan", "Music", 0]]},
        explanation: "Four pairs (2 learners x 2 courses). Wren has two Maths attempts, one of them not yet marked, and both count.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE learners (student_id integer PRIMARY KEY, student_name text NOT NULL);
CREATE TABLE courses (subject_name text PRIMARY KEY);
CREATE TABLE quiz_attempts (attempt_id integer PRIMARY KEY, student_id integer NOT NULL, subject_name text NOT NULL, score integer);
INSERT INTO learners VALUES (1, 'Wren'), (2, 'Xan'), (3, 'Yara');
INSERT INTO courses VALUES ('Maths'), ('Music'), ('Physics');
INSERT INTO quiz_attempts VALUES (1, 1, 'Maths', 80), (2, 1, 'Maths', NULL), (3, 1, 'Physics', 70), (4, 3, 'Music', 60), (5, 3, 'Maths', 55), (6, 3, 'Maths', 90), (7, 3, 'Maths', NULL);`,
        ["student_id", "student_name", "subject_name", "attended_exams"],
        [[1, "Wren", "Maths", 2], [1, "Wren", "Music", 0], [1, "Wren", "Physics", 1], [2, "Xan", "Maths", 0], [2, "Xan", "Music", 0], [2, "Xan", "Physics", 0], [3, "Yara", "Maths", 3], [3, "Yara", "Music", 1], [3, "Yara", "Physics", 0]], true),
      t("nobody has taken a quiz", `CREATE TABLE learners (student_id integer PRIMARY KEY, student_name text NOT NULL);
CREATE TABLE courses (subject_name text PRIMARY KEY);
CREATE TABLE quiz_attempts (attempt_id integer PRIMARY KEY, student_id integer NOT NULL, subject_name text NOT NULL, score integer);
INSERT INTO learners VALUES (2, 'Zed'), (1, 'Abe');
INSERT INTO courses VALUES ('Art'), ('Zoology');`,
        ["student_id", "student_name", "subject_name", "attended_exams"],
        [[1, "Abe", "Art", 0], [1, "Abe", "Zoology", 0], [2, "Zed", "Art", 0], [2, "Zed", "Zoology", 0]], true),
      t("unmarked attempts still count", `CREATE TABLE learners (student_id integer PRIMARY KEY, student_name text NOT NULL);
CREATE TABLE courses (subject_name text PRIMARY KEY);
CREATE TABLE quiz_attempts (attempt_id integer PRIMARY KEY, student_id integer NOT NULL, subject_name text NOT NULL, score integer);
INSERT INTO learners VALUES (1, 'Bo');
INSERT INTO courses VALUES ('Latin');
INSERT INTO quiz_attempts VALUES (1, 1, 'Latin', NULL), (2, 1, 'Latin', NULL), (3, 1, 'Latin', NULL);`,
        ["student_id", "student_name", "subject_name", "attended_exams"], [[1, "Bo", "Latin", 3]], true),
      t("two learners with the same name", `CREATE TABLE learners (student_id integer PRIMARY KEY, student_name text NOT NULL);
CREATE TABLE courses (subject_name text PRIMARY KEY);
CREATE TABLE quiz_attempts (attempt_id integer PRIMARY KEY, student_id integer NOT NULL, subject_name text NOT NULL, score integer);
INSERT INTO learners VALUES (1, 'Cy'), (2, 'Cy');
INSERT INTO courses VALUES ('Drama');
INSERT INTO quiz_attempts VALUES (1, 2, 'Drama', 50);`,
        ["student_id", "student_name", "subject_name", "attended_exams"], [[1, "Cy", "Drama", 0], [2, "Cy", "Drama", 1]], true),
      t("no learners", `CREATE TABLE learners (student_id integer PRIMARY KEY, student_name text NOT NULL);
CREATE TABLE courses (subject_name text PRIMARY KEY);
CREATE TABLE quiz_attempts (attempt_id integer PRIMARY KEY, student_id integer NOT NULL, subject_name text NOT NULL, score integer);
INSERT INTO courses VALUES ('Art');`,
        ["student_id", "student_name", "subject_name", "attended_exams"], [], true),
      t("worked example", `CREATE TABLE learners (student_id integer PRIMARY KEY, student_name text NOT NULL);
CREATE TABLE courses (subject_name text PRIMARY KEY);
CREATE TABLE quiz_attempts (attempt_id integer PRIMARY KEY, student_id integer NOT NULL, subject_name text NOT NULL, score integer);
INSERT INTO learners VALUES (1, 'Wren'), (2, 'Xan');
INSERT INTO courses VALUES ('Maths'), ('Music');
INSERT INTO quiz_attempts VALUES (1, 1, 'Maths', 80), (2, 1, 'Maths', NULL);`,
        ["student_id", "student_name", "subject_name", "attended_exams"], [[1, "Wren", "Maths", 2], [1, "Wren", "Music", 0], [2, "Xan", "Maths", 0], [2, "Xan", "Music", 0]], true),
    ],
    solution: `SELECT l.student_id, l.student_name, c.subject_name,
       COUNT(a.attempt_id) AS attended_exams
FROM learners AS l
CROSS JOIN courses AS c
LEFT JOIN quiz_attempts AS a
  ON a.student_id = l.student_id
 AND a.subject_name = c.subject_name
GROUP BY l.student_id, l.student_name, c.subject_name
ORDER BY l.student_id, c.subject_name`,
    approaches: [
      {
        id: "cross-then-left",
        title: "CROSS JOIN every pair, LEFT JOIN the attempts, COUNT",
        optimal: true,
        explanation: "\`CROSS JOIN\` creates every learner-and-course pair, so pairs with no attempts exist before counting. \`LEFT JOIN\` then attaches the attempts. \`COUNT(a.attempt_id)\` counts only real attempts: for a pair with none, the column is NULL and the count is 0. \`COUNT(*)\` would wrongly give 1 for those pairs, and \`COUNT(a.score)\` would skip attempts still being marked.",
        code: `SELECT l.student_id, l.student_name, c.subject_name,
       COUNT(a.attempt_id) AS attended_exams
FROM learners AS l
CROSS JOIN courses AS c
LEFT JOIN quiz_attempts AS a
  ON a.student_id = l.student_id
 AND a.subject_name = c.subject_name
GROUP BY l.student_id, l.student_name, c.subject_name
ORDER BY l.student_id, c.subject_name`,
      },
      {
        id: "pre-aggregate",
        title: "Count attempts first, then CROSS JOIN with COALESCE",
        optimal: false,
        explanation: "Count the attempts per learner and course in a CTE, then cross join learners and courses and look up the count, using \`COALESCE(n, 0)\` for missing pairs. It gives the same answer and keeps the final join small when there are many attempts. It is longer, so use it when the attempts table is huge compared with the learners and courses.",
        code: `WITH counts AS (
  SELECT student_id, subject_name, COUNT(*) AS n
  FROM quiz_attempts
  GROUP BY student_id, subject_name
)
SELECT l.student_id, l.student_name, c.subject_name,
       COALESCE(k.n, 0) AS attended_exams
FROM learners AS l
CROSS JOIN courses AS c
LEFT JOIN counts AS k
  ON k.student_id = l.student_id
 AND k.subject_name = c.subject_name
ORDER BY l.student_id, c.subject_name`,
      },
    ],
    hints: [
      "Which join gives every learner and course pair, even when there are no attempts?",
      "After attaching the attempts, which COUNT gives 0 for a pair with no attempts?",
    ],
    clarify: [
      {question: "Does an attempt with no score yet count?", answer: "Yes. Every row in quiz_attempts is one attempt."},
      {question: "In what order should rows come back?", answer: "By student_id, then subject_name."},
    ],
    followUps: ["How would you list only the learner and course pairs that have never been attempted?"],
  },
  {
    kind: "sql",
    lc: 570,
    topic: "sql-basic-joins",
    title: "Managers with at Least 5 Direct Reports",
    difficulty: "Medium",
    statement: `The \`crew\` table lists everyone in a company. The \`manager_id\` column holds the \`member_id\` of a person's direct manager, or \`NULL\` for people at the top.

Write a query that returns the \`name\` of every person who has **at least 5 direct reports** (people whose \`manager_id\` is theirs). People who report to a manager's own reports do not count.

- Return one column named \`name\`.
- Two different managers can share a name; each one appears in the result on their own.
- The rows can come back in any order.`,
    tables: [
      {name: "crew", note: "One row per person.", columns: [{name: "member_id", type: "integer", pk: true}, {name: "name", type: "text"}, {name: "team", type: "text"}, {name: "manager_id", type: "integer", note: "NULL for people with no manager."}]},
    ],
    examples: [
      {
        tables: [
          {name: "crew", columns: ["member_id", "name", "team", "manager_id"], rows: [[1, "Dara", "Ops", null], [2, "Eli", "Ops", 1], [3, "Fay", "Ops", 1], [4, "Gil", "Ops", 1], [5, "Hana", "Ops", 1], [6, "Ivy", "Ops", 1], [7, "Jo", "Lab", null], [8, "Kai", "Lab", 7], [9, "Lou", "Lab", 7], [10, "Mia", "Lab", 7], [11, "Ned", "Lab", 7]]},
        ],
        result: {columns: ["name"], rows: [["Dara"]]},
        explanation: "Dara has five direct reports. Jo has only four, so Jo is not included.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE crew (member_id integer PRIMARY KEY, name text NOT NULL, team text NOT NULL, manager_id integer);
INSERT INTO crew VALUES (1, 'Dara', 'Ops', NULL), (2, 'Eli', 'Ops', 1), (3, 'Fay', 'Ops', 1), (4, 'Gil', 'Ops', 1), (5, 'Hana', 'Ops', 1), (6, 'Ivy', 'Ops', 1),
 (7, 'Jo', 'Lab', NULL), (8, 'Kai', 'Lab', 7), (9, 'Lou', 'Lab', 7), (10, 'Mia', 'Lab', 7), (11, 'Ned', 'Lab', 7);`, ["name"], [["Dara"]]),
      t("more than five, and several managers", `CREATE TABLE crew (member_id integer PRIMARY KEY, name text NOT NULL, team text NOT NULL, manager_id integer);
INSERT INTO crew VALUES (1, 'Opal', 'A', NULL), (2, 'Pax', 'A', 1), (3, 'Quill', 'A', 1), (4, 'Rey', 'A', 1), (5, 'Sky', 'A', 1), (6, 'Tam', 'A', 1), (7, 'Una', 'A', 1),
 (8, 'Val', 'B', 2), (9, 'Wes', 'B', 2), (10, 'Xia', 'B', 2), (11, 'Yul', 'B', 2), (12, 'Zoe', 'B', 2);`, ["name"], [["Opal"], ["Pax"]]),
      t("many people with no manager", `CREATE TABLE crew (member_id integer PRIMARY KEY, name text NOT NULL, team text NOT NULL, manager_id integer);
INSERT INTO crew VALUES (1, 'A1', 'X', NULL), (2, 'A2', 'X', NULL), (3, 'A3', 'X', NULL), (4, 'A4', 'X', NULL), (5, 'A5', 'X', NULL), (6, 'A6', 'X', NULL);`, ["name"], []),
      t("same name, different managers", `CREATE TABLE crew (member_id integer PRIMARY KEY, name text NOT NULL, team text NOT NULL, manager_id integer);
INSERT INTO crew VALUES (1, 'Sam', 'N', NULL), (2, 'Sam', 'S', NULL),
 (3, 'a', 'N', 1), (4, 'b', 'N', 1), (5, 'c', 'N', 1), (6, 'd', 'S', 2), (7, 'e', 'S', 2), (8, 'f', 'S', 2);`, ["name"], []),
      t("two managers with the same name both qualify", `CREATE TABLE crew (member_id integer PRIMARY KEY, name text NOT NULL, team text NOT NULL, manager_id integer);
INSERT INTO crew VALUES (1, 'Kim', 'N', NULL), (2, 'Kim', 'S', NULL),
 (3, 'a', 'N', 1), (4, 'b', 'N', 1), (5, 'c', 'N', 1), (6, 'd', 'N', 1), (7, 'e', 'N', 1),
 (8, 'f', 'S', 2), (9, 'g', 'S', 2), (10, 'h', 'S', 2), (11, 'i', 'S', 2), (12, 'j', 'S', 2);`, ["name"], [["Kim"], ["Kim"]]),
    ],
    solution: `SELECT name
FROM crew
WHERE member_id IN (
  SELECT manager_id
  FROM crew
  GROUP BY manager_id
  HAVING COUNT(*) >= 5
)`,
    approaches: [
      {
        id: "in-subquery",
        title: "Find managers by counting reports, then look up their names",
        optimal: true,
        explanation: "The inner query groups people by \`manager_id\` and keeps managers with 5 or more rows. The outer query turns those ids into names. Grouping by the id (not the name) keeps two managers with the same name apart. The NULL group (people with no manager) can be large, but \`member_id IN (NULL)\` never matches, so it does no harm.",
        code: `SELECT name
FROM crew
WHERE member_id IN (
  SELECT manager_id
  FROM crew
  GROUP BY manager_id
  HAVING COUNT(*) >= 5
)`,
      },
      {
        id: "self-join",
        title: "Self-join managers to their reports and group",
        optimal: false,
        explanation: "Join each person (the manager) to the people whose \`manager_id\` is theirs, group by the manager's id and name, and keep groups of 5 or more. It gives the same rows but builds a wide joined table before counting, so it does more work than counting on the narrow id column first. Remember to group by \`member_id\` too, not by name alone.",
        code: `SELECT m.name
FROM crew AS m
JOIN crew AS r ON r.manager_id = m.member_id
GROUP BY m.member_id, m.name
HAVING COUNT(*) >= 5`,
      },
    ],
    hints: [
      "How do you count the rows that share the same manager_id?",
      "Which keyword filters groups after counting? Is \"at least 5\" `>` or `>=`?",
      "Two managers may share a name. What should you group by?",
    ],
    clarify: [
      {question: "Do indirect reports count?", answer: "No. Only people whose manager_id is the manager's own member_id."},
      {question: "Can a manager appear twice if they have many reports?", answer: "No. Each qualifying manager is one row."},
    ],
    followUps: ["How would you also return the number of direct reports next to each manager's name?"],
  },
  {
    kind: "sql",
    lc: 1934,
    topic: "sql-basic-joins",
    title: "Confirmation Rate",
    difficulty: "Medium",
    statement: `An app sends confirmation emails. \`accounts\` lists every user, and \`email_checks\` has one row for each confirmation email, with an \`outcome\` of \`'confirmed'\` or \`'timeout'\`. The time of a check can be \`NULL\` and does not matter here.

A user's **confirmation rate** is the number of their \`'confirmed'\` emails divided by the number of emails sent to them.

- A user who has not been sent any email has a rate of **0**.
- Round the rate to **2 decimal places**.
- Return \`user_id\` and \`confirmation_rate\` for every user in \`accounts\`. The rows can come back in any order.`,
    tables: [
      {name: "accounts", columns: [{name: "user_id", type: "integer", pk: true}, {name: "created_at", type: "timestamp"}]},
      {name: "email_checks", note: "One row per email sent.", columns: [{name: "user_id", type: "integer"}, {name: "checked_at", type: "timestamp", note: "May be NULL."}, {name: "outcome", type: "text", note: "'confirmed' or 'timeout'."}]},
    ],
    examples: [
      {
        tables: [
          {name: "accounts", columns: ["user_id", "created_at"], rows: [[1, "2024-01-01 09:00:00"], [2, "2024-01-02 09:00:00"], [3, "2024-01-03 09:00:00"]]},
          {name: "email_checks", columns: ["user_id", "checked_at", "outcome"], rows: [[1, "2024-01-01 09:05:00", "confirmed"], [1, "2024-01-01 09:10:00", "timeout"], [1, "2024-01-02 09:00:00", "confirmed"], [2, "2024-01-02 10:00:00", "timeout"]]},
        ],
        result: {columns: ["user_id", "confirmation_rate"], rows: [[1, 0.67], [2, 0], [3, 0]]},
        explanation: "User 1: 2 of 3 emails confirmed, which is 0.67 when rounded. User 2: 0 of 1. User 3 was sent nothing, so the rate is 0.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE accounts (user_id integer PRIMARY KEY, created_at timestamp);
CREATE TABLE email_checks (user_id integer NOT NULL, checked_at timestamp, outcome text NOT NULL);
INSERT INTO accounts VALUES (1, '2024-01-01 09:00:00'), (2, '2024-01-02 09:00:00'), (3, '2024-01-03 09:00:00'), (4, '2024-01-04 09:00:00'), (5, '2024-01-05 09:00:00');
INSERT INTO email_checks VALUES (1, '2024-01-01 09:05:00', 'confirmed'), (1, '2024-01-01 09:10:00', 'timeout'), (1, '2024-01-02 09:00:00', 'confirmed'),
 (2, '2024-01-02 10:00:00', 'timeout'), (2, NULL, 'timeout'),
 (4, '2024-01-04 10:00:00', 'confirmed'),
 (5, '2024-01-05 10:00:00', 'timeout'), (5, NULL, 'timeout'), (5, '2024-01-05 11:00:00', 'confirmed');`, ["user_id", "confirmation_rate"], [[1, 0.67], [2, 0], [3, 0], [4, 1], [5, 0.33]]),
      t("nobody has been emailed", `CREATE TABLE accounts (user_id integer PRIMARY KEY, created_at timestamp);
CREATE TABLE email_checks (user_id integer NOT NULL, checked_at timestamp, outcome text NOT NULL);
INSERT INTO accounts VALUES (1, NULL), (2, NULL);`, ["user_id", "confirmation_rate"], [[1, 0], [2, 0]]),
      t("rounding of repeating decimals", `CREATE TABLE accounts (user_id integer PRIMARY KEY, created_at timestamp);
CREATE TABLE email_checks (user_id integer NOT NULL, checked_at timestamp, outcome text NOT NULL);
INSERT INTO accounts VALUES (8, NULL), (9, NULL);
INSERT INTO email_checks VALUES (8, NULL, 'confirmed'), (8, NULL, 'confirmed'), (8, NULL, 'timeout'), (8, NULL, 'timeout'), (8, NULL, 'timeout'), (8, NULL, 'timeout'), (8, NULL, 'timeout'), (8, NULL, 'timeout'),
 (9, NULL, 'confirmed'), (9, NULL, 'confirmed'), (9, NULL, 'confirmed'), (9, NULL, 'confirmed'), (9, NULL, 'timeout'), (9, NULL, 'timeout'), (9, NULL, 'timeout'), (9, NULL, 'timeout'), (9, NULL, 'timeout');`, ["user_id", "confirmation_rate"], [[8, 0.25], [9, 0.44]]),
      t("emails for a user who does not exist are ignored", `CREATE TABLE accounts (user_id integer PRIMARY KEY, created_at timestamp);
CREATE TABLE email_checks (user_id integer NOT NULL, checked_at timestamp, outcome text NOT NULL);
INSERT INTO accounts VALUES (1, NULL);
INSERT INTO email_checks VALUES (1, NULL, 'confirmed'), (99, NULL, 'confirmed');`, ["user_id", "confirmation_rate"], [[1, 1]]),
      t("no accounts", `CREATE TABLE accounts (user_id integer PRIMARY KEY, created_at timestamp);
CREATE TABLE email_checks (user_id integer NOT NULL, checked_at timestamp, outcome text NOT NULL);
INSERT INTO email_checks VALUES (1, NULL, 'confirmed');`, ["user_id", "confirmation_rate"], []),
      t("worked example", `CREATE TABLE accounts (user_id integer PRIMARY KEY, created_at timestamp);
CREATE TABLE email_checks (user_id integer NOT NULL, checked_at timestamp, outcome text NOT NULL);
INSERT INTO accounts VALUES (1, '2024-01-01 09:00:00'), (2, '2024-01-02 09:00:00'), (3, '2024-01-03 09:00:00');
INSERT INTO email_checks VALUES (1, '2024-01-01 09:05:00', 'confirmed'), (1, '2024-01-01 09:10:00', 'timeout'), (1, '2024-01-02 09:00:00', 'confirmed'), (2, '2024-01-02 10:00:00', 'timeout');`, ["user_id", "confirmation_rate"], [[1, 0.67], [2, 0], [3, 0]]),
    ],
    solution: `SELECT a.user_id,
       ROUND(COALESCE(AVG((c.outcome = 'confirmed')::int), 0), 2) AS confirmation_rate
FROM accounts AS a
LEFT JOIN email_checks AS c ON c.user_id = a.user_id
GROUP BY a.user_id`,
    approaches: [
      {
        id: "avg-of-flags",
        title: "AVERAGE of a 1/0 flag, COALESCE for no emails",
        optimal: true,
        explanation: "Turn each email into 1 (confirmed) or 0 (anything else) and take the average: that is exactly confirmed divided by total, and there is no division to get wrong. The \`LEFT JOIN\` keeps users with no emails. For them the flag is NULL, so the average is NULL, and \`COALESCE(..., 0)\` turns it into the required 0. The average of integers is an exact decimal in Postgres, so \`ROUND(..., 2)\` works.",
        code: `SELECT a.user_id,
       ROUND(COALESCE(AVG((c.outcome = 'confirmed')::int), 0), 2) AS confirmation_rate
FROM accounts AS a
LEFT JOIN email_checks AS c ON c.user_id = a.user_id
GROUP BY a.user_id`,
      },
      {
        id: "count-filter",
        title: "Two counts and an explicit zero case",
        optimal: false,
        explanation: "Count the confirmed emails with \`FILTER\`, count all emails, and divide, with a \`CASE\` that returns 0 when there are no emails (otherwise you divide by zero). Cast one count to \`numeric\` first, since dividing two integers drops the decimals. It is correct but longer and has two things to remember (the cast and the zero case).",
        code: `SELECT a.user_id,
       CASE WHEN COUNT(c.user_id) = 0 THEN 0
            ELSE ROUND(COUNT(c.user_id) FILTER (WHERE c.outcome = 'confirmed')::numeric / COUNT(c.user_id), 2)
       END AS confirmation_rate
FROM accounts AS a
LEFT JOIN email_checks AS c ON c.user_id = a.user_id
GROUP BY a.user_id`,
      },
    ],
    hints: [
      "Which join keeps users who have no emails at all?",
      "Dividing two integers in SQL can drop the decimals. How can you avoid that?",
      "What does an average over no rows give? How do you turn it into 0?",
    ],
    clarify: [
      {question: "What is the rate for a user who was sent no email?", answer: "0."},
      {question: "Should users that are not in accounts be listed?", answer: "No. Only users in accounts."},
    ],
    followUps: ["How would you report the rate separately for each month the emails were sent?"],
    mysqlNote: "MySQL has no \`FILTER\` clause or \`::int\` cast. Write \`AVG(c.outcome = 'confirmed')\`, because comparisons return 1 or 0 there, or use \`SUM(CASE WHEN ... THEN 1 ELSE 0 END)\`. Division with \`/\` in MySQL already returns a decimal, while in Postgres two integers give an integer.",
  },
];
