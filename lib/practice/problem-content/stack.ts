/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "20": {
    "followUps": [
      "How would you report the earliest invalid character rather than only a boolean?"
    ],
    "reference": {
      "title": "Push, then pop to match or combine",
      "explanation": "The most recently opened bracket must be the first one closed: that's ==last in, first out==, so use a stack. Push every opener. On a closer, ==the top of the stack must be its matching opener==; otherwise (or if the stack is empty) the string is invalid. At the end nothing may be left open.",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Repeatedly cancel matching pairs",
      "explanation": "Remove adjacent matching bracket pairs until no reduction is possible; a valid sequence reduces to empty.",
      "code": "class Solution:\n    def isValid(self, s: str) -> bool:\n        while True:\n            reduced = s.replace('()', '').replace('[]', '').replace('{}', '')\n            if reduced == s:\n                return s == ''\n            s = reduced\n",
      "time": "O(n²)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "155": {
    "followUps": [
      "How could you add constant-time maximum queries alongside minimum queries?"
    ],
    "reference": {
      "title": "Stack with extra state",
      "explanation": "Scanning for the minimum is O(n). Instead keep a second stack where ==each entry is the minimum of everything at or below that level==. Push `min(val, mins[-1])`; pop both stacks together. ==The old minimum is still sitting underneath==, so popping restores it with no work.",
      "time": "O(1) per operation",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Recompute minimum on demand",
      "explanation": "A plain list implements the stack; each minimum query scans it instead of keeping extra minimum history.",
      "code": "class MinStack:\n    def __init__(self): self.items = []\n    def push(self, val): self.items.append(val)\n    def pop(self): self.items.pop()\n    def top(self): return self.items[-1]\n    def getMin(self): return min(self.items)\n",
      "time": "O(1) push/pop/top; O(n) getMin",
      "space": "O(n)",
      "optimal": false
    }
  },
  "150": {
    "followUps": [
      "What extra validation would you need if malformed token sequences were permitted?"
    ],
    "reference": {
      "title": "Push, then pop to match or combine",
      "explanation": "In postfix, ==an operator always applies to the two most recent values==. Push numbers; on an operator, pop two, combine them and push the result back. Mind the order: the ==first pop is the right operand==. Division truncates toward zero, so use `int(a / b)`, not `//`.",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Recursive expression consumption",
      "explanation": "Read the postfix expression backwards: an operator recursively consumes its right operand and then its left operand.",
      "code": "class Solution:\n    def evalRPN(self, tokens: List[str]) -> int:\n        index = len(tokens)-1\n        def parse():\n            nonlocal index\n            token = tokens[index]\n            index -= 1\n            if token not in ('+', '-', '*', '/'):\n                return int(token)\n            right, left = parse(), parse()\n            if token == '+': return left + right\n            if token == '-': return left - right\n            if token == '*': return left * right\n            return (abs(left)//abs(right)) * (-1 if (left < 0) != (right < 0) else 1)\n        return parse()\n",
      "time": "O(n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "22": {
    "followUps": [
      "Can you count valid strings without materializing them?"
    ],
    "reference": {
      "title": "Build with backtracking",
      "explanation": "Build the string one character at a time and only make legal moves. ==You may add `(` while `open < n`==, and ==you may add `)` only while `closed < open`== (there's something to close). When both counts reach `n`, the string is complete. Push a character, recurse, pop it to try the other branch.",
      "time": "O(4ⁿ / √n)",
      "space": "O(n) besides the output"
    },
    "alternative": {
      "id": "alternative",
      "title": "Enumerate and validate",
      "explanation": "Generate every length-2n bracket string and retain those whose running balance never goes negative and ends at zero.",
      "code": "class Solution:\n    def generateParenthesis(self, n: int) -> List[str]:\n        answer = []\n        def visit(prefix, balance):\n            if len(prefix) == 2*n:\n                if balance == 0: answer.append(prefix)\n                return\n            visit(prefix+'(', balance+1)\n            if balance > 0: visit(prefix+')', balance-1)\n        visit('', 0)\n        return answer\n",
      "time": "O(n · 4^n)",
      "space": "O(n²) auxiliary for retained prefix strings",
      "optimal": false
    }
  },
  "739": {
    "followUps": [
      "How would you handle temperatures arriving online when answers for earlier days are still pending?"
    ],
    "reference": {
      "title": "Monotonic stack",
      "explanation": "Keep a stack of ==days still waiting for a warmer day==; their temperatures are decreasing from bottom to top. A new warmer day ==pops every colder day on top==, and for each popped day the wait is `i - j`. Each day is pushed and popped once, so it's O(n).",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Look forward from each day",
      "explanation": "Scan the suffix for the first strictly warmer temperature.",
      "code": "class Solution:\n    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:\n        answer = [0] * len(temperatures)\n        for i, current in enumerate(temperatures):\n            for j in range(i+1, len(temperatures)):\n                if temperatures[j] > current:\n                    answer[i] = j-i\n                    break\n        return answer\n",
      "time": "O(n²)",
      "space": "O(n) output",
      "optimal": false
    }
  },
  "853": {
    "followUps": [
      "What changes if cars are allowed to pass instead of merging into fleets?"
    ],
    "reference": {
      "title": "Monotonic stack",
      "explanation": "Sort cars by position, ==closest to the target first==, and work out each car's arrival time `(target - p) / s`. A car behind that would arrive ==no later than the fleet ahead== catches it and merges, so it adds nothing. Only a strictly slower arrival time starts a new fleet. The stack of fleet times stays increasing.",
      "time": "O(n log n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Position-ordered arrival times",
      "explanation": "Process cars from nearest to farthest from the destination and start a fleet only when its arrival time exceeds the fleet ahead.",
      "code": "class Solution:\n    def carFleet(self, target: int, position: List[int], speed: List[int]) -> int:\n        front = -1\n        fleets = 0\n        for p, v in sorted(zip(position, speed), reverse=True):\n            time = (target-p)/v\n            if time > front:\n                fleets += 1\n                front = time\n        return fleets\n",
      "time": "O(n log n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "84": {
    "followUps": [
      "How would you use this histogram routine to find the largest all-ones rectangle in a binary matrix?"
    ],
    "reference": {
      "title": "Monotonic stack",
      "explanation": "Keep a stack of `(start, height)` with ==heights increasing==. A bar can stretch right until a shorter bar shows up, so ==when a shorter bar arrives, pop the taller ones== and score `height × (i - start)`. The new bar inherits the start of the last popped bar, since it can stretch back that far. Bars left at the end stretch to the end of the array.",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Expand every interval",
      "explanation": "Extend every left boundary, maintaining the shortest bar and evaluating the rectangle for each right boundary.",
      "code": "class Solution:\n    def largestRectangleArea(self, heights: List[int]) -> int:\n        best = 0\n        for left in range(len(heights)):\n            lowest = heights[left]\n            for right in range(left, len(heights)):\n                lowest = min(lowest, heights[right])\n                best = max(best, lowest*(right-left+1))\n        return best\n",
      "time": "O(n²)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "32": {
    "followUps": [
      "Can you recover the start/end indices of a longest valid region without storing all candidate substrings?"
    ],
    "reference": {
      "title": "Push, then pop to match or combine",
      "explanation": "Matching is still last-in-first-out, but we need a ==length==, so push ==indexes==, not characters. Keep the index ==just before the current matched run== at the bottom of the stack (start with `-1`). On `)`, pop: if something is left, the run ends here and has length `i - stack[-1]`; if the stack is empty, this `)` is unmatched, so ==it becomes the new bottom== (runs can't cross it).",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Validate every starting point",
      "explanation": "Track bracket balance from each start and record every zero-balance prefix before the first negative balance.",
      "code": "class Solution:\n    def longestValidParentheses(self, s: str) -> int:\n        best = 0\n        for left in range(len(s)):\n            balance = 0\n            for right in range(left, len(s)):\n                balance += 1 if s[right] == '(' else -1\n                if balance < 0: break\n                if balance == 0: best = max(best, right-left+1)\n        return best\n",
      "time": "O(n²)",
      "space": "O(1)",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
