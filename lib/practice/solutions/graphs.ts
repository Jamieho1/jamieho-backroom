/**
 * graphs: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
 * - 200 Number of Islands (Medium)
 * - 695 Max Area of Island (Medium)
 * - 133 Clone Graph (Medium)
 * - 286 Walls and Gates (Medium)
 * - 994 Rotting Oranges (Medium)
 * - 417 Pacific Atlantic Water Flow (Medium)
 * - 130 Surrounded Regions (Medium)
 * - 207 Course Schedule (Medium)
 * - 210 Course Schedule II (Medium)
 * - 261 Graph Valid Tree (Medium)
 * - 323 Number of Connected Components in an Undirected Graph (Medium)
 * - 684 Redundant Connection (Medium)
 * - 127 Word Ladder (Hard)
 * - 773 Sliding Puzzle (Hard, extra)
 */
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));

export const variations: Variation[] = [
  {
    id: "grid-dfs",
    topic: "graphs",
    name: "Grid flood fill (DFS)",
    change: "Base pattern. Each cell is a node with 4 neighbours. Scan the grid; ==every unvisited land cell starts a DFS== that marks its whole component so it's never counted twice.",
    problems: [200, 695],
  },
  {
    id: "border-in",
    topic: "graphs",
    name: "Flood from the border",
    change: "Ask the reverse question: instead of searching out from every cell, ==start the DFS from the border cells== and mark what they can reach. Everything else is the answer (or its opposite).",
    problems: [417, 130],
  },
  {
    id: "bfs-layers",
    topic: "graphs",
    name: "BFS by layers (shortest steps)",
    change: "Swap DFS for a queue: ==one BFS layer = one step==, so the first time you reach a cell or word is the shortest distance. Put ==every source in the queue at the start== when there are several.",
    problems: [286, 994, 127, 773],
  },
  {
    id: "clone-map",
    topic: "graphs",
    name: "Traverse with an old → new map",
    change: "Same DFS over an adjacency list, but the visited set becomes ==a map from each original node to its copy==, so cycles reuse the copy instead of looping.",
    problems: [133],
  },
  {
    id: "topo-sort",
    topic: "graphs",
    name: "Topological sort (Kahn's)",
    change: "Directed edges mean \"must come first\". ==Repeatedly take a node with in-degree 0==; if some nodes never reach 0, there's a cycle.",
    problems: [207, 210],
  },
  {
    id: "union-find",
    topic: "graphs",
    name: "Union-find",
    change: "Only connectivity matters, edge by edge. ==Union the two endpoints; if they already share a root, this edge closes a cycle==. Successful unions also count components.",
    problems: [261, 323, 684],
  },
];

