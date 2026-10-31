/**
 * NeetCode 150 anchors for Fundamentals (PRD §5, §13): LeetCode number + title + difficulty only, hand-entered
 * (no scraping; no statements). Bit Manipulation (7 problems) is out of scope, so 143 entries.
 * Excluded from mocks by default (fundamentals = true).
 */
import type { TopicId } from "./topics";

type D = "Easy" | "Medium" | "Hard";
export interface Anchor {
  lc: number;
  title: string;
  difficulty: D;
  topic: TopicId;
  slug?: string; // only where LeetCode's slug differs from the title
}

const g = (topic: TopicId, rows: [number, string, D, string?][]): Anchor[] => rows.map(([lc, title, difficulty, slug]) => ({ lc, title, difficulty, topic, slug }));

export const NEETCODE_150: Anchor[] = [
  ...g("arrays-hashing", [
    [217, "Contains Duplicate", "Easy"], [242, "Valid Anagram", "Easy"], [1, "Two Sum", "Easy"], [49, "Group Anagrams", "Medium"],
    [347, "Top K Frequent Elements", "Medium"], [238, "Product of Array Except Self", "Medium"], [36, "Valid Sudoku", "Medium"],
    [271, "Encode and Decode Strings", "Medium"], [128, "Longest Consecutive Sequence", "Medium"],
  ]),
  ...g("two-pointers", [
    [125, "Valid Palindrome", "Easy"], [167, "Two Sum II - Input Array Is Sorted", "Medium", "two-sum-ii-input-array-is-sorted"], [15, "3Sum", "Medium"],
    [11, "Container With Most Water", "Medium"], [42, "Trapping Rain Water", "Hard"],
  ]),
  ...g("sliding-window", [
    [121, "Best Time to Buy and Sell Stock", "Easy"], [3, "Longest Substring Without Repeating Characters", "Medium"],
    [424, "Longest Repeating Character Replacement", "Medium"], [567, "Permutation in String", "Medium"], [76, "Minimum Window Substring", "Hard"],
    [239, "Sliding Window Maximum", "Hard"],
  ]),
  ...g("stack", [
    [20, "Valid Parentheses", "Easy"], [155, "Min Stack", "Medium"], [150, "Evaluate Reverse Polish Notation", "Medium"], [22, "Generate Parentheses", "Medium"],
    [739, "Daily Temperatures", "Medium"], [853, "Car Fleet", "Medium"], [84, "Largest Rectangle in Histogram", "Hard"],
  ]),
  ...g("binary-search", [
    [704, "Binary Search", "Easy"], [74, "Search a 2D Matrix", "Medium"], [875, "Koko Eating Bananas", "Medium"], [153, "Find Minimum in Rotated Sorted Array", "Medium"],
    [33, "Search in Rotated Sorted Array", "Medium"], [981, "Time Based Key-Value Store", "Medium"], [4, "Median of Two Sorted Arrays", "Hard"],
  ]),
  ...g("linked-list", [
    [206, "Reverse Linked List", "Easy"], [21, "Merge Two Sorted Lists", "Easy"], [141, "Linked List Cycle", "Easy"], [143, "Reorder List", "Medium"],
    [19, "Remove Nth Node From End of List", "Medium"], [138, "Copy List with Random Pointer", "Medium"], [2, "Add Two Numbers", "Medium"],
    [287, "Find the Duplicate Number", "Medium"], [146, "LRU Cache", "Medium"], [23, "Merge k Sorted Lists", "Hard"], [25, "Reverse Nodes in k-Group", "Hard"],
  ]),
  ...g("trees", [
    [226, "Invert Binary Tree", "Easy"], [104, "Maximum Depth of Binary Tree", "Easy"], [543, "Diameter of Binary Tree", "Easy"], [110, "Balanced Binary Tree", "Easy"],
    [100, "Same Tree", "Easy"], [572, "Subtree of Another Tree", "Easy"], [235, "Lowest Common Ancestor of a Binary Search Tree", "Medium"],
    [102, "Binary Tree Level Order Traversal", "Medium"], [199, "Binary Tree Right Side View", "Medium"], [1448, "Count Good Nodes in Binary Tree", "Medium"],
    [98, "Validate Binary Search Tree", "Medium"], [230, "Kth Smallest Element in a BST", "Medium"],
    [105, "Construct Binary Tree from Preorder and Inorder Traversal", "Medium"], [124, "Binary Tree Maximum Path Sum", "Hard"],
    [297, "Serialize and Deserialize Binary Tree", "Hard"],
  ]),
  ...g("tries", [[208, "Implement Trie (Prefix Tree)", "Medium"], [211, "Design Add and Search Words Data Structure", "Medium"], [212, "Word Search II", "Hard"]]),
  ...g("heap", [
    [703, "Kth Largest Element in a Stream", "Easy"], [1046, "Last Stone Weight", "Easy"], [973, "K Closest Points to Origin", "Medium"],
    [215, "Kth Largest Element in an Array", "Medium"], [621, "Task Scheduler", "Medium"], [355, "Design Twitter", "Medium"], [295, "Find Median from Data Stream", "Hard"],
  ]),
  ...g("backtracking", [
    [78, "Subsets", "Medium"], [39, "Combination Sum", "Medium"], [40, "Combination Sum II", "Medium"], [46, "Permutations", "Medium"], [90, "Subsets II", "Medium"],
    [79, "Word Search", "Medium"], [131, "Palindrome Partitioning", "Medium"], [17, "Letter Combinations of a Phone Number", "Medium"], [51, "N-Queens", "Hard"],
  ]),
  ...g("graphs", [
    [200, "Number of Islands", "Medium"], [695, "Max Area of Island", "Medium"], [133, "Clone Graph", "Medium"], [286, "Walls and Gates", "Medium"],
    [994, "Rotting Oranges", "Medium"], [417, "Pacific Atlantic Water Flow", "Medium"], [130, "Surrounded Regions", "Medium"], [207, "Course Schedule", "Medium"],
    [210, "Course Schedule II", "Medium"], [261, "Graph Valid Tree", "Medium"], [323, "Number of Connected Components in an Undirected Graph", "Medium"],
    [684, "Redundant Connection", "Medium"], [127, "Word Ladder", "Hard"],
  ]),
  ...g("advanced-graphs", [
    [743, "Network Delay Time", "Medium"], [332, "Reconstruct Itinerary", "Hard"], [1584, "Min Cost to Connect All Points", "Medium"],
    [778, "Swim in Rising Water", "Hard"], [269, "Alien Dictionary", "Hard"], [787, "Cheapest Flights Within K Stops", "Medium"],
  ]),
  ...g("dp-1d", [
    [70, "Climbing Stairs", "Easy"], [746, "Min Cost Climbing Stairs", "Easy"], [198, "House Robber", "Medium"], [213, "House Robber II", "Medium"],
    [5, "Longest Palindromic Substring", "Medium"], [647, "Palindromic Substrings", "Medium"], [91, "Decode Ways", "Medium"], [322, "Coin Change", "Medium"],
    [152, "Maximum Product Subarray", "Medium"], [139, "Word Break", "Medium"], [300, "Longest Increasing Subsequence", "Medium"],
    [416, "Partition Equal Subset Sum", "Medium"],
  ]),
  ...g("dp-2d", [
    [62, "Unique Paths", "Medium"], [1143, "Longest Common Subsequence", "Medium"], [309, "Best Time to Buy and Sell Stock with Cooldown", "Medium"],
    [518, "Coin Change II", "Medium"], [494, "Target Sum", "Medium"], [97, "Interleaving String", "Medium"],
    [329, "Longest Increasing Path in a Matrix", "Hard"], [115, "Distinct Subsequences", "Hard"], [72, "Edit Distance", "Medium"],
    [312, "Burst Balloons", "Hard"], [10, "Regular Expression Matching", "Hard"],
  ]),
  ...g("greedy", [
    [53, "Maximum Subarray", "Medium"], [55, "Jump Game", "Medium"], [45, "Jump Game II", "Medium"], [134, "Gas Station", "Medium"],
    [846, "Hand of Straights", "Medium"], [1899, "Merge Triplets to Form Target Triplet", "Medium"], [763, "Partition Labels", "Medium"],
    [678, "Valid Parenthesis String", "Medium"],
  ]),
  ...g("intervals", [
    [57, "Insert Interval", "Medium"], [56, "Merge Intervals", "Medium"], [435, "Non-overlapping Intervals", "Medium"], [252, "Meeting Rooms", "Easy"],
    [253, "Meeting Rooms II", "Medium"], [1851, "Minimum Interval to Include Each Query", "Hard"],
  ]),
  ...g("math-geometry", [
    [48, "Rotate Image", "Medium"], [54, "Spiral Matrix", "Medium"], [73, "Set Matrix Zeroes", "Medium"], [202, "Happy Number", "Easy"], [66, "Plus One", "Easy"],
    [50, "Pow(x, n)", "Medium"], [43, "Multiply Strings", "Medium"], [2013, "Detect Squares", "Medium"],
  ]),
];

export const leetcodeSlug = (title: string) =>
  title.toLowerCase().replace(/[()',]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const leetcodeUrl = (a: Pick<Anchor, "title" | "slug">) => `https://leetcode.com/problems/${a.slug ?? leetcodeSlug(a.title)}/`;
