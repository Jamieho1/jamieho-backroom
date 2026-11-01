import type { Extras } from "./types";

export const extras: Extras = {
  206: {
    time: { o: "O(n)", why: "n = number of nodes; the loop visits each node once and ==flips one pointer per node==." },
    space: { o: "O(1)", why: "Only `prev`, `cur` and `nxt`; the list is reversed in place." },
    pitfalls: [
      "Overwriting `cur.next` before saving it: the rest of the list is lost. Always do `nxt = cur.next` first.",
      "Returning `head` or `cur` at the end: `head` is now the tail and `cur` is None. The new head is `prev`.",
      "The recursive version is shorter but uses O(n) stack space, and with 5000 nodes it is close to Python's default recursion limit of 1000... in fact it exceeds it, so prefer the iterative loop.",
    ],
  },
  21: {
    time: { o: "O(n + m)", why: "n, m = lengths of the two lists; every node is ==attached exactly once==, and the leftover tail is linked in one step." },
    space: { o: "O(1)", why: "Nodes are spliced, not copied; only `dummy` and `tail` are new." },
    pitfalls: [
      "Skipping the dummy node: you then need special cases for which list supplies the first node and for an empty input.",
      "Forgetting `tail = tail.next` after attaching: `tail` stays on the dummy and every attach overwrites the previous one.",
      "Looping until both lists are empty and comparing values each time: once one list is None, `list1.val` crashes. Stop when either runs out and attach the rest with `list1 or list2`.",
    ],
  },
  141: {
    time: { o: "O(n)", why: "n = number of nodes; without a cycle `fast` reaches the end in n/2 steps, and with one the gap closes ==by one node per step==, so they meet within one lap." },
    space: { o: "O(1)", why: "Two pointers instead of a `visited` set of nodes." },
    pitfalls: [
      "Checking only `fast.next` (or only `fast`) in the loop condition: `fast.next.next` then crashes on lists of odd or even length. You need `while fast and fast.next`.",
      "Testing `slow == fast` before moving them: they both start at `head`, so you'd return True immediately. Move first, then compare.",
      "Comparing node values instead of node identity: two different nodes can hold the same value. Use `is` (or a set of node objects, not values).",
    ],
  },
  143: {
    time: { o: "O(n)", why: "Three linear passes: find the middle, reverse the second half, weave. ==Each is O(n)== (n = number of nodes)." },
    space: { o: "O(1)", why: "Everything is pointer rewiring; the alternative of copying nodes into an array would cost O(n)." },
    pitfalls: [
      "Forgetting `slow.next = None` after finding the middle: the first half still points into the (now reversed) second half and the weave creates a cycle.",
      "Starting `fast = head` instead of `head.next`: for even lengths `slow` stops one node later, so the first half is shorter than the second and the last node can be dropped or looped.",
      "Not saving `first.next` and `second.next` before rewiring in the weave: after `first.next = second` the original next node is unreachable.",
      "The function returns None and must modify the list in place; building and returning a new list is wrong for this problem.",
    ],
  },
  19: {
    time: { o: "O(n)", why: "n = number of nodes; `right` walks the list once and `left` follows behind, so it is ==a single pass==." },
    space: { o: "O(1)", why: "Only the dummy node and the two pointers." },
    pitfalls: [
      "Starting `left` at `head` instead of a dummy: when n equals the list length you must delete the head, and there is no node before it to rewire.",
      "Off-by-one in the gap: `left` must stop one node BEFORE the target. With `left = dummy` and `right = head`, moving `right` n times gives exactly that.",
      "Returning `head` instead of `dummy.next`: if the head was the removed node, `head` still points at it.",
    ],
  },
  138: {
    time: { o: "O(n)", why: "n = number of nodes; ==two passes==, each doing O(1) dictionary work per node." },
    space: { o: "O(n)", why: "The `copy` map stores one entry per original node (plus `None`)." },
    pitfalls: [
      "Wiring `random` in the first pass: the target node may not have a copy yet. Create all copies first, then wire.",
      "Pointing a copy's `random` at the ORIGINAL node (`copy[cur].random = cur.random`): the result shares nodes with the input, so it is not a deep copy.",
      "Forgetting `None -> None` in the map: `copy[cur.next]` on the last node raises KeyError. Seed it as the code does, or use `.get`.",
      "Keying the map by `cur.val`: values can repeat, so two different nodes would share one copy. Key by the node object.",
    ],
  },
  2: {
    time: { o: "O(max(n, m))", why: "n, m = lengths of `l1` and `l2`; the loop runs once per digit of the longer number, ==plus one more if a carry is left==." },
    space: { o: "O(1) besides the output", why: "Only `carry`, `total` and pointers; the new list itself has max(n, m) + 1 nodes at most." },
    pitfalls: [
      "Stopping when both lists are empty and ignoring `carry`: 5 + 5 returns `0` instead of `0 -> 1`. Keep `carry` in the loop condition.",
      "Reading `l1.val` after `l1` ran out: the lists can have different lengths, so treat a missing digit as 0.",
      "Converting both lists to integers, adding, then rebuilding: works in Python, but in fixed-width languages 100-digit numbers overflow, and it misses what the problem is testing.",
    ],
  },
  287: {
    time: { o: "O(n)", why: "n = len(nums) - 1; phase 1 meets ==within a few laps of the cycle== and phase 2 walks at most the tail plus one lap, both O(n)." },
    space: { o: "O(1)", why: "Only the indices `slow`, `fast` and `slow2`; the array is never modified." },
    pitfalls: [
      "Returning the meeting point from phase 1: that is just some node inside the cycle, not necessarily its entrance. You need phase 2 from index 0.",
      "Starting at `nums[0]` for one pointer and `0` for the other: both phases must start their pointers from the same origin (index 0), or the distances in Floyd's argument no longer line up.",
      "Using a `while slow != fast` loop with both starting at 0: the condition is false immediately. Move first, then check (the `while True` + `break` shape).",
      "Sorting or marking `nums[abs(x)]` as negative finds the duplicate too, but both modify the array, which the problem forbids.",
    ],
  },
  146: {
    time: { o: "O(1) per get / put", why: "The dict finds the node in O(1), and ==unlinking or inserting in a doubly linked list== only touches a constant number of pointers." },
    space: { o: "O(capacity)", why: "At most `capacity` entries in `cache`, each with one list node, plus two sentinels." },
    pitfalls: [
      "Not storing the key inside the node: when you evict `left.next` you need its key to `del self.cache[...]`.",
      "Forgetting to move the node to the most-recent end on `get`: reads must refresh recency too, otherwise you evict a key that was just used.",
      "On `put` of an existing key, inserting a new node without removing the old one: the stale node stays in the list and is later evicted, deleting the live entry from the map.",
      "Using a singly linked list or a plain list: removing a node from the middle then costs O(n). The `prev` pointer is what makes removal O(1).",
    ],
  },
  23: {
    time: { o: "O(N log k)", why: "N = total nodes, k = number of lists; each node is pushed and popped once, and ==the heap never holds more than k entries==." },
    space: { o: "O(k)", why: "The heap keeps at most one node per list; the output reuses the existing nodes." },
    pitfalls: [
      "Pushing `(node.val, node)`: on equal values Python compares the nodes next and raises TypeError. Add a tie-breaker such as the list index `i`.",
      "Not filtering out empty lists: `node.val` on a None head crashes. The input may also be `[]` or `[None]`.",
      "Merging lists one by one into a growing result is O(N · k). If you don't use a heap, merge them in pairs (divide and conquer) to get O(N log k).",
    ],
  },
  25: {
    time: { o: "O(n)", why: "n = number of nodes; each node is visited ==twice at most==: once while checking that k nodes exist, once while reversing." },
    space: { o: "O(1)", why: "Only a handful of pointers; the iterative approach avoids recursion depth n / k." },
    pitfalls: [
      "Reversing before checking that a full group of k exists: the last short group must stay as it is, so find `kth` first and stop if it hits None.",
      "Starting the reversal with `prev = None`: the reversed group's tail then points at None and the rest of the list is cut off. Start with `prev = group_next`.",
      "Advancing `group_prev` to `kth` after reconnecting: after the reversal `kth` is the group's FIRST node. The new `group_prev` is the old first node, saved before you overwrite `group_prev.next`.",
    ],
  },
};
