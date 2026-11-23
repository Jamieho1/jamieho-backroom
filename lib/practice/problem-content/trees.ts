/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "226": {
    "followUps": [
      "What changes if the tree nodes are immutable and you must build a separate mirrored tree?"
    ],
    "reference": {
      "title": "Recursive DFS",
      "explanation": "Mirroring a tree = ==swap the two children at every node==. If each subtree is already mirrored by the recursive call, the current node only has to swap its two (mirrored) children. An empty tree mirrors to itself.",
      "time": "O(n)",
      "space": "O(h)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Queue-based inversion",
      "explanation": "Swap each node’s children while visiting the tree breadth-first; w is the widest level.",
      "code": "class Solution:\n    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:\n        queue = deque([root] if root else [])\n        while queue:\n            node = queue.popleft()\n            node.left, node.right = node.right, node.left\n            if node.left: queue.append(node.left)\n            if node.right: queue.append(node.right)\n        return root\n",
      "time": "O(n)",
      "space": "O(w)",
      "optimal": false
    }
  },
  "104": {
    "followUps": [
      "How would you compute minimum depth instead, and why can a missing child not count as a leaf?"
    ],
    "reference": {
      "title": "Recursive DFS",
      "explanation": "The depth of a tree is ==1 (this node) + the deeper of its two subtrees==. An empty tree has depth 0, which stops the recursion. Each node is asked once, so it's O(n).",
      "time": "O(n)",
      "space": "O(h)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Count breadth-first levels",
      "explanation": "Process one queue layer at a time; the number of layers is the maximum depth.",
      "code": "class Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        queue = deque([root] if root else [])\n        depth = 0\n        while queue:\n            depth += 1\n            for _ in range(len(queue)):\n                node = queue.popleft()\n                if node.left: queue.append(node.left)\n                if node.right: queue.append(node.right)\n        return depth\n",
      "time": "O(n)",
      "space": "O(w)",
      "optimal": false
    }
  },
  "543": {
    "followUps": [
      "Why can returning height and updating a shared best diameter eliminate repeated subtree scans?"
    ],
    "reference": {
      "title": "Return one thing, track another",
      "explanation": "Any path has one highest node where it bends. Through that node, the longest path is ==left height + right height==. So compute heights bottom-up, and at every node ==update a global `best`== with `left + right`, while returning `1 + max(left, right)` to the parent.",
      "time": "O(n)",
      "space": "O(h)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Recompute subtree heights",
      "explanation": "At every node, compute both subtree heights and compare the path through that node with the best paths below it.",
      "code": "class Solution:\n    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:\n        def height(node):\n            return 0 if node is None else 1+max(height(node.left), height(node.right))\n        def diameter(node):\n            if not node: return 0\n            return max(height(node.left)+height(node.right), diameter(node.left), diameter(node.right))\n        return diameter(root)\n",
      "time": "O(n²)",
      "space": "O(h)",
      "optimal": false
    }
  },
  "110": {
    "followUps": [
      "What sentinel could carry an imbalance upwards without traversing the same subtree again?"
    ],
    "reference": {
      "title": "Return one thing, track another",
      "explanation": "Checking heights from the top re-measures the same subtrees again and again (O(n²)). Instead compute heights bottom-up once and ==return -1 as a \"already unbalanced\" signal==. As soon as a node sees -1 from a child, or children whose heights differ by more than 1, it passes -1 up.",
      "time": "O(n)",
      "space": "O(h)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Separate balance and height checks",
      "explanation": "Compute heights from scratch at each node and recursively require both subtrees to be balanced.",
      "code": "class Solution:\n    def isBalanced(self, root: Optional[TreeNode]) -> bool:\n        def height(node):\n            return 0 if not node else 1+max(height(node.left), height(node.right))\n        def balanced(node):\n            return not node or (abs(height(node.left)-height(node.right)) <= 1 and balanced(node.left) and balanced(node.right))\n        return balanced(root)\n",
      "time": "O(n²)",
      "space": "O(h)",
      "optimal": false
    }
  },
  "100": {
    "followUps": [
      "Could two different trees have the same preorder list if null markers were omitted?"
    ],
    "reference": {
      "title": "Recursive DFS",
      "explanation": "Walk both trees in lockstep. Two empty trees match; ==one empty and one not, or different values, is a mismatch==. Otherwise the trees match exactly when the left pair matches and the right pair matches.",
      "time": "O(n)",
      "space": "O(h)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Queue of node pairs",
      "explanation": "Compare paired nodes breadth-first, including null positions so shape differences are preserved.",
      "code": "class Solution:\n    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:\n        queue = deque([(p, q)])\n        while queue:\n            a, b = queue.popleft()\n            if a is None or b is None:\n                if a is not b: return False\n                continue\n            if a.val != b.val: return False\n            queue.append((a.left, b.left)); queue.append((a.right, b.right))\n        return True\n",
      "time": "O(n)",
      "space": "O(w)",
      "optimal": false
    }
  },
  "572": {
    "followUps": [
      "Why are both value boundaries and null markers necessary when comparing serialized trees?"
    ],
    "reference": {
      "title": "Recursive DFS",
      "explanation": "It's Same Tree, tried at every node. ==Walk the big tree, and at each node ask \"is the tree rooted here the same as `subRoot`?\"==. The first yes answers the question; reaching `None` without a match means no.",
      "time": "O(m · n)",
      "space": "O(h)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Serialize with explicit structure",
      "explanation": "Encode node values with delimiters and null markers; a complete subtree then has an exact contiguous encoding.",
      "code": "class Solution:\n    def isSubtree(self, root: Optional[TreeNode], subRoot: Optional[TreeNode]) -> bool:\n        def encode(node):\n            if not node: return ['#']\n            return ['v'+str(node.val)] + encode(node.left) + encode(node.right)\n        return (','+','.join(encode(subRoot))+',') in (','+','.join(encode(root))+',')\n",
      "time": "O(m² + n² + mn) worst-case bound",
      "space": "O(m + n)",
      "optimal": false
    }
  },
  "235": {
    "followUps": [
      "How would you find the ancestor if this were an ordinary binary tree rather than a BST?"
    ],
    "reference": {
      "title": "Use the BST order",
      "explanation": "In a BST, if both values are smaller than the current node, both live in the left subtree; if both are larger, both are on the right. ==The first node where they split (or that equals one of them) is the answer==. No recursion needed: just walk down.",
      "time": "O(h)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Intersect root-to-node paths",
      "explanation": "Follow BST comparisons to build each target’s root path, then take their last shared node.",
      "code": "class Solution:\n    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':\n        def path(target):\n            nodes = []\n            current = root\n            while current:\n                nodes.append(current)\n                if current.val == target.val: break\n                current = current.left if target.val < current.val else current.right\n            return nodes\n        answer = None\n        for a, b in zip(path(p), path(q)):\n            if a is not b: break\n            answer = a\n        return answer\n",
      "time": "O(h)",
      "space": "O(h)",
      "optimal": false
    }
  },
  "102": {
    "followUps": [
      "How would you alternate the output direction at each level without changing the traversal?"
    ],
    "reference": {
      "title": "Level-order BFS",
      "explanation": "A queue visits nodes in the order they were found, which is level by level. The trick is ==snapshot `len(q)` at the start of each round==: exactly that many nodes belong to the current level; their children (added during the round) are the next level.",
      "time": "O(n)",
      "space": "O(w)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Depth-first level buckets",
      "explanation": "A preorder walk appends each value to the bucket for its depth, visiting left children first.",
      "code": "class Solution:\n    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:\n        levels = []\n        def visit(node, depth):\n            if not node: return\n            if depth == len(levels): levels.append([])\n            levels[depth].append(node.val)\n            visit(node.left, depth+1); visit(node.right, depth+1)\n        visit(root, 0)\n        return levels\n",
      "time": "O(n)",
      "space": "O(h) auxiliary; O(n) output",
      "optimal": false
    }
  },
  "199": {
    "followUps": [
      "How would you compute the left-side view using the same invariant?"
    ],
    "reference": {
      "title": "Level-order BFS",
      "explanation": "From the right you see ==the last node of each level==. Run level-order BFS (left child before right) and, after each round, record the last node you popped. A deep left node still shows if nothing on its level is to its right.",
      "time": "O(n)",
      "space": "O(w)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Right-first depth-first search",
      "explanation": "Visit the right subtree first and record the first node encountered at each depth.",
      "code": "class Solution:\n    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:\n        answer = []\n        def visit(node, depth):\n            if not node: return\n            if depth == len(answer): answer.append(node.val)\n            visit(node.right, depth+1); visit(node.left, depth+1)\n        visit(root, 0)\n        return answer\n",
      "time": "O(n)",
      "space": "O(h) auxiliary; O(h) output",
      "optimal": false
    }
  },
  "1448": {
    "followUps": [
      "How would you count nodes that are strictly larger than all earlier values on their path?"
    ],
    "reference": {
      "title": "Pass state down",
      "explanation": "A node is \"good\" if it's ==`>=` the largest value seen on the way down==. So pass that running max into each call. The node compares itself, updates the max, and hands the new max to both children.",
      "time": "O(n)",
      "space": "O(h)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Iterative path maxima",
      "explanation": "Carry the largest value on each root path in an explicit stack and count nodes meeting it.",
      "code": "class Solution:\n    def goodNodes(self, root: TreeNode) -> int:\n        stack = [(root, float('-inf'))] if root else []\n        answer = 0\n        while stack:\n            node, maximum = stack.pop()\n            if node.val >= maximum: answer += 1\n            maximum = max(maximum, node.val)\n            if node.right: stack.append((node.right, maximum))\n            if node.left: stack.append((node.left, maximum))\n        return answer\n",
      "time": "O(n)",
      "space": "O(h)",
      "optimal": false
    }
  },
  "98": {
    "followUps": [
      "How would the rule change if equal keys were allowed only in right subtrees?"
    ],
    "reference": {
      "title": "Pass state down",
      "explanation": "Checking only a node against its own children misses deeper violations. Each node must fit ==inside a range `(low, high)` inherited from all its ancestors==. Going left tightens `high` to the parent's value; going right tightens `low`.",
      "time": "O(n)",
      "space": "O(h)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Inorder monotonicity",
      "explanation": "An inorder traversal of a valid BST is strictly increasing; reject equality as well as descending values.",
      "code": "class Solution:\n    def isValidBST(self, root: Optional[TreeNode]) -> bool:\n        stack = []\n        previous = float('-inf')\n        while root or stack:\n            while root:\n                stack.append(root); root = root.left\n            root = stack.pop()\n            if root.val <= previous: return False\n            previous = root.val\n            root = root.right\n        return True\n",
      "time": "O(n)",
      "space": "O(h)",
      "optimal": false
    }
  },
  "230": {
    "followUps": [
      "What subtree metadata would support repeated kth-smallest queries after insertions and deletions?"
    ],
    "reference": {
      "title": "Use the BST order",
      "explanation": "An ==in-order walk (left, node, right) of a BST visits values in sorted order==. Do it iteratively with a stack and ==stop on the k-th pop==, so you never touch the rest of the tree.",
      "time": "O(h + k)",
      "space": "O(h)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Materialize inorder values",
      "explanation": "Build the complete sorted inorder sequence and index its kth element.",
      "code": "class Solution:\n    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:\n        values = []\n        def visit(node):\n            if node:\n                visit(node.left); values.append(node.val); visit(node.right)\n        visit(root)\n        return values[k-1]\n",
      "time": "O(n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "105": {
    "followUps": [
      "How do an inorder index map and index ranges remove repeated searches and copies?"
    ],
    "reference": {
      "title": "Build / encode a tree",
      "explanation": "Preorder lists ==each root before its subtrees==, so reading it left to right hands you the next root. That root's position in inorder ==splits inorder into its left and right subtrees==. A value → index map makes the split O(1).",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Recursive array slices",
      "explanation": "Find each preorder root in inorder, then construct left/right subtrees from sliced traversal ranges.",
      "code": "class Solution:\n    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:\n        if not preorder: return None\n        root = TreeNode(preorder[0])\n        mid = inorder.index(root.val)\n        root.left = self.buildTree(preorder[1:mid+1], inorder[:mid])\n        root.right = self.buildTree(preorder[mid+1:], inorder[mid+1:])\n        return root\n",
      "time": "O(n²)",
      "space": "O(n²) worst-case temporary slices",
      "optimal": false
    }
  },
  "124": {
    "followUps": [
      "Why may a path use both children when updating the best answer, but only one child when returning a gain to a parent?"
    ],
    "reference": {
      "title": "Return one thing, track another",
      "explanation": "Same shape as Diameter, with sums. Each node returns its ==best single downward arm== (`val + max(left, right)`), because a parent can only extend one side. A path that ==bends at this node== is `val + left + right`; that updates the global `best`. Clamp negative arms to 0: dropping them beats adding them.",
      "time": "O(n)",
      "space": "O(h)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Enumerate paths in an undirected tree",
      "explanation": "Build parent/child adjacency, start a path from every node, and extend without revisiting the preceding node.",
      "code": "class Solution:\n    def maxPathSum(self, root: Optional[TreeNode]) -> int:\n        if not root: return 0\n        adj = defaultdict(list)\n        stack = [root]\n        while stack:\n            node = stack.pop()\n            adj[node]\n            for child in (node.left, node.right):\n                if child:\n                    adj[node].append(child); adj[child].append(node); stack.append(child)\n        best = float('-inf')\n        for start in adj:\n            stack = [(start, None, 0)]\n            while stack:\n                node, parent, total = stack.pop()\n                total += node.val\n                best = max(best, total)\n                for neighbor in adj[node]:\n                    if neighbor is not parent: stack.append((neighbor, node, total))\n        return best\n",
      "time": "O(n²)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "297": {
    "followUps": [
      "What information would you need to deserialize a BST without storing null markers?"
    ],
    "reference": {
      "title": "Build / encode a tree",
      "explanation": "Preorder alone is ambiguous, but ==preorder with an explicit marker `N` for every missing child== is not: when rebuilding, each `N` tells you exactly where a subtree ends. Deserialize by reading tokens in the same order the serializer wrote them.",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Breadth-first JSON encoding",
      "explanation": "Serialize level-order values with null placeholders and reconstruct the same child positions with a queue.",
      "code": "class Codec:\n    def serialize(self, root):\n        import json\n        values, queue = [], deque([root])\n        while queue:\n            node = queue.popleft()\n            values.append(node.val if node else None)\n            if node: queue.extend((node.left, node.right))\n        return json.dumps(values)\n    def deserialize(self, data):\n        import json\n        values = json.loads(data)\n        if not values or values[0] is None: return None\n        root = TreeNode(values[0])\n        queue, index = deque([root]), 1\n        while queue and index < len(values):\n            node = queue.popleft()\n            for side in ('left', 'right'):\n                if index >= len(values): break\n                value = values[index]; index += 1\n                if value is not None:\n                    child = TreeNode(value); setattr(node, side, child); queue.append(child)\n        return root\n",
      "time": "O(n)",
      "space": "O(n)",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
