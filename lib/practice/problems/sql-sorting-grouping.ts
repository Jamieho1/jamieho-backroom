/**
 * SQL problems: Sorting and Grouping (SQL 50 topic 4). Question numbers and titles follow LeetCode's public
 * SQL 50 plan; every statement, table, row, test, solution and explanation is our own words and our own data
 * (see ../sql-types.ts). Answers run on Postgres (PGlite) in the browser.
 * - 2356 Number of Unique Subjects Taught by Each Teacher (Easy)
 * - 1141 User Activity for the Past 30 Days I (Easy)
 * - 1070 Product Sales Analysis III (Medium)
 * - 596 Classes More Than 5 Students (Easy)
 * - 1729 Find Followers Count (Easy)
 * - 619 Biggest Single Number (Easy)
 * - 1045 Customers Who Bought All Products (Medium)
 */
import type {SqlCell, SqlProblemSeed} from "../sql-types";

const t = (name: string, setup: string, columns: string[], rows: SqlCell[][], ordered = false) => ({name, setup, expected: {columns, rows}, ordered});

export const sql: SqlProblemSeed[] = [
  {
    kind: "sql",
    lc: 2356,
    topic: "sql-sorting-grouping",
    title: "Number of Unique Subjects Taught by Each Teacher",
    difficulty: "Easy",
    statement: `A school keeps a teaching log. Each row says that a teacher taught a subject to one department. The same teacher can teach the same subject to several departments, so a subject can appear many times for one teacher.

For every teacher in the log, count how many **different subjects** they teach.

Return \`teacher_id\` and \`cnt\`. The rows can come back in any order.`,
    tables: [
      {name: "teaching_log", note: "One row per teacher, subject and department.", columns: [{name: "teacher_id", type: "integer"}, {name: "subject_id", type: "integer"}, {name: "dept_id", type: "integer", note: "NULL when the department is not known."}]},
    ],
    examples: [
      {
        tables: [{name: "teaching_log", columns: ["teacher_id", "subject_id", "dept_id"], rows: [[1, 10, 1], [1, 10, 2], [1, 11, 1], [2, 10, 1], [2, 12, 2], [2, 12, 3], [3, 13, 1]]}],
        result: {columns: ["teacher_id", "cnt"], rows: [[1, 2], [2, 2], [3, 1]]},
        explanation: "Teacher 1 teaches subjects 10 and 11 (subject 10 twice). Teacher 2 teaches 10 and 12. Teacher 3 teaches only 13.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE teaching_log (teacher_id integer NOT NULL, subject_id integer NOT NULL, dept_id integer);
INSERT INTO teaching_log VALUES (1, 10, 1), (1, 10, 2), (1, 11, 1), (2, 10, 1), (2, 12, 2), (2, 12, 3), (3, 13, 1);`, ["teacher_id", "cnt"], [[1, 2], [2, 2], [3, 1]]),
      t("one subject in many departments, one unknown", `CREATE TABLE teaching_log (teacher_id integer NOT NULL, subject_id integer NOT NULL, dept_id integer);
INSERT INTO teaching_log VALUES (5, 7, 1), (5, 7, 2), (5, 7, NULL);`, ["teacher_id", "cnt"], [[5, 1]]),
      t("two teachers share a subject", `CREATE TABLE teaching_log (teacher_id integer NOT NULL, subject_id integer NOT NULL, dept_id integer);
INSERT INTO teaching_log VALUES (1, 4, 1), (2, 4, 1), (2, 5, NULL);`, ["teacher_id", "cnt"], [[1, 1], [2, 2]]),
      t("empty log", `CREATE TABLE teaching_log (teacher_id integer NOT NULL, subject_id integer NOT NULL, dept_id integer);`, ["teacher_id", "cnt"], []),
    ],
    solution: `SELECT teacher_id, COUNT(DISTINCT subject_id) AS cnt
FROM teaching_log
GROUP BY teacher_id`,
    approaches: [
      {
        id: "count-distinct",
        title: "GROUP BY teacher with COUNT(DISTINCT subject_id)",
        optimal: true,
        explanation: "`GROUP BY teacher_id` makes one group per teacher, and `COUNT(DISTINCT subject_id)` counts each subject once inside the group. It is one pass over the table and one line of logic. Plain `COUNT(subject_id)` would count every row, so a repeated subject would be counted twice.",
        code: `SELECT teacher_id, COUNT(DISTINCT subject_id) AS cnt
FROM teaching_log
GROUP BY teacher_id`,
      },
      {
        id: "dedupe-first",
        title: "Remove repeated pairs first, then count",
        optimal: false,
        explanation: "A subquery with `SELECT DISTINCT teacher_id, subject_id` keeps one row per teacher and subject. The outer query then counts rows per teacher with an ordinary `COUNT(*)`. It gives the same answer, but needs two steps. It is useful when you want to see the de-duplicated pairs while debugging.",
        code: `SELECT teacher_id, COUNT(*) AS cnt
FROM (SELECT DISTINCT teacher_id, subject_id FROM teaching_log) AS pairs
GROUP BY teacher_id`,
      },
    ],
    hints: [
      "What would a plain COUNT give for teacher 1 in the example, and why is that too high?",
      "Which keyword counts each value only once?",
      "Which column decides how the rows are grouped?",
    ],
    clarify: [
      {question: "Does the department matter?", answer: "No. Only the teacher and the subject decide the answer."},
      {question: "Can the output be in any order?", answer: "Yes."},
    ],
    followUps: ["How would you list the teachers who teach more than three different subjects?"],
  },
  {
    kind: "sql",
    lc: 1141,
    topic: "sql-sorting-grouping",
    title: "User Activity for the Past 30 Days I",
    difficulty: "Easy",
    statement: `A website records what its users do in \`site_activity\`. Each row is one action in one session on one day.

Look at the **30 days ending on 2025-03-31, including that day**. That is 2025-03-02 to 2025-03-31. For each day in this window that has activity, count the **distinct active users**.

Return \`day\` and \`active_users\`. Days with no activity are not listed. The rows can come back in any order.`,
    tables: [
      {name: "site_activity", note: "One row per action.", columns: [{name: "user_id", type: "integer"}, {name: "session_id", type: "integer"}, {name: "activity_date", type: "date"}, {name: "activity_type", type: "text", note: "NULL when not recorded."}]},
    ],
    examples: [
      {
        tables: [{name: "site_activity", columns: ["user_id", "session_id", "activity_date", "activity_type"], rows: [[1, 1, "2025-03-05", "open"], [1, 1, "2025-03-05", "click"], [2, 2, "2025-03-05", "open"], [2, 3, "2025-03-20", "open"], [3, 4, "2025-03-20", "click"], [1, 5, "2025-03-31", "open"], [4, 6, "2025-03-01", "open"], [5, 7, "2025-04-01", "open"]]}],
        result: {columns: ["day", "active_users"], rows: [["2025-03-05", 2], ["2025-03-20", 2], ["2025-03-31", 1]]},
        explanation: "On 5 March users 1 and 2 were active, and user 1 did two things but counts once. The rows on 1 March and 1 April are outside the window.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE site_activity (user_id integer NOT NULL, session_id integer NOT NULL, activity_date date NOT NULL, activity_type text);
INSERT INTO site_activity VALUES (1, 1, '2025-03-05', 'open'), (1, 1, '2025-03-05', 'click'), (2, 2, '2025-03-05', 'open'), (2, 3, '2025-03-20', 'open'), (3, 4, '2025-03-20', 'click'), (1, 5, '2025-03-31', 'open'), (4, 6, '2025-03-01', 'open'), (5, 7, '2025-04-01', 'open');`, ["day", "active_users"], [["2025-03-05", 2], ["2025-03-20", 2], ["2025-03-31", 1]]),
      t("one user, many sessions, unknown type", `CREATE TABLE site_activity (user_id integer NOT NULL, session_id integer NOT NULL, activity_date date NOT NULL, activity_type text);
INSERT INTO site_activity VALUES (7, 1, '2025-03-10', 'open'), (7, 2, '2025-03-10', NULL), (7, 3, '2025-03-10', 'open');`, ["day", "active_users"], [["2025-03-10", 1]]),
      t("first and last day of the window count", `CREATE TABLE site_activity (user_id integer NOT NULL, session_id integer NOT NULL, activity_date date NOT NULL, activity_type text);
INSERT INTO site_activity VALUES (1, 1, '2025-03-02', 'open'), (2, 2, '2025-03-31', 'open'), (3, 3, '2025-03-01', 'open'), (4, 4, '2025-04-01', NULL);`, ["day", "active_users"], [["2025-03-02", 1], ["2025-03-31", 1]]),
      t("nothing in the window", `CREATE TABLE site_activity (user_id integer NOT NULL, session_id integer NOT NULL, activity_date date NOT NULL, activity_type text);
INSERT INTO site_activity VALUES (1, 1, '2025-02-28', 'open'), (2, 2, '2025-04-02', 'open');`, ["day", "active_users"], []),
    ],
    solution: `SELECT activity_date AS day, COUNT(DISTINCT user_id) AS active_users
FROM site_activity
WHERE activity_date > DATE '2025-03-31' - 30
  AND activity_date <= DATE '2025-03-31'
GROUP BY activity_date`,
    approaches: [
      {
        id: "date-range",
        title: "Filter with a range on the plain date column",
        optimal: true,
        explanation: "`DATE '2025-03-31' - 30` is 2025-03-01, so `activity_date > ... AND activity_date <= ...` keeps exactly 30 days. The column is compared directly, so an index on `activity_date` could be used. Then `COUNT(DISTINCT user_id)` counts each user once per day.",
        code: `SELECT activity_date AS day, COUNT(DISTINCT user_id) AS active_users
FROM site_activity
WHERE activity_date > DATE '2025-03-31' - 30
  AND activity_date <= DATE '2025-03-31'
GROUP BY activity_date`,
      },
      {
        id: "days-ago",
        title: "Work out how many days ago each row was",
        optimal: false,
        explanation: "Subtract the activity date from the end date to get the age in days, and keep ages 0 to 29. It is easy to read, but the column sits inside an expression, so an index on `activity_date` cannot be used and an off-by-one slip is easier (29 versus 30).",
        code: `SELECT activity_date AS day, COUNT(DISTINCT user_id) AS active_users
FROM site_activity
WHERE DATE '2025-03-31' - activity_date BETWEEN 0 AND 29
GROUP BY activity_date`,
      },
    ],
    hints: [
      "Count the days: if the last day is 31 March, which day is the first of 30?",
      "Should one user with three actions on a day count once or three times?",
      "Which column do you group by to get one row per day?",
    ],
    clarify: [
      {question: "Are both end days of the window included?", answer: "Yes. 2025-03-02 and 2025-03-31 both count."},
      {question: "Do I list days with zero activity?", answer: "No. Only days that have at least one row."},
    ],
    followUps: ["How would you change the query to show days with no activity as 0, using generate_series?"],
    mysqlNote: "MySQL has no `date - integer`. Use `activity_date > DATE_SUB('2025-03-31', INTERVAL 30 DAY)` or `DATEDIFF('2025-03-31', activity_date) < 30`. `COUNT(DISTINCT ...)` and `GROUP BY` are the same.",
  },
  {
    kind: "sql",
    lc: 1070,
    topic: "sql-sorting-grouping",
    title: "Product Sales Analysis III",
    difficulty: "Medium",
    statement: `\`sales_records\` lists sales of products by year. One product can have several rows in the same year.

For every product, find its **first year** with any sale, and return **every sale row from that year**. If a product has two rows in its first year, both are returned.

Return \`product_id\`, \`first_year\` (the year), \`quantity\` and \`price\`. The rows can come back in any order.`,
    tables: [
      {name: "sales_records", note: "One row per sale line.", columns: [{name: "sale_id", type: "integer", pk: true}, {name: "product_id", type: "integer"}, {name: "year", type: "integer"}, {name: "quantity", type: "integer"}, {name: "price", type: "integer", note: "NULL if the price was not recorded."}]},
    ],
    examples: [
      {
        tables: [{name: "sales_records", columns: ["sale_id", "product_id", "year", "quantity", "price"], rows: [[1, 100, 2022, 10, 5000], [2, 100, 2023, 12, 5000], [3, 200, 2021, 15, 9000], [4, 200, 2021, 3, 9100], [5, 300, 2024, 7, 1200]]}],
        result: {columns: ["product_id", "first_year", "quantity", "price"], rows: [[100, 2022, 10, 5000], [200, 2021, 15, 9000], [200, 2021, 3, 9100], [300, 2024, 7, 1200]]},
        explanation: "Product 100 first sold in 2022, so its 2023 row is dropped. Product 200 has two rows in 2021 and both stay.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE sales_records (sale_id integer PRIMARY KEY, product_id integer NOT NULL, year integer NOT NULL, quantity integer NOT NULL, price integer);
INSERT INTO sales_records VALUES (1, 100, 2022, 10, 5000), (2, 100, 2023, 12, 5000), (3, 200, 2021, 15, 9000), (4, 200, 2021, 3, 9100), (5, 300, 2024, 7, 1200);`, ["product_id", "first_year", "quantity", "price"], [[100, 2022, 10, 5000], [200, 2021, 15, 9000], [200, 2021, 3, 9100], [300, 2024, 7, 1200]]),
      t("first year is not the first row; unknown price", `CREATE TABLE sales_records (sale_id integer PRIMARY KEY, product_id integer NOT NULL, year integer NOT NULL, quantity integer NOT NULL, price integer);
INSERT INTO sales_records VALUES (1, 50, 2025, 1, 10), (2, 50, 2019, 2, NULL), (3, 60, 2019, 9, 30), (4, 70, 2025, 4, 40);`, ["product_id", "first_year", "quantity", "price"], [[50, 2019, 2, null], [60, 2019, 9, 30], [70, 2025, 4, 40]]),
      t("three rows in the first year", `CREATE TABLE sales_records (sale_id integer PRIMARY KEY, product_id integer NOT NULL, year integer NOT NULL, quantity integer NOT NULL, price integer);
INSERT INTO sales_records VALUES (1, 8, 2020, 1, 5), (2, 8, 2020, 2, 5), (3, 8, 2020, 3, 6), (4, 8, 2021, 9, 9);`, ["product_id", "first_year", "quantity", "price"], [[8, 2020, 1, 5], [8, 2020, 2, 5], [8, 2020, 3, 6]]),
      t("no sales", `CREATE TABLE sales_records (sale_id integer PRIMARY KEY, product_id integer NOT NULL, year integer NOT NULL, quantity integer NOT NULL, price integer);`, ["product_id", "first_year", "quantity", "price"], []),
    ],
    solution: `SELECT product_id, year AS first_year, quantity, price
FROM sales_records
WHERE (product_id, year) IN (
  SELECT product_id, MIN(year)
  FROM sales_records
  GROUP BY product_id
)`,
    approaches: [
      {
        id: "tuple-in-min",
        title: "Match (product, year) against the earliest year per product",
        optimal: true,
        explanation: "The subquery finds `MIN(year)` for each product once. The outer query keeps rows whose product and year pair is in that list, so ties in the first year are all kept. It needs no ranking and reads clearly: filter the rows to the first year of their own product.",
        code: `SELECT product_id, year AS first_year, quantity, price
FROM sales_records
WHERE (product_id, year) IN (
  SELECT product_id, MIN(year)
  FROM sales_records
  GROUP BY product_id
)`,
      },
      {
        id: "rank-window",
        title: "RANK() over each product's years",
        optimal: false,
        explanation: "`RANK() OVER (PARTITION BY product_id ORDER BY year)` gives rank 1 to every row in the first year, including ties. Keep rank 1. It is flexible (change to rank 3 for the third year), but `ROW_NUMBER` would be wrong here because it breaks ties and would drop rows.",
        code: `SELECT product_id, year AS first_year, quantity, price
FROM (
  SELECT product_id, year, quantity, price,
         RANK() OVER (PARTITION BY product_id ORDER BY year) AS rnk
  FROM sales_records
) ranked
WHERE rnk = 1`,
      },
      {
        id: "join-min",
        title: "Join to a table of first years",
        optimal: false,
        explanation: "Build `first_years` with `GROUP BY product_id` and join it back on product and year. This is the same idea as the tuple `IN`, written as a join. It works everywhere, including engines without tuple comparison.",
        code: `SELECT s.product_id, s.year AS first_year, s.quantity, s.price
FROM sales_records s
JOIN (SELECT product_id, MIN(year) AS y FROM sales_records GROUP BY product_id) f
  ON f.product_id = s.product_id AND f.y = s.year`,
      },
    ],
    hints: [
      "First work out, per product, the earliest year. Which aggregate does that?",
      "Then how do you keep only the rows from that year? Think about joining back or using IN.",
      "If you use a window function, what happens to ties with ROW_NUMBER?",
    ],
    clarify: [
      {question: "If a product has two rows in its first year, do I return both?", answer: "Yes. Return every row from that year."},
      {question: "Should the year column be called first_year?", answer: "Yes."},
    ],
    followUps: ["How would you return the second year of sales for each product instead?"],
    mysqlNote: "MySQL 8 accepts the same tuple `IN` and `RANK()`. In MySQL you may need backticks around `year` in some contexts, because it is also a function name.",
  },
  {
    kind: "sql",
    lc: 596,
    topic: "sql-sorting-grouping",
    title: "Classes More Than 5 Students",
    difficulty: "Easy",
    statement: `A school stores which student attends which class in \`class_roster\`. Sometimes the same student is entered twice for the same class by mistake, and some rows have no student name yet (\`NULL\`).

List the classes that have **at least 5 different students**. Count each student once per class, and ignore rows with no student.

Return one column, \`class\`. The rows can come back in any order.`,
    tables: [
      {name: "class_roster", note: "One row per enrolment entry.", columns: [{name: "student", type: "text", note: "NULL if not filled in."}, {name: "class", type: "text"}]},
    ],
    examples: [
      {
        tables: [{name: "class_roster", columns: ["student", "class"], rows: [["Ann", "Maths"], ["Ben", "Maths"], ["Cy", "Maths"], ["Di", "Maths"], ["Eli", "Maths"], ["Ann", "Art"], ["Ben", "Art"], ["Cy", "Art"], ["Di", "Art"], ["Ann", "Music"], ["Ben", "Music"], ["Cy", "Music"], ["Di", "Music"], ["Eli", "Music"], ["Flo", "Music"]]}],
        result: {columns: ["class"], rows: [["Maths"], ["Music"]]},
        explanation: "Maths has 5 students and Music has 6. Art has only 4.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE class_roster (student text, class text NOT NULL);
INSERT INTO class_roster VALUES ('Ann', 'Maths'), ('Ben', 'Maths'), ('Cy', 'Maths'), ('Di', 'Maths'), ('Eli', 'Maths'), ('Ann', 'Art'), ('Ben', 'Art'), ('Cy', 'Art'), ('Di', 'Art'), ('Ann', 'Music'), ('Ben', 'Music'), ('Cy', 'Music'), ('Di', 'Music'), ('Eli', 'Music'), ('Flo', 'Music');`, ["class"], [["Maths"], ["Music"]]),
      t("repeated entries count once", `CREATE TABLE class_roster (student text, class text NOT NULL);
INSERT INTO class_roster VALUES ('Ann', 'Dance'), ('Ann', 'Dance'), ('Ann', 'Dance'), ('Ann', 'Dance'), ('Ann', 'Dance'), ('Bob', 'Dance'), ('A', 'Chess'), ('B', 'Chess'), ('C', 'Chess'), ('D', 'Chess'), ('E', 'Chess');`, ["class"], [["Chess"]]),
      t("rows with no student are ignored", `CREATE TABLE class_roster (student text, class text NOT NULL);
INSERT INTO class_roster VALUES ('A', 'Yoga'), ('B', 'Yoga'), ('C', 'Yoga'), ('D', 'Yoga'), (NULL, 'Yoga'), (NULL, 'Yoga');`, ["class"], []),
      t("no class is big enough", `CREATE TABLE class_roster (student text, class text NOT NULL);
INSERT INTO class_roster VALUES ('A', 'Art'), ('B', 'Art'), ('C', 'Music');`, ["class"], []),
    ],
    solution: `SELECT class
FROM class_roster
GROUP BY class
HAVING COUNT(DISTINCT student) >= 5`,
    approaches: [
      {
        id: "having-distinct",
        title: "GROUP BY class with HAVING COUNT(DISTINCT student)",
        optimal: true,
        explanation: "`HAVING` filters groups after they are counted, which is exactly what is needed here. `COUNT(DISTINCT student)` counts each student once and skips NULLs, so repeated entries and empty names cannot inflate the count. One pass, no subquery.",
        code: `SELECT class
FROM class_roster
GROUP BY class
HAVING COUNT(DISTINCT student) >= 5`,
      },
      {
        id: "subquery-where",
        title: "Count in a subquery, then filter with WHERE",
        optimal: false,
        explanation: "Compute `class` and the distinct count in a subquery, then keep rows where the count is at least 5. It does the same work as `HAVING` but with an extra layer. It is handy when you also want to show the count in the final output.",
        code: `SELECT class
FROM (
  SELECT class, COUNT(DISTINCT student) AS students
  FROM class_roster
  GROUP BY class
) counted
WHERE students >= 5`,
      },
    ],
    hints: [
      "WHERE cannot see a count. Which clause filters after grouping?",
      "What does a repeated row do to COUNT(*)?",
      "What does COUNT(student) do with NULL?",
    ],
    clarify: [
      {question: "Is exactly 5 students enough?", answer: "Yes. The rule is at least 5."},
      {question: "What if a student appears twice in one class?", answer: "Count them once."},
    ],
    followUps: ["How would you also show how many students each of those classes has?"],
  },
  {
    kind: "sql",
    lc: 1729,
    topic: "sql-sorting-grouping",
    title: "Find Followers Count",
    difficulty: "Easy",
    statement: `\`follows\` says which accounts follow which user. A row \`(user_id, follower_id)\` means \`follower_id\` follows \`user_id\`. The same pair may be stored twice by mistake, and \`follower_id\` is \`NULL\` when the follower's account was deleted.

For every user who appears in the table, count their **different followers**. Deleted followers (\`NULL\`) do not count, so a user can end up with 0.

Return \`user_id\` and \`followers_count\`, sorted by \`user_id\` ascending.`,
    tables: [
      {name: "follows", note: "One row per follow entry.", columns: [{name: "user_id", type: "integer"}, {name: "follower_id", type: "integer", note: "NULL if the follower was deleted."}]},
    ],
    examples: [
      {
        tables: [{name: "follows", columns: ["user_id", "follower_id"], rows: [[5, 1], [5, 2], [3, 1], [3, 2], [3, 4], [9, 1]]}],
        result: {columns: ["user_id", "followers_count"], rows: [[3, 3], [5, 2], [9, 1]]},
        explanation: "User 3 has followers 1, 2 and 4. The result is sorted by user_id, not by count.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE follows (user_id integer NOT NULL, follower_id integer);
INSERT INTO follows VALUES (5, 1), (5, 2), (3, 1), (3, 2), (3, 4), (9, 1);`, ["user_id", "followers_count"], [[3, 3], [5, 2], [9, 1]], true),
      t("ties are ordered by user_id", `CREATE TABLE follows (user_id integer NOT NULL, follower_id integer);
INSERT INTO follows VALUES (4, 1), (2, 1), (4, 2), (2, 2);`, ["user_id", "followers_count"], [[2, 2], [4, 2]], true),
      t("deleted followers and repeated pairs", `CREATE TABLE follows (user_id integer NOT NULL, follower_id integer);
INSERT INTO follows VALUES (7, NULL), (1, NULL), (1, 2), (1, 2), (1, 3);`, ["user_id", "followers_count"], [[1, 2], [7, 0]], true),
      t("empty table", `CREATE TABLE follows (user_id integer NOT NULL, follower_id integer);`, ["user_id", "followers_count"], [], true),
    ],
    solution: `SELECT user_id, COUNT(DISTINCT follower_id) AS followers_count
FROM follows
GROUP BY user_id
ORDER BY user_id`,
    approaches: [
      {
        id: "count-distinct",
        title: "COUNT(DISTINCT follower_id) per user",
        optimal: true,
        explanation: "Group by `user_id`, count different followers, then sort. `COUNT(column)` skips NULLs, so deleted followers give 0, and `DISTINCT` removes repeated pairs. The final `ORDER BY user_id` is needed, because `GROUP BY` does not promise any order.",
        code: `SELECT user_id, COUNT(DISTINCT follower_id) AS followers_count
FROM follows
GROUP BY user_id
ORDER BY user_id`,
      },
      {
        id: "dedupe-first",
        title: "De-duplicate the pairs, then count the column",
        optimal: false,
        explanation: "A subquery with `SELECT DISTINCT user_id, follower_id` removes repeats. The outer `COUNT(follower_id)` then skips NULLs. It is correct, but needs an extra step that `COUNT(DISTINCT ...)` does in one.",
        code: `SELECT user_id, COUNT(follower_id) AS followers_count
FROM (SELECT DISTINCT user_id, follower_id FROM follows) pairs
GROUP BY user_id
ORDER BY user_id`,
      },
    ],
    hints: [
      "Which column do you group by, and which do you count?",
      "What is the difference between COUNT(*) and COUNT(follower_id) when follower_id is NULL?",
      "Which clause makes the order certain?",
    ],
    clarify: [
      {question: "Should a user whose followers are all deleted appear?", answer: "Yes, with 0."},
      {question: "What is the sort order?", answer: "By user_id ascending."},
    ],
    followUps: ["How would you return only the user with the most followers, and what would you do about ties?"],
  },
  {
    kind: "sql",
    lc: 619,
    topic: "sql-sorting-grouping",
    title: "Biggest Single Number",
    difficulty: "Easy",
    statement: `\`reading_log\` holds whole numbers. The same number can appear many times, and some rows are \`NULL\`.

A **single number** is a number that appears **exactly once** in the table. Find the **largest** single number.

Return one row with one column, \`num\`. If there is no single number, return one row where \`num\` is \`NULL\`.`,
    tables: [
      {name: "reading_log", note: "No key; duplicates are allowed.", columns: [{name: "num", type: "integer", note: "May be NULL."}]},
    ],
    examples: [
      {
        tables: [{name: "reading_log", columns: ["num"], rows: [[8], [8], [3], [3], [1], [4], [5], [6]]}],
        result: {columns: ["num"], rows: [[6]]},
        explanation: "8 and 3 appear twice. The single numbers are 1, 4, 5 and 6, and the largest is 6.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE reading_log (num integer);
INSERT INTO reading_log VALUES (8), (8), (3), (3), (1), (4), (5), (6);`, ["num"], [[6]]),
      t("every number repeats", `CREATE TABLE reading_log (num integer);
INSERT INTO reading_log VALUES (2), (2), (3), (3);`, ["num"], [[null]]),
      t("empty table", `CREATE TABLE reading_log (num integer);`, ["num"], [[null]]),
      t("a NULL row does not win", `CREATE TABLE reading_log (num integer);
INSERT INTO reading_log VALUES (NULL), (5), (5), (7);`, ["num"], [[7]]),
      t("largest value is repeated", `CREATE TABLE reading_log (num integer);
INSERT INTO reading_log VALUES (9), (9), (9), (2);`, ["num"], [[2]]),
    ],
    solution: `SELECT MAX(num) AS num
FROM (
  SELECT num
  FROM reading_log
  GROUP BY num
  HAVING COUNT(*) = 1
) singles`,
    approaches: [
      {
        id: "having-one-then-max",
        title: "Keep numbers with count 1, then take MAX",
        optimal: true,
        explanation: "The inner query groups by number and keeps groups of size 1. The outer `MAX` returns the biggest, and an aggregate over zero rows returns one row holding `NULL`, which is exactly the required answer when nothing qualifies. A version with `ORDER BY ... LIMIT 1` would return no row at all in that case.",
        code: `SELECT MAX(num) AS num
FROM (
  SELECT num
  FROM reading_log
  GROUP BY num
  HAVING COUNT(*) = 1
) singles`,
      },
      {
        id: "window-count",
        title: "Count each value with a window function",
        optimal: false,
        explanation: "`COUNT(*) OVER (PARTITION BY num)` puts the number of equal values on every row. Keep rows where it is 1 and take `MAX`. It avoids `GROUP BY` but touches every row, and the result is the same.",
        code: `SELECT MAX(num) AS num
FROM (
  SELECT num, COUNT(*) OVER (PARTITION BY num) AS times
  FROM reading_log
) counted
WHERE times = 1`,
      },
    ],
    hints: [
      "How do you find numbers that appear exactly once?",
      "What does MAX return over an empty set?",
      "Why might ORDER BY num DESC LIMIT 1 fail when nothing qualifies?",
    ],
    clarify: [
      {question: "What do I return when no number appears once?", answer: "One row with NULL."},
      {question: "Can the table be empty?", answer: "Yes. The answer is then one NULL row."},
    ],
    followUps: ["How would you return the two biggest single numbers?"],
  },
  {
    kind: "sql",
    lc: 1045,
    topic: "sql-sorting-grouping",
    title: "Customers Who Bought All Products",
    difficulty: "Medium",
    statement: `\`product_list\` holds every product the shop sells. \`purchases\` records what each customer bought. A customer may buy the same product many times, and a purchase of a removed product has a \`NULL\` product key. Every non-NULL key exists in \`product_list\`.

Find the customers who have bought **every product** in \`product_list\` at least once.

Return \`customer_id\`. The rows can come back in any order.`,
    tables: [
      {name: "product_list", columns: [{name: "product_key", type: "integer", pk: true}]},
      {name: "purchases", columns: [{name: "customer_id", type: "integer"}, {name: "product_key", type: "integer", note: "NULL for a removed product."}]},
    ],
    examples: [
      {
        tables: [
          {name: "product_list", columns: ["product_key"], rows: [[1], [2], [3]]},
          {name: "purchases", columns: ["customer_id", "product_key"], rows: [[1, 1], [1, 2], [1, 3], [1, 1], [2, 1], [2, 2], [2, 3], [3, 1], [3, 3]]},
        ],
        result: {columns: ["customer_id"], rows: [[1], [2]]},
        explanation: "Customers 1 and 2 bought products 1, 2 and 3. Customer 3 never bought product 2.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE product_list (product_key integer PRIMARY KEY);
CREATE TABLE purchases (customer_id integer NOT NULL, product_key integer);
INSERT INTO product_list VALUES (1), (2), (3);
INSERT INTO purchases VALUES (1, 1), (1, 2), (1, 3), (1, 1), (2, 1), (2, 2), (2, 3), (3, 1), (3, 3);`, ["customer_id"], [[1], [2]]),
      t("repeat buys do not fill the gaps", `CREATE TABLE product_list (product_key integer PRIMARY KEY);
CREATE TABLE purchases (customer_id integer NOT NULL, product_key integer);
INSERT INTO product_list VALUES (1), (2);
INSERT INTO purchases VALUES (4, 1), (4, 1), (4, 1), (4, 1), (4, 1);`, ["customer_id"], []),
      t("removed products (NULL) are ignored", `CREATE TABLE product_list (product_key integer PRIMARY KEY);
CREATE TABLE purchases (customer_id integer NOT NULL, product_key integer);
INSERT INTO product_list VALUES (1), (2);
INSERT INTO purchases VALUES (1, 1), (1, NULL), (1, NULL), (2, 1), (2, 2), (2, NULL);`, ["customer_id"], [[2]]),
      t("shop with one product", `CREATE TABLE product_list (product_key integer PRIMARY KEY);
CREATE TABLE purchases (customer_id integer NOT NULL, product_key integer);
INSERT INTO product_list VALUES (7);
INSERT INTO purchases VALUES (1, 7), (2, 7), (2, 7);`, ["customer_id"], [[1], [2]]),
      t("no purchases at all", `CREATE TABLE product_list (product_key integer PRIMARY KEY);
CREATE TABLE purchases (customer_id integer NOT NULL, product_key integer);
INSERT INTO product_list VALUES (1), (2);`, ["customer_id"], []),
    ],
    solution: `SELECT customer_id
FROM purchases
GROUP BY customer_id
HAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM product_list)`,
    approaches: [
      {
        id: "count-equals-total",
        title: "Compare each customer's distinct count with the product total",
        optimal: true,
        explanation: "If a customer's number of different products equals the number of products in the shop, they bought them all. This works because every non-NULL key is in `product_list`. `COUNT(DISTINCT ...)` ignores repeat purchases and NULL keys. The total comes from a small scalar subquery, so nothing is hard-coded.",
        code: `SELECT customer_id
FROM purchases
GROUP BY customer_id
HAVING COUNT(DISTINCT product_key) = (SELECT COUNT(*) FROM product_list)`,
      },
      {
        id: "not-exists-division",
        title: "Double NOT EXISTS: no product is missing",
        optimal: false,
        explanation: "For each customer, look for a product that the customer has not bought. If none exists, the customer bought everything. This is the classic relational-division pattern. It is more general, since it does not rely on keys being valid, but it is harder to read and can be slower.",
        code: `SELECT DISTINCT c.customer_id
FROM purchases c
WHERE NOT EXISTS (
  SELECT 1
  FROM product_list p
  WHERE NOT EXISTS (
    SELECT 1
    FROM purchases x
    WHERE x.customer_id = c.customer_id AND x.product_key = p.product_key
  )
)`,
      },
    ],
    hints: [
      "How many different products does the shop sell?",
      "How many different products has each customer bought?",
      "What do repeat purchases do to COUNT(*)?",
    ],
    clarify: [
      {question: "Can a customer buy the same product more than once?", answer: "Yes. It still counts as one product."},
      {question: "Do NULL product keys count as products?", answer: "No."},
    ],
    followUps: ["How would you list the customers who bought at least 80% of the products?"],
  },
];
