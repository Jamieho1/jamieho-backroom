/**
 * SQL problems: Advanced String Functions / Regex / Clause (SQL 50 topic 7). Question numbers and titles follow
 * LeetCode's public SQL 50 plan; every statement, table, row, test, solution and explanation is our own words and
 * our own data (see ../sql-types.ts). Answers run on Postgres (PGlite) in the browser.
 * - 1667 Fix Names in a Table (Easy)
 * - 1527 Patients With a Condition (Easy)
 * - 196 Delete Duplicate Emails (Easy)
 * - 176 Second Highest Salary (Medium)
 * - 1484 Group Sold Products By The Date (Easy)
 * - 1327 List the Products Ordered in a Period (Easy)
 * - 1517 Find Users With Valid E-Mails (Easy)
 */
import type {SqlCell, SqlProblemSeed} from "../sql-types";

const t = (name: string, setup: string, columns: string[], rows: SqlCell[][], ordered = false) => ({name, setup, expected: {columns, rows}, ordered});

export const sql: SqlProblemSeed[] = [
  {
    kind: "sql",
    lc: 1667,
    topic: "sql-strings-regex-clause",
    title: "Fix Names in a Table",
    difficulty: "Easy",
    statement: `\`member_names\` holds names typed in all sorts of ways: \`aLiCE\`, \`BOB\`, \`carol\`.

The original question asks you to **update** the table. Here only \`SELECT\` queries can run, so write a query that returns the **corrected values** instead: the first character in upper case and **all the other characters in lower case**. Only the first character of the whole value is capitalised, so \`anne-marie\` becomes \`Anne-marie\`. A \`NULL\` name stays \`NULL\`, and an empty name stays empty.

Return \`user_id\` and the fixed \`name\`, sorted by \`user_id\`.`,
    tables: [
      {name: "member_names", columns: [{name: "user_id", type: "integer", pk: true}, {name: "name", type: "text", note: "May be NULL."}]},
    ],
    examples: [
      {
        tables: [{name: "member_names", columns: ["user_id", "name"], rows: [[3, "aLiCE"], [1, "BOB"], [2, "carol"], [4, "d"]]}],
        result: {columns: ["user_id", "name"], rows: [[1, "Bob"], [2, "Carol"], [3, "Alice"], [4, "D"]]},
        explanation: "Each name gets a capital first letter and lower-case letters after it.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE member_names (user_id integer PRIMARY KEY, name text);
INSERT INTO member_names VALUES (3, 'aLiCE'), (1, 'BOB'), (2, 'carol'), (4, 'd');`, ["user_id", "name"], [[1, "Bob"], [2, "Carol"], [3, "Alice"], [4, "D"]], true),
      t("hyphens and spaces do not start a new word", `CREATE TABLE member_names (user_id integer PRIMARY KEY, name text);
INSERT INTO member_names VALUES (1, 'anne-marie'), (2, 'JEAN PAUL'), (3, 'Already Fine');`, ["user_id", "name"], [[1, "Anne-marie"], [2, "Jean paul"], [3, "Already fine"]], true),
      t("NULL and empty names", `CREATE TABLE member_names (user_id integer PRIMARY KEY, name text);
INSERT INTO member_names VALUES (1, NULL), (2, ''), (3, 'zed');`, ["user_id", "name"], [[1, null], [2, ""], [3, "Zed"]], true),
      t("empty table", `CREATE TABLE member_names (user_id integer PRIMARY KEY, name text);`, ["user_id", "name"], [], true),
    ],
    solution: `SELECT user_id,
       UPPER(LEFT(name, 1)) || LOWER(SUBSTRING(name FROM 2)) AS name
FROM member_names
ORDER BY user_id`,
    approaches: [
      {
        id: "upper-left-lower-rest",
        title: "UPPER of the first letter joined to LOWER of the rest",
        optimal: true,
        explanation: "`LEFT(name, 1)` is the first character and `SUBSTRING(name FROM 2)` is everything after it. Upper-case the first, lower-case the rest, and join them with `||`. The `||` operator returns NULL when either side is NULL, so a NULL name stays NULL. `INITCAP` is tempting, but it capitalises every word and every letter after a hyphen, which is not what the question asks.",
        code: `SELECT user_id,
       UPPER(LEFT(name, 1)) || LOWER(SUBSTRING(name FROM 2)) AS name
FROM member_names
ORDER BY user_id`,
      },
      {
        id: "overlay",
        title: "Lower-case everything, then overwrite the first letter",
        optimal: false,
        explanation: "`OVERLAY(LOWER(name) PLACING UPPER(LEFT(name, 1)) FROM 1 FOR 1)` replaces the first character of the lower-cased name with its upper-case form. It does the same job and is NULL-safe, but is less familiar to most people and harder to read.",
        code: `SELECT user_id,
       OVERLAY(LOWER(name) PLACING UPPER(LEFT(name, 1)) FROM 1 FOR 1) AS name
FROM member_names
ORDER BY user_id`,
      },
    ],
    hints: [
      "Split each name into its first character and the rest.",
      "Which function upper-cases and which lower-cases?",
      "Does INITCAP treat 'anne-marie' the way the question wants?",
    ],
    clarify: [
      {question: "Do I run an UPDATE?", answer: "No. Only SELECT can run here, so return the corrected values."},
      {question: "What about a NULL name?", answer: "It stays NULL."},
    ],
    followUps: ["How would you write the UPDATE statement that applies the same fix to the table itself?"],
    mysqlNote: "In MySQL, use `CONCAT(UPPER(LEFT(name, 1)), LOWER(SUBSTRING(name, 2)))`. Do not use `||` there: by default MySQL reads it as OR. `CONCAT` returns NULL if any argument is NULL in MySQL, but in Postgres `CONCAT` treats NULL as empty text, so a Postgres `CONCAT` version would turn a NULL name into an empty string.",
  },
  {
    kind: "sql",
    lc: 1527,
    topic: "sql-strings-regex-clause",
    title: "Patients With a Condition",
    difficulty: "Easy",
    statement: `\`clinic_visits\` stores, for each patient, a text field \`conditions\` with **condition codes separated by single spaces**, such as \`ACNE DIAB100\`. The field may be empty or \`NULL\`.

Find the patients who have at least one code that **starts with** \`DIAB1\`. The prefix must be at the start of a code: \`XDIAB1\` does not count. Codes are case-sensitive, so \`diab100\` does not count either.

Return \`patient_id\`, \`patient_name\` and \`conditions\`. The rows can come back in any order.`,
    tables: [
      {name: "clinic_visits", columns: [{name: "patient_id", type: "integer", pk: true}, {name: "patient_name", type: "text"}, {name: "conditions", type: "text", note: "Space-separated codes; may be empty or NULL."}]},
    ],
    examples: [
      {
        tables: [{name: "clinic_visits", columns: ["patient_id", "patient_name", "conditions"], rows: [[1, "Daniel", "YFEV COUGH"], [2, "Alice", ""], [3, "Bob", "DIAB100 MYOP"], [4, "George", "ACNE DIAB100"], [5, "Alain", "DIAB201"]]}],
        result: {columns: ["patient_id", "patient_name", "conditions"], rows: [[3, "Bob", "DIAB100 MYOP"], [4, "George", "ACNE DIAB100"]]},
        explanation: "Bob's first code and George's second code start with DIAB1. Alain's code starts with DIAB2.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE clinic_visits (patient_id integer PRIMARY KEY, patient_name text NOT NULL, conditions text);
INSERT INTO clinic_visits VALUES (1, 'Daniel', 'YFEV COUGH'), (2, 'Alice', ''), (3, 'Bob', 'DIAB100 MYOP'), (4, 'George', 'ACNE DIAB100'), (5, 'Alain', 'DIAB201');`, ["patient_id", "patient_name", "conditions"], [[3, "Bob", "DIAB100 MYOP"], [4, "George", "ACNE DIAB100"]]),
      t("the prefix must start a code", `CREATE TABLE clinic_visits (patient_id integer PRIMARY KEY, patient_name text NOT NULL, conditions text);
INSERT INTO clinic_visits VALUES (1, 'A', 'XDIAB1'), (2, 'B', 'NODIAB100 DIAB1'), (3, 'C', 'DIAB1');`, ["patient_id", "patient_name", "conditions"], [[2, "B", "NODIAB100 DIAB1"], [3, "C", "DIAB1"]]),
      t("codes are case-sensitive", `CREATE TABLE clinic_visits (patient_id integer PRIMARY KEY, patient_name text NOT NULL, conditions text);
INSERT INTO clinic_visits VALUES (1, 'A', 'diab100'), (2, 'B', 'Diab1');`, ["patient_id", "patient_name", "conditions"], []),
      t("unknown conditions are skipped", `CREATE TABLE clinic_visits (patient_id integer PRIMARY KEY, patient_name text NOT NULL, conditions text);
INSERT INTO clinic_visits VALUES (1, 'A', NULL), (2, 'B', 'DIAB1 COLD');`, ["patient_id", "patient_name", "conditions"], [[2, "B", "DIAB1 COLD"]]),
      t("empty table", `CREATE TABLE clinic_visits (patient_id integer PRIMARY KEY, patient_name text NOT NULL, conditions text);`, ["patient_id", "patient_name", "conditions"], []),
    ],
    solution: `SELECT patient_id, patient_name, conditions
FROM clinic_visits
WHERE conditions ~ '(^| )DIAB1'`,
    approaches: [
      {
        id: "regex-tilde",
        title: "Postgres regular expression with ~",
        optimal: true,
        explanation: "A regular expression (regex) is a short pattern for text. The operator `~` is true when the text contains a match. In `(^| )DIAB1`, `^` means 'the start of the text', the space is a real space, `|` means 'or', and the brackets group the choice. So the pattern says: DIAB1 at the very start, or DIAB1 right after a space. That is exactly 'a code that starts with DIAB1'. `~` is case-sensitive; `~*` ignores case. A NULL text gives NULL, so the row is skipped.",
        code: `SELECT patient_id, patient_name, conditions
FROM clinic_visits
WHERE conditions ~ '(^| )DIAB1'`,
      },
      {
        id: "like-twice",
        title: "Two LIKE patterns joined with OR",
        optimal: false,
        explanation: "`LIKE 'DIAB1%'` handles a code at the start of the text. `LIKE '% DIAB1%'` handles a code after a space. `%` means 'any text'. It needs no regex, but you have to remember to write both cases, and the pattern is repeated.",
        code: `SELECT patient_id, patient_name, conditions
FROM clinic_visits
WHERE conditions LIKE 'DIAB1%'
   OR conditions LIKE '% DIAB1%'`,
      },
      {
        id: "split-codes",
        title: "Split into codes and test each one",
        optimal: false,
        explanation: "`string_to_array(conditions, ' ')` turns the text into a list of codes and `unnest` makes one row per code. `EXISTS` is true when some code starts with DIAB1. It is easy to explain, but it is the heaviest option.",
        code: `SELECT patient_id, patient_name, conditions
FROM clinic_visits
WHERE EXISTS (
  SELECT 1
  FROM unnest(string_to_array(conditions, ' ')) AS code
  WHERE code LIKE 'DIAB1%'
)`,
      },
    ],
    hints: [
      "A code starts either at the beginning of the text or right after a space.",
      "In a regex, which symbol means 'start of the text'?",
      "Would `LIKE '%DIAB1%'` wrongly accept XDIAB1?",
    ],
    clarify: [
      {question: "Is the match case-sensitive?", answer: "Yes. Only upper-case DIAB1 counts."},
      {question: "Can the conditions field be NULL?", answer: "Yes. Those patients are not returned."},
    ],
    followUps: ["How would you count how many different patients have each code that starts with DIAB?"],
    mysqlNote: "MySQL writes a regex test as `conditions REGEXP '(^| )DIAB1'` (or `\\\\bDIAB1`). `REGEXP` is case-insensitive by default in MySQL unless the column uses a binary collation, so add `BINARY` or `REGEXP_LIKE(..., 'c')` for a case-sensitive match. `LIKE` works the same in both.",
  },
  {
    kind: "sql",
    lc: 196,
    topic: "sql-strings-regex-clause",
    title: "Delete Duplicate Emails",
    difficulty: "Easy",
    statement: `\`mailing_list\` has one row per signup. The same email can be signed up more than once, each time with a different \`id\`.

The original question asks you to **delete** the duplicates and keep the row with the **smallest id** for each email. Here only \`SELECT\` queries can run, so return the **rows that would remain** after the delete: for each email, the row with the smallest id. Emails are compared exactly, so \`A@x.com\` and \`a@x.com\` are different.

Return \`id\` and \`email\`. The rows can come back in any order.`,
    tables: [
      {name: "mailing_list", columns: [{name: "id", type: "integer", pk: true}, {name: "email", type: "text"}]},
    ],
    examples: [
      {
        tables: [{name: "mailing_list", columns: ["id", "email"], rows: [[1, "a@x.com"], [2, "b@x.com"], [3, "a@x.com"]]}],
        result: {columns: ["id", "email"], rows: [[1, "a@x.com"], [2, "b@x.com"]]},
        explanation: "Row 3 repeats the email of row 1, and 3 is the larger id, so it would be deleted.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE mailing_list (id integer PRIMARY KEY, email text NOT NULL);
INSERT INTO mailing_list VALUES (1, 'a@x.com'), (2, 'b@x.com'), (3, 'a@x.com');`, ["id", "email"], [[1, "a@x.com"], [2, "b@x.com"]]),
      t("three copies, ids out of order", `CREATE TABLE mailing_list (id integer PRIMARY KEY, email text NOT NULL);
INSERT INTO mailing_list VALUES (5, 'c@x.com'), (2, 'c@x.com'), (9, 'c@x.com'), (7, 'd@x.com');`, ["id", "email"], [[2, "c@x.com"], [7, "d@x.com"]]),
      t("no duplicates", `CREATE TABLE mailing_list (id integer PRIMARY KEY, email text NOT NULL);
INSERT INTO mailing_list VALUES (1, 'p@x.com'), (2, 'q@x.com');`, ["id", "email"], [[1, "p@x.com"], [2, "q@x.com"]]),
      t("letter case makes emails different", `CREATE TABLE mailing_list (id integer PRIMARY KEY, email text NOT NULL);
INSERT INTO mailing_list VALUES (1, 'A@x.com'), (2, 'a@x.com'), (3, 'a@x.com');`, ["id", "email"], [[1, "A@x.com"], [2, "a@x.com"]]),
      t("empty table", `CREATE TABLE mailing_list (id integer PRIMARY KEY, email text NOT NULL);`, ["id", "email"], []),
    ],
    solution: `SELECT id, email
FROM mailing_list
WHERE id IN (
  SELECT MIN(id)
  FROM mailing_list
  GROUP BY email
)`,
    approaches: [
      {
        id: "min-id-per-email",
        title: "Keep the row whose id is the smallest for its email",
        optimal: true,
        explanation: "`SELECT MIN(id) ... GROUP BY email` lists the id to keep for each email. The outer query returns the rows with those ids. This is the exact reverse of the delete: in a real `DELETE` you would write `WHERE id NOT IN (...)`. It is short and works in every database.",
        code: `SELECT id, email
FROM mailing_list
WHERE id IN (
  SELECT MIN(id)
  FROM mailing_list
  GROUP BY email
)`,
      },
      {
        id: "row-number",
        title: "ROW_NUMBER per email, keep number 1",
        optimal: false,
        explanation: "`ROW_NUMBER() OVER (PARTITION BY email ORDER BY id)` numbers the copies of each email from the smallest id. Keep number 1. It is the most flexible (change the order to keep the newest instead) but is longer than the `MIN` version.",
        code: `SELECT id, email
FROM (
  SELECT id, email,
         ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) AS copy_no
  FROM mailing_list
) numbered
WHERE copy_no = 1`,
      },
      {
        id: "not-exists-smaller",
        title: "NOT EXISTS a copy with a smaller id",
        optimal: false,
        explanation: "A row stays when no other row has the same email and a smaller id. It matches how people describe the rule, and it is how you would write the self-join `DELETE` in MySQL. It compares rows pair by pair, so it is slower on big tables.",
        code: `SELECT m.id, m.email
FROM mailing_list m
WHERE NOT EXISTS (
  SELECT 1
  FROM mailing_list o
  WHERE o.email = m.email AND o.id < m.id
)`,
      },
    ],
    hints: [
      "Which id would you keep for an email that appears three times?",
      "How do you get one 'keeper' id per email?",
      "How would a real DELETE differ from the SELECT you write here?",
    ],
    clarify: [
      {question: "Do I run a DELETE?", answer: "No. Return the rows that would remain."},
      {question: "Are A@x.com and a@x.com the same email?", answer: "No. They are different values."},
    ],
    followUps: ["How would you write the real DELETE statement, and why must you be careful with it in production?"],
    mysqlNote: "MySQL's original question is a `DELETE p1 FROM Person p1, Person p2 WHERE p1.email = p2.email AND p1.id > p2.id` self-join. MySQL cannot delete from a table while selecting from it in a subquery, so the real `DELETE` there needs the join form or a derived table. The `SELECT` version here is the same in both databases.",
  },
  {
    kind: "sql",
    lc: 176,
    topic: "sql-strings-regex-clause",
    title: "Second Highest Salary",
    difficulty: "Medium",
    statement: `\`pay_roll\` has one row per person with their salary. Several people can earn the same.

Find the **second highest different salary**. If there is no second highest (for example everyone earns the same, or the table is empty), the answer is \`NULL\`.

Return **exactly one row** with one column named \`secondhighestsalary\`. Postgres writes unquoted names in lower case, so this is the original \`SecondHighestSalary\`.`,
    tables: [
      {name: "pay_roll", columns: [{name: "id", type: "integer", pk: true}, {name: "salary", type: "integer"}]},
    ],
    examples: [
      {
        tables: [{name: "pay_roll", columns: ["id", "salary"], rows: [[1, 100], [2, 200], [3, 300]]}],
        result: {columns: ["secondhighestsalary"], rows: [[200]]},
        explanation: "The highest salary is 300 and the second highest is 200.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE pay_roll (id integer PRIMARY KEY, salary integer NOT NULL);
INSERT INTO pay_roll VALUES (1, 100), (2, 200), (3, 300);`, ["secondhighestsalary"], [[200]]),
      t("the top salary is shared", `CREATE TABLE pay_roll (id integer PRIMARY KEY, salary integer NOT NULL);
INSERT INTO pay_roll VALUES (1, 100), (2, 100), (3, 90), (4, 90);`, ["secondhighestsalary"], [[90]]),
      t("everyone earns the same", `CREATE TABLE pay_roll (id integer PRIMARY KEY, salary integer NOT NULL);
INSERT INTO pay_roll VALUES (1, 50), (2, 50);`, ["secondhighestsalary"], [[null]]),
      t("a single person", `CREATE TABLE pay_roll (id integer PRIMARY KEY, salary integer NOT NULL);
INSERT INTO pay_roll VALUES (1, 10);`, ["secondhighestsalary"], [[null]]),
      t("empty table", `CREATE TABLE pay_roll (id integer PRIMARY KEY, salary integer NOT NULL);`, ["secondhighestsalary"], [[null]]),
    ],
    solution: `SELECT MAX(salary) AS secondhighestsalary
FROM pay_roll
WHERE salary < (SELECT MAX(salary) FROM pay_roll)`,
    approaches: [
      {
        id: "max-below-max",
        title: "The largest salary that is below the largest salary",
        optimal: true,
        explanation: "The subquery finds the top salary. `WHERE salary < top` removes every row that earns it, including ties. `MAX` of what is left is the second highest. An aggregate always returns one row, and it is NULL when nothing is left, which is exactly the required answer. No sorting is needed, so it is one pass.",
        code: `SELECT MAX(salary) AS secondhighestsalary
FROM pay_roll
WHERE salary < (SELECT MAX(salary) FROM pay_roll)`,
      },
      {
        id: "dense-rank-window",
        title: "DENSE_RANK window: take rank 2",
        optimal: false,
        explanation: "`DENSE_RANK() OVER (ORDER BY salary DESC)` gives equal salaries the same rank with no gaps, so rank 2 is the second highest different salary. Wrapping rank 2 in `MAX` gives one row with NULL if there is no rank 2. It is flexible (change 2 to N), but it ranks every row and sorts.",
        code: `SELECT MAX(salary) AS secondhighestsalary
FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM pay_roll
) ranked
WHERE rnk = 2`,
      },
      {
        id: "offset-subquery",
        title: "DISTINCT, ORDER BY and OFFSET inside a scalar subquery",
        optimal: false,
        explanation: "`SELECT DISTINCT salary ... ORDER BY salary DESC LIMIT 1 OFFSET 1` skips the top salary and takes the next. On its own it returns no row when there is no second salary. Putting it in brackets inside `SELECT (...)` turns 'no row' into a single NULL. Easy to read, but it sorts all the salaries.",
        code: `SELECT (
  SELECT DISTINCT salary
  FROM pay_roll
  ORDER BY salary DESC
  LIMIT 1 OFFSET 1
) AS secondhighestsalary`,
      },
    ],
    hints: [
      "What should happen to people who share the top salary?",
      "What does MAX return over zero rows?",
      "If you use LIMIT and OFFSET, what comes back when there is no second salary?",
    ],
    clarify: [
      {question: "Are ties counted separately?", answer: "No. Equal salaries count as one value."},
      {question: "How many rows come back?", answer: "Exactly one, with NULL if there is no second highest."},
    ],
    followUps: ["How would you find the Nth highest different salary for any N?"],
    mysqlNote: "MySQL writes the offset form as `LIMIT 1, 1` or `LIMIT 1 OFFSET 1`, and often uses `IFNULL((SELECT DISTINCT salary ... ), NULL)` or the scalar-subquery trick. The `MAX(...) WHERE salary < (SELECT MAX(...))` version is identical in both databases.",
  },
  {
    kind: "sql",
    lc: 1484,
    topic: "sql-strings-regex-clause",
    title: "Group Sold Products By The Date",
    difficulty: "Easy",
    statement: `\`shop_sales\` has one row each time a product is sold on a day. The same product can be sold many times in a day. The product name can be \`NULL\` if the till did not record it.

For each day, return:

- \`sell_date\`: the day;
- \`num_sold\`: how many **different** products were sold (unknown names do not count);
- \`products\`: the different product names in **alphabetical order**, joined by commas with no spaces, for example \`Ink,Pen\`. If the day has no known product, this is \`NULL\`.

Sort by \`sell_date\`.`,
    tables: [
      {name: "shop_sales", columns: [{name: "sell_date", type: "date"}, {name: "product", type: "text", note: "NULL if not recorded."}]},
    ],
    examples: [
      {
        tables: [{name: "shop_sales", columns: ["sell_date", "product"], rows: [["2025-05-02", "Ink"], ["2025-05-01", "Pen"], ["2025-05-01", "Ink"], ["2025-05-03", "Pen"], ["2025-05-01", "Pen"], ["2025-05-02", "Cap"]]}],
        result: {columns: ["sell_date", "num_sold", "products"], rows: [["2025-05-01", 2, "Ink,Pen"], ["2025-05-02", 2, "Cap,Ink"], ["2025-05-03", 1, "Pen"]]},
        explanation: "On 1 May the pen was sold twice, but it counts once. Names are sorted alphabetically.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE shop_sales (sell_date date NOT NULL, product text);
INSERT INTO shop_sales VALUES ('2025-05-02', 'Ink'), ('2025-05-01', 'Pen'), ('2025-05-01', 'Ink'), ('2025-05-03', 'Pen'), ('2025-05-01', 'Pen'), ('2025-05-02', 'Cap');`, ["sell_date", "num_sold", "products"], [["2025-05-01", 2, "Ink,Pen"], ["2025-05-02", 2, "Cap,Ink"], ["2025-05-03", 1, "Pen"]], true),
      t("names are listed alphabetically", `CREATE TABLE shop_sales (sell_date date NOT NULL, product text);
INSERT INTO shop_sales VALUES ('2025-06-01', 'Zip'), ('2025-06-01', 'Apple'), ('2025-06-01', 'Mango'), ('2025-06-01', 'Apple');`, ["sell_date", "num_sold", "products"], [["2025-06-01", 3, "Apple,Mango,Zip"]], true),
      t("a day with only unrecorded products", `CREATE TABLE shop_sales (sell_date date NOT NULL, product text);
INSERT INTO shop_sales VALUES ('2025-07-02', NULL), ('2025-07-02', NULL), ('2025-07-01', 'Tea'), ('2025-07-01', NULL);`, ["sell_date", "num_sold", "products"], [["2025-07-01", 1, "Tea"], ["2025-07-02", 0, null]], true),
      t("empty table", `CREATE TABLE shop_sales (sell_date date NOT NULL, product text);`, ["sell_date", "num_sold", "products"], [], true),
    ],
    solution: `SELECT sell_date,
       COUNT(DISTINCT product) AS num_sold,
       STRING_AGG(DISTINCT product, ',' ORDER BY product) AS products
FROM shop_sales
GROUP BY sell_date
ORDER BY sell_date`,
    approaches: [
      {
        id: "string-agg-distinct",
        title: "COUNT(DISTINCT) and STRING_AGG(DISTINCT ... ORDER BY)",
        optimal: true,
        explanation: "`STRING_AGG` joins the values of a group into one text with a separator. `DISTINCT` removes repeats and `ORDER BY product` inside the call sorts the names. Both aggregates skip NULLs, so a day with only unknown names gets `0` and a NULL list. In Postgres, when you use `DISTINCT` the `ORDER BY` must use the same expression, which it does here.",
        code: `SELECT sell_date,
       COUNT(DISTINCT product) AS num_sold,
       STRING_AGG(DISTINCT product, ',' ORDER BY product) AS products
FROM shop_sales
GROUP BY sell_date
ORDER BY sell_date`,
      },
      {
        id: "dedupe-then-aggregate",
        title: "Remove repeated (day, product) pairs first",
        optimal: false,
        explanation: "A subquery with `SELECT DISTINCT sell_date, product` leaves one row per day and product. The outer query then uses plain `COUNT(product)` and `STRING_AGG(product, ',' ORDER BY product)`. It is the same answer in two steps, and it keeps the NULL-only day because the NULL row survives the `DISTINCT`.",
        code: `SELECT sell_date,
       COUNT(product) AS num_sold,
       STRING_AGG(product, ',' ORDER BY product) AS products
FROM (SELECT DISTINCT sell_date, product FROM shop_sales) d
GROUP BY sell_date
ORDER BY sell_date`,
      },
    ],
    hints: [
      "Which aggregate joins many values into one text?",
      "How do you stop repeats, and how do you sort the names inside the text?",
      "What do COUNT(column) and STRING_AGG do with NULL?",
    ],
    clarify: [
      {question: "What separator do I use?", answer: "A comma with no space."},
      {question: "What is products for a day with no known product?", answer: "NULL."},
    ],
    followUps: ["How would you change the separator to ', ' and also list each day's busiest product first?"],
    mysqlNote: "MySQL's version is `GROUP_CONCAT(DISTINCT product ORDER BY product SEPARATOR ',')`. Postgres uses `STRING_AGG(DISTINCT product, ',' ORDER BY product)`. The default `GROUP_CONCAT` separator is a comma, and its output is cut at `group_concat_max_len` characters, which Postgres does not do.",
  },
  {
    kind: "sql",
    lc: 1327,
    topic: "sql-strings-regex-clause",
    title: "List the Products Ordered in a Period",
    difficulty: "Easy",
    statement: `\`catalog_items\` lists products. \`order_lines\` has one row per order line with the date and the number of units. The unit count can be \`NULL\` if it was not recorded.

Find the products that sold **at least 100 units in total** during **April 2025** (from 2025-04-01 to 2025-04-30, both days included). Unknown unit counts add nothing.

Return \`product_name\` and \`unit\` (the April total). The rows can come back in any order.`,
    tables: [
      {name: "catalog_items", columns: [{name: "product_id", type: "integer", pk: true}, {name: "product_name", type: "text"}, {name: "product_category", type: "text"}]},
      {name: "order_lines", columns: [{name: "product_id", type: "integer"}, {name: "order_date", type: "date"}, {name: "unit", type: "integer", note: "NULL if not recorded."}]},
    ],
    examples: [
      {
        tables: [
          {name: "catalog_items", columns: ["product_id", "product_name", "product_category"], rows: [[1, "Bolt Pack", "tools"], [2, "Glue", "craft"], [3, "Tape", "craft"]]},
          {name: "order_lines", columns: ["product_id", "order_date", "unit"], rows: [[1, "2025-04-02", 60], [1, "2025-04-20", 40], [2, "2025-04-10", 99], [3, "2025-03-31", 500], [3, "2025-04-15", 70], [3, "2025-05-01", 500]]},
        ],
        result: {columns: ["product_name", "unit"], rows: [["Bolt Pack", 100]]},
        explanation: "Bolt Pack sold 60 + 40 = 100 in April. Glue sold 99. Tape sold only 70 in April; the lines on 31 March and 1 May do not count.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE catalog_items (product_id integer PRIMARY KEY, product_name text NOT NULL, product_category text);
CREATE TABLE order_lines (product_id integer NOT NULL, order_date date NOT NULL, unit integer);
INSERT INTO catalog_items VALUES (1, 'Bolt Pack', 'tools'), (2, 'Glue', 'craft'), (3, 'Tape', 'craft');
INSERT INTO order_lines VALUES (1, '2025-04-02', 60), (1, '2025-04-20', 40), (2, '2025-04-10', 99), (3, '2025-03-31', 500), (3, '2025-04-15', 70), (3, '2025-05-01', 500);`, ["product_name", "unit"], [["Bolt Pack", 100]]),
      t("first and last day of April count", `CREATE TABLE catalog_items (product_id integer PRIMARY KEY, product_name text NOT NULL, product_category text);
CREATE TABLE order_lines (product_id integer NOT NULL, order_date date NOT NULL, unit integer);
INSERT INTO catalog_items VALUES (1, 'A', NULL), (2, 'B', NULL), (3, 'C', NULL), (4, 'D', NULL);
INSERT INTO order_lines VALUES (1, '2025-04-01', 100), (2, '2025-04-30', 100), (3, '2025-05-01', 100), (4, '2025-03-31', 100);`, ["product_name", "unit"], [["A", 100], ["B", 100]]),
      t("unknown units add nothing", `CREATE TABLE catalog_items (product_id integer PRIMARY KEY, product_name text NOT NULL, product_category text);
CREATE TABLE order_lines (product_id integer NOT NULL, order_date date NOT NULL, unit integer);
INSERT INTO catalog_items VALUES (1, 'Solo', NULL), (2, 'Unknown', NULL);
INSERT INTO order_lines VALUES (1, '2025-04-05', NULL), (1, '2025-04-06', 120), (2, '2025-04-07', NULL);`, ["product_name", "unit"], [["Solo", 120]]),
      t("many small orders add up", `CREATE TABLE catalog_items (product_id integer PRIMARY KEY, product_name text NOT NULL, product_category text);
CREATE TABLE order_lines (product_id integer NOT NULL, order_date date NOT NULL, unit integer);
INSERT INTO catalog_items VALUES (1, 'Pen', NULL), (2, 'Cap', NULL);
INSERT INTO order_lines VALUES (1, '2025-04-03', 30), (1, '2025-04-09', 30), (1, '2025-04-12', 30), (1, '2025-04-28', 30), (2, '2025-04-03', 99);`, ["product_name", "unit"], [["Pen", 120]]),
      t("nothing reaches 100", `CREATE TABLE catalog_items (product_id integer PRIMARY KEY, product_name text NOT NULL, product_category text);
CREATE TABLE order_lines (product_id integer NOT NULL, order_date date NOT NULL, unit integer);
INSERT INTO catalog_items VALUES (1, 'A', NULL);
INSERT INTO order_lines VALUES (1, '2025-04-10', 99);`, ["product_name", "unit"], []),
    ],
    solution: `SELECT p.product_name, SUM(o.unit) AS unit
FROM order_lines o
JOIN catalog_items p ON p.product_id = o.product_id
WHERE o.order_date >= DATE '2025-04-01'
  AND o.order_date < DATE '2025-05-01'
GROUP BY p.product_id, p.product_name
HAVING SUM(o.unit) >= 100`,
    approaches: [
      {
        id: "join-filter-group-having",
        title: "Join, filter the month, GROUP BY, HAVING",
        optimal: true,
        explanation: "`WHERE` keeps only April rows before grouping, using a half-open range (`>=` the 1st, `<` the 1st of next month) that is correct whatever the time of day. `GROUP BY` the product and `HAVING SUM(unit) >= 100` keeps the big sellers. `SUM` skips NULLs. Grouping by `product_id` as well as the name keeps two products with the same name apart.",
        code: `SELECT p.product_name, SUM(o.unit) AS unit
FROM order_lines o
JOIN catalog_items p ON p.product_id = o.product_id
WHERE o.order_date >= DATE '2025-04-01'
  AND o.order_date < DATE '2025-05-01'
GROUP BY p.product_id, p.product_name
HAVING SUM(o.unit) >= 100`,
      },
      {
        id: "aggregate-then-join",
        title: "Total April units first, then join for the name",
        optimal: false,
        explanation: "A subquery totals units per product for April and keeps totals of 100 or more. The outer query joins it to the catalog for the name. It does the same work, and the join runs on fewer rows, but it is split in two layers.",
        code: `SELECT p.product_name, o.total AS unit
FROM (
  SELECT product_id, SUM(unit) AS total
  FROM order_lines
  WHERE order_date >= DATE '2025-04-01' AND order_date < DATE '2025-05-01'
  GROUP BY product_id
  HAVING SUM(unit) >= 100
) o
JOIN catalog_items p ON p.product_id = o.product_id`,
      },
    ],
    hints: [
      "Which clause filters rows by date, and which filters groups by their total?",
      "Is a total of exactly 100 enough?",
      "What does SUM do with NULL units?",
    ],
    clarify: [
      {question: "Are 1 April and 30 April included?", answer: "Yes."},
      {question: "Does the total count other months?", answer: "No. Only April 2025."},
    ],
    followUps: ["How would you show the best-selling product for every month of the year?"],
    mysqlNote: "In MySQL write the month filter as `order_date BETWEEN '2025-04-01' AND '2025-04-30'` for a `DATE` column, or `DATE_FORMAT(order_date, '%Y-%m') = '2025-04'`. The half-open range works there too. Postgres has `TO_CHAR(order_date, 'YYYY-MM')` for the second form.",
  },
  {
    kind: "sql",
    lc: 1517,
    topic: "sql-strings-regex-clause",
    title: "Find Users With Valid E-Mails",
    difficulty: "Easy",
    statement: `\`signups\` stores each user's e-mail address in \`mail\`, which may be \`NULL\`.

An address is **valid** when:

- the part **before** the \`@\` starts with a **letter** (A to Z, either case);
- the rest of that part uses only **letters, digits, underscore \`_\`, dot \`.\` and dash \`-\`**;
- the part **after** the \`@\` is exactly \`corp.example\`, in lower case, with nothing before or after it.

Return \`user_id\`, \`name\` and \`mail\` for the users with a valid address. The rows can come back in any order.

Use a Postgres **regular expression** (regex): a short pattern for text, tested with \`~\`.`,
    tables: [
      {name: "signups", columns: [{name: "user_id", type: "integer", pk: true}, {name: "name", type: "text"}, {name: "mail", type: "text", note: "May be NULL."}]},
    ],
    examples: [
      {
        tables: [{name: "signups", columns: ["user_id", "name", "mail"], rows: [[1, "Ana", "ana.b-c_9@corp.example"], [2, "Bo", "9bo@corp.example"], [3, "Cy", ".cy@corp.example"], [4, "Di", "di@gmail.com"], [5, "Ed", "ed+tag@corp.example"], [6, "Flo", "flo@corp.example"]]}],
        result: {columns: ["user_id", "name", "mail"], rows: [[1, "Ana", "ana.b-c_9@corp.example"], [6, "Flo", "flo@corp.example"]]},
        explanation: "Bo starts with a digit, Cy starts with a dot, Di uses another domain, and Ed uses a plus sign.",
      },
    ],
    tests: [
      t("sample", `CREATE TABLE signups (user_id integer PRIMARY KEY, name text NOT NULL, mail text);
INSERT INTO signups VALUES (1, 'Ana', 'ana.b-c_9@corp.example'), (2, 'Bo', '9bo@corp.example'), (3, 'Cy', '.cy@corp.example'), (4, 'Di', 'di@gmail.com'), (5, 'Ed', 'ed+tag@corp.example'), (6, 'Flo', 'flo@corp.example');`, ["user_id", "name", "mail"], [[1, "Ana", "ana.b-c_9@corp.example"], [6, "Flo", "flo@corp.example"]]),
      t("the domain must match exactly", `CREATE TABLE signups (user_id integer PRIMARY KEY, name text NOT NULL, mail text);
INSERT INTO signups VALUES (1, 'a', 'a@corpXexample'), (2, 'b', 'b@corp.example.org'), (3, 'c', 'c@CORP.EXAMPLE'), (4, 'd', 'd@x.corp.example'), (5, 'e', 'e@corp.example');`, ["user_id", "name", "mail"], [[5, "e", "e@corp.example"]]),
      t("characters before the @", `CREATE TABLE signups (user_id integer PRIMARY KEY, name text NOT NULL, mail text);
INSERT INTO signups VALUES (1, 'a', 'x+a@corp.example'), (2, 'b', 'a b@corp.example'), (3, 'c', 'a@b@corp.example'), (4, 'd', '_a@corp.example'), (5, 'e', '-a@corp.example'), (6, 'f', 'a-b_c.d@corp.example');`, ["user_id", "name", "mail"], [[6, "f", "a-b_c.d@corp.example"]]),
      t("upper-case letters are allowed before the @", `CREATE TABLE signups (user_id integer PRIMARY KEY, name text NOT NULL, mail text);
INSERT INTO signups VALUES (1, 'Hal', 'Hal@corp.example'), (2, 'Ivy', 'IVY_2@corp.example');`, ["user_id", "name", "mail"], [[1, "Hal", "Hal@corp.example"], [2, "Ivy", "IVY_2@corp.example"]]),
      t("unknown and empty addresses", `CREATE TABLE signups (user_id integer PRIMARY KEY, name text NOT NULL, mail text);
INSERT INTO signups VALUES (1, 'a', NULL), (2, 'b', ''), (3, 'c', '@corp.example');`, ["user_id", "name", "mail"], []),
    ],
    solution: `SELECT user_id, name, mail
FROM signups
WHERE mail ~ '^[A-Za-z][A-Za-z0-9_.-]*@corp\\.example$'`,
    approaches: [
      {
        id: "one-regex",
        title: "One regular expression with ~",
        optimal: true,
        explanation: "The operator `~` is true when the text matches the pattern. Read the pattern left to right: `^` start of the text; `[A-Za-z]` one letter; `[A-Za-z0-9_.-]*` any number (`*`) of letters, digits, `_`, `.` or `-`; `@` the at sign; `corp\\.example` the domain, where `\\.` means a real dot (a plain `.` would match any character); `$` end of the text. Without `^` and `$` the pattern could match just a piece of the address. `~` is case-sensitive; `~*` would ignore case and wrongly accept `CORP.EXAMPLE`.",
        code: `SELECT user_id, name, mail
FROM signups
WHERE mail ~ '^[A-Za-z][A-Za-z0-9_.-]*@corp\\.example$'`,
      },
      {
        id: "posix-classes",
        title: "POSIX character classes instead of ranges",
        optimal: false,
        explanation: "`[[:alpha:]]` means 'a letter' and `[[:alnum:]]` means 'a letter or digit'. The rest of the pattern is the same. It is a little easier to read, but it also accepts letters like e-acute, so it is wider than A to Z when the data contains accents.",
        code: `SELECT user_id, name, mail
FROM signups
WHERE mail ~ '^[[:alpha:]][[:alnum:]_.-]*@corp\\.example$'`,
      },
      {
        id: "like-plus-regex",
        title: "LIKE for the domain, regex for the name part",
        optimal: false,
        explanation: "`LIKE '%@corp.example'` checks the ending. Then `LEFT(mail, LENGTH(mail) - LENGTH('@corp.example'))` cuts off the domain, and a small regex checks what is left. Splitting the job makes each part simple, but it is longer and easy to get wrong when you count the characters to cut.",
        code: `SELECT user_id, name, mail
FROM signups
WHERE mail LIKE '%@corp.example'
  AND LEFT(mail, LENGTH(mail) - LENGTH('@corp.example')) ~ '^[A-Za-z][A-Za-z0-9_.-]*$'`,
      },
    ],
    hints: [
      "Which symbol means 'the start of the text' in a regex, and which means 'the end'?",
      "Why must the dot in the domain be written with a backslash?",
      "What does `*` do after a character class like `[A-Za-z0-9_.-]`?",
    ],
    clarify: [
      {question: "Can the part before the @ start with a digit?", answer: "No. It must start with a letter."},
      {question: "Is the domain case-sensitive?", answer: "Yes. It must be exactly corp.example in lower case."},
    ],
    followUps: ["How would you also accept a plus sign and tag after the name, like ed+tag, as long as the name starts with a letter?"],
    mysqlNote: "MySQL uses `REGEXP` instead of `~`: `WHERE mail REGEXP '^[A-Za-z][A-Za-z0-9_.-]*@corp\\\\.example$'`. Inside a MySQL string you must double the backslash, so the regex backslash becomes four characters in some tools. `REGEXP` ignores case by default in MySQL, so add `BINARY` to be case-sensitive.",
  },
];
