import type { Extras } from "./types";

export const extras: Extras = {
  226: {
    time: { o: "O(n)", why: "Each of the n nodes is visited ==exactly once== and does an O(1) swap." },
    space: { o: "O(h)", why: "The recursion stack holds one frame per level on the current path, so h = tree height: O(log n) if balanced, O(n) for a chain." },
    pitfalls: [
      "Swapping in two separate lines (`root.left = invertTree(root.right)` then `root.right = invertTree(root.left)`): the second line reads the already-overwritten left. Use the one-line tuple assignment or save a temp first.",
      "Forgetting to `return root` at the end, so every parent receives `None` and the tree is wiped out.",
      "Missing the `None` base case: an empty tree is valid input and must return `None`, not crash on `root.left`.",
    ],
  },
  104: {
    time: { o: "O(n)", why: "Every node is asked for its depth ==once==, and combining the two answers is O(1)." },
    space: { o: "O(h)", why: "Recursion goes as deep as the tree is tall (h); a skewed tree of n nodes makes that O(n)." },
    pitfalls: [
      "Returning `-1` or `1` for `None` instead of `0`: the count is off by one on every tree.",
      "Using the minimum of the two children by mistake (that is LC 111, Min Depth, which also needs a special case for one missing child).",
      "Deep recursion on a skewed tree of up to 10^4 nodes can hit Python's default limit of 1000; mention `sys.setrecursionlimit` or an iterative BFS that counts levels.",
    ],
  },
  543: {
    time: { o: "O(n)", why: "One post-order pass: each node computes its height from its children's answers ==without re-measuring== any subtree." },
    space: { o: "O(h)", why: "Only the recursion stack, one frame per level of the current path (h = tree height)." },
    pitfalls: [
      "Returning `best` from the recursion instead of the height: the parent needs the longest single arm (`1 + max(l, r)`), while `l + r` only updates the global.",
      "Counting nodes instead of edges: with `None` returning `0` and a leaf returning `1`, `l + r` is already the edge count; do not add 1.",
      "Assuming the longest path passes through the root: a deep left subtree can contain the answer by itself, which is why `best` is checked at every node.",
      "Forgetting `nonlocal best` in Python, which raises UnboundLocalError on the assignment.",
    ],
  },
  110: {
    time: { o: "O(n)", why: "Heights are computed bottom-up in a single pass, so each node is visited once; the naive top-down check that calls `height` at every node is ==O(n²) on a skewed tree==." },
    space: { o: "O(h)", why: "Recursion depth equals the tree height h." },
    pitfalls: [
      "Only checking the root's two heights: every node must be balanced, so a tree with balanced root but a lopsided child is still False.",
      "Forgetting to propagate the `-1` sentinel: if `l == -1` is not checked, `abs(-1 - r)` can look small and hide an unbalanced subtree.",
      "Calling a separate `height()` from inside an `isBalanced()` recursion gives correct answers but O(n²) time; expect the interviewer to ask for the one-pass version.",
    ],
  },
  100: {
    time: { o: "O(n)", why: "Both trees are walked in lockstep, and each pair of positions is compared at most once (n = size of the smaller tree, since we stop at the first mismatch)." },
    space: { o: "O(h)", why: "Recursion depth is the height h of the shorter tree path being compared." },
    pitfalls: [
      "Checking `p.val != q.val` before ruling out `None`: if only one node is `None` that line raises AttributeError. Handle the both-None and one-None cases first.",
      "Comparing only values in a traversal list (e.g. both inorder): `[1, 2]` and `[1, None, 2]` give the same inorder but different shapes. Compare structure directly or include `None` markers.",
      "Using `or` instead of `and` when combining the left and right results.",
    ],
  },
  572: {
    time: { o: "O(m · n)", why: "For each of the m nodes in `root`, `same()` can walk up to n = size of `subRoot` nodes before a mismatch ==in the worst case==." },
    space: { o: "O(h)", why: "Recursion stack of `dfs` plus a nested `same` call, both bounded by the height h of `root`." },
    pitfalls: [
      "Stopping after the first node whose value matches `subRoot.val`: duplicates mean a later node with the same value may be the real match, so keep searching left and right when `same()` fails.",
      "Serializing both trees and using a substring check without delimiters: `12` contains `2`. Wrap each value with separators (e.g. `,12,`) and include `N` for nulls.",
      "Treating a partial match as enough: `subRoot` must equal the entire subtree, including the absence of extra children below its leaves.",
    ],
  },
  235: {
    time: { o: "O(h)", why: "Each step moves one level down and ==never backtracks==, so at most h steps (h = tree height, O(n) if skewed)." },
    space: { o: "O(1)", why: "The walk is iterative and keeps only `cur`; the recursive version would cost O(h) stack instead." },
    pitfalls: [
      "Forgetting that a node can be its own ancestor: when `cur` equals `p` or `q`, it is the answer. The `else` branch already covers this because the values are not both strictly smaller or larger.",
      "Using the general binary-tree LCA (search both subtrees) works but ignores the BST order and costs O(n); the interviewer expects the O(h) walk.",
      "Comparing nodes instead of values (`p < cur`), which fails in Python; compare `p.val` and `q.val` to `cur.val`.",
    ],
  },
  102: {
    time: { o: "O(n)", why: "Every node is pushed and popped from the deque once, each in O(1)." },
    space: { o: "O(w)", why: "The queue holds at most one full level plus part of the next, where w = widest level (up to about n/2 in a full tree); the output itself is O(n)." },
    pitfalls: [
      "Reading `len(q)` inside the loop condition instead of fixing it at the start of the round, so newly pushed children leak into the current level.",
      "Using `list.pop(0)` as a queue: each pop is O(n), making the whole BFS O(n²). Use `collections.deque` and `popleft()`.",
      "Not handling the empty tree: `deque([None])` would crash on `node.val`, so return `[]` first.",
    ],
  },
  199: {
    time: { o: "O(n)", why: "Standard level-order BFS: each node is enqueued and dequeued exactly once." },
    space: { o: "O(w)", why: "The deque holds at most one level at a time, w = widest level." },
    pitfalls: [
      "Only following right children down from the root: a deeper left node is visible when the right side is shorter, e.g. `[1, 2, 3, 4]` should give `[1, 3, 4]`.",
      "Pushing the right child before the left and then taking the last popped node gives the leftmost value instead. Either push left-then-right and take the last, or push right-then-left and take the first.",
      "Forgetting the empty-tree check, which leaves `node` undefined when appending to `res`.",
    ],
  },
  1448: {
    time: { o: "O(n)", why: "Each node is visited once and does an O(1) comparison against the running max `best`." },
    space: { o: "O(h)", why: "Recursion depth equals tree height h; a 10^5-node chain makes it O(n)." },
    pitfalls: [
      "Using `>` instead of `>=`: ties count as good, so a node equal to the path max must be counted.",
      "Seeding `best` with `0` or a fixed value: with negative values a root of `-1` would be wrongly skipped. Start with `root.val` or `-inf`.",
      "Updating a shared/global max instead of passing it as an argument: the max must reset when the walk returns to a different branch.",
      "Up to 10^5 nodes in a chain exceeds Python's recursion limit; switch to an explicit stack of `(node, best)` pairs if asked.",
    ],
  },
  98: {
    time: { o: "O(n)", why: "Each node is checked once against its inherited `(low, high)` range." },
    space: { o: "O(h)", why: "Recursion stack depth equals tree height h." },
    pitfalls: [
      "Only comparing a node with its direct children: `[5, 4, 6, null, null, 3, 7]` passes that local check but 3 sits in the right subtree of 5. Carry the full range down.",
      "Using `<=` so duplicates are allowed: this problem needs strictly smaller on the left and strictly larger on the right, so `[8, 8]` is invalid.",
      "Seeding the bounds with `-2**31` and `2**31 - 1`: a node equal to the int limit is then rejected. Use `float('-inf')` / `float('inf')` or `None` for no bound.",
    ],
  },
  230: {
    time: { o: "O(h + k)", why: "We dive down the left spine (up to h nodes) and then pop ==exactly k nodes== before returning, never touching the rest of the tree." },
    space: { o: "O(h)", why: "The explicit `stack` holds at most one path from root to leaf, h = tree height." },
    pitfalls: [
      "Collecting the full in-order list and indexing `[k - 1]`: correct but always O(n) time and space; mention it, then stop early.",
      "Off-by-one on k: it is 1-indexed, so decrement first and return when `k == 0` (or compare against `k - 1` with a 0-based counter).",
      "Forgetting `cur = cur.right` after a pop makes the loop pop the same ancestors again and returns wrong values.",
    ],
  },
  105: {
    time: { o: "O(n)", why: "Each value becomes a node once, and the `index` dict gives the inorder split ==in O(1) instead of a linear search==." },
    space: { o: "O(n)", why: "The `index` map has n entries; the recursion stack adds O(h), which is O(n) for a skewed tree." },
    pitfalls: [
      "Building the right subtree before the left: the shared `pre` pointer reads preorder in root-left-right order, so left must be built first.",
      "Slicing `preorder[1:mid+1]` and `inorder[:mid]` on every call: it works but copying makes it O(n²); pass indices instead.",
      "Using `inorder.index(val)` inside the recursion is also O(n) per call, O(n²) total; precompute the dict.",
      "The dict trick relies on all values being unique; with duplicates the split is ambiguous.",
    ],
  },
  124: {
    time: { o: "O(n)", why: "One post-order pass; each node computes its gain from its children's results in O(1)." },
    space: { o: "O(h)", why: "Recursion depth equals tree height h (up to 3 * 10^4 for a chain)." },
    pitfalls: [
      "Starting `best` at `0`: an all-negative tree like `[-3]` must return `-3`. Seed with `root.val` or `-inf`.",
      "Returning `node.val + l + r` to the parent: a parent can only extend one arm, so return `node.val + max(l, r)` and use the two-arm sum only for `best`.",
      "Not clamping negative gains with `max(..., 0)`, which forces bad subtrees into the path.",
      "Deep chains overflow Python's default recursion limit; raise it or use an iterative post-order.",
    ],
  },
  297: {
    time: { o: "O(n)", why: "Serialize visits each node once and writes one token per node and per null child; deserialize reads each of those ~2n tokens once." },
    space: { o: "O(n)", why: "The `out` list / string has about 2n + 1 tokens, plus O(h) recursion stack." },
    pitfalls: [
      "Leaving out the null markers: plain preorder like `1,2,3` can describe several different trees. Write `N` for every missing child.",
      "Building the string with `s += ...` in a loop, which can be O(n²); append to a list and `','.join` at the end.",
      "Splitting on the wrong delimiter or parsing digit by digit breaks on negatives and multi-digit values like `-1000`; split on commas and use `int(t)`.",
      "With up to 10^4 nodes a skewed tree exceeds Python's recursion limit; use `sys.setrecursionlimit` or a BFS-based encoding.",
    ],
  },
};
