/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "78": {
    "followUps": [
      "Can you enumerate subsets so successive results differ by just one element?"
    ],
    "reference": {
      "title": "Choose from index i onward",
      "explanation": "Every node of the recursion tree is a subset. From the current subset, try adding ==each item after the last one you added==; that start index stops [2, 1] from appearing after [1, 2]. After exploring a choice, ==pop it== so the list is clean for the next sibling.",
      "time": "O(n · 2ⁿ)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Bitmask enumeration",
      "explanation": "Each bitmask chooses which positions belong to a subset.",
      "code": "class Solution:\n    def subsets(self, nums: List[int]) -> List[List[int]]:\n        return [[value for i, value in enumerate(nums) if mask & (1 << i)] for mask in range(1 << len(nums))]\n",
      "time": "O(n · 2^n)",
      "space": "O(n) auxiliary, excluding output",
      "optimal": false
    }
  },
  "39": {
    "followUps": [
      "Why must the recursion move to the next candidate after choosing a count to avoid duplicate combinations?"
    ],
    "reference": {
      "title": "Choose from index i onward",
      "explanation": "Same tree as subsets, with two changes. Reuse is allowed, so ==recurse with `j`, not `j + 1`==. And ==sort first==: once a candidate overshoots the target, every later one does too, so you can `break` out of the loop.",
      "time": "O(n^(t/m))",
      "space": "O(t/m)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Choose a count per candidate",
      "explanation": "For each candidate, try every count that still fits the remaining target, then move to the next candidate. m is the smallest candidate.",
      "code": "class Solution:\n    def combinationSum(self, candidates: List[int], target: int) -> List[List[int]]:\n        answer = []\n        def visit(index, left, path):\n            if left == 0:\n                answer.append(path[:]); return\n            if index == len(candidates): return\n            value = candidates[index]\n            for count in range(left//value+1):\n                visit(index+1, left-count*value, path+[value]*count)\n        visit(0, target, [])\n        return answer\n",
      "time": "O((t/m + 1)^n · (n + t/m))",
      "space": "O(n · t/m) auxiliary for copied paths",
      "optimal": false
    }
  },
  "40": {
    "followUps": [
      "How does skipping equal values at the same recursion depth avoid constructing duplicate results?"
    ],
    "reference": {
      "title": "Sort and skip duplicates",
      "explanation": "Like Combination Sum, but each item is used once (==recurse with `j + 1`==), and equal values must not start two identical branches. After sorting, ==skip `candidates[j]` if it equals the one before it at the same level== (`j > start`). Going deeper with the duplicate is still fine.",
      "time": "O(n · 2ⁿ)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Enumerate index subsets",
      "explanation": "Try taking or skipping every input position, then deduplicate sorted successful selections.",
      "code": "class Solution:\n    def combinationSum2(self, candidates: List[int], target: int) -> List[List[int]]:\n        answer = set()\n        def visit(index, left, path):\n            if left == 0:\n                answer.add(tuple(sorted(path))); return\n            if index == len(candidates) or left < 0: return\n            visit(index+1, left, path)\n            visit(index+1, left-candidates[index], path+[candidates[index]])\n        visit(0, target, [])\n        return [list(values) for values in sorted(answer)]\n",
      "time": "O(n · 2^n)",
      "space": "O(n²) auxiliary; O(r · n) output set",
      "optimal": false
    }
  },
  "46": {
    "followUps": [
      "How would you avoid duplicate permutations when equal input values are allowed?"
    ],
    "reference": {
      "title": "Permutations",
      "explanation": "A permutation fills positions one at a time, and ==any unused item can go next==, not just items after the last one. Keep a `used` array; mark an item before recursing and ==unmark it after==, so siblings can use it.",
      "time": "O(n · n!)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Iterative insertion",
      "explanation": "Insert the next number into every possible slot of each partial permutation.",
      "code": "class Solution:\n    def permute(self, nums: List[int]) -> List[List[int]]:\n        permutations = [[]]\n        for value in nums:\n            permutations = [p[:i]+[value]+p[i:] for p in permutations for i in range(len(p)+1)]\n        return permutations\n",
      "time": "O(n · n!)",
      "space": "O(n · n!) including intermediate output",
      "optimal": false
    }
  },
  "90": {
    "followUps": [
      "Why is skipping an equal sibling choice safe, while skipping all equal values would lose valid subsets?"
    ],
    "reference": {
      "title": "Sort and skip duplicates",
      "explanation": "Subsets again, but two equal values would start two identical branches. ==Sort== so duplicates sit together, then at each level ==skip a value equal to its left sibling== (`j > start`). Taking the duplicate deeper (like [2, 2]) is still allowed.",
      "time": "O(n · 2ⁿ)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Bitmasks with deduplication",
      "explanation": "Sort the values and use a set of tuples to merge duplicate subsets from different index masks.",
      "code": "class Solution:\n    def subsetsWithDup(self, nums: List[int]) -> List[List[int]]:\n        values = sorted(nums)\n        answer = {tuple(value for i, value in enumerate(values) if mask & (1 << i)) for mask in range(1 << len(values))}\n        return [list(row) for row in sorted(answer)]\n",
      "time": "O(n · 2^n)",
      "space": "O(n · 2^n) including output set",
      "optimal": false
    }
  },
  "79": {
    "followUps": [
      "How would you prune the search when the board contains too few copies of a required letter?"
    ],
    "reference": {
      "title": "Board search with constraints",
      "explanation": "Try every cell as a start and DFS in four directions, matching one letter per step. To stop a path reusing a cell, ==overwrite it with `#` while it's on the path== and ==restore it on the way back==, so other paths can still use it.",
      "time": "O(R · C · 4^L)",
      "space": "O(L)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Explicit stack of search paths",
      "explanation": "Store a separate visited-cell set with each search path, avoiding in-place board edits at the cost of copying path state.",
      "code": "class Solution:\n    def exist(self, board: List[List[str]], word: str) -> bool:\n        rows, cols = len(board), len(board[0])\n        for r in range(rows):\n            for c in range(cols):\n                stack = [(r,c,0,frozenset())]\n                while stack:\n                    x,y,i,seen = stack.pop()\n                    if (x,y) in seen or not (0 <= x < rows and 0 <= y < cols) or board[x][y] != word[i]: continue\n                    if i+1 == len(word): return True\n                    visited = seen | {(x,y)}\n                    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):\n                        stack.append((x+dx,y+dy,i+1,visited))\n        return False\n",
      "time": "O(R · C · L · 4^L)",
      "space": "O(L²) for depth-first pending paths",
      "optimal": false
    }
  },
  "131": {
    "followUps": [
      "Can a precomputed palindrome table remove repeated substring reversal checks?"
    ],
    "reference": {
      "title": "Build a string piece by piece",
      "explanation": "At position `i`, the next piece is some prefix `s[i:j+1]`. ==Only recurse when that prefix is a palindrome==; then the rest of the string is the same problem starting at `j + 1`. Reaching the end of the string means every piece was valid, so record the cut.",
      "time": "O(n · 2ⁿ)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Memoized suffix partitions",
      "explanation": "Cache all valid partitions for each suffix, combining each palindromic prefix with the cached remainder.",
      "code": "class Solution:\n    def partition(self, s: str) -> List[List[str]]:\n        @lru_cache(None)\n        def visit(start):\n            if start == len(s): return ((),)\n            answer = []\n            for end in range(start+1, len(s)+1):\n                word = s[start:end]\n                if word == word[::-1]:\n                    answer.extend((word,)+tail for tail in visit(end))\n            return tuple(answer)\n        return [list(row) for row in visit(0)]\n",
      "time": "O(n² + n · 2^n)",
      "space": "O(n · 2^n) including cached partitions",
      "optimal": false
    }
  },
  "17": {
    "followUps": [
      "How would you expose the combinations lazily instead of returning the entire list?"
    ],
    "reference": {
      "title": "Build a string piece by piece",
      "explanation": "Digit `i` decides letter `i`. Each level of the tree is one digit, and its branches are ==the 3 or 4 letters on that key==. When the string is as long as the digits, it's complete. An ==empty input gives an empty list==, not [\"\"].",
      "time": "O(n · 4ⁿ)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Iterative Cartesian product",
      "explanation": "Build partial strings one digit at a time by appending each letter mapped from the next digit.",
      "code": "class Solution:\n    def letterCombinations(self, digits: str) -> List[str]:\n        if not digits: return []\n        letters = {'2':'abc','3':'def','4':'ghi','5':'jkl','6':'mno','7':'pqrs','8':'tuv','9':'wxyz'}\n        answer = ['']\n        for digit in digits:\n            answer = [prefix+letter for prefix in answer for letter in letters[digit]]\n        return answer\n",
      "time": "O(n · 4^n)",
      "space": "O(n · 4^n) including output",
      "optimal": false
    }
  },
  "51": {
    "followUps": [
      "How can diagonal bitmasks prune invalid placements before a complete board is formed?"
    ],
    "reference": {
      "title": "Board search with constraints",
      "explanation": "Place ==one queen per row==, so rows never clash. For columns and diagonals keep three sets: `cols`, `r + c` (the ↙ diagonals) and `r - c` (the ↘ diagonals). A square is safe ==iff its column and both diagonal keys are unused==. Add the keys before recursing and remove them after.",
      "time": "O(n!)",
      "space": "O(n²)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Test column permutations",
      "explanation": "One queen per row/column leaves only permutations of columns; reject any diagonal collision.",
      "code": "class Solution:\n    def solveNQueens(self, n: int) -> List[List[str]]:\n        answer = []\n        for columns in itertools.permutations(range(n)):\n            if any(abs(columns[a]-columns[b]) == b-a for a in range(n) for b in range(a+1,n)): continue\n            answer.append(['.'*c+'Q'+'.'*(n-c-1) for c in columns])\n        return answer\n",
      "time": "O(n² · n!)",
      "space": "O(n) auxiliary, excluding output",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
