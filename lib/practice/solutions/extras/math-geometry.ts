import type { Extras } from "./types";

export const extras: Extras = {
  48: {
    time: { o: "O(n²)", why: "The transpose and the row reversals each ==touch every cell a constant number of times== (n = side length)." },
    space: { o: "O(1)", why: "Swaps happen in place; no second matrix." },
    pitfalls: [
      "Transposing with `c` starting at 0 instead of `r + 1`: every pair gets swapped twice and the matrix ends up unchanged.",
      "Reversing the columns instead of the rows: that rotates counter-clockwise.",
      "Building `rotated = [[...]]` and returning it: the problem wants the input changed in place, and the judge ignores a return value.",
      "Writing `matrix = new_matrix` only rebinds the local name; if you build a copy, write it back with `matrix[:] = ...`.",
    ],
  },
  54: {
    time: { o: "O(m · n)", why: "Every cell is ==appended exactly once== (m rows, n columns)." },
    space: { o: "O(1)", why: "Only the four walls besides the output list." },
    pitfalls: [
      "Leaving out the `top <= bottom` and `left <= right` checks before the bottom and left legs: a single leftover row or column gets read twice.",
      "Off-by-one on the reverse ranges: the bottom row is `range(right, left - 1, -1)` so `left` itself is included.",
      "Moving a wall before walking it: shrink each wall only after you have read along it.",
      "Using a visited grid with direction turns also works but costs O(m · n) space.",
    ],
  },
  73: {
    time: { o: "O(m · n)", why: "A constant number of ==full sweeps over the grid== (m rows, n columns)." },
    space: { o: "O(1)", why: "Row 0 and column 0 store the markers; only the `row_zero` flag is extra." },
    pitfalls: [
      "Zeroing rows and columns as soon as you find a 0: the new zeros then look like original ones and wipe out too much. Mark first, clear afterwards.",
      "Clearing row 0 or column 0 before the inner cells: you erase the markers you still need. Do the inner cells first, then column 0, then row 0.",
      "Forgetting that `[0][0]` is shared: it can only mark one of row 0 or column 0, so keep a separate flag for the other.",
      "Using sets of zero rows and columns is O(m + n) space; fine to start with, but the follow-up asks for O(1).",
    ],
  },
  202: {
    time: { o: "O(log n)", why: "Each step costs O(digits of n); after one step the value is ==at most 81 × digits==, so it shrinks fast and only a small, bounded number of further steps happen." },
    space: { o: "O(log n)", why: "The `seen` set; after the first step every value is small, so it stays tiny in practice." },
    pitfalls: [
      "No cycle check: an unhappy number loops forever (for example 4 → 16 → 37 → … → 4). Use a `seen` set or fast/slow pointers.",
      "Converting with `str(n)` each time is fine, but forgetting to reset `total` between steps carries old sums forward.",
      "Adding `n` to `seen` after the digit loop: by then `n` has been divided down to 0. Record it before splitting it into digits, as the code does.",
    ],
  },
  66: {
    time: { o: "O(n)", why: "In the worst case (all 9s) the carry ==walks the whole list== (n = len(digits))." },
    space: { o: "O(1)", why: "Changes `digits` in place; only the all-9s case builds a new list of length n + 1." },
    pitfalls: [
      "Converting the list to an int, adding 1 and splitting it back: works in Python but dodges the point, and overflows in fixed-width languages.",
      "Forgetting the all-9s case: `[9, 9]` must become `[1, 0, 0]`, which needs a new leading digit.",
      "Continuing the loop after a digit below 9: return straight away, since the carry has stopped.",
    ],
  },
  50: {
    time: { o: "O(log n)", why: "Each loop iteration ==halves `n`==, so it runs about log₂|n| times." },
    space: { o: "O(1)", why: "Iterative, so no recursion stack; only `res` and `x`." },
    pitfalls: [
      "Multiplying `x` by itself `n` times: O(n) and far too slow for n up to 2^31.",
      "Not handling negative `n`: flip it to `1 / x` and `-n`. In Java or C++, `-n` overflows for -2^31, so store it in a 64-bit integer first.",
      "Recursing as `myPow(x, n // 2) * myPow(x, n // 2)`: calling it twice per level brings back O(n) time; compute the half once and square it.",
    ],
  },
  43: {
    time: { o: "O(m · n)", why: "The nested loops ==multiply every digit pair once== (m = len(num1), n = len(num2))." },
    space: { o: "O(m + n)", why: "The `res` digit array; the product of an m-digit and n-digit number has at most m + n digits." },
    pitfalls: [
      "Putting the product at index `i + j` instead of `i + j + 1`: every digit shifts by one place.",
      "Assigning to `res[i + j]` instead of adding to it: the carry overwrites a value already stored there.",
      "Forgetting to strip leading zeros, or stripping them from `\"0\"` and returning an empty string; the early return for a zero input avoids that.",
      "Calling `int(num1) * int(num2)`: works in Python but the problem forbids converting the whole number.",
    ],
  },
  2013: {
    time: { o: "O(1) add, O(P) count", why: "`add` is a single map update; `count` ==scans every distinct stored point== as a possible diagonal corner (P = distinct points)." },
    space: { o: "O(P)", why: "The `cnt` map holds one entry per distinct point." },
    pitfalls: [
      "Allowing zero-size squares: skip any diagonal candidate with `x == px` (which also means `y == py`).",
      "Storing points in a set: duplicates must count separately, so multiply the counts of all three other corners.",
      "Looking up a missing corner with `self.cnt[(x, py)]` on a `defaultdict` inserts a 0 entry during the loop; use `.get(..., 0)` or iterate over a copy.",
    ],
  },
};
