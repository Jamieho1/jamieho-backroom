/**
 * math-geometry: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
 * - 48 Rotate Image (Medium)
 * - 54 Spiral Matrix (Medium)
 * - 73 Set Matrix Zeroes (Medium)
 * - 202 Happy Number (Easy)
 * - 66 Plus One (Easy)
 * - 50 Pow(x, n) (Medium)
 * - 43 Multiply Strings (Medium)
 * - 2013 Detect Squares (Medium)
 */
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));
const fill = (cells: [string, string | number][]) => cells.map(([at, value]) => ({ at, value }));

export const variations: Variation[] = [
  {
    id: "matrix-walk",
    topic: "math-geometry",
    name: "Matrix index tricks",
    change: "Base pattern. No clever data structure: get the ==index arithmetic== right (swap across the diagonal, shrink four boundaries, reuse row 0 / column 0 as marker storage).",
    problems: [48, 54, 73],
  },
  {
    id: "digit-math",
    topic: "math-geometry",
    name: "Digit by digit",
    change: "Work on ==one digit at a time with a carry==, the way you'd do it on paper, instead of converting the whole number.",
    problems: [202, 66, 43],
  },
  {
    id: "fast-power",
    topic: "math-geometry",
    name: "Halve the exponent",
    change: "Instead of n multiplications, ==square the base and halve the exponent== each step, so it takes O(log n).",
    problems: [50],
  },
  {
    id: "point-hash",
    topic: "math-geometry",
    name: "Geometry with a point counter",
    change: "Store points in a ==hash map of (x, y) → count==, then fix one corner and look the other corners up in O(1).",
    problems: [2013],
  },
];

