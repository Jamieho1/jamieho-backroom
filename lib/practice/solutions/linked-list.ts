/**
 * linked-list: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
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
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));

export const variations: Variation[] = [
  {
    id: "rewire",
    topic: "linked-list",
    name: "Rewire with prev / cur + dummy head",
    change: "Base pattern. Walk the list and ==change `.next` pointers in place==, saving `nxt` before you overwrite it. A ==dummy head== means the first node needs no special case.",
    problems: [206, 21, 2, 25],
  },
  {
    id: "fast-slow",
    topic: "linked-list",
    name: "Fast & slow (or gap) pointers",
    change: "Two pointers move at ==different speeds or with a fixed gap==: they meet inside a cycle, the slow one stops at the middle, or the trailing one stops n nodes from the end.",
    problems: [141, 143, 19, 287],
  },
  {
    id: "hash-nodes",
    topic: "linked-list",
    name: "Hash map + nodes",
    change: "Pair the list with a ==hash map that points at nodes==: old node → copy (deep copy), or key → node in a doubly linked list (LRU), so you jump to any node in O(1).",
    problems: [138, 146],
  },
  {
    id: "merge-k",
    topic: "linked-list",
    name: "Merge k lists with a heap",
    change: "Merging two lists generalises to k: keep ==one head per list in a min-heap== and always pop the smallest.",
    problems: [23],
  },
];

export const solutions: Solution[] = [
  {
    lc: 206,
    variation: "rewire",
    question: "Given the head of a singly linked list, reverse it and return the new head.",
    intuition: `Walk the list once and ==point each node back at the one before it==. You need \`prev\` (where to point) and \`cur\` (who to change), and you must ==save \`cur.next\` first==, because overwriting it would lose the rest of the list. When \`cur\` runs off the end, \`prev\` is the new head.`,
    algorithm: `1. Set \`prev = None\`, \`cur = head\`.
2. While \`cur\`:
   * Save \`nxt = cur.next\`.
   * ==\`cur.next = prev\`== (flip the arrow).
   * Move on: \`prev = cur\`, \`cur = nxt\`.
3. Return \`prev\`.`,
    visual: {
      kind: "array",
      title: "Reverse 1 → 2 → 3",
      values: ["1", "2", "3"],
      frames: [
        { caption: "Start: prev = ∅, cur on 1.", pointers: [{ name: "cur", index: 0 }], vars: kv({ reversed: "∅", rest: "1 → 2 → 3" }) },
        { caption: "Save nxt = 2, point 1 at ∅. prev = 1, cur = 2.", pointers: [{ name: "prev", index: 0 }, { name: "cur", index: 1 }], done: [0], vars: kv({ reversed: "1 → ∅", rest: "2 → 3" }) },
        { caption: "Save nxt = 3, point 2 at 1. prev = 2, cur = 3.", pointers: [{ name: "prev", index: 1 }, { name: "cur", index: 2 }], done: [0, 1], vars: kv({ reversed: "2 → 1 → ∅", rest: "3" }) },
        { caption: "Point 3 at 2. cur = ∅ → stop, prev = 3 is the new head.", pointers: [{ name: "prev", index: 2 }], done: [0, 1, 2], vars: kv({ reversed: "3 → 2 → 1 → ∅" }) },
        { caption: "Read from the new head: 3 → 2 → 1.", values: ["3", "2", "1"], pointers: [{ name: "head", index: 0 }], done: [0, 1, 2], vars: kv({ answer: "3 → 2 → 1" }) },
      ],
    },
    code: `def reverseList(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return prev`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 21,
    variation: "rewire",
    question: "Given two sorted linked lists, splice them together into one sorted list and return its head.",
    intuition: `Both lists are sorted, so the next node of the answer is always ==the smaller of the two current heads==. A ==dummy node== gives \`tail\` somewhere to start, so you never special-case the first node. When one list runs out, the rest of the other is already sorted: attach it whole.`,
    algorithm: `1. Create \`dummy = ListNode()\` and \`tail = dummy\`.
2. While both \`list1\` and \`list2\` are non-empty:
   * If \`list1.val <= list2.val\`, attach \`list1\` and advance it.
   * Otherwise attach \`list2\` and advance it.
   * Move \`tail = tail.next\`.
3. ==Attach whichever list is left==: \`tail.next = list1 or list2\`.
4. Return \`dummy.next\`.`,
    visual: {
      kind: "array",
      title: "Merge [1, 2, 4] and [1, 3, 4]",
      values: ["1", "2", "4", "|", "1", "3", "4"],
      frames: [
        { caption: "1 vs 1 → tie, take list1's 1.", pointers: [{ name: "p1", index: 0 }, { name: "p2", index: 4 }], highlight: [0], vars: kv({ merged: "1" }) },
        { caption: "2 vs 1 → take list2's 1.", pointers: [{ name: "p1", index: 1 }, { name: "p2", index: 4 }], highlight: [4], done: [0], vars: kv({ merged: "1 → 1" }) },
        { caption: "2 vs 3 → take 2.", pointers: [{ name: "p1", index: 1 }, { name: "p2", index: 5 }], highlight: [1], done: [0, 4], vars: kv({ merged: "1 → 1 → 2" }) },
        { caption: "4 vs 3 → take 3.", pointers: [{ name: "p1", index: 2 }, { name: "p2", index: 5 }], highlight: [5], done: [0, 1, 4], vars: kv({ merged: "1 → 1 → 2 → 3" }) },
        { caption: "4 vs 4 → take list1's 4. list1 is now empty.", pointers: [{ name: "p1", index: 2 }, { name: "p2", index: 6 }], highlight: [2], done: [0, 1, 4, 5], vars: kv({ merged: "1 → 1 → 2 → 3 → 4" }) },
        { caption: "Attach the rest of list2 (just 4) in one step.", pointers: [{ name: "p2", index: 6 }], highlight: [6], done: [0, 1, 2, 4, 5], vars: kv({ answer: "1 → 1 → 2 → 3 → 4 → 4" }) },
      ],
    },
    code: `def mergeTwoLists(list1, list2):
    dummy = tail = ListNode()
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next, list1 = list1, list1.next
        else:
            tail.next, list2 = list2, list2.next
        tail = tail.next
    tail.next = list1 or list2
    return dummy.next`,
    complexity: "Time O(n + m) · Space O(1)",
  },
  {
    lc: 141,
    variation: "fast-slow",
    question: "Given the head of a linked list, say whether following next pointers ever loops back to an earlier node.",
    intuition: `Move \`slow\` one step and \`fast\` two steps at a time. With no cycle, \`fast\` falls off the end. With a cycle, both end up circling it, and ==\`fast\` gains one node per step on \`slow\`==, so it must land on it. That's O(1) space instead of a visited set.`,
    algorithm: `1. Set \`slow = fast = head\`.
2. While \`fast\` and \`fast.next\`:
   * \`slow = slow.next\`, \`fast = fast.next.next\`.
   * If ==\`slow is fast\`==, return \`True\`.
3. Return \`False\` (fast reached the end).`,
    visual: {
      kind: "graph",
      title: "Cycle check · 3 → 2 → 0 → −4 → back to 2",
      nodes: [
        { id: "a", label: "3" },
        { id: "b", label: "2" },
        { id: "c", label: "0" },
        { id: "d", label: "−4" },
      ],
      edges: [
        { from: "a", to: "b" },
        { from: "b", to: "c" },
        { from: "c", to: "d" },
        { from: "d", to: "b" },
      ],
      directed: true,
      frames: [
        { caption: "Both start at the head.", pointers: [{ name: "slow", node: "a" }, { name: "fast", node: "a" }] },
        { caption: "slow +1 → 2, fast +2 → 0.", pointers: [{ name: "slow", node: "b" }, { name: "fast", node: "c" }], done: ["a"] },
        { caption: "slow → 0, fast goes −4 → 2 (it wrapped around the loop).", pointers: [{ name: "slow", node: "c" }, { name: "fast", node: "b" }], highlight: ["d", "b"] },
        { caption: "slow → −4, fast → 0 → −4. Same node → cycle, return True.", pointers: [{ name: "slow", node: "d" }, { name: "fast", node: "d" }], highlight: ["d"], vars: kv({ answer: "True" }) },
      ],
    },
    code: `def hasCycle(head) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 143,
    variation: "fast-slow",
    question: "Rearrange a linked list in place so it goes first, last, second, second-last, and so on.",
    intuition: `The order takes nodes alternately from the front and from the back. Three building blocks do it: ==find the middle with slow/fast==, ==reverse the second half==, then weave the two halves together one node at a time.`,
    algorithm: `1. Find the middle: \`slow = head\`, \`fast = head.next\`; while \`fast\` and \`fast.next\`, move slow 1 and fast 2.
2. Split: \`second = slow.next\`, then \`slow.next = None\`.
3. ==Reverse \`second\`== with prev / cur.
4. ==Weave==: with \`first = head\` and \`second\` = reversed head, while \`second\`:
   * Save \`t1 = first.next\`, \`t2 = second.next\`.
   * \`first.next = second\`, \`second.next = t1\`.
   * \`first, second = t1, t2\`.`,
    visual: {
      kind: "array",
      title: "Reorder 1 → 2 → 3 → 4 → 5",
      values: ["1", "2", "3", "4", "5"],
      frames: [
        { caption: "slow on 1, fast on 2.", pointers: [{ name: "slow", index: 0 }, { name: "fast", index: 1 }] },
        { caption: "Two moves: slow 1 → 2 → 3, fast 2 → 4 → ∅. fast is done → slow (3) ends the first half.", pointers: [{ name: "slow", index: 2 }], highlight: [2] },
        { caption: "Cut after 3, reverse 4 → 5 into 5 → 4.", values: ["1", "2", "3", "|", "5", "4"], pointers: [{ name: "first", index: 0 }, { name: "second", index: 4 }], range: [4, 5], vars: kv({ first: "1 → 2 → 3", second: "5 → 4" }) },
        { caption: "Weave: 1 → 5 → 2. Move first to 2, second to 4.", values: ["1", "2", "3", "|", "5", "4"], pointers: [{ name: "first", index: 1 }, { name: "second", index: 5 }], done: [0, 4], vars: kv({ list: "1 → 5 → 2 → 3" }) },
        { caption: "Weave: 2 → 4 → 3. second is empty → done.", values: ["1", "5", "2", "4", "3"], done: [0, 1, 2, 3, 4], vars: kv({ answer: "1 → 5 → 2 → 4 → 3" }) },
      ],
    },
    code: `def reorderList(head) -> None:
    if not head:
        return
    slow, fast = head, head.next
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    second = slow.next
    slow.next = None
    prev = None
    while second:
        nxt = second.next
        second.next = prev
        prev, second = second, nxt
    first, second = head, prev
    while second:
        t1, t2 = first.next, second.next
        first.next = second
        second.next = t1
        first, second = t1, t2`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 19,
    variation: "fast-slow",
    question: "Remove the node that sits n places from the end of a linked list, in one pass, and return the head.",
    intuition: `Put \`right\` ==n nodes ahead of \`left\`==, then move both together. When \`right\` falls off the end, \`left\` is exactly ==one node before== the one to delete. Starting \`left\` on a dummy node handles deleting the head.`,
    algorithm: `1. Create \`dummy = ListNode(0, head)\`; set \`left = dummy\`, \`right = head\`.
2. ==Move \`right\` forward n times==.
3. While \`right\`: move both \`left\` and \`right\` one step.
4. ==Skip the target==: \`left.next = left.next.next\`.
5. Return \`dummy.next\`.`,
    visual: {
      kind: "array",
      title: "Remove 2nd from end · dummy → 1 → 2 → 3 → 4 → 5",
      values: ["D", "1", "2", "3", "4", "5"],
      frames: [
        { caption: "left on dummy, right on the head.", pointers: [{ name: "left", index: 0 }, { name: "right", index: 1 }] },
        { caption: "Move right n = 2 steps → gap of 2 between them.", pointers: [{ name: "left", index: 0 }, { name: "right", index: 3 }], range: [1, 2] },
        { caption: "Move both: left → 1, right → 4.", pointers: [{ name: "left", index: 1 }, { name: "right", index: 4 }] },
        { caption: "Move both: left → 2, right → 5.", pointers: [{ name: "left", index: 2 }, { name: "right", index: 5 }] },
        { caption: "Move both: left → 3, right → ∅. Stop: the target 4 is left.next.", pointers: [{ name: "left", index: 3 }], highlight: [4] },
        { caption: "left.next = left.next.next skips 4.", values: ["D", "1", "2", "3", "5"], pointers: [{ name: "left", index: 3 }], done: [1, 2, 3, 4], vars: kv({ answer: "1 → 2 → 3 → 5" }) },
      ],
    },
    code: `def removeNthFromEnd(head, n: int):
    dummy = ListNode(0, head)
    left, right = dummy, head
    for _ in range(n):
        right = right.next
    while right:
        left, right = left.next, right.next
    left.next = left.next.next
    return dummy.next`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 138,
    variation: "hash-nodes",
    question: "Make a deep copy of a linked list where every node also has a random pointer to any node or to nothing.",
    intuition: `The hard part is a \`random\` pointer that points at a node you haven't copied yet. So do two passes: first ==create every copy and remember \`old → new\` in a map==, then wire each copy's \`next\` and \`random\` by ==looking the targets up in the map==. Mapping \`None → None\` removes the null checks.`,
    algorithm: `1. Create \`copy = {None: None}\`.
2. Pass 1: for each node \`cur\`, ==\`copy[cur] = Node(cur.val)\`==.
3. Pass 2: for each node \`cur\`:
   * \`copy[cur].next = copy[cur.next]\`.
   * ==\`copy[cur].random = copy[cur.random]\`==.
4. Return \`copy[head]\`.`,
    visual: {
      kind: "graph",
      title: "Copy with random · 7 → 13 → 11",
      nodes: [
        { id: "a", label: "7" },
        { id: "b", label: "13" },
        { id: "c", label: "11" },
        { id: "a2", label: "7'" },
        { id: "b2", label: "13'" },
        { id: "c2", label: "11'" },
      ],
      edges: [
        { from: "a", to: "b", label: "next" },
        { from: "b", to: "c", label: "next" },
        { from: "b", to: "a", label: "rand" },
        { from: "c", to: "b", label: "rand" },
        { from: "a2", to: "b2", label: "next" },
        { from: "b2", to: "c2", label: "next" },
        { from: "b2", to: "a2", label: "rand" },
        { from: "c2", to: "b2", label: "rand" },
      ],
      directed: true,
      frames: [
        { caption: "Pass 1: copy 7 → 7'. No wiring yet.", pointers: [{ name: "cur", node: "a" }], highlight: ["a2"], vars: kv({ map: "7→7'" }) },
        { caption: "Copy 13 and 11 too. Every node now has a copy in the map.", pointers: [{ name: "cur", node: "c" }], highlight: ["b2", "c2"], done: ["a2"], vars: kv({ map: "7→7', 13→13', 11→11'" }) },
        { caption: "Pass 2, 7: next = map[13] = 13', random = map[∅] = ∅.", pointers: [{ name: "cur", node: "a" }], highlight: ["a2", "b2"], done: ["c2"] },
        { caption: "13: next = map[11] = 11', random = map[7] = 7'.", pointers: [{ name: "cur", node: "b" }], highlight: ["b2", "c2", "a2"] },
        { caption: "11: next = ∅, random = map[13] = 13'. Return map[head] = 7'.", pointers: [{ name: "cur", node: "c" }], highlight: ["c2", "b2"], done: ["a2", "b2", "c2"], vars: kv({ answer: "7'" }) },
      ],
    },
    code: `def copyRandomList(head):
    copy = {None: None}
    cur = head
    while cur:
        copy[cur] = Node(cur.val)
        cur = cur.next
    cur = head
    while cur:
        copy[cur].next = copy[cur.next]
        copy[cur].random = copy[cur.random]
        cur = cur.next
    return copy[head]`,
    complexity: "Time O(n) · Space O(n)",
  },
  {
    lc: 2,
    variation: "rewire",
    question: "Two non-negative numbers are stored as linked lists of digits, ones digit first. Return their sum as a list in the same format.",
    intuition: `Digits come ones-first, which is exactly the order you add by hand. Add digit by digit with a ==\`carry\`==, and build the answer behind a dummy head. Keep looping ==while either list or the carry is left==, so a final carry (like 5 + 5) still makes a node.`,
    algorithm: `1. Create \`dummy = tail = ListNode()\` and \`carry = 0\`.
2. ==While \`l1\` or \`l2\` or \`carry\`==:
   * \`total = (l1.val if l1 else 0) + (l2.val if l2 else 0) + carry\`.
   * \`carry, digit = divmod(total, 10)\`.
   * Append \`ListNode(digit)\` at \`tail\` and move \`tail\`.
   * Advance \`l1\` and \`l2\` if they exist.
3. Return \`dummy.next\`.`,
    visual: {
      kind: "grid",
      title: "Add 342 + 465 (stored 2→4→3 and 5→6→4)",
      rows: [
        [2, 4, 3],
        [5, 6, 4],
        ["", "", ""],
      ],
      rowLabels: ["l1", "l2", "sum"],
      colLabels: ["ones", "tens", "hundreds"],
      frames: [
        { caption: "Ones: 2 + 5 + 0 = 7 → digit 7, carry 0.", highlight: ["0,0", "1,0"], cells: [{ at: "2,0", value: 7 }], vars: kv({ carry: "0" }) },
        { caption: "Tens: 4 + 6 + 0 = 10 → digit 0, carry 1.", highlight: ["0,1", "1,1"], cells: [{ at: "2,1", value: 0 }], done: ["2,0"], vars: kv({ carry: "1" }) },
        { caption: "Hundreds: 3 + 4 + 1 = 8 → digit 8, carry 0.", highlight: ["0,2", "1,2"], cells: [{ at: "2,2", value: 8 }], done: ["2,0", "2,1"], vars: kv({ carry: "0" }) },
        { caption: "Both lists done and carry is 0 → stop. 342 + 465 = 807.", done: ["2,0", "2,1", "2,2"], vars: kv({ answer: "7 → 0 → 8" }) },
      ],
    },
    code: `def addTwoNumbers(l1, l2):
    dummy = tail = ListNode()
    carry = 0
    while l1 or l2 or carry:
        total = (l1.val if l1 else 0) + (l2.val if l2 else 0) + carry
        carry, digit = divmod(total, 10)
        tail.next = ListNode(digit)
        tail = tail.next
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
    return dummy.next`,
    complexity: "Time O(max(n, m)) · Space O(1) besides the output",
  },
  {
    lc: 287,
    variation: "fast-slow",
    question: "An array of n + 1 integers holds values 1..n with one value repeated; find it without changing the array and in O(1) extra space.",
    intuition: `Treat each index as a node and ==\`i → nums[i]\` as its next pointer==. The repeated value has two arrows pointing into it, so it's ==where the cycle starts==. Floyd's algorithm finds that: slow and fast meet inside the cycle, then a new pointer from the start and slow, moving one step each, meet at the entrance.`,
    algorithm: `1. Phase 1: \`slow = fast = 0\`. Repeat:
   * \`slow = nums[slow]\`, \`fast = nums[nums[fast]]\`.
   * Stop when \`slow == fast\`.
2. Phase 2: ==\`slow2 = 0\`==. Repeat:
   * \`slow = nums[slow]\`, \`slow2 = nums[slow2]\`.
   * ==When \`slow == slow2\`, return it==: that's the duplicate.`,
    visual: {
      kind: "graph",
      title: "Find duplicate · nums = [1, 3, 4, 2, 2]",
      nodes: [
        { id: "0", label: "i0 → 1" },
        { id: "1", label: "i1 → 3" },
        { id: "2", label: "i2 → 4" },
        { id: "3", label: "i3 → 2" },
        { id: "4", label: "i4 → 2" },
      ],
      edges: [
        { from: "0", to: "1" },
        { from: "1", to: "3" },
        { from: "3", to: "2" },
        { from: "2", to: "4" },
        { from: "4", to: "2" },
      ],
      directed: true,
      frames: [
        { caption: "Index i points to nums[i]. 3 and 4 both point to 2 → cycle 2 ↔ 4.", pointers: [{ name: "slow", node: "0" }, { name: "fast", node: "0" }], highlight: ["3", "4"] },
        { caption: "Phase 1: slow → 1, fast → 3.", pointers: [{ name: "slow", node: "1" }, { name: "fast", node: "3" }] },
        { caption: "slow → 3, fast → 2 → 4.", pointers: [{ name: "slow", node: "3" }, { name: "fast", node: "4" }] },
        { caption: "slow → 2, fast → 2 → 4.", pointers: [{ name: "slow", node: "2" }, { name: "fast", node: "4" }] },
        { caption: "slow → 4, fast → 2 → 4. They meet at 4.", pointers: [{ name: "slow", node: "4" }, { name: "fast", node: "4" }], highlight: ["4"] },
        { caption: "Phase 2: slow2 from 0. One step each: slow → 2, slow2 → 1.", pointers: [{ name: "slow", node: "2" }, { name: "slow2", node: "1" }] },
        { caption: "slow → 4, slow2 → 3.", pointers: [{ name: "slow", node: "4" }, { name: "slow2", node: "3" }] },
        { caption: "slow → 2, slow2 → 2. They meet at the cycle entrance → duplicate is 2.", pointers: [{ name: "slow", node: "2" }, { name: "slow2", node: "2" }], highlight: ["2"], vars: kv({ answer: "2" }) },
      ],
    },
    code: `def findDuplicate(nums: list[int]) -> int:
    slow = fast = 0
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow2 = 0
    while True:
        slow = nums[slow]
        slow2 = nums[slow2]
        if slow == slow2:
            return slow`,
    complexity: "Time O(n) · Space O(1)",
  },
  {
    lc: 146,
    variation: "hash-nodes",
    question: "Design a fixed-capacity key-value cache with O(1) get and put that evicts the least recently used key when full.",
    intuition: `You need two things in O(1): find a key, and know which key is oldest. A ==hash map gives key → node==; a ==doubly linked list keeps usage order== (left = least recent, right = most recent). Any get or put moves that node to the right end; eviction removes the node right after the left sentinel.`,
    algorithm: `1. Init: \`cache = {}\`, sentinels \`left\` (LRU side) and \`right\` (MRU side) linked to each other.
2. Helpers:
   * \`remove(node)\`: link \`node.prev\` and \`node.next\` together.
   * \`insert(node)\`: put \`node\` just before \`right\`.
3. \`get(key)\`:
   * Missing → return -1.
   * Otherwise ==\`remove\` then \`insert\`== the node (now most recent) and return its value.
4. \`put(key, value)\`:
   * If the key exists, \`remove\` its old node.
   * Create a node, store it in \`cache\`, \`insert\` it.
   * ==If \`len(cache) > capacity\`==: take \`lru = left.next\`, \`remove\` it and delete \`cache[lru.key]\`.`,
    visual: {
      kind: "array",
      title: "LRU cache, capacity 2 · list from LRU to MRU",
      values: ["LRU", "MRU"],
      frames: [
        { caption: "put(1, 1): new node goes next to the MRU end.", values: ["LRU", "1:1", "MRU"], highlight: [1], vars: kv({ cache: "{1}" }) },
        { caption: "put(2, 2): inserted at the MRU end. 1 is now least recent.", values: ["LRU", "1:1", "2:2", "MRU"], highlight: [2], vars: kv({ cache: "{1, 2}" }) },
        { caption: "get(1) → 1. Remove its node and re-insert at the MRU end.", values: ["LRU", "2:2", "1:1", "MRU"], highlight: [2], vars: kv({ cache: "{1, 2}", returned: "1" }) },
        { caption: "put(3, 3): size 3 > 2 → evict left.next = 2.", values: ["LRU", "1:1", "3:3", "MRU"], highlight: [2], vars: kv({ cache: "{1, 3}", evicted: "2" }) },
        { caption: "get(2) → not in the map → -1.", values: ["LRU", "1:1", "3:3", "MRU"], vars: kv({ cache: "{1, 3}", returned: "-1" }) },
      ],
    },
    code: `class DNode:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None


class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.cache = {}  # key -> node
        self.left, self.right = DNode(), DNode()  # left = LRU, right = MRU
        self.left.next, self.right.prev = self.right, self.left

    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _insert(self, node):
        prev = self.right.prev
        prev.next = node
        node.prev, node.next = prev, self.right
        self.right.prev = node

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        node = self.cache[key]
        self._remove(node)
        self._insert(node)
        return node.val

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self._remove(self.cache[key])
        node = DNode(key, value)
        self.cache[key] = node
        self._insert(node)
        if len(self.cache) > self.cap:
            lru = self.left.next
            self._remove(lru)
            del self.cache[lru.key]`,
    complexity: "Time O(1) per get / put · Space O(capacity)",
  },
  {
    lc: 23,
    variation: "merge-k",
    question: "Given k sorted linked lists, merge them all into one sorted linked list.",
    intuition: `The next node of the answer is always ==the smallest of the k current heads==. A min-heap of those heads gives it in O(log k). After popping a node, ==push its \`next\`== so that list stays represented. The list index in each tuple breaks ties, because nodes can't be compared.`,
    algorithm: `1. Push \`(node.val, i, node)\` for each non-empty list into \`heap\`.
2. Create \`dummy = tail = ListNode()\`.
3. While \`heap\`:
   * ==Pop the smallest== \`(val, i, node)\` and attach it: \`tail.next = node\`, \`tail = node\`.
   * If \`node.next\`, ==push \`(node.next.val, i, node.next)\`==.
4. Return \`dummy.next\`.`,
    visual: {
      kind: "grid",
      title: "Merge [1,4,5], [1,3,4], [2,6] with a min-heap",
      rows: [
        [1, 4, 5],
        [1, 3, 4],
        [2, 6, ""],
      ],
      rowLabels: ["list 0", "list 1", "list 2"],
      frames: [
        { caption: "Push each list's head into the heap.", highlight: ["0,0", "1,0", "2,0"], vars: kv({ heap: "1(L0) 1(L1) 2(L2)", out: "" }) },
        { caption: "Pop 1 from list 0, push its next (4).", highlight: ["0,1", "1,0", "2,0"], done: ["0,0"], vars: kv({ heap: "1(L1) 2(L2) 4(L0)", out: "1" }) },
        { caption: "Pop 1 from list 1, push 3.", highlight: ["0,1", "1,1", "2,0"], done: ["0,0", "1,0"], vars: kv({ heap: "2(L2) 3(L1) 4(L0)", out: "1 1" }) },
        { caption: "Pop 2 from list 2, push 6.", highlight: ["0,1", "1,1", "2,1"], done: ["0,0", "1,0", "2,0"], vars: kv({ heap: "3(L1) 4(L0) 6(L2)", out: "1 1 2" }) },
        { caption: "Pop 3, push list 1's 4. Then pop 4 (L0), push 5.", highlight: ["0,2", "1,2", "2,1"], done: ["0,0", "0,1", "1,0", "1,1", "2,0"], vars: kv({ heap: "4(L1) 5(L0) 6(L2)", out: "1 1 2 3 4" }) },
        { caption: "Pop 4 (L1), 5 (L0), 6 (L2): each list runs out, the heap empties.", done: ["0,0", "0,1", "0,2", "1,0", "1,1", "1,2", "2,0", "2,1"], vars: kv({ heap: "empty", answer: "1 1 2 3 4 4 5 6" }) },
      ],
    },
    code: `import heapq

def mergeKLists(lists):
    heap = [(node.val, i, node) for i, node in enumerate(lists) if node]
    heapq.heapify(heap)
    dummy = tail = ListNode()
    while heap:
        _, i, node = heapq.heappop(heap)
        tail.next = node
        tail = node
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next`,
    complexity: "Time O(N log k) for N nodes in total · Space O(k)",
  },
  {
    lc: 25,
    variation: "rewire",
    question: "Reverse a linked list k nodes at a time, leaving any final group shorter than k as it is.",
    intuition: `It's "reverse a list" applied to one group at a time. Before each group, ==check that k nodes exist== (find the \`kth\` node). Reverse the group with \`prev\` starting at the node after the group, so the reversed tail already points onward. Then ==reconnect: the node before the group points at \`kth\`==, and the old first node becomes the next group's "before".`,
    algorithm: `1. Create \`dummy = ListNode(0, head)\`; set \`group_prev = dummy\`.
2. Loop:
   * ==Walk k steps from \`group_prev\` to find \`kth\`==; if you hit \`None\`, return \`dummy.next\`.
   * Let \`group_next = kth.next\`.
   * Reverse the group: \`prev = group_next\`, \`cur = group_prev.next\`; while \`cur is not group_next\`, flip \`cur.next = prev\` and step.
   * ==Reconnect==: \`first = group_prev.next\`, \`group_prev.next = kth\`, \`group_prev = first\`.`,
    visual: {
      kind: "array",
      title: "Reverse in groups of k = 2 · 1 → 2 → 3 → 4 → 5",
      values: ["D", "1", "2", "3", "4", "5"],
      frames: [
        { caption: "group_prev on dummy. Walk 2 steps → kth = 2, so a full group exists.", pointers: [{ name: "gprev", index: 0 }, { name: "kth", index: 2 }], range: [1, 2] },
        { caption: "Reverse 1, 2 (1 now points at 3). Dummy → 2. group_prev moves to 1.", values: ["D", "2", "1", "3", "4", "5"], pointers: [{ name: "gprev", index: 2 }], done: [1, 2] },
        { caption: "Walk 2 from 1 → kth = 4. Full group 3, 4.", values: ["D", "2", "1", "3", "4", "5"], pointers: [{ name: "gprev", index: 2 }, { name: "kth", index: 4 }], range: [3, 4], done: [1, 2] },
        { caption: "Reverse 3, 4. Node 1 → 4. group_prev moves to 3.", values: ["D", "2", "1", "4", "3", "5"], pointers: [{ name: "gprev", index: 4 }], done: [1, 2, 3, 4] },
        { caption: "Walk 2 from 3: only 5 is left, then ∅ → short group stays. Return dummy.next.", values: ["D", "2", "1", "4", "3", "5"], pointers: [{ name: "gprev", index: 4 }], highlight: [5], done: [1, 2, 3, 4], vars: kv({ answer: "2 → 1 → 4 → 3 → 5" }) },
      ],
    },
    code: `def reverseKGroup(head, k: int):
    dummy = ListNode(0, head)
    group_prev = dummy
    while True:
        kth = group_prev
        for _ in range(k):
            kth = kth.next
            if not kth:
                return dummy.next
        group_next = kth.next
        prev, cur = group_next, group_prev.next
        while cur is not group_next:
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
        first = group_prev.next
        group_prev.next = kth
        group_prev = first`,
    complexity: "Time O(n) · Space O(1)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */