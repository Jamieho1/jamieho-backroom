import type { Extras } from "./types";

export const extras: Extras = {
  121: {
    time: { o: "O(n)", why: "A single pass over `prices` (n = len(prices)); `l` only ever jumps forward to `r`." },
    space: { o: "O(1)", why: "Only the index of the ==cheapest day so far== and the best profit." },
    pitfalls: [
      "Taking `max(prices) - min(prices)`: the minimum might come after the maximum, and you can't sell before you buy.",
      "Letting the answer go negative: when prices only fall the answer is 0, which starting `best = 0` handles.",
      "Checking every buy/sell pair is O(n²) and times out at 10^5 prices.",
    ],
  },
  3: {
    time: { o: "O(n)", why: "`r` moves forward once per character and `l` only moves forward too, so each character is ==added and removed at most once== (n = len(s))." },
    space: { o: "O(k)", why: "`seen` holds the characters in the current window, at most k = number of distinct characters." },
    pitfalls: [
      "Using `if` instead of `while` to shrink: the repeat may be several positions inside the window, so one step isn't enough.",
      "Removing `c` instead of `s[l]` while shrinking: you must evict characters from the left edge in order.",
      "The jump-to-last-index variant (`l = last[c] + 1`) must use `max(l, last[c] + 1)`, otherwise `l` can move backwards, as on `\"abba\"`.",
      "Forgetting empty input: `s = \"\"` should return 0.",
    ],
  },
  424: {
    time: { o: "O(n)", why: "Each character enters the window once and leaves at most once; `maxf` is updated in O(1) (n = len(s))." },
    space: { o: "O(1)", why: "`count` holds at most ==26 uppercase letters==." },
    pitfalls: [
      "Recomputing the true max frequency on every shrink by scanning `count`: correct but unnecessary; a stale `maxf` never yields a wrong answer because the result only grows when `maxf` grows.",
      "Writing the validity check backwards: the window needs changes `(r - l + 1) - maxf`, and it's invalid when that is greater than `k`.",
      "Forgetting to decrement `count[s[l]]` before moving `l`: the counts drift and the window shrinks wrongly.",
    ],
  },
  567: {
    time: { o: "O(n)", why: "Each slide is O(1) to update `win` plus a 26-element comparison, so ==O(26 · n) = O(n)== (n = len(s2))." },
    space: { o: "O(1)", why: "Two fixed arrays of 26 counts." },
    pitfalls: [
      "Not handling `len(s1) > len(s2)`: the setup loop indexes past the end of `s2`; return False up front.",
      "Forgetting to compare the very first window before sliding: a match at index 0 is missed.",
      "Removing the wrong character when sliding: the one leaving is `s2[r - m]`, not `s2[r - m - 1]` or `s2[l]` from a separate counter that drifts.",
      "Checking every substring with `sorted()` is O(n · m log m); the fixed-size window avoids re-sorting.",
    ],
  },
  76: {
    time: { o: "O(n + m)", why: "Building `countT` is O(m) (m = len(t)); then `r` and `l` each move forward at most n times (n = len(s))." },
    space: { o: "O(k)", why: "`countT` and `window` hold at most k distinct characters (52 letters here)." },
    pitfalls: [
      "Tracking `have` per character occurrence instead of per distinct character: compare `window[c] == countT[c]` so each character counts once, exactly when it becomes satisfied.",
      "Decrementing `have` whenever `s[l]` is in `t`: only decrement when the count drops ==below== what's needed, otherwise surplus copies break the bookkeeping.",
      "Recording the best window after shrinking instead of before: you save a window that's already missing a character.",
      "Using a plain Python `0` sentinel for the best length: an empty answer then looks valid; use infinity and return `\"\"` when nothing was found.",
    ],
  },
  239: {
    time: { o: "O(n)", why: "Each index is pushed once and popped at most once from `q`, so the total deque work is ==linear== (n = len(nums))." },
    space: { o: "O(k)", why: "The deque only holds indices from the current window; the output list of n − k + 1 values is not counted." },
    pitfalls: [
      "Storing values instead of indices in the deque: you then can't tell when the front has slid out of the window.",
      "Popping smaller elements with `<=` vs `<`: both work, but popping from the wrong end (the front instead of the back) breaks the decreasing order.",
      "Appending to `res` before the first full window: only start once `r >= k - 1`.",
      "Calling `max(nums[r-k+1 : r+1])` each step is O(n · k) and times out at n = 10^5.",
    ],
  },
};
