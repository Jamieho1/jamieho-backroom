import type { Extras } from "./types";

export const extras: Extras = {
  200: {
    time: { o: "O(rows · cols)", why: "The outer scan touches every cell once, and ==each land cell is sunk at most once== by `dfs`, so all the DFS calls together are also bounded by the grid size." },
    space: { o: "O(rows · cols)", why: "No extra visited set (we overwrite `grid`), but the recursion stack can be as deep as one island, which is the whole grid in the worst case." },
    pitfalls: [
      "Marking the cell visited after recursing instead of before: neighbours bounce back into it and the DFS never ends. Set `grid[r][c] = \"0\"` first, then recurse.",
      "Comparing against the integer `1` when the grid holds strings `\"1\"`: nothing ever matches and you return 0.",
      "Python's default recursion limit is about 1000, and a 300×300 snake-shaped island goes far deeper. Mention it, and switch to an explicit stack or BFS if asked.",
      "Counting diagonal neighbours: only up, down, left and right connect land here.",
    ],
  },
  695: {
    time: { o: "O(rows · cols)", why: "Every cell is visited by the scan, and ==each land cell is counted and sunk exactly once== across all DFS calls." },
    space: { o: "O(rows · cols)", why: "The recursion depth can reach the size of the largest island, which is the whole grid if it's all land." },
    pitfalls: [
      "Returning the number of islands or the area of the last island instead of tracking `best = max(best, dfs(r, c))` across all of them.",
      "Forgetting to sink the cell before adding the four neighbour calls: the same cell gets counted again through a neighbour and the area is inflated (or recursion never stops).",
      "Returning `None` instead of 0 from the base case: `1 + None` raises a TypeError.",
    ],
  },
  133: {
    time: { o: "O(V + E)", why: "Each node is copied once (the map stops repeats), and each adjacency entry is walked once while filling `copy.neighbors`. V = nodes, E = edges." },
    space: { o: "O(V)", why: "`old_to_new` holds one entry per node and the recursion can go V deep; the cloned graph itself is the output and isn't counted." },
    pitfalls: [
      "Storing the copy in `old_to_new` only after visiting its neighbours: any cycle leads straight back to an uncopied node and recurses forever. ==Register the copy before the loop.==",
      "Using `n.val` as the map key and then meeting two nodes with equal values in a variant problem; keying on the node object itself is always safe.",
      "Not handling `node is None` (an empty graph): return `None` instead of calling `dfs`.",
      "Appending the original neighbour instead of `dfs(nb)`, so the copy secretly points back into the old graph.",
    ],
  },
  286: {
    time: { o: "O(rows · cols)", why: "Every room is set and enqueued ==at most once==, because it stops being `INF` the moment it's filled; each pop checks only 4 neighbours." },
    space: { o: "O(rows · cols)", why: "The queue `q` can hold a large fraction of the cells at once, e.g. when the grid is full of gates." },
    pitfalls: [
      "Running a separate BFS from every gate (or every room): that's O((rows · cols)²). Seed the queue with ==all gates together== instead.",
      "Checking `rooms[nr][nc] != -1` instead of `== INF`: you overwrite gates and rooms that already have a shorter distance.",
      "Hard-coding a different INF (like `float('inf')`) when the grid uses 2147483647: the comparison never matches.",
    ],
  },
  994: {
    time: { o: "O(rows · cols)", why: "One pass counts fresh oranges and seeds the queue, then each orange is rotted and enqueued at most once." },
    space: { o: "O(rows · cols)", why: "The queue `q` can hold up to every orange in the grid in the worst case." },
    pitfalls: [
      "Not processing the queue layer by layer (`for _ in range(len(q))`): `minutes` then counts oranges, not minutes.",
      "Looping `while q` without `fresh > 0`: the last layer has no fresh neighbours yet still adds one extra minute.",
      "Forgetting the impossible case: if `fresh > 0` once the queue is empty, return -1, not `minutes`.",
      "No fresh oranges at the start should return 0 right away; the `fresh > 0` loop guard handles it, including grids with no rotten oranges at all.",
    ],
  },
  417: {
    time: { o: "O(rows · cols)", why: "Each ocean's DFS adds a cell to its set ==at most once==, so there are two passes over the grid plus a final scan." },
    space: { o: "O(rows · cols)", why: "The `pac` and `atl` sets can each hold every cell, and the recursion can go as deep as the grid." },
    pitfalls: [
      "Flowing downhill from the ocean instead of uphill: the reversed search must step to neighbours with height `>= prev`, not `<=`.",
      "Using strict `>` and missing flat areas: water flows between equal heights.",
      "Sharing one visited set for both oceans: the second DFS stops early on cells the first one already marked.",
      "Deep recursion on a 200×200 grid can hit Python's recursion limit; mention an iterative stack or BFS as the fix.",
    ],
  },
  130: {
    time: { o: "O(rows · cols)", why: "The border scan plus `capture` turns each `O` into `T` at most once, and the final pass touches every cell once." },
    space: { o: "O(rows · cols)", why: "Everything is changed in place, but the recursion stack can be as large as one border-connected region." },
    pitfalls: [
      "DFSing from every interior `O` to ask \"does it reach the edge?\": that repeats work and makes flipping awkward. Start from the ==border `O` cells== instead.",
      "Flipping `O` to `X` during the border DFS rather than in a separate final pass: you lose track of which cells were safe.",
      "Forgetting the second step of the final pass: `T` cells must go back to `O`, or the safe regions vanish.",
      "Checking only the first and last rows and forgetting the first and last columns (or the reverse).",
    ],
  },
  207: {
    time: { o: "O(V + E)", why: "Building `adj` and `indeg` walks each prerequisite once, and Kahn's loop pops each course once and lowers each edge's in-degree once. V = `numCourses`, E = `len(prerequisites)`." },
    space: { o: "O(V + E)", why: "`adj` stores every edge, and `indeg` plus the queue hold up to V courses." },
    pitfalls: [
      "Drawing the edge the wrong way (`a → b`): in-degrees end up on the prerequisites and the result is wrong for chains. `[a, b]` means ==`b` comes first==, so the edge is `b → a`.",
      "Returning `True` when the queue empties: a cycle just means the queue empties early, so compare `taken == numCourses`.",
      "Forgetting courses that appear in no pair: they still have in-degree 0 and must start in the queue, which is why the queue is built over `range(numCourses)`.",
    ],
  },
  210: {
    time: { o: "O(V + E)", why: "Each course is appended to `order` once and each prerequisite edge lowers an in-degree once. V = `numCourses`, E = `len(prerequisites)`." },
    space: { o: "O(V + E)", why: "The adjacency lists hold every edge; `indeg`, the queue and `order` are each O(V)." },
    pitfalls: [
      "Returning a partial `order` when there's a cycle: the problem wants `[]`, so check ==`len(order) == numCourses`==.",
      "Reversing the edge direction: the order comes out backwards (dependents before prerequisites).",
      "Using DFS post-order without reversing the list, or without a three-state visited marker to detect cycles; Kahn's avoids both issues.",
    ],
  },
  261: {
    time: { o: "O(n · α(n))", why: "Setup is O(n), and after the edge-count check there are only n − 1 edges, each needing two near-constant `find` calls. α is the inverse Ackermann function, effectively ≤ 4." },
    space: { o: "O(n)", why: "The `parent` and `size` arrays have one slot per node." },
    pitfalls: [
      "Checking only for cycles: a forest like 0-1, 2-3 has no cycle but isn't one tree. The ==`len(edges) == n - 1` check== is what rules out extra pieces.",
      "Checking only the edge count: n − 1 edges can still contain a cycle plus a separate node, so the cycle check is still needed.",
      "Comparing `parent[a] == parent[b]` instead of `find(a) == find(b)`: two nodes can share a root without sharing a direct parent.",
      "With n = 1 and no edges the answer is `True`; the count check (0 == 0) handles it, so don't special-case it wrongly.",
    ],
  },
  323: {
    time: { o: "O(n + E · α(n))", why: "Building `parent` and `size` is O(n), then each of the E edges does two `find` calls that are near constant with ==path halving and union by size==." },
    space: { o: "O(n)", why: "Just the `parent` and `size` arrays." },
    pitfalls: [
      "Subtracting 1 from `components` for every edge: edges inside an existing component change nothing, so only decrement when `ra != rb`.",
      "Isolated nodes with no edges: starting from `components = n` counts them automatically; counting only nodes seen in `edges` misses them.",
      "Unioning `a` and `b` directly (`parent[b] = a`) instead of their roots: it can split a tree and give a wrong count.",
    ],
  },
  684: {
    time: { o: "O(n · α(n))", why: "We process at most n edges (n = `len(edges)`), each with two near-constant `find` calls." },
    space: { o: "O(n)", why: "`parent` and `size` are sized `len(edges) + 1` because the nodes are numbered 1 to n." },
    pitfalls: [
      "Sizing `parent` as `len(edges)`: the nodes are 1-indexed, so node n is out of range. Use `len(edges) + 1`.",
      "Collecting every cycle edge and returning the first: the problem wants the last one in input order, and the ==first edge that fails to union== is exactly that one.",
      "Trying a DFS from scratch for each edge works but is O(n²); union-find gives near-linear time.",
    ],
  },
  127: {
    time: { o: "O(N · L² · 26)", why: "Each of the N words is dequeued at most once; for each, we try 26 letters at each of L positions, and ==building each candidate string costs O(L)==. N = `len(wordList)`, L = word length." },
    space: { o: "O(N · L)", why: "The `words` set, `visited` set and queue each store up to N words of length L." },
    pitfalls: [
      "Comparing every pair of words to build the graph: that's O(N² · L), too slow for 5000 words. Generate the 26 · L variants instead.",
      "Marking words visited when they're popped instead of when they're pushed: the same word gets queued many times from one layer.",
      "Returning the number of edges instead of words: the answer counts the start word, so `steps` starts at 1.",
      "Forgetting the early exit when `endWord` isn't in `wordList`, or assuming `beginWord` must be in the list (it doesn't have to be).",
    ],
  },
};
