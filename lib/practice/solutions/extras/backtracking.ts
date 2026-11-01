import type { Extras } from "./types";

export const extras: Extras = {
  78: {
    time: { o: "O(n · 2ⁿ)", why: "The tree has ==one node per subset==, 2ⁿ of them, and each node copies `cur` in up to O(n) (n = len(nums))." },
    space: { o: "O(n)", why: "Recursion depth and `cur` are at most n; the 2ⁿ subsets in `res` are output and not counted." },
    pitfalls: [
      "Appending `cur` instead of `cur.copy()`: every entry in `res` points at the same list, which is empty at the end.",
      "Recursing with `dfs(start + 1)` instead of `dfs(j + 1)`: items get reused and orders repeat, giving bogus subsets like `[2, 2]` and `[2, 1]`.",
      "Forgetting `cur.pop()` after the recursive call: later siblings inherit stale items.",
      "Forgetting the empty subset: record `cur` at the top of every call, before the loop.",
    ],
  },
  39: {
    time: { o: "O(n^(t/m))", why: "Each level branches into at most n candidates and the path is ==at most t/m deep== (t = target, m = smallest candidate), so the tree has at most about n^(t/m) nodes; the sort-and-break prunes most of it." },
    space: { o: "O(t/m)", why: "Recursion depth and `cur` length are bounded by how many copies of the smallest candidate fit in the target." },
    pitfalls: [
      "Recursing with `j + 1`: that forbids reuse, so `[2, 2, 3]` is never found.",
      "Looping from 0 instead of `start`: you produce the same combination in different orders, like `[2, 3, 2]`.",
      "Using `break` without sorting first: a later, smaller candidate could still fit, so you lose answers. Either sort or use `continue`.",
      "Checking `total > target` only at the top of the call: works, but explores one wasted level per branch; pruning in the loop is cleaner.",
    ],
  },
  40: {
    time: { o: "O(n · 2ⁿ)", why: "Each candidate is either in or out of a combination, so there are ==at most 2ⁿ paths==, and copying a match costs O(n) (n = len(candidates))." },
    space: { o: "O(n)", why: "Recursion depth and `cur` are at most n, plus the sort's auxiliary memory." },
    pitfalls: [
      "Skipping duplicates with `j > 0` instead of `j > start`: that also blocks going deeper with an equal value, so `[1, 1, 6]` disappears.",
      "Not sorting first: equal values aren't adjacent, so the skip check misses them and you output repeats.",
      "Recursing with `j` instead of `j + 1`: each candidate can be reused, which this problem forbids.",
      "Deduping with a set of tuples at the end: correct, but it still explores every duplicate branch; with up to 100 candidates that can time out.",
    ],
  },
  46: {
    time: { o: "O(n · n!)", why: "There are ==n! complete orderings==, each copied in O(n); the inner nodes add only a constant factor on top (n = len(nums))." },
    space: { o: "O(n)", why: "`used`, `cur` and the recursion stack are each length n; the n! results are output." },
    pitfalls: [
      "Forgetting to reset `used[i] = False` after the call: the next sibling branch thinks the item is still taken and you return far too few permutations.",
      "Using a start index like subsets: that only produces increasing orders, i.e. one permutation.",
      "Checking `nums[i] in cur` instead of a `used` array: works for distinct values but is O(n) per check and breaks if values repeat.",
    ],
  },
  90: {
    time: { o: "O(n · 2ⁿ)", why: "There are ==at most 2ⁿ distinct subsets==, each copied in O(n), plus the O(n log n) sort (n = len(nums))." },
    space: { o: "O(n)", why: "Recursion depth and `cur` are at most n; the subsets themselves are output." },
    pitfalls: [
      "Comparing with `j > 0` instead of `j > start`: you can never build `[2, 2]` because the deeper second 2 gets skipped too.",
      "Forgetting to sort: duplicates aren't next to each other, so `nums[j] == nums[j - 1]` doesn't catch them.",
      "Generating all subsets and deduping with `set(tuple(sorted(s)))`: correct but wasteful, and the sort inside is easy to forget.",
    ],
  },
  79: {
    time: { o: "O(R · C · 4^L)", why: "Each of the R·C start cells can launch a search that ==branches 4 ways for up to L letters== (L = len(word)); in practice it's closer to 3^L since you never step back onto the cell you came from." },
    space: { o: "O(L)", why: "The recursion goes at most L deep; marking with `#` in place avoids a separate visited set." },
    pitfalls: [
      "Forgetting to restore `board[r][c]` before returning: later start cells see a corrupted grid and miss valid paths.",
      "Checking bounds after reading `board[r][c]`: negative indices silently wrap around in Python instead of failing.",
      "Returning as soon as `i == len(word) - 1` matches without checking the letter: test `i == len(word)` at the top instead, as the code does.",
      "Using one shared `visited` set without removing cells on backtrack: same bug as not restoring the letter.",
    ],
  },
  131: {
    time: { o: "O(n · 2ⁿ)", why: "A string of length n has ==2ⁿ⁻¹ ways to place cuts==, and each palindrome check or copy costs O(n) (n = len(s))." },
    space: { o: "O(n)", why: "Recursion depth and `part` are at most n; slicing creates O(n) temporary strings per level." },
    pitfalls: [
      "Off-by-one in the slice: the piece is `s[i : j + 1]`, and the next call starts at `j + 1`, not `j`.",
      "Recording `part` before reaching the end of the string: only `i == len(s)` means the whole string was cut.",
      "Appending `part` instead of `part.copy()`: every saved partition ends up as the same empty list.",
      "Rechecking the same substrings many times: fine at n ≤ 16, but mention a DP table `isPal[i][j]` as the speed-up.",
    ],
  },
  17: {
    time: { o: "O(n · 4ⁿ)", why: "Each digit has at most 4 letters, so there are ==at most 4ⁿ strings==, and building each with `cur + ch` costs O(n) (n = len(digits))." },
    space: { o: "O(n)", why: "Recursion depth is n and each frame holds a string of length ≤ n; the results are output." },
    pitfalls: [
      "Returning `[\"\"]` for empty input: the expected answer is `[]`, so check `if not digits` first.",
      "Forgetting that 7 and 9 have four letters (`pqrs`, `wxyz`): hard-coding 3 per key drops answers.",
      "Mutating a shared list of chars without popping: if you use `cur.append`, remember `cur.pop()`; passing `cur + ch` avoids this.",
    ],
  },
  51: {
    time: { o: "O(n!)", why: "Row 0 has n choices, row 1 at most n − 1 non-clashing columns, and so on, so the search ==shrinks like n!==; each set check is O(1)." },
    space: { o: "O(n²)", why: "The `board` is n × n; the three sets and the recursion stack are only O(n)." },
    pitfalls: [
      "Using `r + c` for both diagonals: one direction needs `r + c` and the other `r - c`, otherwise half the attacks go unchecked.",
      "Forgetting to remove all three keys and reset `board[r][c]` on the way back: later branches see phantom queens.",
      "Saving `board` itself instead of `[''.join(row) for row in board]`: the saved grid keeps changing as you backtrack.",
      "Scanning the whole board to test safety: O(n) per square instead of O(1) with the sets.",
    ],
  },
};
