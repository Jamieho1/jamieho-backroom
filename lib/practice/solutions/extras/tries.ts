import type { Extras } from "./types";

export const extras: Extras = {
  208: {
    time: { o: "O(L) per call", why: "`insert`, `search` and `startsWith` each walk one node per character, so cost depends on L = length of the word or prefix, ==not on how many words are stored==." },
    space: { o: "O(T)", why: "T = total characters inserted: in the worst case every character creates a new `TrieNode`; shared prefixes reuse nodes." },
    pitfalls: [
      "Returning `True` from `search` just because the path exists: after inserting `apple`, `search('app')` must be False. Check `node.end`.",
      "Forgetting to set `cur.end = True` after the insert loop, so nothing is ever found as a full word.",
      "Creating a new child even when one exists (`cur.children[c] = TrieNode()` without the `if`), which wipes out previously inserted words that share the prefix.",
    ],
  },
  211: {
    time: { o: "O(L) add · O(26^d · L) search", why: "`addWord` walks L characters. A `.` can branch into up to 26 children, so with d dots search explores ==up to 26^d paths==, each of length up to L (capped by trie size)." },
    space: { o: "O(T)", why: "T = total characters stored in the trie, plus O(L) recursion depth during `search`." },
    pitfalls: [
      "Returning the result of the first child tried for `.` instead of trying all children: `bad` may fail while `dad` matches. Return True if any child succeeds.",
      "Returning `True` when `i == len(word)` without checking `node.end`: `search('ba')` would wrongly match `bad`.",
      "Recursing on `word[1:]` copies the string each step; passing an index `i` avoids the extra O(L) per call.",
    ],
  },
  212: {
    time: { o: "O(m · n · 4 · 3^(L-1))", why: "From each of the m·n cells the DFS goes 4 ways first and then at most 3 (it cannot step back onto a visited cell), for up to L = max word length steps; ==the trie prunes paths that are not a prefix==." },
    space: { o: "O(T)", why: "T = total characters across `words` for the trie, plus O(L) recursion depth; marking visited cells in `board` avoids a separate set." },
    pitfalls: [
      "Not removing a word after finding it: the same word can be traced along several paths and gets added twice. Pop `$` (or use a set) when you record it.",
      "Forgetting to restore `board[r][c]` after exploring, which blocks cells for every later start position.",
      "Running single-word Word Search for each of up to 3 * 10^4 words: that repeats the grid walk per word and times out; build one trie for all words.",
      "Without pruning empty branches the DFS keeps re-entering prefixes whose words are all found; delete a child from its parent once it has no children and no word.",
    ],
  },
};