export const solutions: Solution[] = [
  {
    lc: 200,
    variation: "grid-dfs",
    question: "Given a grid of land ('1') and water ('0'), count the separate islands, where land connects up, down, left and right.",
    intuition: `Each island is a connected component. Scan every cell; ==each time you hit land you haven't touched, that's a new island==. Run a DFS from it and ==sink every connected land cell== (set it to \`"0"\`) so the scan never counts it again.`,
    algorithm: `1. Set \`count = 0\`.
2. Define \`dfs(r, c)\`:
   * Return if \`(r, c)\` is off the grid or not \`"1"\`.
   * ==Set \`grid[r][c] = "0"\`== (visited).
   * Call \`dfs\` on the 4 neighbours.
3. For every cell \`(r, c)\`:
   * If it's \`"1"\`, call \`dfs(r, c)\` and ==add 1 to \`count\`==.
4. Return \`count\`.`,
    visual: {
      kind: "grid",
      title: "Number of islands · 4×4",
      rows: [
        ["1", "1", "0", "1"],
        ["0", "1", "0", "1"],
        ["1", "0", "0", "0"],
        ["1", "0", "1", "1"],
      ],
      frames: [
        { caption: "Scan reaches (0,0): unvisited land → new island, count = 1.", highlight: ["0,0"], vars: kv({ count: "1" }) },
        { caption: "DFS sinks (0,0), (0,1), (1,1) so they're never counted again.", highlight: ["0,0", "0,1", "1,1"], cells: [{ at: "0,0", value: "0" }, { at: "0,1", value: "0" }, { at: "1,1", value: "0" }], done: ["0,0", "0,1", "1,1"], vars: kv({ count: "1" }) },
        { caption: "(0,3) is land → count = 2. DFS sinks (0,3), (1,3).", highlight: ["0,3", "1,3"], cells: [{ at: "0,3", value: "0" }, { at: "1,3", value: "0" }], done: ["0,0", "0,1", "1,1", "0,3", "1,3"], vars: kv({ count: "2" }) },
        { caption: "(2,0) is land → count = 3. Sinks (2,0), (3,0).", highlight: ["2,0", "3,0"], cells: [{ at: "2,0", value: "0" }, { at: "3,0", value: "0" }], done: ["0,0", "0,1", "1,1", "0,3", "1,3", "2,0", "3,0"], vars: kv({ count: "3" }) },
        { caption: "(3,2) is land → count = 4. Sinks (3,2), (3,3). Scan ends: 4 islands.", highlight: ["3,2", "3,3"], cells: [{ at: "3,2", value: "0" }, { at: "3,3", value: "0" }], done: ["0,0", "0,1", "1,1", "0,3", "1,3", "2,0", "3,0", "3,2", "3,3"], vars: kv({ count: "4", answer: "4" }) },
      ],
    },
    code: `def numIslands(grid: list[list[str]]) -> int:
    rows, cols = len(grid), len(grid[0])

    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != "1":
            return
        grid[r][c] = "0"
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)

    count = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1":
                dfs(r, c)
                count += 1
    return count`,
    complexity: "Time O(rows · cols) · Space O(rows · cols) for the recursion",
  },
  {
    lc: 695,
    variation: "grid-dfs",
    question: "Given a 0/1 grid where 1 is land, return the size of the biggest island (4-directional), or 0 if there's none.",
    intuition: `Same flood fill as Number of Islands, but ==the DFS returns how many cells it sank==: \`1 + dfs(down) + dfs(up) + dfs(right) + dfs(left)\`. Sinking each cell as you go means it's counted exactly once. Keep the max.`,
    algorithm: `1. Define \`dfs(r, c)\`:
   * Return 0 if \`(r, c)\` is off the grid or not 1.
   * Set \`grid[r][c] = 0\`.
   * ==Return \`1 + \` the 4 neighbour calls==.
2. For every cell, \`best = max(best, dfs(r, c))\`.
3. Return \`best\`.`,
    visual: {
      kind: "grid",
      title: "Max area of island · 4×4",
      rows: [
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [1, 0, 0, 1],
        [1, 0, 0, 1],
      ],
      frames: [
        { caption: "Scan reaches (0,1): land → start a DFS.", highlight: ["0,1"], vars: kv({ best: "0" }) },
        { caption: "DFS sinks 4 connected cells and returns 4 → best = 4.", highlight: ["0,1", "0,2", "1,1", "1,2"], cells: [{ at: "0,1", value: 0 }, { at: "0,2", value: 0 }, { at: "1,1", value: 0 }, { at: "1,2", value: 0 }], done: ["0,1", "0,2", "1,1", "1,2"], vars: kv({ area: "4", best: "4" }) },
        { caption: "(2,0): DFS returns 2. best stays 4.", highlight: ["2,0", "3,0"], cells: [{ at: "2,0", value: 0 }, { at: "3,0", value: 0 }], done: ["0,1", "0,2", "1,1", "1,2", "2,0", "3,0"], vars: kv({ area: "2", best: "4" }) },
        { caption: "(2,3): DFS returns 2. Scan ends → answer 4.", highlight: ["2,3", "3,3"], cells: [{ at: "2,3", value: 0 }, { at: "3,3", value: 0 }], done: ["0,1", "0,2", "1,1", "1,2", "2,0", "3,0", "2,3", "3,3"], vars: kv({ area: "2", answer: "4" }) },
      ],
    },
    code: `def maxAreaOfIsland(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])

    def dfs(r, c):
        if r < 0 or c < 0 or r >= rows or c >= cols or grid[r][c] != 1:
            return 0
        grid[r][c] = 0
        return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)

    best = 0
    for r in range(rows):
        for c in range(cols):
            best = max(best, dfs(r, c))
    return best`,
    complexity: "Time O(rows · cols) · Space O(rows · cols) for the recursion",
  },
  {
    lc: 133,
    variation: "clone-map",
    question: "Given one node of a connected undirected graph, return a deep copy of the whole graph.",
    intuition: `DFS through the graph and copy each node the first time you see it. The trick is ==a map \`old → new\`==: it doubles as the visited set, and when an edge leads back to a node already copied, you ==link to the existing copy== instead of looping forever.`,
    algorithm: `1. Create \`old_to_new = {}\`.
2. Define \`dfs(node)\`:
   * If ==\`node\` is in \`old_to_new\`==, return its copy.
   * Create \`copy = Node(node.val)\` and store it in the map ==before== visiting neighbours.
   * For each neighbour, append \`dfs(neighbour)\` to \`copy.neighbors\`.
   * Return \`copy\`.
3. Return \`dfs(node)\` (or \`None\` for an empty graph).`,
    visual: {
      kind: "graph",
      title: "Clone graph · 1-2, 1-3, 2-3, 3-4",
      nodes: [
        { id: "1", label: "1" },
        { id: "2", label: "2" },
        { id: "3", label: "3" },
        { id: "4", label: "4" },
      ],
      edges: [
        { from: "1", to: "2" },
        { from: "1", to: "3" },
        { from: "2", to: "3" },
        { from: "3", to: "4" },
      ],
      frames: [
        { caption: "dfs(1): not in the map → create 1′ and store it.", pointers: [{ name: "cur", node: "1" }], highlight: ["1"], vars: kv({ map: "{1→1′}" }) },
        { caption: "1's first neighbour 2: new → create 2′.", pointers: [{ name: "cur", node: "2" }], highlight: ["2"], done: ["1"], vars: kv({ map: "{1, 2}" }) },
        { caption: "2's neighbour 1 is already in the map → link 2′ to 1′. No loop.", pointers: [{ name: "cur", node: "2" }], highlight: ["1", "2"], done: ["1"], vars: kv({ map: "{1, 2}", "2′.neighbors": "[1′]" }) },
        { caption: "2's neighbour 3: new → create 3′.", pointers: [{ name: "cur", node: "3" }], highlight: ["3"], done: ["1", "2"], vars: kv({ map: "{1, 2, 3}" }) },
        { caption: "3 links to 1′ and 2′ (in the map), then 4 is new → create 4′, which links back to 3′.", pointers: [{ name: "cur", node: "4" }], highlight: ["4"], done: ["1", "2", "3"], vars: kv({ map: "{1, 2, 3, 4}" }) },
        { caption: "Unwind: 1's neighbour 3 is in the map → link. Return 1′.", pointers: [{ name: "cur", node: "1" }], done: ["1", "2", "3", "4"], vars: kv({ map: "{1, 2, 3, 4}", answer: "1′" }) },
      ],
    },
    code: `def cloneGraph(node: "Node | None") -> "Node | None":
    old_to_new = {}

    def dfs(n):
        if n in old_to_new:
            return old_to_new[n]
        copy = Node(n.val)
        old_to_new[n] = copy
        for nb in n.neighbors:
            copy.neighbors.append(dfs(nb))
        return copy

    return dfs(node) if node else None`,
    complexity: "Time O(V + E) · Space O(V)",
  },
  {
    lc: 286,
    variation: "bfs-layers",
    question: "In a grid of walls (-1), gates (0) and empty rooms (INF), fill each room in place with its distance to the nearest gate.",
    intuition: `Running a BFS from each room is slow. Flip it: ==put every gate in the queue at once== and BFS outward. The first time the wave reaches a room is from ==its nearest gate==, so write \`distance + 1\` and never touch it again.`,
    algorithm: `1. Put every gate \`(r, c)\` with value 0 into a queue \`q\`.
2. While \`q\` is not empty:
   * Pop \`(r, c)\`.
   * For each neighbour \`(nr, nc)\` inside the grid:
      * If ==it's still \`INF\`== (an unvisited room), set \`rooms[nr][nc] = rooms[r][c] + 1\` and append it.
3. Walls and filled rooms are never \`INF\`, so they're skipped.`,
    visual: {
      kind: "grid",
      title: "Walls and gates · 3×4 (∞ = empty room)",
      rows: [
        ["∞", -1, 0, "∞"],
        ["∞", "∞", "∞", "∞"],
        [0, -1, "∞", -1],
      ],
      frames: [
        { caption: "Both gates go in the queue first: (0,2) and (2,0).", highlight: ["0,2", "2,0"], vars: kv({ queue: "(0,2) (2,0)" }) },
        { caption: "Layer 1: rooms next to a gate get 1.", highlight: ["0,3", "1,2", "1,0"], cells: [{ at: "0,3", value: 1 }, { at: "1,2", value: 1 }, { at: "1,0", value: 1 }], done: ["0,2", "2,0"], vars: kv({ queue: "(0,3) (1,2) (1,0)" }) },
        { caption: "Layer 2: their unfilled neighbours get 2.", highlight: ["1,3", "1,1", "2,2", "0,0"], cells: [{ at: "1,3", value: 2 }, { at: "1,1", value: 2 }, { at: "2,2", value: 2 }, { at: "0,0", value: 2 }], done: ["0,2", "2,0", "0,3", "1,2", "1,0"], vars: kv({ queue: "(1,3) (1,1) (2,2) (0,0)" }) },
        { caption: "Layer 3 finds only walls or filled rooms → queue empties. Done.", done: ["0,2", "2,0", "0,3", "1,2", "1,0", "1,3", "1,1", "2,2", "0,0"], vars: kv({ queue: "empty" }) },
      ],
    },
    code: `from collections import deque

def wallsAndGates(rooms: list[list[int]]) -> None:
    if not rooms:
        return
    INF = 2147483647
    rows, cols = len(rooms), len(rooms[0])
    q = deque((r, c) for r in range(rows) for c in range(cols) if rooms[r][c] == 0)
    while q:
        r, c = q.popleft()
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and rooms[nr][nc] == INF:
                rooms[nr][nc] = rooms[r][c] + 1
                q.append((nr, nc))`,
    complexity: "Time O(rows · cols) · Space O(rows · cols)",
  },
  {
    lc: 994,
    variation: "bfs-layers",
    question: "Each minute, rotten oranges (2) spoil fresh neighbours (1). Return the minutes until none are fresh, or -1 if some never rot.",
    intuition: `Rot spreads from ==all rotten oranges at the same time==, so start a BFS with every one of them in the queue. ==Each BFS layer is one minute==. Count fresh oranges up front; if any are left when the queue empties, return -1.`,
    algorithm: `1. Count \`fresh\`, and put every rotten cell in \`q\`.
2. Set \`minutes = 0\`.
3. While \`q\` and \`fresh > 0\`:
   * ==Process exactly \`len(q)\` cells== (one minute's layer):
      * For each fresh neighbour: set it to 2, subtract 1 from \`fresh\`, append it.
   * Add 1 to \`minutes\`.
4. Return \`minutes\` if \`fresh == 0\`, else -1.`,
    visual: {
      kind: "grid",
      title: "Rotting oranges · 3×4, two rotten to start",
      rows: [
        [2, 1, 0, 1],
        [1, 1, 0, 1],
        [0, 1, 1, 2],
      ],
      frames: [
        { caption: "Both rotten oranges start in the queue. 7 fresh.", highlight: ["0,0", "2,3"], vars: kv({ fresh: "7", minutes: "0" }) },
        { caption: "Minute 1: their fresh neighbours rot.", highlight: ["0,1", "1,0", "1,3", "2,2"], cells: [{ at: "0,1", value: 2 }, { at: "1,0", value: 2 }, { at: "1,3", value: 2 }, { at: "2,2", value: 2 }], done: ["0,0", "2,3"], vars: kv({ fresh: "3", minutes: "1" }) },
        { caption: "Minute 2: the next layer rots. fresh = 0.", highlight: ["1,1", "0,3", "2,1"], cells: [{ at: "1,1", value: 2 }, { at: "0,3", value: 2 }, { at: "2,1", value: 2 }], done: ["0,0", "2,3", "0,1", "1,0", "1,3", "2,2"], vars: kv({ fresh: "0", minutes: "2" }) },
        { caption: "No fresh left → answer 2.", done: ["0,0", "2,3", "0,1", "1,0", "1,3", "2,2", "1,1", "0,3", "2,1"], vars: kv({ answer: "2" }) },
      ],
    },
    code: `from collections import deque

def orangesRotting(grid: list[list[int]]) -> int:
    rows, cols = len(grid), len(grid[0])
    q = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 1:
                fresh += 1
            elif grid[r][c] == 2:
                q.append((r, c))
    minutes = 0
    while q and fresh > 0:
        for _ in range(len(q)):
            r, c = q.popleft()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    q.append((nr, nc))
        minutes += 1
    return minutes if fresh == 0 else -1`,
    complexity: "Time O(rows · cols) · Space O(rows · cols)",
  },
  {
    lc: 417,
    variation: "border-in",
    question: "Water flows to neighbours of equal or lower height. Return the cells whose water can reach both the top/left ocean and the bottom/right ocean.",
    intuition: `Checking every cell's downhill paths repeats work. Reverse it: ==start from each ocean's border and climb uphill== (to neighbours of equal or greater height). That marks every cell that can drain into that ocean. ==The answer is the cells in both sets==.`,
    algorithm: `1. Create sets \`pac\` and \`atl\`.
2. Define \`dfs(r, c, visit, prev)\`:
   * Return if \`(r, c)\` is in \`visit\`, off the grid, or ==\`heights[r][c] < prev\`== (can't climb).
   * Add \`(r, c)\` to \`visit\` and call \`dfs\` on the 4 neighbours with \`prev = heights[r][c]\`.
3. DFS into \`pac\` from the top row and left column, and into \`atl\` from the bottom row and right column.
4. Return every \`[r, c]\` in ==both \`pac\` and \`atl\`==.`,
    visual: {
      kind: "grid",
      title: "Pacific Atlantic · 3×3 heights",
      rows: [
        [1, 2, 3],
        [8, 9, 4],
        [7, 6, 5],
      ],
      frames: [
        { caption: "Pacific touches the top row and left column: start DFS there.", highlight: ["0,0", "0,1", "0,2", "1,0", "2,0"], vars: kv({ ocean: "Pacific" }) },
        { caption: "Climbing 3 → 4 → 5 → 6 → 9 reaches every cell: all can drain to the Pacific.", done: ["0,0", "0,1", "0,2", "1,0", "1,1", "1,2", "2,0", "2,1", "2,2"], vars: kv({ pac: "all 9 cells" }) },
        { caption: "Atlantic touches the bottom row and right column: start there.", highlight: ["2,0", "2,1", "2,2", "0,2", "1,2"], vars: kv({ ocean: "Atlantic" }) },
        { caption: "Climb up: 7 → 8 → 9 and 4 → 9. 1 and 2 are lower than every neighbour path → not reached.", highlight: ["0,2", "1,0", "1,1", "1,2", "2,0", "2,1", "2,2"], vars: kv({ atl: "7 cells, not (0,0), (0,1)" }) },
        { caption: "Answer: cells in both sets.", done: ["0,2", "1,0", "1,1", "1,2", "2,0", "2,1", "2,2"], vars: kv({ answer: "7 cells" }) },
      ],
    },
    code: `def pacificAtlantic(heights: list[list[int]]) -> list[list[int]]:
    rows, cols = len(heights), len(heights[0])
    pac, atl = set(), set()

    def dfs(r, c, visit, prev):
        if (r, c) in visit or r < 0 or c < 0 or r == rows or c == cols or heights[r][c] < prev:
            return
        visit.add((r, c))
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            dfs(r + dr, c + dc, visit, heights[r][c])

    for c in range(cols):
        dfs(0, c, pac, heights[0][c])
        dfs(rows - 1, c, atl, heights[rows - 1][c])
    for r in range(rows):
        dfs(r, 0, pac, heights[r][0])
        dfs(r, cols - 1, atl, heights[r][cols - 1])
    return [[r, c] for r in range(rows) for c in range(cols) if (r, c) in pac and (r, c) in atl]`,
    complexity: "Time O(rows · cols) · Space O(rows · cols)",
  },
  {
    lc: 130,
    variation: "border-in",
    question: "In a board of 'X' and 'O', flip to 'X' (in place) every 'O' region that isn't connected to the edge of the board.",
    intuition: `An \`O\` region survives exactly when ==it touches the border==. So DFS from every border \`O\` and ==tag what it reaches as safe== (\`T\`). Then one pass: remaining \`O\` cells are surrounded → \`X\`; \`T\` cells go back to \`O\`.`,
    algorithm: `1. Define \`capture(r, c)\`: if in bounds and \`"O"\`, set it to \`"T"\` and recurse on the 4 neighbours.
2. For every ==border cell== that is \`"O"\`, call \`capture\`.
3. For every cell:
   * \`"O"\` → \`"X"\` (surrounded).
   * \`"T"\` → \`"O"\` (safe).`,
    visual: {
      kind: "grid",
      title: "Surrounded regions · 4×5",
      rows: [
        ["X", "X", "X", "X", "X"],
        ["X", "O", "O", "X", "X"],
        ["X", "X", "X", "O", "X"],
        ["X", "X", "X", "O", "X"],
      ],
      frames: [
        { caption: "Scan the border: (3,3) is an O on the bottom edge → safe, mark T.", highlight: ["3,3"], cells: [{ at: "3,3", value: "T" }], done: ["3,3"] },
        { caption: "DFS from it reaches (2,3) → also safe, T.", highlight: ["2,3"], cells: [{ at: "2,3", value: "T" }], done: ["3,3", "2,3"] },
        { caption: "Second pass: (1,1) and (1,2) are still O → no path to the edge → flip to X.", highlight: ["1,1", "1,2"], cells: [{ at: "1,1", value: "X" }, { at: "1,2", value: "X" }], done: ["3,3", "2,3"] },
        { caption: "T cells go back to O. Done.", cells: [{ at: "3,3", value: "O" }, { at: "2,3", value: "O" }], done: ["3,3", "2,3", "1,1", "1,2"] },
      ],
    },
    code: `def solve(board: list[list[str]]) -> None:
    rows, cols = len(board), len(board[0])

    def capture(r, c):
        if r < 0 or c < 0 or r == rows or c == cols or board[r][c] != "O":
            return
        board[r][c] = "T"
        capture(r + 1, c)
        capture(r - 1, c)
        capture(r, c + 1)
        capture(r, c - 1)

    for r in range(rows):
        for c in range(cols):
            if (r in (0, rows - 1) or c in (0, cols - 1)) and board[r][c] == "O":
                capture(r, c)
    for r in range(rows):
        for c in range(cols):
            if board[r][c] == "O":
                board[r][c] = "X"
            elif board[r][c] == "T":
                board[r][c] = "O"`,
    complexity: "Time O(rows · cols) · Space O(rows · cols) for the recursion",
  },
  {
    lc: 207,
    variation: "topo-sort",
    question: "There are n courses and pairs [a, b] meaning b must be taken before a. Can you finish every course?",
    intuition: `Draw an edge \`b → a\`. You can finish everything ==unless the prerequisites form a cycle==. Kahn's algorithm: repeatedly take a course with ==no remaining prerequisites (in-degree 0)== and remove its edges. If you can't take all n, the leftovers are stuck in a cycle.`,
    algorithm: `1. Build \`adj[b].append(a)\` and \`indeg[a] += 1\` for each \`[a, b]\`.
2. Put every course with \`indeg == 0\` in a queue \`q\`.
3. While \`q\` is not empty:
   * Pop \`c\`, add 1 to \`taken\`.
   * For each \`nxt\` in \`adj[c]\`, subtract 1 from \`indeg[nxt]\`; ==if it hits 0, append it==.
4. Return ==\`taken == numCourses\`==.`,
    visual: {
      kind: "graph",
      title: "Course schedule · 0→1→2→3→1 (cycle)",
      nodes: [
        { id: "0", label: "0" },
        { id: "1", label: "1" },
        { id: "2", label: "2" },
        { id: "3", label: "3" },
      ],
      edges: [
        { from: "0", to: "1" },
        { from: "1", to: "2" },
        { from: "2", to: "3" },
        { from: "3", to: "1" },
      ],
      directed: true,
      frames: [
        { caption: "In-degrees: only course 0 has no prerequisites → queue [0].", highlight: ["0"], vars: kv({ indeg: "0:0 1:2 2:1 3:1", queue: "[0]" }) },
        { caption: "Take 0. Course 1 loses one prerequisite: 2 → 1. Not 0 yet.", pointers: [{ name: "take", node: "0" }], done: ["0"], vars: kv({ indeg: "1:1 2:1 3:1", queue: "[]", taken: "1" }) },
        { caption: "Queue is empty but only 1 of 4 taken: 1 → 2 → 3 → 1 is a cycle. False.", highlight: ["1", "2", "3"], done: ["0"], vars: kv({ taken: "1 / 4", answer: "False" }) },
      ],
    },
    code: `from collections import deque

def canFinish(numCourses: int, prerequisites: list[list[int]]) -> bool:
    adj = [[] for _ in range(numCourses)]
    indeg = [0] * numCourses
    for a, b in prerequisites:
        adj[b].append(a)
        indeg[a] += 1
    q = deque(i for i in range(numCourses) if indeg[i] == 0)
    taken = 0
    while q:
        c = q.popleft()
        taken += 1
        for nxt in adj[c]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return taken == numCourses`,
    complexity: "Time O(V + E) · Space O(V + E)",
  },
  {
    lc: 210,
    variation: "topo-sort",
    question: "Same courses and prerequisite pairs: return one valid order to take all of them, or an empty list if that's impossible.",
    intuition: `Exactly Course Schedule, but ==record the order you pop courses from the queue==. A course only enters the queue once all its prerequisites are taken, so that order is valid. ==If the order is shorter than n, there's a cycle== → return \`[]\`.`,
    algorithm: `1. Build \`adj\` and \`indeg\` as in Course Schedule.
2. Queue every course with \`indeg == 0\`.
3. While \`q\` is not empty:
   * Pop \`c\` and ==append it to \`order\`==.
   * Decrement each neighbour's in-degree; append it when it hits 0.
4. Return \`order\` if ==\`len(order) == numCourses\`==, else \`[]\`.`,
    visual: {
      kind: "graph",
      title: "Course schedule II · 4 courses",
      nodes: [
        { id: "0", label: "0" },
        { id: "1", label: "1" },
        { id: "2", label: "2" },
        { id: "3", label: "3" },
      ],
      edges: [
        { from: "0", to: "1" },
        { from: "0", to: "2" },
        { from: "2", to: "1" },
        { from: "1", to: "3" },
      ],
      directed: true,
      frames: [
        { caption: "In-degrees: 0 has none → queue [0].", highlight: ["0"], vars: kv({ indeg: "0:0 1:2 2:1 3:1", queue: "[0]", order: "[]" }) },
        { caption: "Take 0. 1 drops to 1, 2 drops to 0 → queue [2].", pointers: [{ name: "take", node: "0" }], highlight: ["2"], done: ["0"], vars: kv({ indeg: "1:1 2:0 3:1", queue: "[2]", order: "[0]" }) },
        { caption: "Take 2. 1 drops to 0 → queue [1]. (1 needed both 0 and 2.)", pointers: [{ name: "take", node: "2" }], highlight: ["1"], done: ["0", "2"], vars: kv({ indeg: "1:0 3:1", queue: "[1]", order: "[0, 2]" }) },
        { caption: "Take 1. 3 drops to 0 → queue [3].", pointers: [{ name: "take", node: "1" }], highlight: ["3"], done: ["0", "2", "1"], vars: kv({ queue: "[3]", order: "[0, 2, 1]" }) },
        { caption: "Take 3. All 4 placed → return the order.", pointers: [{ name: "take", node: "3" }], done: ["0", "2", "1", "3"], vars: kv({ answer: "[0, 2, 1, 3]" }) },
      ],
    },
    code: `from collections import deque

def findOrder(numCourses: int, prerequisites: list[list[int]]) -> list[int]:
    adj = [[] for _ in range(numCourses)]
    indeg = [0] * numCourses
    for a, b in prerequisites:
        adj[b].append(a)
        indeg[a] += 1
    q = deque(i for i in range(numCourses) if indeg[i] == 0)
    order = []
    while q:
        c = q.popleft()
        order.append(c)
        for nxt in adj[c]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return order if len(order) == numCourses else []`,
    complexity: "Time O(V + E) · Space O(V + E)",
  },
  {
    lc: 261,
    variation: "union-find",
    question: "Given n labelled nodes and a list of undirected edges, decide whether the edges form a single tree.",
    intuition: `A tree on n nodes has ==exactly n − 1 edges and no cycle== (those two together also force it to be connected). Check the count first, then union-find each edge: ==if both ends already share a root, the edge closes a cycle==.`,
    algorithm: `1. If \`len(edges) != n - 1\`, return \`False\`.
2. Set \`parent = list(range(n))\`, \`size = [1] * n\`.
3. \`find(x)\`: follow \`parent\` to the root, halving the path as you go.
4. For each edge \`(a, b)\`:
   * \`ra, rb = find(a), find(b)\`.
   * If ==\`ra == rb\`==, return \`False\` (cycle).
   * Attach the smaller tree under the larger one.
5. Return \`True\`.`,
    visual: {
      kind: "graph",
      title: "Graph valid tree · n = 5",
      nodes: [
        { id: "0", label: "0" },
        { id: "1", label: "1" },
        { id: "2", label: "2" },
        { id: "3", label: "3" },
        { id: "4", label: "4" },
      ],
      edges: [
        { from: "0", to: "1" },
        { from: "1", to: "2" },
        { from: "2", to: "0" },
        { from: "3", to: "4" },
      ],
      frames: [
        { caption: "4 edges = n − 1 → count check passes. Still need the cycle check.", vars: kv({ edges: "4", "n - 1": "4" }) },
        { caption: "Edge 0-1: different roots → union. 1 now points to 0.", highlight: ["0", "1"], vars: kv({ parent: "1→0" }) },
        { caption: "Edge 1-2: find(1) = 0, find(2) = 2 → union, 2 → 0.", highlight: ["1", "2"], done: ["0", "1"], vars: kv({ parent: "1→0 2→0" }) },
        { caption: "Edge 2-0: find(2) = find(0) = 0 → same root, so this edge makes a cycle. False.", pointers: [{ name: "a", node: "2" }, { name: "b", node: "0" }], highlight: ["0", "1", "2"], vars: kv({ parent: "1→0 2→0", answer: "False" }) },
      ],
    },
    code: `def validTree(n: int, edges: list[list[int]]) -> bool:
    if len(edges) != n - 1:
        return False
    parent = list(range(n))
    size = [1] * n

    def find(x):
        while x != parent[x]:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            return False
        if size[ra] < size[rb]:
            ra, rb = rb, ra
        parent[rb] = ra
        size[ra] += size[rb]
    return True`,
    complexity: "Time O(E · α(n)) ≈ O(n) · Space O(n)",
  },
  {
    lc: 323,
    variation: "union-find",
    question: "Given n nodes and a list of undirected edges, return how many separate connected pieces the graph has.",
    intuition: `Start with ==n components, one per node==. Each edge that ==joins two different roots merges two components==, so subtract 1. Edges inside a component (same root) change nothing.`,
    algorithm: `1. Set \`parent = list(range(n))\`, \`size = [1] * n\`, \`components = n\`.
2. For each edge \`(a, b)\`:
   * \`ra, rb = find(a), find(b)\`.
   * If \`ra != rb\`: attach the smaller under the larger and ==subtract 1 from \`components\`==.
3. Return \`components\`.`,
    visual: {
      kind: "graph",
      title: "Connected components · n = 6",
      nodes: [
        { id: "0", label: "0" },
        { id: "1", label: "1" },
        { id: "2", label: "2" },
        { id: "3", label: "3" },
        { id: "4", label: "4" },
        { id: "5", label: "5" },
      ],
      edges: [
        { from: "0", to: "1" },
        { from: "1", to: "2" },
        { from: "3", to: "4" },
      ],
      frames: [
        { caption: "Every node is its own component.", vars: kv({ components: "6" }) },
        { caption: "Edge 0-1: different roots → merge.", highlight: ["0", "1"], vars: kv({ parent: "1→0", components: "5" }) },
        { caption: "Edge 1-2: find(1) = 0 ≠ 2 → merge.", highlight: ["0", "1", "2"], vars: kv({ parent: "1→0 2→0", components: "4" }) },
        { caption: "Edge 3-4: merge. Node 5 has no edges, so it stays alone.", highlight: ["3", "4"], done: ["0", "1", "2"], vars: kv({ parent: "1→0 2→0 4→3", components: "3" }) },
        { caption: "Pieces: {0,1,2}, {3,4}, {5} → 3.", done: ["0", "1", "2", "3", "4", "5"], vars: kv({ answer: "3" }) },
      ],
    },
    code: `def countComponents(n: int, edges: list[list[int]]) -> int:
    parent = list(range(n))
    size = [1] * n

    def find(x):
        while x != parent[x]:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    components = n
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            continue
        if size[ra] < size[rb]:
            ra, rb = rb, ra
        parent[rb] = ra
        size[ra] += size[rb]
        components -= 1
    return components`,
    complexity: "Time O(E · α(n)) ≈ O(n + E) · Space O(n)",
  },
  {
    lc: 684,
    variation: "union-find",
    question: "A tree on nodes 1..n got one extra edge, making a cycle. Return the edge to remove (the last such one in the input).",
    intuition: `Add edges one at a time with union-find. ==The first edge whose ends already share a root== is the one that closes the cycle. Every earlier edge was needed to connect those nodes, so ==this edge is the last cycle edge in the input==: return it.`,
    algorithm: `1. Set \`parent = list(range(n + 1))\` (nodes are 1-indexed).
2. For each edge \`[a, b]\` in order:
   * \`ra, rb = find(a), find(b)\`.
   * If ==\`ra == rb\`==, return \`[a, b]\`.
   * Otherwise union them.`,
    visual: {
      kind: "graph",
      title: "Redundant connection · 5 edges on 5 nodes",
      nodes: [
        { id: "1", label: "1" },
        { id: "2", label: "2" },
        { id: "3", label: "3" },
        { id: "4", label: "4" },
        { id: "5", label: "5" },
      ],
      edges: [
        { from: "1", to: "2" },
        { from: "2", to: "3" },
        { from: "1", to: "4" },
        { from: "3", to: "4", label: "extra" },
        { from: "4", to: "5" },
      ],
      frames: [
        { caption: "Edge 1-2: different roots → union.", highlight: ["1", "2"], vars: kv({ parent: "2→1" }) },
        { caption: "Edge 2-3: find(2) = 1, find(3) = 3 → union.", highlight: ["2", "3"], done: ["1", "2"], vars: kv({ parent: "2→1 3→1" }) },
        { caption: "Edge 1-4: union.", highlight: ["1", "4"], done: ["1", "2", "3"], vars: kv({ parent: "2→1 3→1 4→1" }) },
        { caption: "Edge 3-4: find(3) = find(4) = 1 → already connected. This edge closes the cycle → return [3, 4].", pointers: [{ name: "a", node: "3" }, { name: "b", node: "4" }], highlight: ["3", "4"], done: ["1", "2"], vars: kv({ answer: "[3, 4]" }) },
      ],
    },
    code: `def findRedundantConnection(edges: list[list[int]]) -> list[int]:
    parent = list(range(len(edges) + 1))
    size = [1] * (len(edges) + 1)

    def find(x):
        while x != parent[x]:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            return [a, b]
        if size[ra] < size[rb]:
            ra, rb = rb, ra
        parent[rb] = ra
        size[ra] += size[rb]
    return []`,
    complexity: "Time O(n · α(n)) · Space O(n)",
  },
  {
    lc: 127,
    variation: "bfs-layers",
    question: "Change one letter at a time, every step being a word from a given list. Return how many words the shortest chain from start to end word has, or 0.",
    intuition: `Words are nodes and words one letter apart are neighbours, so ==the shortest chain is a BFS==. Don't compare every pair: for each word ==try all 26 letters in each position== and keep the results that are in the word set and unvisited. The layer where you pop \`endWord\` is the answer.`,
    algorithm: `1. Put \`wordList\` in a set. If \`endWord\` isn't in it, return 0.
2. Start \`q = [beginWord]\`, \`visited = {beginWord}\`, \`steps = 1\`.
3. While \`q\` is not empty:
   * For each word \`w\` in the current layer:
      * If ==\`w == endWord\`==, return \`steps\`.
      * For each position \`i\` and letter \`ch\`, build \`w[:i] + ch + w[i+1:]\`.
      * If it's in the set and not visited, mark it and append it.
   * Add 1 to \`steps\`.
4. Return 0 (no chain).`,
    visual: {
      kind: "graph",
      title: "Word ladder · cat → dog",
      nodes: [
        { id: "cat", label: "cat" },
        { id: "cot", label: "cot" },
        { id: "cut", label: "cut" },
        { id: "cog", label: "cog" },
        { id: "dot", label: "dot" },
        { id: "dog", label: "dog" },
      ],
      edges: [
        { from: "cat", to: "cot" },
        { from: "cat", to: "cut" },
        { from: "cot", to: "cut" },
        { from: "cot", to: "cog" },
        { from: "cot", to: "dot" },
        { from: "cog", to: "dog" },
        { from: "dot", to: "dog" },
      ],
      frames: [
        { caption: "Layer 1: just the start word.", pointers: [{ name: "w", node: "cat" }], highlight: ["cat"], vars: kv({ steps: "1", queue: "[cat]" }) },
        { caption: "Layer 2: one-letter changes of cat in the list: cot, cut.", highlight: ["cot", "cut"], done: ["cat"], vars: kv({ steps: "2", queue: "[cot, cut]" }) },
        { caption: "Layer 3: from cot → cog, dot (cut is already visited). cut adds nothing new.", highlight: ["cog", "dot"], done: ["cat", "cot", "cut"], vars: kv({ steps: "3", queue: "[cog, dot]" }) },
        { caption: "Layer 4: cog → dog. dot → dog is already visited.", highlight: ["dog"], done: ["cat", "cot", "cut", "cog", "dot"], vars: kv({ steps: "4", queue: "[dog]" }) },
        { caption: "Pop dog = endWord at layer 4 → chain cat, cot, cog, dog.", pointers: [{ name: "w", node: "dog" }], done: ["cat", "cot", "cog", "dog"], vars: kv({ answer: "4" }) },
      ],
    },
    code: `from collections import deque
from string import ascii_lowercase

def ladderLength(beginWord: str, endWord: str, wordList: list[str]) -> int:
    words = set(wordList)
    if endWord not in words:
        return 0
    q = deque([beginWord])
    visited = {beginWord}
    steps = 1
    while q:
        for _ in range(len(q)):
            w = q.popleft()
            if w == endWord:
                return steps
            for i in range(len(w)):
                for ch in ascii_lowercase:
                    nxt = w[:i] + ch + w[i + 1:]
                    if nxt in words and nxt not in visited:
                        visited.add(nxt)
                        q.append(nxt)
        steps += 1
    return 0`,
    complexity: "Time O(N · L² · 26) for N words of length L · Space O(N · L)",
  },
  {
    lc: 773,
    variation: "bfs-layers",
    question: "On a 2×3 board of tiles 1–5 and an empty 0, swap the 0 with a neighbour each move. Return the fewest moves to reach [[1,2,3],[4,5,0]], or -1.",
    intuition: `There is no real graph: ==each whole board is a node== and each legal swap is an edge. Fewest moves = shortest path, so ==BFS over board states==. Flatten the board to a string like \`"123405"\` so it can sit in \`seen\`, and precompute which flat positions touch each position of the \`0\`. Only 6! = 720 boards exist, so BFS is tiny.`,
    algorithm: `1. \`start\` = the board flattened to a string; \`target = "123450"\`.
2. \`nbrs[i]\` = flat positions next to \`i\`: \`[(1,3), (0,2,4), (1,5), (0,4), (1,3,5), (2,4)]\`.
3. BFS from \`(start, 0)\` with \`seen = {start}\`:
   * Pop \`(s, d)\`; if \`s == target\` return \`d\`.
   * \`z = s.index("0")\`; for each \`j\` in \`nbrs[z]\`, swap \`z\` and \`j\` to get \`t\`.
   * If \`t\` is new: add to \`seen\`, push \`(t, d + 1)\`.
4. Queue empty → return -1 (unsolvable).`,
    visual: {
      kind: "grid",
      title: "Sliding puzzle · [[1,2,3],[0,4,5]]",
      rows: [
        [1, 2, 3],
        [0, 4, 5],
      ],
      frames: [
        { caption: "Start state \"123045\". The 0 is at (1,0); it can swap with (0,0) or (1,1).", highlight: ["1,0"], vars: kv({ state: "123045", moves: "0" }) },
        { caption: "Layer 1: swapping with the 4 gives \"123405\" (the other swap gives \"023145\", also queued).", highlight: ["1,1"], cells: [{ at: "1,0", value: 4 }, { at: "1,1", value: 0 }], vars: kv({ state: "123405", moves: "1" }) },
        { caption: "Layer 2: swapping the 0 with the 5 gives \"123450\" = target.", highlight: ["1,2"], cells: [{ at: "1,0", value: 4 }, { at: "1,1", value: 5 }, { at: "1,2", value: 0 }], vars: kv({ state: "123450", moves: "2" }) },
        { caption: "First time BFS reaches the target is the fewest moves → 2.", done: ["0,0", "0,1", "0,2", "1,0", "1,1"], cells: [{ at: "1,0", value: 4 }, { at: "1,1", value: 5 }, { at: "1,2", value: 0 }], vars: kv({ answer: "2" }) },
      ],
    },
    code: `from collections import deque

def slidingPuzzle(board: list[list[int]]) -> int:
    start = "".join(str(x) for row in board for x in row)
    nbrs = [(1, 3), (0, 2, 4), (1, 5), (0, 4), (1, 3, 5), (2, 4)]
    q, seen = deque([(start, 0)]), {start}
    while q:
        s, d = q.popleft()
        if s == "123450":
            return d
        z = s.index("0")
        for j in nbrs[z]:
            t = list(s)
            t[z], t[j] = t[j], t[z]
            t = "".join(t)
            if t not in seen:
                seen.add(t)
                q.append((t, d + 1))
    return -1`,
    complexity: "Time O((mn)! · mn) · Space O((mn)!), with mn = 6 here",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */