/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "217": {
    "followUps": [
      "How would you detect a repeated value in an unbounded stream with a fixed memory budget?",
      "If modifying the input were allowed, how would sorting trade memory for extra running time?"
    ],
    "reference": {
      "title": "Seen-before set",
      "explanation": "Comparing every pair is O(n²). Instead, remember what you've already seen. A ==hash set answers \"seen it?\" in O(1)==, so the first time a number is already in the set, there's a duplicate.",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Pairwise checks",
      "explanation": "Compare each position with all earlier positions. This avoids a lookup structure but repeats work as the list grows.",
      "code": "class Solution:\n    def containsDuplicate(self, nums: List[int]) -> bool:\n        for i, value in enumerate(nums):\n            for j in range(i):\n                if nums[j] == value:\n                    return True\n        return False\n",
      "time": "O(n²)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "242": {
    "followUps": [
      "How would your counting key change if the input allowed arbitrary Unicode characters?"
    ],
    "reference": {
      "title": "Count map",
      "explanation": "Two strings are anagrams exactly when ==every letter appears the same number of times== in both. Different lengths can't match. Count letters in one string, subtract counts for the other, and check everything lands back on zero.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Sort both words",
      "explanation": "Sorted character sequences are equal exactly when the words contain the same letters with the same multiplicities.",
      "code": "class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        return sorted(s) == sorted(t)\n",
      "time": "O(n log n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "49": {
    "followUps": [
      "How could you group words arriving one at a time without rebuilding the existing groups?"
    ],
    "reference": {
      "title": "Count map",
      "explanation": "Anagrams share the same ==letter counts==. Turn each word's 26 counts into a ==tuple== (lists can't be dict keys) and use it as the key. Every word with the same key belongs in the same group.",
      "time": "O(m · n)",
      "space": "O(m · n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Sorted-word key",
      "explanation": "Sort each word to get a stable group key, then collect words with equal keys. Here m is the number of words and n the longest word length.",
      "code": "class Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        groups = defaultdict(list)\n        for word in strs:\n            groups[''.join(sorted(word))].append(word)\n        return list(groups.values())\n",
      "time": "O(m · n log n)",
      "space": "O(m · n)",
      "optimal": false
    }
  },
  "1": {
    "followUps": [
      "What changes if you must return every unique pair rather than one valid pair?"
    ],
    "reference": {
      "title": "Value → index map",
      "explanation": "For each number `n`, the partner you need is ==`target - n`==. If you remember every number you've passed ==with its index==, you can check for the partner in O(1). Check ==before== inserting, so a number never pairs with itself.",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Try every pair",
      "explanation": "Test each pair once and return the first matching pair of original indices.",
      "code": "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        for i in range(len(nums)):\n            for j in range(i + 1, len(nums)):\n                if nums[i] + nums[j] == target:\n                    return [i, j]\n        return []\n",
      "time": "O(n²)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "347": {
    "followUps": [
      "How would you maintain the most frequent values when counts change continuously?"
    ],
    "reference": {
      "title": "Count map",
      "explanation": "Count each value first. A frequency can never be more than `n`, so instead of sorting, use ==bucket sort==: bucket `i` holds the values that appear `i` times. ==Walk the buckets from the highest frequency down== until you've collected k values. That's O(n), not O(n log n).",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Sort the counts",
      "explanation": "Count each distinct value, then sort the u values by frequency and take the first k.",
      "code": "class Solution:\n    def topKFrequent(self, nums: List[int], k: int) -> List[int]:\n        counts = Counter(nums)\n        return sorted(counts, key=counts.get, reverse=True)[:k]\n",
      "time": "O(n + u log u)",
      "space": "O(u)",
      "optimal": false
    }
  },
  "238": {
    "followUps": [
      "How would you support updates to the input and repeated product-except-one queries?"
    ],
    "reference": {
      "title": "Prefix / postfix passes",
      "explanation": "Every answer splits into two halves: ==everything to the left of i== and ==everything to the right of i==. Rather than multiplying those again for each index, build them once:\n\n* `pref[i]` = product of the numbers ==before== `i` (nothing before index 0, so 1).\n* `suff[i]` = product of the numbers ==after== `i` (nothing after the last index, so 1).\n\nThen `res[i] = pref[i] * suff[i]`: the left half times the right half is ==every number except nums[i]==.",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Prefix product in the output",
      "explanation": "Store prefixes in the result itself, then multiply a running suffix into each slot. No division or separate prefix/suffix arrays are needed.",
      "code": "class Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        answer = [1] * len(nums)\n        prefix = 1\n        for i, value in enumerate(nums):\n            answer[i] = prefix\n            prefix *= value\n        suffix = 1\n        for i in range(len(nums) - 1, -1, -1):\n            answer[i] *= suffix\n            suffix *= nums[i]\n        return answer\n",
      "time": "O(n)",
      "space": "O(1) auxiliary; O(n) output",
      "optimal": true
    }
  },
  "36": {
    "followUps": [
      "What would need to change for a board with b×b boxes rather than fixed 3×3 boxes?"
    ],
    "reference": {
      "title": "Seen-before set",
      "explanation": "It's \"contains duplicate\" three times at once. Keep ==one set per row, one per column and one per 3×3 box==. A cell's box is ==`(r // 3, c // 3)`==. If a digit is already in any of its three sets, the board is invalid.",
      "time": "O(1)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Check each unit separately",
      "explanation": "Build rows, columns and boxes as small sequences and reject duplicate nonblank entries in each.",
      "code": "class Solution:\n    def isValidSudoku(self, board: List[List[str]]) -> bool:\n        units = [list(row) for row in board]\n        units += [[board[r][c] for r in range(9)] for c in range(9)]\n        units += [[board[r + dr][c + dc] for dr in range(3) for dc in range(3)] for r in (0,3,6) for c in (0,3,6)]\n        for unit in units:\n            values = [x for x in unit if x != '.']\n            if len(values) != len(set(values)):\n                return False\n        return True\n",
      "time": "O(1) for a 9×9 board",
      "space": "O(1)",
      "optimal": false
    }
  },
  "271": {
    "followUps": [
      "Could you decode one string at a time from a network stream without waiting for the whole message?"
    ],
    "reference": {
      "title": "Length-prefix encoding",
      "explanation": "A plain delimiter breaks as soon as a string contains it. Instead write ==the length, then `#`, then the string==. When decoding, read digits up to `#` to get the length, then ==jump exactly that many characters==. Whatever is inside the string never confuses the reader.",
      "time": "O(N)",
      "space": "O(1) extra"
    },
    "alternative": {
      "id": "alternative",
      "title": "JSON framing",
      "explanation": "A standard JSON array provides escaping and boundaries, so delimiter characters and empty strings round-trip safely. N is the encoded size.",
      "code": "class Codec:\n    def encode(self, strs):\n        import json\n        return json.dumps(strs, ensure_ascii=False)\n    def decode(self, s):\n        import json\n        return json.loads(s)\n",
      "time": "O(N)",
      "space": "O(N)",
      "optimal": false
    }
  },
  "128": {
    "followUps": [
      "How would you keep the longest streak up to date as values are inserted?"
    ],
    "reference": {
      "title": "Seen-before set",
      "explanation": "Put everything in a set. A number ==starts a run only if `n - 1` is not in the set==. From each start, count up while `n + 1`, `n + 2`, … exist. Each number is walked over at most once from a real start, so the whole thing is O(n).",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Sort and scan",
      "explanation": "Sorting places consecutive values next to each other. Skip duplicates and restart the streak at a gap.",
      "code": "class Solution:\n    def longestConsecutive(self, nums: List[int]) -> int:\n        ordered = sorted(set(nums))\n        best = streak = 0\n        previous = None\n        for value in ordered:\n            streak = streak + 1 if previous is not None and value == previous + 1 else 1\n            best = max(best, streak)\n            previous = value\n        return best\n",
      "time": "O(n log n)",
      "space": "O(n)",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
