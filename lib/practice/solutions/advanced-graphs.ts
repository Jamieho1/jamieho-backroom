/**
 * advanced-graphs: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
 * - 743 Network Delay Time (Medium)
 * - 332 Reconstruct Itinerary (Hard)
 * - 1584 Min Cost to Connect All Points (Medium)
 * - 778 Swim in Rising Water (Hard)
 * - 269 Alien Dictionary (Hard)
 * - 787 Cheapest Flights Within K Stops (Medium)
 */
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));

export const variations: Variation[] = [
  {
    id: "dijkstra",
    topic: "advanced-graphs",
    name: "Dijkstra (min-heap)",
    change: "Base pattern. Weighted edges, no negatives: always ==pop the cheapest frontier node from a min-heap==; the first time a node is popped, its cost is final.",
    problems: [743, 778],
  },
  {
    id: "mst",
    topic: "advanced-graphs",
    name: "Minimum spanning tree (Prim)",
    change: "Same heap loop, but the key is ==the single edge that joins a node to the tree==, not the total distance from a start.",
    problems: [1584],
  },
  {
    id: "bellman-ford",
    topic: "advanced-graphs",
    name: "Bellman-Ford (limited edges)",
    change: "A cap on the number of edges breaks Dijkstra. Instead ==relax every edge once per round, from a copy of last round's prices==, for exactly k + 1 rounds.",
    problems: [787],
  },
  {
    id: "topo-rules",
    topic: "advanced-graphs",
    name: "Topological sort from rules",
    change: "No weights: first ==build the edges from the ordering rules==, then output nodes as their in-degree hits 0. Leftover nodes mean a cycle.",
    problems: [269],
  },
  {
    id: "euler-path",
    topic: "advanced-graphs",
    name: "Eulerian path (Hierholzer)",
    change: "Use every ==edge== exactly once, not every node. DFS, and ==add a node to the route only when it has no edges left==, then reverse.",
    problems: [332],
  },
];

