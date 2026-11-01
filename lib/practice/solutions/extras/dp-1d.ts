import type { Extras } from "./types";

export const extras: Extras = {
  70: {
    time: { o: "O(n)", why: "One loop of `n - 1` iterations, each doing ==a constant-time add and swap==." },
    space: { o: "O(1)", why: "Only the two rolling values `one` and `two`; no dp array is kept." },
    pitfalls: [
      "Plain recursion `f(n - 1) + f(n - 2)` without a memo is O(2^n) and times out well before n = 45.",
      "Wrong base case: there is 1 way to stand on step 0 (do nothing), not 0; starting from `dp[0] = 0` shifts every answer.",
      "Updating `one` and then `two` on separate lines loses the old `one`; use a tuple assignment or a temp variable.",
    ],
  },
  746: {
    time: { o: "O(n)", why: "A single pass from `i = 2` to `n`, each step taking ==the min of two values== (n = len(cost))." },
    space: { o: "O(n)", why: "The `dp` list has `n + 1` entries; it drops to O(1) if you keep only the last two." },
    pitfalls: [
      "Returning `dp[n - 1]`: the top is one past the last stair, so the answer is `dp[n]`.",
      "Charging the cost of the stair you land on instead of the one you leave: `dp[i]` adds `cost[i - 1]` or `cost[i - 2]`, never `cost[i]`.",
      "Starting with `dp[0] = cost[0]`, `dp[1] = cost[1]`: you may start on either stair for free, so both bases are 0 in this formulation.",
    ],
  },
  198: {
    time: { o: "O(n)", why: "Each house is visited once with ==one max of two values== (n = len(nums))." },
    space: { o: "O(1)", why: "Just `prev` and `cur`, the best totals up to two houses back and one house back." },
    pitfalls: [
      "Assuming the answer is the best of \"all even indices\" vs \"all odd indices\": `[2, 1, 1, 2]` needs houses 0 and 3, giving 4.",
      "Writing `cur = max(cur, prev + n)` then `prev = cur`: `prev` gets the new value; update both together with a tuple assignment.",
      "Special-casing tiny inputs and getting them wrong: starting `prev = cur = 0` handles one or two houses without any extra checks.",
    ],
  },
  213: {
    time: { o: "O(n)", why: "Two linear House Robber runs plus ==two O(n) slices== (n = len(nums))." },
    space: { o: "O(n)", why: "`nums[:-1]` and `nums[1:]` copy the list; passing start/end indexes instead brings it to O(1)." },
    pitfalls: [
      "Skipping the `len(nums) == 1` check: both slices are empty, so the code would return 0 instead of the only house's value.",
      "Trying to track \"did I take the first house\" inside one pass: it gets messy fast; running the line version twice is cleaner and still O(n).",
      "Running the line version on the full array as a third case: it can pick both ends, which the circle forbids.",
    ],
  },
  5: {
    time: { o: "O(n²)", why: "There are 2n − 1 centres and each one can ==expand up to n/2 steps== (n = len(s))." },
    space: { o: "O(1)", why: "Only `start`, `best` and the pointers; the substring is sliced once at the end." },
    pitfalls: [
      "Only trying odd centres `(i, i)`: even palindromes like `\"abba\"` are missed. Always try `(i, i + 1)` too.",
      "Off-by-one when recording the span: after the loop `l` and `r` have gone one step too far, so the palindrome is `s[l + 1 : r]` with length `r - l - 1`.",
      "Slicing a new string on every improvement is fine, but slicing on every expansion step adds an extra factor of n; store indexes instead.",
      "The O(n²) dp table version works but uses O(n²) memory; mention it, then prefer expand-around-centre.",
    ],
  },
  647: {
    time: { o: "O(n²)", why: "Same 2n − 1 centres as Longest Palindrome, and ==each successful expansion step is one count== (n = len(s))." },
    space: { o: "O(1)", why: "Only `count` and the two pointers." },
    pitfalls: [
      "Missing even-length centres: `\"aa\"` has 3 palindromic substrings, not 2.",
      "Counting distinct strings instead of positions: `\"aaa\"` should give 6, because the same text at different positions counts separately.",
      "Checking every substring with `sub == sub[::-1]` is O(n³) and slow at n = 1000.",
    ],
  },
  91: {
    time: { o: "O(n)", why: "One pass over the digits; each step checks ==a one-digit and a two-digit code== (n = len(s))." },
    space: { o: "O(n)", why: "The `dp` list has `n + 1` entries; it can drop to O(1) with two rolling variables." },
    pitfalls: [
      "Treating `\"0\"` as a letter: a lone 0 never decodes, so a string starting with 0 (or containing `\"00\"`, `\"30\"`) gives 0.",
      "Accepting two-digit codes like `\"06\"`: `int(\"06\")` is 6, so check `10 <= value <= 26`, not just `<= 26`.",
      "Wrong base: `dp[0]` must be 1 (the empty prefix), otherwise every count collapses to 0.",
    ],
  },
  322: {
    time: { o: "O(amount · k)", why: "For each of the `amount` totals we ==try every coin== (k = len(coins))." },
    space: { o: "O(amount)", why: "One `dp` entry per amount from 0 to `amount`." },
    pitfalls: [
      "Going greedy with the biggest coin first: `[1, 3, 4]` with amount 6 gives 3 coins instead of 2.",
      "Using `float('inf')` and forgetting to convert it: return -1 when `dp[amount]` is still the sentinel (`amount + 1` here).",
      "Forgetting `amount = 0`: the answer is 0 coins, which `dp[0] = 0` already handles.",
      "Plain recursion without a memo re-solves the same sub-amount many times and times out.",
    ],
  },
  152: {
    time: { o: "O(n)", why: "One pass, with ==three candidate products== per element (n = len(nums))." },
    space: { o: "O(1)", why: "Only `cur_max`, `cur_min` and `res`." },
    pitfalls: [
      "Tracking only the max like Kadane's: a later negative can turn the most negative product into the largest one.",
      "Updating `cur_max` first and then using the new value to compute `cur_min`: build both from the old values at once (the `cand` tuple).",
      "Starting `res = 0`: an input like `[-3]` must return -3; start from `max(nums)` or the first element.",
    ],
  },
  139: {
    time: { o: "O(n · m · k)", why: "For each of the `n` prefix ends we try all `m` words and ==each slice-and-compare costs up to k== (n = len(s), k = max word length)." },
    space: { o: "O(n)", why: "The `dp` list of `n + 1` booleans (plus the word set)." },
    pitfalls: [
      "Greedily taking the first or longest matching word: `\"applepie\"` with `app` matched first leaves `\"lepie\"`; the dp keeps every split point alive.",
      "Forgetting `dp[0] = True`: nothing can ever start, so every answer is False.",
      "Indexing `dp[i - len(w)]` when the word is longer than the prefix: guard with `i >= len(w)`, otherwise a negative index silently reads from the end.",
      "Recursion on the remaining suffix without memoisation is exponential on inputs like `\"aaaa...b\"`.",
    ],
  },
  300: {
    time: { o: "O(n²)", why: "For every `i` the inner loop ==scans all earlier `j`== (n = len(nums))." },
    space: { o: "O(n)", why: "One `dp` value per index." },
    pitfalls: [
      "Returning `dp[-1]` instead of `max(dp)`: the longest chain need not end at the last element.",
      "Using `<=` instead of `<`: the subsequence must be strictly increasing, so equal values cannot chain.",
      "Mixing up subsequence and subarray: elements may have gaps, so you must look back at every `j`, not just `i - 1`.",
      "If asked to optimise, the patience-sorting version with `bisect_left` on a tails list is O(n log n); the tails list is not itself a valid LIS.",
    ],
  },
  416: {
    time: { o: "O(n · target)", why: "For each of the `n` numbers we ==sweep every sum from `target` down to the number== (target = sum(nums) / 2)." },
    space: { o: "O(target)", why: "A single boolean row of `target + 1` entries, reused for every number." },
    pitfalls: [
      "Looping sums upward: `dp[s - n]` may already include the current number, so it gets reused (that is unbounded knapsack). Loop downward.",
      "Forgetting the odd-total check: an odd sum can never split evenly, and `total // 2` would quietly round down.",
      "Brute-forcing all 2^n subsets times out at n = 200; the bounded sums (≤ 10,000) are what make the dp fast.",
    ],
  },
};
