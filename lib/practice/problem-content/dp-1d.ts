/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "70": {
    "followUps": [
      "How would the recurrence change if allowed jump sizes came from a supplied set?"
    ],
    "reference": {
      "title": "Last one or two steps",
      "explanation": "The last move onto step `i` was either a 1-step from `i - 1` or a 2-step from `i - 2`. So ==`ways(i) = ways(i - 1) + ways(i - 2)`==, which is Fibonacci. Only the last two values matter, so ==keep two variables== instead of a table.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Memoized stair counts",
      "explanation": "Cache the count for each remaining height, combining the two possible first steps.",
      "code": "class Solution:\n    def climbStairs(self, n: int) -> int:\n        @lru_cache(None)\n        def ways(left):\n            if left == 0: return 1\n            if left < 0: return 0\n            return ways(left-1)+ways(left-2)\n        return ways(n)\n",
      "time": "O(n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "746": {
    "followUps": [
      "How would you reconstruct the chosen steps as well as the minimum cost?"
    ],
    "reference": {
      "title": "Last one or two steps",
      "explanation": "To stand on stair `i` you came from `i - 1` (paying its price) or `i - 2` (paying that one). ==Take the cheaper of the two==. The \"top\" is one past the last stair, and the first two stairs are free to start on.",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Two rolling costs",
      "explanation": "Only the previous two minimum costs are needed to compute the next landing cost.",
      "code": "class Solution:\n    def minCostClimbingStairs(self, cost: List[int]) -> int:\n        a = b = 0\n        for i in range(2, len(cost)+1):\n            a,b = b,min(b+cost[i-1],a+cost[i-2])\n        return b\n",
      "time": "O(n)",
      "space": "O(1)",
      "optimal": true
    }
  },
  "198": {
    "followUps": [
      "How would you return the selected house indices without changing the optimum?"
    ],
    "reference": {
      "title": "Take or skip each item",
      "explanation": "At each house you either ==skip it== (keep the best so far) or ==take it== (its cash plus the best from two houses back). The answer for the first `i` houses only needs the previous two answers, so roll two variables.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Memoized take-or-skip choices",
      "explanation": "For each house index, compare taking it and skipping the next house with skipping it entirely.",
      "code": "class Solution:\n    def rob(self, nums: List[int]) -> int:\n        @lru_cache(None)\n        def best(index):\n            if index >= len(nums): return 0\n            return max(nums[index]+best(index+2),best(index+1))\n        return best(0)\n",
      "time": "O(n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "213": {
    "followUps": [
      "Why do those two ranges cover every legal solution on the circle?"
    ],
    "reference": {
      "title": "Take or skip each item",
      "explanation": "The circle only adds one rule: ==you can't take both the first and the last house==. So the answer is the better of two plain-row runs: ==one without the last house, one without the first==. A single house is the special case.",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Two rolling linear robberies",
      "explanation": "Exclude the final house or the first house, then solve each remaining index range with two rolling values.",
      "code": "class Solution:\n    def rob(self, nums: List[int]) -> int:\n        if len(nums) == 1: return nums[0]\n        def linear(start,end):\n            a = b = 0\n            for i in range(start,end): a,b = b,max(b,a+nums[i])\n            return b\n        return max(linear(0,len(nums)-1),linear(1,len(nums)))\n",
      "time": "O(n)",
      "space": "O(1)",
      "optimal": true
    }
  },
  "5": {
    "followUps": [
      "Can you reduce the worst-case running time below quadratic while still returning a longest substring?"
    ],
    "reference": {
      "title": "Expand around centre",
      "explanation": "Every palindrome mirrors around a centre: ==a single letter (odd length) or the gap between two letters (even length)==. From each of those centres, ==expand while both ends match==, and keep the longest span seen.",
      "time": "O(n²)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Palindrome table",
      "explanation": "A substring is a palindrome when its end characters match and its interior is already known to be a palindrome.",
      "code": "class Solution:\n    def longestPalindrome(self, s: str) -> str:\n        n = len(s)\n        table = [[False]*n for _ in range(n)]\n        start, length = 0, 0\n        for size in range(1,n+1):\n            for left in range(n-size+1):\n                right = left+size-1\n                table[left][right] = s[left] == s[right] and (size <= 2 or table[left+1][right-1])\n                if table[left][right] and size > length: start,length = left,size\n        return s[start:start+length]\n",
      "time": "O(n²)",
      "space": "O(n²)",
      "optimal": false
    }
  },
  "647": {
    "followUps": [
      "How would a palindrome table or center expansion avoid rechecking the entire substring?"
    ],
    "reference": {
      "title": "Expand around centre",
      "explanation": "Same centres as the longest-palindrome problem, but ==every successful expansion step is one more palindrome==. Count them instead of tracking the longest. Odd and even centres together cover every palindrome exactly once.",
      "time": "O(n²)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Check every substring",
      "explanation": "Reverse each candidate substring and count exact matches, including equal strings at different positions separately.",
      "code": "class Solution:\n    def countSubstrings(self, s: str) -> int:\n        return sum(s[left:right] == s[left:right][::-1] for left in range(len(s)) for right in range(left+1,len(s)+1))\n",
      "time": "O(n³)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "91": {
    "followUps": [
      "What new cases appear if an asterisk can stand for any digit from one to nine?"
    ],
    "reference": {
      "title": "Last one or two steps",
      "explanation": "The last letter used either ==one digit== (1–9, never \"0\") or ==two digits== (10–26). So it's Climbing Stairs where each step is only allowed if the digits form a valid code. Zeros are the trap: \"0\" alone is never a letter.",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Memoized digit suffixes",
      "explanation": "A suffix may consume one valid digit or a valid two-digit number; a leading zero contributes no decoding.",
      "code": "class Solution:\n    def numDecodings(self, s: str) -> int:\n        @lru_cache(None)\n        def ways(index):\n            if index == len(s): return 1\n            if s[index] == '0': return 0\n            answer = ways(index+1)\n            if index+1 < len(s) and int(s[index:index+2]) <= 26: answer += ways(index+2)\n            return answer\n        return ways(0)\n",
      "time": "O(n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "322": {
    "followUps": [
      "How would the answer change if each coin value had a limited available quantity?"
    ],
    "reference": {
      "title": "Unbounded pieces",
      "explanation": "Greedy (biggest coin first) can fail: with coins 1, 3, 4 and amount 6 it gives 4+1+1 but 3+3 is better. Instead ==solve every smaller amount first==: the best for `a` is ==one coin `c` plus the best for `a - c`==, tried over every coin.",
      "time": "O(amount · k)",
      "space": "O(amount)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Breadth-first amount search",
      "explanation": "Treat each reachable sum as a vertex and add one coin per edge; the first arrival at the target uses the fewest coins.",
      "code": "class Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        queue, seen = deque([(0,0)]), {0}\n        while queue:\n            value, count = queue.popleft()\n            if value == amount: return count\n            for coin in coins:\n                following = value+coin\n                if following <= amount and following not in seen:\n                    seen.add(following); queue.append((following,count+1))\n        return -1\n",
      "time": "O(amount · k)",
      "space": "O(amount)",
      "optimal": false
    }
  },
  "152": {
    "followUps": [
      "Why must an optimized scan retain both the largest and the smallest product ending here?"
    ],
    "reference": {
      "title": "Track max and min",
      "explanation": "With sums you only keep the best run ending here. With products, ==a very negative run times a negative number becomes very positive==. So carry ==both the max and the min product ending at `i`==; the new max is the best of `n`, `n·max` and `n·min`. Zero resets both, since `n` alone wins.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Enumerate all subarray products",
      "explanation": "Extend each start while maintaining its running product, recording negative and zero-containing intervals too.",
      "code": "class Solution:\n    def maxProduct(self, nums: List[int]) -> int:\n        best = nums[0]\n        for left in range(len(nums)):\n            product = 1\n            for right in range(left,len(nums)):\n                product *= nums[right]\n                best = max(best,product)\n        return best\n",
      "time": "O(n²)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "139": {
    "followUps": [
      "How would you return every valid segmentation rather than just whether one exists?"
    ],
    "reference": {
      "title": "Unbounded pieces",
      "explanation": "A prefix of length `i` is splittable if ==some word ends exactly at `i` and the part before it was already splittable==. Build that answer for every prefix length, from short to long. Words can be reused, just like coins.",
      "time": "O(n · m · k)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Memoized word matching",
      "explanation": "At each reachable suffix, try dictionary words that match there and cache whether the remainder can be segmented. m is dictionary size and k the longest word.",
      "code": "class Solution:\n    def wordBreak(self, s: str, wordDict: List[str]) -> bool:\n        @lru_cache(None)\n        def visit(index):\n            if index == len(s): return True\n            return any(s.startswith(word,index) and visit(index+len(word)) for word in wordDict)\n        return visit(0)\n",
      "time": "O(n · m · k)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "300": {
    "followUps": [
      "What extra predecessor information would recover one actual increasing subsequence?"
    ],
    "reference": {
      "title": "Best chain ending here",
      "explanation": "Ask for each position: ==what's the longest increasing chain that ends right here?== It's 1 plus the best chain ending at any earlier, smaller value. The answer is the biggest of those. (An O(n log n) version keeps a \"smallest tail per length\" list and binary-searches it.)",
      "time": "O(n²)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Patience-sorting tails",
      "explanation": "Keep the smallest possible tail for each subsequence length and binary-search the position of each new value.",
      "code": "class Solution:\n    def lengthOfLIS(self, nums: List[int]) -> int:\n        tails = []\n        for value in nums:\n            index = bisect_left(tails,value)\n            if index == len(tails): tails.append(value)\n            else: tails[index] = value\n        return len(tails)\n",
      "time": "O(n log n)",
      "space": "O(n)",
      "optimal": true
    }
  },
  "416": {
    "followUps": [
      "How would you adapt the state if negative integers were permitted?"
    ],
    "reference": {
      "title": "Take or skip each item",
      "explanation": "Two equal halves means ==one group sums to exactly `total / 2`== (so an odd total is impossible). That's 0/1 subset sum: each number is taken or skipped once. Keep a boolean per reachable sum and ==loop sums downwards== so a number can't be used twice in the same pass.",
      "time": "O(n · target)",
      "space": "O(target)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Reachable-sum set",
      "explanation": "Track sums achievable using the processed values, stopping once half the total is reachable.",
      "code": "class Solution:\n    def canPartition(self, nums: List[int]) -> bool:\n        total = sum(nums)\n        if total%2: return False\n        target, sums = total//2,{0}\n        for value in nums:\n            sums |= {old+value for old in sums if old+value <= target}\n            if target in sums: return True\n        return target in sums\n",
      "time": "O(n · target)",
      "space": "O(target)",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
