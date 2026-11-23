import type {ArenaProblemSeed} from "../types";
export const arena:ArenaProblemSeed[]=[
  {
    lc: 146,
    kind: "class_design",
    statement: `Design a key-value cache with a fixed capacity that evicts the **least recently used** entry when it overflows. Implement \`LRUCache\`:

- \`LRUCache(capacity)\` creates an empty cache that holds at most \`capacity\` entries (\`capacity\` is positive).
- \`get(key)\` returns the value stored for \`key\`, or \`-1\` if the key isn't in the cache.
- \`put(key, value)\` stores \`value\` under \`key\`, replacing the old value if the key already exists. If adding a **new** key makes the cache hold more than \`capacity\` entries, remove the entry that was used least recently.

A key counts as "used" whenever it is read by a successful \`get\` or written by \`put\`. Both \`get\` and \`put\` should run in O(1) average time.

Tests use the operation-list format: a list of method names and a list of argument lists; the expected output uses JSON \`null\` for the constructor and for \`put\`.`,
    examples: [
      { input: "[\"LRUCache\", \"put\", \"put\", \"get\", \"put\", \"get\", \"get\"]\n[[2], [5, 50], [6, 60], [5], [7, 70], [6], [7]]", output: "[null, null, null, 50, null, -1, 70]", explanation: "get(5) makes 5 recent, so put(7) evicts 6." },
      { input: "[\"LRUCache\", \"put\", \"put\", \"get\"]\n[[1], [3, 1], [3, 9], [3]]", output: "[null, null, null, 9]", explanation: "Putting an existing key overwrites it without evicting anything." },
    ],
    constraints: ["1 <= capacity <= 3000", "0 <= key <= 10^4", "0 <= value <= 10^5", "At most 2 * 10^5 calls to get and put."],
    signature: `class LRUCache:

    def __init__(self, capacity: int):
        pass

    def get(self, key: int) -> int:
        pass

    def put(self, key: int, value: int) -> None:
        pass

# cache = LRUCache(2)
# cache.put(5, 50)
# value = cache.get(5)`,
    method: "LRUCache",
    tests: [
      {"id": "ex1", "input": "[[\"LRUCache\", \"put\", \"put\", \"get\", \"put\", \"get\", \"get\"], [[2], [5, 50], [6, 60], [5], [7, 70], [6], [7]]]", "operations": ["LRUCache", "put", "put", "get", "put", "get", "get"], "arguments": [[2], [5, 50], [6, 60], [5], [7, 70], [6], [7]], "expected": "[null, null, null, 50, null, -1, 70]", "visible": true},
      {"id": "ex2", "input": "[[\"LRUCache\", \"put\", \"put\", \"get\"], [[1], [3, 1], [3, 9], [3]]]", "operations": ["LRUCache", "put", "put", "get"], "arguments": [[1], [3, 1], [3, 9], [3]], "expected": "[null, null, null, 9]", "visible": true},
      {"id": "capacity-one", "input": "[[\"LRUCache\", \"put\", \"put\", \"get\", \"get\"], [[1], [1, 8], [2, 9], [1], [2]]]", "operations": ["LRUCache", "put", "put", "get", "get"], "arguments": [[1], [1, 8], [2, 9], [1], [2]], "expected": "[null, null, null, -1, 9]", "visible": false},
      {"id": "missing", "input": "[[\"LRUCache\", \"get\"], [[2], [99]]]", "operations": ["LRUCache", "get"], "arguments": [[2], [99]], "expected": "[null, -1]", "visible": false},
      {"id": "zero-value", "input": "[[\"LRUCache\", \"put\", \"get\"], [[2], [4, 0], [4]]]", "operations": ["LRUCache", "put", "get"], "arguments": [[2], [4, 0], [4]], "expected": "[null, null, 0]", "visible": false},
      {"id": "read-refresh", "input": "[[\"LRUCache\", \"put\", \"put\", \"get\", \"put\", \"get\"], [[2], [1, 1], [2, 2], [1], [3, 3], [2]]]", "operations": ["LRUCache", "put", "put", "get", "put", "get"], "arguments": [[2], [1, 1], [2, 2], [1], [3, 3], [2]], "expected": "[null, null, null, 1, null, -1]", "visible": false},
      {"id": "write-refresh", "input": "[[\"LRUCache\", \"put\", \"put\", \"put\", \"put\", \"get\", \"get\"], [[2], [1, 1], [2, 2], [1, 10], [3, 3], [1], [2]]]", "operations": ["LRUCache", "put", "put", "put", "put", "get", "get"], "arguments": [[2], [1, 1], [2, 2], [1, 10], [3, 3], [1], [2]], "expected": "[null, null, null, null, null, 10, -1]", "visible": false},
      {"id": "miss-no-refresh", "input": "[[\"LRUCache\", \"put\", \"put\", \"get\", \"put\", \"get\"], [[2], [1, 1], [2, 2], [9], [3, 3], [1]]]", "operations": ["LRUCache", "put", "put", "get", "put", "get"], "arguments": [[2], [1, 1], [2, 2], [9], [3, 3], [1]], "expected": "[null, null, null, -1, null, -1]", "visible": false},
      {"id": "empty", "input": "[[\"LRUCache\"], [[3]]]", "operations": ["LRUCache"], "arguments": [[3]], "expected": "[null]", "visible": false},
      {"id": "repeated-get", "input": "[[\"LRUCache\", \"put\", \"get\", \"get\"], [[1], [7, 4], [7], [7]]]", "operations": ["LRUCache", "put", "get", "get"], "arguments": [[1], [7, 4], [7], [7]], "expected": "[null, null, 4, 4]", "visible": false},
      {"id": "replace-full", "input": "[[\"LRUCache\", \"put\", \"put\", \"put\", \"get\", \"get\"], [[2], [1, 1], [2, 2], [2, 5], [1], [2]]]", "operations": ["LRUCache", "put", "put", "put", "get", "get"], "arguments": [[2], [1, 1], [2, 2], [2, 5], [1], [2]], "expected": "[null, null, null, null, 1, 5]", "visible": false},
      {"id": "evict-reinsert", "input": "[[\"LRUCache\", \"put\", \"put\", \"put\", \"get\"], [[1], [1, 1], [2, 2], [1, 3], [1]]]", "operations": ["LRUCache", "put", "put", "put", "get"], "arguments": [[1], [1, 1], [2, 2], [1, 3], [1]], "expected": "[null, null, null, null, 3]", "visible": false},
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
];
