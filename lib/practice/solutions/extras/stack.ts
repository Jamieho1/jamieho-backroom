import type { Extras } from "./types";

export const extras: Extras = {
  20: {
    time: { o: "O(n)", why: "One pass over `s` (n = len(s)); each character does ==one push or one pop==, both O(1)." },
    space: { o: "O(n)", why: "In the worst case (all openers, e.g. `((((`) every character sits on `stack` at once." },
    pitfalls: [
      "Calling `stack[-1]` or `stack.pop()` without checking `stack` is non-empty first: an input that starts with a closer like `)(` crashes with an IndexError instead of returning False.",
      "Returning True after the loop without checking `not stack`: `((` has no mismatches but is still invalid because openers were never closed.",
      "Mapping openers to closers instead of closers to openers makes the lookup on a closer awkward; key the dict by the closer so `pairs[c]` gives the opener you expect on top.",
      "Quick win worth saying out loud: an odd-length string can never be valid, so you can return False immediately.",
    ],
  },
  155: {
    time: { o: "O(1) per operation", why: "Every method is a single `append`, `pop` or `[-1]` read on a Python list; ==`getMin` never scans==." },
    space: { o: "O(n)", why: "n = number of pushed values; `mins` stores one entry per entry in `stack`, so memory is doubled but still linear." },
    pitfalls: [
      "Keeping a single `self.min` variable: after popping the current minimum you have no way to know the previous one without rescanning.",
      "Pushing onto `mins` only when the new value is smaller (the space-saving variant) but then popping `mins` on every pop: the two stacks drift out of sync. Either push on every call, as here, or compare with `<=` on push and pop `mins` only when the popped value equals `mins[-1]`.",
      "Using `<` instead of `<=` in that space-saving variant breaks on duplicate minimums: push 2, push 2, pop leaves `mins` empty while a 2 is still on the stack.",
      "Forgetting the empty case in `push`: `self.mins[-1]` on the very first push raises IndexError, so fall back to `val`.",
    ],
  },
  150: {
    time: { o: "O(n)", why: "n = len(tokens); each token is pushed once and each operator pops two values, all O(1) work." },
    space: { o: "O(n)", why: "A run of numbers before any operator (roughly half the tokens) all sit on `stack` together." },
    pitfalls: [
      "Popping in the wrong order: the first pop is the RIGHT operand. Writing `a = stack.pop(); b = stack.pop()` makes `5 3 -` give -2 instead of 2, and breaks every `/` too.",
      "Using `a // b` for division: Python floors toward negative infinity, so `-7 // 2` is -4, but the problem truncates toward zero (-3). Use `int(a / b)`.",
      "Checking `t.isdigit()` to detect numbers: negative numbers like `\"-11\"` fail that test and get treated as an operator. Check whether the token is one of the four operators instead.",
    ],
  },
  22: {
    time: { o: "O(4ⁿ / √n)", why: "The number of valid strings is the n-th ==Catalan number, about 4ⁿ / n^1.5==; the pruned tree only explores valid prefixes, and each result costs O(n) to join, giving 4ⁿ / √n." },
    space: { o: "O(n) besides the output", why: "Recursion depth and `stack` length both reach `2n`; the `res` list itself holds Catalan(n) strings of length `2n`." },
    pitfalls: [
      "Allowing `)` whenever `closed < n` instead of `closed < open`: that produces strings like `())(` that are not balanced.",
      "Forgetting to `pop()` after the recursive call: the shared `stack` keeps stale characters and every later result is too long.",
      "Appending `stack` itself to `res` instead of `\"\".join(stack)` (or a copy): every saved entry is the same list object, which ends up empty.",
      "Generating all 2^(2n) strings and filtering valid ones works for n ≤ 8 but is much slower; mention it as the brute force, then prune with the counts.",
    ],
  },
  739: {
    time: { o: "O(n)", why: "n = len(temperatures); each index is ==pushed once and popped at most once==, so the inner `while` does O(n) work in total, not per day." },
    space: { o: "O(n)", why: "A strictly decreasing run (e.g. `[100, 90, 80, ...]`) leaves every index on `stack`; `res` is the output." },
    pitfalls: [
      "Pushing temperatures instead of indexes: you need `j` to compute the wait `i - j`. Push the index and look up `temperatures[stack[-1]]`.",
      "Using `>=` in the while condition: an equal temperature is not warmer, so a day would wrongly get resolved by a same-temperature day.",
      "Calling the nested `while` O(n²): it is amortised O(n) because each index leaves the stack only once. Say this explicitly in the interview.",
    ],
  },
  853: {
    time: { o: "O(n log n)", why: "n = number of cars; ==the sort dominates==, and the single pass afterwards pushes and pops each car once." },
    space: { o: "O(n)", why: "`cars` holds n pairs and `stack` can hold one arrival time per car when no one catches up." },
    pitfalls: [
      "Sorting by position ascending (closest to the start first): the merge logic depends on comparing each car to the fleet directly AHEAD of it, so sort with `reverse=True`.",
      "Using `<` instead of `<=` when merging: a car that arrives at exactly the same time as the fleet ahead catches it at the target and counts as the same fleet.",
      "Using integer division `(target - p) // s`: two different arrival times like 2.5 and 2.0 collapse to 2 and merge fleets that should stay apart. Keep true division (or compare `(target - p1) * s2` vs `(target - p2) * s1`).",
      "Comparing each car with the car physically in front instead of with `stack[-1]` (the fleet in front): if that car already merged into a slower fleet, its own time is no longer what matters.",
    ],
  },
  84: {
    time: { o: "O(n)", why: "n = len(heights); each bar is ==pushed once and popped at most once==, and the final sweep over `stack` is at most n more steps." },
    space: { o: "O(n)", why: "Strictly increasing heights (e.g. `[1, 2, 3, 4]`) never pop, so all n `(start, height)` pairs stay on `stack`." },
    pitfalls: [
      "Pushing `(i, h)` instead of `(start, h)`: the new bar can stretch left over every taller bar it popped, so it must inherit the last popped `idx`. Otherwise `[2, 1, 2]` scores 2 instead of 3.",
      "Forgetting the leftover bars after the loop: anything still on the stack extends to the end, so score it with `ht * (n - idx)`. A fully increasing input otherwise returns 0.",
      "Using width `i - idx - 1` or `n - idx - 1`: with the start-index version the width is exactly `i - idx`; off-by-one here silently shrinks every rectangle.",
      "Brute force over every pair `(l, r)` is O(n²) and times out at n = 10^5; mention it, then explain why each bar is popped only once.",
    ],
  },
  32: {
    time: { o: "O(n)", why: "One pass over `s`; each index is ==pushed and popped at most once==." },
    space: { o: "O(n)", why: "All openers (e.g. `((((`) sit on the stack at once." },
    pitfalls: [
      "Pushing characters instead of indexes: you can match pairs but can't measure the length of a run.",
      "Forgetting the starting `-1`: a run that begins at index 0 (`()`) has nothing below it to measure from, giving `i - stack[-1]` an empty-stack crash or a short answer.",
      "Measuring from the popped opener (`i - popped + 1`) only counts the last pair: `()()` gives 2. Measure from the new top so adjacent pairs join.",
      "Counting all matched pairs in the whole string (`2 * matches`) ignores that an unmatched `)` splits runs: `())()` would give 4 instead of 2.",
    ],
  },
};
