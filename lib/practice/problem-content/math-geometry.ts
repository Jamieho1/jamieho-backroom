/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "48": {
    "followUps": [
      "Can you perform the same coordinate mapping layer by layer without allocating a second matrix?"
    ],
    "reference": {
      "title": "Matrix index tricks",
      "explanation": "A clockwise turn sends `(r, c)` to `(c, n - 1 - r)`. That's two easy in-place moves: ==transpose (swap `[r][c]` with `[c][r]`), then reverse every row==. Each step only swaps pairs, so no extra matrix is needed.",
      "time": "O(n²)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Rotate through a separate matrix",
      "explanation": "Map each source cell to its rotated destination, then copy the complete rotated matrix back in place.",
      "code": "class Solution:\n    def rotate(self, matrix: List[List[int]]) -> None:\n        n = len(matrix)\n        rotated = [[matrix[n-1-c][r] for c in range(n)] for r in range(n)]\n        for r in range(n): matrix[r][:] = rotated[r]\n",
      "time": "O(n²)",
      "space": "O(n²)",
      "optimal": false
    }
  },
  "54": {
    "followUps": [
      "How would boundary indices avoid copying or deleting rows and columns?"
    ],
    "reference": {
      "title": "Matrix index tricks",
      "explanation": "Keep ==four walls: `top`, `bottom`, `left`, `right`==. Walk along the top wall, then the right, bottom and left, ==moving each wall inward right after you use it==. Re-check the walls before the bottom and left legs, or a single remaining row/column gets read twice.",
      "time": "O(m · n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Peel copied outer layers",
      "explanation": "Remove the top row and right edge, then the reversed bottom row and left edge from a working copy until empty.",
      "code": "class Solution:\n    def spiralOrder(self, matrix: List[List[int]]) -> List[int]:\n        work = [list(row) for row in matrix]\n        answer = []\n        while work and work[0]:\n            answer.extend(work.pop(0))\n            if work and work[0]:\n                for row in work: answer.append(row.pop())\n            if work and work[0]: answer.extend(reversed(work.pop()))\n            if work and work[0]:\n                for row in reversed(work): answer.append(row.pop(0))\n        return answer\n",
      "time": "O(m · n · min(m,n)) conservative bound for front deletions",
      "space": "O(m · n)",
      "optimal": false
    }
  },
  "73": {
    "followUps": [
      "Why do you need separate flags for the first row and first column in the constant-space version?"
    ],
    "reference": {
      "title": "Matrix index tricks",
      "explanation": "You need to remember which rows and columns to clear, but can't use extra arrays. So ==use row 0 and column 0 as the marker arrays==. They overlap at `[0][0]`, so let `[0][0]` mark column 0 and keep ==one extra flag `rowZero`== for row 0. Clear the inside first, then column 0, then row 0, so markers aren't wiped before they're read.",
      "time": "O(m · n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Record zero rows and columns",
      "explanation": "First collect row and column indices containing an original zero, then clear the marked cells in a separate pass.",
      "code": "class Solution:\n    def setZeroes(self, matrix: List[List[int]]) -> None:\n        rows,cols = set(),set()\n        for r,row in enumerate(matrix):\n            for c,value in enumerate(row):\n                if value == 0: rows.add(r); cols.add(c)\n        for r,row in enumerate(matrix):\n            for c in range(len(row)):\n                if r in rows or c in cols: matrix[r][c] = 0\n",
      "time": "O(m · n)",
      "space": "O(m + n)",
      "optimal": false
    }
  },
  "202": {
    "followUps": [
      "Why must repeated digit-square steps eventually enter a cycle for every positive starting integer?"
    ],
    "reference": {
      "title": "Digit by digit",
      "explanation": "The sequence either reaches 1 or ==falls into a loop== (the values stay small, so it must repeat). Keep a set of numbers you've seen: ==a repeat means a loop, so it never reaches 1==. Floyd's fast/slow pointers works too, with O(1) space.",
      "time": "O(log n)",
      "space": "O(log n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Floyd cycle detection",
      "explanation": "Treat sum-of-squared-digits as a next pointer and use slow/fast runners to detect a cycle without storing seen values.",
      "code": "class Solution:\n    def isHappy(self, n: int) -> bool:\n        def following(value):\n            total = 0\n            while value:\n                value,digit = divmod(value,10); total += digit*digit\n            return total\n        slow,fast = n,following(n)\n        while fast != 1 and slow != fast:\n            slow,fast = following(slow),following(following(fast))\n        return fast == 1\n",
      "time": "O(log n) digit work along the bounded state path",
      "space": "O(1)",
      "optimal": true
    }
  },
  "66": {
    "followUps": [
      "How would you increment a number stored as a linked list instead of an array?"
    ],
    "reference": {
      "title": "Digit by digit",
      "explanation": "Add 1 from the right, like on paper. ==A digit below 9 just goes up by one and you're done==. A 9 becomes 0 and the carry moves left. If ==every digit was 9==, the result is a 1 followed by zeros.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Integer conversion and reconstruction",
      "explanation": "Interpret the digits as one integer, increment it and extract the new digits by division.",
      "code": "class Solution:\n    def plusOne(self, digits: List[int]) -> List[int]:\n        value = 0\n        for digit in digits: value = value*10+digit\n        value += 1\n        answer = []\n        while value:\n            value,digit = divmod(value,10); answer.append(digit)\n        return answer[::-1]\n",
      "time": "O(n²) digit arithmetic bound",
      "space": "O(n)",
      "optimal": false
    }
  },
  "50": {
    "followUps": [
      "Why does handling a negative exponent before recursion simplify the base cases?"
    ],
    "reference": {
      "title": "Halve the exponent",
      "explanation": "`x^n` multiplied n times is too slow for big n. Write n in binary: ==each bit set in n multiplies in `x^(2^k)`==, and you get `x, x², x⁴, …` by ==squaring `x` each step while halving n==. A negative n is just `(1/x)^(-n)`.",
      "time": "O(log n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Recursive exponentiation by squaring",
      "explanation": "Recursively square the result for half the exponent, multiplying by the base only for odd exponents.",
      "code": "class Solution:\n    def myPow(self, x: float, n: int) -> float:\n        if n < 0: return self.myPow(1/x,-n)\n        if n == 0: return 1.0\n        half = self.myPow(x,n//2)\n        return half*half*(x if n%2 else 1)\n",
      "time": "O(log |n|)",
      "space": "O(log |n|)",
      "optimal": false
    }
  },
  "43": {
    "followUps": [
      "How would you generalize the digit arithmetic to another base?"
    ],
    "reference": {
      "title": "Digit by digit",
      "explanation": "Do long multiplication. The product of `num1[i]` and `num2[j]` ==lands at position `i + j + 1`== of a result array of length `m + n` (its carry goes to `i + j`). Process from the right, add into the slot, keep the ones digit and push the carry left. Strip leading zeros at the end.",
      "time": "O(m · n)",
      "space": "O(m + n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Accumulate shifted partial products",
      "explanation": "Multiply by one digit at a time, convert carries manually and add each shifted partial product without parsing the full strings as integers.",
      "code": "class Solution:\n    def multiply(self, num1: str, num2: str) -> str:\n        if num1 == '0' or num2 == '0': return '0'\n        answer = [0]*(len(num1)+len(num2))\n        for i,a in enumerate(reversed(num1)):\n            carry = 0\n            for j,b in enumerate(reversed(num2)):\n                total = answer[i+j]+(ord(a)-48)*(ord(b)-48)+carry\n                answer[i+j],carry = total%10,total//10\n            k = i+len(num2)\n            while carry:\n                total = answer[k]+carry\n                answer[k],carry = total%10,total//10\n                k += 1\n        while len(answer)>1 and answer[-1] == 0: answer.pop()\n        return ''.join(str(digit) for digit in reversed(answer))\n",
      "time": "O(m · n + (m+n)²)",
      "space": "O(m + n)",
      "optimal": false
    }
  },
  "2013": {
    "followUps": [
      "How would you count rectangles instead of squares using the same stored-point counts?"
    ],
    "reference": {
      "title": "Geometry with a point counter",
      "explanation": "Fix the query point and ==try every stored point as the opposite (diagonal) corner==: it must differ in x and y by the same non-zero amount. The other two corners are then fixed, so ==multiply their counts== from a `(x, y) → count` map. Duplicates multiply in naturally.",
      "time": "O(1) add, O(P) count",
      "space": "O(P)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Index points by column",
      "explanation": "Index multiplicities by x coordinate. For each other y on the query column, test the two possible opposite columns. C is the number of distinct y values on that column.",
      "code": "class DetectSquares:\n    def __init__(self): self.columns = defaultdict(Counter)\n    def add(self, point): self.columns[point[0]][point[1]] += 1\n    def count(self, point):\n        x,y = point\n        answer = 0\n        for other_y,copies in self.columns[x].items():\n            side = other_y-y\n            if side == 0: continue\n            for other_x in (x-side,x+side):\n                column = self.columns.get(other_x,{})\n                answer += copies*column.get(y,0)*column.get(other_y,0)\n        return answer\n",
      "time": "O(1) add; O(C) count",
      "space": "O(P)",
      "optimal": true
    }
  }
} satisfies Record<number,AuthoredContent>;
