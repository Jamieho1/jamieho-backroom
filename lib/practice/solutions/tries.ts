/**
 * tries: NeetCode 150 problems, written in Jamie's format (see arrays-hashing.ts).
 * Problems:
 * - 208 Implement Trie (Prefix Tree) (Medium)
 * - 211 Design Add and Search Words Data Structure (Medium)
 * - 212 Word Search II (Hard)
 */
import type { Solution, Variation } from "../solutions";

const kv = (o: Record<string, string>) => Object.entries(o).map(([name, value]) => ({ name, value }));
const nodes = (...ns: [string, string][]) => ns.map(([id, label]) => ({ id, label }));
const edges = (...es: [string, string][]) => es.map(([from, to]) => ({ from, to, label: "" }));

export const variations: Variation[] = [
  {
    id: "trie-basic",
    topic: "tries",
    name: "Prefix tree",
    change: "Base pattern. One node per character with a `children` map and an ==`end` flag==; walking a word or prefix costs O(length), not O(number of words).",
    problems: [208],
  },
  {
    id: "wildcard-dfs",
    topic: "tries",
    name: "Wildcard search (DFS)",
    change: "Same trie, but a `.` matches any letter, so search ==branches into every child== with DFS instead of following a single path.",
    problems: [211],
  },
  {
    id: "trie-grid",
    topic: "tries",
    name: "Trie + grid backtracking",
    change: "Put ==all the target words in one trie==, then backtrack over the grid ==walking the trie in step==: stop as soon as the path isn't a prefix of any word.",
    problems: [212],
  },
];

