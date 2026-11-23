/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "62": {
    "followUps": [
      "How do blocked cells change the initialization and recurrence?"
    ],
    "reference": {
      "title": "Grid paths",
      "explanation": "The last step into a cell came either from above or from the left, so ==paths to `(r, c)` = paths to the cell above + paths to the cell on the left==. The top row and left column have exactly one path each (a straight line). Fill the grid row by row and read the corner.",
      "time": "O(m · n)",
      "space": "O(m · n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "One-row path counts",
      "explanation": "Each cell’s count is its old value from above plus the just-updated value to its left.",
      "code": "class Solution:\n    def uniquePaths(self, m: int, n: int) -> int:\n        row = [1]*n\n        for _ in range(1,m):\n            for c in range(1,n): row[c] += row[c-1]\n        return row[-1]\n",
      "time": "O(m · n)",
      "space": "O(n)",
      "optimal": true
    }
  },
  "1143": {
    "followUps": [
      "Why is this compressed state insufficient to reconstruct the subsequence directly?"
    ],
    "reference": {
      "title": "Two-string table",
      "explanation": "Let `dp[i][j]` be the answer for the first `i` chars of `a` and the first `j` chars of `b`. If the ==last characters match, they extend the diagonal: `dp[i-1][j-1] + 1`==. If not, one of them is useless at the end, so take the better of dropping either: `max(up, left)`.",
      "time": "O(m · n)",
      "space": "O(m · n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Rolling subsequence rows",
      "explanation": "Retain only the previous row and the current left neighbor while computing the standard common-subsequence recurrence.",
      "code": "class Solution:\n    def longestCommonSubsequence(self, text1: str, text2: str) -> int:\n        previous = [0]*(len(text2)+1)\n        for a in text1:\n            current = [0]\n            for j,b in enumerate(text2):\n                current.append(previous[j]+1 if a == b else max(previous[j+1],current[-1]))\n            previous = current\n        return previous[-1]\n",
      "time": "O(m · n)",
      "space": "O(n)",
      "optimal": true
    }
  },
  "309": {
    "followUps": [
      "How would a cooldown of c days change the sell transition?"
    ],
    "reference": {
      "title": "State machine",
      "explanation": "Each day you're in one of ==three states: `hold` (own a share), `sold` (sold today) or `rest` (no share, free to buy)==. Track the best profit for each. The cooldown is built in: you can only buy from `rest`, and `sold` only turns into `rest` the next day.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Memoized trading states",
      "explanation": "Cache each day with a holding/not-holding flag; selling advances by two days to honor the cooldown.",
      "code": "class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        @lru_cache(None)\n        def best(day,holding):\n            if day >= len(prices): return 0\n            if holding: return max(best(day+1,True), prices[day]+best(day+2,False))\n            return max(best(day+1,False), -prices[day]+best(day+1,True))\n        return best(0,False)\n",
      "time": "O(n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "518": {
    "followUps": [
      "What loop ordering would count ordered sequences instead of unordered combinations?"
    ],
    "reference": {
      "title": "Knapsack (items × amount)",
      "explanation": "`dp[a]` = number of ways to make `a`. Put ==coins in the outer loop==: after processing a coin, `dp` only counts combinations of coins up to that one, so order never matters (1+2 and 2+1 count once). Looping `a` upward lets a coin be reused.",
      "time": "O(amount · k)",
      "space": "O(amount)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Memoized coin choices",
      "explanation": "At each coin index, either use that coin again or move to the next denomination; order cannot create duplicate combinations.",
      "code": "class Solution:\n    def change(self, amount: int, coins: List[int]) -> int:\n        @lru_cache(None)\n        def ways(index,left):\n            if left == 0: return 1\n            if index == len(coins) or left < 0: return 0\n            return ways(index,left-coins[index])+ways(index+1,left)\n        return ways(0,amount)\n",
      "time": "O(amount · k)",
      "space": "O(amount · k)",
      "optimal": false
    }
  },
  "494": {
    "followUps": [
      "Why must adding and subtracting zero contribute two choices even though the resulting sum is identical?"
    ],
    "reference": {
      "title": "Knapsack (items × amount)",
      "explanation": "Process numbers one at a time and keep a map ==running sum → number of ways to reach it==. Each number splits every sum into `sum + n` and `sum − n`. Many sign choices land on the same sum, so the map stays small (at most `2 · total + 1` keys).",
      "time": "O(n · total)",
      "space": "O(total)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Sparse signed-sum counts",
      "explanation": "Map each reachable signed sum to its count, then create the next layer by adding and subtracting the next number. S is the reachable sum range.",
      "code": "class Solution:\n    def findTargetSumWays(self, nums: List[int], target: int) -> int:\n        counts = {0:1}\n        for value in nums:\n            following = defaultdict(int)\n            for total, ways in counts.items():\n                following[total+value] += ways\n                following[total-value] += ways\n            counts = following\n        return counts.get(target,0)\n",
      "time": "O(n · S)",
      "space": "O(S)",
      "optimal": false
    }
  },
  "97": {
    "followUps": [
      "How would you return the sequence of source choices for a successful interleaving?"
    ],
    "reference": {
      "title": "Two-string table",
      "explanation": "If you've used `i` chars of `s1` and `j` of `s2`, you've built exactly `s3[:i + j]`. So ==`dp[i][j]` = can the first `i` of `s1` and first `j` of `s2` form `s3[:i + j]`==. The last char came from `s1` (look up) or from `s2` (look left), and it must equal `s3[i + j - 1]`.",
      "time": "O(m · n)",
      "space": "O(m · n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Memoized interleaving positions",
      "explanation": "A state records how much of each source has been consumed; its sum determines the next target position.",
      "code": "class Solution:\n    def isInterleave(self, s1: str, s2: str, s3: str) -> bool:\n        if len(s1)+len(s2) != len(s3): return False\n        @lru_cache(None)\n        def visit(i,j):\n            if i+j == len(s3): return True\n            return (i < len(s1) and s1[i] == s3[i+j] and visit(i+1,j)) or (j < len(s2) and s2[j] == s3[i+j] and visit(i,j+1))\n        return visit(0,0)\n",
      "time": "O(m · n)",
      "space": "O(m · n)",
      "optimal": false
    }
  },
  "329": {
    "followUps": [
      "Why does strict increase guarantee that this cell graph has no directed cycle?"
    ],
    "reference": {
      "title": "Grid paths",
      "explanation": "The longest path from a cell is ==1 + the best of its strictly larger neighbours==. Strictly increasing means no cycles, so the answer per cell never changes: compute it once with DFS and ==memoise it==. Every cell is solved once, so the whole grid is O(m · n).",
      "time": "O(m · n)",
      "space": "O(m · n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Topological layers of increasing cells",
      "explanation": "Direct edges from smaller cells to larger neighbors. Peeling zero-indegree layers counts the longest increasing path without recursive DFS.",
      "code": "class Solution:\n    def longestIncreasingPath(self, matrix: List[List[int]]) -> int:\n        rows, cols = len(matrix), len(matrix[0])\n        indegree = [[0]*cols for _ in range(rows)]\n        for r in range(rows):\n            for c in range(cols):\n                indegree[r][c] = sum(0 <= r+dr < rows and 0 <= c+dc < cols and matrix[r+dr][c+dc] < matrix[r][c] for dr,dc in ((1,0),(-1,0),(0,1),(0,-1)))\n        queue = deque((r,c) for r in range(rows) for c in range(cols) if indegree[r][c] == 0)\n        layers = 0\n        while queue:\n            layers += 1\n            for _ in range(len(queue)):\n                r,c = queue.popleft()\n                for dr,dc in ((1,0),(-1,0),(0,1),(0,-1)):\n                    a,b = r+dr,c+dc\n                    if 0 <= a < rows and 0 <= b < cols and matrix[a][b] > matrix[r][c]:\n                        indegree[a][b] -= 1\n                        if indegree[a][b] == 0: queue.append((a,b))\n        return layers\n",
      "time": "O(R · C)",
      "space": "O(R · C)",
      "optimal": false
    }
  },
  "115": {
    "followUps": [
      "How would a one-row DP avoid overwriting values still needed for the same source character?"
    ],
    "reference": {
      "title": "Two-string table",
      "explanation": "`dp[i][j]` = ways to form `t[:j]` from `s[:i]`. The char `s[i-1]` can always be ==skipped (`dp[i-1][j]`)==; if it equals `t[j-1]` it can also be ==used to match (`dp[i-1][j-1]`)==, and the two counts add. An empty `t` can be formed exactly one way from anything.",
      "time": "O(m · n)",
      "space": "O(m · n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Memoized match-or-skip",
      "explanation": "At each source/target pair, skip the source character or match it when equal; an exhausted target contributes one completed subsequence.",
      "code": "class Solution:\n    def numDistinct(self, s: str, t: str) -> int:\n        @lru_cache(None)\n        def ways(i,j):\n            if j == len(t): return 1\n            if i == len(s): return 0\n            return ways(i+1,j)+(ways(i+1,j+1) if s[i] == t[j] else 0)\n        return ways(0,0)\n",
      "time": "O(m · n)",
      "space": "O(m · n)",
      "optimal": false
    }
  },
  "72": {
    "followUps": [
      "What state would you add if swapping two adjacent characters were an allowed edit?"
    ],
    "reference": {
      "title": "Two-string table",
      "explanation": "`dp[i][j]` = cost to turn `a[:i]` into `b[:j]`. If the ==last characters match, they cost nothing: take the diagonal==. Otherwise pay 1 for the cheapest of delete (up), insert (left) or replace (diagonal). Turning a prefix into the empty string costs its length.",
      "time": "O(m · n)",
      "space": "O(m · n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "One-row edit distances",
      "explanation": "Carry the previous row while evaluating insertion, deletion and substitution costs for each character pair.",
      "code": "class Solution:\n    def minDistance(self, word1: str, word2: str) -> int:\n        previous = list(range(len(word2)+1))\n        for i,a in enumerate(word1,1):\n            current = [i]\n            for j,b in enumerate(word2,1):\n                current.append(previous[j-1] if a == b else 1+min(previous[j],current[-1],previous[j-1]))\n            previous = current\n        return previous[-1]\n",
      "time": "O(m · n)",
      "space": "O(n)",
      "optimal": true
    }
  },
  "312": {
    "followUps": [
      "Why does choosing the first balloon make the remaining subproblems harder to separate?"
    ],
    "reference": {
      "title": "Interval DP",
      "explanation": "Choosing the first balloon to pop changes everyone's neighbours, which is messy. Instead pick the ==last balloon `k` to pop in the range `[l, r]`==: when it pops, its neighbours are the fixed walls `l - 1` and `r + 1`, and the two sides were solved independently. Pad the list with 1s and fill short ranges first.",
      "time": "O(n³)",
      "space": "O(n²)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Memoized last-balloon intervals",
      "explanation": "For each interval, choose its final balloon so its two remaining neighbors are known, and cache the best left/right subinterval scores.",
      "code": "class Solution:\n    def maxCoins(self, nums: List[int]) -> int:\n        values = [1]+nums+[1]\n        @lru_cache(None)\n        def best(left,right):\n            if right-left <= 1: return 0\n            return max(values[left]*values[k]*values[right]+best(left,k)+best(k,right) for k in range(left+1,right))\n        return best(0,len(values)-1)\n",
      "time": "O(n³)",
      "space": "O(n²)",
      "optimal": false
    }
  },
  "10": {
    "followUps": [
      "Why does a star apply to the preceding token rather than acting as a free-standing wildcard?"
    ],
    "reference": {
      "title": "Two-string table",
      "explanation": "`dp[i][j]` = does `p[:j]` match `s[:i]`. A normal char or `.` must match the last char of `s` and hand off to the diagonal. For `x*` there are two choices: ==use it zero times (`dp[i][j-2]`) or, if `x` matches `s[i-1]`, eat one more char and stay on the star (`dp[i-1][j]`)==.",
      "time": "O(m · n)",
      "space": "O(m · n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Memoized pattern positions",
      "explanation": "Match one character normally; for a following star, either skip the pair or consume another matching character without advancing the pattern.",
      "code": "class Solution:\n    def isMatch(self, s: str, p: str) -> bool:\n        @lru_cache(None)\n        def match(i,j):\n            if j == len(p): return i == len(s)\n            first = i < len(s) and p[j] in (s[i],'.')\n            if j+1 < len(p) and p[j+1] == '*':\n                return match(i,j+2) or (first and match(i+1,j))\n            return first and match(i+1,j+1)\n        return match(0,0)\n",
      "time": "O(m · n)",
      "space": "O(m · n)",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
