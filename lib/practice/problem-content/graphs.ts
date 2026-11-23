/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "200": {
    "followUps": [
      "How would diagonal adjacency change the neighbor expansion?"
    ],
    "reference": {
      "title": "Grid flood fill (DFS)",
      "explanation": "Each island is a connected component. Scan every cell; ==each time you hit land you haven't touched, that's a new island==. Run a DFS from it and ==sink every connected land cell== (set it to `\"0\"`) so the scan never counts it again.",
      "time": "O(rows · cols)",
      "space": "O(rows · cols)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Breadth-first island marking",
      "explanation": "Start a queue from each unvisited land cell and mark its whole connected component before counting the next one.",
      "code": "class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        rows, cols = len(grid), len(grid[0])\n        seen, islands = set(), 0\n        for r in range(rows):\n            for c in range(cols):\n                if grid[r][c] != '1' or (r,c) in seen: continue\n                islands += 1\n                queue = deque([(r,c)]); seen.add((r,c))\n                while queue:\n                    x,y = queue.popleft()\n                    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):\n                        a,b = x+dx,y+dy\n                        if 0 <= a < rows and 0 <= b < cols and grid[a][b] == '1' and (a,b) not in seen:\n                            seen.add((a,b)); queue.append((a,b))\n        return islands\n",
      "time": "O(R · C)",
      "space": "O(R · C)",
      "optimal": false
    }
  },
  "695": {
    "followUps": [
      "How would you maintain island areas while new land cells are added?"
    ],
    "reference": {
      "title": "Grid flood fill (DFS)",
      "explanation": "Same flood fill as Number of Islands, but ==the DFS returns how many cells it sank==: `1 + dfs(down) + dfs(up) + dfs(right) + dfs(left)`. Sinking each cell as you go means it's counted exactly once. Keep the max.",
      "time": "O(rows · cols)",
      "space": "O(rows · cols)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Queue-based component areas",
      "explanation": "Count the cells removed from each island queue and keep the largest component size.",
      "code": "class Solution:\n    def maxAreaOfIsland(self, grid: List[List[int]]) -> int:\n        rows, cols = len(grid), len(grid[0])\n        seen, best = set(), 0\n        for r in range(rows):\n            for c in range(cols):\n                if grid[r][c] != 1 or (r,c) in seen: continue\n                queue = deque([(r,c)]); seen.add((r,c)); area = 0\n                while queue:\n                    x,y = queue.popleft(); area += 1\n                    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):\n                        a,b = x+dx,y+dy\n                        if 0 <= a < rows and 0 <= b < cols and grid[a][b] == 1 and (a,b) not in seen:\n                            seen.add((a,b)); queue.append((a,b))\n                best = max(best, area)\n        return best\n",
      "time": "O(R · C)",
      "space": "O(R · C)",
      "optimal": false
    }
  },
  "133": {
    "followUps": [
      "Why must the clone be recorded before recursively cloning adjacent nodes?"
    ],
    "reference": {
      "title": "Traverse with an old → new map",
      "explanation": "DFS through the graph and copy each node the first time you see it. The trick is ==a map `old → new`==: it doubles as the visited set, and when an edge leads back to a node already copied, you ==link to the existing copy== instead of looping forever.",
      "time": "O(V + E)",
      "space": "O(V)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Recursive clone map",
      "explanation": "Create a clone before exploring its neighbors, so a cycle reuses the already-created clone.",
      "code": "class Solution:\n    def cloneGraph(self, node: Optional['Node']) -> Optional['Node']:\n        copies = {}\n        def clone(current):\n            if current is None: return None\n            if current not in copies:\n                copies[current] = Node(current.val)\n                copies[current].neighbors = [clone(neighbor) for neighbor in current.neighbors]\n            return copies[current]\n        return clone(node)\n",
      "time": "O(V + E)",
      "space": "O(V)",
      "optimal": false
    }
  },
  "286": {
    "followUps": [
      "Why does starting one queue from all gates compute the same distances with less repeated work?"
    ],
    "reference": {
      "title": "BFS by layers (shortest steps)",
      "explanation": "Running a BFS from each room is slow. Flip it: ==put every gate in the queue at once== and BFS outward. The first time the wave reaches a room is from ==its nearest gate==, so write `distance + 1` and never touch it again.",
      "time": "O(rows · cols)",
      "space": "O(rows · cols)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Search outward from each room",
      "explanation": "Run a fresh breadth-first search from each empty room until its nearest gate is reached.",
      "code": "class Solution:\n    def wallsAndGates(self, rooms: List[List[int]]) -> None:\n        rows, cols = len(rooms), len(rooms[0])\n        for r in range(rows):\n            for c in range(cols):\n                if rooms[r][c] != 2147483647: continue\n                queue = deque([(r,c,0)]); seen = {(r,c)}\n                while queue:\n                    x,y,d = queue.popleft()\n                    if rooms[x][y] == 0:\n                        rooms[r][c] = d; break\n                    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):\n                        a,b = x+dx,y+dy\n                        if 0 <= a < rows and 0 <= b < cols and rooms[a][b] != -1 and (a,b) not in seen:\n                            seen.add((a,b)); queue.append((a,b,d+1))\n",
      "time": "O((R · C)²)",
      "space": "O(R · C)",
      "optimal": false
    }
  },
  "994": {
    "followUps": [
      "Why would updating cells immediately during the scan give the wrong number of minutes?"
    ],
    "reference": {
      "title": "BFS by layers (shortest steps)",
      "explanation": "Rot spreads from ==all rotten oranges at the same time==, so start a BFS with every one of them in the queue. ==Each BFS layer is one minute==. Count fresh oranges up front; if any are left when the queue empties, return -1.",
      "time": "O(rows · cols)",
      "space": "O(rows · cols)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Simulate whole-minute rounds",
      "explanation": "At each minute collect all fresh cells touching a rotten cell, then rot that collection simultaneously.",
      "code": "class Solution:\n    def orangesRotting(self, grid: List[List[int]]) -> int:\n        rows, cols = len(grid), len(grid[0])\n        minutes = 0\n        while any(1 in row for row in grid):\n            changed = []\n            for r in range(rows):\n                for c in range(cols):\n                    if grid[r][c] == 1 and any(0 <= r+dr < rows and 0 <= c+dc < cols and grid[r+dr][c+dc] == 2 for dr,dc in ((1,0),(-1,0),(0,1),(0,-1))): changed.append((r,c))\n            if not changed: return -1\n            for r,c in changed: grid[r][c] = 2\n            minutes += 1\n        return minutes\n",
      "time": "O((R · C)²)",
      "space": "O(R · C)",
      "optimal": false
    }
  },
  "417": {
    "followUps": [
      "Why can reversing the flow direction let two searches replace one search per cell?"
    ],
    "reference": {
      "title": "Flood from the border",
      "explanation": "Checking every cell's downhill paths repeats work. Reverse it: ==start from each ocean's border and climb uphill== (to neighbours of equal or greater height). That marks every cell that can drain into that ocean. ==The answer is the cells in both sets==.",
      "time": "O(rows · cols)",
      "space": "O(rows · cols)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Flow downhill from each cell",
      "explanation": "For each starting cell, search downhill and check whether its reachable region touches both oceans.",
      "code": "class Solution:\n    def pacificAtlantic(self, heights: List[List[int]]) -> List[List[int]]:\n        rows, cols = len(heights), len(heights[0])\n        answer = []\n        for r in range(rows):\n            for c in range(cols):\n                stack, seen = [(r,c)], {(r,c)}\n                pacific = atlantic = False\n                while stack:\n                    x,y = stack.pop()\n                    pacific |= x == 0 or y == 0\n                    atlantic |= x == rows-1 or y == cols-1\n                    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):\n                        a,b = x+dx,y+dy\n                        if 0 <= a < rows and 0 <= b < cols and (a,b) not in seen and heights[a][b] <= heights[x][y]:\n                            seen.add((a,b)); stack.append((a,b))\n                if pacific and atlantic: answer.append([r,c])\n        return answer\n",
      "time": "O((R · C)²)",
      "space": "O(R · C)",
      "optimal": false
    }
  },
  "130": {
    "followUps": [
      "How would an eight-neighbor definition of connectivity affect both enclosure and border reachability?"
    ],
    "reference": {
      "title": "Flood from the border",
      "explanation": "An `O` region survives exactly when ==it touches the border==. So DFS from every border `O` and ==tag what it reaches as safe== (`T`). Then one pass: remaining `O` cells are surrounded → `X`; `T` cells go back to `O`.",
      "time": "O(rows · cols)",
      "space": "O(rows · cols)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Classify each open component",
      "explanation": "Collect an entire open-cell component, note whether it reaches a border, and flip only enclosed components.",
      "code": "class Solution:\n    def solve(self, board: List[List[str]]) -> None:\n        rows, cols = len(board), len(board[0])\n        seen = set()\n        for r in range(rows):\n            for c in range(cols):\n                if board[r][c] != 'O' or (r,c) in seen: continue\n                stack, component = [(r,c)], []; seen.add((r,c)); border = False\n                while stack:\n                    x,y = stack.pop(); component.append((x,y))\n                    border |= x in (0,rows-1) or y in (0,cols-1)\n                    for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):\n                        a,b = x+dx,y+dy\n                        if 0 <= a < rows and 0 <= b < cols and board[a][b] == 'O' and (a,b) not in seen:\n                            seen.add((a,b)); stack.append((a,b))\n                if not border:\n                    for x,y in component: board[x][y] = 'X'\n",
      "time": "O(R · C)",
      "space": "O(R · C)",
      "optimal": false
    }
  },
  "207": {
    "followUps": [
      "How would you return a concrete dependency cycle to explain why a schedule is impossible?"
    ],
    "reference": {
      "title": "Topological sort (Kahn's)",
      "explanation": "Draw an edge `b → a`. You can finish everything ==unless the prerequisites form a cycle==. Kahn's algorithm: repeatedly take a course with ==no remaining prerequisites (in-degree 0)== and remove its edges. If you can't take all n, the leftovers are stuck in a cycle.",
      "time": "O(V + E)",
      "space": "O(V + E)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Memoized dependency DFS",
      "explanation": "Mark a course while it is on the recursion path; meeting a marked course proves a dependency cycle. Completed courses can be reused.",
      "code": "class Solution:\n    def canFinish(self, numCourses: int, prerequisites: List[List[int]]) -> bool:\n        graph = [[] for _ in range(numCourses)]\n        for course, prerequisite in prerequisites: graph[course].append(prerequisite)\n        state = [0]*numCourses\n        def visit(course):\n            if state[course] == 1: return False\n            if state[course] == 2: return True\n            state[course] = 1\n            if not all(visit(p) for p in graph[course]): return False\n            state[course] = 2\n            return True\n        return all(visit(c) for c in range(numCourses))\n",
      "time": "O(V + E)",
      "space": "O(V + E)",
      "optimal": false
    }
  },
  "210": {
    "followUps": [
      "How could you choose the lexicographically smallest valid course order instead?"
    ],
    "reference": {
      "title": "Topological sort (Kahn's)",
      "explanation": "Exactly Course Schedule, but ==record the order you pop courses from the queue==. A course only enters the queue once all its prerequisites are taken, so that order is valid. ==If the order is shorter than n, there's a cycle== → return `[]`.",
      "time": "O(V + E)",
      "space": "O(V + E)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Dependency-first DFS order",
      "explanation": "After recursively scheduling a course’s prerequisites, append the course; a recursion-path cycle invalidates the whole order.",
      "code": "class Solution:\n    def findOrder(self, numCourses: int, prerequisites: List[List[int]]) -> List[int]:\n        graph = [[] for _ in range(numCourses)]\n        for course, prerequisite in prerequisites: graph[course].append(prerequisite)\n        state, order = [0]*numCourses, []\n        def visit(course):\n            if state[course] == 1: return False\n            if state[course] == 2: return True\n            state[course] = 1\n            for prerequisite in graph[course]:\n                if not visit(prerequisite): return False\n            state[course] = 2; order.append(course)\n            return True\n        return order if all(visit(c) for c in range(numCourses)) else []\n",
      "time": "O(V + E)",
      "space": "O(V + E)",
      "optimal": false
    }
  },
  "261": {
    "followUps": [
      "Which part of this argument changes for a directed graph?"
    ],
    "reference": {
      "title": "Union-find",
      "explanation": "A tree on n nodes has ==exactly n − 1 edges and no cycle== (those two together also force it to be connected). Check the count first, then union-find each edge: ==if both ends already share a root, the edge closes a cycle==.",
      "time": "O(n · α(n))",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Connectivity plus edge count",
      "explanation": "An undirected graph is a tree exactly when it is connected and has n−1 edges.",
      "code": "class Solution:\n    def validTree(self, n: int, edges: List[List[int]]) -> bool:\n        if len(edges) != n-1: return False\n        graph = [[] for _ in range(n)]\n        for a,b in edges: graph[a].append(b); graph[b].append(a)\n        seen, stack = {0}, [0]\n        while stack:\n            for neighbor in graph[stack.pop()]:\n                if neighbor not in seen: seen.add(neighbor); stack.append(neighbor)\n        return len(seen) == n\n",
      "time": "O(V + E)",
      "space": "O(V + E)",
      "optimal": false
    }
  },
  "323": {
    "followUps": [
      "How would union-find help if edges were added between connectivity queries?"
    ],
    "reference": {
      "title": "Union-find",
      "explanation": "Start with ==n components, one per node==. Each edge that ==joins two different roots merges two components==, so subtract 1. Edges inside a component (same root) change nothing.",
      "time": "O(n + E · α(n))",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Count DFS components",
      "explanation": "Every unseen vertex starts a new connected-component traversal.",
      "code": "class Solution:\n    def countComponents(self, n: int, edges: List[List[int]]) -> int:\n        graph = [[] for _ in range(n)]\n        for a,b in edges: graph[a].append(b); graph[b].append(a)\n        seen, count = set(), 0\n        for start in range(n):\n            if start in seen: continue\n            count += 1; stack = [start]; seen.add(start)\n            while stack:\n                for neighbor in graph[stack.pop()]:\n                    if neighbor not in seen: seen.add(neighbor); stack.append(neighbor)\n        return count\n",
      "time": "O(V + E)",
      "space": "O(V + E)",
      "optimal": false
    }
  },
  "684": {
    "followUps": [
      "What information would you need to support removing edges as well as adding them?"
    ],
    "reference": {
      "title": "Union-find",
      "explanation": "Add edges one at a time with union-find. ==The first edge whose ends already share a root== is the one that closes the cycle. Every earlier edge was needed to connect those nodes, so ==this edge is the last cycle edge in the input==: return it.",
      "time": "O(n · α(n))",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Test connectivity before each edge",
      "explanation": "Before adding an edge, search the graph built so far; if its endpoints already connect, that edge closes the cycle.",
      "code": "class Solution:\n    def findRedundantConnection(self, edges: List[List[int]]) -> List[int]:\n        graph = defaultdict(list)\n        for a,b in edges:\n            seen, stack = {a}, [a]\n            while stack:\n                for neighbor in graph[stack.pop()]:\n                    if neighbor not in seen: seen.add(neighbor); stack.append(neighbor)\n            if b in seen: return [a,b]\n            graph[a].append(b); graph[b].append(a)\n        return []\n",
      "time": "O(E · (V + E))",
      "space": "O(V + E)",
      "optimal": false
    }
  },
  "127": {
    "followUps": [
      "How can wildcard-pattern buckets avoid comparing every pair of words?"
    ],
    "reference": {
      "title": "BFS by layers (shortest steps)",
      "explanation": "Words are nodes and words one letter apart are neighbours, so ==the shortest chain is a BFS==. Don't compare every pair: for each word ==try all 26 letters in each position== and keep the results that are in the word set and unvisited. The layer where you pop `endWord` is the answer.",
      "time": "O(N · L² · 26)",
      "space": "O(N · L)"
    },
    "alternative": {
      "id": "alternative",
      "title": "BFS with dictionary scans",
      "explanation": "For each frontier word, scan unvisited dictionary words and enqueue those differing in exactly one position.",
      "code": "class Solution:\n    def ladderLength(self, beginWord: str, endWord: str, wordList: List[str]) -> int:\n        remaining = set(wordList)\n        if endWord not in remaining: return 0\n        queue = deque([(beginWord,1)]); remaining.discard(beginWord)\n        while queue:\n            word, distance = queue.popleft()\n            if word == endWord: return distance\n            neighbors = [candidate for candidate in remaining if sum(a != b for a,b in zip(word,candidate)) == 1]\n            for candidate in neighbors:\n                remaining.remove(candidate); queue.append((candidate,distance+1))\n        return 0\n",
      "time": "O(N² · L)",
      "space": "O(N · L)",
      "optimal": false
    }
  },
  "773": {
    "followUps": [
      "What parity test could rule out impossible boards before searching?"
    ],
    "reference": {
      "title": "BFS by layers (shortest steps)",
      "explanation": "There is no real graph: ==each whole board is a node== and each legal swap is an edge. Fewest moves = shortest path, so ==BFS over board states==. Flatten the board to a string like `\"123405\"` so it can sit in `seen`, and precompute which flat positions touch each position of the `0`. Only 6! = 720 boards exist, so BFS is tiny.",
      "time": "O((mn)! · mn)",
      "space": "O((mn)!)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Bidirectional breadth-first search",
      "explanation": "Expand the smaller of the start and goal frontiers, tracking exact distances from both ends. S is the reachable state count and B the board cell count.",
      "code": "class Solution:\n    def slidingPuzzle(self, board: List[List[int]]) -> int:\n        start = tuple(value for row in board for value in row)\n        goal = (1,2,3,4,5,0)\n        links = ((1,3),(0,2,4),(1,5),(0,4),(1,3,5),(2,4))\n        a,b = {start:0},{goal:0}\n        front,back = {start},{goal}\n        while front and back:\n            if len(front) > len(back): front,back,a,b = back,front,b,a\n            next_front = set()\n            for state in front:\n                if state in b: return a[state]+b[state]\n                zero = state.index(0)\n                for neighbor in links[zero]:\n                    values = list(state); values[zero],values[neighbor] = values[neighbor],values[zero]\n                    key = tuple(values)\n                    if key not in a:\n                        a[key] = a[state]+1; next_front.add(key)\n            front = next_front\n        return -1\n",
      "time": "O(S · B)",
      "space": "O(S)",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