export const solutions: Solution[] = [
  {
    lc: 48,
    variation: "matrix-walk",
    question: "Turn a square matrix 90° clockwise, changing it in place rather than building a new one.",
    intuition: `A clockwise turn sends \`(r, c)\` to \`(c, n - 1 - r)\`. That's two easy in-place moves: ==transpose (swap \`[r][c]\` with \`[c][r]\`), then reverse every row==. Each step only swaps pairs, so no extra matrix is needed.`,
    algorithm: `1. Transpose: for each \`r\`, for each \`c > r\`:
   * ==Swap \`matrix[r][c]\` and \`matrix[c][r]\`== (only above the diagonal, or you swap back).
2. ==Reverse each row== in place.`,
    visual: {
      kind: "grid",
      title: "Rotate image · 3 × 3",
      rows: [
        ["a", "b", "c"],
        ["d", "e", "f"],
        ["g", "h", "i"],
      ],
      frames: [
        { caption: "Start. The diagonal (a, e, i) stays put during the transpose.", highlight: ["0,0", "1,1", "2,2"] },
        { caption: "Transpose: swap (0,1) ↔ (1,0) → b and d trade places.", cells: fill([["0,1", "d"], ["1,0", "b"]]), highlight: ["0,1", "1,0"] },
        { caption: "Swap (0,2) ↔ (2,0) and (1,2) ↔ (2,1). Rows are now the old columns.", cells: fill([["0,2", "g"], ["2,0", "c"], ["1,2", "h"], ["2,1", "f"]]), highlight: ["0,2", "2,0", "1,2", "2,1"] },
        { caption: "Reverse row 0: a d g → g d a. That's the old left column read bottom-up.", cells: fill([["0,0", "g"], ["0,2", "a"]]), highlight: ["0,0", "0,1", "0,2"] },
        { caption: "Reverse rows 1 and 2. The matrix is rotated 90° clockwise.", cells: fill([["1,0", "h"], ["1,2", "b"], ["2,0", "i"], ["2,2", "c"]]), done: ["0,0", "0,1", "0,2", "1,0", "1,1", "1,2", "2,0", "2,1", "2,2"] },
      ],
    },
    code: `def rotate(matrix: list[list[int]]) -> None:
    n = len(matrix)
    for r in range(n):
        for c in range(r + 1, n):
            matrix[r][c], matrix[c][r] = matrix[c][r], matrix[r][c]
    for row in matrix:
        row.reverse()`,
    complexity: "Time O(n²) · Space O(1)",
  },
  {
    lc: 54,
    variation: "matrix-walk",
    question: "Return all the values of a matrix in clockwise spiral order, starting at the top-left.",
    intuition: `Keep ==four walls: \`top\`, \`bottom\`, \`left\`, \`right\`==. Walk along the top wall, then the right, bottom and left, ==moving each wall inward right after you use it==. Re-check the walls before the bottom and left legs, or a single remaining row/column gets read twice.`,
    algorithm: `1. Set \`top = 0\`, \`bottom = rows - 1\`, \`left = 0\`, \`right = cols - 1\`.
2. While \`top <= bottom\` and \`left <= right\`:
   * Read row \`top\` from \`left\` to \`right\`, then \`top += 1\`.
   * Read column \`right\` from \`top\` to \`bottom\`, then \`right -= 1\`.
   * ==If \`top <= bottom\`==: read row \`bottom\` from \`right\` to \`left\`, then \`bottom -= 1\`.
   * ==If \`left <= right\`==: read column \`left\` from \`bottom\` to \`top\`, then \`left += 1\`.
3. Return \`res\`.`,
    visual: {
      kind: "grid",
      title: "Spiral matrix · reads 1 to 9",
      rows: [
        [1, 2, 3],
        [8, 9, 4],
        [7, 6, 5],
      ],
      frames: [
        { caption: "Top row left → right, then the top wall moves down.", highlight: ["0,0", "0,1", "0,2"], vars: kv({ res: "[1, 2, 3]", walls: "top 1, bottom 2, left 0, right 2" }) },
        { caption: "Right column top → bottom, then the right wall moves left.", highlight: ["1,2", "2,2"], done: ["0,0", "0,1", "0,2"], vars: kv({ res: "[1 … 5]", walls: "top 1, bottom 2, left 0, right 1" }) },
        { caption: "top ≤ bottom, so read the bottom row right → left.", highlight: ["2,1", "2,0"], done: ["0,0", "0,1", "0,2", "1,2", "2,2"], vars: kv({ res: "[1 … 7]", walls: "top 1, bottom 1, left 0, right 1" }) },
        { caption: "left ≤ right, so read the left column bottom → top.", highlight: ["1,0"], done: ["0,0", "0,1", "0,2", "1,2", "2,2", "2,1", "2,0"], vars: kv({ res: "[1 … 8]", walls: "top 1, bottom 1, left 1, right 1" }) },
        { caption: "Next lap: the walls meet on the centre. Read 9; walls cross → stop.", highlight: ["1,1"], done: ["0,0", "0,1", "0,2", "1,2", "2,2", "2,1", "2,0", "1,0"], vars: kv({ answer: "[1, 2, 3, 4, 5, 6, 7, 8, 9]" }) },
      ],
    },
    code: `def spiralOrder(matrix: list[list[int]]) -> list[int]:
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
    complexity: "Time O(m · n) · Space O(1) besides the output",
  },
  {
    lc: 73,
    variation: "matrix-walk",
    question: "Wherever a matrix holds a 0, wipe that cell's whole row and column to 0, in place and with O(1) extra space.",
    intuition: `You need to remember which rows and columns to clear, but can't use extra arrays. So ==use row 0 and column 0 as the marker arrays==. They overlap at \`[0][0]\`, so let \`[0][0]\` mark column 0 and keep ==one extra flag \`rowZero\`== for row 0. Clear the inside first, then column 0, then row 0, so markers aren't wiped before they're read.`,
    algorithm: `1. Scan every cell; for each 0 at \`(r, c)\`:
   * Mark the column: \`matrix[0][c] = 0\`.
   * Mark the row: \`matrix[r][0] = 0\` if \`r > 0\`, else ==set \`rowZero = True\`==.
2. For every \`r >= 1\`, \`c >= 1\`: if ==\`matrix[0][c] == 0\` or \`matrix[r][0] == 0\`==, set the cell to 0.
3. If \`matrix[0][0] == 0\`, zero column 0.
4. If \`rowZero\`, zero row 0.`,
    visual: {
      kind: "grid",
      title: "Set matrix zeroes · markers in row 0 / column 0",
      rows: [
        [1, 0, 3],
        [4, 5, 6],
        [0, 8, 9],
      ],
      frames: [
        { caption: "0 at (0,1): mark column 1 (already 0). It's in row 0 → rowZero = True.", highlight: ["0,1"], vars: kv({ rowZero: "True" }) },
        { caption: "0 at (2,0): mark column 0 via [0][0] and row 2 via [2][0] (already 0).", cells: fill([["0,0", 0]]), highlight: ["2,0", "0,0"], vars: kv({ rowZero: "True", "col markers": "[0][0], [0][1]", "row markers": "[2][0]" }) },
        { caption: "Inside cells: column 1 is marked → (1,1), (2,1) = 0. Row 2 is marked → (2,2) = 0. (1,2) has no marker → stays 6.", cells: fill([["1,1", 0], ["2,1", 0], ["2,2", 0]]), highlight: ["1,1", "2,1", "2,2"], done: ["1,2"] },
        { caption: "[0][0] is 0 → zero column 0.", cells: fill([["1,0", 0]]), highlight: ["0,0", "1,0", "2,0"] },
        { caption: "rowZero → zero row 0 last. Only 6 survives.", cells: fill([["0,2", 0]]), highlight: ["0,0", "0,1", "0,2"], vars: kv({ answer: "[[0,0,0],[0,0,6],[0,0,0]]" }) },
      ],
    },
    code: `def setZeroes(matrix: list[list[int]]) -> None:
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
    complexity: "Time O(m · n) · Space O(1)",
  },
  {
    lc: 202,
    variation: "digit-math",
    question: "Keep replacing a number by the sum of the squares of its digits; say whether it eventually reaches 1.",
    intuition: `The sequence either reaches 1 or ==falls into a loop== (the values stay small, so it must repeat). Keep a set of numbers you've seen: ==a repeat means a loop, so it never reaches 1==. Floyd's fast/slow pointers works too, with O(1) space.`,
    algorithm: `1. Create an empty set \`seen\`.
2. While \`n != 1\` and ==\`n\` is not in \`seen\`==:
   * Add \`n\` to \`seen\`.
   * Replace \`n\` with the ==sum of the squares of its digits== (\`n % 10\`, then \`n //= 10\`).
3. Return \`n == 1\`.`,
    visual: {
      kind: "array",
      title: "Happy number · start at 7",
      values: [7, 49, 97, 130, 10, 1],
      frames: [
        { caption: "7 → 7² = 49.", pointers: [{ name: "n", index: 0 }], highlight: [0], vars: kv({ seen: "{7}" }) },
        { caption: "49 → 16 + 81 = 97.", pointers: [{ name: "n", index: 1 }], highlight: [1], done: [0], vars: kv({ seen: "{7, 49}" }) },
        { caption: "97 → 81 + 49 = 130.", pointers: [{ name: "n", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ seen: "{7, 49, 97}" }) },
        { caption: "130 → 1 + 9 + 0 = 10.", pointers: [{ name: "n", index: 3 }], highlight: [3], done: [0, 1, 2], vars: kv({ seen: "{7, 49, 97, 130}" }) },
        { caption: "10 → 1 + 0 = 1. Reached 1 before any repeat → happy.", pointers: [{ name: "n", index: 5 }], highlight: [5], done: [0, 1, 2, 3, 4], vars: kv({ answer: "True" }) },
      ],
    },
    code: `def isHappy(n: int) -> bool:
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
    complexity: "Time O(log n) per step, few steps · Space O(log n)",
  },
  {
    lc: 66,
    variation: "digit-math",
    question: "A number is stored as a list of its digits (most significant first); return the digit list of that number plus one.",
    intuition: `Add 1 from the right, like on paper. ==A digit below 9 just goes up by one and you're done==. A 9 becomes 0 and the carry moves left. If ==every digit was 9==, the result is a 1 followed by zeros.`,
    algorithm: `1. For \`i\` from the last index down to 0:
   * If ==\`digits[i] < 9\`==: add 1 and return \`digits\`.
   * Otherwise set \`digits[i] = 0\` (carry continues left).
2. All digits were 9: return ==\`[1] + digits\`==.`,
    visual: {
      kind: "array",
      title: "Plus one · [1, 2, 9] then [9, 9]",
      values: [1, 2, 9],
      frames: [
        { caption: "Last digit 9 → becomes 0, carry 1 moves left.", values: [1, 2, 0], pointers: [{ name: "i", index: 2 }], highlight: [2], vars: kv({ carry: "1" }) },
        { caption: "2 < 9 → becomes 3. No more carry, return.", values: [1, 3, 0], pointers: [{ name: "i", index: 1 }], highlight: [1], done: [2], vars: kv({ answer: "[1, 3, 0]" }) },
        { caption: "Second example [9, 9]: both 9s turn into 0 as the carry passes.", values: [0, 0], highlight: [0, 1], vars: kv({ carry: "1" }) },
        { caption: "Loop ended with a carry → put a 1 in front.", values: [1, 0, 0], highlight: [0], vars: kv({ answer: "[1, 0, 0]" }) },
      ],
    },
    code: `def plusOne(digits: list[int]) -> list[int]:
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1
            return digits
        digits[i] = 0
    return [1] + digits`,
    complexity: "Time O(n) · Space O(1) (O(n) only when all 9s)",
  },
  {
    lc: 50,
    variation: "fast-power",
    question: "Compute x raised to an integer power n (n may be negative) without a built-in power function.",
    intuition: `\`x^n\` multiplied n times is too slow for big n. Write n in binary: ==each bit set in n multiplies in \`x^(2^k)\`==, and you get \`x, x², x⁴, …\` by ==squaring \`x\` each step while halving n==. A negative n is just \`(1/x)^(-n)\`.`,
    algorithm: `1. If \`n < 0\`: set \`x = 1 / x\` and \`n = -n\`.
2. Set \`res = 1\`.
3. While \`n > 0\`:
   * If ==the lowest bit of \`n\` is 1== (\`n & 1\`): \`res *= x\`.
   * ==\`x *= x\`== and \`n >>= 1\`.
4. Return \`res\`.`,
    visual: {
      kind: "array",
      title: "Pow · 3^5, bits of 5 from lowest: 1, 0, 1",
      values: [1, 0, 1],
      frames: [
        { caption: "Bit 0 is 1 → res = 1 × 3 = 3. Square x to 9, n becomes 2.", pointers: [{ name: "bit", index: 0 }], highlight: [0], vars: kv({ res: "3", x: "9", n: "2" }) },
        { caption: "Bit 1 is 0 → skip. Square x to 81, n becomes 1.", pointers: [{ name: "bit", index: 1 }], highlight: [1], done: [0], vars: kv({ res: "3", x: "81", n: "1" }) },
        { caption: "Bit 2 is 1 → res = 3 × 81 = 243. n becomes 0.", pointers: [{ name: "bit", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ res: "243", x: "6561", n: "0" }) },
        { caption: "3 multiplications instead of 5: 3^5 = 3^1 × 3^4 = 243.", done: [0, 1, 2], vars: kv({ answer: "243" }) },
      ],
    },
    code: `def myPow(x: float, n: int) -> float:
    if n < 0:
        x, n = 1 / x, -n
    res = 1.0
    while n > 0:
        if n & 1:
            res *= x
        x *= x
        n >>= 1
    return res`,
    complexity: "Time O(log n) · Space O(1)",
  },
  {
    lc: 43,
    variation: "digit-math",
    question: "Multiply two non-negative integers given as digit strings and return the product as a string, without converting them to integers.",
    intuition: `Do long multiplication. The product of \`num1[i]\` and \`num2[j]\` ==lands at position \`i + j + 1\`== of a result array of length \`m + n\` (its carry goes to \`i + j\`). Process from the right, add into the slot, keep the ones digit and push the carry left. Strip leading zeros at the end.`,
    algorithm: `1. If either string is \`"0"\`, return \`"0"\`.
2. Create \`res = [0] * (m + n)\`.
3. For \`i\` from \`m - 1\` down to 0, \`j\` from \`n - 1\` down to 0:
   * ==\`p = digit(num1[i]) * digit(num2[j]) + res[i + j + 1]\`==.
   * \`res[i + j + 1] = p % 10\`.
   * ==\`res[i + j] += p // 10\`== (carry).
4. Join \`res\` into a string and strip leading zeros.`,
    visual: {
      kind: "array",
      title: "Multiply strings · \"12\" × \"34\"",
      values: [0, 0, 0, 0],
      frames: [
        { caption: "2 × 4 = 8 → slot i+j+1 = 3.", values: [0, 0, 0, 8], pointers: [{ name: "slot", index: 3 }], highlight: [3], vars: kv({ "i, j": "1, 1", p: "8" }) },
        { caption: "2 × 3 = 6 (+ res[2] 0) → slot 2.", values: [0, 0, 6, 8], pointers: [{ name: "slot", index: 2 }], highlight: [2], vars: kv({ "i, j": "1, 0", p: "6" }) },
        { caption: "1 × 4 = 4, plus res[2] 6 = 10 → keep 0 in slot 2, carry 1 into slot 1.", values: [0, 1, 0, 8], pointers: [{ name: "slot", index: 2 }], highlight: [1, 2], vars: kv({ "i, j": "0, 1", p: "10" }) },
        { caption: "1 × 3 = 3, plus res[1] 1 = 4 → slot 1.", values: [0, 4, 0, 8], pointers: [{ name: "slot", index: 1 }], highlight: [1], vars: kv({ "i, j": "0, 0", p: "4" }) },
        { caption: "Join and strip the leading 0 → \"408\".", values: [0, 4, 0, 8], done: [1, 2, 3], vars: kv({ answer: "\"408\"" }) },
      ],
    },
    code: `def multiply(num1: str, num2: str) -> str:
    if num1 == "0" or num2 == "0":
        return "0"
    m, n = len(num1), len(num2)
    res = [0] * (m + n)
    for i in range(m - 1, -1, -1):
        for j in range(n - 1, -1, -1):
            p = int(num1[i]) * int(num2[j]) + res[i + j + 1]
            res[i + j + 1] = p % 10
            res[i + j] += p // 10
    return "".join(map(str, res)).lstrip("0")`,
    complexity: "Time O(m · n) · Space O(m + n)",
  },
  {
    lc: 2013,
    variation: "point-hash",
    question: "Design a structure that stores points (duplicates allowed) and, for a query point, counts axis-aligned squares with positive area it completes.",
    intuition: `Fix the query point and ==try every stored point as the opposite (diagonal) corner==: it must differ in x and y by the same non-zero amount. The other two corners are then fixed, so ==multiply their counts== from a \`(x, y) → count\` map. Duplicates multiply in naturally.`,
    algorithm: `**add(point)**

1. \`count[(x, y)] += 1\`.

**count(point)** with query \`(px, py)\`

1. Set \`res = 0\`.
2. For each stored \`(x, y)\` with count \`c\`:
   * Skip it unless ==\`abs(px - x) == abs(py - y)\` and \`x != px\`== (a real diagonal).
   * ==\`res += c * count[(x, py)] * count[(px, y)]\`==.
3. Return \`res\`.`,
    visual: {
      kind: "grid",
      title: "Detect squares · counts on a 4 × 4 board",
      rows: [
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
        ["", "", "", ""],
      ],
      rowLabels: ["y=3", "y=2", "y=1", "y=0"],
      colLabels: ["x=0", "x=1", "x=2", "x=3"],
      frames: [
        { caption: "add (1,3) → count 1.", cells: fill([["0,1", 1]]), highlight: ["0,1"], vars: kv({ count: "{(1,3):1}" }) },
        { caption: "add (3,1), then (1,1) twice → (1,1) has count 2.", cells: fill([["2,3", 1], ["2,1", 2]]), highlight: ["2,3", "2,1"], vars: kv({ count: "{(1,3):1, (3,1):1, (1,1):2}" }) },
        { caption: "count(3,3): (1,3) and (3,1) share a row/column with the query → not diagonals, skip.", cells: fill([["0,3", "?"]]), highlight: ["0,3"], done: ["0,1", "2,3"] },
        { caption: "(1,1): |3−1| = |3−1| = 2 → diagonal. Corners (1,3) and (3,1) exist → 2 × 1 × 1 = 2.", highlight: ["0,3", "2,1", "0,1", "2,3"], vars: kv({ answer: "2" }) },
      ],
    },
    code: `from collections import defaultdict

class DetectSquares:
    def __init__(self):
        self.cnt = defaultdict(int)

    def add(self, point: list[int]) -> None:
        self.cnt[tuple(point)] += 1

    def count(self, point: list[int]) -> int:
        px, py = point
        res = 0
        for (x, y), c in list(self.cnt.items()):
            if abs(px - x) != abs(py - y) or x == px:
                continue
            res += c * self.cnt.get((x, py), 0) * self.cnt.get((px, y), 0)
        return res`,
    complexity: "Time O(1) add, O(distinct points) count · Space O(distinct points)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */