import type { Extras } from "./types";

export const extras: Extras = {
  217: {
    time: { o: "O(n)", why: "One pass over `nums` (n = len(nums)); each set lookup and insert is ==O(1) on average==." },
    space: { o: "O(n)", why: "In the worst case (no duplicates) every value ends up in `seen`." },
    pitfalls: [
      "Using a list instead of a set for `seen`: `n in seen` on a list is a linear scan, so the whole thing silently becomes O(n²).",
      "Adding to `seen` before checking membership: the value then always finds itself and you return True on the first element.",
      "Reaching for `sorted(nums)` first is fine as an alternative (O(n log n), O(1) extra), but say the trade-off out loud instead of presenting it as the optimal answer.",
    ],
  },
  242: {
    time: { o: "O(n)", why: "One loop over both strings at once (n = len(s)), then a fixed 26-slot check in `all(...)`." },
    space: { o: "O(1)", why: "`count` is always ==26 integers== no matter how long the strings are." },
    pitfalls: [
      "Skipping the length check: without it, `range(len(s))` either misses the tail of a longer `t` or indexes past the end of a shorter one.",
      "Assuming 26 slots works for any input: if the interviewer allows Unicode or uppercase, switch to a dict or `Counter` instead of `ord(c) - ord('a')`.",
      "Incrementing for both strings instead of `+1` for `s` and `-1` for `t`: the counts never cancel, so every pair looks like a non-anagram.",
    ],
  },
  1: {
    time: { o: "O(n)", why: "A single pass over `nums` (n = len(nums)) with ==O(1) average dict lookups== for each complement." },
    space: { o: "O(n)", why: "`seen` may store every value-to-index pair before the match is found." },
    pitfalls: [
      "Storing `seen[n] = i` before checking `diff in seen`: with `target = 2 * n` the number pairs with itself and you return the same index twice.",
      "Sorting first to use two pointers: sorting scrambles the original positions, and the problem asks for indices, not values.",
      "Worrying that duplicates overwrite `seen[n]`: it's harmless because the check happens first, so `[3, 3]` with target 6 still returns `[0, 1]`.",
    ],
  },
  49: {
    time: { o: "O(m · n)", why: "For each of the m words we count its n letters once; building the 26-length key is constant per word (m = len(strs), n = max word length)." },
    space: { o: "O(m · n)", why: "`groups` stores every word plus ==one 26-tuple key per distinct anagram class==." },
    pitfalls: [
      "Using the `count` list itself as a dict key: lists are unhashable, so convert it with `tuple(count)` first.",
      "Using `''.join(sorted(s))` as the key works but costs O(n log n) per word; mention it as the simpler option, then offer the counting key as the faster one.",
      "Forgetting the empty string: `\"\"` produces an all-zero key and must still form its own group, which the counting approach handles naturally.",
    ],
  },
  347: {
    time: { o: "O(n)", why: "Counting is one pass, filling `freq` touches each distinct value once, and the backward walk visits at most n + 1 buckets (n = len(nums)) — ==no sorting needed==." },
    space: { o: "O(n)", why: "`count` and the `freq` bucket list each hold up to n entries." },
    pitfalls: [
      "Sizing `freq` as `len(count)` instead of `len(nums) + 1`: a value that appears in every slot has frequency n and indexes past the end.",
      "Walking the buckets from low to high frequency: you collect the rarest values first.",
      "Returning only after the outer loop finishes instead of as soon as `len(res) == k`: you return more than k items when a bucket holds several values.",
      "Sorting `count.items()` by frequency is O(n log n); a heap gives O(n log k). Know both, but the bucket version is the one that's truly linear.",
    ],
  },
  238: {
    time: { o: "O(n)", why: "Three straight passes over `nums` (n = len(nums)): fill `pref`, fill `suff`, multiply them." },
    space: { o: "O(n)", why: "`pref` and `suff` are two extra lists of size n. The follow-up below folds them into `res` for ==O(1) extra==." },
    pitfalls: [
      "Off by one: `pref[i]` uses `nums[i - 1]` (the number before i), not `nums[i]`; using `nums[i]` puts the number itself into its own answer.",
      "Starting the lists at 0 instead of 1: an empty product is 1, so `pref[0]` and `suff[n - 1]` must be 1 or every answer becomes 0.",
      "Using total product divided by `nums[i]`: the problem bans division, and it breaks on zeros anyway.",
    ],
  },
  36: {
    time: { o: "O(1)", why: "The board is always 9×9, so the double loop does ==exactly 81 iterations== with constant-time set checks." },
    space: { o: "O(1)", why: "The `rows`, `cols` and `boxes` sets together hold at most 3 × 81 digits." },
    pitfalls: [
      "Getting the box key wrong: use `(r // 3, c // 3)`; something like `r // 3 + c // 3` makes different boxes collide.",
      "Not skipping `\".\"`: empty cells would be counted as a repeated value and every board looks invalid.",
      "Trying to check whether the puzzle is solvable: this problem only validates the filled cells, so a valid board may still have no solution.",
    ],
  },
  271: {
    time: { o: "O(N)", why: "Both `encode` and `decode` touch each character once, where N is the total number of characters across all strings." },
    space: { o: "O(1) extra", why: "Beyond the encoded string and the output list, decode only keeps ==two indices `i` and `j`==." },
    pitfalls: [
      "Using a plain separator like `,` or `#` alone: the strings may contain that character, so you need the length prefix to know where each string ends.",
      "Searching for `#` from the start of the whole string with `text.find('#')`: always scan from the current `i`, otherwise you pick up a `#` that lives inside an earlier string.",
      "Off-by-one when slicing: the string starts at `j + 1` and the next record at `j + 1 + length`; forgetting the `+ 1` leaves the `#` in the output.",
      "Ignoring edge cases: an empty list and lists containing empty strings must round-trip correctly (`\"0#\"` encodes an empty string).",
    ],
  },
  128: {
    time: { o: "O(n)", why: "Each value is a sequence start at most once, and the inner `while` only runs from starts, so ==every number is visited at most twice== overall (n = len(nums))." },
    space: { o: "O(n)", why: "The set `s` holds every distinct value." },
    pitfalls: [
      "Dropping the `n - 1 in s` check: then you start counting from every number, and a long run like 1..n becomes O(n²).",
      "Iterating over `nums` instead of the set `s`: with many duplicates of a start value you repeat the same long walk, which can blow up to O(n²).",
      "Sorting first is O(n log n), and if you do, remember duplicates should neither break nor extend a run.",
      "Forgetting the empty input: `nums = []` must return 0, which `best = 0` covers.",
    ],
  },
};
