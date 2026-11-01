/**
 * Arena problems: linked-list. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
 * - 206 Reverse Linked List (Easy)
 * - 21 Merge Two Sorted Lists (Easy)
 * - 141 Linked List Cycle (Easy)
 * - 143 Reorder List (Medium)
 * - 19 Remove Nth Node From End of List (Medium)
 * - 138 Copy List with Random Pointer (Medium)
 * - 2 Add Two Numbers (Medium)
 * - 287 Find the Duplicate Number (Medium)
 * - 146 LRU Cache (Medium)
 * - 23 Merge k Sorted Lists (Hard)
 * - 25 Reverse Nodes in k-Group (Hard)
 */
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 206,
    kind: "algorithm",
    statement: `You receive the \`head\` of a singly linked list. Turn the list around so that every \`next\` pointer points to the node that used to come **before** it, and return the head of the reversed list (the node that used to be last).

- An empty list (\`head\` is \`None\`) stays empty: return \`None\`.
- A list with one node is its own reverse.`,
    examples: [
      { input: "head = [3, 8, 1, 6]", output: "[6, 1, 8, 3]" },
      { input: "head = [7, 2]", output: "[2, 7]" },
      { input: "head = []", output: "[]" },
    ],
    constraints: ["The list holds between 0 and 5000 nodes.", "-5000 <= Node.val <= 5000", "Follow-up: can you write it both iteratively and recursively?"],
    signature: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:`,
    method: "reverseList",
    driver: `def run(ns, args):
    return from_list(ns["Solution"]().reverseList(to_list(args[0])))
