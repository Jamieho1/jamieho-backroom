/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "743": {
    "followUps": [
      "Why does Dijkstra need nonnegative edge weights while this relaxation scheme can handle negative edges?"
    ],
    "reference": {
      "title": "Dijkstra (min-heap)",
      "explanation": "The time for the last node is ==the largest shortest-path distance== from `k`. With non-negative weights, Dijkstra finds them: ==always pop the closest unfinished node from a min-heap==. Nothing can later reach it more cheaply, so its distance is final.",
      "time": "O(E log E)",
      "space": "O(V + E)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Bellman–Ford relaxation",
      "explanation": "Relax every edge up to V−1 times so paths can gain one more edge each round.",
      "code": "class Solution:\n    def networkDelayTime(self, times: List[List[int]], n: int, k: int) -> int:\n        distance = [float('inf')]*(n+1); distance[k] = 0\n        for _ in range(n-1):\n            changed = False\n            for u,v,w in times:\n                if distance[u]+w < distance[v]: distance[v] = distance[u]+w; changed = True\n            if not changed: break\n        answer = max(distance[1:])\n        return -1 if answer == float('inf') else answer\n",
      "time": "O(V · E)",
      "space": "O(V)",
      "optimal": false
    }
  },
  "332": {
    "followUps": [
      "What Euler-trail invariant lets you consume tickets without exploring every possible route?"
    ],
    "reference": {
      "title": "Eulerian path (Hierholzer)",
      "explanation": "Using every ticket once is an ==Eulerian path==. Greedily taking the smallest airport can walk into a dead end too early. Hierholzer fixes that: DFS with a stack, and ==only add an airport to the route when it has no tickets left==. Dead ends land in the route first, so the reversed route is a valid trip.",
      "time": "O(E log E)",
      "space": "O(E)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Lexicographic backtracking",
      "explanation": "Try unused outgoing tickets in lexical order and stop at the first route that uses every ticket. This is a small-input baseline.",
      "code": "class Solution:\n    def findItinerary(self, tickets: List[List[str]]) -> List[str]:\n        graph = defaultdict(list)\n        for index,(a,b) in enumerate(tickets): graph[a].append((b,index))\n        for options in graph.values(): options.sort()\n        used, path = set(), ['JFK']\n        def visit(city):\n            if len(used) == len(tickets): return True\n            for destination,index in graph[city]:\n                if index in used: continue\n                used.add(index); path.append(destination)\n                if visit(destination): return True\n                path.pop(); used.remove(index)\n            return False\n        visit('JFK')\n        return path\n",
      "time": "O(E! · E)",
      "space": "O(E)",
      "optimal": false
    }
  },
  "1584": {
    "followUps": [
      "Why can the dense implementation avoid storing all pairwise edges?"
    ],
    "reference": {
      "title": "Minimum spanning tree (Prim)",
      "explanation": "Connecting everything as cheaply as possible is a ==minimum spanning tree==. Prim grows one tree: ==always add the cheapest edge that reaches a point not yet in the tree==. Every pair is an edge here, so just push all distances from each newly added point.",
      "time": "O(n² log n)",
      "space": "O(n²)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Dense Prim frontier",
      "explanation": "Keep the cheapest connection from the built tree to each unvisited point, selecting the next cheapest point by a linear scan.",
      "code": "class Solution:\n    def minCostConnectPoints(self, points: List[List[int]]) -> int:\n        n = len(points)\n        best, used = [float('inf')]*n, [False]*n\n        best[0] = 0\n        answer = 0\n        for _ in range(n):\n            current = min((i for i in range(n) if not used[i]), key=lambda i: best[i])\n            used[current] = True; answer += best[current]\n            x,y = points[current]\n            for i,(a,b) in enumerate(points):\n                if not used[i]: best[i] = min(best[i], abs(x-a)+abs(y-b))\n        return answer\n",
      "time": "O(n²)",
      "space": "O(n)",
      "optimal": true
    }
  },
  "778": {
    "followUps": [
      "Why is reachability monotone as the water level rises?"
    ],
    "reference": {
      "title": "Dijkstra (min-heap)",
      "explanation": "A path's cost is ==its highest cell==, not the sum. Dijkstra still works if the heap key is the ==max height seen so far==: pop the lowest one, step to neighbours with `max(t, height)`. The first time you pop the bottom-right corner, that `t` is the answer.",
      "time": "O(n² log n)",
      "space": "O(n²)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Binary search a flood level",
      "explanation": "For each trial water level, test whether reachable flooded cells connect the two corners. H is the elevation range.",
      "code": "class Solution:\n    def swimInWater(self, grid: List[List[int]]) -> int:\n        n = len(grid)\n        def reachable(level):\n            if grid[0][0] > level: return False\n            stack, seen = [(0,0)], {(0,0)}\n            while stack:\n                r,c = stack.pop()\n                if (r,c) == (n-1,n-1): return True\n                for dr,dc in ((1,0),(-1,0),(0,1),(0,-1)):\n                    a,b = r+dr,c+dc\n                    if 0 <= a < n and 0 <= b < n and (a,b) not in seen and grid[a][b] <= level:\n                        seen.add((a,b)); stack.append((a,b))\n            return False\n        left, right = max(grid[0][0],grid[-1][-1]), max(map(max,grid))\n        while left < right:\n            mid = (left+right)//2\n            if reachable(mid): right = mid\n            else: left = mid+1\n        return left\n",
      "time": "O(n² log H)",
      "space": "O(n²)",
      "optimal": false
    }
  },
  "269": {
    "followUps": [
      "How would you tell whether the inferred letter order is unique?"
    ],
    "reference": {
      "title": "Topological sort from rules",
      "explanation": "Two neighbouring words only tell you one thing: ==their first differing letter== says which letter comes first. Those facts are edges, and any order that respects them is a ==topological sort==. If a longer word comes before its own prefix, or the edges form a cycle, no order exists.",
      "time": "O(C)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Lexically ordered Kahn traversal",
      "explanation": "Build first-difference rules, reject reversed prefixes, then use a min-heap of letters with no unmet prerequisite. A is the alphabet size.",
      "code": "class Solution:\n    def alienOrder(self, words: List[str]) -> str:\n        letters = set(''.join(words))\n        graph = {letter:set() for letter in letters}\n        indegree = dict.fromkeys(letters,0)\n        for a,b in zip(words,words[1:]):\n            for x,y in zip(a,b):\n                if x != y:\n                    if y not in graph[x]: graph[x].add(y); indegree[y] += 1\n                    break\n            else:\n                if len(a) > len(b): return ''\n        heap = [letter for letter in letters if indegree[letter] == 0]; heapify(heap)\n        answer = []\n        while heap:\n            letter = heappop(heap); answer.append(letter)\n            for neighbor in graph[letter]:\n                indegree[neighbor] -= 1\n                if indegree[neighbor] == 0: heappush(heap,neighbor)\n        return ''.join(answer) if len(answer) == len(letters) else ''\n",
      "time": "O(C + E + A log A)",
      "space": "O(A + E)",
      "optimal": false
    }
  },
  "787": {
    "followUps": [
      "Why can a single cheapest-distance value per city discard a route that still has more stops available?"
    ],
    "reference": {
      "title": "Bellman-Ford (limited edges)",
      "explanation": "At most `k` stops means ==at most `k + 1` flights==. Bellman-Ford's round `i` gives the cheapest price using at most `i` edges, so run exactly `k + 1` rounds. Each round ==reads last round's prices and writes into a copy==, so one round can't chain two new flights.",
      "time": "O(k · (n + E))",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Memoized bounded route search",
      "explanation": "Cache the cheapest suffix cost for each city and remaining flight count; each step consumes one flight.",
      "code": "class Solution:\n    def findCheapestPrice(self, n: int, flights: List[List[int]], src: int, dst: int, k: int) -> int:\n        graph = defaultdict(list)\n        for a,b,price in flights: graph[a].append((b,price))\n        @lru_cache(None)\n        def best(city, left):\n            if city == dst: return 0\n            if left == 0: return float('inf')\n            return min((price+best(neighbor,left-1) for neighbor,price in graph[city]), default=float('inf'))\n        answer = best(src,k+1)\n        return -1 if answer == float('inf') else answer\n",
      "time": "O(k · (V + E))",
      "space": "O(k · V + E)",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
