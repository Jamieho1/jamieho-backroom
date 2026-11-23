/**
 * Pre-written NeetCode problems for the practice arena (Jamie 2026-10-20): the SAME problems as LeetCode (same
 * function, same rules), described completely in our own words (LeetCode's text is never copied), with tests we
 * wrote and verified by running a reference solution through the real harness. Nothing is generated at runtime.
 */
export interface ArenaTest {
  id: string;
  operations?: string[];
  arguments?: unknown[][];
  /** Python expression for the list of positional arguments (after any driver conversion). */
  input: string;
  /** Expected value: Python expression for legacy tests; JSON list for operations/arguments tests. */
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

import {z} from 'zod';
const jsonValue:z.ZodType<unknown>=z.lazy(()=>z.union([z.string().max(10000),z.number().finite(),z.boolean(),z.null(),z.array(jsonValue).max(2000),z.record(z.string().max(100),jsonValue)]));
export const ClassSequence=z.object({operations:z.array(z.string().regex(/^[A-Za-z][A-Za-z0-9_]*$/)).min(1).max(2000),arguments:z.array(z.array(jsonValue).max(20)).min(1).max(2000)}).strict().refine(v=>v.operations.length===v.arguments.length,{message:'Each operation needs one argument list.'});
export const ClassDesignTest=ClassSequence.safeExtend({id:z.string().min(1).max(80),expected:z.string().max(100000),visible:z.boolean()}).refine(v=>{if(!v.expected)return true;try{const out=JSON.parse(v.expected);return Array.isArray(out)&&out.length===v.operations.length;}catch{return false;}},{message:'Expected class output must be a JSON list matching the operation count.'});
export const ArenaTestSchema=z.object({id:z.string().min(1).max(80),input:z.string().max(100000),expected:z.string().max(100000),visible:z.boolean(),compare:z.enum(['exact','unordered']).optional(),operations:z.array(z.string()).optional(),arguments:z.array(z.array(jsonValue)).optional()}).strict().superRefine((v,ctx)=>{if(v.operations!==undefined||v.arguments!==undefined){const out=ClassDesignTest.safeParse({id:v.id,operations:v.operations,arguments:v.arguments,expected:v.expected,visible:v.visible});if(!out.success)ctx.addIssue({code:'custom',message:'Invalid class-design operation sequence.'});}});
