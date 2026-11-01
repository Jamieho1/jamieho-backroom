import type { z } from "zod";
import { Visual } from "@/lib/notes/visual";
import { NEETCODE_150 } from "@/lib/notes/neetcode150";
import type { TopicId } from "@/lib/notes/topics";
import { TOPIC_FILES } from "./solutions/index";
import { EXTRAS, type Extra } from "./solutions/extras/index";
type V = z.input<typeof Visual>;
export interface Variation {
  id: string;
  topic: TopicId;
  name: string;
  /** What changes vs the topic's base pattern (Markdown). */
  change: string;
  problems: number[];
}
export interface Solution {
  lc: number;
  variation: string;
  question: string;
  intuition: string;
  algorithm: string;
  visual: V;
  code: string;
  complexity: string;
  /** Optional second version (e.g. the space-optimised follow-up), shown after the pitfalls. */
  alt?: { title: string; note: string; code: string };
}

export const VARIATIONS: Variation[] = TOPIC_FILES.flatMap((f) => f.variations);
export const SOLUTIONS: Solution[] = TOPIC_FILES.flatMap((f) => f.solutions);
const SOL = new Map(SOLUTIONS.map((s) => [s.lc, s]));

export const solutionOf = (lc: number) => SOL.get(lc);
/** Time / space with reasons and common pitfalls (NeetCode-style bottom of the solution). */
export const extraOf = (lc: number): Extra | undefined => EXTRAS[lc];
export const anchorOf = (lc: number) => NEETCODE_150.find((a) => a.lc === lc);
export const problemsOf = (topic: TopicId) => NEETCODE_150.filter((a) => a.topic === topic);
export const variationsOf = (topic: TopicId) => VARIATIONS.filter((v) => v.topic === topic);
export const variationOfProblem = (lc: number) => VARIATIONS.find((v) => v.problems.includes(lc));
