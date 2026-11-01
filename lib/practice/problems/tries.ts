/**
 * Arena problems: tries. Same problems as LeetCode, our own words, verified tests (see ../types.ts).
 * - 208 Implement Trie (Prefix Tree) (Medium)
 * - 211 Design Add and Search Words Data Structure (Medium)
 * - 212 Word Search II (Hard)
 */
import type { ArenaProblem } from "../types";

export const arena: ArenaProblem[] = [
  {
    lc: 208,
    kind: "class_design",
    statement: `A **trie** (prefix tree) stores strings so that lookups by whole word or by prefix are fast. Implement \`Trie\`:

- \`Trie()\` creates an empty trie.
- \`insert(word)\` adds \`word\` to the trie. Inserting the same word twice is allowed and has no extra effect.
- \`search(word)\` returns \`True\` only if \`word\` itself was inserted earlier (being a prefix of an inserted word is **not** enough).
- \`startsWith(prefix)\` returns \`True\` if **at least one** inserted word begins with \`prefix\` (a word counts as its own prefix).

Tests use the operation-list format: the first list names the calls, the second gives each call's arguments; the expected output lists each call's return value (\`None\` for the constructor and \`insert\`).`,
    examples: [
      { input: "ops = [\"Trie\",\"insert\",\"search\",\"search\",\"startsWith\",\"insert\",\"search\"], args = [[],[\"card\"],[\"car\"],[\"card\"],[\"car\"],[\"car\"],[\"car\"]]", output: "[None, None, False, True, True, None, True]", explanation: "\"car\" is only a prefix until it is inserted itself." },
      { input: "ops = [\"Trie\",\"startsWith\",\"search\",\"insert\",\"startsWith\"], args = [[],[\"a\"],[\"a\"],[\"b\"],[\"a\"]]", output: "[None, False, False, None, False]", explanation: "Nothing starting with a is ever inserted." },
    ],
    constraints: ["1 <= word.length, prefix.length <= 2000", "Only lowercase English letters", "At most 3 * 10^4 calls in total"],
    signature: `class Trie:

    def __init__(self):


    def insert(self, word: str) -> None:


    def search(self, word: str) -> bool:


    def startsWith(self, prefix: str) -> bool:`,
    method: "Trie",
    driver: `def run(ns, args):
    return replay(ns, args[0], args[1])
`,
    tests: [
      { id: "ex1", input: "[[\"Trie\", \"insert\", \"search\", \"search\", \"startsWith\", \"insert\", \"search\"], [[], [\"card\"], [\"car\"], [\"card\"], [\"car\"], [\"car\"], [\"car\"]]]", expected: "[None, None, False, True, True, None, True]", visible: true },
      { id: "ex2", input: "[[\"Trie\", \"startsWith\", \"search\", \"insert\", \"startsWith\"], [[], [\"a\"], [\"a\"], [\"b\"], [\"a\"]]]", expected: "[None, False, False, None, False]", visible: true },
      { id: "own-prefix", input: "[[\"Trie\", \"insert\", \"startsWith\", \"search\"], [[], [\"tree\"], [\"tree\"], [\"tree\"]]]", expected: "[None, None, True, True]", visible: false },
      { id: "longer-query", input: "[[\"Trie\", \"insert\", \"search\", \"startsWith\"], [[], [\"app\"], [\"apple\"], [\"apple\"]]]", expected: "[None, None, False, False]", visible: false },
      { id: "branching", input: "[[\"Trie\", \"insert\", \"insert\", \"insert\", \"search\", \"search\", \"startsWith\", \"startsWith\", \"search\"], [[], [\"to\"], [\"tea\"], [\"ten\"], [\"te\"], [\"ten\"], [\"te\"], [\"ta\"], [\"to\"]]]", expected: "[None, None, None, None, False, True, True, False, True]", visible: false },
      { id: "duplicate-insert", input: "[[\"Trie\", \"insert\", \"insert\", \"search\", \"startsWith\"], [[], [\"xy\"], [\"xy\"], [\"xy\"], [\"x\"]]]", expected: "[None, None, None, True, True]", visible: false },
      { id: "single-letters", input: "[[\"Trie\", \"insert\", \"search\", \"search\", \"startsWith\"], [[], [\"z\"], [\"z\"], [\"y\"], [\"zz\"]]]", expected: "[None, None, True, False, False]", visible: false },
      { id: "big", input: "[[\"Trie\"] + [\"insert\"] * 2000 + [\"search\", \"search\", \"startsWith\", \"startsWith\"], [[]] + [[\"w\" + str(i).replace(\"0\", \"a\").replace(\"1\", \"b\").replace(\"2\", \"c\").replace(\"3\", \"d\").replace(\"4\", \"e\").replace(\"5\", \"f\").replace(\"6\", \"g\").replace(\"7\", \"h\").replace(\"8\", \"i\").replace(\"9\", \"j\")] for i in range(2000)] + [[\"wbjjj\"], [\"wbjjjj\"], [\"wbj\"], [\"wk\"]]]", expected: "[None] * 2001 + [True, False, True, False]", visible: false },
    ],
    solution: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.end = False


class Trie:

    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        cur = self.root
        for c in word:
            if c not in cur.children:
                cur.children[c] = TrieNode()
            cur = cur.children[c]
        cur.end = True

    def _walk(self, s: str):
        cur = self.root
        for c in s:
            if c not in cur.children:
                return None
            cur = cur.children[c]
        return cur

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and node.end

    def startsWith(self, prefix: str) -> bool:
        return self._walk(prefix) is not None`,
    hints: ["Each node holds a map from character to child node.", "Mark the node where a word ends so search can tell a full word from a prefix.", "search and startsWith share the same walk; they differ only in whether the final node must be marked as an end."],
    clarify: [
      { question: "Does a word count as a prefix of itself?", answer: "Yes, startsWith(w) is True after insert(w)." },
      { question: "Is search True for a prefix of an inserted word?", answer: "No, only for words inserted exactly." },
      { question: "Can the same word be inserted twice?", answer: "Yes, it simply stays in the trie." },
    ],
  },
  {
    lc: 211,
    kind: "class_design",
    statement: `Design a word store that supports wildcard lookups. Implement \`WordDictionary\`:

- \`WordDictionary()\` creates an empty store.
- \`addWord(word)\` saves \`word\`.
- \`search(word)\` returns \`True\` if some saved word **matches \`word\` exactly, character by character and with the same length**, where every \`.\` in the query matches **any single letter**. Otherwise it returns \`False\`.

Queries contain at most 2 dots. Tests use the operation-list format: the first list names the calls, the second gives each call's arguments; the expected output lists each return value (\`None\` for the constructor and \`addWord\`).`,
    examples: [
      { input: "ops = [\"WordDictionary\",\"addWord\",\"addWord\",\"search\",\"search\",\"search\",\"search\"], args = [[],[\"lamp\"],[\"lime\"],[\"l..p\"],[\"li.e\"],[\"lam\"],[\"....\"]]", output: "[None, None, None, True, True, False, True]", explanation: "\"lam\" is too short to match anything; \"....\" matches any 4-letter word." },
      { input: "ops = [\"WordDictionary\",\"search\",\"addWord\",\"search\",\"search\"], args = [[],[\".\"],[\"q\"],[\".\"],[\"..\"]]", output: "[None, False, None, True, False]" },
    ],
    constraints: ["1 <= word.length <= 25", "Saved words contain lowercase letters; queries contain lowercase letters or '.'", "At most 2 dots per query", "At most 10^4 calls in total"],
    signature: `class WordDictionary:

    def __init__(self):


    def addWord(self, word: str) -> None:


    def search(self, word: str) -> bool:`,
    method: "WordDictionary",
    driver: `def run(ns, args):
    return replay(ns, args[0], args[1])
`,
    tests: [
      { id: "ex1", input: "[[\"WordDictionary\", \"addWord\", \"addWord\", \"search\", \"search\", \"search\", \"search\"], [[], [\"lamp\"], [\"lime\"], [\"l..p\"], [\"li.e\"], [\"lam\"], [\"....\"]]]", expected: "[None, None, None, True, True, False, True]", visible: true },
      { id: "ex2", input: "[[\"WordDictionary\", \"search\", \"addWord\", \"search\", \"search\"], [[], [\".\"], [\"q\"], [\".\"], [\"..\"]]]", expected: "[None, False, None, True, False]", visible: true },
      { id: "exact", input: "[[\"WordDictionary\", \"addWord\", \"search\", \"search\"], [[], [\"code\"], [\"code\"], [\"cod\"]]]", expected: "[None, None, True, False]", visible: false },
      { id: "longer-query", input: "[[\"WordDictionary\", \"addWord\", \"search\", \"search\"], [[], [\"ab\"], [\"ab.\"], [\"abc\"]]]", expected: "[None, None, False, False]", visible: false },
      { id: "dot-branches", input: "[[\"WordDictionary\", \"addWord\", \"addWord\", \"addWord\", \"search\", \"search\", \"search\"], [[], [\"bad\"], [\"dad\"], [\"mad\"], [\".ad\"], [\"b..\"], [\"pad\"]]]", expected: "[None, None, None, None, True, True, False]", visible: false },
      { id: "dot-backtrack", input: "[[\"WordDictionary\", \"addWord\", \"addWord\", \"search\", \"search\"], [[], [\"axb\"], [\"ayc\"], [\".yb\"], [\"a.c\"]]]", expected: "[None, None, None, False, True]", visible: false },
      { id: "end-dot", input: "[[\"WordDictionary\", \"addWord\", \"search\", \"search\"], [[], [\"xyz\"], [\"xy.\"], [\"x.z.\"]]]", expected: "[None, None, True, False]", visible: false },
      { id: "big", input: "[[\"WordDictionary\"] + [\"addWord\"] * 676 + [\"search\", \"search\", \"search\", \"search\"], [[]] + [[\"k\" + chr(97 + i // 26) + chr(97 + i % 26) + \"z\"] for i in range(676)] + [[\"k..z\"], [\"kzz.\"], [\"..zk\"], [\"k....\"]]]", expected: "[None] * 677 + [True, True, False, False]", visible: false },
    ],
    solution: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.end = False


class WordDictionary:

    def __init__(self):
        self.root = TrieNode()

    def addWord(self, word: str) -> None:
        cur = self.root
        for c in word:
            if c not in cur.children:
                cur.children[c] = TrieNode()
            cur = cur.children[c]
        cur.end = True

    def search(self, word: str) -> bool:
        def dfs(i, node):
            if i == len(word):
                return node.end
            c = word[i]
            if c == ".":
                return any(dfs(i + 1, child) for child in node.children.values())
            if c not in node.children:
                return False
            return dfs(i + 1, node.children[c])

        return dfs(0, self.root)`,
    hints: ["Store the words in a trie, just like a normal prefix tree.", "A letter follows one child; a dot has to try every child.", "Use recursion (index, node) and return True as soon as any branch reaches the end of the query at a word-end node."],
    clarify: [
      { question: "Does a dot match zero characters?", answer: "No, exactly one letter." },
      { question: "Must the lengths match?", answer: "Yes, the saved word and the query must be the same length." },
      { question: "Can the query be all dots?", answer: "There are at most 2 dots per query in these tests, but the logic should handle any number." },
    ],
  },
  {
    lc: 212,
    kind: "algorithm",
    statement: `You get an \`m x n\` grid \`board\` of lowercase letters and a list of distinct strings \`words\`. Return **every word from \`words\` that can be traced on the board**.

A word is traced by starting at any cell and moving step by step to a cell that is **horizontally or vertically adjacent**, reading one letter per cell. **The same cell may not be used twice within one word.**

- Each found word appears once in the output.
- The output can be in **any order**.`,
    examples: [
      { input: "board = [[\"c\",\"a\",\"t\"],[\"o\",\"r\",\"s\"],[\"w\",\"e\",\"n\"]], words = [\"cat\",\"cow\",\"rest\",\"car\",\"ten\",\"arc\"]", output: "[\"cat\", \"cow\", \"car\"]", explanation: "\"rest\" fails because e and s are not neighbours, \"ten\" because t and e are not, and \"arc\" because r and c only touch diagonally." },
      { input: "board = [[\"a\",\"b\"],[\"c\",\"d\"]], words = [\"abdc\",\"abcd\",\"acdb\"]", output: "[\"abdc\", \"acdb\"]", explanation: "b and c are diagonal, so abcd can't be traced." },
    ],
    constraints: ["1 <= m, n <= 12", "board[i][j] is a lowercase English letter", "1 <= words.length <= 3 * 10^4", "1 <= words[i].length <= 10", "All words are distinct."],
    signature: `class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:`,
    method: "findWords",
    tests: [
      { id: "ex1", input: "[[[\"c\", \"a\", \"t\"], [\"o\", \"r\", \"s\"], [\"w\", \"e\", \"n\"]], [\"cat\", \"cow\", \"rest\", \"car\", \"ten\", \"arc\"]]", expected: "[\"cow\", \"car\", \"cat\"]", compare: "unordered", visible: true },
      { id: "ex2", input: "[[[\"a\", \"b\"], [\"c\", \"d\"]], [\"abdc\", \"abcd\", \"acdb\"]]", expected: "[\"acdb\", \"abdc\"]", compare: "unordered", visible: true },
      { id: "no-reuse", input: "[[[\"a\", \"a\"]], [\"aa\", \"aaa\"]]", expected: "[\"aa\"]", compare: "unordered", visible: false },
      { id: "single", input: "[[[\"z\"]], [\"z\", \"zz\", \"y\"]]", expected: "[\"z\"]", compare: "unordered", visible: false },
      { id: "prefix-words", input: "[[[\"o\", \"a\", \"t\"], [\"e\", \"a\", \"h\"]], [\"oa\", \"oat\", \"oath\", \"eat\", \"eath\"]]", expected: "[\"oa\", \"oat\", \"oath\"]", compare: "unordered", visible: false },
      { id: "snake", input: "[[[\"a\", \"b\", \"c\"], [\"f\", \"e\", \"d\"], [\"g\", \"h\", \"i\"]], [\"abcdefghi\", \"abcdefg\", \"aefi\", \"ihg\"]]", expected: "[\"abcdefg\", \"abcdefghi\", \"ihg\"]", compare: "unordered", visible: false },
      { id: "none", input: "[[[\"x\", \"y\"], [\"z\", \"w\"]], [\"xyzw\", \"q\"]]", expected: "[]", compare: "unordered", visible: false },
      { id: "repeat-letters", input: "[[[\"a\", \"b\", \"a\"], [\"b\", \"a\", \"b\"]], [\"abab\", \"aba\", \"babab\", \"aaaa\"]]", expected: "[\"aba\", \"abab\", \"babab\"]", compare: "unordered", visible: false },
      { id: "big", input: "[[[chr(97 + (r * 3 + c * 5) % 26) for c in range(12)] for r in range(12)], [\"afkp\", \"adgj\", \"afkpuz\", \"abcd\", \"kfa\", \"zzzz\"] + [\"q\" + chr(97 + i % 26) + chr(97 + i // 26 % 26) + chr(97 + i // 676) for i in range(3000)]]", expected: "[\"adgj\", \"afkp\", \"afkpuz\", \"kfa\", \"qtwb\", \"qtyb\", \"qtyd\", \"qnid\", \"qvyb\", \"qvyd\", \"qvad\", \"qlid\", \"qlgd\", \"qlgb\"]", compare: "unordered", visible: false },
    ],
    solution: `class Solution:
    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:
        root = {}
        for w in words:
            node = root
            for ch in w:
                node = node.setdefault(ch, {})
            node["$"] = w

        rows, cols = len(board), len(board[0])
        res = []

        def dfs(r, c, parent):
            ch = board[r][c]
            node = parent[ch]
            word = node.pop("$", None)
            if word:
                res.append(word)
            board[r][c] = "#"
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] in node:
                    dfs(nr, nc, node)
            board[r][c] = ch
            if not node:
                parent.pop(ch)  # prune a branch with no words left

        for r in range(rows):
            for c in range(cols):
                if board[r][c] in root:
                    dfs(r, c, root)
        return res`,
    hints: ["Running a separate grid search per word repeats work. Put all the words in a trie instead.", "DFS from every cell while walking the trie in lockstep; stop as soon as the path isn't a prefix of any word.", "Mark cells as used during a path, record a word when you reach its end node, and remove found words / empty branches to avoid repeats."],
    clarify: [
      { question: "Can the same cell be used twice in one word?", answer: "No." },
      { question: "Are diagonal moves allowed?", answer: "No, only up, down, left and right." },
      { question: "Does the output order matter?", answer: "No, any order is accepted, but each word appears once." },
    ],
  },
];