`,
    tests: [
      { id: "ex1", input: "[[3, 8, 1, 6]]", expected: "[6, 1, 8, 3]", visible: true },
      { id: "ex2", input: "[[7, 2]]", expected: "[2, 7]", visible: true },
      { id: "ex3", input: "[[]]", expected: "[]", visible: true },
      { id: "single", input: "[[42]]", expected: "[42]", visible: false },
      { id: "dups", input: "[[1, 1, 2, 2, 1]]", expected: "[1, 2, 2, 1, 1]", visible: false },
      { id: "neg", input: "[[-5, 0, 5, -1]]", expected: "[-1, 5, 0, -5]", visible: false },
      { id: "odd", input: "[[1, 2, 3, 4, 5, 6, 7]]", expected: "[7, 6, 5, 4, 3, 2, 1]", visible: false },
      { id: "big", input: "[list(range(5000))]", expected: "list(range(4999, -1, -1))", visible: false },
    ],
    solution: `class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        prev, cur = None, head
        while cur:
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
        return prev`,
    hints: ["You only need to change each node's `next` pointer; no new nodes are required.", "Keep track of the previous node and the current node as you walk.", "Before overwriting `cur.next`, save it, or you lose the rest of the list."],
    clarify: [
      { question: "Should I create new nodes or reuse the existing ones?", answer: "Reuse them: rewire the existing nodes in place." },
      { question: "What do I return for an empty list?", answer: "Return None (an empty list)." },
    ],
  },
  {
    lc: 21,
    kind: "algorithm",
    statement: `You are given the heads of two singly linked lists, \`list1\` and \`list2\`, each already sorted in **non-decreasing** order. Combine them into a single sorted list by linking together the existing nodes of both lists, and return the head of the combined list.

- Either list (or both) may be empty.
- Equal values may appear in both lists; all of them must be kept.`,
    examples: [
      { input: "list1 = [1, 4, 9], list2 = [2, 3, 10]", output: "[1, 2, 3, 4, 9, 10]" },
      { input: "list1 = [], list2 = [0]", output: "[0]" },
      { input: "list1 = [], list2 = []", output: "[]" },
    ],
    constraints: ["Each list holds between 0 and 50 nodes.", "-100 <= Node.val <= 100", "Both lists are sorted in non-decreasing order."],
    signature: `class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:`,
    method: "mergeTwoLists",
    driver: `def run(ns, args):
    return from_list(ns["Solution"]().mergeTwoLists(to_list(args[0]), to_list(args[1])))
`,
    tests: [
      { id: "ex1", input: "[[1, 4, 9], [2, 3, 10]]", expected: "[1, 2, 3, 4, 9, 10]", visible: true },
      { id: "ex2", input: "[[], [0]]", expected: "[0]", visible: true },
      { id: "ex3", input: "[[], []]", expected: "[]", visible: true },
      { id: "left-only", input: "[[5, 6], []]", expected: "[5, 6]", visible: false },
      { id: "all-less", input: "[[5], [1, 2, 3]]", expected: "[1, 2, 3, 5]", visible: false },
      { id: "dups", input: "[[1, 1, 3], [1, 2, 3]]", expected: "[1, 1, 1, 2, 3, 3]", visible: false },
      { id: "neg", input: "[[-100, -3, 0], [-50, -3, 100]]", expected: "[-100, -50, -3, -3, 0, 100]", visible: false },
      { id: "big", input: "[list(range(0, 100, 2)), list(range(1, 100, 2))]", expected: "list(range(100))", visible: false },
    ],
    solution: `class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = tail = ListNode()
        while list1 and list2:
            if list1.val <= list2.val:
                tail.next, list1 = list1, list1.next
            else:
                tail.next, list2 = list2, list2.next
            tail = tail.next
        tail.next = list1 or list2
        return dummy.next`,
    hints: ["Compare the two current heads; the smaller one must come next in the answer.", "A dummy node in front of the result removes the special case for the first node.", "When one list runs out, attach the rest of the other list in one step."],
    clarify: [
      { question: "Can I allocate new nodes?", answer: "The intended solution reuses the existing nodes; only the values in the returned list are checked." },
      { question: "What if values tie?", answer: "Either one may go first; both must appear." },
    ],
  },
  {
    lc: 141,
    kind: "algorithm",
    statement: `You get the \`head\` of a singly linked list. Decide whether the list contains a **cycle**: some node can be reached again by repeatedly following \`next\` pointers. Return \`True\` if there is a cycle, otherwise \`False\`.

- In the examples and tests, the list is shown as its values plus an index \`pos\`: the last node's \`next\` points back to the node at index \`pos\`. \`pos = -1\` means the last node points to \`None\` (no cycle).
- \`pos\` is **not** passed to your function; you only get \`head\`.
- Node values may repeat, so equal values do not mean you've seen the same node.`,
    examples: [
      { input: "head = [5, 1, 7, 3], pos = 2", output: "True", explanation: "The tail (3) links back to the node holding 7." },
      { input: "head = [4, 9], pos = -1", output: "False" },
      { input: "head = [8], pos = 0", output: "True", explanation: "The only node points at itself." },
    ],
    constraints: ["The list holds between 0 and 10^4 nodes.", "-10^5 <= Node.val <= 10^5", "pos is -1 or a valid index into the list.", "Follow-up: can you do it with O(1) extra memory?"],
    signature: `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:`,
    method: "hasCycle",
    driver: `def run(ns, args):
    return ns["Solution"]().hasCycle(to_list(args[0], args[1]))
`,
    tests: [
      { id: "ex1", input: "[[5, 1, 7, 3], 2]", expected: "True", visible: true },
      { id: "ex2", input: "[[4, 9], -1]", expected: "False", visible: true },
      { id: "ex3", input: "[[8], 0]", expected: "True", visible: true },
      { id: "empty", input: "[[], -1]", expected: "False", visible: false },
      { id: "single", input: "[[1], -1]", expected: "False", visible: false },
      { id: "two-loop", input: "[[1, 2], 0]", expected: "True", visible: false },
      { id: "same-vals", input: "[[1, 1, 1, 1], -1]", expected: "False", visible: false },
      { id: "big-head", input: "[list(range(10000)), 0]", expected: "True", visible: false },
      { id: "big-none", input: "[list(range(10000)), -1]", expected: "False", visible: false },
      { id: "big-tail", input: "[list(range(10000)), 9999]", expected: "True", visible: false },
    ],
    solution: `class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow = fast = head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow is fast:
                return True
        return False`,
    hints: ["A set of visited nodes (not values) works, but costs O(n) memory.", "Move one pointer one step at a time and another two steps at a time.", "If the fast pointer reaches the end there is no cycle; if it ever lands on the slow one, there is."],
    clarify: [
      { question: "Do I receive pos?", answer: "No. pos only describes how the test list is built; your function only sees head." },
      { question: "Can values repeat?", answer: "Yes, so compare nodes by identity, not by value." },
    ],
  },
  {
    lc: 143,
    kind: "algorithm",
    statement: `You get the \`head\` of a singly linked list whose nodes, in order, are \`N0, N1, N2, ..., Nk\`. Rearrange the nodes **in place** so the order becomes:

\`N0, Nk, N1, Nk-1, N2, Nk-2, ...\`

that is, alternate between taking a node from the front and a node from the back until every node is used.

- Change only the \`next\` links. Do not modify any node's value and do not create new nodes.
- The function returns nothing; the list starting at \`head\` is checked afterwards.`,
    examples: [
      { input: "head = [10, 20, 30, 40]", output: "[10, 40, 20, 30]" },
      { input: "head = [1, 2, 3, 4, 5]", output: "[1, 5, 2, 4, 3]" },
    ],
    constraints: ["The list holds between 1 and 5 * 10^4 nodes.", "1 <= Node.val <= 1000"],
    signature: `class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:`,
    method: "reorderList",
    driver: `def _relinked(head, orig):
    # walk the result; fail loudly on a loop or on a node whose value was overwritten
    out = []
    while head is not None:
        if len(out) > len(orig):
            return "CYCLE"
        if id(head) in orig and orig[id(head)] != head.val:
            return "VALUES_CHANGED"
        out.append(head.val)
        head = head.next
    return out

def run(ns, args):
    head = to_list(args[0])
    orig = {}
    cur = head
    while cur is not None:
        orig[id(cur)] = cur.val
        cur = cur.next
    ns["Solution"]().reorderList(head)
    return _relinked(head, orig)
`,
    tests: [
      { id: "ex1", input: "[[10, 20, 30, 40]]", expected: "[10, 40, 20, 30]", visible: true },
      { id: "ex2", input: "[[1, 2, 3, 4, 5]]", expected: "[1, 5, 2, 4, 3]", visible: true },
      { id: "single", input: "[[9]]", expected: "[9]", visible: false },
      { id: "two", input: "[[1, 2]]", expected: "[1, 2]", visible: false },
      { id: "three", input: "[[1, 2, 3]]", expected: "[1, 3, 2]", visible: false },
      { id: "dups", input: "[[7, 7, 7, 8]]", expected: "[7, 8, 7, 7]", visible: false },
      { id: "six", input: "[[6, 5, 4, 3, 2, 1]]", expected: "[6, 1, 5, 2, 4, 3]", visible: false },
      { id: "big", input: "[list(range(1, 1001))]", expected: "[x for i in range(500) for x in (i + 1, 1000 - i)]", visible: false },
    ],
    solution: `class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:
        # 1) find the middle
        slow, fast = head, head.next
        while fast and fast.next:
            slow, fast = slow.next, fast.next.next
        # 2) reverse the second half
        second, slow.next = slow.next, None
        prev = None
        while second:
            nxt = second.next
            second.next = prev
            prev, second = second, nxt
        # 3) weave the two halves together
        first, second = head, prev
        while second:
            n1, n2 = first.next, second.next
            first.next = second
            second.next = n1
            first, second = n1, n2`,
    hints: ["The back half of the list is needed in reverse order.", "Find the middle with slow/fast pointers, then reverse everything after it.", "Now merge the two halves by alternating one node from each."],
    clarify: [
      { question: "Can I just swap values?", answer: "No, rearrange the nodes themselves; values must stay attached to their nodes." },
      { question: "Do I return anything?", answer: "No, modify the list in place; the list from head is checked." },
    ],
  },
  {
    lc: 19,
    kind: "algorithm",
    statement: `You get the \`head\` of a singly linked list and an integer \`n\`. Delete the node that is \`n\`-th **counting from the end** (\`n = 1\` is the last node, \`n = length\` is the first node) and return the head of the resulting list.

- If the deleted node was the only node, return \`None\`.
- \`n\` is always between 1 and the list's length.`,
    examples: [
      { input: "head = [9, 8, 7, 6, 5], n = 2", output: "[9, 8, 7, 5]", explanation: "The 2nd node from the end holds 6." },
      { input: "head = [4], n = 1", output: "[]" },
      { input: "head = [4, 5], n = 2", output: "[5]" },
    ],
    constraints: ["The list holds sz nodes, 1 <= sz <= 30.", "0 <= Node.val <= 100", "1 <= n <= sz", "Follow-up: can you do it in one pass?"],
    signature: `class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:`,
    method: "removeNthFromEnd",
    driver: `def run(ns, args):
    return from_list(ns["Solution"]().removeNthFromEnd(to_list(args[0]), args[1]))
`,
    tests: [
      { id: "ex1", input: "[[9, 8, 7, 6, 5], 2]", expected: "[9, 8, 7, 5]", visible: true },
      { id: "ex2", input: "[[4], 1]", expected: "[]", visible: true },
      { id: "ex3", input: "[[4, 5], 2]", expected: "[5]", visible: true },
      { id: "last", input: "[[4, 5], 1]", expected: "[4]", visible: false },
      { id: "first", input: "[[1, 2, 3], 3]", expected: "[2, 3]", visible: false },
      { id: "middle", input: "[[1, 2, 3], 2]", expected: "[1, 3]", visible: false },
      { id: "dups", input: "[[3, 3, 3, 3], 1]", expected: "[3, 3, 3]", visible: false },
      { id: "big-first", input: "[list(range(30)), 30]", expected: "list(range(1, 30))", visible: false },
      { id: "big-mid", input: "[list(range(30)), 15]", expected: "[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29]", visible: false },
    ],
    solution: `class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        lead = trail = dummy
        for _ in range(n):
            lead = lead.next
        while lead.next:
            lead, trail = lead.next, trail.next
        trail.next = trail.next.next
        return dummy.next`,
    hints: ["Two passes work: count the length, then walk to the node just before the target.", "For one pass, start one pointer n steps ahead of another; when the leader hits the end, the trailer is just before the target.", "A dummy node before head handles deleting the first node cleanly."],
    clarify: [
      { question: "Is n always valid?", answer: "Yes, 1 <= n <= length of the list." },
      { question: "What if the list becomes empty?", answer: "Return None." },
    ],
  },
  {
    lc: 138,
    kind: "algorithm",
    statement: `Each node of this linked list has a value, a \`next\` pointer, and an extra \`random\` pointer that may point to **any** node of the same list or be \`None\`. The node class is:

\`\`\`python
class Node:
    def __init__(self, x: int, next: 'Node' = None, random: 'Node' = None):
        self.val = int(x)
        self.next = next
        self.random = random
\`\`\`

Build a **deep copy** of the list: a brand-new set of nodes, one per original node, with the same values, where every copied \`next\` and \`random\` pointer points to the corresponding **copied** node. Return the head of the copy.

- No pointer in the copy may refer to a node of the original list.
- The original list must be left exactly as it was.
- In examples and tests a list is written as \`[[val, random_index], ...]\`, where \`random_index\` is the position (0-based) of the node that \`random\` points to, or \`None\`.`,
    examples: [
      { input: "head = [[3, None], [5, 0], [9, 1]]", output: "[[3, None], [5, 0], [9, 1]]", explanation: "Node 5's random points to node 3, node 9's to node 5; the copy has the same shape with new nodes." },
      { input: "head = [[1, 1], [2, 1]]", output: "[[1, 1], [2, 1]]" },
      { input: "head = []", output: "[]" },
    ],
    constraints: ["The list holds between 0 and 1000 nodes.", "-10^4 <= Node.val <= 10^4", "Node.random is None or points to a node in the list."],
    signature: `class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':`,
    method: "copyRandomList",
    prelude: `class Node:
    def __init__(self, x: int, next: 'Node' = None, random: 'Node' = None):
        self.val = int(x)
        self.next = next
        self.random = random
`,
    driver: `def run(ns, args):
    data = args[0]
    nodes = [Node(v) for v, _ in data]
    for a, b in zip(nodes, nodes[1:]):
        a.next = b
    for node, (_, r) in zip(nodes, data):
        node.random = nodes[r] if r is not None else None
    original = {id(x) for x in nodes}
    snapshot = [(x.val, x.next, x.random) for x in nodes]
    copy = ns["Solution"]().copyRandomList(nodes[0] if nodes else None)
    if [(x.val, x.next, x.random) for x in nodes] != snapshot:
        return "ORIGINAL_MODIFIED"
    seq = []
    cur = copy
    while cur is not None:
        if id(cur) in original:
            return "SHARED"
        if len(seq) > len(nodes):
            return "CYCLE"
        seq.append(cur)
        cur = cur.next
    index = {id(x): i for i, x in enumerate(seq)}
    out = []
    for x in seq:
        if x.random is None:
            out.append([x.val, None])
        elif id(x.random) in index:
            out.append([x.val, index[id(x.random)]])
        else:
            return "RANDOM_OUTSIDE_COPY"
    return out
`,
    tests: [
      { id: "ex1", input: "[[[3, None], [5, 0], [9, 1]]]", expected: "[[3, None], [5, 0], [9, 1]]", visible: true },
      { id: "ex2", input: "[[[1, 1], [2, 1]]]", expected: "[[1, 1], [2, 1]]", visible: true },
      { id: "ex3", input: "[[]]", expected: "[]", visible: true },
      { id: "self", input: "[[[6, 0]]]", expected: "[[6, 0]]", visible: false },
      { id: "single-none", input: "[[[6, None]]]", expected: "[[6, None]]", visible: false },
      { id: "dup-vals", input: "[[[2, 2], [2, None], [2, 0]]]", expected: "[[2, 2], [2, None], [2, 0]]", visible: false },
      { id: "no-random", input: "[[[1, None], [2, None], [3, None]]]", expected: "[[1, None], [2, None], [3, None]]", visible: false },
      { id: "all-to-tail", input: "[[[-1, 3], [0, 3], [1, 3], [2, 3]]]", expected: "[[-1, 3], [0, 3], [1, 3], [2, 3]]", visible: false },
      { id: "big", input: "[[[i, (i * 7) % 1000] for i in range(1000)]]", expected: "[[i, (i * 7) % 1000] for i in range(1000)]", visible: false },
    ],
    solution: `class Solution:
    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':
        clone = {None: None}
        cur = head
        while cur:
            clone[cur] = Node(cur.val)
            cur = cur.next
        cur = head
        while cur:
            clone[cur].next = clone[cur.next]
            clone[cur].random = clone[cur.random]
            cur = cur.next
        return clone[head]`,
    hints: ["The hard part is that a random pointer may point to a node you haven't copied yet.", "Do two passes: first create a copy of every node, then wire up next and random.", "A hash map from original node to its copy makes the second pass easy (map None to None too)."],
    clarify: [
      { question: "Can the copy reuse any original node?", answer: "No. Every node in the copy must be new, and the original list must be unchanged." },
      { question: "Can random point to the node itself?", answer: "Yes, and it can also be None." },
    ],
  },
  {
    lc: 2,
    kind: "algorithm",
    statement: `Two non-negative integers are stored as singly linked lists, one decimal digit per node, with the digits in **reverse order** (the head holds the ones digit). Add the two numbers and return their sum as a linked list in the same reversed-digit format.

- Neither number has leading zeros, except the number 0 itself, which is the single node \`[0]\`.
- The two lists may have different lengths.
- The result must not have extra leading zeros (no trailing zero nodes after the most significant digit).`,
    examples: [
      { input: "l1 = [4, 1, 3], l2 = [7, 2]", output: "[1, 4, 3]", explanation: "314 + 27 = 341." },
      { input: "l1 = [0], l2 = [0]", output: "[0]" },
      { input: "l1 = [9, 9, 9], l2 = [1]", output: "[0, 0, 0, 1]", explanation: "999 + 1 = 1000." },
    ],
    constraints: ["Each list holds between 1 and 100 nodes.", "0 <= Node.val <= 9", "No leading zeros except for the number 0 itself."],
    signature: `class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:`,
    method: "addTwoNumbers",
    driver: `def run(ns, args):
    return from_list(ns["Solution"]().addTwoNumbers(to_list(args[0]), to_list(args[1])))
`,
    tests: [
      { id: "ex1", input: "[[4, 1, 3], [7, 2]]", expected: "[1, 4, 3]", visible: true },
      { id: "ex2", input: "[[0], [0]]", expected: "[0]", visible: true },
      { id: "ex3", input: "[[9, 9, 9], [1]]", expected: "[0, 0, 0, 1]", visible: true },
      { id: "carry-one", input: "[[5], [5]]", expected: "[0, 1]", visible: false },
      { id: "short-left", input: "[[1], [9, 9, 9, 9]]", expected: "[0, 0, 0, 0, 1]", visible: false },
      { id: "no-carry", input: "[[2, 3, 4], [5, 6, 1]]", expected: "[7, 9, 5]", visible: false },
      { id: "zero-plus", input: "[[0], [3, 7]]", expected: "[3, 7]", visible: false },
      { id: "big", input: "[[9] * 100, [1]]", expected: "[0] * 100 + [1]", visible: false },
      { id: "big-both", input: "[[9] * 100, [9] * 100]", expected: "[8] + [9] * 99 + [1]", visible: false },
    ],
    solution: `class Solution:
    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = tail = ListNode()
        carry = 0
        while l1 or l2 or carry:
            total = carry
            if l1:
                total += l1.val
                l1 = l1.next
            if l2:
                total += l2.val
                l2 = l2.next
            carry, digit = divmod(total, 10)
            tail.next = ListNode(digit)
            tail = tail.next
        return dummy.next`,
    hints: ["The lists are already in the order you'd add by hand: ones digit first.", "Walk both lists together, adding digit + digit + carry.", "Keep looping while either list has nodes or a carry is left over."],
    clarify: [
      { question: "Can I convert to integers and back?", answer: "It works in Python, but the intended approach is digit-by-digit addition with a carry." },
      { question: "Can the lists be different lengths?", answer: "Yes; treat a missing digit as 0." },
    ],
  },
  {
    lc: 287,
    kind: "algorithm",
    statement: `You get an array \`nums\` of length \`n + 1\` whose values are all integers in the range \`[1, n]\`. By the pigeonhole principle some value appears more than once; in these inputs **exactly one value** is repeated (it may appear two or more times). Return that repeated value.

- Do not modify \`nums\`.
- Aim for O(1) extra space (beyond a few variables).`,
    examples: [
      { input: "nums = [2, 5, 1, 4, 3, 5]", output: "5" },
      { input: "nums = [1, 1]", output: "1" },
      { input: "nums = [3, 3, 3, 3]", output: "3", explanation: "One value may appear more than twice." },
    ],
    constraints: ["1 <= n <= 10^5", "nums.length == n + 1", "1 <= nums[i] <= n", "Exactly one value appears more than once.", "Follow-up: O(1) extra space without modifying nums, in better than O(n^2) time."],
    signature: `class Solution:
    def findDuplicate(self, nums: List[int]) -> int:`,
    method: "findDuplicate",
    tests: [
      { id: "ex1", input: "[[2, 5, 1, 4, 3, 5]]", expected: "5", visible: true },
      { id: "ex2", input: "[[1, 1]]", expected: "1", visible: true },
      { id: "ex3", input: "[[3, 3, 3, 3]]", expected: "3", visible: true },
      { id: "front", input: "[[2, 1, 2]]", expected: "2", visible: false },
      { id: "triple", input: "[[1, 4, 4, 2, 4]]", expected: "4", visible: false },
      { id: "one-is-dup", input: "[[1, 3, 4, 1, 2]]", expected: "1", visible: false },
      { id: "n-is-dup", input: "[[6, 1, 2, 3, 4, 5, 6]]", expected: "6", visible: false },
      { id: "big", input: "[list(range(1, 100001)) + [77777]]", expected: "77777", visible: false },
      { id: "big-front", input: "[[50000] + list(range(1, 100001))]", expected: "50000", visible: false },
    ],
    solution: `class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        # treat i -> nums[i] as a linked list; the duplicate is where the cycle starts
        slow = fast = 0
        while True:
            slow = nums[slow]
            fast = nums[nums[fast]]
            if slow == fast:
                break
        slow2 = 0
        while slow != slow2:
            slow = nums[slow]
            slow2 = nums[slow2]
        return slow`,
    hints: ["Sorting or a set is easy, but breaks the 'don't modify' or 'O(1) space' rule.", "Think of each index i as a node whose next is nums[i]. Starting from index 0, you can never return to 0, but you must eventually loop.", "The loop's entry point is the duplicate value: find it with Floyd's fast/slow pointers, then restart one pointer from 0 and move both one step until they meet."],
    clarify: [
      { question: "Can the duplicate appear more than twice?", answer: "Yes, but it's the only value that repeats." },
      { question: "May I sort the array?", answer: "No, nums must not be modified." },
    ],
  },
  {
    lc: 146,
    kind: "class_design",
    statement: `Design a key-value cache with a fixed capacity that evicts the **least recently used** entry when it overflows. Implement \`LRUCache\`:

- \`LRUCache(capacity)\` creates an empty cache that holds at most \`capacity\` entries (\`capacity\` is positive).
- \`get(key)\` returns the value stored for \`key\`, or \`-1\` if the key isn't in the cache.
- \`put(key, value)\` stores \`value\` under \`key\`, replacing the old value if the key already exists. If adding a **new** key makes the cache hold more than \`capacity\` entries, remove the entry that was used least recently.

A key counts as "used" whenever it is read by a successful \`get\` or written by \`put\`. Both \`get\` and \`put\` should run in O(1) average time.

Tests use the operation-list format: a list of method names and a list of argument lists; the expected output has \`None\` for the constructor and for \`put\`.`,
    examples: [
      { input: "[\"LRUCache\", \"put\", \"put\", \"get\", \"put\", \"get\", \"get\"]\n[[2], [5, 50], [6, 60], [5], [7, 70], [6], [7]]", output: "[None, None, None, 50, None, -1, 70]", explanation: "get(5) makes 5 recent, so put(7) evicts 6." },
      { input: "[\"LRUCache\", \"put\", \"put\", \"get\"]\n[[1], [3, 1], [3, 9], [3]]", output: "[None, None, None, 9]", explanation: "Putting an existing key overwrites it without evicting anything." },
    ],
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5", "At most 2 * 10^5 calls to get and put."],
    signature: `class LRUCache:

    def __init__(self, capacity: int):

    def get(self, key: int) -> int:

    def put(self, key: int, value: int) -> None:`,
    method: "LRUCache",
    driver: `def run(ns, args):
    return replay(ns, args[0], args[1])
`,
    tests: [
      { id: "ex1", input: "[[\"LRUCache\", \"put\", \"put\", \"get\", \"put\", \"get\", \"get\"], [[2], [5, 50], [6, 60], [5], [7, 70], [6], [7]]]", expected: "[None, None, None, 50, None, -1, 70]", visible: true },
      { id: "ex2", input: "[[\"LRUCache\", \"put\", \"put\", \"get\"], [[1], [3, 1], [3, 9], [3]]]", expected: "[None, None, None, 9]", visible: true },
      { id: "cap1", input: "[[\"LRUCache\", \"put\", \"get\", \"put\", \"get\", \"get\"], [[1], [1, 1], [1], [2, 2], [1], [2]]]", expected: "[None, None, 1, None, -1, 2]", visible: false },
      { id: "miss", input: "[[\"LRUCache\", \"get\", \"put\", \"get\", \"get\"], [[2], [4], [4, 0], [4], [5]]]", expected: "[None, -1, None, 0, -1]", visible: false },
      { id: "update-refreshes", input: "[[\"LRUCache\", \"put\", \"put\", \"put\", \"put\", \"get\", \"get\", \"get\"], [[2], [1, 1], [2, 2], [1, 10], [3, 3], [1], [2], [3]]]", expected: "[None, None, None, None, None, 10, -1, 3]", visible: false },
      { id: "get-miss-no-refresh", input: "[[\"LRUCache\", \"put\", \"put\", \"get\", \"put\", \"get\", \"get\", \"get\"], [[2], [1, 1], [2, 2], [9], [3, 3], [1], [2], [3]]]", expected: "[None, None, None, -1, None, -1, 2, 3]", visible: false },
      { id: "chain", input: "[[\"LRUCache\", \"put\", \"put\", \"put\", \"get\", \"put\", \"get\", \"get\", \"get\", \"get\"], [[3], [1, 1], [2, 2], [3, 3], [1], [4, 4], [2], [3], [4], [1]]]", expected: "[None, None, None, None, 1, None, -1, 3, 4, 1]", visible: false },
      { id: "big", input: "[[\"LRUCache\"] + [\"put\"] * 1000 + [\"get\"] * 1000, [[10]] + [[i, i] for i in range(1000)] + [[i] for i in range(1000)]]", expected: "[None] * 1001 + [-1] * 990 + list(range(990, 1000))", visible: false },
    ],
    solution: `class LRUCache:

    def __init__(self, capacity: int):
        self.cap = capacity
        self.data = OrderedDict()  # least recent first

    def get(self, key: int) -> int:
        if key not in self.data:
            return -1
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key: int, value: int) -> None:
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) > self.cap:
            self.data.popitem(last=False)`,
    hints: ["You need O(1) lookup by key AND O(1) 'move to most recent' / 'remove least recent'.", "Combine a hash map (key -> node) with a doubly linked list ordered by recency.", "Sentinel head/tail nodes make insert and remove branch-free. (In Python, OrderedDict already gives you both.)"],
    clarify: [
      { question: "Does a get on a missing key change anything?", answer: "No, it just returns -1." },
      { question: "Does put on an existing key count as a use?", answer: "Yes, it updates the value and makes that key the most recent." },
    ],
  },
  {
    lc: 23,
    kind: "algorithm",
    statement: `You receive an array \`lists\` of \`k\` singly linked lists, each sorted in **non-decreasing** order. Merge all of them into one sorted linked list and return its head.

- \`lists\` may be empty, and any of the lists in it may be empty.
- If there are no nodes at all, return \`None\`.`,
    examples: [
      { input: "lists = [[1, 5, 9], [2, 6], [3, 4, 10]]", output: "[1, 2, 3, 4, 5, 6, 9, 10]" },
      { input: "lists = []", output: "[]" },
      { input: "lists = [[], [1], []]", output: "[1]" },
    ],
    constraints: ["0 <= k <= 10^4", "Each list holds between 0 and 500 nodes.", "-10^4 <= Node.val <= 10^4", "Each list is sorted in non-decreasing order.", "The total number of nodes is at most 10^4."],
    signature: `class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:`,
    method: "mergeKLists",
    driver: `def run(ns, args):
    return from_list(ns["Solution"]().mergeKLists([to_list(x) for x in args[0]]))
`,
    tests: [
      { id: "ex1", input: "[[[1, 5, 9], [2, 6], [3, 4, 10]]]", expected: "[1, 2, 3, 4, 5, 6, 9, 10]", visible: true },
      { id: "ex2", input: "[[]]", expected: "[]", visible: true },
      { id: "ex3", input: "[[[], [1], []]]", expected: "[1]", visible: true },
      { id: "one-empty", input: "[[[]]]", expected: "[]", visible: false },
      { id: "single", input: "[[[1, 2, 3]]]", expected: "[1, 2, 3]", visible: false },
      { id: "dups", input: "[[[1, 1, 2], [1, 2, 2], [2]]]", expected: "[1, 1, 1, 2, 2, 2, 2]", visible: false },
      { id: "neg", input: "[[[-10, -5, 0], [-7], [-10, 10]]]", expected: "[-10, -10, -7, -5, 0, 10]", visible: false },
      { id: "big", input: "[[list(range(i, 1000, 10)) for i in range(10)]]", expected: "list(range(1000))", visible: false },
      { id: "many", input: "[[[i] for i in range(999, -1, -1)]]", expected: "list(range(1000))", visible: false },
    ],
    solution: `class Solution:
    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:
        heap = [(node.val, i, node) for i, node in enumerate(lists) if node]
        heapq.heapify(heap)
        dummy = tail = ListNode()
        while heap:
            _, i, node = heapq.heappop(heap)
            tail.next = tail = node
            if node.next:
                heapq.heappush(heap, (node.next.val, i, node.next))
        return dummy.next`,
    hints: ["Merging two sorted lists is easy; how do you pick the smallest among k heads quickly?", "Keep the current head of every list in a min-heap.", "Pop the smallest, append it, and push that node's successor. Add a tie-breaker so the heap never compares nodes."],
    clarify: [
      { question: "Can lists be empty, or contain empty lists?", answer: "Both; return None if there are no nodes." },
      { question: "What complexity is expected?", answer: "O(N log k) for N total nodes, using a heap or pairwise divide and conquer." },
    ],
  },
  {
    lc: 25,
    kind: "algorithm",
    statement: `You get the \`head\` of a singly linked list and a positive integer \`k\`. Split the list into consecutive groups of \`k\` nodes from the start, and reverse the order of nodes **inside each full group**. If the last group has fewer than \`k\` nodes, leave it exactly as it is. Return the head of the modified list.

- Rearrange the nodes themselves; do not change node values.
- \`k\` never exceeds the length of the list.`,
    examples: [
      { input: "head = [1, 2, 3, 4, 5, 6, 7], k = 3", output: "[3, 2, 1, 6, 5, 4, 7]", explanation: "Two full groups get reversed; the lone 7 stays." },
      { input: "head = [1, 2, 3, 4], k = 2", output: "[2, 1, 4, 3]" },
    ],
    constraints: ["The list holds n nodes, 1 <= k <= n <= 5000.", "0 <= Node.val <= 1000", "Follow-up: can you use only O(1) extra memory?"],
    signature: `class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:`,
    method: "reverseKGroup",
    driver: `def _relinked(head, orig):
    # walk the result; fail loudly on a loop or on a node whose value was overwritten
    out = []
    while head is not None:
        if len(out) > len(orig):
            return "CYCLE"
        if id(head) in orig and orig[id(head)] != head.val:
            return "VALUES_CHANGED"
        out.append(head.val)
        head = head.next
    return out

def run(ns, args):
    head = to_list(args[0])
    orig = {}
    cur = head
    while cur is not None:
        orig[id(cur)] = cur.val
        cur = cur.next
    return _relinked(ns["Solution"]().reverseKGroup(head, args[1]), orig)
`,
    tests: [
      { id: "ex1", input: "[[1, 2, 3, 4, 5, 6, 7], 3]", expected: "[3, 2, 1, 6, 5, 4, 7]", visible: true },
      { id: "ex2", input: "[[1, 2, 3, 4], 2]", expected: "[2, 1, 4, 3]", visible: true },
      { id: "k1", input: "[[5, 6, 7], 1]", expected: "[5, 6, 7]", visible: false },
      { id: "k-n", input: "[[5, 6, 7], 3]", expected: "[7, 6, 5]", visible: false },
      { id: "single", input: "[[0], 1]", expected: "[0]", visible: false },
      { id: "leftover", input: "[[1, 2, 3, 4, 5], 2]", expected: "[2, 1, 4, 3, 5]", visible: false },
      { id: "dups", input: "[[2, 2, 3, 3, 3], 2]", expected: "[2, 2, 3, 3, 3]", visible: false },
      { id: "big", input: "[list(range(5000)), 1000]", expected: "[x for b in range(5) for x in range(b * 1000 + 999, b * 1000 - 1, -1)]", visible: false },
      { id: "big-left", input: "[list(range(5000)), 3]", expected: "[x for b in range(1666) for x in (3 * b + 2, 3 * b + 1, 3 * b)] + [4998, 4999]", visible: false },
    ],
    solution: `class Solution:
    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:
        dummy = ListNode(0, head)
        group_prev = dummy
        while True:
            # find the k-th node of this group
            kth = group_prev
            for _ in range(k):
                kth = kth.next
                if not kth:
                    return dummy.next
            group_next = kth.next
            # reverse the group, pointing its first node at group_next
            prev, cur = group_next, group_prev.next
            while cur is not group_next:
                nxt = cur.next
                cur.next = prev
                prev, cur = cur, nxt
            first = group_prev.next
            group_prev.next = kth
            group_prev = first`,
    hints: ["Before reversing a group, check that k nodes actually remain.", "Reverse a group the usual way, but start 'prev' at the node after the group so the reversed group is already attached to the rest.", "Keep a pointer to the node before the group (start with a dummy) to reconnect it to the group's new first node."],
    clarify: [
      { question: "What happens to a final group shorter than k?", answer: "It stays in its original order." },
      { question: "Can I swap values instead of nodes?", answer: "No, only change links; values stay with their nodes." },
    ],
  },
];
