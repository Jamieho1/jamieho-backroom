/** Original follow-ups and alternative implementations. Reference prose reuses our authored lesson. */
import type {AuthoredContent} from './types';
export const content={
  "208": {
    "followUps": [
      "How would you extend the trie to count how many saved words share a prefix?"
    ],
    "reference": {
      "title": "Prefix tree",
      "explanation": "Words that share a prefix ==share the same path== from the root, one node per character. Inserting and looking up just walk that path. The only difference between \"word\" and \"prefix\" is whether the last node ==is marked as the end of a word==.",
      "time": "O(L) per call",
      "space": "O(T)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Store complete words",
      "explanation": "Keep full strings in a set; exact lookup is simple, while prefix queries scan saved words. W is the word count and T their total length.",
      "code": "class Trie:\n    def __init__(self): self.words = set()\n    def insert(self, word): self.words.add(word)\n    def search(self, word): return word in self.words\n    def startsWith(self, prefix): return any(word.startswith(prefix) for word in self.words)\n",
      "time": "O(L) insert/search; O(W · L) startsWith",
      "space": "O(T)",
      "optimal": false
    }
  },
  "211": {
    "followUps": [
      "How would you limit wildcard search when queries contain many dots?"
    ],
    "reference": {
      "title": "Wildcard search (DFS)",
      "explanation": "Store words in a normal trie. A normal letter follows one child, but ==`.` must try every child==, so search becomes a DFS over `(index in word, trie node)`. It succeeds if ==any branch reaches the end of the pattern on an `end` node==.",
      "time": "O(L) add · O(26^d · L) search",
      "space": "O(T)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Scan length-matched words",
      "explanation": "Store words by length and compare each character with the query, letting a dot match any letter.",
      "code": "class WordDictionary:\n    def __init__(self): self.words = defaultdict(set)\n    def addWord(self, word): self.words[len(word)].add(word)\n    def search(self, word):\n        return any(all(a == '.' or a == b for a, b in zip(word, saved)) for saved in self.words[len(word)])\n",
      "time": "O(L) add; O(W · L) search",
      "space": "O(T)",
      "optimal": false
    }
  },
  "212": {
    "followUps": [
      "How can shared prefixes avoid repeating the same board search for many dictionary words?"
    ],
    "reference": {
      "title": "Trie + grid backtracking",
      "explanation": "Running Word Search once per word repeats the same grid walks. Instead ==put every word in one trie== and DFS from each cell, ==moving through the trie as you move through the grid==. If the current path isn't a prefix of any word, stop right there. Remove found words (and empty branches) so they aren't reported twice and dead paths get pruned.",
      "time": "O(m · n · 4 · 3^(L-1))",
      "space": "O(T)"
    },
    "alternative": {
      "id": "alternative",
      "title": "Search each word separately",
      "explanation": "Run a board backtracking search for each word, restoring visited cells before trying the next candidate.",
      "code": "class Solution:\n    def findWords(self, board: List[List[str]], words: List[str]) -> List[str]:\n        rows, cols = len(board), len(board[0])\n        def exists(word):\n            def visit(r, c, index, seen):\n                if index == len(word): return True\n                if not (0 <= r < rows and 0 <= c < cols) or (r,c) in seen or board[r][c] != word[index]: return False\n                seen.add((r,c))\n                found = any(visit(r+dr,c+dc,index+1,seen) for dr,dc in ((1,0),(-1,0),(0,1),(0,-1)))\n                seen.remove((r,c))\n                return found\n            return any(visit(r,c,0,set()) for r in range(rows) for c in range(cols))\n        return [word for word in words if exists(word)]\n",
      "time": "O(W · R · C · 4^L)",
      "space": "O(L) auxiliary, excluding output",
      "optimal": false
    }
  }
} satisfies Record<number,AuthoredContent>;