export const solutions: Solution[] = [
  {
    lc: 208,
    variation: "trie-basic",
    question: "Design a structure that stores words and answers \"is this exact word stored?\" and \"does any stored word start with this prefix?\".",
    intuition: `Words that share a prefix ==share the same path== from the root, one node per character. Inserting and looking up just walk that path. The only difference between "word" and "prefix" is whether the last node ==is marked as the end of a word==.`,
    algorithm: `Each node has \`children\` (char → node) and \`end\` (bool).

**Insert**

1. Start at \`cur = root\`.
2. For each char \`c\`: create \`cur.children[c]\` if missing, then move into it.
3. ==Set \`cur.end = True\`==.

**Search / startsWith**

1. Walk the characters from the root; if a child is missing, return \`False\`.
2. \`search\` returns ==\`cur.end\`==; \`startsWith\` returns \`True\` (the path exists).`,
    visual: {
      kind: "graph",
      title: "Trie · insert car, cat; then queries",
      nodes: nodes(["root", "root"], ["c", "c"], ["a", "a"], ["r", "r (end)"], ["t", "t (end)"]),
      edges: edges(["root", "c"], ["c", "a"], ["a", "r"], ["a", "t"]),
      directed: true,
      frames: [
        { caption: "insert \"car\": create c → a → r and mark r as the end of a word.", pointers: [{ name: "cur", node: "r" }], highlight: ["c", "a", "r"], vars: kv({ words: "car" }) },
        { caption: "insert \"cat\": c and a already exist, so reuse them. Only t is new; mark it as an end.", pointers: [{ name: "cur", node: "t" }], highlight: ["t"], done: ["c", "a", "r"], vars: kv({ words: "car, cat" }) },
        { caption: "search \"ca\": the path c → a exists, but a is not an end → False.", pointers: [{ name: "cur", node: "a" }], highlight: ["c", "a"], vars: kv({ "search(ca)": "False" }) },
        { caption: "startsWith \"ca\": same walk; the path existing is enough → True.", pointers: [{ name: "cur", node: "a" }], highlight: ["c", "a"], vars: kv({ "search(ca)": "False", "startsWith(ca)": "True" }) },
        { caption: "search \"cab\": at a there is no 'b' child → False straight away.", pointers: [{ name: "cur", node: "a" }], highlight: ["a"], done: ["c"], vars: kv({ "search(cab)": "False" }) },
      ],
    },
    code: `class TrieNode:
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
    complexity: "Time O(L) per call for a word of length L · Space O(total characters inserted)",
  },
  {
    lc: 211,
    variation: "wildcard-dfs",
    question: "Design a word store where search patterns may contain '.' that stands for any single letter.",
    intuition: `Store words in a normal trie. A normal letter follows one child, but ==\`.\` must try every child==, so search becomes a DFS over \`(index in word, trie node)\`. It succeeds if ==any branch reaches the end of the pattern on an \`end\` node==.`,
    algorithm: `1. \`addWord\` is the same as Trie insert.
2. \`search(word)\` runs \`dfs(i, node)\`:
   * If \`i == len(word)\`, return \`node.end\`.
   * If \`word[i] == "."\`:
      * ==Return \`True\` if \`dfs(i + 1, child)\` is \`True\` for any child==.
   * Otherwise, if \`word[i]\` is not a child, return \`False\`; else recurse into that child.
3. Return \`dfs(0, root)\`.`,
    visual: {
      kind: "graph",
      title: "Add bad, dad, mad · search \".ad\", \"b..\", \"pad\"",
      nodes: nodes(["root", "root"], ["b", "b"], ["d", "d"], ["m", "m"], ["ba", "a"], ["da", "a"], ["ma", "a"], ["bad", "d (end)"], ["dad", "d (end)"], ["mad", "d (end)"]),
      edges: edges(["root", "b"], ["root", "d"], ["root", "m"], ["b", "ba"], ["d", "da"], ["m", "ma"], ["ba", "bad"], ["da", "dad"], ["ma", "mad"]),
      directed: true,
      frames: [
        { caption: "After adding bad, dad and mad: three branches under the root.", highlight: ["b", "d", "m"], vars: kv({ words: "bad, dad, mad" }) },
        { caption: "search \".ad\": '.' at the root → try each child. First try b.", pointers: [{ name: "node", node: "b" }], highlight: ["b"], vars: kv({ pattern: ".ad", i: "1" }) },
        { caption: "From b: 'a' → ba, 'd' → bad, which is an end → True. Other branches are never tried.", pointers: [{ name: "node", node: "bad" }], highlight: ["b", "ba", "bad"], vars: kv({ "search(.ad)": "True" }) },
        { caption: "search \"b..\": follow b; the first '.' tries b's only child a, the second tries a's child d (an end) → True.", pointers: [{ name: "node", node: "bad" }], highlight: ["b", "ba", "bad"], vars: kv({ "search(b..)": "True" }) },
        { caption: "search \"pad\": the root has no 'p' child → False immediately.", pointers: [{ name: "node", node: "root" }], highlight: ["root"], vars: kv({ "search(pad)": "False" }) },
      ],
    },
    code: `class TrieNode:
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
    complexity: "Time O(L) add · O(26^d · L) worst-case search with d dots · Space O(total characters)",
  },
  {
    lc: 212,
    variation: "trie-grid",
    question: "Given a letter grid and a word list, return every word that can be traced through side-adjacent cells without reusing a cell.",
    intuition: `Running Word Search once per word repeats the same grid walks. Instead ==put every word in one trie== and DFS from each cell, ==moving through the trie as you move through the grid==. If the current path isn't a prefix of any word, stop right there. Remove found words (and empty branches) so they aren't reported twice and dead paths get pruned.`,
    algorithm: `1. Build a trie of \`words\`; store the full word at its last node (\`node["$"] = word\`).
2. Define \`dfs(r, c, parent)\`:
   * Let \`node = parent[board[r][c]]\`.
   * If \`node\` holds a word, ==append it to \`res\` and remove it== (no duplicates).
   * Mark \`board[r][c] = "#"\` (visited).
   * For each of the 4 neighbours in bounds whose letter is ==a child of \`node\`==, recurse.
   * Restore the cell. If \`node\` is now empty, delete it from \`parent\` (prune).
3. For every cell whose letter is a child of the root, call \`dfs(r, c, root)\`.
4. Return \`res\`.`,
    visual: {
      kind: "grid",
      title: "Word Search II · words oat, eta, tea",
      rows: [
        ["o", "a", "t"],
        ["e", "t", "a"],
      ],
      frames: [
        { caption: "Build one trie for oat, eta and tea. Start cells must match a root child: o, e or t.", vars: kv({ trie: "o-a-t · e-t-a · t-e-a", res: "[]" }) },
        { caption: "(0,0) 'o' is a root child → enter the o branch.", highlight: ["0,0"], vars: kv({ path: "o", res: "[]" }) },
        { caption: "Neighbour (0,1) 'a' is a child of o → go deeper.", highlight: ["0,0", "0,1"], vars: kv({ path: "oa", res: "[]" }) },
        { caption: "(0,2) 't' ends \"oat\" → add it and remove it from the trie; the empty o branch is pruned.", highlight: ["0,0", "0,1", "0,2"], vars: kv({ path: "oat", res: "[oat]" }) },
        { caption: "(0,2) 't' starts \"tea\", but no neighbour is 'e' → dead end at once.", highlight: ["0,2"], vars: kv({ path: "t", res: "[oat]" }) },
        { caption: "(1,0) 'e' → (1,1) 't' → (0,1) 'a' ends \"eta\" → add it.", highlight: ["1,0", "1,1", "0,1"], vars: kv({ path: "eta", res: "[oat, eta]" }) },
        { caption: "(1,1) 't' → (1,0) 'e', but e's only other neighbour is 'o', not 'a' → \"tea\" can't be traced.", highlight: ["1,1", "1,0"], done: ["0,0", "0,1", "0,2", "1,2"], vars: kv({ answer: "[oat, eta]" }) },
      ],
    },
    code: `def findWords(board: list[list[str]], words: list[str]) -> list[str]:
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
    complexity: "Time O(m · n · 4 · 3^(L-1)) for max word length L · Space O(total characters in words)",
  },
];

/** Recognise-it cues for the Roadmap flashcards. */