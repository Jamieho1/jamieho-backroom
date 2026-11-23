/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "206": {
    "followUps": [
      "Why does a recursive reversal require linear call-stack space even when it reuses the existing nodes?"
    ],
    "reference": {
      "title": "Rewire with prev / cur + dummy head",
      "explanation": "Walk the list once and ==point each node back at the one before it==. You need `prev` (where to point) and `cur` (who to change), and you must ==save `cur.next` first==, because overwriting it would lose the rest of the list. When `cur` runs off the end, `prev` is the new head.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Rebuild links from collected nodes",
      "explanation": "Collect node references, then reconnect them in reverse order and terminate the new tail.",
      "code": "class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        nodes = []\n        while head:\n            nodes.append(head)\n            head = head.next\n        for i in range(len(nodes)-1, 0, -1):\n            nodes[i].next = nodes[i-1]\n        if nodes: nodes[0].next = None\n        return nodes[-1] if nodes else None\n",
      "time": "O(n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "21": {
    "followUps": [
      "How would you merge lists whose nodes must not be modified?"
    ],
    "reference": {
      "title": "Rewire with prev / cur + dummy head",
      "explanation": "Both lists are sorted, so the next node of the answer is always ==the smaller of the two current heads==. A ==dummy node== gives `tail` somewhere to start, so you never special-case the first node. When one list runs out, the rest of the other is already sorted: attach it whole.",
      "time": "O(n + m)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Recursive merge",
      "explanation": "Choose the smaller head and recursively attach the rest of the merged list.",
      "code": "class Solution:\n    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:\n        if not list1: return list2\n        if not list2: return list1\n        if list1.val <= list2.val:\n            list1.next = self.mergeTwoLists(list1.next, list2)\n            return list1\n        list2.next = self.mergeTwoLists(list1, list2.next)\n        return list2\n",
      "time": "O(n + m)",
      "space": "O(n + m) call stack",
      "optimal": false
    }
  },
  "141": {
    "followUps": [
      "How would you return the cycle entry point using constant auxiliary space?"
    ],
    "reference": {
      "title": "Fast & slow (or gap) pointers",
      "explanation": "Move `slow` one step and `fast` two steps at a time. With no cycle, `fast` falls off the end. With a cycle, both end up circling it, and ==`fast` gains one node per step on `slow`==, so it must land on it. That's O(1) space instead of a visited set.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Remember node identities",
      "explanation": "A repeated node reference proves a cycle; equal values alone do not.",
      "code": "class Solution:\n    def hasCycle(self, head: Optional[ListNode]) -> bool:\n        seen = set()\n        while head:\n            if head in seen: return True\n            seen.add(head)\n            head = head.next\n        return False\n",
      "time": "O(n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "143": {
    "followUps": [
      "Can you explain why splitting, reversing and weaving uses only constant auxiliary space?"
    ],
    "reference": {
      "title": "Fast & slow (or gap) pointers",
      "explanation": "The order takes nodes alternately from the front and from the back. Three building blocks do it: ==find the middle with slow/fast==, ==reverse the second half==, then weave the two halves together one node at a time.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Array-guided interleaving",
      "explanation": "Collect nodes and alternate references from the beginning and the end. Finish by clearing the last next pointer.",
      "code": "class Solution:\n    def reorderList(self, head: Optional[ListNode]) -> None:\n        nodes = []\n        current = head\n        while current:\n            nodes.append(current); current = current.next\n        left, right = 0, len(nodes)-1\n        while left < right:\n            nodes[left].next = nodes[right]\n            left += 1\n            if left == right: break\n            nodes[right].next = nodes[left]\n            right -= 1\n        if nodes: nodes[left].next = None\n",
      "time": "O(n)",
      "space": "O(n)",
      "optimal": false
    }
  },
  "19": {
    "followUps": [
      "What invariant lets a fixed gap between two pointers remove the same node in one pass?"
    ],
    "reference": {
      "title": "Fast & slow (or gap) pointers",
      "explanation": "Put `right` ==n nodes ahead of `left`==, then move both together. When `right` falls off the end, `left` is exactly ==one node before== the one to delete. Starting `left` on a dummy node handles deleting the head.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Count then unlink",
      "explanation": "Use one pass to learn the list length, then walk to the predecessor of the node to remove.",
      "code": "class Solution:\n    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:\n        length = 0\n        current = head\n        while current:\n            length += 1; current = current.next\n        dummy = ListNode(0, head)\n        previous = dummy\n        for _ in range(length-n): previous = previous.next\n        previous.next = previous.next.next\n        return dummy.next\n",
      "time": "O(n)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "138": {
    "followUps": [
      "How would you copy a graph-shaped structure if next pointers could also contain cycles?"
    ],
    "reference": {
      "title": "Hash map + nodes",
      "explanation": "The hard part is a `random` pointer that points at a node you haven't copied yet. So do two passes: first ==create every copy and remember `old → new` in a map==, then wire each copy's `next` and `random` by ==looking the targets up in the map==. Mapping `None → None` removes the null checks.",
      "time": "O(n)",
      "space": "O(n)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Interleave temporary copies",
      "explanation": "Place each copy next to its source, use that adjacency to copy random links, then separate and restore the two lists.",
      "code": "class Solution:\n    def copyRandomList(self, head: 'Optional[Node]') -> 'Optional[Node]':\n        current = head\n        while current:\n            copy = Node(current.val)\n            copy.next = current.next\n            current.next = copy\n            current = copy.next\n        current = head\n        while current:\n            current.next.random = current.random.next if current.random else None\n            current = current.next.next\n        copy_head = head.next if head else None\n        current = head\n        while current:\n            copy = current.next\n            current.next = copy.next\n            copy.next = copy.next.next if copy.next else None\n            current = current.next\n        return copy_head\n",
      "time": "O(n)",
      "space": "O(1) excluding copied nodes",
      "optimal": true
    }
  },
  "2": {
    "followUps": [
      "How would you add the lists if digits were stored most-significant first?"
    ],
    "reference": {
      "title": "Rewire with prev / cur + dummy head",
      "explanation": "Digits come ones-first, which is exactly the order you add by hand. Add digit by digit with a ==`carry`==, and build the answer behind a dummy head. Keep looping ==while either list or the carry is left==, so a final carry (like 5 + 5) still makes a node.",
      "time": "O(max(n, m))",
      "space": "O(1) besides the output"
    },
    "alternative": {
      "id": "alternative",
      "title": "Convert through integer values",
      "explanation": "Read each reversed digit list as an integer, add the values, then emit a new reversed digit list. Large-integer arithmetic makes this less predictable than a carry pass.",
      "code": "class Solution:\n    def addTwoNumbers(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:\n        def value(node):\n            total, place = 0, 1\n            while node:\n                total += node.val * place\n                place *= 10\n                node = node.next\n            return total\n        number = value(l1) + value(l2)\n        dummy = tail = ListNode()\n        if number == 0: return ListNode(0)\n        while number:\n            number, digit = divmod(number, 10)\n            tail.next = ListNode(digit)\n            tail = tail.next\n        return dummy.next\n",
      "time": "O(n²) digit arithmetic bound",
      "space": "O(n)",
      "optimal": false
    }
  },
  "287": {
    "followUps": [
      "Why can counting values locate the duplicate even though the array is not sorted?"
    ],
    "reference": {
      "title": "Fast & slow (or gap) pointers",
      "explanation": "Treat each index as a node and ==`i → nums[i]` as its next pointer==. The repeated value has two arrows pointing into it, so it's ==where the cycle starts==. Floyd's algorithm finds that: slow and fast meet inside the cycle, then a new pointer from the start and slow, moving one step each, meet at the entrance.",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Value-domain binary search",
      "explanation": "Count how many values are at most a midpoint. Too many values in that range force the duplicate into its lower half. The input is never modified.",
      "code": "class Solution:\n    def findDuplicate(self, nums: List[int]) -> int:\n        left, right = 1, len(nums)-1\n        while left < right:\n            mid = (left+right)//2\n            if sum(value <= mid for value in nums) > mid:\n                right = mid\n            else:\n                left = mid+1\n        return left\n",
      "time": "O(n log n)",
      "space": "O(1)",
      "optimal": false
    }
  },
  "23": {
    "followUps": [
      "How would you merge a huge number of lists while keeping only one node from each list in memory?"
    ],
    "reference": {
      "title": "Merge k lists with a heap",
      "explanation": "The next node of the answer is always ==the smallest of the k current heads==. A min-heap of those heads gives it in O(log k). After popping a node, ==push its `next`== so that list stays represented. The list index in each tuple breaks ties, because nodes can't be compared.",
      "time": "O(N log k)",
      "space": "O(k)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Flatten, sort and relink",
      "explanation": "Collect every node, sort references by value and rebuild one sorted chain.",
      "code": "class Solution:\n    def mergeKLists(self, lists: List[Optional[ListNode]]) -> Optional[ListNode]:\n        nodes = []\n        for head in lists:\n            while head:\n                nodes.append(head); head = head.next\n        nodes.sort(key=lambda node: node.val)\n        for a, b in zip(nodes, nodes[1:]): a.next = b\n        if nodes: nodes[-1].next = None\n        return nodes[0] if nodes else None\n",
      "time": "O(N log N)",
      "space": "O(N)",
      "optimal": false
    }
  },
  "25": {
    "followUps": [
      "How do you identify a full group before changing any pointers in the constant-space version?"
    ],
    "reference": {
      "title": "Rewire with prev / cur + dummy head",
      "explanation": "It's \"reverse a list\" applied to one group at a time. Before each group, ==check that k nodes exist== (find the `kth` node). Reverse the group with `prev` starting at the node after the group, so the reversed tail already points onward. Then ==reconnect: the node before the group points at `kth`==, and the old first node becomes the next group's \"before\".",
      "time": "O(n)",
      "space": "O(1)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Reverse complete groups in an array",
      "explanation": "Use an array of node references to reverse only length-k groups, leaving an incomplete suffix untouched.",
      "code": "class Solution:\n    def reverseKGroup(self, head: Optional[ListNode], k: int) -> Optional[ListNode]:\n        nodes = []\n        while head:\n            nodes.append(head); head = head.next\n        for start in range(0, len(nodes)-k+1, k):\n            nodes[start:start+k] = reversed(nodes[start:start+k])\n        for a, b in zip(nodes, nodes[1:]): a.next = b\n        if nodes: nodes[-1].next = None\n        return nodes[0] if nodes else None\n",
      "time": "O(n)",
      "space": "O(n)",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
