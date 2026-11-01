/**
 * trees: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
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
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));
const nodes = (...ns: [string, string][]) => ns.map(([id, label]) => ({ id, label }));
const edges = (...es: ([string, string] | [string, string, string])[]) => es.map(([from, to, label]) => ({ from, to, label: label ?? "" }));

export const variations: Variation[] = [
  {
    id: "recursive-dfs",
    topic: "trees",
    name: "Recursive DFS",
    change: "Base pattern. Handle `None`, ==trust the recursive call on each child==, then combine the two answers at the current node.",
    problems: [226, 104, 100, 572],
  },
  {
    id: "bottom-up-global",
    topic: "trees",
    name: "Return one thing, track another",
    change: "The recursion ==returns a height or gain== up to the parent, while the real answer (diameter, balance, best path) is ==updated on the side== at every node.",
    problems: [543, 110, 124],
  },
  {
    id: "bfs-levels",
    topic: "trees",
    name: "Level-order BFS",
    change: "Swap recursion for a queue and ==process one level at a time== (`for _ in range(len(q))`), so you know where each level starts and ends.",
    problems: [102, 199],
  },
  {
    id: "top-down-state",
    topic: "trees",
    name: "Pass state down",
    change: "Instead of returning info up, ==carry info down== as arguments: the max on the path so far, or the allowed `(low, high)` range.",
    problems: [1448, 98],
  },
  {
    id: "bst-order",
    topic: "trees",
    name: "Use the BST order",
    change: "Left < node < right lets you ==discard half the tree== at each step, and an ==in-order walk visits values sorted==.",
    problems: [235, 230],
  },
  {
    id: "build-encode",
    topic: "trees",
    name: "Build / encode a tree",
    change: "Construct a tree instead of reading one: ==preorder gives the next root==, and either inorder or explicit `N` markers tell you where each subtree ends.",
    problems: [105, 297],
  },
];

export const solutions: Solution[] = [
  {
    lc: 226,
    variation: "recursive-dfs",
    question: "Given a binary tree, mirror it so every node's left and right children trade places, and return the root.",
    intuition: `Mirroring a tree = ==swap the two children at every node==. If each subtree is already mirrored by the recursive call, the current node only has to swap its two (mirrored) children. An empty tree mirrors to itself.`,
    algorithm: `1. If \`root\` is \`None\`, return \`None\`.
2. Recurse on both children:
   * Mirror the right subtree and the left subtree.
3. ==Assign them crossed==: \`root.left\` = mirrored right, \`root.right\` = mirrored left.
4. Return \`root\`.`,
    visual: {
      kind: "graph",
      title: "Invert binary tree · [4, 2, 7, 1, 3, 6, 9]",
      nodes: nodes(["n4", "4"], ["n2", "2"], ["n7", "7"], ["n1", "1"], ["n3", "3"], ["n6", "6"], ["n9", "9"]),
      edges: edges(["n4", "n2"], ["n4", "n7"], ["n2", "n1"], ["n2", "n3"], ["n7", "n6"], ["n7", "n9"]),
      directed: true,
      frames: [
        { caption: "invert(4): before swapping anything, recurse into both subtrees.", pointers: [{ name: "cur", node: "n4" }], highlight: ["n4"] },
        { caption: "Leaves 1 and 3 have no children, so swapping None with None changes nothing. They return themselves.", pointers: [{ name: "cur", node: "n2" }], highlight: ["n1", "n3"] },
        { caption: "Back at 2: swap its children. 2's left is now 3, right is 1.", pointers: [{ name: "cur", node: "n2" }], highlight: ["n2"], done: ["n1", "n3"], vars: kv({ "2's children": "3, 1" }) },
        { caption: "Same under 7: leaves 6 and 9 return, then 7 swaps them.", pointers: [{ name: "cur", node: "n7" }], highlight: ["n7"], done: ["n1", "n2", "n3", "n6", "n9"], vars: kv({ "2's children": "3, 1", "7's children": "9, 6" }) },
        { caption: "Back at 4: swap its two subtrees. Every node was swapped exactly once.", pointers: [{ name: "cur", node: "n4" }], highlight: ["n4"], done: ["n1", "n2", "n3", "n6", "n7", "n9"], vars: kv({ levels: "[4] [7, 2] [9, 6, 3, 1]", answer: "[4, 7, 2, 9, 6, 3, 1]" }) },
      ],
    },
    code: `from typing import Optional

def invertTree(root: Optional[TreeNode]) -> Optional[TreeNode]:
    if not root:
        return None
    root.left, root.right = invertTree(root.right), invertTree(root.left)
    return root`,
    complexity: "Time O(n) · Space O(h) recursion (h = tree height)",
  },
  {
    lc: 104,
    variation: "recursive-dfs",
    question: "Given a binary tree, return how many nodes lie on its longest path from the root down to a leaf.",
    intuition: `The depth of a tree is ==1 (this node) + the deeper of its two subtrees==. An empty tree has depth 0, which stops the recursion. Each node is asked once, so it's O(n).`,
    algorithm: `1. If \`root\` is \`None\`, return \`0\`.
2. Get \`left = maxDepth(root.left)\` and \`right = maxDepth(root.right)\`.
3. Return ==\`1 + max(left, right)\`==.`,
    visual: {
      kind: "graph",
      title: "Max depth · [3, 9, 20, null, null, 15, 7]",
      nodes: nodes(["n3", "3"], ["n9", "9"], ["n20", "20"], ["n15", "15"], ["n7", "7"]),
      edges: edges(["n3", "n9"], ["n3", "n20"], ["n20", "n15"], ["n20", "n7"]),
      directed: true,
      frames: [
        { caption: "Start at 3; it asks both children for their depth.", pointers: [{ name: "cur", node: "n3" }], highlight: ["n3"] },
        { caption: "9 is a leaf: both children are None (0) → returns 1 + 0 = 1.", pointers: [{ name: "cur", node: "n9" }], highlight: ["n9"], vars: kv({ "depth(9)": "1" }) },
        { caption: "15 and 7 are leaves → each returns 1.", highlight: ["n15", "n7"], done: ["n9"], vars: kv({ "depth(9)": "1", "depth(15)": "1", "depth(7)": "1" }) },
        { caption: "20 returns 1 + max(1, 1) = 2.", pointers: [{ name: "cur", node: "n20" }], highlight: ["n20"], done: ["n9", "n15", "n7"], vars: kv({ "depth(9)": "1", "depth(20)": "2" }) },
        { caption: "3 returns 1 + max(1, 2) = 3. Longest path 3 → 20 → 15.", pointers: [{ name: "cur", node: "n3" }], highlight: ["n3", "n20", "n15"], done: ["n9", "n7"], vars: kv({ answer: "3" }) },
      ],
    },
    code: `from typing import Optional

def maxDepth(root: Optional[TreeNode]) -> int:
    if not root:
        return 0
    return 1 + max(maxDepth(root.left), maxDepth(root.right))`,
    complexity: "Time O(n) · Space O(h) recursion",
  },
  {
    lc: 543,
    variation: "bottom-up-global",
    question: "Given a binary tree, return the number of edges on the longest path between any two nodes (it need not pass through the root).",
    intuition: `Any path has one highest node where it bends. Through that node, the longest path is ==left height + right height==. So compute heights bottom-up, and at every node ==update a global \`best\`== with \`left + right\`, while returning \`1 + max(left, right)\` to the parent.`,
    algorithm: `1. Set \`best = 0\`.
2. Define \`height(node)\`:
   * If \`node\` is \`None\`, return \`0\`.
   * Get \`l = height(node.left)\` and \`r = height(node.right)\`.
   * ==\`best = max(best, l + r)\`== (path that bends here).
   * Return \`1 + max(l, r)\` (the longest single arm, for the parent).
3. Call \`height(root)\` and return \`best\`.`,
    visual: {
      kind: "graph",
      title: "Diameter · [1, 2, 3, 4, 5]",
      nodes: nodes(["n1", "1"], ["n2", "2"], ["n3", "3"], ["n4", "4"], ["n5", "5"]),
      edges: edges(["n1", "n2"], ["n1", "n3"], ["n2", "n4"], ["n2", "n5"]),
      directed: true,
      frames: [
        { caption: "Leaves 4 and 5: l = r = 0, best stays 0, each returns height 1.", highlight: ["n4", "n5"], vars: kv({ "h(4)": "1", "h(5)": "1", best: "0" }) },
        { caption: "At 2: l = 1, r = 1 → a path 4–2–5 of 2 edges bends here. best = 2. Returns 2.", pointers: [{ name: "cur", node: "n2" }], highlight: ["n2", "n4", "n5"], vars: kv({ "h(2)": "2", best: "2" }) },
        { caption: "Leaf 3 returns height 1.", pointers: [{ name: "cur", node: "n3" }], highlight: ["n3"], done: ["n2", "n4", "n5"], vars: kv({ "h(2)": "2", "h(3)": "1", best: "2" }) },
        { caption: "At 1: l = 2, r = 1 → path 4–2–1–3 has 3 edges. best = 3.", pointers: [{ name: "cur", node: "n1" }], highlight: ["n4", "n2", "n1", "n3"], done: ["n5"], vars: kv({ best: "3", answer: "3" }) },
      ],
    },
    code: `from typing import Optional

def diameterOfBinaryTree(root: Optional[TreeNode]) -> int:
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
    complexity: "Time O(n) · Space O(h) recursion",
  },
  {
    lc: 110,
    variation: "bottom-up-global",
    question: "Given a binary tree, say whether at every node the two subtree heights differ by at most one.",
    intuition: `Checking heights from the top re-measures the same subtrees again and again (O(n²)). Instead compute heights bottom-up once and ==return -1 as a "already unbalanced" signal==. As soon as a node sees -1 from a child, or children whose heights differ by more than 1, it passes -1 up.`,
    algorithm: `1. Define \`height(node)\`:
   * If \`node\` is \`None\`, return \`0\`.
   * Get \`l = height(node.left)\` and \`r = height(node.right)\`.
   * If ==\`l == -1\`, \`r == -1\` or \`abs(l - r) > 1\`==, return \`-1\`.
   * Otherwise return \`1 + max(l, r)\`.
2. Return \`height(root) != -1\`.`,
    visual: {
      kind: "graph",
      title: "Balanced? · [1, 2, 2, 3, 3, null, null, 4, 4]",
      nodes: nodes(["n1", "1"], ["n2a", "2"], ["n2b", "2"], ["n3a", "3"], ["n3b", "3"], ["n4a", "4"], ["n4b", "4"]),
      edges: edges(["n1", "n2a"], ["n1", "n2b"], ["n2a", "n3a"], ["n2a", "n3b"], ["n3a", "n4a"], ["n3a", "n4b"]),
      directed: true,
      frames: [
        { caption: "Leaves 4 and 4 return height 1.", highlight: ["n4a", "n4b"], vars: kv({ "h(4)": "1" }) },
        { caption: "Left 3: heights 1 and 1, fine → returns 2. Right 3 is a leaf → 1.", highlight: ["n3a", "n3b"], done: ["n4a", "n4b"], vars: kv({ "h(left 3)": "2", "h(right 3)": "1" }) },
        { caption: "Left 2: heights 2 and 1 differ by 1, fine → returns 3.", pointers: [{ name: "cur", node: "n2a" }], highlight: ["n2a"], done: ["n3a", "n3b", "n4a", "n4b"], vars: kv({ "h(left 2)": "3" }) },
        { caption: "Right 2 is a leaf → returns 1.", pointers: [{ name: "cur", node: "n2b" }], highlight: ["n2b"], done: ["n2a", "n3a", "n3b", "n4a", "n4b"], vars: kv({ "h(left 2)": "3", "h(right 2)": "1" }) },
        { caption: "Root 1: heights 3 and 1 differ by 2 → returns -1. Not balanced.", pointers: [{ name: "cur", node: "n1" }], highlight: ["n1", "n2a", "n2b"], vars: kv({ "h(1)": "-1", answer: "False" }) },
      ],
    },
    code: `from typing import Optional

def isBalanced(root: Optional[TreeNode]) -> bool:
    def height(node):  # -1 means "unbalanced somewhere below"
        if not node:
            return 0
        l = height(node.left)
        r = height(node.right)
        if l == -1 or r == -1 or abs(l - r) > 1:
            return -1
        return 1 + max(l, r)

    return height(root) != -1`,
    complexity: "Time O(n) · Space O(h) recursion",
  },
  {
    lc: 100,
    variation: "recursive-dfs",
    question: "Given two binary trees, say whether they have exactly the same shape and the same value at every position.",
    intuition: `Walk both trees in lockstep. Two empty trees match; ==one empty and one not, or different values, is a mismatch==. Otherwise the trees match exactly when the left pair matches and the right pair matches.`,
    algorithm: `1. If both \`p\` and \`q\` are \`None\`, return \`True\`.
2. If ==only one is \`None\`, or \`p.val != q.val\`==, return \`False\`.
3. Return \`isSameTree(p.left, q.left) and isSameTree(p.right, q.right)\`.`,
    visual: {
      kind: "graph",
      title: "Same tree? · p = [1, 2, 3], q = [1, 2, 4]",
      nodes: nodes(["p1", "p:1"], ["q1", "q:1"], ["p2", "p:2"], ["p3", "p:3"], ["q2", "q:2"], ["q4", "q:4"]),
      edges: edges(["p1", "p2"], ["p1", "p3"], ["q1", "q2"], ["q1", "q4"]),
      directed: true,
      frames: [
        { caption: "Compare the roots: both 1 → keep going.", pointers: [{ name: "p", node: "p1" }, { name: "q", node: "q1" }], highlight: ["p1", "q1"] },
        { caption: "Left pair: both 2, and both have no children (None vs None → True).", pointers: [{ name: "p", node: "p2" }, { name: "q", node: "q2" }], highlight: ["p2", "q2"], done: ["p1", "q1"], vars: kv({ left: "True" }) },
        { caption: "Right pair: 3 vs 4 → values differ → False.", pointers: [{ name: "p", node: "p3" }, { name: "q", node: "q4" }], highlight: ["p3", "q4"], done: ["p1", "q1", "p2", "q2"], vars: kv({ left: "True", right: "False" }) },
        { caption: "True and False → the trees are not the same.", done: ["p1", "q1", "p2", "q2"], highlight: ["p3", "q4"], vars: kv({ answer: "False" }) },
      ],
    },
    code: `from typing import Optional

def isSameTree(p: Optional[TreeNode], q: Optional[TreeNode]) -> bool:
    if not p and not q:
        return True
    if not p or not q or p.val != q.val:
        return False
    return isSameTree(p.left, q.left) and isSameTree(p.right, q.right)`,
    complexity: "Time O(n) · Space O(h) recursion",
  },
  {
    lc: 572,
    variation: "recursive-dfs",
    question: "Given a tree and a smaller tree, say whether the smaller one appears in the bigger one as some node plus all its descendants.",
    intuition: `It's Same Tree, tried at every node. ==Walk the big tree, and at each node ask "is the tree rooted here the same as \`subRoot\`?"==. The first yes answers the question; reaching \`None\` without a match means no.`,
    algorithm: `1. Write \`same(a, b)\` exactly like Same Tree.
2. Define \`dfs(node)\`:
   * If \`node\` is \`None\`, return \`False\`.
   * Return ==\`same(node, subRoot)\`== or \`dfs(node.left)\` or \`dfs(node.right)\`.
3. Return \`dfs(root)\`.`,
    visual: {
      kind: "graph",
      title: "Subtree? · root [3, 4, 5, 1, 2], subRoot [4, 1, 2]",
      nodes: nodes(["n3", "3"], ["n4", "4"], ["n5", "5"], ["n1", "1"], ["n2", "2"]),
      edges: edges(["n3", "n4"], ["n3", "n5"], ["n4", "n1"], ["n4", "n2"]),
      directed: true,
      frames: [
        { caption: "At 3: same(3, subRoot)? Root values 3 vs 4 differ → no.", pointers: [{ name: "cur", node: "n3" }], highlight: ["n3"], vars: kv({ subRoot: "4 (1, 2)" }) },
        { caption: "Go left to 4: same(4, subRoot)? 4 = 4, compare children next.", pointers: [{ name: "cur", node: "n4" }], highlight: ["n4"], done: ["n3"], vars: kv({ subRoot: "4 (1, 2)" }) },
        { caption: "Left 1 = 1 and right 2 = 2, all children None → same() is True.", pointers: [{ name: "cur", node: "n4" }], highlight: ["n4", "n1", "n2"], done: ["n3"], vars: kv({ subRoot: "4 (1, 2)", "same(4)": "True" }) },
        { caption: "Found it, so 5 is never checked. Answer True.", highlight: ["n4", "n1", "n2"], done: ["n3"], vars: kv({ answer: "True" }) },
      ],
    },
    code: `from typing import Optional

def isSubtree(root: Optional[TreeNode], subRoot: Optional[TreeNode]) -> bool:
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
    complexity: "Time O(m · n) · Space O(h) recursion",
  },
  {
    lc: 235,
    variation: "bst-order",
    question: "Given a binary search tree and two of its nodes, return their lowest shared ancestor.",
    intuition: `In a BST, if both values are smaller than the current node, both live in the left subtree; if both are larger, both are on the right. ==The first node where they split (or that equals one of them) is the answer==. No recursion needed: just walk down.`,
    algorithm: `1. Start with \`cur = root\`.
2. While \`cur\`:
   * If \`p.val\` and \`q.val\` are ==both less== than \`cur.val\`, go \`cur = cur.left\`.
   * Else if they are ==both greater==, go \`cur = cur.right\`.
   * Otherwise they split here (or one equals \`cur\`): ==return \`cur\`==.`,
    visual: {
      kind: "graph",
      title: "LCA in BST · p = 3, q = 5",
      nodes: nodes(["n6", "6"], ["n2", "2"], ["n8", "8"], ["n0", "0"], ["n4", "4"], ["n7", "7"], ["n9", "9"], ["n3", "3"], ["n5", "5"]),
      edges: edges(["n6", "n2"], ["n6", "n8"], ["n2", "n0"], ["n2", "n4"], ["n8", "n7"], ["n8", "n9"], ["n4", "n3"], ["n4", "n5"]),
      directed: true,
      frames: [
        { caption: "At 6: 3 and 5 are both smaller → both are in the left subtree.", pointers: [{ name: "cur", node: "n6" }], highlight: ["n6", "n3", "n5"] },
        { caption: "At 2: 3 and 5 are both larger → go right.", pointers: [{ name: "cur", node: "n2" }], highlight: ["n2", "n3", "n5"], done: ["n6"] },
        { caption: "At 4: 3 < 4 < 5 → they split here, so 4 is the lowest common ancestor.", pointers: [{ name: "cur", node: "n4" }], highlight: ["n4", "n3", "n5"], done: ["n6", "n2"], vars: kv({ answer: "4" }) },
      ],
    },
    code: `def lowestCommonAncestor(root: TreeNode, p: TreeNode, q: TreeNode) -> TreeNode:
    cur = root
    while cur:
        if p.val < cur.val and q.val < cur.val:
            cur = cur.left
        elif p.val > cur.val and q.val > cur.val:
            cur = cur.right
        else:
            return cur
    return None`,
    complexity: "Time O(h) · Space O(1)",
  },
  {
    lc: 102,
    variation: "bfs-levels",
    question: "Given a binary tree, return its values grouped by depth, each level read from left to right.",
    intuition: `A queue visits nodes in the order they were found, which is level by level. The trick is ==snapshot \`len(q)\` at the start of each round==: exactly that many nodes belong to the current level; their children (added during the round) are the next level.`,
    algorithm: `1. If \`root\` is \`None\`, return \`[]\`. Put \`root\` in a deque \`q\`.
2. While \`q\` is not empty:
   * Create \`level = []\`.
   * Repeat ==\`len(q)\` times== (fixed at the start of the round):
      * Pop \`node\` from the left and append \`node.val\` to \`level\`.
      * Push \`node.left\` and \`node.right\` if they exist.
   * Append \`level\` to \`res\`.
3. Return \`res\`.`,
    visual: {
      kind: "graph",
      title: "Level order · [3, 9, 20, null, null, 15, 7]",
      nodes: nodes(["n3", "3"], ["n9", "9"], ["n20", "20"], ["n15", "15"], ["n7", "7"]),
      edges: edges(["n3", "n9"], ["n3", "n20"], ["n20", "n15"], ["n20", "n7"]),
      directed: true,
      frames: [
        { caption: "Start: queue holds the root.", highlight: ["n3"], vars: kv({ queue: "[3]", res: "[]" }) },
        { caption: "Round 1 (size 1): pop 3, push 9 and 20.", highlight: ["n3"], vars: kv({ queue: "[9, 20]", res: "[[3]]" }) },
        { caption: "Round 2 (size 2): pop 9 (no children), pop 20 → push 15 and 7.", highlight: ["n9", "n20"], done: ["n3"], vars: kv({ queue: "[15, 7]", res: "[[3], [9, 20]]" }) },
        { caption: "Round 3 (size 2): pop 15 and 7, both leaves. Queue empty → done.", highlight: ["n15", "n7"], done: ["n3", "n9", "n20"], vars: kv({ queue: "[]", res: "[[3], [9, 20], [15, 7]]" }) },
      ],
    },
    code: `from collections import deque
from typing import Optional

def levelOrder(root: Optional[TreeNode]) -> list[list[int]]:
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
    complexity: "Time O(n) · Space O(w) for the widest level",
  },
  {
    lc: 199,
    variation: "bfs-levels",
    question: "Given a binary tree, return the values you would see looking at it from the right side, top to bottom.",
    intuition: `From the right you see ==the last node of each level==. Run level-order BFS (left child before right) and, after each round, record the last node you popped. A deep left node still shows if nothing on its level is to its right.`,
    algorithm: `1. If \`root\` is \`None\`, return \`[]\`. Put \`root\` in a deque \`q\`.
2. While \`q\` is not empty:
   * Repeat \`len(q)\` times: pop \`node\`, push its left then right child.
   * After the round, ==append the last popped \`node.val\`== to \`res\`.
3. Return \`res\`.`,
    visual: {
      kind: "graph",
      title: "Right side view · [1, 2, 3, null, 5, null, 4]",
      nodes: nodes(["n1", "1"], ["n2", "2"], ["n3", "3"], ["n5", "5"], ["n4", "4"]),
      edges: edges(["n1", "n2"], ["n1", "n3"], ["n2", "n5", "R"], ["n3", "n4", "R"]),
      directed: true,
      frames: [
        { caption: "Level 0: only 1 → it's the rightmost. Push 2 and 3.", highlight: ["n1"], vars: kv({ queue: "[2, 3]", res: "[1]" }) },
        { caption: "Level 1: pop 2 (push 5), then 3 (push 4). Last popped is 3.", highlight: ["n3"], done: ["n1", "n2"], vars: kv({ queue: "[5, 4]", res: "[1, 3]" }) },
        { caption: "Level 2: pop 5, then 4. Last popped is 4.", highlight: ["n4"], done: ["n1", "n2", "n3", "n5"], vars: kv({ queue: "[]", res: "[1, 3, 4]" }) },
        { caption: "Queue empty. 5 is hidden behind 4 on the same level.", highlight: ["n1", "n3", "n4"], done: ["n2", "n5"], vars: kv({ answer: "[1, 3, 4]" }) },
      ],
    },
    code: `from collections import deque
from typing import Optional

def rightSideView(root: Optional[TreeNode]) -> list[int]:
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
    complexity: "Time O(n) · Space O(w) for the widest level",
  },
  {
    lc: 1448,
    variation: "top-down-state",
    question: "Given a binary tree, count the nodes whose value is at least as big as every value on the path from the root to them.",
    intuition: `A node is "good" if it's ==\`>=\` the largest value seen on the way down==. So pass that running max into each call. The node compares itself, updates the max, and hands the new max to both children.`,
    algorithm: `1. Define \`dfs(node, best)\` where \`best\` is the max on the path above:
   * If \`node\` is \`None\`, return \`0\`.
   * \`good = 1\` if ==\`node.val >= best\`== else \`0\`.
   * \`best = max(best, node.val)\`.
   * Return \`good + dfs(node.left, best) + dfs(node.right, best)\`.
2. Return \`dfs(root, root.val)\`.`,
    visual: {
      kind: "graph",
      title: "Good nodes · [3, 1, 4, 3, null, 1, 5]",
      nodes: nodes(["n3", "3"], ["n1a", "1"], ["n4", "4"], ["n3b", "3"], ["n1b", "1"], ["n5", "5"]),
      edges: edges(["n3", "n1a"], ["n3", "n4"], ["n1a", "n3b", "L"], ["n4", "n1b"], ["n4", "n5"]),
      directed: true,
      frames: [
        { caption: "Root 3 with best = 3 → 3 ≥ 3, good.", pointers: [{ name: "cur", node: "n3" }], highlight: ["n3"], vars: kv({ best: "3", good: "1" }) },
        { caption: "Left 1: 1 < 3 → not good. best stays 3.", pointers: [{ name: "cur", node: "n1a" }], highlight: ["n1a"], done: ["n3"], vars: kv({ best: "3", good: "1" }) },
        { caption: "Its child 3: 3 ≥ 3 → good (ties count).", pointers: [{ name: "cur", node: "n3b" }], highlight: ["n3b"], done: ["n3", "n1a"], vars: kv({ best: "3", good: "2" }) },
        { caption: "Right 4: 4 ≥ 3 → good, best becomes 4.", pointers: [{ name: "cur", node: "n4" }], highlight: ["n4"], done: ["n3", "n1a", "n3b"], vars: kv({ best: "4", good: "3" }) },
        { caption: "1 < 4 → not good. 5 ≥ 4 → good. Total 4.", highlight: ["n1b", "n5"], done: ["n3", "n1a", "n3b", "n4"], vars: kv({ best: "4", answer: "4" }) },
      ],
    },
    code: `def goodNodes(root: TreeNode) -> int:
    def dfs(node, best):
        if not node:
            return 0
        good = 1 if node.val >= best else 0
        best = max(best, node.val)
        return good + dfs(node.left, best) + dfs(node.right, best)

    return dfs(root, root.val)`,
    complexity: "Time O(n) · Space O(h) recursion",
  },
  {
    lc: 98,
    variation: "top-down-state",
    question: "Given a binary tree, say whether it is a valid binary search tree (everything left is smaller, everything right is larger).",
    intuition: `Checking only a node against its own children misses deeper violations. Each node must fit ==inside a range \`(low, high)\` inherited from all its ancestors==. Going left tightens \`high\` to the parent's value; going right tightens \`low\`.`,
    algorithm: `1. Define \`valid(node, low, high)\`:
   * If \`node\` is \`None\`, return \`True\`.
   * If not ==\`low < node.val < high\`==, return \`False\`.
   * Return \`valid(node.left, low, node.val)\` and \`valid(node.right, node.val, high)\`.
2. Return \`valid(root, -inf, inf)\`.`,
    visual: {
      kind: "graph",
      title: "Valid BST? · [5, 4, 6, null, null, 3, 7]",
      nodes: nodes(["n5", "5"], ["n4", "4"], ["n6", "6"], ["n3", "3"], ["n7", "7"]),
      edges: edges(["n5", "n4"], ["n5", "n6"], ["n6", "n3"], ["n6", "n7"]),
      directed: true,
      frames: [
        { caption: "Root 5 must be in (-inf, inf) → ok.", pointers: [{ name: "cur", node: "n5" }], highlight: ["n5"], vars: kv({ range: "(-inf, inf)" }) },
        { caption: "Left 4 must be in (-inf, 5) → ok.", pointers: [{ name: "cur", node: "n4" }], highlight: ["n4"], done: ["n5"], vars: kv({ range: "(-inf, 5)" }) },
        { caption: "Right 6 must be in (5, inf) → ok.", pointers: [{ name: "cur", node: "n6" }], highlight: ["n6"], done: ["n5", "n4"], vars: kv({ range: "(5, inf)" }) },
        { caption: "6's left 3 must be in (5, 6). 3 < 5 → invalid, even though 3 < 6 locally.", pointers: [{ name: "cur", node: "n3" }], highlight: ["n3", "n5"], done: ["n4", "n6"], vars: kv({ range: "(5, 6)", answer: "False" }) },
      ],
    },
    code: `from typing import Optional

def isValidBST(root: Optional[TreeNode]) -> bool:
    def valid(node, low, high):
        if not node:
            return True
        if not (low < node.val < high):
            return False
        return valid(node.left, low, node.val) and valid(node.right, node.val, high)

    return valid(root, float("-inf"), float("inf"))`,
    complexity: "Time O(n) · Space O(h) recursion",
  },
  {
    lc: 230,
    variation: "bst-order",
    question: "Given a binary search tree and k, return the k-th smallest value in it (counting from 1).",
    intuition: `An ==in-order walk (left, node, right) of a BST visits values in sorted order==. Do it iteratively with a stack and ==stop on the k-th pop==, so you never touch the rest of the tree.`,
    algorithm: `1. Start with an empty \`stack\` and \`cur = root\`.
2. Loop:
   * While \`cur\`: push it and go \`cur = cur.left\` (dive to the smallest).
   * Pop \`cur\` from the stack and subtract 1 from \`k\`.
   * If ==\`k == 0\`==, return \`cur.val\`.
   * Go \`cur = cur.right\`.`,
    visual: {
      kind: "graph",
      title: "Kth smallest (k = 3) · [5, 3, 6, 2, 4, null, null, 1]",
      nodes: nodes(["n5", "5"], ["n3", "3"], ["n6", "6"], ["n2", "2"], ["n4", "4"], ["n1", "1"]),
      edges: edges(["n5", "n3"], ["n5", "n6"], ["n3", "n2"], ["n3", "n4"], ["n2", "n1", "L"]),
      directed: true,
      frames: [
        { caption: "Dive left from the root, pushing 5, 3, 2, 1.", pointers: [{ name: "cur", node: "n1" }], highlight: ["n5", "n3", "n2", "n1"], vars: kv({ stack: "[5, 3, 2, 1]", k: "3" }) },
        { caption: "Pop 1 → 1st smallest. k = 2. It has no right child.", pointers: [{ name: "cur", node: "n1" }], highlight: ["n1"], vars: kv({ stack: "[5, 3, 2]", k: "2" }) },
        { caption: "Pop 2 → 2nd smallest. k = 1. No right child.", pointers: [{ name: "cur", node: "n2" }], highlight: ["n2"], done: ["n1"], vars: kv({ stack: "[5, 3]", k: "1" }) },
        { caption: "Pop 3 → k = 0, so 3 is the answer. 4, 5, 6 are never visited.", pointers: [{ name: "cur", node: "n3" }], highlight: ["n3"], done: ["n1", "n2"], vars: kv({ stack: "[5]", k: "0", answer: "3" }) },
      ],
    },
    code: `from typing import Optional

def kthSmallest(root: Optional[TreeNode], k: int) -> int:
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
    complexity: "Time O(h + k) · Space O(h)",
  },
  {
    lc: 105,
    variation: "build-encode",
    question: "Given a tree's preorder and inorder value lists (all values unique), rebuild the tree and return its root.",
    intuition: `Preorder lists ==each root before its subtrees==, so reading it left to right hands you the next root. That root's position in inorder ==splits inorder into its left and right subtrees==. A value → index map makes the split O(1).`,
    algorithm: `1. Build \`index = {value: i}\` for \`inorder\`, and a pointer \`pre = 0\` into \`preorder\`.
2. Define \`build(l, r)\` for the inorder slice \`l..r\`:
   * If \`l > r\`, return \`None\`.
   * ==Take \`preorder[pre]\` as the root== and move \`pre\` forward.
   * Let \`mid = index[val]\`.
   * Build ==left from \`l..mid-1\` first==, then right from \`mid+1..r\` (preorder order).
   * Return the node.
3. Return \`build(0, n - 1)\`.`,
    visual: {
      kind: "graph",
      title: "Build tree · pre [3, 9, 20, 15, 7], in [9, 3, 15, 20, 7]",
      nodes: nodes(["n3", "3"], ["n9", "9"], ["n20", "20"], ["n15", "15"], ["n7", "7"]),
      edges: edges(["n3", "n9"], ["n3", "n20"], ["n20", "n15"], ["n20", "n7"]),
      directed: true,
      frames: [
        { caption: "pre[0] = 3 is the root. In inorder it sits at 1: [9] is left, [15, 20, 7] is right.", highlight: ["n3"], vars: kv({ pre: "0", left: "[9]", right: "[15, 20, 7]" }) },
        { caption: "pre[1] = 9 roots the left slice [9]. Nothing on either side → leaf.", highlight: ["n9"], done: ["n3"], vars: kv({ pre: "1" }) },
        { caption: "pre[2] = 20 roots the right slice. Inorder splits it into [15] and [7].", highlight: ["n20"], done: ["n3", "n9"], vars: kv({ pre: "2", left: "[15]", right: "[7]" }) },
        { caption: "pre[3] = 15 and pre[4] = 7 become the leaves of 20. Every value used once.", highlight: ["n15", "n7"], done: ["n3", "n9", "n20"], vars: kv({ pre: "5", answer: "[3, 9, 20, null, null, 15, 7]" }) },
      ],
    },
    code: `from typing import Optional

def buildTree(preorder: list[int], inorder: list[int]) -> Optional[TreeNode]:
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
    complexity: "Time O(n) · Space O(n) for the map",
  },
  {
    lc: 124,
    variation: "bottom-up-global",
    question: "Given a binary tree with possibly negative values, return the largest sum of any path between two nodes (any path, not just from the root).",
    intuition: `Same shape as Diameter, with sums. Each node returns its ==best single downward arm== (\`val + max(left, right)\`), because a parent can only extend one side. A path that ==bends at this node== is \`val + left + right\`; that updates the global \`best\`. Clamp negative arms to 0: dropping them beats adding them.`,
    algorithm: `1. Set \`best = root.val\`.
2. Define \`gain(node)\`:
   * If \`node\` is \`None\`, return \`0\`.
   * \`l = max(gain(node.left), 0)\` and \`r = max(gain(node.right), 0)\`.
   * ==\`best = max(best, node.val + l + r)\`== (path bending here).
   * Return ==\`node.val + max(l, r)\`== (one arm for the parent).
3. Call \`gain(root)\` and return \`best\`.`,
    visual: {
      kind: "graph",
      title: "Max path sum · [-10, 9, 20, null, null, 15, 7]",
      nodes: nodes(["n-10", "-10"], ["n9", "9"], ["n20", "20"], ["n15", "15"], ["n7", "7"]),
      edges: edges(["n-10", "n9"], ["n-10", "n20"], ["n20", "n15"], ["n20", "n7"]),
      directed: true,
      frames: [
        { caption: "Leaf 9: path 9 alone → best = 9. Returns arm 9.", pointers: [{ name: "cur", node: "n9" }], highlight: ["n9"], vars: kv({ "gain(9)": "9", best: "9" }) },
        { caption: "Leaves 15 and 7 return arms 15 and 7. best = 15.", highlight: ["n15", "n7"], done: ["n9"], vars: kv({ "gain(15)": "15", "gain(7)": "7", best: "15" }) },
        { caption: "At 20: bend = 20 + 15 + 7 = 42 → best = 42. Returns arm 20 + 15 = 35.", pointers: [{ name: "cur", node: "n20" }], highlight: ["n15", "n20", "n7"], done: ["n9"], vars: kv({ "gain(20)": "35", best: "42" }) },
        { caption: "At -10: bend = -10 + 9 + 35 = 34 < 42, best unchanged.", pointers: [{ name: "cur", node: "n-10" }], highlight: ["n-10", "n9", "n20"], done: ["n15", "n7"], vars: kv({ best: "42" }) },
        { caption: "Best path is 15 → 20 → 7. The root isn't on it.", highlight: ["n15", "n20", "n7"], done: ["n-10", "n9"], vars: kv({ answer: "42" }) },
      ],
    },
    code: `from typing import Optional

def maxPathSum(root: Optional[TreeNode]) -> int:
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
    complexity: "Time O(n) · Space O(h) recursion",
  },
  {
    lc: 297,
    variation: "build-encode",
    question: "Design a way to turn a binary tree into a string and rebuild the identical tree from that string.",
    intuition: `Preorder alone is ambiguous, but ==preorder with an explicit marker \`N\` for every missing child== is not: when rebuilding, each \`N\` tells you exactly where a subtree ends. Deserialize by reading tokens in the same order the serializer wrote them.`,
    algorithm: `**Serialize**

1. Preorder DFS: for a node write \`str(val)\`, then recurse left and right.
2. For \`None\` write ==\`"N"\`==.
3. Join with commas.

**Deserialize**

1. Split on commas and keep an iterator over the tokens.
2. Define \`build()\`:
   * Read the next token. If it's \`"N"\`, return \`None\`.
   * Make a node, then ==\`node.left = build()\` and \`node.right = build()\`==.
3. Return \`build()\`.`,
    visual: {
      kind: "graph",
      title: "Serialize · [1, 2, 3, null, null, 4, 5]",
      nodes: nodes(["n1", "1"], ["n2", "2"], ["n3", "3"], ["n4", "4"], ["n5", "5"]),
      edges: edges(["n1", "n2"], ["n1", "n3"], ["n3", "n4"], ["n3", "n5"]),
      directed: true,
      frames: [
        { caption: "Write 1, go left to 2. 2 has no children → write N, N.", highlight: ["n1", "n2"], vars: kv({ out: "1,2,N,N" }) },
        { caption: "Back up, go right to 3. Write 3, then its left 4 (and 4's N, N).", highlight: ["n3", "n4"], done: ["n1", "n2"], vars: kv({ out: "1,2,N,N,3,4,N,N" }) },
        { caption: "Then 5 and its N, N. Serialized string complete.", highlight: ["n5"], done: ["n1", "n2", "n3", "n4"], vars: kv({ out: "1,2,N,N,3,4,N,N,5,N,N" }) },
        { caption: "Deserialize: read 1 (root), 2 (its left), then N, N close 2's children.", pointers: [{ name: "build", node: "n2" }], highlight: ["n1", "n2"], vars: kv({ read: "1,2,N,N", next: "3" }) },
        { caption: "Next token 3 becomes 1's right; 4, N, N and 5, N, N fill its children. Same tree back.", pointers: [{ name: "build", node: "n3" }], highlight: ["n3", "n4", "n5"], done: ["n1", "n2"], vars: kv({ read: "all 11 tokens", answer: "identical tree" }) },
      ],
    },
    code: `from typing import Optional

class Codec:
    def serialize(self, root: Optional[TreeNode]) -> str:
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

    def deserialize(self, data: str) -> Optional[TreeNode]:
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
    complexity: "Time O(n) · Space O(n)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */