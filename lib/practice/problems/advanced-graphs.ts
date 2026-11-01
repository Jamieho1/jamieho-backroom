/**
 * Arena problems: advanced-graphs. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
 * - 743 Network Delay Time (Medium)
 * - 332 Reconstruct Itinerary (Hard)
 * - 1584 Min Cost to Connect All Points (Medium)
 * - 778 Swim in Rising Water (Hard)
 * - 269 Alien Dictionary (Hard)
 * - 787 Cheapest Flights Within K Stops (Medium)
 */
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 743,
    kind: "algorithm",
    statement: `A network has \`n\` nodes labelled \`1\` to \`n\`. You are given \`times\`, a list of **directed** edges \`times[i] = [u, v, w]\`: a signal sent from \`u\` arrives at \`v\` after \`w\` time units.

A signal is sent from node \`k\` at time 0 and travels along every edge it can. Return the time at which **the last node** receives the signal, i.e. the largest shortest-path distance from \`k\`. If some node can never be reached, return \`-1\`.`,
    examples: [
      { input: "times = [[1,2,4],[1,3,1],[3,2,2],[2,4,1]], n = 4, k = 1", output: "4", explanation: "Shortest arrival times: node 3 at 1, node 2 at 3 (via 3), node 4 at 4 (via 3 and 2). The last is 4." },
      { input: "times = [[1,2,1]], n = 3, k = 1", output: "-1", explanation: "Node 3 has no incoming edge, so the signal never reaches it." },
    ],
    constraints: ["1 <= k <= n <= 100", "1 <= times.length <= 6000", "times[i] = [u, v, w] with 1 <= u, v <= n, u != v", "0 <= w <= 100", "No two edges share the same (u, v) pair"],
    signature: `class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:`,
    method: "networkDelayTime",
    tests: [
      { id: "ex1", input: "[[[1,2,4],[1,3,1],[3,2,2],[2,4,1]], 4, 1]", expected: "4", visible: true },
      { id: "ex2", input: "[[[1,2,1]], 3, 1]", expected: "-1", visible: true },
      { id: "single_node", input: "[[], 1, 1]", expected: "0", visible: false },
      { id: "wrong_direction", input: "[[[2,1,5]], 2, 1]", expected: "-1", visible: false },
      { id: "zero_weights", input: "[[[1,2,0],[2,3,0],[3,1,0]], 3, 2]", expected: "0", visible: false },
      { id: "start_not_one", input: "[[[3,1,2],[3,2,7],[1,2,3],[2,4,1]], 4, 3]", expected: "6", visible: false },
      { id: "cycle", input: "[[[1,2,1],[2,3,1],[3,1,1],[3,4,10],[1,4,20]], 4, 1]", expected: "12", visible: false },
      { id: "detour_cheaper", input: "[[[1,5,50],[1,2,10],[2,3,10],[3,4,10],[4,5,10]], 5, 1]", expected: "40", visible: false },
      { id: "large_chain", input: "[[[i, i + 1, 1] for i in range(1, 100)] + [[1, 100, 50]], 100, 1]", expected: "98", visible: false },
      { id: "large_dense", input: "[[[u, v, (u * 7 + v * 13) % 50 + 1] for u in range(1, 101) for v in range(1, 101) if u != v and abs(u - v) <= 30], 100, 37]", expected: "12", visible: false },
    ],
    solution: `class Solution:
    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:
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
    hints: ["The time each node hears the signal is its shortest-path distance from k. All weights are non-negative.", "Dijkstra: pop the closest unfinished node from a min-heap, fix its distance, and push its neighbours with the new totals.", "The answer is the maximum finished distance, or -1 if fewer than n nodes were finished."],
    clarify: [
      { question: "Are the edges directed?", answer: "Yes, [u, v, w] only lets the signal go from u to v." },
      { question: "What if n = 1?", answer: "The source already has the signal at time 0, so return 0." },
    ],
  },
  {
    lc: 332,
    kind: "algorithm",
    statement: `You have a list of plane \`tickets\`, where \`tickets[i] = [from, to]\` is a one-way flight between two airports (each a code of three capital letters). Reconstruct the trip:

- The trip **starts at \`"JFK"\`**.
- It uses **every ticket exactly once**.
- If more than one itinerary satisfies these rules, return the one that is **smallest in lexical order** when the airport codes are compared one by one (as a list of strings).

It is guaranteed that at least one valid itinerary exists. Return the airports in the order they are visited, starting with \`"JFK"\`.`,
    examples: [
      { input: "tickets = [[\"JFK\",\"LAX\"],[\"LAX\",\"JFK\"],[\"JFK\",\"ATL\"]]", output: "[\"JFK\",\"LAX\",\"JFK\",\"ATL\"]", explanation: "Going to \"ATL\" first would be lexically smaller, but then the remaining tickets could not be used, so it is not a valid trip." },
      { input: "tickets = [[\"JFK\",\"BOS\"],[\"JFK\",\"AUS\"],[\"AUS\",\"JFK\"]]", output: "[\"JFK\",\"AUS\",\"JFK\",\"BOS\"]", explanation: "Both orders use all tickets; \"AUS\" < \"BOS\" decides it." },
    ],
    constraints: ["1 <= tickets.length <= 300", "Each airport code has 3 uppercase English letters", "from != to", "At least one valid itinerary exists"],
    signature: `class Solution:
    def findItinerary(self, tickets: List[List[str]]) -> List[str]:`,
    method: "findItinerary",
    tests: [
      { id: "ex1", input: "[[[\"JFK\",\"LAX\"],[\"LAX\",\"JFK\"],[\"JFK\",\"ATL\"]]]", expected: "['JFK', 'LAX', 'JFK', 'ATL']", visible: true },
      { id: "ex2", input: "[[[\"JFK\",\"BOS\"],[\"JFK\",\"AUS\"],[\"AUS\",\"JFK\"]]]", expected: "['JFK', 'AUS', 'JFK', 'BOS']", visible: true },
      { id: "single", input: "[[[\"JFK\",\"SFO\"]]]", expected: "['JFK', 'SFO']", visible: false },
      { id: "duplicate_tickets", input: "[[[\"JFK\",\"ORD\"],[\"ORD\",\"JFK\"],[\"JFK\",\"ORD\"],[\"ORD\",\"JFK\"]]]", expected: "['JFK', 'ORD', 'JFK', 'ORD', 'JFK']", visible: false },
      { id: "dead_end_first", input: "[[[\"JFK\",\"AAA\"],[\"JFK\",\"BBB\"],[\"BBB\",\"JFK\"]]]", expected: "['JFK', 'BBB', 'JFK', 'AAA']", visible: false },
      { id: "loop_later", input: "[[[\"JFK\",\"MIA\"],[\"MIA\",\"SEA\"],[\"SEA\",\"MIA\"],[\"MIA\",\"DEN\"],[\"DEN\",\"MIA\"],[\"MIA\",\"JFK\"]]]", expected: "['JFK', 'MIA', 'DEN', 'MIA', 'SEA', 'MIA', 'JFK']", visible: false },
      { id: "chain", input: "[[[\"DEN\",\"SEA\"],[\"JFK\",\"ORD\"],[\"ORD\",\"DEN\"]]]", expected: "['JFK', 'ORD', 'DEN', 'SEA']", visible: false },
      { id: "nested", input: "[[[\"JFK\",\"KUL\"],[\"JFK\",\"NRT\"],[\"NRT\",\"JFK\"],[\"KUL\",\"HND\"],[\"HND\",\"KUL\"],[\"KUL\",\"JFK\"],[\"JFK\",\"AMS\"]]]", expected: "['JFK', 'KUL', 'HND', 'KUL', 'JFK', 'NRT', 'JFK', 'AMS']", visible: false },
      { id: "large_spokes", input: "[[['JFK', 'X' + chr(65 + i) + 'A'] for i in range(26)] + [['X' + chr(65 + i) + 'A', 'JFK'] for i in range(26)]]", expected: "['JFK'] + [x for i in range(26) for x in ('X' + chr(65 + i) + 'A', 'JFK')]", visible: false },
    ],
    solution: `class Solution:
    def findItinerary(self, tickets: List[List[str]]) -> List[str]:
        graph = defaultdict(list)
        for src, dst in sorted(tickets, reverse=True):
            graph[src].append(dst)
        route = []
        stack = ["JFK"]
        while stack:
            while graph[stack[-1]]:
                stack.append(graph[stack[-1]].pop())
            route.append(stack.pop())
        return route[::-1]`,
    hints: ["You need a path that uses every edge exactly once (an Eulerian path) starting at JFK.", "Greedy 'always take the smallest destination' can get stuck in a dead end. Hierholzer's algorithm fixes this: walk greedily, and add an airport to the route only when it has no unused tickets left.", "Airports are added in reverse finishing order, so reverse the list at the end. Keep each airport's destinations sorted so the smallest is taken first."],
    clarify: [
      { question: "Can there be duplicate tickets?", answer: "Yes, the same [from, to] may appear several times and each copy must be used once." },
      { question: "Is a valid itinerary always possible?", answer: "Yes, the input always allows at least one." },
    ],
  },
  {
    lc: 1584,
    kind: "algorithm",
    statement: `You are given \`points\`, where \`points[i] = [x, y]\` is a point on a 2D plane. Connecting two points \`[x1, y1]\` and \`[x2, y2]\` costs their **Manhattan distance** \`|x1 - x2| + |y1 - y2|\`.

Return the **minimum total cost** needed so that every point is connected to every other point, directly or through other points (in other words, the weight of a minimum spanning tree). A single point costs \`0\`.`,
    examples: [
      { input: "points = [[0,0],[3,0],[3,4],[7,4]]", output: "11", explanation: "Connect (0,0)-(3,0) for 3, (3,0)-(3,4) for 4 and (3,4)-(7,4) for 4." },
      { input: "points = [[5,5]]", output: "0", explanation: "One point is already connected." },
    ],
    constraints: ["1 <= points.length <= 1000", "-10^6 <= x, y <= 10^6", "All points are distinct"],
    signature: `class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:`,
    method: "minCostConnectPoints",
    tests: [
      { id: "ex1", input: "[[[0,0],[3,0],[3,4],[7,4]]]", expected: "11", visible: true },
      { id: "ex2", input: "[[[5,5]]]", expected: "0", visible: true },
      { id: "two", input: "[[[-2,3],[4,-1]]]", expected: "10", visible: false },
      { id: "square", input: "[[[0,0],[0,2],[2,0],[2,2]]]", expected: "6", visible: false },
      { id: "negatives", input: "[[[-5,-5],[-1,-2],[3,0],[0,4],[-4,6]]]", expected: "26", visible: false },
      { id: "far_apart", input: "[[[0,0],[1000000,1000000],[-1000000,-1000000]]]", expected: "4000000", visible: false },
      { id: "cluster", input: "[[[1,1],[2,1],[1,2],[20,20],[21,20],[20,21]]]", expected: "41", visible: false },
      { id: "line", input: "[[[i * 3, 0] for i in range(300)]]", expected: "897", visible: false },
      { id: "large_grid", input: "[[[(i % 25) * 3, (i // 25) * 2] for i in range(625)]]", expected: "1272", visible: false },
      { id: "large_scatter", input: "[[[(i * 7919) % 1000, (i * 104729) % 997] for i in range(800)]]", expected: "17742", visible: false },
    ],
    solution: `class Solution:
    def minCostConnectPoints(self, points: List[List[int]]) -> int:
        n = len(points)
        INF = float("inf")
        best = [INF] * n
        best[0] = 0
        used = [False] * n
        total = 0
        for _ in range(n):
            u = -1
            for i in range(n):
                if not used[i] and (u == -1 or best[i] < best[u]):
                    u = i
            used[u] = True
            total += best[u]
            ux, uy = points[u]
            for v in range(n):
                if not used[v]:
                    d = abs(ux - points[v][0]) + abs(uy - points[v][1])
                    if d < best[v]:
                        best[v] = d
        return total`,
    hints: ["Every pair of points is a possible edge; the cheapest way to connect everything is a minimum spanning tree.", "Prim's algorithm: grow a tree from one point, always adding the outside point that is cheapest to attach.", "The graph is dense (n^2 edges), so an O(n^2) Prim that keeps 'cheapest attach cost' per point beats sorting all edges."],
    clarify: [
      { question: "Is the distance Euclidean?", answer: "No, it is the Manhattan distance |dx| + |dy|." },
      { question: "Can I connect points through other points?", answer: "Yes, points only need to be connected via some path." },
    ],
  },
  {
    lc: 778,
    kind: "algorithm",
    statement: `You are given an \`n x n\` grid where \`grid[r][c]\` is the elevation of cell \`(r, c)\`. The values are a **permutation** of \`0\` to \`n^2 - 1\` (each appears exactly once).

Rain makes the water level rise: at time \`t\` the water everywhere is at depth \`t\`. You can swim from a cell to an adjacent cell (up, down, left, right) only if **both** cells have elevation at most \`t\`. Swimming itself takes no time.

You start at the top-left cell \`(0, 0)\`. Return the **earliest time** \`t\` at which you can reach the bottom-right cell \`(n - 1, n - 1)\`.`,
    examples: [
      { input: "grid = [[0,3],[1,2]]", output: "2", explanation: "Go down to 1 and then right to 2; at t = 2 every cell on this path is under water." },
      { input: "grid = [[0,6,4],[1,8,3],[7,5,2]]", output: "6", explanation: "The route along the top and right, 0 → 6 → 4 → 3 → 2, never needs more than 6. Going down the left side needs 7, and the centre needs 8." },
    ],
    constraints: ["1 <= n <= 50", "0 <= grid[r][c] < n^2", "All values are distinct"],
    signature: `class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:`,
    method: "swimInWater",
    tests: [
      { id: "ex1", input: "[[[0,3],[1,2]]]", expected: "2", visible: true },
      { id: "ex2", input: "[[[0,6,4],[1,8,3],[7,5,2]]]", expected: "6", visible: true },
      { id: "single", input: "[[[0]]]", expected: "0", visible: false },
      { id: "start_high", input: "[[[3,0],[1,2]]]", expected: "3", visible: false },
      { id: "snake", input: "[[[0,1,2,3],[12,13,14,4],[11,15,10,5],[9,8,7,6]]]", expected: "6", visible: false },
      { id: "must_climb", input: "[[[0,8,7],[6,5,1],[4,3,2]]]", expected: "6", visible: false },
      { id: "end_low", input: "[[[0,2],[3,1]]]", expected: "2", visible: false },
      { id: "large_rowmajor", input: "[[[r * 50 + c for c in range(50)] for r in range(50)]]", expected: "2499", visible: false },
      { id: "large_scrambled", input: "[[[(r * 50 + c) * 7 % 2500 for c in range(50)] for r in range(50)]]", expected: "2493", visible: false },
      { id: "large_reversed", input: "[[[2499 - (r * 50 + c) for c in range(50)] for r in range(50)]]", expected: "2499", visible: false },
    ],
    solution: `class Solution:
    def swimInWater(self, grid: List[List[int]]) -> int:
        n = len(grid)
        heap = [(grid[0][0], 0, 0)]
        seen = {(0, 0)}
        while heap:
            t, r, c = heapq.heappop(heap)
            if r == n - 1 and c == n - 1:
                return t
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    heapq.heappush(heap, (max(t, grid[nr][nc]), nr, nc))
        return -1`,
    hints: ["The time needed for a path is the highest elevation on it. You want the path whose maximum is smallest.", "Dijkstra works with 'cost = max so far' instead of 'sum so far': always expand the reachable cell with the lowest required time.", "Alternatively, binary search on t and check with BFS/DFS whether the corner is reachable using only cells <= t."],
    clarify: [
      { question: "Does the starting cell's elevation matter?", answer: "Yes, you need t >= grid[0][0] as well, since both cells of every move must be covered." },
      { question: "Does swimming take time?", answer: "No, any distance can be covered instantly once the cells are under water." },
    ],
  },
  {
    lc: 269,
    kind: "algorithm",
    statement: `An alien language uses lowercase English letters, but their alphabetical order is unknown to you. You are given a list \`words\` that is claimed to be **sorted** according to the alien alphabet.

Work out an order of the letters and return it as a string:

- The string must contain **every distinct letter that appears in \`words\`**, each exactly once.
- It must agree with every rule implied by the sorted list: comparing two adjacent words, the first position where they differ tells you which letter comes first.
- If the list cannot be sorted under **any** alphabet (the rules contradict each other, or a word comes **before** one of its own proper prefixes, like \`"abc"\` before \`"ab"\`), return \`""\`.
- If several orders work, return **any** of them.

**Checking.** The checker verifies your string against these rules (or checks for \`""\` when no order exists). A correct answer makes the test report \`True\`.`,
    examples: [
      { input: "words = [\"bca\",\"bcd\",\"ab\",\"ad\",\"dc\"]", output: "\"bcad\"", explanation: "The pairs give a < d, b < a and b < d. \"c\" is unconstrained, so \"cbad\", \"bacd\" and others are also correct." },
      { input: "words = [\"ab\",\"a\"]", output: "\"\"", explanation: "\"ab\" is listed before its own prefix \"a\", which no alphabet allows." },
    ],
    constraints: ["1 <= words.length <= 100", "1 <= words[i].length <= 100", "words[i] consists of lowercase English letters"],
    signature: `class Solution:
    def alienOrder(self, words: List[str]) -> str:`,
    method: "alienOrder",
    driver: `def run(ns, args):
    words = args[0]
    got = ns["Solution"]().alienOrder(list(words))
    letters = set("".join(words))
    rules = set()
    possible = True
    for w1, w2 in zip(words, words[1:]):
        for x, y in zip(w1, w2):
            if x != y:
                rules.add((x, y))
                break
        else:
            if len(w1) > len(w2):
                possible = False
    if possible:
        indeg = {c: 0 for c in letters}
        for x, y in rules:
            indeg[y] += 1
        stack = [c for c in letters if indeg[c] == 0]
        seen = 0
        while stack:
            x = stack.pop()
            seen += 1
            for a, b in rules:
                if a == x:
                    indeg[b] -= 1
                    if indeg[b] == 0:
                        stack.append(b)
        possible = seen == len(letters)
    if not possible:
        return got == ""
    if not isinstance(got, str) or len(got) != len(letters) or set(got) != letters:
        return False
    pos = {c: i for i, c in enumerate(got)}
    return all(pos[x] < pos[y] for x, y in rules)`,
    tests: [
      { id: "ex1", input: "[[\"bca\",\"bcd\",\"ab\",\"ad\",\"dc\"]]", expected: "True", visible: true },
      { id: "ex2", input: "[[\"ab\",\"a\"]]", expected: "True", visible: true },
      { id: "single_word", input: "[[\"zyx\"]]", expected: "True", visible: false },
      { id: "single_letter", input: "[[\"q\"]]", expected: "True", visible: false },
      { id: "contradiction", input: "[[\"a\",\"b\",\"a\"]]", expected: "True", visible: false },
      { id: "cycle", input: "[[\"ab\",\"ac\",\"bc\",\"ba\"]]", expected: "True", visible: false },
      { id: "same_prefix_ok", input: "[[\"ab\",\"abc\",\"b\"]]", expected: "True", visible: false },
      { id: "duplicates", input: "[[\"zz\",\"zz\",\"zx\",\"x\"]]", expected: "True", visible: false },
      { id: "full_reverse", input: "[[chr(122 - i) for i in range(26)]]", expected: "True", visible: false },
      { id: "large_words", input: "[[chr(97 + i) * 50 + chr(97 + (i + 1) % 26) for i in range(20)]]", expected: "True", visible: false },
    ],
    solution: `class Solution:
    def alienOrder(self, words: List[str]) -> str:
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
        q = deque(sorted(c for c in indeg if indeg[c] == 0))
        res = []
        while q:
            c = q.popleft()
            res.append(c)
            for nxt in sorted(adj[c]):
                indeg[nxt] -= 1
                if indeg[nxt] == 0:
                    q.append(nxt)
        return "".join(res) if len(res) == len(indeg) else ""`,
    hints: ["Only adjacent words give information, and only at their first differing position: that yields one edge 'x comes before y'.", "Watch for the invalid case where a longer word comes before its own prefix: that alone makes the answer \"\".", "Topologically sort the letters (Kahn's algorithm). Include letters with no rules; if not every letter gets output, there is a cycle and the answer is \"\"."],
    clarify: [
      { question: "Which letters must appear in the answer?", answer: "Exactly the distinct letters used in the words, each once, even those with no ordering rules." },
      { question: "If several alphabets fit, which one should I return?", answer: "Any of them; the checker accepts every valid order." },
      { question: "What about a word followed by its own prefix?", answer: "That is impossible in any alphabet, so return \"\"." },
    ],
  },
  {
    lc: 787,
    kind: "algorithm",
    statement: `There are \`n\` cities numbered \`0\` to \`n - 1\`, and a list of one-way \`flights\` where \`flights[i] = [from, to, price]\`.

Given a starting city \`src\`, a destination \`dst\` and an integer \`k\`, return the **lowest total price** to fly from \`src\` to \`dst\` using **at most \`k\` stops** (a stop is an intermediate city, so at most \`k + 1\` flights). If no such route exists, return \`-1\`.`,
    examples: [
      { input: "n = 4, flights = [[0,1,50],[1,3,50],[0,2,20],[2,1,10],[0,3,200]], src = 0, dst = 3, k = 1", output: "100", explanation: "0 → 1 → 3 costs 100. The cheaper 0 → 2 → 1 → 3 (80) needs 2 stops, which is too many." },
      { input: "n = 4, flights = [[0,1,50],[1,3,50],[0,2,20],[2,1,10],[0,3,200]], src = 0, dst = 3, k = 0", output: "200", explanation: "With no stops allowed only the direct flight works." },
    ],
    constraints: ["1 <= n <= 100", "0 <= flights.length <= n * (n - 1) / 2", "flights[i] = [from, to, price] with from != to and 1 <= price <= 10^4", "No duplicate flights", "0 <= src, dst, k < n, src != dst"],
    signature: `class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:`,
    method: "findCheapestPrice",
    tests: [
      { id: "ex1", input: "[4, [[0,1,50],[1,3,50],[0,2,20],[2,1,10],[0,3,200]], 0, 3, 1]", expected: "100", visible: true },
      { id: "ex2", input: "[4, [[0,1,50],[1,3,50],[0,2,20],[2,1,10],[0,3,200]], 0, 3, 0]", expected: "200", visible: true },
      { id: "more_stops", input: "[4, [[0,1,50],[1,3,50],[0,2,20],[2,1,10],[0,3,200]], 0, 3, 2]", expected: "80", visible: false },
      { id: "no_flights", input: "[2, [], 0, 1, 1]", expected: "-1", visible: false },
      { id: "unreachable", input: "[3, [[0,1,5],[2,1,5]], 0, 2, 2]", expected: "-1", visible: false },
      { id: "too_few_stops", input: "[4, [[0,1,1],[1,2,1],[2,3,1]], 0, 3, 1]", expected: "-1", visible: false },
      { id: "backwards_edge", input: "[3, [[1,0,1],[0,2,7],[1,2,1]], 0, 2, 1]", expected: "7", visible: false },
      { id: "cycle", input: "[4, [[0,1,1],[1,0,1],[1,2,5],[2,3,1],[0,3,100]], 0, 3, 3]", expected: "7", visible: false },
      { id: "large_chain_ok", input: "[100, [[i, i + 1, 1] for i in range(99)] + [[0, 99, 1000]], 0, 99, 98]", expected: "99", visible: false },
      { id: "large_chain_short", input: "[100, [[i, i + 1, 1] for i in range(99)] + [[0, 99, 1000]], 0, 99, 97]", expected: "1000", visible: false },
    ],
    solution: `class Solution:
    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:
        INF = float("inf")
        prices = [INF] * n
        prices[src] = 0
        for _ in range(k + 1):
            nxt = prices[:]
            for u, v, p in flights:
                if prices[u] + p < nxt[v]:
                    nxt[v] = prices[u] + p
            prices = nxt
        return -1 if prices[dst] == INF else prices[dst]`,
    hints: ["At most k stops means at most k + 1 flights. Plain Dijkstra ignores that limit and can pick a cheap but too-long route.", "Bellman-Ford's i-th round finds the cheapest price using at most i edges, so run exactly k + 1 rounds.", "In each round, relax from a copy of the previous round's prices so that one round never chains two new flights."],
    clarify: [
      { question: "Does k count flights or intermediate cities?", answer: "Intermediate cities: k stops allows up to k + 1 flights." },
      { question: "What if dst cannot be reached within k stops?", answer: "Return -1." },
    ],
  },
];
