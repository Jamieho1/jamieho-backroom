/**
 * Arena problems: graphs. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
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
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 200,
    kind: "algorithm",
    statement: `You are given a 2D map \`grid\` made of the characters \`"1"\` (land) and \`"0"\` (water). Return **how many islands** the map contains.

- An island is a group of land cells joined to each other **horizontally or vertically** (up, down, left, right). Diagonal contact does not join two cells.
- Everything outside the grid counts as water, so the map's edges never connect anything.
- Each land cell belongs to exactly one island; return the number of distinct islands.`,
    examples: [
      { input: "grid = [[\"1\",\"1\",\"0\",\"0\",\"1\"],[\"1\",\"0\",\"0\",\"1\",\"1\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"1\",\"0\",\"0\",\"0\",\"1\"]]", output: "5", explanation: "The islands are {(0,0),(0,1),(1,0)}, {(0,4),(1,3),(1,4)}, {(2,2)}, {(3,0)} and {(3,4)}." },
      { input: "grid = [[\"0\",\"1\"],[\"1\",\"0\"]]", output: "2", explanation: "The two land cells only touch diagonally, so they are separate islands." },
    ],
    constraints: ["1 <= grid.length, grid[i].length <= 300", "grid[i][j] is \"0\" or \"1\""],
    signature: `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:`,
    method: "numIslands",
    tests: [
      { id: "ex1", input: "[[[\"1\",\"1\",\"0\",\"0\",\"1\"],[\"1\",\"0\",\"0\",\"1\",\"1\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"1\",\"0\",\"0\",\"0\",\"1\"]]]", expected: "5", visible: true },
      { id: "ex2", input: "[[[\"0\",\"1\"],[\"1\",\"0\"]]]", expected: "2", visible: true },
      { id: "single_water", input: "[[[\"0\"]]]", expected: "0", visible: false },
      { id: "single_land", input: "[[[\"1\"]]]", expected: "1", visible: false },
      { id: "all_land", input: "[[[\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\"]]]", expected: "1", visible: false },
      { id: "all_water", input: "[[[\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\"]]]", expected: "0", visible: false },
      { id: "spiral", input: "[[[\"1\",\"1\",\"1\",\"1\"],[\"0\",\"0\",\"0\",\"1\"],[\"1\",\"1\",\"0\",\"1\"],[\"1\",\"0\",\"0\",\"1\"],[\"1\",\"1\",\"1\",\"1\"]]]", expected: "1", visible: false },
      { id: "column", input: "[[[\"1\"],[\"0\"],[\"1\"],[\"1\"],[\"0\"],[\"1\"]]]", expected: "3", visible: false },
      { id: "large_blocks", input: "[[[('1' if (r // 2 + c // 2) % 2 == 0 else '0') for c in range(80)] for r in range(80)]]", expected: "800", visible: false },
      { id: "large_snake", input: "[[[('1' if r % 2 == 0 or (r % 4 == 1 and c == 99) or (r % 4 == 3 and c == 0) else '0') for c in range(100)] for r in range(99)]]", expected: "1", visible: false },
    ],
    solution: `class Solution:
    def numIslands(self, grid: List[List[str]]) -> int:
        rows, cols = len(grid), len(grid[0])
        count = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] != "1":
                    continue
                count += 1
                grid[r][c] = "0"
                stack = [(r, c)]
                while stack:
                    i, j = stack.pop()
                    for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                        if 0 <= ni < rows and 0 <= nj < cols and grid[ni][nj] == "1":
                            grid[ni][nj] = "0"
                            stack.append((ni, nj))
        return count`,
    hints: ["Think of each land cell as a node with up to 4 neighbours. An island is one connected component.", "Scan the grid; every time you meet land you have not visited yet, you have found a new island.", "Flood-fill (DFS or BFS) from that cell and mark the whole island as visited, e.g. by turning it into water, so it is never counted again."],
    clarify: [
      { question: "Do diagonal neighbours count as connected?", answer: "No. Only the four orthogonal directions join land cells." },
      { question: "Am I allowed to modify the grid?", answer: "Yes, you may overwrite cells (for example to mark them visited); only the returned count is checked." },
    ],
  },
  {
    lc: 695,
    kind: "algorithm",
    statement: `You get a binary matrix \`grid\` where \`1\` means land and \`0\` means water. Land cells that touch **horizontally or vertically** belong to the same island; diagonal touching does not count. The area of an island is the number of land cells in it.

Return the **largest island area** in the grid. If the grid has no land at all, return \`0\`.`,
    examples: [
      { input: "grid = [[0,1,1,0],[1,1,0,0],[0,0,0,1],[1,0,1,1]]", output: "4", explanation: "The island {(0,1),(0,2),(1,0),(1,1)} has 4 cells; the others have 3 and 1." },
      { input: "grid = [[0,0],[0,0]]", output: "0", explanation: "There is no land." },
    ],
    constraints: ["1 <= grid.length, grid[i].length <= 50", "grid[i][j] is 0 or 1"],
    signature: `class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:`,
    method: "maxAreaOfIsland",
    tests: [
      { id: "ex1", input: "[[[0,1,1,0],[1,1,0,0],[0,0,0,1],[1,0,1,1]]]", expected: "4", visible: true },
      { id: "ex2", input: "[[[0,0],[0,0]]]", expected: "0", visible: true },
      { id: "one_cell", input: "[[[1]]]", expected: "1", visible: false },
      { id: "one_water", input: "[[[0]]]", expected: "0", visible: false },
      { id: "diagonal_only", input: "[[[1,0,1],[0,1,0],[1,0,1]]]", expected: "1", visible: false },
      { id: "full", input: "[[[1,1,1,1],[1,1,1,1],[1,1,1,1]]]", expected: "12", visible: false },
      { id: "ring", input: "[[[1,1,1,1],[1,0,0,1],[1,0,1,1],[1,1,1,0]]]", expected: "12", visible: false },
      { id: "two_close", input: "[[[1,1,0,1,1,1],[1,0,0,1,0,1],[0,0,1,0,0,0]]]", expected: "5", visible: false },
      { id: "large_blocks", input: "[[[1 if (r % 5 != 4 and c % 7 != 6) else 0 for c in range(50)] for r in range(50)]]", expected: "24", visible: false },
      { id: "large_full", input: "[[[1] * 50 for _ in range(50)]]", expected: "2500", visible: false },
    ],
    solution: `class Solution:
    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        best = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] != 1:
                    continue
                grid[r][c] = 0
                stack = [(r, c)]
                area = 0
                while stack:
                    i, j = stack.pop()
                    area += 1
                    for ni, nj in ((i + 1, j), (i - 1, j), (i, j + 1), (i, j - 1)):
                        if 0 <= ni < rows and 0 <= nj < cols and grid[ni][nj] == 1:
                            grid[ni][nj] = 0
                            stack.append((ni, nj))
                best = max(best, area)
        return best`,
    hints: ["This is the island-counting flood fill, but now you also need the size of each island.", "Make the flood fill return (or accumulate) how many cells it visited, marking each cell as visited the moment you take it so it is counted once.", "Keep a running maximum over all islands; it starts at 0 for a grid with no land."],
    clarify: [
      { question: "What should I return when there is no land?", answer: "Return 0." },
      { question: "Do cells touching only at a corner form one island?", answer: "No, only up/down/left/right neighbours are connected." },
    ],
  },
  {
    lc: 133,
    kind: "algorithm",
    statement: `You are handed a reference to one node of a **connected, undirected graph**. Build and return a **deep copy** of the whole graph.

Each node is an instance of:

\`\`\`python
class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val                  # int
        self.neighbors = neighbors or [] # list[Node]
\`\`\`

- The copy must consist entirely of **new** \`Node\` objects: no node of the original graph may appear anywhere in your copy.
- Every copied node keeps the same \`val\`, and its \`neighbors\` list must point to the copies of the original neighbours, **in the same order**.
- Node values are unique and run from \`1\` to \`n\`; the node you receive is always the one with \`val == 1\`. If the graph is empty you receive \`None\` and should return \`None\`.

**Test format.** Tests describe the graph as an adjacency list: entry \`i\` (0-based) lists the values of the neighbours of the node with value \`i + 1\`. The checker builds the graph, calls \`cloneGraph\` on node 1, then walks your copy and turns it back into an adjacency list. It reports \`"SHARED"\` if your copy reuses any original node.`,
    examples: [
      { input: "adjList = [[2,3],[1,3],[1,2]]", output: "[[2,3],[1,3],[1,2]]", explanation: "Three nodes in a triangle. The copy has the same shape but brand-new nodes." },
      { input: "adjList = [[]]", output: "[[]]", explanation: "A single node with no neighbours." },
      { input: "adjList = []", output: "[]", explanation: "Empty graph: the input is None, so return None." },
    ],
    constraints: ["0 <= number of nodes <= 100", "1 <= Node.val <= 100, all values distinct", "No self-loops or repeated edges; the graph is connected"],
    signature: `"""
# Definition for a Node.
class Node:
    def __init__(self, val = 0, neighbors = None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []
"""

from typing import Optional
class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:`,
    method: "cloneGraph",
    prelude: `class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []`,
    driver: `def run(ns, args):
    adj = args[0]
    Node = ns["Node"]
    if not adj:
        out = ns["Solution"]().cloneGraph(None)
        return [] if out is None else "expected None for an empty graph"
    nodes = [Node(i + 1) for i in range(len(adj))]
    for i, nbrs in enumerate(adj):
        nodes[i].neighbors = [nodes[j - 1] for j in nbrs]
    originals = set(id(x) for x in nodes)
    clone = ns["Solution"]().cloneGraph(nodes[0])
    if clone is None:
        return None
    by_val = {}
    stack = [clone]
    seen = set()
    while stack:
        x = stack.pop()
        if id(x) in seen:
            continue
        seen.add(id(x))
        if id(x) in originals:
            return "SHARED"
        if x.val in by_val and by_val[x.val] is not x:
            return "DUPLICATE"
        by_val[x.val] = x
        stack.extend(x.neighbors)
    return [[y.val for y in by_val[v].neighbors] if v in by_val else None for v in range(1, len(adj) + 1)]`,
    tests: [
      { id: "ex1", input: "[[[2,3],[1,3],[1,2]]]", expected: "[[2, 3], [1, 3], [1, 2]]", visible: true },
      { id: "ex2", input: "[[[]]]", expected: "[[]]", visible: true },
      { id: "ex3", input: "[[]]", expected: "[]", visible: true },
      { id: "path", input: "[[[2],[1,3],[2,4],[3]]]", expected: "[[2], [1, 3], [2, 4], [3]]", visible: false },
      { id: "square", input: "[[[2,4],[1,3],[2,4],[3,1]]]", expected: "[[2, 4], [1, 3], [2, 4], [3, 1]]", visible: false },
      { id: "star", input: "[[[2,3,4,5],[1],[1],[1],[1]]]", expected: "[[2, 3, 4, 5], [1], [1], [1], [1]]", visible: false },
      { id: "complete5", input: "[[[j for j in range(1, 6) if j != i] for i in range(1, 6)]]", expected: "[[j for j in range(1, 6) if j != i] for i in range(1, 6)]", visible: false },
      { id: "two_nodes", input: "[[[2],[1]]]", expected: "[[2], [1]]", visible: false },
      { id: "ring100", input: "[[[(i - 2) % 100 + 1, i % 100 + 1] for i in range(1, 101)]]", expected: "[[(i - 2) % 100 + 1, i % 100 + 1] for i in range(1, 101)]", visible: false },
    ],
    solution: `class Solution:
    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:
        if node is None:
            return None
        copies = {node: Node(node.val)}
        stack = [node]
        while stack:
            cur = stack.pop()
            for nb in cur.neighbors:
                if nb not in copies:
                    copies[nb] = Node(nb.val)
                    stack.append(nb)
                copies[cur].neighbors.append(copies[nb])
        return copies[node]`,
    hints: ["Traverse the original graph (DFS or BFS). The problem is cycles: you will reach the same node more than once.", "Keep a map from each original node to its copy. Create the copy the first time you see a node and reuse it afterwards.", "When processing a node, append the copy of each neighbour to its copy's neighbour list, in the original order."],
    clarify: [
      { question: "What if the input node is None?", answer: "Return None: that is the empty graph." },
      { question: "Does the order of neighbours matter?", answer: "Yes, each copied neighbour list must follow the original order (the checker compares the lists)." },
      { question: "Can I reuse original nodes in the result?", answer: "No. Every node in the result must be newly created." },
    ],
  },
  {
    lc: 286,
    kind: "algorithm",
    statement: `You are given an \`m x n\` grid \`rooms\` describing a building. Each cell holds one of three values:

- \`-1\`: a wall, which cannot be entered.
- \`0\`: a gate.
- \`INF\` = \`2147483647\` (that is, \`2^31 - 1\`): an empty room.

Fill **every empty room** with the number of steps to its **nearest gate**, where one step moves to an adjacent cell up, down, left or right and walls block movement. A room that cannot reach any gate keeps the value \`INF\`. Walls and gates stay as they are.

Modify \`rooms\` **in place**; the method returns nothing. (The checker calls your method and then compares the grid.)`,
    examples: [
      { input: "rooms = [[0,INF,INF],[-1,-1,INF],[INF,INF,INF]]", output: "[[0,1,2],[-1,-1,3],[6,5,4]]", explanation: "The only gate is in the top-left corner, so the distances wind around the two walls." },
      { input: "rooms = [[INF,-1],[-1,INF]]", output: "[[INF,-1],[-1,INF]]", explanation: "There is no gate, so nothing changes." },
    ],
    constraints: ["1 <= m, n <= 250", "rooms[i][j] is -1, 0 or 2147483647"],
    signature: `class Solution:
    def wallsAndGates(self, rooms: List[List[int]]) -> None:
        """
        Do not return anything, modify rooms in-place instead.
        """`,
    method: "wallsAndGates",
    driver: `def run(ns, args):
    rooms = args[0]
    ns["Solution"]().wallsAndGates(rooms)
    return rooms`,
    tests: [
      { id: "ex1", input: "[[[0,2147483647,2147483647],[-1,-1,2147483647],[2147483647,2147483647,2147483647]]]", expected: "[[0, 1, 2], [-1, -1, 3], [6, 5, 4]]", visible: true },
      { id: "ex2", input: "[[[2147483647,-1],[-1,2147483647]]]", expected: "[[2147483647, -1], [-1, 2147483647]]", visible: true },
      { id: "single_room", input: "[[[2147483647]]]", expected: "[[2147483647]]", visible: false },
      { id: "single_gate", input: "[[[0]]]", expected: "[[0]]", visible: false },
      { id: "two_gates", input: "[[[0,2147483647,2147483647,2147483647,0]]]", expected: "[[0, 1, 2, 1, 0]]", visible: false },
      { id: "walled_off", input: "[[[0,-1,2147483647],[2147483647,-1,2147483647],[2147483647,-1,2147483647]]]", expected: "[[0, -1, 2147483647], [1, -1, 2147483647], [2, -1, 2147483647]]", visible: false },
      { id: "mixed", input: "[[[2147483647,2147483647,0,2147483647],[-1,2147483647,-1,2147483647],[2147483647,2147483647,2147483647,-1],[0,-1,2147483647,2147483647]]]", expected: "[[2, 1, 0, 1], [-1, 2, -1, 2], [1, 2, 3, -1], [0, -1, 4, 5]]", visible: false },
      { id: "large_corner", input: "[[[0 if r == 0 and c == 0 else 2147483647 for c in range(40)] for r in range(40)]]", expected: "[[r + c for c in range(40)] for r in range(40)]", visible: false },
      { id: "large_row", input: "[[[0] + [2147483647] * 199]]", expected: "[list(range(200))]", visible: false },
    ],
    solution: `class Solution:
    def wallsAndGates(self, rooms: List[List[int]]) -> None:
        """
        Do not return anything, modify rooms in-place instead.
        """
        INF = 2147483647
        rows, cols = len(rooms), len(rooms[0])
        q = deque((r, c) for r in range(rows) for c in range(cols) if rooms[r][c] == 0)
        while q:
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and rooms[nr][nc] == INF:
                    rooms[nr][nc] = rooms[r][c] + 1
                    q.append((nr, nc))`,
    hints: ["Searching from every room separately repeats a lot of work. Flip it around: search outward from the gates.", "Put all gates in one BFS queue at the start (multi-source BFS). Each BFS layer is one step further from the nearest gate.", "When you reach a room still marked INF, its distance is the current cell's value + 1; set it and enqueue it. Rooms that are never reached stay INF."],
    clarify: [
      { question: "What happens to rooms that cannot reach a gate?", answer: "They keep the value 2147483647 (INF)." },
      { question: "Should I return the grid?", answer: "No, modify rooms in place and return nothing; the checker reads the grid afterwards." },
    ],
  },
  {
    lc: 994,
    kind: "algorithm",
    statement: `You are given an \`m x n\` grid where each cell is:

- \`0\`: empty,
- \`1\`: a fresh orange,
- \`2\`: a rotten orange.

Every minute, each fresh orange that is directly **up, down, left or right** of a rotten orange becomes rotten. All of these changes happen at the same time.

Return the **minimum number of minutes** until no fresh orange is left. If some fresh orange can never rot, return \`-1\`. If there are no fresh oranges to begin with, the answer is \`0\`.`,
    examples: [
      { input: "grid = [[2,1,0],[0,1,1],[0,0,1]]", output: "4", explanation: "The rot spreads (0,1) → (1,1) → (1,2) → (2,2), one cell per minute." },
      { input: "grid = [[1,0,2],[0,0,1]]", output: "-1", explanation: "The orange at (0,0) is surrounded by empty cells, so it never rots." },
    ],
    constraints: ["1 <= m, n <= 10", "grid[i][j] is 0, 1 or 2"],
    signature: `class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:`,
    method: "orangesRotting",
    tests: [
      { id: "ex1", input: "[[[2,1,0],[0,1,1],[0,0,1]]]", expected: "4", visible: true },
      { id: "ex2", input: "[[[1,0,2],[0,0,1]]]", expected: "-1", visible: true },
      { id: "empty_cell", input: "[[[0]]]", expected: "0", visible: false },
      { id: "only_rotten", input: "[[[2,2],[0,2]]]", expected: "0", visible: false },
      { id: "lonely_fresh", input: "[[[1]]]", expected: "-1", visible: false },
      { id: "two_sources", input: "[[[2,1,1,1,1,1,2]]]", expected: "3", visible: false },
      { id: "blocked", input: "[[[2,1,1],[1,0,0],[0,0,1]]]", expected: "-1", visible: false },
      { id: "center_out", input: "[[[1,1,1],[1,2,1],[1,1,1]]]", expected: "2", visible: false },
      { id: "large_corner", input: "[[[2 if r == 0 and c == 0 else 1 for c in range(60)] for r in range(60)]]", expected: "118", visible: false },
      { id: "large_row", input: "[[[2] + [1] * 299]]", expected: "299", visible: false },
    ],
    solution: `class Solution:
    def orangesRotting(self, grid: List[List[int]]) -> int:
        rows, cols = len(grid), len(grid[0])
        q = deque()
        fresh = 0
        for r in range(rows):
            for c in range(cols):
                if grid[r][c] == 2:
                    q.append((r, c))
                elif grid[r][c] == 1:
                    fresh += 1
        minutes = 0
        while q and fresh:
            for _ in range(len(q)):
                r, c = q.popleft()
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                        grid[nr][nc] = 2
                        fresh -= 1
                        q.append((nr, nc))
            minutes += 1
        return minutes if fresh == 0 else -1`,
    hints: ["All rotten oranges spread at the same time, so start a BFS from all of them at once.", "Process the queue one layer at a time: one layer is one minute.", "Count fresh oranges up front and decrement as they rot. If any remain when the BFS stops, return -1."],
    clarify: [
      { question: "What if there are no fresh oranges at all?", answer: "Return 0, no time needs to pass." },
      { question: "Does rot spread diagonally?", answer: "No, only to the four orthogonal neighbours." },
    ],
  },
  {
    lc: 417,
    kind: "algorithm",
    statement: `An island is drawn as an \`m x n\` grid \`heights\`, where \`heights[r][c]\` is the height above sea level of cell \`(r, c)\`.

- The **Pacific** ocean touches the island's **top** and **left** edges.
- The **Atlantic** ocean touches the island's **bottom** and **right** edges.

Rain falling on a cell can flow to a neighbouring cell (up, down, left, right) if that neighbour's height is **less than or equal to** the current cell's height. Water on a cell next to an ocean can flow straight into that ocean.

Return the coordinates \`[r, c]\` of every cell from which water can reach **both** oceans. The list may be in any order.`,
    examples: [
      { input: "heights = [[3,3,5],[2,4,4],[1,6,2]]", output: "[[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1]]", explanation: "Every cell except (2,2) qualifies. For example, (1,1) (height 4) flows up to (0,1) and into the Pacific, and right to (1,2) and into the Atlantic. (2,2) (height 2) is lower than both its neighbours, so it only reaches the Atlantic." },
      { input: "heights = [[7]]", output: "[[0,0]]", explanation: "A single cell touches both oceans." },
    ],
    constraints: ["1 <= m, n <= 200", "0 <= heights[r][c] <= 10^5"],
    signature: `class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:`,
    method: "pacificAtlantic",
    tests: [
      { id: "ex1", input: "[[[3,3,5],[2,4,4],[1,6,2]]]", expected: "[[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1]]", compare: "unordered", visible: true },
      { id: "ex2", input: "[[[7]]]", expected: "[[0, 0]]", compare: "unordered", visible: true },
      { id: "flat", input: "[[[2,2],[2,2]]]", expected: "[[0, 0], [0, 1], [1, 0], [1, 1]]", compare: "unordered", visible: false },
      { id: "row", input: "[[[1,2,3,2,1]]]", expected: "[[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]", compare: "unordered", visible: false },
      { id: "column", input: "[[[5],[1],[4]]]", expected: "[[0, 0], [1, 0], [2, 0]]", compare: "unordered", visible: false },
      { id: "pit", input: "[[[5,5,5],[5,1,5],[5,5,5]]]", expected: "[[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]]", compare: "unordered", visible: false },
      { id: "ridge", input: "[[[1,2,3],[8,9,4],[7,6,5]]]", expected: "[[0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]", compare: "unordered", visible: false },
      { id: "valley", input: "[[[4,1,4],[3,1,3],[4,1,4]]]", expected: "[[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]", compare: "unordered", visible: false },
      { id: "large_slope", input: "[[[r + c for c in range(40)] for r in range(40)]]", expected: "[[r, c] for r in range(40) for c in range(40) if r == 39 or c == 39]", compare: "unordered", visible: false },
    ],
    solution: `class Solution:
    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:
        rows, cols = len(heights), len(heights[0])

        def reach(starts):
            seen = set(starts)
            stack = list(starts)
            while stack:
                r, c = stack.pop()
                for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                    if 0 <= nr < rows and 0 <= nc < cols and (nr, nc) not in seen and heights[nr][nc] >= heights[r][c]:
                        seen.add((nr, nc))
                        stack.append((nr, nc))
            return seen

        pacific = reach([(0, c) for c in range(cols)] + [(r, 0) for r in range(rows)])
        atlantic = reach([(rows - 1, c) for c in range(cols)] + [(r, cols - 1) for r in range(rows)])
        return [[r, c] for r in range(rows) for c in range(cols) if (r, c) in pacific and (r, c) in atlantic]`,
    hints: ["Testing every cell with its own search is slow. Ask the reverse question: which cells can each ocean reach?", "Start a search from all Pacific border cells and walk 'uphill' (to neighbours with height >= current). Do the same from the Atlantic border.", "The answer is the intersection of the two visited sets."],
    clarify: [
      { question: "Can water flow between cells of equal height?", answer: "Yes, it flows to neighbours whose height is less than or equal." },
      { question: "Does the output order matter?", answer: "No, any order of the coordinate pairs is accepted." },
    ],
  },
  {
    lc: 130,
    kind: "algorithm",
    statement: `You are given an \`m x n\` board of the characters \`'X'\` and \`'O'\`. A **region** is a group of \`'O'\` cells connected up, down, left or right.

A region is **surrounded** when none of its cells lies on the border of the board (so it is completely enclosed by \`'X'\` cells). **Capture** every surrounded region by turning all of its \`'O'\` cells into \`'X'\`. Regions that touch the border stay unchanged.

Modify \`board\` **in place**; the method returns nothing. (The checker calls your method and then compares the board.)`,
    examples: [
      { input: "board = [[\"X\",\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"O\",\"X\",\"O\"],[\"X\",\"X\",\"O\",\"X\",\"O\"],[\"X\",\"O\",\"X\",\"X\",\"X\"]]", output: "[[\"X\",\"X\",\"X\",\"X\",\"X\"],[\"X\",\"X\",\"X\",\"X\",\"O\"],[\"X\",\"X\",\"X\",\"X\",\"O\"],[\"X\",\"O\",\"X\",\"X\",\"X\"]]", explanation: "The region {(1,1),(1,2),(2,2)} is enclosed and gets captured. (1,4),(2,4) and (3,1) touch the border and stay." },
      { input: "board = [[\"O\"]]", output: "[[\"O\"]]", explanation: "A single border cell can never be captured." },
    ],
    constraints: ["1 <= m, n <= 200", "board[i][j] is 'X' or 'O'"],
    signature: `class Solution:
    def solve(self, board: List[List[str]]) -> None:
        """
        Do not return anything, modify board in-place instead.
        """`,
    method: "solve",
    driver: `def run(ns, args):
    board = args[0]
    ns["Solution"]().solve(board)
    return board`,
    tests: [
      { id: "ex1", input: "[[[\"X\",\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"O\",\"X\",\"O\"],[\"X\",\"X\",\"O\",\"X\",\"O\"],[\"X\",\"O\",\"X\",\"X\",\"X\"]]]", expected: "[['X', 'X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X', 'O'], ['X', 'X', 'X', 'X', 'O'], ['X', 'O', 'X', 'X', 'X']]", visible: true },
      { id: "ex2", input: "[[[\"O\"]]]", expected: "[['O']]", visible: true },
      { id: "single_x", input: "[[[\"X\"]]]", expected: "[['X']]", visible: false },
      { id: "center", input: "[[[\"X\",\"X\",\"X\"],[\"X\",\"O\",\"X\"],[\"X\",\"X\",\"X\"]]]", expected: "[['X', 'X', 'X'], ['X', 'X', 'X'], ['X', 'X', 'X']]", visible: false },
      { id: "leak", input: "[[[\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"O\",\"X\"],[\"X\",\"O\",\"X\",\"X\"],[\"X\",\"O\",\"X\",\"X\"]]]", expected: "[['X', 'X', 'X', 'X'], ['X', 'O', 'O', 'X'], ['X', 'O', 'X', 'X'], ['X', 'O', 'X', 'X']]", visible: false },
      { id: "all_o", input: "[[[\"O\",\"O\",\"O\"],[\"O\",\"O\",\"O\"],[\"O\",\"O\",\"O\"]]]", expected: "[['O', 'O', 'O'], ['O', 'O', 'O'], ['O', 'O', 'O']]", visible: false },
      { id: "two_regions", input: "[[[\"X\",\"X\",\"X\",\"X\",\"X\",\"X\"],[\"X\",\"O\",\"X\",\"X\",\"O\",\"X\"],[\"X\",\"O\",\"X\",\"O\",\"O\",\"X\"],[\"X\",\"X\",\"X\",\"X\",\"X\",\"X\"]]]", expected: "[['X', 'X', 'X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X', 'X', 'X']]", visible: false },
      { id: "diagonal_escape", input: "[[[\"X\",\"O\",\"X\",\"X\"],[\"X\",\"X\",\"O\",\"X\"],[\"X\",\"O\",\"X\",\"X\"],[\"X\",\"X\",\"X\",\"X\"]]]", expected: "[['X', 'O', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X'], ['X', 'X', 'X', 'X']]", visible: false },
      { id: "large_closed", input: "[[['X' if r in (0, 39) or c in (0, 39) else 'O' for c in range(40)] for r in range(40)]]", expected: "[['X'] * 40 for _ in range(40)]", visible: false },
      { id: "large_open", input: "[[['O' if (r == 20 and c == 0) or not (r in (0, 39) or c in (0, 39)) else 'X' for c in range(40)] for r in range(40)]]", expected: "[['O' if (r == 20 and c == 0) or not (r in (0, 39) or c in (0, 39)) else 'X' for c in range(40)] for r in range(40)]", visible: false },
    ],
    solution: `class Solution:
    def solve(self, board: List[List[str]]) -> None:
        """
        Do not return anything, modify board in-place instead.
        """
        rows, cols = len(board), len(board[0])
        stack = [(r, c) for r in range(rows) for c in range(cols)
                 if (r in (0, rows - 1) or c in (0, cols - 1)) and board[r][c] == "O"]
        for r, c in stack:
            board[r][c] = "#"
        while stack:
            r, c = stack.pop()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] == "O":
                    board[nr][nc] = "#"
                    stack.append((nr, nc))
        for r in range(rows):
            for c in range(cols):
                if board[r][c] == "O":
                    board[r][c] = "X"
                elif board[r][c] == "#":
                    board[r][c] = "O"`,
    hints: ["It is hard to tell from inside a region whether it is enclosed. It is easy to tell which regions are NOT enclosed: the ones touching the border.", "Flood-fill from every border 'O' and mark those cells as safe (e.g. with a temporary '#').", "Finally flip every remaining 'O' to 'X' and turn the safe marks back into 'O'."],
    clarify: [
      { question: "Is a region connected to the border only diagonally still captured?", answer: "Yes. Only up/down/left/right connections count, so a diagonal touch does not save it." },
      { question: "Should I return the board?", answer: "No, modify it in place; the checker reads it afterwards." },
    ],
  },
  {
    lc: 207,
    kind: "algorithm",
    statement: `There are \`numCourses\` courses numbered \`0\` to \`numCourses - 1\`. Each entry \`prerequisites[i] = [a, b]\` means you must finish course \`b\` **before** you can take course \`a\`.

Return \`true\` if it is possible to complete **every** course, and \`false\` otherwise (which happens exactly when the requirements contain a cycle).`,
    examples: [
      { input: "numCourses = 3, prerequisites = [[1,0],[2,1]]", output: "true", explanation: "Take 0, then 1, then 2." },
      { input: "numCourses = 3, prerequisites = [[0,1],[1,2],[2,0]]", output: "false", explanation: "0 needs 1, 1 needs 2 and 2 needs 0: a cycle." },
    ],
    constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= 5000", "prerequisites[i] = [a, b] with 0 <= a, b < numCourses", "All pairs are distinct"],
    signature: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:`,
    method: "canFinish",
    tests: [
      { id: "ex1", input: "[3, [[1,0],[2,1]]]", expected: "True", visible: true },
      { id: "ex2", input: "[3, [[0,1],[1,2],[2,0]]]", expected: "False", visible: true },
      { id: "no_edges", input: "[1, []]", expected: "True", visible: false },
      { id: "two_cycle", input: "[2, [[1,0],[0,1]]]", expected: "False", visible: false },
      { id: "diamond", input: "[4, [[1,0],[2,0],[3,1],[3,2]]]", expected: "True", visible: false },
      { id: "disconnected_cycle", input: "[6, [[1,0],[2,1],[4,3],[5,4],[3,5]]]", expected: "False", visible: false },
      { id: "self_loop", input: "[2, [[1,1]]]", expected: "False", visible: false },
      { id: "many_free", input: "[5, [[4,3]]]", expected: "True", visible: false },
      { id: "large_chain", input: "[2000, [[i + 1, i] for i in range(1999)]]", expected: "True", visible: false },
      { id: "large_cycle", input: "[2000, [[i + 1, i] for i in range(1999)] + [[0, 1999]]]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:
        adj = [[] for _ in range(numCourses)]
        indeg = [0] * numCourses
        for a, b in prerequisites:
            adj[b].append(a)
            indeg[a] += 1
        q = deque(i for i in range(numCourses) if indeg[i] == 0)
        done = 0
        while q:
            c = q.popleft()
            done += 1
            for nxt in adj[c]:
                indeg[nxt] -= 1
                if indeg[nxt] == 0:
                    q.append(nxt)
        return done == numCourses`,
    hints: ["Model the courses as a directed graph with an edge b -> a for each pair [a, b]. All courses can be finished exactly when there is no cycle.", "Kahn's algorithm: repeatedly take a course with no unfinished prerequisites (in-degree 0) and remove its outgoing edges.", "If you manage to take all numCourses courses this way, return true; any course stuck with in-degree > 0 is on or behind a cycle."],
    clarify: [
      { question: "Can a course list itself as a prerequisite?", answer: "If it did, that would be a cycle of length 1 and the answer is false." },
      { question: "Are courses without any prerequisite entry allowed?", answer: "Yes, they can be taken at any time." },
    ],
  },
  {
    lc: 210,
    kind: "algorithm",
    statement: `There are \`numCourses\` courses numbered \`0\` to \`numCourses - 1\`. Each entry \`prerequisites[i] = [a, b]\` means course \`b\` must be taken **before** course \`a\`.

Return an ordering of **all** the courses that respects every prerequisite. If several orderings work, return **any** of them. If no ordering exists (the requirements contain a cycle), return an **empty list**.

**Checking.** Because many answers can be correct, the checker verifies your list: it must contain every course exactly once with each prerequisite placed before the course that needs it, or be \`[]\` when no valid order exists. A correct answer makes the test report \`True\`.`,
    examples: [
      { input: "numCourses = 3, prerequisites = [[2,0],[2,1]]", output: "[0,1,2]", explanation: "[1,0,2] is also correct: 2 just has to come after both 0 and 1." },
      { input: "numCourses = 2, prerequisites = [[0,1],[1,0]]", output: "[]", explanation: "Each course needs the other first, so no order exists." },
    ],
    constraints: ["1 <= numCourses <= 2000", "0 <= prerequisites.length <= numCourses * (numCourses - 1)", "prerequisites[i] = [a, b] with 0 <= a, b < numCourses and a != b", "All pairs are distinct"],
    signature: `class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:`,
    method: "findOrder",
    driver: `def run(ns, args):
    n, pre = args
    order = ns["Solution"]().findOrder(n, [list(p) for p in pre])
    order = list(order) if order is not None else None
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in pre:
        adj[b].append(a)
        indeg[a] += 1
    stack = [i for i in range(n) if indeg[i] == 0]
    seen = 0
    while stack:
        x = stack.pop()
        seen += 1
        for y in adj[x]:
            indeg[y] -= 1
            if indeg[y] == 0:
                stack.append(y)
    if seen < n:
        return order == []
    if order is None or sorted(order) != list(range(n)):
        return False
    pos = {c: i for i, c in enumerate(order)}
    return all(pos[b] < pos[a] for a, b in pre)`,
    tests: [
      { id: "ex1", input: "[3, [[2,0],[2,1]]]", expected: "True", visible: true },
      { id: "ex2", input: "[2, [[0,1],[1,0]]]", expected: "True", visible: true },
      { id: "single", input: "[1, []]", expected: "True", visible: false },
      { id: "no_edges", input: "[4, []]", expected: "True", visible: false },
      { id: "diamond", input: "[4, [[1,0],[2,0],[3,1],[3,2]]]", expected: "True", visible: false },
      { id: "reverse_chain", input: "[5, [[0,1],[1,2],[2,3],[3,4]]]", expected: "True", visible: false },
      { id: "cycle_in_part", input: "[5, [[1,0],[3,2],[4,3],[2,4]]]", expected: "True", visible: false },
      { id: "multi_layer", input: "[6, [[3,0],[3,1],[4,1],[4,2],[5,3],[5,4]]]", expected: "True", visible: false },
      { id: "large_chain", input: "[1500, [[i, i + 1] for i in range(1499)]]", expected: "True", visible: false },
      { id: "large_cycle", input: "[1500, [[i, i + 1] for i in range(1499)] + [[1499, 0]]]", expected: "True", visible: false },
    ],
    solution: `class Solution:
    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:
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
    hints: ["You need a topological order of the directed graph with edges b -> a.", "With Kahn's algorithm, the order in which courses leave the in-degree-0 queue is already a valid answer.", "If fewer than numCourses courses come out, there is a cycle: return an empty list."],
    clarify: [
      { question: "If several orders are valid, which one should I return?", answer: "Any of them; the checker accepts every valid order." },
      { question: "What should I return when it is impossible?", answer: "An empty list []." },
    ],
  },
  {
    lc: 261,
    kind: "algorithm",
    statement: `You are given \`n\` nodes labelled \`0\` to \`n - 1\` and a list of **undirected** edges, where \`edges[i] = [a, b]\` connects nodes \`a\` and \`b\`.

Return \`true\` if these edges form a **valid tree**, meaning the graph is **connected** (every node can reach every other node) **and has no cycle**. Otherwise return \`false\`.

You may assume no edge appears twice (neither \`[a, b]\` twice nor both \`[a, b]\` and \`[b, a]\`) and there are no self-loops.`,
    examples: [
      { input: "n = 4, edges = [[0,1],[0,2],[2,3]]", output: "true", explanation: "All four nodes are connected and there is no cycle." },
      { input: "n = 4, edges = [[0,1],[1,2],[2,0],[2,3]]", output: "false", explanation: "0-1-2-0 is a cycle." },
    ],
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 5000", "0 <= a, b < n, a != b", "No duplicate edges"],
    signature: `class Solution:
    def validTree(self, n: int, edges: List[List[int]]) -> bool:`,
    method: "validTree",
    tests: [
      { id: "ex1", input: "[4, [[0,1],[0,2],[2,3]]]", expected: "True", visible: true },
      { id: "ex2", input: "[4, [[0,1],[1,2],[2,0],[2,3]]]", expected: "False", visible: true },
      { id: "single", input: "[1, []]", expected: "True", visible: false },
      { id: "two_no_edge", input: "[2, []]", expected: "False", visible: false },
      { id: "disconnected_right_count", input: "[4, [[0,1],[1,2],[2,0]]]", expected: "False", visible: false },
      { id: "forest", input: "[5, [[0,1],[2,3]]]", expected: "False", visible: false },
      { id: "star", input: "[5, [[0,1],[0,2],[0,3],[0,4]]]", expected: "True", visible: false },
      { id: "too_many_edges", input: "[3, [[0,1],[1,2],[0,2]]]", expected: "False", visible: false },
      { id: "large_path", input: "[2000, [[i, i + 1] for i in range(1999)]]", expected: "True", visible: false },
      { id: "large_two_parts", input: "[2000, [[i, i + 1] for i in range(999)] + [[i, i + 1] for i in range(1000, 1999)] + [[0, 998]]]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def validTree(self, n: int, edges: List[List[int]]) -> bool:
        if len(edges) != n - 1:
            return False
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for a, b in edges:
            ra, rb = find(a), find(b)
            if ra == rb:
                return False
            parent[ra] = rb
        return True`,
    hints: ["A tree on n nodes has exactly n - 1 edges. That check alone rules out many inputs.", "With exactly n - 1 edges, the graph is a tree if and only if it has no cycle (equivalently, if it is connected).", "Union-Find: if an edge joins two nodes that already share a root, it closes a cycle."],
    clarify: [
      { question: "Is a single node with no edges a valid tree?", answer: "Yes, n = 1 with no edges is a tree." },
      { question: "Are the edges directed?", answer: "No, [a, b] connects a and b in both directions." },
    ],
  },
  {
    lc: 323,
    kind: "algorithm",
    statement: `You have an undirected graph with \`n\` nodes labelled \`0\` to \`n - 1\`, and a list \`edges\` where \`edges[i] = [a, b]\` is an edge between \`a\` and \`b\`.

Return the **number of connected components** in the graph. A connected component is a maximal set of nodes in which every node can reach every other node through edges. A node with no edges forms a component on its own.`,
    examples: [
      { input: "n = 6, edges = [[0,1],[2,3],[3,4]]", output: "3", explanation: "The components are {0,1}, {2,3,4} and {5}." },
      { input: "n = 3, edges = []", output: "3", explanation: "No edges, so every node is alone." },
    ],
    constraints: ["1 <= n <= 2000", "0 <= edges.length <= 5000", "0 <= a, b < n, a != b", "No duplicate edges"],
    signature: `class Solution:
    def countComponents(self, n: int, edges: List[List[int]]) -> int:`,
    method: "countComponents",
    tests: [
      { id: "ex1", input: "[6, [[0,1],[2,3],[3,4]]]", expected: "3", visible: true },
      { id: "ex2", input: "[3, []]", expected: "3", visible: true },
      { id: "single", input: "[1, []]", expected: "1", visible: false },
      { id: "all_joined", input: "[4, [[0,1],[1,2],[2,3]]]", expected: "1", visible: false },
      { id: "with_cycle", input: "[5, [[0,1],[1,2],[2,0],[3,4]]]", expected: "2", visible: false },
      { id: "star", input: "[5, [[0,4],[1,4],[2,4],[3,4]]]", expected: "1", visible: false },
      { id: "reverse_merge", input: "[6, [[4,5],[2,3],[0,1],[1,3]]]", expected: "2", visible: false },
      { id: "isolated_middle", input: "[5, [[0,4],[1,3]]]", expected: "3", visible: false },
      { id: "large_pairs", input: "[2000, [[2 * i, 2 * i + 1] for i in range(700)]]", expected: "1300", visible: false },
      { id: "large_path", input: "[2000, [[i, i + 1] for i in range(1999)]]", expected: "1", visible: false },
    ],
    solution: `class Solution:
    def countComponents(self, n: int, edges: List[List[int]]) -> int:
        parent = list(range(n))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        components = n
        for a, b in edges:
            ra, rb = find(a), find(b)
            if ra != rb:
                parent[ra] = rb
                components -= 1
        return components`,
    hints: ["Start by assuming every node is its own component: n components.", "Each edge that joins two different components merges them, reducing the count by one. An edge inside one component changes nothing.", "Union-Find tracks which component each node is in; alternatively run a DFS from every unvisited node and count the starts."],
    clarify: [
      { question: "Does an isolated node count as a component?", answer: "Yes, each node with no edges is its own component." },
      { question: "Can edges form cycles?", answer: "Yes, the graph is arbitrary (no duplicate edges or self-loops)." },
    ],
  },
  {
    lc: 684,
    kind: "algorithm",
    statement: `A graph started as a tree with \`n\` nodes labelled \`1\` to \`n\`. Then **one extra edge** was added between two different nodes; that edge was not already in the tree. You receive all \`n\` edges as \`edges\`, where \`edges[i] = [a, b]\` is an undirected edge.

Return an edge whose removal turns the graph back into a tree on all \`n\` nodes. Because the extra edge closes exactly one cycle, any edge on that cycle would work; return the one that appears **last** in \`edges\`.`,
    examples: [
      { input: "edges = [[1,2],[2,3],[3,4],[2,4]]", output: "[2,4]", explanation: "The cycle is 2-3-4-2, and [2,4] is the last of its edges in the input." },
      { input: "edges = [[2,3],[1,2],[1,3],[3,4]]", output: "[1,3]", explanation: "The cycle uses [2,3], [1,2] and [1,3]; [1,3] comes last among them, even though [3,4] is later in the list." },
    ],
    constraints: ["3 <= n == edges.length <= 1000", "1 <= a < b <= n", "No repeated edges", "The input is a tree plus one extra edge"],
    signature: `class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:`,
    method: "findRedundantConnection",
    tests: [
      { id: "ex1", input: "[[[1,2],[2,3],[3,4],[2,4]]]", expected: "[2, 4]", visible: true },
      { id: "ex2", input: "[[[2,3],[1,2],[1,3],[3,4]]]", expected: "[1, 3]", visible: true },
      { id: "triangle", input: "[[[1,2],[1,3],[2,3]]]", expected: "[2, 3]", visible: false },
      { id: "cycle_first", input: "[[[1,2],[2,3],[1,3],[3,4],[4,5]]]", expected: "[1, 3]", visible: false },
      { id: "long_cycle", input: "[[[1,5],[3,4],[4,5],[1,2],[2,3],[5,6]]]", expected: "[2, 3]", visible: false },
      { id: "star_plus", input: "[[[1,2],[1,3],[1,4],[1,5],[4,5]]]", expected: "[4, 5]", visible: false },
      { id: "unsorted", input: "[[[3,4],[1,2],[2,4],[3,5],[2,5]]]", expected: "[2, 5]", visible: false },
      { id: "large_ring", input: "[[[i, i + 1] for i in range(1, 1000)] + [[1, 1000]]]", expected: "[1, 1000]", visible: false },
      { id: "large_mid", input: "[[[i, i + 1] for i in range(1, 1000)][:600] + [[300, 601]] + [[i, i + 1] for i in range(601, 1000)]]", expected: "[300, 601]", visible: false },
    ],
    solution: `class Solution:
    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:
        parent = list(range(len(edges) + 1))

        def find(x):
            while parent[x] != x:
                parent[x] = parent[parent[x]]
                x = parent[x]
            return x

        for a, b in edges:
            ra, rb = find(a), find(b)
            if ra == rb:
                return [a, b]
            parent[ra] = rb
        return []`,
    hints: ["Add the edges one at a time in the given order. The first edge whose two endpoints are already connected closes the cycle.", "That first cycle-closing edge is also the last cycle edge in the input, because before it the graph had no cycle.", "Union-Find answers 'are a and b already connected?' in near-constant time."],
    clarify: [
      { question: "Which edge do I return if several could be removed?", answer: "The one that appears last in the input among the edges of the cycle." },
      { question: "Are nodes 0-indexed?", answer: "No, nodes are labelled 1 to n." },
    ],
  },
  {
    lc: 127,
    kind: "algorithm",
    statement: `You are given two words, \`beginWord\` and \`endWord\`, and a dictionary \`wordList\`. A **transformation sequence** goes from \`beginWord\` to \`endWord\` through words \`beginWord -> w1 -> w2 -> ... -> wk\` such that:

- consecutive words differ in **exactly one letter** (same length, one position changed),
- every \`wi\` (including the final \`endWord\`) is in \`wordList\`; \`beginWord\` itself does not have to be.

Return the **number of words** in the shortest such sequence, counting both \`beginWord\` and \`endWord\`. If no sequence exists (for example, \`endWord\` is not in the list), return \`0\`.`,
    examples: [
      { input: "beginWord = \"cold\", endWord = \"warm\", wordList = [\"cord\",\"card\",\"ward\",\"warm\",\"worm\",\"word\"]", output: "5", explanation: "One shortest sequence is \"cold\" -> \"cord\" -> \"card\" -> \"ward\" -> \"warm\", which has 5 words." },
      { input: "beginWord = \"abc\", endWord = \"xyz\", wordList = [\"abz\",\"ayz\"]", output: "0", explanation: "\"xyz\" is not in the word list, so it can never be reached." },
    ],
    constraints: ["1 <= beginWord.length <= 10", "endWord.length == beginWord.length", "1 <= wordList.length <= 5000", "All words have the same length and use lowercase English letters", "beginWord != endWord; words in wordList are unique"],
    signature: `class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:`,
    method: "ladderLength",
    tests: [
      { id: "ex1", input: "[\"cold\", \"warm\", [\"cord\",\"card\",\"ward\",\"warm\",\"worm\",\"word\"]]", expected: "5", visible: true },
      { id: "ex2", input: "[\"abc\", \"xyz\", [\"abz\",\"ayz\"]]", expected: "0", visible: true },
      { id: "one_step", input: "[\"a\", \"c\", [\"a\",\"b\",\"c\"]]", expected: "2", visible: false },
      { id: "unreachable", input: "[\"lost\", \"find\", [\"last\",\"list\",\"fist\",\"find\"]]", expected: "0", visible: false },
      { id: "begin_in_list", input: "[\"dog\", \"cat\", [\"dog\",\"cog\",\"cot\",\"cat\"]]", expected: "4", visible: false },
      { id: "detour", input: "[\"aaa\", \"ccc\", [\"aab\",\"abb\",\"bbb\",\"bbc\",\"bcc\",\"ccc\",\"aac\",\"acc\"]]", expected: "4", visible: false },
      { id: "only_end", input: "[\"hot\", \"dot\", [\"dot\"]]", expected: "2", visible: false },
      { id: "no_link", input: "[\"abcd\", \"wxyz\", [\"wxyz\"]]", expected: "0", visible: false },
      { id: "large_grid", input: "['aaa', 'jjj', [chr(97 + a) + chr(97 + b) + chr(97 + c) for a in range(10) for b in range(10) for c in range(10)]]", expected: "4", visible: false },
      { id: "large_chain", input: "['a' * 6, 'b' * 6, ['b' * i + 'a' * (6 - i) for i in range(1, 7)] + ['c' * i + 'a' * (6 - i) for i in range(1, 7)]]", expected: "7", visible: false },
    ],
    solution: `class Solution:
    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:
        words = set(wordList)
        if endWord not in words:
            return 0
        patterns = defaultdict(list)
        for w in words | {beginWord}:
            for i in range(len(w)):
                patterns[w[:i] + "*" + w[i + 1:]].append(w)
        seen = {beginWord}
        q = deque([beginWord])
        steps = 1
        while q:
            for _ in range(len(q)):
                w = q.popleft()
                if w == endWord:
                    return steps
                for i in range(len(w)):
                    for nxt in patterns[w[:i] + "*" + w[i + 1:]]:
                        if nxt not in seen:
                            seen.add(nxt)
                            q.append(nxt)
            steps += 1
        return 0`,
    hints: ["Treat every word as a node, with an edge between words that differ in one letter. The answer is a shortest path, so use BFS.", "Comparing every pair of words is too slow. Group words by wildcard patterns such as 'c*ld': words sharing a pattern are neighbours.", "Count the words, not the steps: the BFS starts at level 1 for beginWord. Return 0 if endWord is missing from the list or never reached."],
    clarify: [
      { question: "Does beginWord need to be in the word list?", answer: "No, but every later word, including endWord, must be." },
      { question: "Is the answer the number of words or the number of changes?", answer: "The number of words in the sequence, so it is the number of changes + 1." },
    ],
  },
  {
    lc: 773,
    kind: "algorithm",
    statement: `A \`2 x 3\` board holds the tiles \`1\` to \`5\` and one empty space shown as \`0\`. In one **move** you swap the \`0\` with a tile directly above, below, left or right of it (no diagonals).

The board is **solved** when it reads \`[[1,2,3],[4,5,0]]\`. Return the **fewest moves** needed to solve the given board, or \`-1\` if it can never be solved.`,
    examples: [
      { input: "board = [[1,2,3],[4,0,5]]", output: "1", explanation: "Swap the 0 with the 5 on its right." },
      { input: "board = [[1,2,3],[5,4,0]]", output: "-1", explanation: "No sequence of moves reaches the solved board." },
      { input: "board = [[4,1,2],[5,0,3]]", output: "5" },
    ],
    constraints: ["board.length == 2", "board[i].length == 3", "board holds each of 0, 1, 2, 3, 4, 5 exactly once"],
    signature: `class Solution:
    def slidingPuzzle(self, board: List[List[int]]) -> int:`,
    method: "slidingPuzzle",
    tests: [
      { id: "ex1", input: "[[[1,2,3],[4,0,5]]]", expected: "1", visible: true },
      { id: "ex2", input: "[[[1,2,3],[5,4,0]]]", expected: "-1", visible: true },
      { id: "ex3", input: "[[[4,1,2],[5,0,3]]]", expected: "5", visible: true },
      { id: "solved", input: "[[[1,2,3],[4,5,0]]]", expected: "0", visible: false },
      { id: "two-moves", input: "[[[1,2,3],[0,4,5]]]", expected: "2", visible: false },
      { id: "far-1", input: "[[[3,2,4],[1,5,0]]]", expected: "14", visible: false },
      { id: "far-2", input: "[[[0,1,2],[3,4,5]]]", expected: "15", visible: false },
      { id: "reversed", input: "[[[5,4,3],[2,1,0]]]", expected: "14", visible: false },
      { id: "swapped-pair", input: "[[[2,1,3],[4,5,0]]]", expected: "-1", visible: false },
    ],
    solution: `from collections import deque

class Solution:
    def slidingPuzzle(self, board: List[List[int]]) -> int:
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
    hints: [
      "Fewest moves between configurations: treat each whole board as one node and each legal swap as an edge, then BFS.",
      "Flatten the board to a 6-character string so it can go in a set; precompute which flat positions are next to each position of the 0.",
    ],
    clarify: [
      { question: "Can tiles move diagonally?", answer: "No, only up, down, left or right into the empty space." },
      { question: "Is every board solvable?", answer: "No; half of all arrangements can't be solved, so return -1 for those." },
    ],
  },
];
