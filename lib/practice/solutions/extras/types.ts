/**
 * NeetCode-style extras per solution (Jamie 2026-10-20): time and space complexity with a short reason, and the
 * common pitfalls shown at the bottom of the solution. Written in our own words.
 */
export interface Big {
  /** Big-O, e.g. "O(n log n)". */
  o: string;
  /** One or two plain sentences on why (may use `code` and ==highlight==). */
  why: string;
}
export interface Extra {
  time: Big;
  space: Big;
  /** 2–4 pitfalls, each one sentence or two: the mistake, then what to do instead. */
  pitfalls: string[];
}
export type Extras = Record<number, Extra>;
