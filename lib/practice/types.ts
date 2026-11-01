/**
 * Pre-written NeetCode problems for the practice arena (Jamie 2026-10-20): the SAME problems as LeetCode (same
 * function, same rules), described completely in our own words (LeetCode's text is never copied), with tests we
 * wrote and verified by running a reference solution through the real harness. Nothing is generated at runtime.
 */
export interface ArenaTest {
  id: string;
  /** Python expression for the list of positional arguments (after any driver conversion). */
  input: string;
  /** Python literal of the expected return value. */
  expected: string;
  compare?: "exact" | "unordered";
  visible: boolean;
}
export interface ArenaProblem {
  lc: number;
  /** Full statement in our own words (Markdown): every rule, input, output, edge condition. */
  statement: string;
  /** Shown examples (display strings, LeetCode-style "nums = [2,7,11,15], target = 9"). */
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  /** LeetCode's class skeleton, exactly as on LeetCode (same class/method names and parameters). */
  signature: string;
  /** Method name for plain problems; for design problems the class name. */
  method: string;
  kind: "algorithm" | "class_design";
  /** Optional Python run before the candidate's code (e.g. a `Node` class). ListNode/TreeNode and the helpers
   * to_list / from_list / to_tree / from_tree / replay are always available. */
  prelude?: string;
  /** Optional Python defining `run(ns, args)`: converts inputs/outputs or replays a design problem's operations. */
  driver?: string;
  tests: ArenaTest[];
  /** Reference solution in LeetCode style; every test passes against it. */
  solution: string;
  hints: string[];
  clarify: { question: string; answer: string }[];
}