export const solutions: Solution[] = [
  {
    lc: 743,
    variation: "dijkstra",
    question: "Given weighted one-way links between n nodes and a start node, return how long until a signal from the start reaches every node, or -1 if some never hear it.",
    intuition: `The time for the last node is ==the largest shortest-path distance== from \`k\`. With non-negative weights, Dijkstra finds them: ==always pop the closest unfinished node from a min-heap==. Nothing can later reach it more cheaply, so its distance is final.`,
    algorithm: `1. Build \`adj[u] = [(v, w), ...]\`.
2. Start with \`heap = [(0, k)]\` and an empty \`dist\` map.
3. While the heap isn't empty:
   * Pop \`(d, u)\`, ==the cheapest entry==.
   * If \`u\` is already in \`dist\`, skip it (an older, longer entry).
   * Set \`dist[u] = d\`.
   * For each \`(v, w)\` with \`v\` not finished, push \`(d + w, v)\`.
4. If \`len(dist) == n\`, return \`max(dist.values())\`, else \`-1\`.`,
    visual: {
      kind: "graph",
      title: "Network delay · start at node 1",
      directed: true,
      nodes: [
        { id: "1", label: "1" },
        { id: "2", label: "2" },
        { id: "3", label: "3" },
        { id: "4", label: "4" },
      ],
      edges: [
        { from: "1", to: "2", label: "4" },
        { from: "1", to: "3", label: "1" },
        { from: "3", to: "2", label: "2" },
        { from: "2", to: "4", label: "1" },
        { from: "3", to: "4", label: "5" },
      ],
      frames: [
        { caption: "Pop (0, 1): node 1 is final at 0. Push its neighbours.", pointers: [{ name: "u", node: "1" }], highlight: ["1"], vars: kv({ heap: "(1,3) (4,2)", dist: "{1:0}" }) },
        { caption: "Pop (1, 3): node 3 is final at 1. Push 2 at 1+2=3 and 4 at 1+5=6.", pointers: [{ name: "u", node: "3" }], highlight: ["3"], done: ["1"], vars: kv({ heap: "(3,2) (4,2) (6,4)", dist: "{1:0, 3:1}" }) },
        { caption: "Pop (3, 2): the route through 3 beats the direct edge of 4. Push 4 at 3+1=4.", pointers: [{ name: "u", node: "2" }], highlight: ["2"], done: ["1", "3"], vars: kv({ heap: "(4,2) (4,4) (6,4)", dist: "{1:0, 3:1, 2:3}" }) },
        { caption: "Pop (4, 2): 2 is already final → skip this stale entry.", pointers: [{ name: "u", node: "2" }], done: ["1", "3", "2"], vars: kv({ heap: "(4,4) (6,4)", dist: "{1:0, 3:1, 2:3}" }) },
        { caption: "Pop (4, 4): node 4 is final at 4. (6, 4) is stale later.", pointers: [{ name: "u", node: "4" }], highlight: ["4"], done: ["1", "3", "2"], vars: kv({ dist: "{1:0, 3:1, 2:3, 4:4}" }) },
        { caption: "All 4 nodes reached. The slowest one takes 4 → answer 4.", done: ["1", "2", "3", "4"], vars: kv({ answer: "4" }) },
      ],
    },
    code: `import heapq
from collections import defaultdict

def networkDelayTime(times: list[list[int]], n: int, k: int) -> int:
    adj = defaultdict(list)
    for u, v, w in times:
        adj[u].append((v, w))
    dist = {}
    heap = [(0, k)]
    while heap:
        d, u = heapq.heappop(heap)
        if u in dist:
            continue
        dist[u] = d
        for v, w in adj[u]:
            if v not in dist:
                heapq.heappush(heap, (d + w, v))
    return max(dist.values()) if len(dist) == n else -1`,
    complexity: "Time O(E log E) · Space O(V + E)",
  },
  {
    lc: 332,
    variation: "euler-path",
    question: "Given a pile of flight tickets starting from JFK, chain all of them into one trip, choosing the alphabetically smallest trip if several work.",
    intuition: `Using every ticket once is an ==Eulerian path==. Greedily taking the smallest airport can walk into a dead end too early. Hierholzer fixes that: DFS with a stack, and ==only add an airport to the route when it has no tickets left==. Dead ends land in the route first, so the reversed route is a valid trip.`,
    algorithm: `1. Sort tickets in reverse and build \`adj[src]\` lists, so \`pop()\` gives the ==smallest destination==.
2. Start with \`stack = ["JFK"]\` and \`route = []\`.
3. While \`stack\` isn't empty:
   * While the top airport still has tickets, push \`adj[top].pop()\`.
   * ==Stuck: pop the top into \`route\`==.
4. Return \`route[::-1]\`.`,
    visual: {
      kind: "graph",
      title: "Itinerary · JFK→LAX, JFK→ORD, ORD→JFK",
      directed: true,
      nodes: [
        { id: "JFK", label: "JFK" },
        { id: "LAX", label: "LAX" },
        { id: "ORD", label: "ORD" },
      ],
      edges: [
        { from: "JFK", to: "LAX", label: "" },
        { from: "JFK", to: "ORD", label: "" },
        { from: "ORD", to: "JFK", label: "" },
      ],
      frames: [
        { caption: "From JFK take the smallest ticket: LAX.", pointers: [{ name: "top", node: "LAX" }], highlight: ["JFK", "LAX"], vars: kv({ stack: "[JFK, LAX]", route: "[]" }) },
        { caption: "LAX has no tickets left → it's a dead end, so it goes into the route first.", pointers: [{ name: "top", node: "JFK" }], done: ["LAX"], vars: kv({ stack: "[JFK]", route: "[LAX]" }) },
        { caption: "JFK still has a ticket to ORD → push ORD, then ORD's ticket back to JFK.", pointers: [{ name: "top", node: "JFK" }], highlight: ["ORD", "JFK"], done: ["LAX"], vars: kv({ stack: "[JFK, ORD, JFK]", route: "[LAX]" }) },
        { caption: "No tickets left anywhere → pop everything into the route.", done: ["LAX", "ORD", "JFK"], vars: kv({ stack: "[]", route: "[LAX, JFK, ORD, JFK]" }) },
        { caption: "Reverse → JFK, ORD, JFK, LAX. Greedy LAX-first would have stranded the other tickets.", done: ["JFK", "ORD", "LAX"], vars: kv({ answer: "JFK ORD JFK LAX" }) },
      ],
    },
    code: `from collections import defaultdict

def findItinerary(tickets: list[list[str]]) -> list[str]:
    adj = defaultdict(list)
    for src, dst in sorted(tickets, reverse=True):
        adj[src].append(dst)
    route, stack = [], ["JFK"]
    while stack:
        while adj[stack[-1]]:
            stack.append(adj[stack[-1]].pop())
        route.append(stack.pop())
    return route[::-1]`,
    complexity: "Time O(E log E) for the sort · Space O(E)",
  },
  {
    lc: 1584,
    variation: "mst",
    question: "Given points on a grid, return the cheapest total Manhattan distance of links that connects every point.",
    intuition: `Connecting everything as cheaply as possible is a ==minimum spanning tree==. Prim grows one tree: ==always add the cheapest edge that reaches a point not yet in the tree==. Every pair is an edge here, so just push all distances from each newly added point.`,
    algorithm: `1. Start with \`heap = [(0, 0)]\`, \`visited = set()\`, \`total = 0\`.
2. While fewer than \`n\` points are visited:
   * Pop \`(cost, i)\`. Skip it if \`i\` is already visited.
   * ==Add \`i\` to the tree== and \`total += cost\`.
   * For every unvisited \`j\`, push \`(|xi - xj| + |yi - yj|, j)\`.
3. Return \`total\`.`,
    visual: {
      kind: "graph",
      title: "Prim · A(0,0) B(1,3) C(4,1) D(5,5)",
      nodes: [
        { id: "A", label: "A (0,0)" },
        { id: "B", label: "B (1,3)" },
        { id: "C", label: "C (4,1)" },
        { id: "D", label: "D (5,5)" },
      ],
      edges: [
        { from: "A", to: "B", label: "4" },
        { from: "A", to: "C", label: "5" },
        { from: "A", to: "D", label: "10" },
        { from: "B", to: "C", label: "5" },
        { from: "B", to: "D", label: "6" },
        { from: "C", to: "D", label: "5" },
      ],
      frames: [
        { caption: "Start at A with cost 0. Push A's edges to B, C, D.", pointers: [{ name: "add", node: "A" }], highlight: ["A"], vars: kv({ heap: "(4,B) (5,C) (10,D)", total: "0" }) },
        { caption: "Cheapest is B at 4 → add it. Push B→C 5 and B→D 6.", pointers: [{ name: "add", node: "B" }], highlight: ["B"], done: ["A"], vars: kv({ heap: "(5,C) (5,C) (6,D) (10,D)", total: "4" }) },
        { caption: "Next is C at 5 → add it. Push C→D 5.", pointers: [{ name: "add", node: "C" }], highlight: ["C"], done: ["A", "B"], vars: kv({ heap: "(5,C) (5,D) (6,D) (10,D)", total: "9" }) },
        { caption: "(5, C) again → C is in the tree, skip. Then D at 5 → add it.", pointers: [{ name: "add", node: "D" }], highlight: ["D"], done: ["A", "B", "C"], vars: kv({ total: "14" }) },
        { caption: "All 4 points joined with edges 4 + 5 + 5 → answer 14.", done: ["A", "B", "C", "D"], vars: kv({ answer: "14" }) },
      ],
    },
    code: `import heapq

def minCostConnectPoints(points: list[list[int]]) -> int:
    n = len(points)
    visited = set()
    heap = [(0, 0)]
    total = 0
    while len(visited) < n:
        cost, i = heapq.heappop(heap)
        if i in visited:
            continue
        visited.add(i)
        total += cost
        xi, yi = points[i]
        for j in range(n):
            if j not in visited:
                xj, yj = points[j]
                heapq.heappush(heap, (abs(xi - xj) + abs(yi - yj), j))
    return total`,
    complexity: "Time O(n² log n) · Space O(n²)",
  },
  {
    lc: 778,
    variation: "dijkstra",
    question: "On a square grid of heights, find the earliest time t at which you can walk from the top-left to the bottom-right using only cells of height at most t.",
    intuition: `A path's cost is ==its highest cell==, not the sum. Dijkstra still works if the heap key is the ==max height seen so far==: pop the lowest one, step to neighbours with \`max(t, height)\`. The first time you pop the bottom-right corner, that \`t\` is the answer.`,
    algorithm: `1. Push \`(grid[0][0], 0, 0)\` and mark \`(0, 0)\` seen.
2. While the heap isn't empty:
   * Pop \`(t, r, c)\`, ==the lowest water level needed so far==.
   * If \`(r, c)\` is the bottom-right, return \`t\`.
   * For each unseen neighbour, mark it and push ==\`(max(t, grid[nr][nc]), nr, nc)\`==.`,
    visual: {
      kind: "grid",
      title: "Swim in rising water · 3×3",
      rows: [
        [0, 1, 6],
        [5, 8, 2],
        [7, 4, 3],
      ],
      frames: [
        { caption: "Pop t=0 at (0,0). Push (0,1) at 1 and (1,0) at 5.", highlight: ["0,0"], vars: kv({ heap: "(1:0,1) (5:1,0)" }) },
        { caption: "Pop t=1 at (0,1). Push (0,2) at 6 and (1,1) at 8.", highlight: ["0,1"], done: ["0,0"], vars: kv({ heap: "(5:1,0) (6:0,2) (8:1,1)" }) },
        { caption: "Pop t=5 at (1,0). Push (2,0) at 7.", highlight: ["1,0"], done: ["0,0", "0,1"], vars: kv({ heap: "(6:0,2) (7:2,0) (8:1,1)" }) },
        { caption: "Pop t=6 at (0,2). (1,2) has height 2 but we already needed 6 → push at max(6, 2) = 6.", highlight: ["0,2"], done: ["0,0", "0,1", "1,0"], vars: kv({ heap: "(6:1,2) (7:2,0) (8:1,1)" }) },
        { caption: "Pop t=6 at (1,2). Push (2,2) at max(6, 3) = 6.", highlight: ["1,2"], done: ["0,0", "0,1", "1,0", "0,2"], vars: kv({ heap: "(6:2,2) (7:2,0) (8:1,1)" }) },
        { caption: "Pop t=6 at the corner → answer 6. The other way round needs 7.", highlight: ["2,2"], done: ["0,0", "0,1", "0,2", "1,2"], vars: kv({ answer: "6" }) },
      ],
    },
    code: `import heapq

def swimInWater(grid: list[list[int]]) -> int:
    n = len(grid)
    heap = [(grid[0][0], 0, 0)]
    seen = {(0, 0)}
    while heap:
        t, r, c = heapq.heappop(heap)
        if r == n - 1 and c == n - 1:
            return t
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                seen.add((nr, nc))
                heapq.heappush(heap, (max(t, grid[nr][nc]), nr, nc))
    return -1`,
    complexity: "Time O(n² log n) · Space O(n²)",
  },
  {
    lc: 269,
    variation: "topo-rules",
    question: "Given a list of words already sorted in an unknown alphabet, work out one possible order of its letters, or return \"\" if the list is contradictory.",
    intuition: `Two neighbouring words only tell you one thing: ==their first differing letter== says which letter comes first. Those facts are edges, and any order that respects them is a ==topological sort==. If a longer word comes before its own prefix, or the edges form a cycle, no order exists.`,
    algorithm: `1. Make a node (in-degree 0) for every letter that appears.
2. For each adjacent pair \`(a, b)\`:
   * Find the ==first index where they differ== → add edge \`a[i] → b[i]\` (once) and bump its in-degree.
   * If there's no difference and \`len(a) > len(b)\`, return \`""\`.
3. Kahn's algorithm: queue every letter with in-degree 0.
   * Pop a letter, append it, lower each neighbour's in-degree, queue any that hit 0.
4. If ==every letter was output==, join them; otherwise there's a cycle → \`""\`.`,
    visual: {
      kind: "graph",
      title: "Alien order · ca, cb, ba, bc",
      directed: true,
      nodes: [
        { id: "a", label: "a" },
        { id: "b", label: "b" },
        { id: "c", label: "c" },
      ],
      edges: [
        { from: "a", to: "b", label: "" },
        { from: "c", to: "b", label: "" },
        { from: "a", to: "c", label: "" },
      ],
      frames: [
        { caption: "ca vs cb differ at index 1 → a before b. cb vs ba → c before b. ba vs bc → a before c.", highlight: ["a", "b", "c"], vars: kv({ edges: "a→b, c→b, a→c", indeg: "a:0 b:2 c:1" }) },
        { caption: "Only a has in-degree 0 → queue it.", pointers: [{ name: "q", node: "a" }], highlight: ["a"], vars: kv({ queue: "[a]", res: "" }) },
        { caption: "Output a. b drops to 1, c drops to 0 → queue c.", pointers: [{ name: "q", node: "c" }], highlight: ["c"], done: ["a"], vars: kv({ indeg: "b:1 c:0", queue: "[c]", res: "a" }) },
        { caption: "Output c. b drops to 0 → queue b.", pointers: [{ name: "q", node: "b" }], highlight: ["b"], done: ["a", "c"], vars: kv({ indeg: "b:0", queue: "[b]", res: "ac" }) },
        { caption: "Output b. All 3 letters placed, so no cycle → \"acb\".", done: ["a", "c", "b"], vars: kv({ answer: "acb" }) },
      ],
    },
    code: `from collections import deque

def alienOrder(words: list[str]) -> str:
    adj = {c: set() for w in words for c in w}
    indeg = {c: 0 for c in adj}
    for a, b in zip(words, words[1:]):
        for x, y in zip(a, b):
            if x != y:
                if y not in adj[x]:
                    adj[x].add(y)
                    indeg[y] += 1
                break
        else:
            if len(a) > len(b):
                return ""
    q = deque(c for c in indeg if indeg[c] == 0)
    res = []
    while q:
        c = q.popleft()
        res.append(c)
        for nxt in adj[c]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return "".join(res) if len(res) == len(indeg) else ""`,
    complexity: "Time O(total letters) · Space O(1) (at most 26 letters and 26² edges)",
  },
  {
    lc: 787,
    variation: "bellman-ford",
    question: "Given priced one-way flights, find the cheapest way from src to dst using at most k stopovers, or -1 if there is none.",
    intuition: `At most \`k\` stops means ==at most \`k + 1\` flights==. Bellman-Ford's round \`i\` gives the cheapest price using at most \`i\` edges, so run exactly \`k + 1\` rounds. Each round ==reads last round's prices and writes into a copy==, so one round can't chain two new flights.`,
    algorithm: `1. \`prices = [inf] * n\` and \`prices[src] = 0\`.
2. Repeat \`k + 1\` times:
   * ==\`tmp = prices.copy()\`==.
   * For each flight \`(u, v, w)\`: if \`prices[u] + w < tmp[v]\`, set \`tmp[v] = prices[u] + w\`.
   * \`prices = tmp\`.
3. Return \`prices[dst]\`, or \`-1\` if it's still \`inf\`.`,
    visual: {
      kind: "graph",
      title: "Cheapest flights · 0 → 3, k = 1",
      directed: true,
      nodes: [
        { id: "0", label: "0" },
        { id: "1", label: "1" },
        { id: "2", label: "2" },
        { id: "3", label: "3" },
      ],
      edges: [
        { from: "0", to: "1", label: "100" },
        { from: "1", to: "2", label: "100" },
        { from: "0", to: "2", label: "500" },
        { from: "2", to: "3", label: "100" },
        { from: "1", to: "3", label: "600" },
      ],
      frames: [
        { caption: "Start: only src is reachable, at price 0.", pointers: [{ name: "src", node: "0" }], highlight: ["0"], vars: kv({ prices: "[0, ∞, ∞, ∞]" }) },
        { caption: "Round 1 (1 flight): from 0 reach 1 for 100 and 2 for 500.", highlight: ["1", "2"], done: ["0"], vars: kv({ prices: "[0, 100, 500, ∞]" }) },
        { caption: "Round 2 reads round 1: 1→2 gives 200, 1→3 gives 700, 2→3 gives 500+100 = 600.", highlight: ["2", "3"], done: ["0", "1"], vars: kv({ prices: "[0, 100, 200, 600]" }) },
        { caption: "k + 1 = 2 rounds done → 600. Without the copy, 2 would hit 200 mid-round and 3 would wrongly get 300 (3 flights).", pointers: [{ name: "dst", node: "3" }], highlight: ["3"], done: ["0", "1", "2"], vars: kv({ answer: "600" }) },
      ],
    },
    code: `def findCheapestPrice(n: int, flights: list[list[int]], src: int, dst: int, k: int) -> int:
    prices = [float("inf")] * n
    prices[src] = 0
    for _ in range(k + 1):
        tmp = prices.copy()
        for u, v, w in flights:
            if prices[u] + w < tmp[v]:
                tmp[v] = prices[u] + w
        prices = tmp
    return -1 if prices[dst] == float("inf") else prices[dst]`,
    complexity: "Time O(k · E) · Space O(n)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */