/**
 * Arena problems: trees. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
 * - 226 Invert Binary Tree (Easy)
 * - 104 Maximum Depth of Binary Tree (Easy)
 * - 543 Diameter of Binary Tree (Easy)
 * - 110 Balanced Binary Tree (Easy)
 * - 100 Same Tree (Easy)
 * - 572 Subtree of Another Tree (Easy)
 * - 235 Lowest Common Ancestor of a Binary Search Tree (Medium)
 * - 102 Binary Tree Level Order Traversal (Medium)
 * - 199 Binary Tree Right Side View (Medium)
 * - 1448 Count Good Nodes in Binary Tree (Medium)
 * - 98 Validate Binary Search Tree (Medium)
 * - 230 Kth Smallest Element in a BST (Medium)
 * - 105 Construct Binary Tree from Preorder and Inorder Traversal (Medium)
 * - 124 Binary Tree Maximum Path Sum (Hard)
 * - 297 Serialize and Deserialize Binary Tree (Hard)
 */
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 226,
    kind: "algorithm",
    statement: `You are handed the root of a binary tree. Turn it into its **mirror image**: at every node, the left and right subtrees trade places. Return the root of the mirrored tree.

- Do this for every node, not only the root, so the whole tree is flipped left to right.
- Node values stay the same; only the child links change.
- An empty tree stays empty.

Trees are written in level order (row by row, left to right) with \`null\` marking a missing child.`,
    examples: [
      { input: "root = [6,2,9,1,4,7,11]", output: "[6,9,2,11,7,4,1]", explanation: "Each row reads backwards after the flip: [2,9] becomes [9,2] and [1,4,7,11] becomes [11,7,4,1]." },
      { input: "root = [3,null,8]", output: "[3,8]", explanation: "The single right child moves to the left side." },
      { input: "root = []", output: "[]" },
    ],
    constraints: ["The tree has between 0 and 100 nodes.", "-100 <= Node.val <= 100"],
    signature: `class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:`,
    method: "invertTree",
    driver: `def run(ns, args):
    return from_tree(ns["Solution"]().invertTree(to_tree(args[0])))
`,
    tests: [
      { id: "ex1", input: "[[6, 2, 9, 1, 4, 7, 11]]", expected: "[6, 9, 2, 11, 7, 4, 1]", visible: true },
      { id: "ex2", input: "[[3, None, 8]]", expected: "[3, 8]", visible: true },
      { id: "ex3", input: "[[]]", expected: "[]", visible: true },
      { id: "single", input: "[[5]]", expected: "[5]", visible: false },
      { id: "left-chain", input: "[[1, 2, None, 3, None, 4]]", expected: "[1, None, 2, None, 3, None, 4]", visible: false },
      { id: "negatives-dups", input: "[[0, -4, -4, -9, None, None, 2]]", expected: "[0, -4, -4, 2, None, None, -9]", visible: false },
      { id: "ragged", input: "[[1, 2, 3, 4, None, None, 5, 6]]", expected: "[1, 3, 2, 5, None, None, 4, None, None, None, 6]", visible: false },
      { id: "skewed-200", input: "[[1] + sum([[i, None] for i in range(2, 200)], []) + [200]]", expected: "sum([[i, None] for i in range(1, 200)], []) + [200]", visible: false },
      { id: "full-1023", input: "[list(range(1, 1024))]", expected: "sum([list(range(2 ** (d + 1) - 1, 2 ** d - 1, -1)) for d in range(10)], [])", visible: false },
    ],
    solution: `class Solution:
    def invertTree(self, root: Optional[TreeNode]) -> Optional[TreeNode]:
        if not root:
            return None
        root.left, root.right = self.invertTree(root.right), self.invertTree(root.left)
        return root`,
    hints: ["If you already had the mirrored versions of the two subtrees, what would you do with them at this node?", "Recursively mirror both children, then attach the mirrored right as the new left and vice versa. Empty input returns empty.", "A queue works too: pop a node, swap its two children, enqueue whichever are non-empty."],
    clarify: [
      { question: "Should I build a new tree or change the given one?", answer: "Either is accepted; changing the links in place and returning the same root is the usual approach." },
      { question: "What if the tree is empty?", answer: "Return an empty tree (None)." },
    ],
  },
  {
    lc: 104,
    kind: "algorithm",
    statement: `Given the root of a binary tree, return its **depth**: the number of nodes on the longest downward path that starts at the root and ends at a leaf (a node with no children).

- A tree with only a root has depth 1.
- An empty tree has depth 0.`,
    examples: [
      { input: "root = [8,3,10,null,null,9,14,null,null,12]", output: "4", explanation: "The longest root-to-leaf path is 8 → 10 → 14 → 12, which has 4 nodes." },
      { input: "root = [1,null,2]", output: "2" },
    ],
    constraints: ["The tree has between 0 and 10^4 nodes.", "-100 <= Node.val <= 100"],
    signature: `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:`,
    method: "maxDepth",
    driver: `def run(ns, args):
    return ns["Solution"]().maxDepth(to_tree(args[0]))
`,
    tests: [
      { id: "ex1", input: "[[8, 3, 10, None, None, 9, 14, None, None, 12]]", expected: "4", visible: true },
      { id: "ex2", input: "[[1, None, 2]]", expected: "2", visible: true },
      { id: "empty", input: "[[]]", expected: "0", visible: false },
      { id: "single", input: "[[7]]", expected: "1", visible: false },
      { id: "zigzag", input: "[[1, 2, None, None, 3, 4, None, None, 5]]", expected: "5", visible: false },
      { id: "negatives", input: "[[-1, -2, -3, -4, None, None, -5, -6]]", expected: "4", visible: false },
      { id: "right-200", input: "[sum([[i, None] for i in range(1, 200)], []) + [200]]", expected: "200", visible: false },
      { id: "left-250", input: "[[1] + sum([[i, None] for i in range(2, 250)], []) + [250]]", expected: "250", visible: false },
      { id: "full-1023", input: "[list(range(1, 1024))]", expected: "10", visible: false },
    ],
    solution: `class Solution:
    def maxDepth(self, root: Optional[TreeNode]) -> int:
        if not root:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))`,
    hints: ["How does the depth of a tree relate to the depths of its two subtrees?", "depth(node) = 1 + the larger of depth(left) and depth(right); an empty subtree contributes 0.", "Without recursion, a level-by-level BFS that counts rounds gives the same number."],
    clarify: [
      { question: "Do I count nodes or edges along the path?", answer: "Nodes. A single root has depth 1." },
      { question: "Can the tree be empty?", answer: "Yes, and its depth is 0." },
    ],
  },
  {
    lc: 543,
    kind: "algorithm",
    statement: `Given the root of a binary tree, return the length of its **diameter**: the longest path between any two nodes, measured in **edges**.

- A path moves along parent–child links and never visits a node twice.
- The longest path does not have to go through the root; it may sit entirely inside one subtree.
- A tree with a single node has diameter 0.`,
    examples: [
      { input: "root = [10,4,12,1,6,null,15]", output: "4", explanation: "1 → 4 → 10 → 12 → 15 uses 4 edges." },
      { input: "root = [2,7]", output: "1" },
    ],
    constraints: ["The tree has between 1 and 10^4 nodes.", "-100 <= Node.val <= 100"],
    signature: `class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:`,
    method: "diameterOfBinaryTree",
    driver: `def run(ns, args):
    return ns["Solution"]().diameterOfBinaryTree(to_tree(args[0]))
`,
    tests: [
      { id: "ex1", input: "[[10, 4, 12, 1, 6, None, 15]]", expected: "4", visible: true },
      { id: "ex2", input: "[[2, 7]]", expected: "1", visible: true },
      { id: "single", input: "[[5]]", expected: "0", visible: false },
      { id: "not-through-root", input: "[[1, 2, None, 3, 4, 5, None, None, 6, 7, None, None, 8]]", expected: "6", visible: false },
      { id: "v-shape", input: "[[0, 1, 2, 3, None, None, 4, 5, None, None, 6]]", expected: "6", visible: false },
      { id: "negatives", input: "[[-5, -3, -8, None, -1]]", expected: "3", visible: false },
      { id: "skewed-200", input: "[sum([[i, None] for i in range(1, 200)], []) + [200]]", expected: "199", visible: false },
      { id: "full-1023", input: "[list(range(1, 1024))]", expected: "18", visible: false },
    ],
    solution: `class Solution:
    def diameterOfBinaryTree(self, root: Optional[TreeNode]) -> int:
        best = 0

        def height(node):
            nonlocal best
            if not node:
                return 0
            l, r = height(node.left), height(node.right)
            best = max(best, l + r)
            return 1 + max(l, r)

        height(root)
        return best`,
    hints: ["Every path has one highest node where it turns. What is the longest path that turns at a given node?", "Through a node, the best path is (height of left subtree) + (height of right subtree) edges.", "Compute heights bottom-up once, and update a running maximum with left + right at every node while returning 1 + max(left, right)."],
    clarify: [
      { question: "Is the length counted in nodes or edges?", answer: "Edges, so a single node gives 0 and two connected nodes give 1." },
      { question: "Must the path include the root?", answer: "No, it can be anywhere in the tree." },
    ],
  },
  {
    lc: 110,
    kind: "algorithm",
    statement: `Given the root of a binary tree, decide whether it is **height-balanced**.

A tree is height-balanced when, **at every node**, the heights of the left and right subtrees differ by no more than 1. Return \`true\` if that holds everywhere and \`false\` otherwise.

- Height here means the number of nodes on the longest downward path; an empty subtree has height 0.
- Checking only the root is not enough: a single lopsided node anywhere makes the whole tree unbalanced.
- An empty tree counts as balanced.`,
    examples: [
      { input: "root = [5,3,8,1,4,null,9]", output: "true" },
      { input: "root = [5,3,null,1]", output: "false", explanation: "At node 5 the left subtree has height 2 and the right has height 0." },
      { input: "root = []", output: "true" },
    ],
    constraints: ["The tree has between 0 and 5000 nodes.", "-10^4 <= Node.val <= 10^4"],
    signature: `class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:`,
    method: "isBalanced",
    driver: `def run(ns, args):
    return ns["Solution"]().isBalanced(to_tree(args[0]))
`,
    tests: [
      { id: "ex1", input: "[[5, 3, 8, 1, 4, None, 9]]", expected: "True", visible: true },
      { id: "ex2", input: "[[5, 3, None, 1]]", expected: "False", visible: true },
      { id: "ex3", input: "[[]]", expected: "True", visible: true },
      { id: "single", input: "[[7]]", expected: "True", visible: false },
      { id: "root-ok-child-not", input: "[[1, 2, 3, 4, None, None, 5, 6, None, None, 7]]", expected: "False", visible: false },
      { id: "deep-but-even", input: "[[1, 2, 2, 3, None, None, 3, 4, None, None, 4]]", expected: "False", visible: false },
      { id: "diff-exactly-one", input: "[[0, -1, 1, -2, -3, 2, None, -4]]", expected: "True", visible: false },
      { id: "skewed-100", input: "[sum([[i, None] for i in range(1, 100)], []) + [100]]", expected: "False", visible: false },
      { id: "full-1023", input: "[list(range(1, 1024))]", expected: "True", visible: false },
      { id: "full-plus-tail", input: "[list(range(1, 1024)) + [None] * 1023 + [1024]]", expected: "True", visible: false },
    ],
    solution: `class Solution:
    def isBalanced(self, root: Optional[TreeNode]) -> bool:
        def height(node):  # -1 means "unbalanced somewhere below"
            if not node:
                return 0
            l = height(node.left)
            r = height(node.right)
            if l == -1 or r == -1 or abs(l - r) > 1:
                return -1
            return 1 + max(l, r)

        return height(root) != -1`,
    hints: ["Measuring heights separately for every node repeats a lot of work. Can one bottom-up pass give both height and balance?", "Have the helper return a node's height, or a sentinel such as -1 meaning a subtree below is already unbalanced.", "At each node: if either child reported -1, or their heights differ by more than 1, report -1; otherwise report 1 + max."],
    clarify: [
      { question: "Is it enough for the root's two subtrees to have similar heights?", answer: "No, the rule must hold at every node in the tree." },
      { question: "Is an empty tree balanced?", answer: "Yes." },
    ],
  },
  {
    lc: 100,
    kind: "algorithm",
    statement: `You are given the roots of two binary trees, \`p\` and \`q\`. Return \`true\` if they are **identical**, otherwise \`false\`.

Two trees are identical when they have exactly the same shape and every pair of nodes in matching positions holds the same value.

- A missing child on one side must also be missing on the other.
- Two empty trees are identical.`,
    examples: [
      { input: "p = [4,2,6], q = [4,2,6]", output: "true" },
      { input: "p = [4,2], q = [4,null,2]", output: "false", explanation: "In p the 2 is a left child; in q it is a right child." },
      { input: "p = [7,5,9], q = [7,5,8]", output: "false" },
    ],
    constraints: ["Each tree has between 0 and 100 nodes.", "-10^4 <= Node.val <= 10^4"],
    signature: `class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:`,
    method: "isSameTree",
    driver: `def run(ns, args):
    return ns["Solution"]().isSameTree(to_tree(args[0]), to_tree(args[1]))
`,
    tests: [
      { id: "ex1", input: "[[4, 2, 6], [4, 2, 6]]", expected: "True", visible: true },
      { id: "ex2", input: "[[4, 2], [4, None, 2]]", expected: "False", visible: true },
      { id: "ex3", input: "[[7, 5, 9], [7, 5, 8]]", expected: "False", visible: true },
      { id: "both-empty", input: "[[], []]", expected: "True", visible: false },
      { id: "one-empty", input: "[[], [0]]", expected: "False", visible: false },
      { id: "other-empty", input: "[[0], []]", expected: "False", visible: false },
      { id: "dups-shape", input: "[[1, 1, 1], [1, 1, None, 1]]", expected: "False", visible: false },
      { id: "negatives", input: "[[-1, -2, None, -3], [-1, -2, None, -3]]", expected: "True", visible: false },
      { id: "extra-leaf", input: "[[3, 1, 5], [3, 1, 5, None, None, None, 6]]", expected: "False", visible: false },
      { id: "full-same", input: "[list(range(1, 1024)), list(range(1, 1024))]", expected: "True", visible: false },
      { id: "full-last-differs", input: "[list(range(1, 1024)), list(range(1, 1023)) + [0]]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def isSameTree(self, p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
        if not p and not q:
            return True
        if not p or not q or p.val != q.val:
            return False
        return self.isSameTree(p.left, q.left) and self.isSameTree(p.right, q.right)`,
    hints: ["Walk both trees at the same time, comparing the nodes that sit in the same position.", "Two empty nodes match. One empty and one not, or two different values, is an immediate mismatch.", "Otherwise the trees match exactly when the left pair matches and the right pair matches."],
    clarify: [
      { question: "Do two empty trees count as the same?", answer: "Yes." },
      { question: "Is it enough for both trees to contain the same values?", answer: "No, shape matters too: values must match position by position." },
    ],
  },
  {
    lc: 572,
    kind: "algorithm",
    statement: `You are given the roots of two binary trees, \`root\` and \`subRoot\`. Return \`true\` if some node of \`root\`, **together with all of its descendants**, forms a tree identical to \`subRoot\` (same shape, same values). Otherwise return \`false\`.

- The match must include the chosen node's entire subtree: a node in \`root\` that has extra children below the matching part does not count.
- \`root\` itself is a valid candidate, so a tree is a subtree of itself.`,
    examples: [
      { input: "root = [8,5,9,2,6], subRoot = [5,2,6]", output: "true", explanation: "The node 5 with its children 2 and 6 matches subRoot exactly." },
      { input: "root = [8,5,9,2,6,null,null,null,null,1], subRoot = [5,2,6]", output: "false", explanation: "Node 6 has a child 1 that subRoot does not have, so the 5-subtree is not identical." },
    ],
    constraints: ["root has between 1 and 2000 nodes.", "subRoot has between 1 and 1000 nodes.", "-10^4 <= Node.val <= 10^4"],
    signature: `class Solution:
    def isSubtree(self, root: Optional[TreeNode], subRoot: Optional[TreeNode]) -> bool:`,
    method: "isSubtree",
    driver: `def run(ns, args):
    return ns["Solution"]().isSubtree(to_tree(args[0]), to_tree(args[1]))
`,
    tests: [
      { id: "ex1", input: "[[8, 5, 9, 2, 6], [5, 2, 6]]", expected: "True", visible: true },
      { id: "ex2", input: "[[8, 5, 9, 2, 6, None, None, None, None, 1], [5, 2, 6]]", expected: "False", visible: true },
      { id: "single-match", input: "[[3], [3]]", expected: "True", visible: false },
      { id: "single-miss", input: "[[3], [4]]", expected: "False", visible: false },
      { id: "whole-tree", input: "[[1, 2, 3, None, 4], [1, 2, 3, None, 4]]", expected: "True", visible: false },
      { id: "leaf-match", input: "[[1, 1], [1]]", expected: "True", visible: false },
      { id: "digit-trap", input: "[[12], [2]]", expected: "False", visible: false },
      { id: "dups-later-match", input: "[[4, 4, None, 4, None, 4, 5], [4, 4, 5]]", expected: "True", visible: false },
      { id: "negatives", input: "[[-1, -2, -3, None, None, -4, -5], [-3, -4, -5]]", expected: "True", visible: false },
      { id: "full-left-half", input: "[list(range(1, 1024)), sum([list(range(2 ** (d + 1), 2 ** (d + 1) + 2 ** d)) for d in range(9)], [])]", expected: "True", visible: false },
      { id: "full-cut-short", input: "[list(range(1, 1024)), sum([list(range(2 ** (d + 1), 2 ** (d + 1) + 2 ** d)) for d in range(8)], [])]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def isSubtree(self, root: Optional[TreeNode], subRoot: Optional[TreeNode]) -> bool:
        def same(a, b):
            if not a and not b:
                return True
            if not a or not b or a.val != b.val:
                return False
            return same(a.left, b.left) and same(a.right, b.right)

        def dfs(node):
            if not node:
                return False
            return same(node, subRoot) or dfs(node.left) or dfs(node.right)

        return dfs(root)`,
    hints: ["If you could test whether two trees are identical, where would you try that test?", "Try the identical-tree check with subRoot at every node of root; any success means true.", "An O(m + n) alternative: serialise both trees with null markers and value delimiters, then look for one string inside the other."],
    clarify: [
      { question: "Does a node that matches but has extra descendants count?", answer: "No, the node's whole subtree must be identical to subRoot." },
      { question: "Can subRoot be the whole of root?", answer: "Yes, root counts as one of its own subtrees." },
    ],
  },
  {
    lc: 235,
    kind: "algorithm",
    statement: `You get the root of a **binary search tree** (every value in a node's left subtree is smaller than the node, every value in its right subtree is larger) and two nodes of that tree, \`p\` and \`q\`. Return their **lowest common ancestor**: the deepest node that has both \`p\` and \`q\` among its descendants.

- A node counts as a descendant of itself, so if \`p\` is an ancestor of \`q\`, the answer is \`p\`.
- All values are distinct, \`p\` and \`q\` are different nodes, and both are in the tree.
- Return the node itself (the tests read its value).

Inputs are shown as the tree in level order plus the values of \`p\` and \`q\`.`,
    examples: [
      { input: "root = [20,10,30,5,15,25,35], p = 5, q = 15", output: "10", explanation: "5 and 15 sit on opposite sides of 10." },
      { input: "root = [20,10,30,5,15,25,35], p = 15, q = 10", output: "10", explanation: "10 is an ancestor of 15, and a node is its own descendant." },
    ],
    constraints: ["The tree has between 2 and 10^5 nodes.", "-10^9 <= Node.val <= 10^9", "All values are unique.", "p != q, and both are in the tree."],
    signature: `class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':`,
    method: "lowestCommonAncestor",
    driver: `def run(ns, args):
    root = to_tree(args[0])

    def find(v):
        stack = [root]
        while stack:
            node = stack.pop()
            if node is None:
                continue
            if node.val == v:
                return node
            stack.append(node.left)
            stack.append(node.right)
        return None

    res = ns["Solution"]().lowestCommonAncestor(root, find(args[1]), find(args[2]))
    return res.val if res is not None else None
`,
    tests: [
      { id: "ex1", input: "[[20, 10, 30, 5, 15, 25, 35], 5, 15]", expected: "10", visible: true },
      { id: "ex2", input: "[[20, 10, 30, 5, 15, 25, 35], 15, 10]", expected: "10", visible: true },
      { id: "split-at-root", input: "[[20, 10, 30, 5, 15, 25, 35], 5, 35]", expected: "20", visible: false },
      { id: "two-nodes-left", input: "[[2, 1], 2, 1]", expected: "2", visible: false },
      { id: "two-nodes-right", input: "[[2, None, 3], 3, 2]", expected: "2", visible: false },
      { id: "negatives", input: "[[0, -8, 6, -10, -3, None, 9], -10, -3]", expected: "-8", visible: false },
      { id: "deep-split", input: "[[50, 20, 80, 10, 40, None, None, None, None, 30, 45, 25, 35], 25, 45]", expected: "40", visible: false },
      { id: "right-chain-200", input: "[sum([[i, None] for i in range(1, 200)], []) + [200], 60, 190]", expected: "60", visible: false },
      { id: "left-chain-200", input: "[[200] + sum([[i, None] for i in range(199, 1, -1)], []) + [1], 1, 100]", expected: "100", visible: false },
    ],
    solution: `class Solution:
    def lowestCommonAncestor(self, root: 'TreeNode', p: 'TreeNode', q: 'TreeNode') -> 'TreeNode':
        cur = root
        while cur:
            if p.val < cur.val and q.val < cur.val:
                cur = cur.left
            elif p.val > cur.val and q.val > cur.val:
                cur = cur.right
            else:
                return cur
        return None`,
    hints: ["Use the ordering: comparing p and q with the current node tells you which side each one is on.", "If both values are smaller, the answer is in the left subtree; if both are larger, it is in the right subtree.", "The first node where they split (or that equals one of them) is the answer. A simple loop is enough, no recursion needed."],
    clarify: [
      { question: "Can p be the ancestor of q?", answer: "Yes, and then p itself is the answer." },
      { question: "Are p and q guaranteed to be in the tree?", answer: "Yes, both exist and they are different nodes." },
    ],
  },
  {
    lc: 102,
    kind: "algorithm",
    statement: `Given the root of a binary tree, return its values **grouped by depth**: one list per level, starting with the root's level, and inside each level the values from left to right.

- Return a list of lists of integers.
- An empty tree gives an empty list.`,
    examples: [
      { input: "root = [6,2,9,1,4,7,11]", output: "[[6],[2,9],[1,4,7,11]]" },
      { input: "root = [1,null,2,null,3]", output: "[[1],[2],[3]]" },
      { input: "root = []", output: "[]" },
    ],
    constraints: ["The tree has between 0 and 2000 nodes.", "-1000 <= Node.val <= 1000"],
    signature: `class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:`,
    method: "levelOrder",
    driver: `def run(ns, args):
    return ns["Solution"]().levelOrder(to_tree(args[0]))
`,
    tests: [
      { id: "ex1", input: "[[6, 2, 9, 1, 4, 7, 11]]", expected: "[[6], [2, 9], [1, 4, 7, 11]]", visible: true },
      { id: "ex2", input: "[[1, None, 2, None, 3]]", expected: "[[1], [2], [3]]", visible: true },
      { id: "ex3", input: "[[]]", expected: "[]", visible: true },
      { id: "single", input: "[[5]]", expected: "[[5]]", visible: false },
      { id: "sparse", input: "[[1, 2, 3, None, 4, None, 5, 6, None, None, 7]]", expected: "[[1], [2, 3], [4, 5], [6, 7]]", visible: false },
      { id: "negatives-dups", input: "[[-1, -1, 0, -3, None, -3, 2]]", expected: "[[-1], [-1, 0], [-3, -3, 2]]", visible: false },
      { id: "right-chain-200", input: "[sum([[i, None] for i in range(1, 200)], []) + [200]]", expected: "[[i] for i in range(1, 201)]", visible: false },
      { id: "full-1023", input: "[list(range(1, 1024))]", expected: "[list(range(2 ** d, 2 ** (d + 1))) for d in range(10)]", visible: false },
    ],
    solution: `class Solution:
    def levelOrder(self, root: Optional[TreeNode]) -> List[List[int]]:
        if not root:
            return []
        res, q = [], deque([root])
        while q:
            level = []
            for _ in range(len(q)):
                node = q.popleft()
                level.append(node.val)
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(level)
        return res`,
    hints: ["A queue hands nodes back in the order they were discovered, which is level by level.", "At the start of each round, the queue holds exactly one full level. Record its size before popping.", "Pop that many nodes into the current level's list, pushing their children for the next round."],
    clarify: [
      { question: "Within a level, which order?", answer: "Left to right." },
      { question: "What does an empty tree return?", answer: "An empty list." },
    ],
  },
  {
    lc: 199,
    kind: "algorithm",
    statement: `Picture standing to the right of a binary tree and looking at it. On each level you can see only the **rightmost** node; everything else on that level is hidden behind it.

Given the root, return the values you can see, ordered from the top level to the bottom level.

- A node on the left side is visible if nothing else on its level lies to its right.
- An empty tree gives an empty list.`,
    examples: [
      { input: "root = [6,2,9,1,4,7]", output: "[6,9,7]" },
      { input: "root = [1,2,3,4]", output: "[1,3,4]", explanation: "Level 2 contains only 4, a left-side node, so it is visible." },
      { input: "root = []", output: "[]" },
    ],
    constraints: ["The tree has between 0 and 100 nodes.", "-100 <= Node.val <= 100"],
    signature: `class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:`,
    method: "rightSideView",
    driver: `def run(ns, args):
    return ns["Solution"]().rightSideView(to_tree(args[0]))
`,
    tests: [
      { id: "ex1", input: "[[6, 2, 9, 1, 4, 7]]", expected: "[6, 9, 7]", visible: true },
      { id: "ex2", input: "[[1, 2, 3, 4]]", expected: "[1, 3, 4]", visible: true },
      { id: "ex3", input: "[[]]", expected: "[]", visible: true },
      { id: "single", input: "[[8]]", expected: "[8]", visible: false },
      { id: "deep-left", input: "[[1, 2, 3, 4, None, None, None, 5]]", expected: "[1, 3, 4, 5]", visible: false },
      { id: "negatives", input: "[[-5, -6, -7, None, -8, -9]]", expected: "[-5, -7, -9]", visible: false },
      { id: "left-chain-150", input: "[[1] + sum([[i, None] for i in range(2, 150)], []) + [150]]", expected: "list(range(1, 151))", visible: false },
      { id: "full-1023", input: "[list(range(1, 1024))]", expected: "[1, 3, 7, 15, 31, 63, 127, 255, 511, 1023]", visible: false },
    ],
    solution: `class Solution:
    def rightSideView(self, root: Optional[TreeNode]) -> List[int]:
        if not root:
            return []
        res, q = [], deque([root])
        while q:
            for _ in range(len(q)):
                node = q.popleft()
                if node.left:
                    q.append(node.left)
                if node.right:
                    q.append(node.right)
            res.append(node.val)  # last node popped on this level
        return res`,
    hints: ["Which node of each level is the one you see?", "Do a level-by-level BFS (left child before right) and keep the last node of each level.", "Or a DFS that visits right before left: the first node you reach at each new depth is the visible one."],
    clarify: [
      { question: "If a level has only a left-side node, is it visible?", answer: "Yes, it is the rightmost node on its level." },
      { question: "What order should the result be in?", answer: "From the root's level downward." },
    ],
  },
  {
    lc: 1448,
    kind: "algorithm",
    statement: `Given the root of a binary tree, call a node **good** if no node on the path from the root down to it (including the root) holds a value **greater** than its own.

Return how many good nodes the tree has.

- Ties are fine: a node equal to the largest value above it is still good.
- The root is always good.`,
    examples: [
      { input: "root = [2,5,1,null,4,3,6]", output: "4", explanation: "2, 5, 3 and 6 are good. 4 is below 5, and 1 is below 2." },
      { input: "root = [-1]", output: "1" },
    ],
    constraints: ["The tree has between 1 and 10^5 nodes.", "-10^4 <= Node.val <= 10^4"],
    signature: `class Solution:
    def goodNodes(self, root: TreeNode) -> int:`,
    method: "goodNodes",
    driver: `def run(ns, args):
    return ns["Solution"]().goodNodes(to_tree(args[0]))
`,
    tests: [
      { id: "ex1", input: "[[2, 5, 1, None, 4, 3, 6]]", expected: "4", visible: true },
      { id: "ex2", input: "[[-1]]", expected: "1", visible: true },
      { id: "all-equal", input: "[[3, 3, 3, 3, 3]]", expected: "5", visible: false },
      { id: "negatives", input: "[[-5, -7, -2, -6, -8, None, -1]]", expected: "3", visible: false },
      { id: "dip-then-recover", input: "[[4, 1, None, 2, None, 4, None, 3, 5]]", expected: "3", visible: false },
      { id: "increasing-chain", input: "[[1] + sum([[i, None] for i in range(2, 200)], []) + [200]]", expected: "200", visible: false },
      { id: "decreasing-chain", input: "[[200] + sum([[i, None] for i in range(199, 1, -1)], []) + [1]]", expected: "1", visible: false },
      { id: "full-increasing", input: "[list(range(1, 1024))]", expected: "1023", visible: false },
      { id: "full-decreasing", input: "[list(range(1023, 0, -1))]", expected: "1", visible: false },
    ],
    solution: `class Solution:
    def goodNodes(self, root: TreeNode) -> int:
        def dfs(node, best):
            if not node:
                return 0
            good = 1 if node.val >= best else 0
            best = max(best, node.val)
            return good + dfs(node.left, best) + dfs(node.right, best)

        return dfs(root, root.val)`,
    hints: ["What does a node need to know about the path above it to decide whether it is good?", "Only the largest value seen so far on the path matters. Pass it down as you recurse.", "Count the node if its value is at least that maximum, update the maximum, and add the counts from both children."],
    clarify: [
      { question: "Does a node equal to the path maximum count?", answer: "Yes, only a strictly greater value above it disqualifies it." },
      { question: "Is the root good?", answer: "Always, since nothing is above it." },
    ],
  },
  {
    lc: 98,
    kind: "algorithm",
    statement: `Given the root of a binary tree, decide whether it is a valid **binary search tree**. That means, for every node:

- every value in its left subtree is **strictly less** than the node's value,
- every value in its right subtree is **strictly greater** than the node's value,
- and both subtrees are themselves valid binary search trees.

Return \`true\` or \`false\`. Note that the rule covers whole subtrees, not just direct children, and equal values are not allowed anywhere they would compare.`,
    examples: [
      { input: "root = [8,4,12,2,6,10,14]", output: "true" },
      { input: "root = [8,4,12,2,9]", output: "false", explanation: "9 is in the left subtree of 8 but is larger than 8, even though 9 > 4 locally." },
      { input: "root = [8,8]", output: "false", explanation: "Duplicates are not allowed." },
    ],
    constraints: ["The tree has between 1 and 10^4 nodes.", "-2^31 <= Node.val <= 2^31 - 1"],
    signature: `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:`,
    method: "isValidBST",
    driver: `def run(ns, args):
    return ns["Solution"]().isValidBST(to_tree(args[0]))
`,
    tests: [
      { id: "ex1", input: "[[8, 4, 12, 2, 6, 10, 14]]", expected: "True", visible: true },
      { id: "ex2", input: "[[8, 4, 12, 2, 9]]", expected: "False", visible: true },
      { id: "ex3", input: "[[8, 8]]", expected: "False", visible: true },
      { id: "single", input: "[[0]]", expected: "True", visible: false },
      { id: "int-min", input: "[[-2147483648]]", expected: "True", visible: false },
      { id: "int-extremes", input: "[[-2147483648, None, 2147483647]]", expected: "True", visible: false },
      { id: "right-dup", input: "[[5, None, 5]]", expected: "False", visible: false },
      { id: "deep-violation", input: "[[10, 5, 15, None, None, 6, 20]]", expected: "False", visible: false },
      { id: "negatives-valid", input: "[[-10, -20, 0, -30, -15, -5, 5]]", expected: "True", visible: false },
      { id: "right-chain-valid", input: "[sum([[i, None] for i in range(1, 200)], []) + [200]]", expected: "True", visible: false },
      { id: "left-chain-invalid", input: "[[1] + sum([[i, None] for i in range(2, 200)], []) + [200]]", expected: "False", visible: false },
      { id: "full-invalid", input: "[list(range(1, 1024))]", expected: "False", visible: false },
    ],
    solution: `class Solution:
    def isValidBST(self, root: Optional[TreeNode]) -> bool:
        def valid(node, low, high):
            if not node:
                return True
            if not (low < node.val < high):
                return False
            return valid(node.left, low, node.val) and valid(node.right, node.val, high)

        return valid(root, float("-inf"), float("inf"))`,
    hints: ["Comparing each node only with its own children misses problems further down. What range must each node fall in?", "Every node inherits a (low, high) window from all its ancestors. Going left lowers high to the parent's value; going right raises low.", "Alternative: an in-order traversal of a valid BST is strictly increasing, so compare each value with the previous one."],
    clarify: [
      { question: "Are duplicate values allowed?", answer: "No, both sides use strict comparisons, so any duplicate that must be ordered makes the tree invalid." },
      { question: "Can values reach the 32-bit integer limits?", answer: "Yes, so don't use those limits as sentinels; use infinity or None." },
    ],
  },
  {
    lc: 230,
    kind: "algorithm",
    statement: `Given the root of a **binary search tree** and an integer \`k\`, return the \`k\`-th smallest value stored in the tree, counting from 1.

- \`k = 1\` asks for the minimum; \`k\` equal to the number of nodes asks for the maximum.
- \`k\` is always between 1 and the number of nodes.`,
    examples: [
      { input: "root = [8,4,12,2,6,10,14], k = 3", output: "6", explanation: "In sorted order the values are 2, 4, 6, 8, 10, 12, 14." },
      { input: "root = [50,30,null,20,40], k = 4", output: "50" },
    ],
    constraints: ["The tree has n nodes, 1 <= k <= n <= 10^4.", "0 <= Node.val <= 10^4"],
    signature: `class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:`,
    method: "kthSmallest",
    driver: `def run(ns, args):
    return ns["Solution"]().kthSmallest(to_tree(args[0]), args[1])
`,
    tests: [
      { id: "ex1", input: "[[8, 4, 12, 2, 6, 10, 14], 3]", expected: "6", visible: true },
      { id: "ex2", input: "[[50, 30, None, 20, 40], 4]", expected: "50", visible: true },
      { id: "single", input: "[[7], 1]", expected: "7", visible: false },
      { id: "k-is-n", input: "[[8, 4, 12, 2, 6, 10, 14], 7]", expected: "14", visible: false },
      { id: "k-is-1", input: "[[8, 4, 12, 2, 6, 10, 14], 1]", expected: "2", visible: false },
      { id: "with-zero", input: "[[3, 0, 5, None, 1], 2]", expected: "1", visible: false },
      { id: "right-chain", input: "[sum([[i, None] for i in range(1, 200)], []) + [200], 150]", expected: "150", visible: false },
      { id: "left-chain-min", input: "[[200] + sum([[i, None] for i in range(199, 1, -1)], []) + [1], 1]", expected: "1", visible: false },
      { id: "left-chain-max", input: "[[200] + sum([[i, None] for i in range(199, 1, -1)], []) + [1], 200]", expected: "200", visible: false },
    ],
    solution: `class Solution:
    def kthSmallest(self, root: Optional[TreeNode], k: int) -> int:
        stack, cur = [], root
        while True:
            while cur:
                stack.append(cur)
                cur = cur.left
            cur = stack.pop()
            k -= 1
            if k == 0:
                return cur.val
            cur = cur.right`,
    hints: ["Which traversal of a binary search tree visits the values in sorted order?", "An in-order walk (left, node, right) yields ascending values. Stop as soon as you have produced k of them.", "With an explicit stack you can stop early without visiting the rest of the tree."],
    clarify: [
      { question: "Is k 1-based?", answer: "Yes, k = 1 means the smallest value." },
      { question: "Can k be larger than the number of nodes?", answer: "No, it is always valid." },
    ],
  },
  {
    lc: 105,
    kind: "algorithm",
    statement: `You are given two integer arrays describing the same binary tree:

- \`preorder\`: the values in **preorder** (node, then its left subtree, then its right subtree),
- \`inorder\`: the values in **inorder** (left subtree, then node, then right subtree).

All values are distinct. Rebuild the tree and return its root.

The output is shown in level order with \`null\` for missing children.`,
    examples: [
      { input: "preorder = [5,3,1,4,8,7], inorder = [1,3,4,5,7,8]", output: "[5,3,8,1,4,7]", explanation: "5 comes first in preorder, so it is the root; in inorder, [1,3,4] is to its left and [7,8] to its right." },
      { input: "preorder = [2,1], inorder = [1,2]", output: "[2,1]" },
    ],
    constraints: ["1 <= preorder.length <= 3000", "inorder.length == preorder.length", "-3000 <= values <= 3000", "All values are unique, and both arrays describe the same tree."],
    signature: `class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:`,
    method: "buildTree",
    driver: `def run(ns, args):
    return from_tree(ns["Solution"]().buildTree(args[0], args[1]))
`,
    tests: [
      { id: "ex1", input: "[[5, 3, 1, 4, 8, 7], [1, 3, 4, 5, 7, 8]]", expected: "[5, 3, 8, 1, 4, 7]", visible: true },
      { id: "ex2", input: "[[2, 1], [1, 2]]", expected: "[2, 1]", visible: true },
      { id: "single", input: "[[7], [7]]", expected: "[7]", visible: false },
      { id: "right-chain", input: "[[1, 2, 3, 4, 5], [1, 2, 3, 4, 5]]", expected: "[1, None, 2, None, 3, None, 4, None, 5]", visible: false },
      { id: "left-chain", input: "[[1, 2, 3, 4], [4, 3, 2, 1]]", expected: "[1, 2, None, 3, None, 4]", visible: false },
      { id: "zigzag", input: "[[1, 2, 3, 4], [2, 4, 3, 1]]", expected: "[1, 2, None, None, 3, 4]", visible: false },
      { id: "negatives", input: "[[-1, -2, -4, -5, -3, 6], [-4, -2, -5, -1, -3, 6]]", expected: "[-1, -2, -3, -4, -5, None, 6]", visible: false },
      { id: "left-chain-200", input: "[list(range(1, 201)), list(range(200, 0, -1))]", expected: "[1] + sum([[i, None] for i in range(2, 200)], []) + [200]", visible: false },
      { id: "right-chain-200", input: "[list(range(1, 201)), list(range(1, 201))]", expected: "sum([[i, None] for i in range(1, 200)], []) + [200]", visible: false },
    ],
    solution: `class Solution:
    def buildTree(self, preorder: List[int], inorder: List[int]) -> Optional[TreeNode]:
        index = {v: i for i, v in enumerate(inorder)}
        pre = 0

        def build(l, r):
            nonlocal pre
            if l > r:
                return None
            val = preorder[pre]
            pre += 1
            node = TreeNode(val)
            mid = index[val]
            node.left = build(l, mid - 1)
            node.right = build(mid + 1, r)
            return node

        return build(0, len(inorder) - 1)`,
    hints: ["The first value in preorder is always the root. Where does it sit in inorder, and what does that tell you?", "Everything left of the root in inorder is the left subtree; everything right is the right subtree. Their sizes tell you how to split preorder.", "Precompute value -> inorder index in a dictionary and consume preorder with a moving pointer, building the left subtree before the right."],
    clarify: [
      { question: "Can values repeat?", answer: "No, all values are unique, which makes the tree uniquely determined." },
      { question: "Are the two arrays always consistent?", answer: "Yes, they always describe the same tree." },
    ],
  },
  {
    lc: 124,
    kind: "algorithm",
    statement: `In a binary tree, a **path** is a sequence of nodes where each consecutive pair is joined by a parent–child edge, and no node appears more than once. A path contains at least one node and does not have to pass through the root.

Given the root (values may be negative), return the largest possible **sum of values** along any path.

- A path can go up from one node and back down another branch, turning at most once at its highest node.
- Since values can be negative, the best path may be a single node.`,
    examples: [
      { input: "root = [2,-1,3]", output: "5", explanation: "The path 2 → 3 sums to 5; adding -1 would only lower it." },
      { input: "root = [-4,9,-6,null,null,8,1]", output: "9", explanation: "The single node 9 beats every longer path." },
      { input: "root = [-7]", output: "-7" },
    ],
    constraints: ["The tree has between 1 and 3 * 10^4 nodes.", "-1000 <= Node.val <= 1000"],
    signature: `class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:`,
    method: "maxPathSum",
    driver: `def run(ns, args):
    return ns["Solution"]().maxPathSum(to_tree(args[0]))
`,
    tests: [
      { id: "ex1", input: "[[2, -1, 3]]", expected: "5", visible: true },
      { id: "ex2", input: "[[-4, 9, -6, None, None, 8, 1]]", expected: "9", visible: true },
      { id: "ex3", input: "[[-7]]", expected: "-7", visible: true },
      { id: "all-negative", input: "[[-3, -2, -5]]", expected: "-2", visible: false },
      { id: "bend-below-root", input: "[[-20, 5, -1, 6, 7, None, None, -2]]", expected: "18", visible: false },
      { id: "through-root", input: "[[1, -2, 3, 4, None, None, 5]]", expected: "11", visible: false },
      { id: "zero-and-neg", input: "[[0, -1, -1]]", expected: "0", visible: false },
      { id: "chain-200", input: "[sum([[i, None] for i in range(1, 200)], []) + [200]]", expected: "20100", visible: false },
      { id: "full-1023", input: "[list(range(1, 1024))]", expected: "3972", visible: false },
      { id: "full-mixed", input: "[[(i * 37) % 21 - 10 for i in range(1023)]]", expected: "83", visible: false },
    ],
    solution: `class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        best = root.val

        def gain(node):
            nonlocal best
            if not node:
                return 0
            l = max(gain(node.left), 0)
            r = max(gain(node.right), 0)
            best = max(best, node.val + l + r)
            return node.val + max(l, r)

        gain(root)
        return best`,
    hints: ["Like the diameter problem: every path has one highest node where it turns. What is the best path that turns at a given node?", "Let each node report its best single downward arm, node.val + max(left arm, right arm), dropping a negative arm (treat it as 0).", "At each node, update a global answer with node.val + left arm + right arm; return only the single arm to the parent."],
    clarify: [
      { question: "Can the path be a single node?", answer: "Yes, a path needs at least one node and may be just one." },
      { question: "Does the path have to start at the root or end at a leaf?", answer: "No, it can start and end anywhere." },
    ],
  },
  {
    lc: 297,
    kind: "algorithm",
    statement: `Design a \`Codec\` class with two methods:

- \`serialize(root)\` turns a binary tree into a single **string**.
- \`deserialize(data)\` takes a string produced by \`serialize\` and rebuilds the **exact same tree** (same shape, same values) and returns its root.

You choose the string format; the only requirement is that a round trip, \`deserialize(serialize(root))\`, gives back an identical tree. The tests build a tree, run it through both methods, and compare the result with the original (shown in level order with \`null\` for missing children).

- Values can be negative and can repeat.
- The tree may be empty.
- Keep no state between calls: each method must work from its argument alone.`,
    examples: [
      { input: "root = [4,-2,7,null,3]", output: "[4,-2,7,null,3]", explanation: "Any format works, for example the preorder string \"4,-2,N,3,N,N,7,N,N\"." },
      { input: "root = []", output: "[]" },
    ],
    constraints: ["The tree has between 0 and 10^4 nodes.", "-1000 <= Node.val <= 1000"],
    signature: `class Codec:

    def serialize(self, root):
        """Encodes a tree to a single string.

        :type root: TreeNode
        :rtype: str
        """


    def deserialize(self, data):
        """Decodes your encoded data to tree.

        :type data: str
        :rtype: TreeNode
        """`,
    method: "serialize",
    driver: `def run(ns, args):
    root = to_tree(args[0])
    c = ns["Codec"]()
    s = c.serialize(root)
    if not isinstance(s, str):
        raise TypeError("serialize must return a str, got " + type(s).__name__)
    return from_tree(ns["Codec"]().deserialize(s))
`,
    tests: [
      { id: "ex1", input: "[[4, -2, 7, None, 3]]", expected: "[4, -2, 7, None, 3]", visible: true },
      { id: "ex2", input: "[[]]", expected: "[]", visible: true },
      { id: "single-zero", input: "[[0]]", expected: "[0]", visible: false },
      { id: "extremes", input: "[[-1000, 1000, None, -999]]", expected: "[-1000, 1000, None, -999]", visible: false },
      { id: "dups", input: "[[5, 5, 5, None, 5, 5]]", expected: "[5, 5, 5, None, 5, 5]", visible: false },
      { id: "sparse", input: "[[1, 2, 3, None, None, 4, 5, 6, None, None, 7]]", expected: "[1, 2, 3, None, None, 4, 5, 6, None, None, 7]", visible: false },
      { id: "left-chain-200", input: "[[1] + sum([[i, None] for i in range(2, 200)], []) + [200]]", expected: "[1] + sum([[i, None] for i in range(2, 200)], []) + [200]", visible: false },
      { id: "right-chain-200", input: "[sum([[i, None] for i in range(1, 200)], []) + [200]]", expected: "sum([[i, None] for i in range(1, 200)], []) + [200]", visible: false },
      { id: "full-1023", input: "[list(range(1, 1024))]", expected: "list(range(1, 1024))", visible: false },
    ],
    solution: `class Codec:
    def serialize(self, root):
        out = []

        def dfs(node):
            if not node:
                out.append("N")
                return
            out.append(str(node.val))
            dfs(node.left)
            dfs(node.right)

        dfs(root)
        return ",".join(out)

    def deserialize(self, data):
        tokens = iter(data.split(","))

        def build():
            t = next(tokens)
            if t == "N":
                return None
            node = TreeNode(int(t))
            node.left = build()
            node.right = build()
            return node

        return build()`,
    hints: ["A plain preorder or inorder list is ambiguous. What extra information makes the shape recoverable?", "Write a marker (such as N) for every missing child. Preorder with markers uniquely describes the tree.", "To decode, read tokens in the same order: a marker means None, otherwise make a node and build its left then right subtree."],
    clarify: [
      { question: "Does the string have to match a specific format?", answer: "No, any format is fine as long as deserialize(serialize(root)) rebuilds the identical tree." },
      { question: "Can a separate Codec instance decode the string?", answer: "Yes, and the tests use a fresh instance for deserialize, so keep no state between calls." },
    ],
  },
];
