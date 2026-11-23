/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "125": {
    "followUps": [
      "Can a forward-only stream be checked exactly without storing the text?"
    ],
    "reference": {
      "title": "Converge from both ends",
      "explanation": "A palindrome mirrors around its centre, so ==compare the outermost characters and walk inward==. Characters that aren't letters or digits don't count, so ==skip them in place== instead of building a cleaned copy. One mismatch is enough to say no.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Filter and reverse",
      "explanation": "Materialize the normalized alphanumeric text, then compare it with its reverse.",
      "code": "class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        clean = ''.join(c.lower() for c in s if c.isalnum())\n        return clean == clean[::-1]\n",
      "time": "O(n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "167": {
    "followUps": [
      "How would the strategy change if the sorted array lived on disk and random reads were expensive?"
    ],
    "reference": {
      "title": "Converge from both ends",
      "explanation": "Because the list is sorted, the sum tells you which way to go. ==Too small? Move `l` right== to a bigger number. ==Too big? Move `r` left== to a smaller one. Each step throws away a value that can't be part of any answer, so one pass is enough and no hash map is needed.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Search for each complement",
      "explanation": "For each left index, binary-search only the suffix for its complement.",
      "code": "class Solution:\n    def twoSum(self, numbers: List[int], target: int) -> List[int]:\n        for i, value in enumerate(numbers):\n            j = bisect_left(numbers, target - value, i + 1)\n            if j < len(numbers) and numbers[j] == target - value:\n                return [i + 1, j + 1]\n        return []\n",
      "time": "O(n log n)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "15": {
    "followUps": [
      "How would you generalize the sorted two-pointer idea to finding four values with a target sum?"
    ],
    "reference": {
      "title": "Fix one, then converge",
      "explanation": "Sort the list, then ==fix the first number `a`== and the problem becomes Two Sum II on the rest with target `-a`. Sorting also makes duplicates sit next to each other, so ==skip a value equal to the one before it== (for `a` and for `l` after a hit) and every triple comes out once.",
      "time": "O(n²)",
      "space": "O(1) extra"
    },
    "alternative": {
      "id": "alternative",
      "title": "Enumerate triples",
      "explanation": "Try all index triples, and use a set of sorted triples to remove duplicate answers. r is the number of output triples.",
      "code": "class Solution:\n    def threeSum(self, nums: List[int]) -> List[List[int]]:\n        answer = set()\n        for i in range(len(nums)):\n            for j in range(i + 1, len(nums)):\n                for k in range(j + 1, len(nums)):\n                    if nums[i] + nums[j] + nums[k] == 0:\n                        answer.add(tuple(sorted((nums[i], nums[j], nums[k]))))\n        return [list(t) for t in sorted(answer)]\n",
      "time": "O(n³)",
      "space": "O(r)",
      "optimal": false
    }
  },
  "11": {
    "followUps": [
      "Why is moving the shorter boundary safe even when several heights are equal?"
    ],
    "reference": {
      "title": "Move the shorter wall",
      "explanation": "Water held = ==`min(height[l], height[r]) × (r - l)`==. Start with the widest pair. Moving the taller wall inward can only shrink the width while the shorter wall still caps the height, so it can never help. ==Always move the shorter wall==: it's the only move that might find a taller limit.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Enumerate boundary pairs",
      "explanation": "Evaluate the water area for every left/right wall pair.",
      "code": "class Solution:\n    def maxArea(self, height: List[int]) -> int:\n        best = 0\n        for left in range(len(height)):\n            for right in range(left + 1, len(height)):\n                best = max(best, (right - left) * min(height[left], height[right]))\n        return best\n",
      "time": "O(n²)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "42": {
    "followUps": [
      "How would your answer change if bars had different widths?"
    ],
    "reference": {
      "title": "Move the shorter wall",
      "explanation": "Water above bar `i` is ==`min(maxLeft, maxRight) - height[i]`==. With pointers at both ends, keep `leftMax` and `rightMax`. ==Move the side with the smaller max==: on that side the smaller max is the real limit (the other side already has something at least as tall), so you can add its water right away.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Prefix and suffix maxima",
      "explanation": "Precompute the highest wall on each side; their minimum caps the water at a position.",
      "code": "class Solution:\n    def trap(self, height: List[int]) -> int:\n        if not height:\n            return 0\n        left, right = height[:], height[:]\n        for i in range(1, len(height)):\n            left[i] = max(left[i], left[i-1])\n        for i in range(len(height)-2, -1, -1):\n            right[i] = max(right[i], right[i+1])\n        return sum(min(left[i], right[i]) - h for i, h in enumerate(height))\n",
      "time": "O(n)",
      "space": "O(n)",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
