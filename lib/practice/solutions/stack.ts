/**
 * stack: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
 * - 20 Valid Parentheses (Easy)
 * - 155 Min Stack (Medium)
 * - 150 Evaluate Reverse Polish Notation (Medium)
 * - 22 Generate Parentheses (Medium)
 * - 739 Daily Temperatures (Medium)
 * - 853 Car Fleet (Medium)
 * - 84 Largest Rectangle in Histogram (Hard)
 */
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));

export const variations: Variation[] = [
  {
    id: "push-pop",
    topic: "stack",
    name: "Push, then pop to match or combine",
    change: "Base pattern. Push items as they arrive; when something ==closes or acts on the latest items==, pop them off the top and use them.",
    problems: [20, 150],
  },
  {
    id: "aux-stack",
    topic: "stack",
    name: "Stack with extra state",
    change: "Design a stack that answers a query in O(1): ==store the running answer next to each push== (a second stack of minimums), so a pop restores the old answer for free.",
    problems: [155],
  },
  {
    id: "backtrack-build",
    topic: "stack",
    name: "Build with backtracking",
    change: "Nothing to read in: the stack is ==the string you're building==. Push a choice, recurse, pop it to try the next choice, with counts deciding which choices are legal.",
    problems: [22],
  },
  {
    id: "monotonic",
    topic: "stack",
    name: "Monotonic stack",
    change: "Keep the stack ==always increasing or always decreasing==. A new item pops everything it beats, and each pop is the moment that item's answer becomes known.",
    problems: [739, 853, 84],
  },
];

