/**
 * SQL problems: Basic Aggregate Functions (SQL 50 topic 3). Question numbers and titles follow LeetCode's public
 * SQL 50 plan; every statement, table, row, test, solution and explanation is our own words and our own data
 * (see ../sql-types.ts). Answers run on Postgres (PGlite) in the browser.
 * - 620 Not Boring Movies (Easy)
 * - 1251 Average Selling Price (Easy)
 * - 1075 Project Employees I (Easy)
 * - 1633 Percentage of Users Attended a Contest (Easy)
 * - 1211 Queries Quality and Percentage (Easy)
 * - 1193 Monthly Transactions I (Medium)
 * - 1174 Immediate Food Delivery II (Medium)
 * - 550 Game Play Analysis IV (Medium)
 */
import type {SqlCell, SqlProblemSeed} from "../sql-types";

const t = (name: string, setup: string, columns: string[], rows: SqlCell[][], ordered = false) => ({name, setup, expected: {columns, rows}, ordered});

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
  {
    kind: "sql",
    lc: 1251,
    topic: "sql-basic-aggregate",
    title: "Average Selling Price",
    difficulty: "Easy",
    statement: `A warehouse sells products whose unit price changes over time. \`price_periods\` says which price applied between two dates (both dates included). An \`end_date\` of \`NULL\` means the price has no end date yet. \`shipments\` records how many units were shipped on each day.

For each product, work out the **average selling price**: the total money earned divided by the total number of units shipped, where each shipment uses the price in force on its ship date.

- Round to **2 decimal places**.
- A product with no shipments gets an average of **0**. A shipment whose date falls in no price period is ignored.
- Return \`product_id\` and \`average_price\`. The rows can come back in any order.`,
    tables: [
      {name: "price_periods", note: "A product can have several periods; periods of one product never overlap.", columns: [{name: "product_id", type: "integer"}, {name: "start_date", type: "date"}, {name: "end_date", type: "date", note: "NULL if the price is still current."}, {name: "unit_price", type: "numeric(8,2)"}]},
      {name: "shipments", note: "One row per shipment.", columns: [{name: "product_id", type: "integer"}, {name: "ship_date", type: "date"}, {name: "units", type: "integer"}]},
    ],
    examples: [
      {
        tables: [
          {name: "price_periods", columns: ["product_id", "start_date", "end_date", "unit_price"], rows: [[1, "2024-01-01", "2024-01-31", 10], [1, "2024-02-01", "2024-02-29", 12], [3, "2024-01-01", null, 8]]},
          {name: "shipments", columns: ["product_id", "ship_date", "units"], rows: [[1, "2024-01-10", 100], [1, "2024-02-15", 50]]},
        ],
        result: {columns: ["product_id", "average_price"], rows: [[1, 10.67], [3, 0]]},
        explanation: "Product 1 earned 100 x 10 + 50 x 12 = 1600 from 150 units, so 1600 / 150 = 10.67. Product 3 had no shipments, so its average is 0.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE price_periods (product_id integer NOT NULL, start_date date NOT NULL, end_date date, unit_price numeric(8,2) NOT NULL);
CREATE TABLE shipments (product_id integer NOT NULL, ship_date date NOT NULL, units integer NOT NULL);
INSERT INTO price_periods VALUES (1, '2024-01-01', '2024-01-31', 10.00), (1, '2024-02-01', '2024-02-29', 12.00), (2, '2024-01-01', '2024-03-31', 5.00), (3, '2024-01-01', NULL, 8.00);
INSERT INTO shipments VALUES (1, '2024-01-10', 100), (1, '2024-02-15', 50), (2, '2024-01-20', 200);`, ["product_id", "average_price"], [[1, 10.67], [2, 5], [3, 0]]),
      t("price with no end date", `CREATE TABLE price_periods (product_id integer NOT NULL, start_date date NOT NULL, end_date date, unit_price numeric(8,2) NOT NULL);
CREATE TABLE shipments (product_id integer NOT NULL, ship_date date NOT NULL, units integer NOT NULL);
INSERT INTO price_periods VALUES (4, '2024-01-01', NULL, 3.00);
INSERT INTO shipments VALUES (4, '2030-05-05', 10), (4, '2024-01-01', 10);`, ["product_id", "average_price"], [[4, 3]]),
      t("period edges are included, outside dates ignored", `CREATE TABLE price_periods (product_id integer NOT NULL, start_date date NOT NULL, end_date date, unit_price numeric(8,2) NOT NULL);
CREATE TABLE shipments (product_id integer NOT NULL, ship_date date NOT NULL, units integer NOT NULL);
INSERT INTO price_periods VALUES (5, '2024-01-01', '2024-01-31', 20.00), (5, '2024-02-01', '2024-02-28', 40.00);
INSERT INTO shipments VALUES (5, '2024-01-31', 1), (5, '2024-02-01', 1), (5, '2024-03-05', 99), (5, '2023-12-31', 99);`, ["product_id", "average_price"], [[5, 30]]),
      t("several shipments on one day", `CREATE TABLE price_periods (product_id integer NOT NULL, start_date date NOT NULL, end_date date, unit_price numeric(8,2) NOT NULL);
CREATE TABLE shipments (product_id integer NOT NULL, ship_date date NOT NULL, units integer NOT NULL);
INSERT INTO price_periods VALUES (6, '2024-06-01', '2024-06-30', 7.50), (7, '2024-06-01', '2024-06-30', 1.00);
INSERT INTO shipments VALUES (6, '2024-06-10', 2), (6, '2024-06-10', 2), (6, '2024-06-10', 4), (7, '2025-01-01', 5);`, ["product_id", "average_price"], [[6, 7.5], [7, 0]]),
      t("no products", `CREATE TABLE price_periods (product_id integer NOT NULL, start_date date NOT NULL, end_date date, unit_price numeric(8,2) NOT NULL);
CREATE TABLE shipments (product_id integer NOT NULL, ship_date date NOT NULL, units integer NOT NULL);
INSERT INTO shipments VALUES (1, '2024-01-01', 5);`, ["product_id", "average_price"], []),
      t("worked example", `CREATE TABLE price_periods (product_id integer NOT NULL, start_date date NOT NULL, end_date date, unit_price numeric(8,2) NOT NULL);
CREATE TABLE shipments (product_id integer NOT NULL, ship_date date NOT NULL, units integer NOT NULL);
INSERT INTO price_periods VALUES (1, '2024-01-01', '2024-01-31', 10.00), (1, '2024-02-01', '2024-02-29', 12.00), (3, '2024-01-01', NULL, 8.00);
INSERT INTO shipments VALUES (1, '2024-01-10', 100), (1, '2024-02-15', 50);`, ["product_id", "average_price"], [[1, 10.67], [3, 0]]),
    ],
    solution: `SELECT p.product_id,
       COALESCE(ROUND(SUM(p.unit_price * s.units) / NULLIF(SUM(s.units), 0), 2), 0) AS average_price
FROM price_periods AS p
LEFT JOIN shipments AS s
  ON s.product_id = p.product_id
 AND s.ship_date >= p.start_date
 AND (p.end_date IS NULL OR s.ship_date <= p.end_date)
GROUP BY p.product_id`,
    approaches: [
      {
        id: "left-join-range",
        title: "LEFT JOIN on the date range, weighted average",
        optimal: true,
        explanation: "Join each price period to the shipments that fall inside it (\`ship_date\` between start and end, with a NULL end meaning open-ended). A \`LEFT JOIN\` keeps products with no shipments. The weighted average is total revenue divided by total units, **not** the average of the prices. \`NULLIF(..., 0)\` avoids dividing by zero and gives NULL, which \`COALESCE\` turns into 0.",
        code: `SELECT p.product_id,
       COALESCE(ROUND(SUM(p.unit_price * s.units) / NULLIF(SUM(s.units), 0), 2), 0) AS average_price
FROM price_periods AS p
LEFT JOIN shipments AS s
  ON s.product_id = p.product_id
 AND s.ship_date >= p.start_date
 AND (p.end_date IS NULL OR s.ship_date <= p.end_date)
GROUP BY p.product_id`,
      },
      {
        id: "sold-cte",
        title: "Total the sales in a CTE, then attach to every product",
        optimal: false,
        explanation: "Compute revenue and units per product with an inner join in a CTE, then start from the list of products and left join the totals, using \`COALESCE\` for products with no sales. It gives the same answer and separates the two steps, but it is longer and needs a separate product list.",
        code: `WITH sold AS (
  SELECT p.product_id,
         SUM(p.unit_price * s.units) AS revenue,
         SUM(s.units) AS units
  FROM price_periods AS p
  JOIN shipments AS s
    ON s.product_id = p.product_id
   AND s.ship_date >= p.start_date
   AND (p.end_date IS NULL OR s.ship_date <= p.end_date)
  GROUP BY p.product_id
)
SELECT d.product_id,
       COALESCE(ROUND(sold.revenue / sold.units, 2), 0) AS average_price
FROM (SELECT DISTINCT product_id FROM price_periods) AS d
LEFT JOIN sold ON sold.product_id = d.product_id`,
      },
    ],
    hints: [
      "Which condition decides that a shipment belongs to a price period? Remember the NULL end date.",
      "Is the answer the average of the prices, or total money divided by total units?",
      "How do you keep a product that has no shipments?",
    ],
    clarify: [
      {question: "Are the start and end dates of a period included?", answer: "Yes, both are included."},
      {question: "What if a product has no shipments?", answer: "Its average selling price is 0."},
    ],
    followUps: ["How would you show the average selling price per product for each month?"],
    mysqlNote: "The join and the arithmetic are the same in MySQL, where \`IFNULL\` is the two-argument form of \`COALESCE\`. Division by zero returns NULL in MySQL by default but is an error in Postgres, so keep the \`NULLIF\` in Postgres.",
  },
  {
    kind: "sql",
    lc: 1075,
    topic: "sql-basic-aggregate",
    title: "Project Employees I",
    difficulty: "Easy",
    statement: `\`project_staff\` says which people work on which project, and \`staff_members\` holds each person's years of experience. The experience is \`NULL\` when it is not known.

For each project, find the **average years of experience** of the people on it.

- Round to **2 decimal places**.
- Unknown (NULL) experience is ignored in the average. A project where nobody has a known value gets \`NULL\`.
- Return \`project_id\` and \`average_years\`. Projects without staff do not appear. The rows can come back in any order.`,
    tables: [
      {name: "project_staff", columns: [{name: "project_id", type: "integer", pk: true}, {name: "member_id", type: "integer", pk: true}]},
      {name: "staff_members", columns: [{name: "member_id", type: "integer", pk: true}, {name: "name", type: "text"}, {name: "years_experience", type: "integer", note: "NULL if unknown."}]},
    ],
    examples: [
      {
        tables: [
          {name: "staff_members", columns: ["member_id", "name", "years_experience"], rows: [[1, "Ada", 3], [2, "Bo", 2], [3, "Cy", 2], [4, "Di", 5]]},
          {name: "project_staff", columns: ["project_id", "member_id"], rows: [[1, 1], [1, 2], [1, 3], [2, 1], [2, 4]]},
        ],
        result: {columns: ["project_id", "average_years"], rows: [[1, 2.33], [2, 4]]},
        explanation: "Project 1: (3 + 2 + 2) / 3 = 2.33. Project 2: (3 + 5) / 2 = 4.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE staff_members (member_id integer PRIMARY KEY, name text NOT NULL, years_experience integer);
CREATE TABLE project_staff (project_id integer NOT NULL, member_id integer NOT NULL, PRIMARY KEY (project_id, member_id));
INSERT INTO staff_members VALUES (1, 'Ada', 3), (2, 'Bo', 2), (3, 'Cy', 2), (4, 'Di', 5);
INSERT INTO project_staff VALUES (1, 1), (1, 2), (1, 3), (2, 1), (2, 4);`, ["project_id", "average_years"], [[1, 2.33], [2, 4]]),
      t("unknown experience is ignored", `CREATE TABLE staff_members (member_id integer PRIMARY KEY, name text NOT NULL, years_experience integer);
CREATE TABLE project_staff (project_id integer NOT NULL, member_id integer NOT NULL, PRIMARY KEY (project_id, member_id));
INSERT INTO staff_members VALUES (1, 'Eve', 10), (2, 'Fox', NULL), (3, 'Gus', 4);
INSERT INTO project_staff VALUES (7, 1), (7, 2), (7, 3);`, ["project_id", "average_years"], [[7, 7]]),
      t("nobody on the project has a known value", `CREATE TABLE staff_members (member_id integer PRIMARY KEY, name text NOT NULL, years_experience integer);
CREATE TABLE project_staff (project_id integer NOT NULL, member_id integer NOT NULL, PRIMARY KEY (project_id, member_id));
INSERT INTO staff_members VALUES (1, 'Hal', NULL), (2, 'Ivy', NULL), (3, 'Jem', 6);
INSERT INTO project_staff VALUES (1, 1), (1, 2), (2, 3);`, ["project_id", "average_years"], [[1, null], [2, 6]]),
      t("rounding and a person on two projects", `CREATE TABLE staff_members (member_id integer PRIMARY KEY, name text NOT NULL, years_experience integer);
CREATE TABLE project_staff (project_id integer NOT NULL, member_id integer NOT NULL, PRIMARY KEY (project_id, member_id));
INSERT INTO staff_members VALUES (1, 'Kai', 1), (2, 'Lia', 1), (3, 'Moe', 0);
INSERT INTO project_staff VALUES (1, 1), (1, 2), (1, 3), (2, 3), (2, 1);`, ["project_id", "average_years"], [[1, 0.67], [2, 0.5]]),
      t("no assignments", `CREATE TABLE staff_members (member_id integer PRIMARY KEY, name text NOT NULL, years_experience integer);
CREATE TABLE project_staff (project_id integer NOT NULL, member_id integer NOT NULL, PRIMARY KEY (project_id, member_id));
INSERT INTO staff_members VALUES (1, 'Nia', 4);`, ["project_id", "average_years"], []),
    ],
    solution: `SELECT ps.project_id,
       ROUND(AVG(m.years_experience), 2) AS average_years
FROM project_staff AS ps
JOIN staff_members AS m ON m.member_id = ps.member_id
GROUP BY ps.project_id`,
    approaches: [
      {
        id: "avg-join",
        title: "JOIN, GROUP BY project, AVG",
        optimal: true,
        explanation: "Join each assignment to the person's experience, group by project and use \`AVG\`. \`AVG\` skips NULLs on its own, and returns NULL when every value is NULL, which is exactly the rule in the statement. In Postgres the average of integers is an exact decimal, so \`ROUND(..., 2)\` works.",
        code: `SELECT ps.project_id,
       ROUND(AVG(m.years_experience), 2) AS average_years
FROM project_staff AS ps
JOIN staff_members AS m ON m.member_id = ps.member_id
GROUP BY ps.project_id`,
      },
      {
        id: "sum-over-count",
        title: "SUM divided by COUNT of known values",
        optimal: false,
        explanation: "Work out the average by hand: \`SUM(years)\` divided by \`COUNT(years)\`. Counting the column (not \`*\`) skips NULLs, and \`NULLIF\` avoids dividing by zero. Cast to \`numeric\` first, because two integers divide as integers in Postgres. It returns the same result but repeats what \`AVG\` already does.",
        code: `SELECT ps.project_id,
       ROUND(SUM(m.years_experience)::numeric / NULLIF(COUNT(m.years_experience), 0), 2) AS average_years
FROM project_staff AS ps
JOIN staff_members AS m ON m.member_id = ps.member_id
GROUP BY ps.project_id`,
      },
    ],
    hints: [
      "Which table gives the experience, and which gives the project? How do you connect them?",
      "What does AVG do with NULL values?",
    ],
    clarify: [
      {question: "What if some people have unknown experience?", answer: "They are left out of the average."},
      {question: "Which decimal places does the result use?", answer: "Two."},
    ],
    followUps: ["How would you find the projects whose average experience is above the overall average?"],
    mysqlNote: "In MySQL, \`/\` between integers returns a decimal, so \`SUM(x) / COUNT(x)\` works directly. In Postgres, it is integer division unless one side is \`numeric\`. \`AVG\` behaves the same in both.",
  },
  {
    kind: "sql",
    lc: 1633,
    topic: "sql-basic-aggregate",
    title: "Percentage of Users Attended a Contest",
    difficulty: "Easy",
    statement: `\`app_users\` lists every user of an app, and \`contest_signups\` has one row each time a user registers for a contest. A user's name can be \`NULL\`; that user still counts as a user.

For each contest, work out the **percentage of all users** who registered for it.

- Round to **2 decimal places**.
- Contests that nobody registered for do not appear.
- Return \`contest_id\` and \`percentage\`, sorted by \`percentage\` from high to low, and by \`contest_id\` from low to high when percentages are equal.`,
    tables: [
      {name: "app_users", columns: [{name: "user_id", type: "integer", pk: true}, {name: "user_name", type: "text", note: "NULL allowed."}]},
      {name: "contest_signups", columns: [{name: "contest_id", type: "integer", pk: true}, {name: "user_id", type: "integer", pk: true}]},
    ],
    examples: [
      {
        tables: [
          {name: "app_users", columns: ["user_id", "user_name"], rows: [[1, "Ann"], [2, "Ben"], [3, "Cat"], [4, "Dan"]]},
          {name: "contest_signups", columns: ["contest_id", "user_id"], rows: [[10, 1], [10, 2], [20, 1], [20, 2], [20, 3], [20, 4], [30, 3]]},
        ],
        result: {columns: ["contest_id", "percentage"], rows: [[20, 100], [10, 50], [30, 25]]},
        explanation: "There are 4 users. Contest 20 has 4 sign-ups (100%), contest 10 has 2 (50%) and contest 30 has 1 (25%).",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE app_users (user_id integer PRIMARY KEY, user_name text);
CREATE TABLE contest_signups (contest_id integer NOT NULL, user_id integer NOT NULL, PRIMARY KEY (contest_id, user_id));
INSERT INTO app_users VALUES (1, 'Ann'), (2, 'Ben'), (3, NULL), (4, 'Dan'), (5, 'Eli'), (6, 'Fay');
INSERT INTO contest_signups VALUES (10, 1), (10, 2), (10, 3), (20, 1), (20, 2), (20, 3), (20, 4), (20, 5), (20, 6), (30, 1), (40, 2), (40, 4), (15, 1), (15, 5);`,
        ["contest_id", "percentage"], [[20, 100], [10, 50], [15, 33.33], [40, 33.33], [30, 16.67]], true),
      t("users with no name still count", `CREATE TABLE app_users (user_id integer PRIMARY KEY, user_name text);
CREATE TABLE contest_signups (contest_id integer NOT NULL, user_id integer NOT NULL, PRIMARY KEY (contest_id, user_id));
INSERT INTO app_users VALUES (1, NULL), (2, NULL), (3, NULL), (4, 'Gus');
INSERT INTO contest_signups VALUES (1, 1), (1, 4);`, ["contest_id", "percentage"], [[1, 50]], true),
      t("equal percentages sort by contest id", `CREATE TABLE app_users (user_id integer PRIMARY KEY, user_name text);
CREATE TABLE contest_signups (contest_id integer NOT NULL, user_id integer NOT NULL, PRIMARY KEY (contest_id, user_id));
INSERT INTO app_users VALUES (1, 'A'), (2, 'B');
INSERT INTO contest_signups VALUES (9, 1), (3, 2), (7, 1), (5, 2);`, ["contest_id", "percentage"], [[3, 50], [5, 50], [7, 50], [9, 50]], true),
      t("rounding two thirds", `CREATE TABLE app_users (user_id integer PRIMARY KEY, user_name text);
CREATE TABLE contest_signups (contest_id integer NOT NULL, user_id integer NOT NULL, PRIMARY KEY (contest_id, user_id));
INSERT INTO app_users VALUES (1, 'A'), (2, 'B'), (3, 'C');
INSERT INTO contest_signups VALUES (1, 1), (1, 2);`, ["contest_id", "percentage"], [[1, 66.67]], true),
      t("nobody signed up", `CREATE TABLE app_users (user_id integer PRIMARY KEY, user_name text);
CREATE TABLE contest_signups (contest_id integer NOT NULL, user_id integer NOT NULL, PRIMARY KEY (contest_id, user_id));
INSERT INTO app_users VALUES (1, 'A'), (2, 'B');`, ["contest_id", "percentage"], [], true),
      t("worked example", `CREATE TABLE app_users (user_id integer PRIMARY KEY, user_name text);
CREATE TABLE contest_signups (contest_id integer NOT NULL, user_id integer NOT NULL, PRIMARY KEY (contest_id, user_id));
INSERT INTO app_users VALUES (1, 'Ann'), (2, 'Ben'), (3, 'Cat'), (4, 'Dan');
INSERT INTO contest_signups VALUES (10, 1), (10, 2), (20, 1), (20, 2), (20, 3), (20, 4), (30, 3);`, ["contest_id", "percentage"], [[20, 100], [10, 50], [30, 25]], true),
    ],
    solution: `SELECT contest_id,
       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM app_users), 2) AS percentage
FROM contest_signups
GROUP BY contest_id
ORDER BY percentage DESC, contest_id ASC`,
    approaches: [
      {
        id: "scalar-subquery",
        title: "Count sign-ups per contest, divide by a scalar subquery",
        optimal: true,
        explanation: "Group the sign-ups by contest and count them. The total number of users comes from a small subquery that runs once. \`COUNT(*)\` is used for the total, not \`COUNT(user_name)\`, so users with a NULL name are still counted. Multiplying by \`100.0\` (a decimal) avoids integer division. The two-key \`ORDER BY\` gives a repeatable order for ties.",
        code: `SELECT contest_id,
       ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM app_users), 2) AS percentage
FROM contest_signups
GROUP BY contest_id
ORDER BY percentage DESC, contest_id ASC`,
      },
      {
        id: "cross-join-total",
        title: "CROSS JOIN a one-row totals CTE",
        optimal: false,
        explanation: "Put the user total in a one-row CTE and cross join it to the sign-ups, so the total is available as a column. The result is the same. It is a bit longer and you must add the total to \`GROUP BY\`, but it is a handy pattern when you need the total in several places.",
        code: `WITH total AS (SELECT COUNT(*) AS n FROM app_users)
SELECT s.contest_id,
       ROUND(100.0 * COUNT(*) / t.n, 2) AS percentage
FROM contest_signups AS s
CROSS JOIN total AS t
GROUP BY s.contest_id, t.n
ORDER BY percentage DESC, s.contest_id ASC`,
      },
    ],
    hints: [
      "How many users are there in total? You need that number for every contest.",
      "Dividing two integers drops the decimals. How can you avoid that?",
      "Two contests can have the same percentage. How do you order those?",
    ],
    clarify: [
      {question: "Should users with no name be counted?", answer: "Yes. They are users like any other."},
      {question: "Should contests with no sign-ups be listed?", answer: "No."},
    ],
    followUps: ["How would you also list contests with 0 sign-ups, assuming there is a table of contests?"],
    mysqlNote: "In MySQL, \`/\` already returns a decimal, so \`COUNT(*) * 100 / total\` works without \`100.0\`. In Postgres, \`COUNT(*) * 100 / total\` divides integers and truncates, so keep the \`100.0\`.",
  },
  {
    kind: "sql",
    lc: 1211,
    topic: "sql-basic-aggregate",
    title: "Queries Quality and Percentage",
    difficulty: "Easy",
    statement: `A search engine logs, for each search query, the results it showed in \`search_log\`. \`place\` is the position of the result on the page (1 is the top) and \`rating\` is the score the user gave it, from 1 to 5. The \`result\` text can be \`NULL\`.

For each \`query_name\`, work out:

- **quality**: the average of \`rating / place\` over its rows;
- **poor_query_percentage**: the percentage of its rows with a rating **below 3**.

Round both to **2 decimal places**. Return \`query_name\`, \`quality\`, \`poor_query_percentage\`. The rows can come back in any order.`,
    tables: [
      {name: "search_log", note: "One row per result shown; no primary key.", columns: [{name: "query_name", type: "text"}, {name: "result", type: "text", note: "May be NULL."}, {name: "place", type: "integer", note: "1 is the top of the page."}, {name: "rating", type: "integer", note: "1 to 5."}]},
    ],
    examples: [
      {
        tables: [
          {name: "search_log", columns: ["query_name", "result", "place", "rating"], rows: [["tea", "Leaf House", 1, 5], ["tea", "Kettle Co", 2, 4], ["solar panels", "Sunbright Ltd", 1, 5], ["solar panels", "Greenroof Co", 2, 3], ["solar panels", "Old Page", 200, 1]]},
        ],
        result: {columns: ["query_name", "quality", "poor_query_percentage"], rows: [["tea", 3.5, 0], ["solar panels", 2.17, 33.33]]},
        explanation: "tea: (5/1 + 4/2) / 2 = 3.50 and no rating is below 3. solar panels: (5 + 1.5 + 0.005) / 3 = 2.17, and one of three ratings (the 1) is poor, so 33.33%.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE search_log (query_name text NOT NULL, result text, place integer NOT NULL, rating integer NOT NULL);
INSERT INTO search_log VALUES ('solar panels', 'Sunbright Ltd', 1, 5), ('solar panels', 'Greenroof Co', 2, 3), ('solar panels', 'Old Page', 200, 1),
 ('bike repair', 'Quick Spokes', 1, 2), ('bike repair', 'Chain Gang', 5, 4), ('bike repair', NULL, 4, 3),
 ('tea', 'Leaf House', 1, 5), ('tea', 'Kettle Co', 2, 4);`, ["query_name", "quality", "poor_query_percentage"], [["solar panels", 2.17, 33.33], ["bike repair", 1.18, 33.33], ["tea", 3.5, 0]]),
      t("rating 3 is not poor, rating 2 is", `CREATE TABLE search_log (query_name text NOT NULL, result text, place integer NOT NULL, rating integer NOT NULL);
INSERT INTO search_log VALUES ('x', NULL, 1, 3), ('y', NULL, 1, 2);`, ["query_name", "quality", "poor_query_percentage"], [["x", 3, 0], ["y", 2, 100]]),
      t("repeated identical rows", `CREATE TABLE search_log (query_name text NOT NULL, result text, place integer NOT NULL, rating integer NOT NULL);
INSERT INTO search_log VALUES ('dup', 'Same', 4, 2), ('dup', 'Same', 4, 2), ('dup', 'Same', 4, 2), ('dup', 'Other', 1, 5);`, ["query_name", "quality", "poor_query_percentage"], [["dup", 1.63, 75]]),
      t("every result is poor", `CREATE TABLE search_log (query_name text NOT NULL, result text, place integer NOT NULL, rating integer NOT NULL);
INSERT INTO search_log VALUES ('bad', 'A', 1, 1), ('bad', 'B', 2, 2), ('bad', 'C', 3, 1);`, ["query_name", "quality", "poor_query_percentage"], [["bad", 0.78, 100]]),
      t("empty log", `CREATE TABLE search_log (query_name text NOT NULL, result text, place integer NOT NULL, rating integer NOT NULL);`, ["query_name", "quality", "poor_query_percentage"], []),
      t("worked example", `CREATE TABLE search_log (query_name text NOT NULL, result text, place integer NOT NULL, rating integer NOT NULL);
INSERT INTO search_log VALUES ('tea', 'Leaf House', 1, 5), ('tea', 'Kettle Co', 2, 4), ('solar panels', 'Sunbright Ltd', 1, 5), ('solar panels', 'Greenroof Co', 2, 3), ('solar panels', 'Old Page', 200, 1);`, ["query_name", "quality", "poor_query_percentage"], [["tea", 3.5, 0], ["solar panels", 2.17, 33.33]]),
    ],
    solution: `SELECT query_name,
       ROUND(AVG(rating::numeric / place), 2) AS quality,
       ROUND(100 * AVG((rating < 3)::int), 2) AS poor_query_percentage
FROM search_log
GROUP BY query_name`,
    approaches: [
      {
        id: "average-of-flags",
        title: "AVG of the ratio, AVG of a 0/1 poor flag",
        optimal: true,
        explanation: "One pass with \`GROUP BY query_name\` gives both numbers. \`rating::numeric / place\` avoids integer division, which would turn 4/5 into 0. The share of poor rows is the average of a flag that is 1 when \`rating < 3\` and 0 otherwise, times 100. Because neither \`rating\` nor \`place\` can be NULL, no row is skipped by accident.",
        code: `SELECT query_name,
       ROUND(AVG(rating::numeric / place), 2) AS quality,
       ROUND(100 * AVG((rating < 3)::int), 2) AS poor_query_percentage
FROM search_log
GROUP BY query_name`,
      },
      {
        id: "filter-count",
        title: "Count poor rows with FILTER and divide by all rows",
        optimal: false,
        explanation: "Write the percentage the way you would say it: the number of poor rows (\`COUNT(*) FILTER (WHERE rating < 3)\`) divided by all rows, times \`100.0\`. It gives the same answer and is easy to read, but it is longer than averaging a flag.",
        code: `SELECT query_name,
       ROUND(AVG(rating::numeric / place), 2) AS quality,
       ROUND(100.0 * COUNT(*) FILTER (WHERE rating < 3) / COUNT(*), 2) AS poor_query_percentage
FROM search_log
GROUP BY query_name`,
      },
    ],
    hints: [
      "Which clause gives one row per query name?",
      "What is 4 / 5 when both numbers are integers? How do you get 0.8?",
      "A percentage of rows meeting a condition is the average of a 1/0 flag, times 100.",
    ],
    clarify: [
      {question: "Is a rating of 3 poor?", answer: "No. Only ratings below 3 are poor."},
      {question: "What does position mean?", answer: "It is the column place: 1 is the top result, larger numbers are lower on the page."},
    ],
    followUps: ["How would you list only the queries whose quality is below the average quality of all queries?"],
    mysqlNote: "In MySQL, \`rating / place\` already gives a decimal, and a comparison like \`rating < 3\` is 1 or 0, so \`AVG(rating < 3)\` works without a cast. In Postgres, you must cast one side to \`numeric\` and the boolean to \`int\`.",
  },
  {
    kind: "sql",
    lc: 1193,
    topic: "sql-basic-aggregate",
    title: "Monthly Transactions I",
    difficulty: "Medium",
    statement: `\`payments\` has one row per payment attempt, with a \`status\` of \`'approved'\` or \`'declined'\`. The \`country\` is \`NULL\` when it is unknown.

For each **month and country**, report:

- \`month\`: the year and month as text like \`2024-03\`;
- \`country\`;
- \`trans_count\`: how many payments;
- \`approved_count\`: how many approved;
- \`trans_total_amount\`: the sum of all amounts;
- \`approved_total_amount\`: the sum of the approved amounts, which is 0 if none were approved.

Payments with an unknown country form their own group (shown with a \`NULL\` country). The rows can come back in any order.`,
    tables: [
      {name: "payments", columns: [{name: "payment_id", type: "integer", pk: true}, {name: "country", type: "text", note: "NULL if unknown."}, {name: "status", type: "text", note: "'approved' or 'declined'."}, {name: "amount", type: "integer"}, {name: "paid_on", type: "date"}]},
    ],
    examples: [
      {
        tables: [
          {name: "payments", columns: ["payment_id", "country", "status", "amount", "paid_on"], rows: [[1, "UK", "approved", 100, "2024-03-05"], [2, "UK", "declined", 50, "2024-03-09"], [3, "UK", "approved", 70, "2024-04-01"], [4, "FR", "approved", 30, "2024-03-20"], [5, "FR", "declined", 20, "2024-03-21"], [6, "FR", "declined", 25, "2024-03-22"]]},
        ],
        result: {columns: ["month", "country", "trans_count", "approved_count", "trans_total_amount", "approved_total_amount"], rows: [["2024-03", "UK", 2, 1, 150, 100], ["2024-04", "UK", 1, 1, 70, 70], ["2024-03", "FR", 3, 1, 75, 30]]},
        explanation: "Each month and country pair is one row. In March, France had three payments, one approved for 30.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE payments (payment_id integer PRIMARY KEY, country text, status text NOT NULL, amount integer NOT NULL, paid_on date NOT NULL);
INSERT INTO payments VALUES (1, 'UK', 'approved', 100, '2024-03-05'), (2, 'UK', 'declined', 50, '2024-03-09'), (3, 'UK', 'approved', 70, '2024-04-01'), (4, 'FR', 'approved', 30, '2024-03-20'), (5, 'FR', 'declined', 20, '2024-03-21'), (6, 'FR', 'declined', 25, '2024-03-22');`,
        ["month", "country", "trans_count", "approved_count", "trans_total_amount", "approved_total_amount"], [["2024-03", "UK", 2, 1, 150, 100], ["2024-04", "UK", 1, 1, 70, 70], ["2024-03", "FR", 3, 1, 75, 30]]),
      t("unknown country is its own group", `CREATE TABLE payments (payment_id integer PRIMARY KEY, country text, status text NOT NULL, amount integer NOT NULL, paid_on date NOT NULL);
INSERT INTO payments VALUES (1, NULL, 'approved', 10, '2024-01-01'), (2, NULL, 'declined', 5, '2024-01-02'), (3, 'DE', 'approved', 8, '2024-01-03');`,
        ["month", "country", "trans_count", "approved_count", "trans_total_amount", "approved_total_amount"], [["2024-01", null, 2, 1, 15, 10], ["2024-01", "DE", 1, 1, 8, 8]]),
      t("nothing approved gives 0, not NULL", `CREATE TABLE payments (payment_id integer PRIMARY KEY, country text, status text NOT NULL, amount integer NOT NULL, paid_on date NOT NULL);
INSERT INTO payments VALUES (1, 'ES', 'declined', 40, '2024-05-01'), (2, 'ES', 'declined', 60, '2024-05-31');`,
        ["month", "country", "trans_count", "approved_count", "trans_total_amount", "approved_total_amount"], [["2024-05", "ES", 2, 0, 100, 0]]),
      t("same month in different years", `CREATE TABLE payments (payment_id integer PRIMARY KEY, country text, status text NOT NULL, amount integer NOT NULL, paid_on date NOT NULL);
INSERT INTO payments VALUES (1, 'IT', 'approved', 10, '2023-03-15'), (2, 'IT', 'approved', 20, '2024-03-15'), (3, 'IT', 'declined', 5, '2024-03-31');`,
        ["month", "country", "trans_count", "approved_count", "trans_total_amount", "approved_total_amount"], [["2023-03", "IT", 1, 1, 10, 10], ["2024-03", "IT", 2, 1, 25, 20]]),
      t("no payments", `CREATE TABLE payments (payment_id integer PRIMARY KEY, country text, status text NOT NULL, amount integer NOT NULL, paid_on date NOT NULL);`,
        ["month", "country", "trans_count", "approved_count", "trans_total_amount", "approved_total_amount"], []),
    ],
    solution: `SELECT TO_CHAR(paid_on, 'YYYY-MM') AS month,
       country,
       COUNT(*) AS trans_count,
       COUNT(*) FILTER (WHERE status = 'approved') AS approved_count,
       SUM(amount) AS trans_total_amount,
       COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0) AS approved_total_amount
FROM payments
GROUP BY TO_CHAR(paid_on, 'YYYY-MM'), country`,
    approaches: [
      {
        id: "filter",
        title: "GROUP BY month and country with FILTER",
        optimal: true,
        explanation: "\`TO_CHAR(paid_on, 'YYYY-MM')\` makes the text month (with the year, so March 2023 and March 2024 stay apart). \`GROUP BY\` month and country makes one row per pair, and NULL countries group together. \`FILTER\` limits the approved counts and sums to approved rows; a sum over no rows is NULL, so \`COALESCE\` turns it into 0. \`COUNT(*)\` is used rather than \`COUNT(country)\`, which would skip unknown countries.",
        code: `SELECT TO_CHAR(paid_on, 'YYYY-MM') AS month,
       country,
       COUNT(*) AS trans_count,
       COUNT(*) FILTER (WHERE status = 'approved') AS approved_count,
       SUM(amount) AS trans_total_amount,
       COALESCE(SUM(amount) FILTER (WHERE status = 'approved'), 0) AS approved_total_amount
FROM payments
GROUP BY TO_CHAR(paid_on, 'YYYY-MM'), country`,
      },
      {
        id: "case",
        title: "SUM(CASE WHEN ...) instead of FILTER",
        optimal: false,
        explanation: "Add up a 1 or 0 (for counts) or the amount or 0 (for sums) using \`CASE\`. A \`CASE\` that returns 0 for other rows means the sum is never NULL, so no \`COALESCE\` is needed. It works in every SQL dialect, but it is wordier than \`FILTER\`, which Postgres supports directly.",
        code: `SELECT TO_CHAR(paid_on, 'YYYY-MM') AS month,
       country,
       COUNT(*) AS trans_count,
       SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_count,
       SUM(amount) AS trans_total_amount,
       SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) AS approved_total_amount
FROM payments
GROUP BY TO_CHAR(paid_on, 'YYYY-MM'), country`,
      },
    ],
    hints: [
      "How do you turn a date into the text 2024-03? Make sure the year is included.",
      "How do you count or sum only the approved rows in a group?",
      "A sum over no rows is NULL. How do you make it 0?",
    ],
    clarify: [
      {question: "Is a month with no payments in a country listed?", answer: "No. Only month and country pairs that have payments."},
      {question: "How are payments with a NULL country grouped?", answer: "Together, as one group with a NULL country."},
    ],
    followUps: ["How would you add a column with the approval rate (approved_count divided by trans_count) for each row?"],
    mysqlNote: "MySQL has no \`TO_CHAR\` or \`FILTER\`. Use \`DATE_FORMAT(paid_on, '%Y-%m')\` and \`SUM(status = 'approved')\` or \`SUM(CASE WHEN ...)\`. \`COALESCE\` and \`IFNULL\` both work in MySQL.",
  },
  {
    kind: "sql",
    lc: 1174,
    topic: "sql-basic-aggregate",
    title: "Immediate Food Delivery II",
    difficulty: "Medium",
    statement: `\`parcels\` records each order a customer places, with the date it was ordered and the date the customer wanted it delivered (\`wanted_date\`, which can be \`NULL\` if no date was chosen). An order is **immediate** when \`order_date\` equals \`wanted_date\`. A customer never places two orders on the same date.

Look only at each customer's **first order** (the one with the earliest \`order_date\`). Report the **percentage of those first orders that are immediate**.

- Round to **2 decimal places**.
- A first order with no wanted date is not immediate, but it still counts in the total.
- If there are no orders at all, the result is \`NULL\`.
- Return one column named \`immediate_percentage\` and one row.`,
    tables: [
      {name: "parcels", columns: [{name: "parcel_id", type: "integer", pk: true}, {name: "customer_id", type: "integer"}, {name: "order_date", type: "date"}, {name: "wanted_date", type: "date", note: "NULL if no date was chosen."}]},
    ],
    examples: [
      {
        tables: [
          {name: "parcels", columns: ["parcel_id", "customer_id", "order_date", "wanted_date"], rows: [[1, 1, "2024-03-01", "2024-03-01"], [2, 1, "2024-03-10", "2024-03-12"], [3, 2, "2024-03-04", "2024-03-04"], [4, 2, "2024-03-02", "2024-03-05"]]},
        ],
        result: {columns: ["immediate_percentage"], rows: [[50]]},
        explanation: "Customer 1's first order (1 March) is immediate. Customer 2's first order (2 March) is not, even though their later order is. One of two first orders is immediate: 50%.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE parcels (parcel_id integer PRIMARY KEY, customer_id integer NOT NULL, order_date date NOT NULL, wanted_date date);
INSERT INTO parcels VALUES (1, 1, '2024-03-01', '2024-03-01'), (2, 1, '2024-03-10', '2024-03-12'),
 (3, 2, '2024-03-04', '2024-03-04'), (4, 2, '2024-03-02', '2024-03-05'),
 (5, 3, '2024-03-03', '2024-03-03'),
 (6, 4, '2024-03-05', NULL),
 (7, 5, '2024-03-07', '2024-03-07'),
 (8, 6, '2024-04-01', '2024-04-03'),
 (9, 7, '2024-04-02', '2024-04-04');`, ["immediate_percentage"], [[42.86]]),
      t("no first order is immediate", `CREATE TABLE parcels (parcel_id integer PRIMARY KEY, customer_id integer NOT NULL, order_date date NOT NULL, wanted_date date);
INSERT INTO parcels VALUES (1, 1, '2024-01-01', '2024-01-02'), (2, 1, '2024-01-05', '2024-01-05'), (3, 2, '2024-01-03', NULL);`, ["immediate_percentage"], [[0]]),
      t("every first order is immediate", `CREATE TABLE parcels (parcel_id integer PRIMARY KEY, customer_id integer NOT NULL, order_date date NOT NULL, wanted_date date);
INSERT INTO parcels VALUES (1, 1, '2024-02-01', '2024-02-01'), (2, 2, '2024-02-02', '2024-02-02'), (3, 2, '2024-02-09', '2024-02-20');`, ["immediate_percentage"], [[100]]),
      t("unknown wanted date still counts in the total", `CREATE TABLE parcels (parcel_id integer PRIMARY KEY, customer_id integer NOT NULL, order_date date NOT NULL, wanted_date date);
INSERT INTO parcels VALUES (1, 1, '2024-05-01', '2024-05-01'), (2, 2, '2024-05-01', NULL), (3, 3, '2024-05-01', NULL);`, ["immediate_percentage"], [[33.33]]),
      t("no orders at all", `CREATE TABLE parcels (parcel_id integer PRIMARY KEY, customer_id integer NOT NULL, order_date date NOT NULL, wanted_date date);`, ["immediate_percentage"], [[null]]),
      t("worked example", `CREATE TABLE parcels (parcel_id integer PRIMARY KEY, customer_id integer NOT NULL, order_date date NOT NULL, wanted_date date);
INSERT INTO parcels VALUES (1, 1, '2024-03-01', '2024-03-01'), (2, 1, '2024-03-10', '2024-03-12'), (3, 2, '2024-03-04', '2024-03-04'), (4, 2, '2024-03-02', '2024-03-05');`, ["immediate_percentage"], [[50]]),
    ],
    solution: `SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE order_date = wanted_date) / NULLIF(COUNT(*), 0), 2) AS immediate_percentage
FROM parcels
WHERE (customer_id, order_date) IN (
  SELECT customer_id, MIN(order_date)
  FROM parcels
  GROUP BY customer_id
)`,
    approaches: [
      {
        id: "min-date-subquery",
        title: "Keep rows matching each customer's earliest date",
        optimal: true,
        explanation: "The subquery finds each customer's earliest order date. The outer \`WHERE\` keeps only the orders that match that pair, so exactly one row per customer remains. \`COUNT(*) FILTER (WHERE order_date = wanted_date)\` counts the immediate ones, and \`COUNT(*)\` is the total, so an order with a NULL wanted date is in the total but not in the count. \`NULLIF\` turns an empty table into NULL instead of a division error. The same idea works in MySQL.",
        code: `SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE order_date = wanted_date) / NULLIF(COUNT(*), 0), 2) AS immediate_percentage
FROM parcels
WHERE (customer_id, order_date) IN (
  SELECT customer_id, MIN(order_date)
  FROM parcels
  GROUP BY customer_id
)`,
      },
      {
        id: "distinct-on",
        title: "DISTINCT ON picks the first row per customer",
        optimal: false,
        explanation: "\`DISTINCT ON (customer_id)\` with \`ORDER BY customer_id, order_date\` keeps the first row of each customer in one sort. It is short and fast, but it is a Postgres-only feature, so the same query will not run in MySQL or in most interviews that use another database.",
        code: `SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE order_date = wanted_date) / NULLIF(COUNT(*), 0), 2) AS immediate_percentage
FROM (
  SELECT DISTINCT ON (customer_id) customer_id, order_date, wanted_date
  FROM parcels
  ORDER BY customer_id, order_date
) AS first_orders`,
      },
      {
        id: "row-number",
        title: "ROW_NUMBER numbers each customer's orders",
        optimal: false,
        explanation: "Number each customer's orders by date with \`ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date)\` and keep number 1. It works in every modern database and is flexible (the first N orders, for example), but it is more code than the subquery when you only need the first one.",
        code: `SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE order_date = wanted_date) / NULLIF(COUNT(*), 0), 2) AS immediate_percentage
FROM (
  SELECT order_date, wanted_date,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS n
  FROM parcels
) AS numbered
WHERE n = 1`,
      },
    ],
    hints: [
      "How do you find the earliest order date for each customer?",
      "How do you count the immediate orders and all orders in one query?",
      "What happens if you divide by a count of zero?",
    ],
    clarify: [
      {question: "Which orders are used?", answer: "Only each customer's first order, the one with the earliest order_date."},
      {question: "Does an order with no wanted date count in the total?", answer: "Yes. It counts in the total but is not immediate."},
    ],
    followUps: ["How would you report the percentage separately for each month of the first order?"],
    mysqlNote: "MySQL has no \`FILTER\`: use \`SUM(order_date = wanted_date)\` (a comparison with NULL gives NULL, which \`SUM\` skips). Division by zero returns NULL in MySQL by default, so no \`NULLIF\` is needed there. \`DISTINCT ON\` is Postgres only.",
  },
  {
    kind: "sql",
    lc: 550,
    topic: "sql-basic-aggregate",
    title: "Game Play Analysis IV",
    difficulty: "Medium",
    statement: `\`play_sessions\` has one row for each day a player logged in. A player has at most one row per day, and \`games_played\` can be \`NULL\`; the day still counts as a login.

Report the **fraction of players who logged in again on the day right after their first login**.

- Only the day directly after the first login counts. Logging in on a later day, or on the day after some other login, does not.
- Round to **2 decimal places**.
- If there are no players at all, return \`NULL\`.
- Return one column named \`fraction\` and one row.`,
    tables: [
      {name: "play_sessions", columns: [{name: "player_id", type: "integer", pk: true}, {name: "device_id", type: "integer"}, {name: "play_date", type: "date", pk: true}, {name: "games_played", type: "integer", note: "NULL allowed."}]},
    ],
    examples: [
      {
        tables: [
          {name: "play_sessions", columns: ["player_id", "device_id", "play_date", "games_played"], rows: [[1, 10, "2024-03-01", 5], [1, 10, "2024-03-02", 3], [2, 11, "2024-03-01", 2], [2, 11, "2024-03-05", 4], [2, 11, "2024-03-06", 1], [3, 12, "2024-03-03", null]]},
        ],
        result: {columns: ["fraction"], rows: [[0.33]]},
        explanation: "Player 1 came back the next day. Player 2 logged in on the 5th and 6th, but those are not the day after the first login (the 1st). Player 3 only logged in once. One of three players: 0.33.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE play_sessions (player_id integer NOT NULL, device_id integer NOT NULL, play_date date NOT NULL, games_played integer, PRIMARY KEY (player_id, play_date));
INSERT INTO play_sessions VALUES (1, 10, '2024-03-01', 5), (1, 10, '2024-03-02', 3), (2, 11, '2024-03-01', 2), (2, 11, '2024-03-05', 4), (2, 11, '2024-03-06', 1), (3, 12, '2024-03-03', NULL);`, ["fraction"], [[0.33]]),
      t("most players return, across a month end", `CREATE TABLE play_sessions (player_id integer NOT NULL, device_id integer NOT NULL, play_date date NOT NULL, games_played integer, PRIMARY KEY (player_id, play_date));
INSERT INTO play_sessions VALUES (1, 1, '2024-01-31', NULL), (1, 1, '2024-02-01', NULL), (2, 2, '2024-02-28', 1), (2, 3, '2024-02-29', 1), (3, 4, '2024-04-01', 2), (4, 5, '2024-04-02', 2), (4, 5, '2024-04-03', 2);`, ["fraction"], [[0.75]]),
      t("nobody returns the next day", `CREATE TABLE play_sessions (player_id integer NOT NULL, device_id integer NOT NULL, play_date date NOT NULL, games_played integer, PRIMARY KEY (player_id, play_date));
INSERT INTO play_sessions VALUES (1, 1, '2024-05-01', 1), (1, 1, '2024-05-03', 1), (2, 2, '2024-05-02', 1);`, ["fraction"], [[0]]),
      t("everyone returns, input out of date order", `CREATE TABLE play_sessions (player_id integer NOT NULL, device_id integer NOT NULL, play_date date NOT NULL, games_played integer, PRIMARY KEY (player_id, play_date));
INSERT INTO play_sessions VALUES (1, 1, '2024-06-02', 1), (1, 1, '2024-06-01', 1), (2, 2, '2024-06-11', 1), (2, 2, '2024-06-10', 1);`, ["fraction"], [[1]]),
      t("no players", `CREATE TABLE play_sessions (player_id integer NOT NULL, device_id integer NOT NULL, play_date date NOT NULL, games_played integer, PRIMARY KEY (player_id, play_date));`, ["fraction"], [[null]]),
    ],
    solution: `WITH first_login AS (
  SELECT player_id, MIN(play_date) AS first_date
  FROM play_sessions
  GROUP BY player_id
)
SELECT ROUND(COUNT(s.player_id)::numeric / NULLIF(COUNT(f.player_id), 0), 2) AS fraction
FROM first_login AS f
LEFT JOIN play_sessions AS s
  ON s.player_id = f.player_id
 AND s.play_date = f.first_date + 1`,
    approaches: [
      {
        id: "first-login-join",
        title: "First login per player, then look for the next day",
        optimal: true,
        explanation: "A CTE finds each player's first login date. A \`LEFT JOIN\` then looks for a session on exactly \`first_date + 1\`. Each player has at most one session per day, so the join adds at most one row per player. \`COUNT(s.player_id)\` counts the players who came back, \`COUNT(f.player_id)\` counts all players, and \`NULLIF\` returns NULL for an empty table.",
        code: `WITH first_login AS (
  SELECT player_id, MIN(play_date) AS first_date
  FROM play_sessions
  GROUP BY player_id
)
SELECT ROUND(COUNT(s.player_id)::numeric / NULLIF(COUNT(f.player_id), 0), 2) AS fraction
FROM first_login AS f
LEFT JOIN play_sessions AS s
  ON s.player_id = f.player_id
 AND s.play_date = f.first_date + 1`,
      },
      {
        id: "second-date-array",
        title: "Take the first and second login dates in one pass",
        optimal: false,
        explanation: "Collect each player's dates in order with \`ARRAY_AGG(play_date ORDER BY play_date)\`. The first element is the first login and the second is the next login. The player returned the next day if the second date is the first date plus 1. It needs only one pass over the table, but it relies on Postgres arrays, so it is less portable and harder for beginners to read.",
        code: `SELECT ROUND(COUNT(*) FILTER (WHERE second_date = first_date + 1)::numeric / NULLIF(COUNT(*), 0), 2) AS fraction
FROM (
  SELECT MIN(play_date) AS first_date,
         (ARRAY_AGG(play_date ORDER BY play_date))[2] AS second_date
  FROM play_sessions
  GROUP BY player_id
) AS p`,
      },
    ],
    hints: [
      "Start by finding each player's first login date.",
      "How do you test for a session exactly one day after that date?",
      "Divide the players who came back by all players. What if there are no players?",
    ],
    clarify: [
      {question: "Does a login the day after any login count?", answer: "No. Only the day after the first login."},
      {question: "Does a session with NULL games_played count as a login?", answer: "Yes."},
    ],
    followUps: ["How would you measure the same thing for returning on day 7 instead of day 1?"],
    mysqlNote: "In MySQL, add a day with \`DATE_ADD(f.first_date, INTERVAL 1 DAY)\` (or compare with \`DATEDIFF\`); \`date + 1\` is Postgres only. \`/\` returns a decimal and division by zero gives NULL, so no cast or \`NULLIF\` is needed. MySQL has no \`ARRAY_AGG\`, so use the join approach.",
  },
];
