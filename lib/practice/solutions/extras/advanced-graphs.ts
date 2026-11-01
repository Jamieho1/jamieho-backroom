import type { Extras } from "./types";

export const extras: Extras = {
  743: {
    time: { o: "O(E log E)", why: "Each edge can push at most one entry, so the heap holds up to E items and ==every push or pop costs log E==. E = `len(times)`." },
    space: { o: "O(V + E)", why: "`adj` stores all E edges, `dist` holds up to V nodes, and the heap can hold O(E) stale entries." },
    pitfalls: [
      "Not skipping stale heap entries (`if u in dist: continue`): an older, longer entry overwrites the correct distance.",
      "Returning `max(dist.values())` without checking `len(dist) == n`: unreachable nodes must give -1.",
      "Building `adj` as 0-indexed when nodes are labelled 1 to n, or iterating `range(n)` and missing node n.",
      "Using plain BFS: it only works when every weight is equal; with weights you need the min-heap.",
    ],
  },
  332: {
    time: { o: "O(E log E)", why: "The `sorted` call dominates; after that, ==each ticket is pushed and popped exactly once== in Hierholzer's loop. E = `len(tickets)`." },
    space: { o: "O(E)", why: "`adj`, `stack` and `route` together hold every ticket a constant number of times." },
    pitfalls: [
      "Plain greedy DFS (always take the smallest destination and append on the way in): it can strand tickets in a dead end. Only add an airport to `route` ==when it has no tickets left==, then reverse.",
      "Sorting ascending and popping from the end: `pop()` then gives the largest destination. Sort in reverse (or use a heap) so `pop()` returns the smallest.",
      "Forgetting `route[::-1]`: the route is built from the end of the trip backwards.",
      "Duplicate tickets between the same airports are allowed; a set-based adjacency loses them, so keep a list.",
    ],
  },
  1584: {
    time: { o: "O(n² log n)", why: "Each of the n points pushes up to n edges, so the heap sees O(n²) entries and each operation costs ==O(log n²) = O(log n)==. n = `len(points)`." },
    space: { o: "O(n²)", why: "The heap can hold one entry per pair of points at once." },
    pitfalls: [
      "Building the full list of n² edges and running Kruskal is fine, but forgetting the cost: O(n² log n) sort plus O(n²) memory. Mention the O(n²) array-based Prim if asked to optimise.",
      "Not skipping a popped point that's already `visited`: its cost gets added twice and `total` is too big.",
      "Using Euclidean distance: the cost is Manhattan, `abs(xi - xj) + abs(yi - yj)`.",
      "With a single point the answer is 0; the loop pops `(0, 0)` and stops, so don't add special logic that breaks it.",
    ],
  },
  778: {
    time: { o: "O(n² log n)", why: "There are n² cells, each pushed and popped once, and ==each heap operation costs O(log n²) = O(log n)==. n = side length of the grid." },
    space: { o: "O(n²)", why: "The `seen` set and the heap can each hold every cell." },
    pitfalls: [
      "Summing heights like normal Dijkstra: a path's cost is its ==highest cell==, so the key is `max(t, grid[nr][nc])`.",
      "Starting at time 0 instead of `grid[0][0]`: you can't stand on the first cell until the water covers it.",
      "Returning when a neighbour is pushed rather than when the corner is popped: a cheaper route may still be in the heap.",
      "Binary search on t plus BFS also works (O(n² log n)); either is fine, just don't mix the two halfway.",
    ],
  },
  269: {
    time: { o: "O(C)", why: "C = total letters across `words`. Comparing neighbours walks each word at most twice, and the topological sort works on ==at most 26 letters and 26² edges==, which is constant." },
    space: { o: "O(1)", why: "`adj` and `indeg` are capped by the alphabet: 26 nodes and 26² edges. The `words[1:]` slice in `zip` adds O(len(words)) references, which `itertools.pairwise` avoids." },
    pitfalls: [
      "Missing the invalid prefix case: `[\"abc\", \"ab\"]` is impossible, so return `\"\"` when no letter differs and `len(a) > len(b)`.",
      "Comparing letters after the first difference: only the ==first differing pair== gives information; everything after it says nothing.",
      "Adding the same edge twice and double-counting its in-degree: the letter then never reaches 0. Check `y not in adj[x]` before adding.",
      "Only creating nodes for letters that appear in edges: letters with no rules must still be in the output, so seed `adj` from every letter of every word.",
    ],
  },
  787: {
    time: { o: "O(k · (n + E))", why: "We run `k + 1` rounds; each copies `prices` (O(n)) and relaxes every one of the E flights once. E = `len(flights)`." },
    space: { o: "O(n)", why: "Only `prices` and its per-round copy `tmp`, one slot per city." },
    pitfalls: [
      "Relaxing in place without the `tmp` copy: one round can chain several flights, breaking the stop limit.",
      "Running `k` rounds instead of `k + 1`: k stops means k + 1 flights.",
      "Plain Dijkstra on price alone: it finalises a city on the cheapest route even if that route used too many stops, missing a pricier route with fewer stops. You need the stop count in the state.",
      "Comparing `prices[u] + w` when `prices[u]` is `inf` is harmless in Python, but in other languages integer infinity overflows; guard with a reachability check.",
    ],
  },
};
