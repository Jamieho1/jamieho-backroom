/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "121": {
    "followUps": [
      "What state would you add if at most two nonoverlapping trades were allowed?"
    ],
    "reference": {
      "title": "Jump left to the best start",
      "explanation": "For each sell day, the best buy day is ==the cheapest day before it==. Keep `l` on the lowest price seen so far and let `r` scan forward. If `prices[r]` is even lower, ==`l` jumps to `r`==: no earlier day can beat a new low.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Try every buy/sell pair",
      "explanation": "Consider every later sale for each purchase day, keeping zero as the no-trade option.",
      "code": "class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        best = 0\n        for i in range(len(prices)):\n            for j in range(i + 1, len(prices)):\n                best = max(best, prices[j] - prices[i])\n        return best\n",
      "time": "O(n²)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "3": {
    "followUps": [
      "How would you return the actual longest substring while keeping the same asymptotic cost?"
    ],
    "reference": {
      "title": "Grow, shrink while invalid (longest)",
      "explanation": "Keep a window `[l, r]` with no repeats and a set of its characters. Adding `s[r]` can only break the rule if it's already in the set, so ==shrink from the left until that old copy is gone==. The window is always valid, so its size is a candidate answer.",
      "time": "O(n)",
      "space": "O(k)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Restart a distinct window",
      "explanation": "Start at each character and extend a set until the first repeated character. k is the alphabet size.",
      "code": "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        best = 0\n        for start in range(len(s)):\n            seen = set()\n            for end in range(start, len(s)):\n                if s[end] in seen:\n                    break\n                seen.add(s[end])\n                best = max(best, end - start + 1)\n        return best\n",
      "time": "O(n²)",
      "space": "O(k)",
      "optimal": false
    }
  },
  "424": {
    "followUps": [
      "How would the solution change if replacement costs depended on the original and target characters?"
    ],
    "reference": {
      "title": "Grow, shrink while invalid (longest)",
      "explanation": "In a window, keep the most common letter and change the rest. So the window is valid when ==`size - maxCount <= k`==. Grow `r`; when it breaks, slide `l` forward. `maxCount` never needs to go down: ==the answer only improves when a bigger `maxCount` shows up==, so a stale value is safe.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Count every candidate window",
      "explanation": "For each start, maintain character counts as the end advances; a window is feasible when its length minus its largest count is at most k.",
      "code": "class Solution:\n    def characterReplacement(self, s: str, k: int) -> int:\n        best = 0\n        for left in range(len(s)):\n            counts = Counter()\n            most = 0\n            for right in range(left, len(s)):\n                counts[s[right]] += 1\n                most = max(most, counts[s[right]])\n                if right-left+1-most <= k:\n                    best = max(best, right-left+1)\n        return best\n",
      "time": "O(n²)",
      "space": "O(1) for the fixed alphabet",
      "optimal": false
    }
  },
  "567": {
    "followUps": [
      "How would you report every matching window instead of stopping at the first one?"
    ],
    "reference": {
      "title": "Fixed-size window + counts",
      "explanation": "A rearrangement has exactly the same letter counts and the same length. So slide a ==window of length `len(s1)`== across `s2` and compare its 26 counts to `s1`'s. Each slide ==adds one letter and removes one==, so updating the counts is O(1).",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Recount fixed-size windows",
      "explanation": "Compare the character multiset of every length-m window with the pattern.",
      "code": "class Solution:\n    def checkInclusion(self, s1: str, s2: str) -> bool:\n        need = Counter(s1)\n        return any(Counter(s2[i:i+len(s1)]) == need for i in range(len(s2)-len(s1)+1))\n",
      "time": "O(n · m)",
      "space": "O(m)",
      "optimal": false
    }
  },
  "76": {
    "followUps": [
      "How would you adapt the window counts when the target requires repeated characters?"
    ],
    "reference": {
      "title": "Grow until valid, shrink while valid (shortest)",
      "explanation": "Grow `r` until the window covers `t`, then ==shrink `l` while it still covers `t`==, recording each size: that finds the shortest valid window ending at `r`. Instead of comparing whole count maps, track ==`have` = how many distinct letters already meet their required count==; the window is valid when `have == need`.",
      "time": "O(n + m)",
      "space": "O(k)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Extend from every start",
      "explanation": "Grow each candidate window until it covers the required multiplicities; remember the shortest successful window.",
      "code": "class Solution:\n    def minWindow(self, s: str, t: str) -> str:\n        need = Counter(t)\n        if not t:\n            return ''\n        best = ''\n        for left in range(len(s)):\n            counts = Counter()\n            missing = len(t)\n            for right in range(left, len(s)):\n                ch = s[right]\n                if counts[ch] < need[ch]:\n                    missing -= 1\n                counts[ch] += 1\n                if missing == 0:\n                    candidate = s[left:right+1]\n                    if not best or len(candidate) < len(best):\n                        best = candidate\n                    break\n        return best\n",
      "time": "O(n² + m)",
      "space": "O(k)",
      "optimal": false
    }
  },
  "239": {
    "followUps": [
      "How would you support a changing window size while still answering maxima?"
    ],
    "reference": {
      "title": "Fixed window + monotonic deque",
      "explanation": "Rescanning each window is O(n · k). A number smaller than a newer number to its right ==can never be a window max again==, so throw it away. That leaves a deque of indexes whose values are decreasing: ==the front is the current max==, and you pop it once its index slides out of the window.",
      "time": "O(n)",
      "space": "O(k)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Scan each window",
      "explanation": "Compute a maximum independently for every length-k slice.",
      "code": "class Solution:\n    def maxSlidingWindow(self, nums: List[int], k: int) -> List[int]:\n        return [max(nums[i:i+k]) for i in range(len(nums)-k+1)]\n",
      "time": "O(n · k)",
      "space": "O(k)",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
