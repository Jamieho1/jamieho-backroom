/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "146": {
    "followUps": [
      "Can you support both get and put in average O(1) time without scanning the cache?",
      "How would expiring entries after a time-to-live interact with recency eviction?"
    ],
    "reference": {
      "title": "Hash map + nodes",
      "explanation": "You need two things in O(1): find a key, and know which key is oldest. A ==hash map gives key → node==; a ==doubly linked list keeps usage order== (left = least recent, right = most recent). Any get or put moves that node to the right end; eviction removes the node right after the left sentinel.",
      "time": "O(1) per get / put",
      "space": "O(capacity)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Timestamped recency map",
      "explanation": "Store a logical timestamp with each entry and scan for the oldest timestamp only when eviction is needed.",
      "code": "class LRUCache:\n    def __init__(self, capacity): self.capacity, self.clock, self.data = capacity, 0, {}\n    def get(self, key):\n        if key not in self.data: return -1\n        self.clock += 1\n        value, _ = self.data[key]\n        self.data[key] = (value, self.clock)\n        return value\n    def put(self, key, value):\n        self.clock += 1\n        if key not in self.data and len(self.data) == self.capacity:\n            del self.data[min(self.data, key=lambda key: self.data[key][1])]\n        self.data[key] = (value, self.clock)\n",
      "time": "O(1) get; O(capacity) eviction",
      "space": "O(capacity)",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
