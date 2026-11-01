import type { Extras } from "./types";

export const extras: Extras = {
  62: {
    time: { o: "O(m · n)", why: "Every cell is filled once with ==one addition== from above and from the left." },
    space: { o: "O(m · n)", why: "The full `dp` grid; since each row only needs the row above, a single row of length `n` is enough." },
    pitfalls: [
      "Initialising the first row and column to 0: they must be 1, since there is exactly one straight path along each edge.",
      "Building the grid with `[[1] * n] * m`: every row is the same list object, so writing one row overwrites them all.",
      "Plain recursion without a memo is exponential; the closed form C(m + n − 2, m − 1) is a nice follow-up but explain the dp first.",
    ],
  },
  1143: {
    time: { o: "O(m · n)", why: "Each of the `(m + 1) × (n + 1)` cells is filled once in ==constant time== (m, n = the two string lengths)." },
    space: { o: "O(m · n)", why: "The full table; keeping just the previous row (and one saved diagonal value) reduces it to O(min(m, n))." },
    pitfalls: [
      "Indexing `text1[i]` instead of `text1[i - 1]`: row/column 0 stand for the empty prefix, so the table is shifted by one.",
      "On a match taking `max(up, left) + 1` instead of `diagonal + 1`: that can count the same character twice.",
      "Confusing subsequence with substring: gaps are allowed, so a mismatch carries the best value forward instead of resetting to 0.",
    ],
  },
  309: {
    time: { o: "O(n)", why: "One pass over the prices with ==three constant-time updates per day== (n = len(prices))." },
    space: { o: "O(1)", why: "Only the three state values `hold`, `sold` and `rest`." },
    pitfalls: [
      "Updating the states one after another: `sold = hold + p` must use yesterday's `hold`, so update all three in one tuple assignment.",
      "Buying from `sold` instead of `rest`: that skips the cooldown day and overcounts profit.",
      "Starting `hold = 0`: you cannot hold a share for free; use negative infinity (or `-prices[0]`).",
    ],
  },
  518: {
    time: { o: "O(amount · k)", why: "For each of the `k` coins we ==sweep every amount from `coin` up to `amount`== once (k = len(coins))." },
    space: { o: "O(amount)", why: "A single `dp` row of `amount + 1` counts, reused across coins." },
    pitfalls: [
      "Putting amounts in the outer loop and coins inside: that counts orderings, so 1 + 2 and 2 + 1 become two answers.",
      "Looping amounts downward: each coin could then be used only once (0/1 knapsack), but here coins are unlimited.",
      "Setting `dp[0] = 0`: there is exactly one way to make 0 (no coins), and every count builds on it; with `amount = 0` the answer is 1.",
    ],
  },
  494: {
    time: { o: "O(n · total)", why: "For each of the `n` numbers we touch every reachable sum, and there are ==at most `2 · total + 1` of them== (total = sum(nums))." },
    space: { o: "O(total)", why: "Two maps (`dp` and `nxt`) of at most `2 · total + 1` keys each." },
    pitfalls: [
      "Plain recursion over every sign choice is 2^n; it passes at n = 20 but memoising on `(i, sum)` or using the sum map is what interviewers want.",
      "Updating `dp` in place while iterating it: new keys appear mid-loop and Python raises an error; build a fresh `nxt` each round.",
      "Zeros: +0 and −0 are two different sign choices, so a 0 doubles the count; the map handles it because both updates hit the same key.",
      "In the array version (offset by `total`), forgetting that `abs(target) > total` is unreachable: return 0 before indexing out of range.",
    ],
  },
  97: {
    time: { o: "O(m · n)", why: "Each cell of the `(m + 1) × (n + 1)` table is filled once with ==two constant-time checks== (m, n = len(s1), len(s2))." },
    space: { o: "O(m · n)", why: "The full boolean table; one row of length `n + 1` is enough if you overwrite it as you go." },
    pitfalls: [
      "Skipping the length check: if `len(s1) + len(s2) != len(s3)` the answer is False, and without the check `s3[i + j - 1]` can go out of range.",
      "Greedy two-pointer matching (take from `s1` whenever it fits): when both strings offer the same character you may need to back up, which only the dp handles.",
      "Comparing against `s3[i + j]` instead of `s3[i + j - 1]`: with `i + j` characters used, the last one placed is at index `i + j - 1`.",
      "Empty strings are allowed: the first row and column must still be filled, which the `(0, 0)` skip handles.",
    ],
  },
  329: {
    time: { o: "O(m · n)", why: "Thanks to the memo, ==each cell's DFS body runs once== and checks 4 neighbours (m × n = grid size)." },
    space: { o: "O(m · n)", why: "The `memo` holds one entry per cell, and the recursion stack can be as deep as the longest path, also up to m · n." },
    pitfalls: [
      "Adding a visited set like normal DFS: it is unnecessary (strictly increasing paths cannot loop) and, if not reset, blocks valid paths.",
      "Using `>=` instead of `>`: equal neighbours would allow cycles and infinite recursion.",
      "Deep recursion: a 200 × 200 snake-shaped increasing grid can reach 40,000 frames and exceed Python's default limit; raise it with `sys.setrecursionlimit` or use a topological-sort BFS.",
      "Running DFS from every cell without the memo repeats work exponentially.",
    ],
  },
  115: {
    time: { o: "O(m · n)", why: "Each table cell is filled once with ==a skip count plus an optional use count== (m = len(s), n = len(t))." },
    space: { o: "O(m · n)", why: "The full table; one row works if you sweep `j` from right to left so `dp[j - 1]` is still the previous row's value." },
    pitfalls: [
      "Wrong base column: `dp[i][0]` must be 1 for every `i` (one way to form the empty `t`), including `dp[0][0]`.",
      "On a match taking only the diagonal: you must add both choices, use this character (`dp[i - 1][j - 1]`) and skip it (`dp[i - 1][j]`).",
      "Rolling to 1D but sweeping `j` left to right: the diagonal value is overwritten before you read it.",
    ],
  },
  72: {
    time: { o: "O(m · n)", why: "Each cell takes ==the min of three neighbours== once (m, n = len(word1), len(word2))." },
    space: { o: "O(m · n)", why: "The full table; two rows are enough if you only need the distance." },
    pitfalls: [
      "Forgetting the edge rows: `dp[i][0] = i` and `dp[0][j] = j`, because turning a prefix into an empty string means deleting every character.",
      "Adding 1 even when the characters match: a match is free, so take the diagonal as is.",
      "Mixing up which neighbour is which operation: up is delete, left is insert, diagonal is replace; the min is the same either way, but explain it clearly.",
      "Empty inputs are allowed (length 0): the answer is just the other word's length, which the edge rows already give.",
    ],
  },
  312: {
    time: { o: "O(n³)", why: "There are O(n²) ranges `[l, r]` and each one ==tries every last balloon `k`== inside it (n = len(nums))." },
    space: { o: "O(n²)", why: "The `(n + 2) × (n + 2)` dp table over ranges." },
    pitfalls: [
      "Choosing the first balloon to pop: its neighbours then keep changing; choose the last one so its neighbours are the fixed walls `l - 1` and `r + 1`.",
      "Forgetting to pad with 1s: the edges have no neighbour, which counts as 1, and padding removes all the bounds checks.",
      "Filling the table in the wrong order: a range needs its shorter sub-ranges first, so loop by `length` (or `l` downward, `r` upward).",
      "Trying every pop order is n! and hopeless even for n = 10.",
    ],
  },
  10: {
    time: { o: "O(m · n)", why: "Each of the `(m + 1) × (n + 1)` cells is filled once with ==at most two lookups== (m = len(s), n = len(p))." },
    space: { o: "O(m · n)", why: "The full boolean table; a top-down memo on `(i, j)` has the same size." },
    pitfalls: [
      "Starting `i` at 1: row 0 (empty `s`) matters, because patterns like `\"a*b*\"` can match the empty string.",
      "Treating `*` as matching anything on its own (like a glob): it repeats the character just before it, so look at `p[j - 2]`.",
      "Only trying the \"use one more\" branch of a star: you must also try zero uses, `dp[i][j - 2]`.",
      "Calling `re.fullmatch` is not an answer to this question; interviewers want the dp.",
    ],
  },
};
