/** Fixed topic taxonomy (PRD §3) with dot colours (DESIGN_SYSTEM §2.5). No Bit Manipulation. */
export const TOPICS = [
  { id: "arrays-hashing", label: "Arrays & Hashing", dot: "#1D4AFF" },
  { id: "two-pointers", label: "Two Pointers", dot: "#0E7C86" },
  { id: "stack", label: "Stack", dot: "#B62AD9" },
  { id: "binary-search", label: "Binary Search", dot: "#5B6CFF" },
  { id: "sliding-window", label: "Sliding Window", dot: "#0891B2" },
  { id: "linked-list", label: "Linked List", dot: "#65675E" },
  { id: "trees", label: "Trees", dot: "#307742" },
  { id: "tries", label: "Tries", dot: "#7C3AED" },
  { id: "backtracking", label: "Backtracking", dot: "#A21CAF" },
  { id: "heap", label: "Heap / Priority Queue", dot: "#F7A501" },
  { id: "intervals", label: "Intervals", dot: "#3E7B5A" },
  { id: "greedy", label: "Greedy", dot: "#4D7C0F" },
  { id: "graphs", label: "Graphs", dot: "#F54E00" },
  { id: "advanced-graphs", label: "Advanced Graphs", dot: "#BE185D" },
  { id: "dp-1d", label: "1-D DP", dot: "#C2410C" },
  { id: "dp-2d", label: "2-D DP", dot: "#B45309" },
  { id: "math-geometry", label: "Math & Geometry", dot: "#9EA096" },
  { id: "class-design", label: "Class design / stateful", dot: "currentColor" },
] as const;

export type TopicId = (typeof TOPICS)[number]["id"];
export const TOPIC_IDS = TOPICS.map((t) => t.id) as [TopicId, ...TopicId[]];
export const topicById = (id: string) => TOPICS.find((t) => t.id === id);
