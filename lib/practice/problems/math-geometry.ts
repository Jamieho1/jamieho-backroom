/**
 * Arena problems: math-geometry. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
 * - 48 Rotate Image (Medium)
 * - 54 Spiral Matrix (Medium)
 * - 73 Set Matrix Zeroes (Medium)
 * - 202 Happy Number (Easy)
 * - 66 Plus One (Easy)
 * - 50 Pow(x, n) (Medium)
 * - 43 Multiply Strings (Medium)
 * - 2013 Detect Squares (Medium)
 */
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 48,
    kind: "algorithm",
    statement: `You get an \`n x n\` integer grid \`matrix\` (an image). Turn it **90 degrees clockwise**.

- Change \`matrix\` **in place**: do not build and return a second grid. The method returns nothing.
- After the turn, the old first row becomes the new last column, the old last row becomes the new first column, and so on.

The tests read \`matrix\` after your method returns.`,
    examples: [
      { input: "matrix = [[1, 2], [3, 4]]", output: "[[3, 1], [4, 2]]", explanation: "The left column [1, 3] read bottom-up becomes the top row." },
      { input: "matrix = [[7, 8, 9], [4, 5, 6], [1, 2, 3]]", output: "[[1, 4, 7], [2, 5, 8], [3, 6, 9]]" },
    ],
    constraints: ["1 <= n <= 20", "-1000 <= matrix[i][j] <= 1000"],
    signature: `class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        """
        Do not return anything, modify matrix in-place instead.
        """`,
    method: "rotate",
    driver: `def run(ns, args):
    m = args[0]
    ns["Solution"]().rotate(m)
    return m
`,
    tests: [
      { id: "ex1", input: "[[[1, 2], [3, 4]]]", expected: "[[3, 1], [4, 2]]", visible: true },
      { id: "ex2", input: "[[[7, 8, 9], [4, 5, 6], [1, 2, 3]]]", expected: "[[1, 4, 7], [2, 5, 8], [3, 6, 9]]", visible: true },
      { id: "single", input: "[[[5]]]", expected: "[[5]]", visible: false },
      { id: "negatives", input: "[[[-1, 0], [0, -1]]]", expected: "[[0, -1], [-1, 0]]", visible: false },
      { id: "four", input: "[[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]]", expected: "[[13, 9, 5, 1], [14, 10, 6, 2], [15, 11, 7, 3], [16, 12, 8, 4]]", visible: false },
      { id: "five", input: "[[[r * 5 + c for c in range(5)] for r in range(5)]]", expected: "[[20, 15, 10, 5, 0], [21, 16, 11, 6, 1], [22, 17, 12, 7, 2], [23, 18, 13, 8, 3], [24, 19, 14, 9, 4]]", visible: false },
      { id: "dups", input: "[[[2, 2, 3], [2, 2, 3], [1, 1, 1]]]", expected: "[[1, 2, 2], [1, 2, 2], [1, 3, 3]]", visible: false },
      { id: "big", input: "[[[r * 20 + c for c in range(20)] for r in range(20)]]", expected: "[[(19 - j) * 20 + i for j in range(20)] for i in range(20)]", visible: false },
    ],
    solution: `class Solution:
    def rotate(self, matrix: List[List[int]]) -> None:
        n = len(matrix)
        for r in range(n):
            for c in range(r + 1, n):
                matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
        for row in matrix:
            row.reverse()`,
    hints: ["Work out where cell (r, c) ends up: it moves to (c, n - 1 - r).", "A clockwise turn equals a transpose (swap across the main diagonal) followed by reversing each row.", "Alternatively rotate four cells at a time, layer by layer from the outside in."],
    clarify: [
      { question: "Can I allocate a new matrix?", answer: "No, change the given one in place." },
      { question: "Clockwise or counter-clockwise?", answer: "Clockwise." },
      { question: "Is it always square?", answer: "Yes, n x n." },
    ],
  },
  {
    lc: 54,
    kind: "algorithm",
    statement: `Given an \`m x n\` grid \`matrix\`, return all of its values in **clockwise spiral order**: start at the top-left cell, go right along the top row, down the right column, left along the bottom row, up the left column, then repeat on the remaining inner rectangle until every cell has been listed exactly once.`,
    examples: [
      { input: "matrix = [[1,2,3],[4,5,6],[7,8,9],[10,11,12]]", output: "[1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 5, 8]", explanation: "Outer ring 1,2,3,6,9,12,11,10,7,4 then the inner column 5,8." },
      { input: "matrix = [[4, -1], [0, 9]]", output: "[4, -1, 9, 0]" },
    ],
    constraints: ["1 <= m, n <= 10", "-100 <= matrix[i][j] <= 100"],
    signature: `class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:`,
    method: "spiralOrder",
    tests: [
      { id: "ex1", input: "[[[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]]]", expected: "[1, 2, 3, 6, 9, 12, 11, 10, 7, 4, 5, 8]", visible: true },
      { id: "ex2", input: "[[[4, -1], [0, 9]]]", expected: "[4, -1, 9, 0]", visible: true },
      { id: "single", input: "[[[42]]]", expected: "[42]", visible: false },
      { id: "one-row", input: "[[[1, 2, 3, 4, 5]]]", expected: "[1, 2, 3, 4, 5]", visible: false },
      { id: "one-col", input: "[[[1], [2], [3], [4]]]", expected: "[1, 2, 3, 4]", visible: false },
      { id: "wide", input: "[[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]]", expected: "[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]", visible: false },
      { id: "two-rows", input: "[[[1, 2, 3], [4, 5, 6]]]", expected: "[1, 2, 3, 6, 5, 4]", visible: false },
      { id: "two-cols", input: "[[[1, 2], [3, 4], [5, 6], [7, 8]]]", expected: "[1, 2, 4, 6, 8, 7, 5, 3]", visible: false },
      { id: "six", input: "[[[r * 6 + c for c in range(6)] for r in range(6)]]", expected: "[0, 1, 2, 3, 4, 5, 11, 17, 23, 29, 35, 34, 33, 32, 31, 30, 24, 18, 12, 6, 7, 8, 9, 10, 16, 22, 28, 27, 26, 25, 19, 13, 14, 15, 21, 20]", visible: false },
      { id: "row-10", input: "[[list(range(10))]]", expected: "[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]", visible: false },
      { id: "big", input: "[[[r * 10 + c for c in range(10)] for r in range(10)]]", expected: "[0,1,2,3,4,5,6,7,8,9,19,29,39,49,59,69,79,89,99,98,97,96,95,94,93,92,91,90,80,70,60,50,40,30,20,10,11,12,13,14,15,16,17,18,28,38,48,58,68,78,88,87,86,85,84,83,82,81,71,61,51,41,31,21,22,23,24,25,26,27,37,47,57,67,77,76,75,74,73,72,62,52,42,32,33,34,35,36,46,56,66,65,64,63,53,43,44,45,55,54]", visible: false },
    ],
    solution: `class Solution:
    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:
        res = []
        top, bottom = 0, len(matrix) - 1
        left, right = 0, len(matrix[0]) - 1
        while top <= bottom and left <= right:
            for c in range(left, right + 1):
                res.append(matrix[top][c])
            top += 1
            for r in range(top, bottom + 1):
                res.append(matrix[r][right])
            right -= 1
            if top <= bottom:
                for c in range(right, left - 1, -1):
                    res.append(matrix[bottom][c])
                bottom -= 1
            if left <= right:
                for r in range(bottom, top - 1, -1):
                    res.append(matrix[r][left])
                left += 1
        return res`,
    hints: ["Keep four boundaries: top, bottom, left, right.", "Walk one side, then pull that boundary inward.", "Before walking the bottom row and left column, check the boundaries haven't crossed, or a single row/column is listed twice."],
    clarify: [
      { question: "Which direction is the spiral?", answer: "Clockwise, starting rightwards from the top-left." },
      { question: "Can the grid be non-square?", answer: "Yes, any m x n." },
      { question: "Is every value listed once?", answer: "Yes, exactly once each." },
    ],
  },
  {
    lc: 73,
    kind: "algorithm",
    statement: `You get an \`m x n\` integer grid \`matrix\`. For every cell that **originally** holds \`0\`, set its entire row and its entire column to \`0\`.

- Modify \`matrix\` **in place**; the method returns nothing.
- Only zeros present in the input trigger clearing. Zeros you write along the way must not spread further.
- Follow-up: can you do it with O(1) extra space?

The tests read \`matrix\` after your method returns.`,
    examples: [
      { input: "matrix = [[5, 1, 2], [3, 0, 4], [6, 7, 8]]", output: "[[5, 0, 2], [0, 0, 0], [6, 0, 8]]", explanation: "The 0 at (1, 1) clears row 1 and column 1." },
      { input: "matrix = [[0, 2, 3, 4], [5, 6, 7, 0], [1, 1, 1, 1]]", output: "[[0, 0, 0, 0], [0, 0, 0, 0], [0, 1, 1, 0]]" },
    ],
    constraints: ["1 <= m, n <= 200", "-2^31 <= matrix[i][j] <= 2^31 - 1"],
    signature: `class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        """
        Do not return anything, modify matrix in-place instead.
        """`,
    method: "setZeroes",
    driver: `def run(ns, args):
    m = args[0]
    ns["Solution"]().setZeroes(m)
    return m
`,
    tests: [
      { id: "ex1", input: "[[[5, 1, 2], [3, 0, 4], [6, 7, 8]]]", expected: "[[5, 0, 2], [0, 0, 0], [6, 0, 8]]", visible: true },
      { id: "ex2", input: "[[[0, 2, 3, 4], [5, 6, 7, 0], [1, 1, 1, 1]]]", expected: "[[0, 0, 0, 0], [0, 0, 0, 0], [0, 1, 1, 0]]", visible: true },
      { id: "no-zero", input: "[[[1, 2], [3, 4]]]", expected: "[[1, 2], [3, 4]]", visible: false },
      { id: "single-zero", input: "[[[0]]]", expected: "[[0]]", visible: false },
      { id: "single-row", input: "[[[3, 0, 5, 6]]]", expected: "[[0, 0, 0, 0]]", visible: false },
      { id: "single-col", input: "[[[4], [0], [9]]]", expected: "[[0], [0], [0]]", visible: false },
      { id: "corner", input: "[[[1, 2, 3], [4, 5, 6], [7, 8, 0]]]", expected: "[[1, 2, 0], [4, 5, 0], [0, 0, 0]]", visible: false },
      { id: "first-row-col", input: "[[[1, 0, 3], [4, 5, 6], [0, 8, 9]]]", expected: "[[0, 0, 0], [0, 0, 6], [0, 0, 0]]", visible: false },
      { id: "all-zero", input: "[[[0, 0], [0, 0]]]", expected: "[[0, 0], [0, 0]]", visible: false },
      { id: "big", input: "[[[0 if (r, c) in ((3, 7), (150, 120)) else r + c + 1 for c in range(200)] for r in range(200)]]", expected: "[[0 if r in (3, 150) or c in (7, 120) else r + c + 1 for c in range(200)] for r in range(200)]", visible: false },
    ],
    solution: `class Solution:
    def setZeroes(self, matrix: List[List[int]]) -> None:
        rows, cols = len(matrix), len(matrix[0])
        row_zero = False
        for r in range(rows):
            for c in range(cols):
                if matrix[r][c] == 0:
                    matrix[0][c] = 0
                    if r > 0:
                        matrix[r][0] = 0
                    else:
                        row_zero = True
        for r in range(1, rows):
            for c in range(1, cols):
                if matrix[0][c] == 0 or matrix[r][0] == 0:
                    matrix[r][c] = 0
        if matrix[0][0] == 0:
            for r in range(rows):
                matrix[r][0] = 0
        if row_zero:
            for c in range(cols):
                matrix[0][c] = 0`,
    hints: ["First record which rows and columns must be cleared, then clear them; clearing while scanning makes zeros spread.", "Sets of row and column indexes give an easy O(m + n) space solution.", "For O(1) space, use the first row and first column as the markers, with one extra flag for the first row itself."],
    clarify: [
      { question: "Do newly written zeros cause more clearing?", answer: "No, only zeros in the original input count." },
      { question: "Should I return the matrix?", answer: "No, modify it in place." },
      { question: "Can the grid be a single row or column?", answer: "Yes." },
    ],
  },
  {
    lc: 202,
    kind: "algorithm",
    statement: `Start from a positive integer \`n\` and repeatedly replace it with the **sum of the squares of its decimal digits**.

The number is **happy** if this process eventually reaches \`1\` (after which it stays at 1). Otherwise the values fall into a loop that never contains \`1\`.

Return \`True\` if \`n\` is happy and \`False\` if not.`,
    examples: [
      { input: "n = 13", output: "True", explanation: "1² + 3² = 10, then 1² + 0² = 1." },
      { input: "n = 4", output: "False", explanation: "4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4 loops forever without reaching 1." },
    ],
    constraints: ["1 <= n <= 2^31 - 1"],
    signature: `class Solution:
    def isHappy(self, n: int) -> bool:`,
    method: "isHappy",
    tests: [
      { id: "ex1", input: "[13]", expected: "True", visible: true },
      { id: "ex2", input: "[4]", expected: "False", visible: true },
      { id: "one", input: "[1]", expected: "True", visible: false },
      { id: "seven", input: "[7]", expected: "True", visible: false },
      { id: "two", input: "[2]", expected: "False", visible: false },
      { id: "hundred", input: "[100]", expected: "True", visible: false },
      { id: "happy-19", input: "[19]", expected: "True", visible: false },
      { id: "unhappy-20", input: "[20]", expected: "False", visible: false },
      { id: "big", input: "[2147483647]", expected: "False", visible: false },
      { id: "big-happy", input: "[1111111]", expected: "True", visible: false },
    ],
    solution: `class Solution:
    def isHappy(self, n: int) -> bool:
        seen = set()
        while n != 1 and n not in seen:
            seen.add(n)
            total = 0
            while n:
                d = n % 10
                total += d * d
                n //= 10
            n = total
        return n == 1`,
    hints: ["Simulate the digit-square step. The only question is how to notice you are going round in circles.", "Keep a set of values already seen; seeing one again means a loop.", "For O(1) space, use slow/fast pointers (Floyd's cycle detection) on the sequence."],
    clarify: [
      { question: "Does reaching 1 end the process?", answer: "Yes, 1 maps to itself, so the number is happy." },
      { question: "Can the values grow forever?", answer: "No, the digit-square sum of a large number is much smaller, so the sequence always ends up in a cycle." },
      { question: "Is n always positive?", answer: "Yes." },
    ],
  },
  {
    lc: 66,
    kind: "algorithm",
    statement: `A non-negative integer is stored as a list \`digits\`, most significant digit first, one decimal digit per element. There are no leading zeros (except for the number 0 itself, which would be \`[0]\`).

Add **one** to the number and return the result in the same digit-list format.`,
    examples: [
      { input: "digits = [4, 0, 7]", output: "[4, 0, 8]", explanation: "407 + 1 = 408." },
      { input: "digits = [2, 9, 9]", output: "[3, 0, 0]", explanation: "299 + 1 = 300: the carry runs through both 9s." },
      { input: "digits = [9]", output: "[1, 0]", explanation: "9 + 1 = 10 needs an extra digit." },
    ],
    constraints: ["1 <= digits.length <= 100", "0 <= digits[i] <= 9", "No leading zeros"],
    signature: `class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:`,
    method: "plusOne",
    tests: [
      { id: "ex1", input: "[[4, 0, 7]]", expected: "[4, 0, 8]", visible: true },
      { id: "ex2", input: "[[2, 9, 9]]", expected: "[3, 0, 0]", visible: true },
      { id: "ex3", input: "[[9]]", expected: "[1, 0]", visible: true },
      { id: "zero", input: "[[0]]", expected: "[1]", visible: false },
      { id: "all-nines", input: "[[9, 9, 9, 9]]", expected: "[1, 0, 0, 0, 0]", visible: false },
      { id: "no-carry", input: "[[1, 2, 3, 4]]", expected: "[1, 2, 3, 5]", visible: false },
      { id: "mid-nine", input: "[[8, 9, 0]]", expected: "[8, 9, 1]", visible: false },
      { id: "one-carry", input: "[[1, 9]]", expected: "[2, 0]", visible: false },
      { id: "big-nines", input: "[[9] * 100]", expected: "[1] + [0] * 100", visible: false },
      { id: "big", input: "[[(i * 7) % 10 for i in range(1, 100)] + [9]]", expected: "[(i * 7) % 10 for i in range(1, 99)] + [4, 0]", visible: false },
    ],
    solution: `class Solution:
    def plusOne(self, digits: List[int]) -> List[int]:
        for i in range(len(digits) - 1, -1, -1):
            if digits[i] < 9:
                digits[i] += 1
                return digits
            digits[i] = 0
        return [1] + digits`,
    hints: ["Work from the last digit, just like adding by hand.", "A digit below 9 absorbs the carry and you can stop; a 9 becomes 0 and the carry moves left.", "If every digit was 9, the answer is 1 followed by zeros."],
    clarify: [
      { question: "Can the number be zero?", answer: "Yes, [0] becomes [1]." },
      { question: "Can the result be longer than the input?", answer: "Yes, when every digit is 9." },
      { question: "May I modify the input list?", answer: "Yes, returning it after changing it is fine." },
    ],
  },
  {
    lc: 50,
    kind: "algorithm",
    statement: `Compute \`x\` raised to the integer power \`n\` (that is, xⁿ) **without** using a built-in power function or \`**\`.

- \`n\` can be negative (x⁻ⁿ = 1 / xⁿ) or zero (x⁰ = 1).
- \`n\` can be as large as about two billion in absolute value, so multiplying \`x\` by itself \`n\` times is too slow: aim for **O(log |n|)** multiplications.

Answers are compared after rounding to 5 decimal places.`,
    examples: [
      { input: "x = 3.0, n = 4", output: "81.0" },
      { input: "x = 2.5, n = -2", output: "0.16", explanation: "2.5⁻² = 1 / 6.25 = 0.16." },
    ],
    constraints: ["-100.0 < x < 100.0", "-2^31 <= n <= 2^31 - 1", "If x is 0 then n > 0", "-10^4 <= xⁿ <= 10^4"],
    signature: `class Solution:
    def myPow(self, x: float, n: int) -> float:`,
    method: "myPow",
    driver: `def run(ns, args):
    return round(ns["Solution"]().myPow(*args), 5)
`,
    tests: [
      { id: "ex1", input: "[3.0, 4]", expected: "81.0", visible: true },
      { id: "ex2", input: "[2.5, -2]", expected: "0.16", visible: true },
      { id: "zero-exp", input: "[7.3, 0]", expected: "1.0", visible: false },
      { id: "neg-base-odd", input: "[-2.0, 3]", expected: "-8.0", visible: false },
      { id: "neg-base-even", input: "[-2.0, 4]", expected: "16.0", visible: false },
      { id: "zero-base", input: "[0.0, 5]", expected: "0.0", visible: false },
      { id: "one-min-n", input: "[1.0, -2147483648]", expected: "1.0", visible: false },
      { id: "neg-one-min-n", input: "[-1.0, -2147483648]", expected: "1.0", visible: false },
      { id: "tiny", input: "[2.0, -2147483648]", expected: "0.0", visible: false },
      { id: "big-n", input: "[1.00001, 200000]", expected: "7.38898", visible: false },
    ],
    solution: `class Solution:
    def myPow(self, x: float, n: int) -> float:
        if n < 0:
            x, n = 1 / x, -n
        res = 1.0
        while n > 0:
            if n & 1:
                res *= x
            x *= x
            n >>= 1
        return res`,
    hints: ["xⁿ = (x²)^(n/2) when n is even, and x · xⁿ⁻¹ when it's odd.", "That halves n each step, giving O(log n) multiplications (fast exponentiation).", "Handle negative n by inverting x and using -n."],
    clarify: [
      { question: "Can n be negative?", answer: "Yes; then the result is 1 / x^|n|." },
      { question: "How precise must the answer be?", answer: "It is compared after rounding to 5 decimal places." },
      { question: "Can I use ** or pow()?", answer: "No, implement the exponentiation yourself." },
    ],
  },
  {
    lc: 43,
    kind: "algorithm",
    statement: `Two non-negative integers are given as decimal strings \`num1\` and \`num2\`. Return their **product**, also as a decimal string.

- You may **not** convert the whole strings to integers (no \`int(num1)\`, no big-integer library). Work digit by digit.
- Neither input has leading zeros unless it is exactly \`"0"\`, and the output must not have leading zeros either (a zero product is \`"0"\`).`,
    examples: [
      { input: "num1 = \"12\", num2 = \"34\"", output: "\"408\"", explanation: "12 × 34 = 408." },
      { input: "num1 = \"605\", num2 = \"0\"", output: "\"0\"" },
    ],
    constraints: ["1 <= num1.length, num2.length <= 200", "Both contain only digits", "No leading zeros except the number 0 itself"],
    signature: `class Solution:
    def multiply(self, num1: str, num2: str) -> str:`,
    method: "multiply",
    tests: [
      { id: "ex1", input: "[\"12\", \"34\"]", expected: "\"408\"", visible: true },
      { id: "ex2", input: "[\"605\", \"0\"]", expected: "\"0\"", visible: true },
      { id: "zero-first", input: "[\"0\", \"77\"]", expected: "\"0\"", visible: false },
      { id: "ones", input: "[\"1\", \"1\"]", expected: "\"1\"", visible: false },
      { id: "carry", input: "[\"99\", \"99\"]", expected: "\"9801\"", visible: false },
      { id: "single-digits", input: "[\"9\", \"8\"]", expected: "\"72\"", visible: false },
      { id: "uneven", input: "[\"123456789\", \"987\"]", expected: "\"121851850743\"", visible: false },
      { id: "tens", input: "[\"1000\", \"250\"]", expected: "\"250000\"", visible: false },
      { id: "big", input: "[\"9\" * 200, \"9\" * 200]", expected: "\"9\" * 199 + \"8\" + \"0\" * 199 + \"1\"", visible: false },
    ],
    solution: `class Solution:
    def multiply(self, num1: str, num2: str) -> str:
        if num1 == "0" or num2 == "0":
            return "0"
        m, n = len(num1), len(num2)
        res = [0] * (m + n)
        for i in range(m - 1, -1, -1):
            for j in range(n - 1, -1, -1):
                p = (ord(num1[i]) - 48) * (ord(num2[j]) - 48) + res[i + j + 1]
                res[i + j + 1] = p % 10
                res[i + j] += p // 10
        return "".join(map(str, res)).lstrip("0")`,
    hints: ["The product of an m-digit and an n-digit number has at most m + n digits.", "Digit i of num1 times digit j of num2 lands at position i + j + 1 of the result (counting from the left).", "Accumulate into that slot, keep the last digit there and push the carry to i + j; strip leading zeros at the end."],
    clarify: [
      { question: "Can I convert to int and multiply?", answer: "No, the point is to do digit-by-digit multiplication." },
      { question: "What if one input is \"0\"?", answer: "Return \"0\" with no leading zeros." },
      { question: "Can inputs be negative?", answer: "No, both are non-negative." },
    ],
  },
  {
    lc: 2013,
    kind: "class_design",
    statement: `Points on a 2D grid arrive one at a time. Implement \`DetectSquares\`:

- \`DetectSquares()\` starts with no points.
- \`add(point)\` stores \`point = [x, y]\`. The same coordinates may be added several times; **each copy counts as a separate point**.
- \`count(point)\` takes a query point \`[qx, qy]\` (which is **not** added) and returns how many ways you can pick **three stored points** that, together with the query point, form an **axis-aligned square with positive area** (sides parallel to the x and y axes, side length > 0).

Tests use the operation-list format: the first list names the calls, the second gives each call's arguments; the expected output lists each return value (\`None\` for the constructor and \`add\`).`,
    examples: [
      { input: "ops = [\"DetectSquares\",\"add\",\"add\",\"add\",\"count\",\"add\",\"count\",\"count\"], args = [[],[[2,2]],[[2,5]],[[5,2]],[[5,5]],[[5,5]],[[2,2]],[[4,4]]]", output: "[None, None, None, None, 1, None, 1, 0]", explanation: "(5,5) completes the square with side 3; once (5,5) is stored, (2,2) can be completed too. (4,4) has no matching corners." },
      { input: "ops = [\"DetectSquares\",\"add\",\"add\",\"add\",\"add\",\"count\"], args = [[],[[0,1]],[[1,0]],[[1,1]],[[1,1]],[[0,0]]]", output: "[None, None, None, None, None, 2]", explanation: "(1,1) was added twice, so there are 2 ways." },
    ],
    constraints: ["point.length == 2", "0 <= x, y <= 1000", "At most 3000 calls to add and count in total"],
    signature: `class DetectSquares:

    def __init__(self):


    def add(self, point: List[int]) -> None:


    def count(self, point: List[int]) -> int:`,
    method: "DetectSquares",
    driver: `def run(ns, args):
    return replay(ns, args[0], args[1])
`,
    tests: [
      { id: "ex1", input: "[[\"DetectSquares\", \"add\", \"add\", \"add\", \"count\", \"add\", \"count\", \"count\"], [[], [[2, 2]], [[2, 5]], [[5, 2]], [[5, 5]], [[5, 5]], [[2, 2]], [[4, 4]]]]", expected: "[None, None, None, None, 1, None, 1, 0]", visible: true },
      { id: "ex2", input: "[[\"DetectSquares\", \"add\", \"add\", \"add\", \"add\", \"count\"], [[], [[0, 1]], [[1, 0]], [[1, 1]], [[1, 1]], [[0, 0]]]]", expected: "[None, None, None, None, None, 2]", visible: true },
      { id: "empty", input: "[[\"DetectSquares\", \"count\"], [[], [[3, 3]]]]", expected: "[None, 0]", visible: false },
      { id: "zero-area", input: "[[\"DetectSquares\", \"add\", \"add\", \"add\", \"count\"], [[], [[1, 1]], [[1, 1]], [[1, 1]], [[1, 1]]]]", expected: "[None, None, None, None, 0]", visible: false },
      { id: "rectangle", input: "[[\"DetectSquares\", \"add\", \"add\", \"add\", \"count\"], [[], [[0, 0]], [[0, 2]], [[3, 0]], [[3, 2]]]]", expected: "[None, None, None, None, 0]", visible: false },
      { id: "four-directions", input: "[[\"DetectSquares\", \"add\", \"add\", \"add\", \"add\", \"add\", \"add\", \"add\", \"add\", \"count\"], [[], [[4, 5]], [[5, 4]], [[5, 5]], [[3, 4]], [[3, 5]], [[4, 3]], [[5, 3]], [[3, 3]], [[4, 4]]]]", expected: "[None, None, None, None, None, None, None, None, None, 4]", visible: false },
      { id: "multiplicity", input: "[[\"DetectSquares\", \"add\", \"add\", \"add\", \"add\", \"add\", \"add\", \"count\"], [[], [[10, 10]], [[10, 10]], [[10, 20]], [[10, 20]], [[20, 10]], [[20, 10]], [[20, 20]]]]", expected: "[None, None, None, None, None, None, None, 8]", visible: false },
      { id: "query-not-added", input: "[[\"DetectSquares\", \"add\", \"add\", \"add\", \"count\", \"count\"], [[], [[0, 0]], [[0, 7]], [[7, 0]], [[7, 7]], [[7, 7]]]]", expected: "[None, None, None, None, 1, 1]", visible: false },
      { id: "big", input: "[[\"DetectSquares\"] + [\"add\"] * 1200 + [\"count\", \"count\"], [[]] + [[[x, y]] for x in range(0, 300, 10) for y in range(0, 400, 10)] + [[[150, 150]], [[1000, 1000]]]]", expected: "[None] * 1201 + [58, 0]", visible: false },
    ],
    solution: `class DetectSquares:

    def __init__(self):
        self.cnt = {}

    def add(self, point: List[int]) -> None:
        key = (point[0], point[1])
        self.cnt[key] = self.cnt.get(key, 0) + 1

    def count(self, point: List[int]) -> int:
        px, py = point
        res = 0
        for (x, y), c in list(self.cnt.items()):
            if abs(px - x) != abs(py - y) or x == px:
                continue
            res += c * self.cnt.get((x, py), 0) * self.cnt.get((px, y), 0)
        return res`,
    hints: ["Fix the query point; the corner diagonally opposite it determines the whole square.", "Loop over stored points (x, y) with |x - qx| == |y - qy| != 0 and treat each as that diagonal corner.", "Multiply the counts of the diagonal point and the two remaining corners (x, qy) and (qx, y), since duplicates multiply the ways."],
    clarify: [
      { question: "Do repeated points count separately?", answer: "Yes, each added copy is a different point, so counts multiply." },
      { question: "Is the query point stored?", answer: "No, count does not add it." },
      { question: "Do squares need to be axis-aligned?", answer: "Yes, sides parallel to the axes and with positive length." },
    ],
  },
];