export const solutions: Solution[] = [
  {
    lc: 20,
    variation: "push-pop",
    question: "Given a string of brackets ()[]{}, say whether every bracket is closed by the right kind in the right order.",
    intuition: `The most recently opened bracket must be the first one closed: that's ==last in, first out==, so use a stack. Push every opener. On a closer, ==the top of the stack must be its matching opener==; otherwise (or if the stack is empty) the string is invalid. At the end nothing may be left open.`,
    algorithm: `1. Create \`pairs = {")": "(", "]": "[", "}": "{"}\` and an empty \`stack\`.
2. For each character \`c\`:
   * If \`c\` is a closer:
      * If the stack is empty or ==\`stack[-1] != pairs[c]\`==, return \`False\`.
      * Otherwise pop.
   * Else push \`c\`.
3. Return ==\`not stack\`== (every opener got closed).`,
    visual: {
      kind: "array",
      title: "Valid parentheses · \"([]{})\"",
      values: ["(", "[", "]", "{", "}", ")"],
      frames: [
        { caption: "'(' is an opener → push.", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ stack: "[(]" }) },
        { caption: "'[' is an opener → push.", pointers: [{ name: "i", index: 1 }], highlight: [1], vars: kv({ stack: "[(, []" }) },
        { caption: "']' closes: top is '[' → match, pop.", pointers: [{ name: "i", index: 2 }], highlight: [1, 2], vars: kv({ stack: "[(]" }) },
        { caption: "'{' → push.", pointers: [{ name: "i", index: 3 }], highlight: [3], done: [1, 2], vars: kv({ stack: "[(, {]" }) },
        { caption: "'}' closes: top is '{' → match, pop.", pointers: [{ name: "i", index: 4 }], highlight: [3, 4], done: [1, 2], vars: kv({ stack: "[(]" }) },
        { caption: "')' closes: top is '(' → match, pop. Stack empty → valid.", pointers: [{ name: "i", index: 5 }], highlight: [0, 5], done: [1, 2, 3, 4], vars: kv({ stack: "[]", answer: "True" }) },
      ],
    },
    code: `def isValid(s: str) -> bool:
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for c in s:
        if c in pairs:
            if not stack or stack[-1] != pairs[c]:
                return False
            stack.pop()
        else:
            stack.append(c)
    return not stack`,
    complexity: "Time O(n) · Space O(n)",
  },
  {
    lc: 155,
    variation: "aux-stack",
    question: "Design a stack that supports push, pop, top and returning its smallest value, each in constant time.",
    intuition: `Scanning for the minimum is O(n). Instead keep a second stack where ==each entry is the minimum of everything at or below that level==. Push \`min(val, mins[-1])\`; pop both stacks together. ==The old minimum is still sitting underneath==, so popping restores it with no work.`,
    algorithm: `1. Keep two lists: \`stack\` and \`mins\`.
2. \`push(val)\`:
   * Append \`val\` to \`stack\`.
   * Append ==\`min(val, mins[-1])\`== to \`mins\` (just \`val\` if \`mins\` is empty).
3. \`pop()\`: pop ==both== \`stack\` and \`mins\`.
4. \`top()\`: return \`stack[-1]\`.
5. \`getMin()\`: return \`mins[-1]\`.`,
    visual: {
      kind: "array",
      title: "Min stack · a sequence of operations",
      values: ["push 5", "push 3", "push 7", "getMin", "pop", "pop", "getMin"],
      frames: [
        { caption: "push 5: first item, so the min is 5.", pointers: [{ name: "op", index: 0 }], highlight: [0], vars: kv({ stack: "[5]", mins: "[5]" }) },
        { caption: "push 3: min(3, 5) = 3 goes on mins.", pointers: [{ name: "op", index: 1 }], highlight: [1], done: [0], vars: kv({ stack: "[5, 3]", mins: "[5, 3]" }) },
        { caption: "push 7: min(7, 3) = 3. The min is repeated, not changed.", pointers: [{ name: "op", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ stack: "[5, 3, 7]", mins: "[5, 3, 3]" }) },
        { caption: "getMin → top of mins = 3. O(1).", pointers: [{ name: "op", index: 3 }], highlight: [3], done: [0, 1, 2], vars: kv({ stack: "[5, 3, 7]", mins: "[5, 3, 3]", answer: "3" }) },
        { caption: "pop: remove 7 and its min 3 together.", pointers: [{ name: "op", index: 4 }], highlight: [4], done: [0, 1, 2, 3], vars: kv({ stack: "[5, 3]", mins: "[5, 3]" }) },
        { caption: "pop: remove 3. The 5 underneath is the old minimum, back for free.", pointers: [{ name: "op", index: 5 }], highlight: [5], done: [0, 1, 2, 3, 4], vars: kv({ stack: "[5]", mins: "[5]" }) },
        { caption: "getMin → 5.", pointers: [{ name: "op", index: 6 }], highlight: [6], done: [0, 1, 2, 3, 4, 5], vars: kv({ stack: "[5]", mins: "[5]", answer: "5" }) },
      ],
    },
    code: `class MinStack:
    def __init__(self):
        self.stack = []
        self.mins = []

    def push(self, val: int) -> None:
        self.stack.append(val)
        self.mins.append(min(val, self.mins[-1]) if self.mins else val)

    def pop(self) -> None:
        self.stack.pop()
        self.mins.pop()

    def top(self) -> int:
        return self.stack[-1]

    def getMin(self) -> int:
        return self.mins[-1]`,
    complexity: "Time O(1) per operation · Space O(n)",
  },
  {
    lc: 150,
    variation: "push-pop",
    question: "Given an arithmetic expression written in postfix order (operator after its two operands), compute its integer value.",
    intuition: `In postfix, ==an operator always applies to the two most recent values==. Push numbers; on an operator, pop two, combine them and push the result back. Mind the order: the ==first pop is the right operand==. Division truncates toward zero, so use \`int(a / b)\`, not \`//\`.`,
    algorithm: `1. Create an empty \`stack\`.
2. For each token \`t\`:
   * If \`t\` is \`+\`, \`-\`, \`*\` or \`/\`:
      * ==\`b = stack.pop()\`, then \`a = stack.pop()\`==.
      * Push \`a + b\`, \`a - b\`, \`a * b\` or \`int(a / b)\`.
   * Else push \`int(t)\`.
3. Return \`stack[0]\`.`,
    visual: {
      kind: "array",
      title: "Evaluate RPN · 2 1 + 3 *",
      values: ["2", "1", "+", "3", "*"],
      frames: [
        { caption: "2 is a number → push.", pointers: [{ name: "t", index: 0 }], highlight: [0], vars: kv({ stack: "[2]" }) },
        { caption: "1 → push.", pointers: [{ name: "t", index: 1 }], highlight: [1], done: [0], vars: kv({ stack: "[2, 1]" }) },
        { caption: "+ → pop b=1, a=2, push 2 + 1 = 3.", pointers: [{ name: "t", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ stack: "[3]" }) },
        { caption: "3 → push.", pointers: [{ name: "t", index: 3 }], highlight: [3], done: [0, 1, 2], vars: kv({ stack: "[3, 3]" }) },
        { caption: "* → pop b=3, a=3, push 9. One value left → answer 9.", pointers: [{ name: "t", index: 4 }], highlight: [4], done: [0, 1, 2, 3], vars: kv({ stack: "[9]", answer: "9" }) },
      ],
    },
    code: `def evalRPN(tokens: list[str]) -> int:
    stack = []
    for t in tokens:
        if t in ("+", "-", "*", "/"):
            b = stack.pop()
            a = stack.pop()
            if t == "+":
                stack.append(a + b)
            elif t == "-":
                stack.append(a - b)
            elif t == "*":
                stack.append(a * b)
            else:
                stack.append(int(a / b))  # truncate toward zero
        else:
            stack.append(int(t))
    return stack[0]`,
    complexity: "Time O(n) · Space O(n)",
  },
  {
    lc: 22,
    variation: "backtrack-build",
    question: "Given n, list every string of n pairs of parentheses that is correctly balanced.",
    intuition: `Build the string one character at a time and only make legal moves. ==You may add \`(\` while \`open < n\`==, and ==you may add \`)\` only while \`closed < open\`== (there's something to close). When both counts reach \`n\`, the string is complete. Push a character, recurse, pop it to try the other branch.`,
    algorithm: `1. Keep \`stack\` (the characters so far) and \`res\`.
2. \`backtrack(open, closed)\`:
   * If \`open == closed == n\`, append \`"".join(stack)\` to \`res\` and return.
   * If ==\`open < n\`==:
      * Push \`(\`, call \`backtrack(open + 1, closed)\`, pop.
   * If ==\`closed < open\`==:
      * Push \`)\`, call \`backtrack(open, closed + 1)\`, pop.
3. Call \`backtrack(0, 0)\` and return \`res\`.`,
    visual: {
      kind: "graph",
      title: "Generate parentheses · n = 2 (choice tree)",
      nodes: [
        { id: "root", label: "\"\"" },
        { id: "a", label: "(" },
        { id: "aa", label: "((" },
        { id: "aab", label: "(()" },
        { id: "aabb", label: "(())" },
        { id: "ab", label: "()" },
        { id: "aba", label: "()(" },
        { id: "abab", label: "()()" },
      ],
      edges: [
        { from: "root", to: "a", label: "(" },
        { from: "a", to: "aa", label: "(" },
        { from: "aa", to: "aab", label: ")" },
        { from: "aab", to: "aabb", label: ")" },
        { from: "a", to: "ab", label: ")" },
        { from: "ab", to: "aba", label: "(" },
        { from: "aba", to: "abab", label: ")" },
      ],
      directed: true,
      frames: [
        { caption: "Start empty. open 0 < 2 → only '(' is allowed (nothing to close).", pointers: [{ name: "cur", node: "root" }], highlight: ["root"], vars: kv({ open: "0", closed: "0", res: "[]" }) },
        { caption: "\"(\": both moves are legal. Try '(' first.", pointers: [{ name: "cur", node: "a" }], highlight: ["a"], done: ["root"], vars: kv({ open: "1", closed: "0" }) },
        { caption: "\"((\": open = n, so only ')' now. Twice → \"(())\" complete.", pointers: [{ name: "cur", node: "aabb" }], highlight: ["aa", "aab", "aabb"], done: ["root", "a"], vars: kv({ open: "2", closed: "2", res: "[(())]" }) },
        { caption: "Pop back to \"(\" and try ')' → \"()\". closed = open, so only '(' next.", pointers: [{ name: "cur", node: "ab" }], highlight: ["ab"], done: ["root", "a", "aa", "aab", "aabb"], vars: kv({ open: "1", closed: "1", res: "[(())]" }) },
        { caption: "\"()(\" then ')' → \"()()\" complete. Every branch explored.", pointers: [{ name: "cur", node: "abab" }], highlight: ["aba", "abab"], done: ["root", "a", "aa", "aab", "aabb", "ab"], vars: kv({ res: "[(()), ()()]" }) },
      ],
    },
    code: `def generateParenthesis(n: int) -> list[str]:
    res = []
    stack = []

    def backtrack(open_count: int, closed_count: int) -> None:
        if open_count == closed_count == n:
            res.append("".join(stack))
            return
        if open_count < n:
            stack.append("(")
            backtrack(open_count + 1, closed_count)
            stack.pop()
        if closed_count < open_count:
            stack.append(")")
            backtrack(open_count, closed_count + 1)
            stack.pop()

    backtrack(0, 0)
    return res`,
    complexity: "Time O(4ⁿ / √n) (the Catalan number of results) · Space O(n) besides the output",
  },
  {
    lc: 739,
    variation: "monotonic",
    question: "Given daily temperatures, return for each day how many days you wait until a warmer one (0 if never).",
    intuition: `Keep a stack of ==days still waiting for a warmer day==; their temperatures are decreasing from bottom to top. A new warmer day ==pops every colder day on top==, and for each popped day the wait is \`i - j\`. Each day is pushed and popped once, so it's O(n).`,
    algorithm: `1. Create \`res = [0] * n\` and an empty \`stack\` of indexes.
2. For each day \`i\` with temperature \`t\`:
   * While the stack isn't empty and ==\`t > temperatures[stack[-1]]\`==:
      * \`j = stack.pop()\`.
      * ==\`res[j] = i - j\`==.
   * Push \`i\`.
3. Return \`res\` (days left on the stack keep 0).`,
    visual: {
      kind: "array",
      title: "Daily temperatures · [73, 74, 75, 71, 69, 72, 76, 73]",
      values: [73, 74, 75, 71, 69, 72, 76, 73],
      frames: [
        { caption: "Day 0 (73): nothing waiting → push.", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ stack: "[73]", res: "[0,0,0,0,0,0,0,0]" }) },
        { caption: "Day 1 (74) > 73 → pop day 0, wait 1. Push day 1.", pointers: [{ name: "i", index: 1 }], highlight: [0, 1], vars: kv({ stack: "[74]", res: "[1,0,0,0,0,0,0,0]" }) },
        { caption: "Day 2 (75) > 74 → pop day 1, wait 1. Push day 2.", pointers: [{ name: "i", index: 2 }], highlight: [1, 2], done: [0], vars: kv({ stack: "[75]", res: "[1,1,0,0,0,0,0,0]" }) },
        { caption: "Days 3 (71) and 4 (69) are colder → push both. Stack stays decreasing.", pointers: [{ name: "i", index: 4 }], highlight: [3, 4], done: [0, 1], vars: kv({ stack: "[75, 71, 69]", res: "[1,1,0,0,0,0,0,0]" }) },
        { caption: "Day 5 (72) pops 69 (wait 1) and 71 (wait 2). 75 is warmer → stop, push 72.", pointers: [{ name: "i", index: 5 }], highlight: [3, 4, 5], done: [0, 1], vars: kv({ stack: "[75, 72]", res: "[1,1,0,2,1,0,0,0]" }) },
        { caption: "Day 6 (76) pops 72 (wait 1) and 75 (wait 4). Push 76.", pointers: [{ name: "i", index: 6 }], highlight: [2, 5, 6], done: [0, 1, 3, 4], vars: kv({ stack: "[76]", res: "[1,1,4,2,1,1,0,0]" }) },
        { caption: "Day 7 (73) is colder → push. Days 6 and 7 never warm up → 0.", pointers: [{ name: "i", index: 7 }], highlight: [7], done: [0, 1, 2, 3, 4, 5], vars: kv({ stack: "[76, 73]", answer: "[1,1,4,2,1,1,0,0]" }) },
      ],
    },
    code: `def dailyTemperatures(temperatures: list[int]) -> list[int]:
    res = [0] * len(temperatures)
    stack = []  # indexes of days still waiting
    for i, t in enumerate(temperatures):
        while stack and t > temperatures[stack[-1]]:
            j = stack.pop()
            res[j] = i - j
        stack.append(i)
    return res`,
    complexity: "Time O(n) · Space O(n)",
  },
  {
    lc: 853,
    variation: "monotonic",
    question: "Cars drive toward a target on a one-lane road and can't pass; a car catching up joins the slower one. Count the groups that arrive.",
    intuition: `Sort cars by position, ==closest to the target first==, and work out each car's arrival time \`(target - p) / s\`. A car behind that would arrive ==no later than the fleet ahead== catches it and merges, so it adds nothing. Only a strictly slower arrival time starts a new fleet. The stack of fleet times stays increasing.`,
    algorithm: `1. Pair up \`(position, speed)\` and sort by position, ==largest first==.
2. For each car:
   * Push its arrival time \`(target - p) / s\`.
   * If there are 2+ times and ==\`stack[-1] <= stack[-2]\`==, pop: it catches the fleet ahead.
3. Return \`len(stack)\`.`,
    visual: {
      kind: "array",
      title: "Car fleet · target 12, cars sorted closest first",
      values: ["p10 s2", "p8 s4", "p5 s1", "p3 s3", "p0 s1"],
      frames: [
        { caption: "Car at 10: time (12−10)/2 = 1 → first fleet.", pointers: [{ name: "car", index: 0 }], highlight: [0], vars: kv({ time: "1", stack: "[1]" }) },
        { caption: "Car at 8: time 1 ≤ 1 → catches the car ahead, merges. Pop.", pointers: [{ name: "car", index: 1 }], highlight: [0, 1], vars: kv({ time: "1", stack: "[1]" }) },
        { caption: "Car at 5: time 7 > 1 → can't catch up, new fleet.", pointers: [{ name: "car", index: 2 }], highlight: [2], done: [0, 1], vars: kv({ time: "7", stack: "[1, 7]" }) },
        { caption: "Car at 3: time 3 ≤ 7 → catches the slow car at 5, merges.", pointers: [{ name: "car", index: 3 }], highlight: [2, 3], done: [0, 1], vars: kv({ time: "3", stack: "[1, 7]" }) },
        { caption: "Car at 0: time 12 > 7 → new fleet. 3 fleets in the stack.", pointers: [{ name: "car", index: 4 }], highlight: [4], done: [0, 1, 2, 3], vars: kv({ time: "12", stack: "[1, 7, 12]", answer: "3" }) },
      ],
    },
    code: `def carFleet(target: int, position: list[int], speed: list[int]) -> int:
    cars = sorted(zip(position, speed), reverse=True)
    stack = []  # arrival times of fleets
    for p, s in cars:
        stack.append((target - p) / s)
        if len(stack) >= 2 and stack[-1] <= stack[-2]:
            stack.pop()
    return len(stack)`,
    complexity: "Time O(n log n) for the sort · Space O(n)",
  },
  {
    lc: 84,
    variation: "monotonic",
    question: "Given bar heights of width 1 side by side, return the area of the largest rectangle that fits inside the bars.",
    intuition: `Keep a stack of \`(start, height)\` with ==heights increasing==. A bar can stretch right until a shorter bar shows up, so ==when a shorter bar arrives, pop the taller ones== and score \`height × (i - start)\`. The new bar inherits the start of the last popped bar, since it can stretch back that far. Bars left at the end stretch to the end of the array.`,
    algorithm: `1. Create \`best = 0\` and an empty \`stack\` of \`(start, height)\`.
2. For each \`i\` with height \`h\`:
   * Set \`start = i\`.
   * While ==\`stack[-1]\` is taller than \`h\`==:
      * Pop \`(idx, ht)\`, update \`best = max(best, ht * (i - idx))\`.
      * ==\`start = idx\`== (the new bar reaches back to here).
   * Push \`(start, h)\`.
3. For each \`(idx, ht)\` left: \`best = max(best, ht * (n - idx))\`.
4. Return \`best\`.`,
    visual: {
      kind: "array",
      title: "Largest rectangle · [2, 1, 5, 6, 2, 3]",
      values: [2, 1, 5, 6, 2, 3],
      frames: [
        { caption: "i=0 h=2: push (0, 2).", pointers: [{ name: "i", index: 0 }], highlight: [0], vars: kv({ stack: "[(0,2)]", best: "0" }) },
        { caption: "i=1 h=1 is shorter → pop (0,2): area 2×1 = 2. Push (0, 1): it reaches back to 0.", pointers: [{ name: "i", index: 1 }], highlight: [0, 1], vars: kv({ stack: "[(0,1)]", best: "2" }) },
        { caption: "i=2 h=5, i=3 h=6: taller → push both.", pointers: [{ name: "i", index: 3 }], highlight: [2, 3], vars: kv({ stack: "[(0,1), (2,5), (3,6)]", best: "2" }) },
        { caption: "i=4 h=2: pop (3,6) → 6×1 = 6. Pop (2,5) → 5×2 = 10.", pointers: [{ name: "i", index: 4 }], range: [2, 3], highlight: [2, 3], vars: kv({ stack: "[(0,1)]", best: "10" }) },
        { caption: "Push (2, 2): the 2 reaches back to index 2. i=5 h=3 → push (5, 3).", pointers: [{ name: "i", index: 5 }], highlight: [4, 5], done: [2, 3], vars: kv({ stack: "[(0,1), (2,2), (5,3)]", best: "10" }) },
        { caption: "End: (0,1)→1×6 = 6, (2,2)→2×4 = 8, (5,3)→3×1 = 3. Best stays 10.", range: [2, 3], highlight: [2, 3], vars: kv({ answer: "10" }) },
      ],
    },
    code: `def largestRectangleArea(heights: list[int]) -> int:
    best = 0
    stack = []  # (start index, height), heights increasing
    for i, h in enumerate(heights):
        start = i
        while stack and stack[-1][1] > h:
            idx, ht = stack.pop()
            best = max(best, ht * (i - idx))
            start = idx
        stack.append((start, h))
    n = len(heights)
    for idx, ht in stack:
        best = max(best, ht * (n - idx))
    return best`,
    complexity: "Time O(n) · Space O(n)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */