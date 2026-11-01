/** Only original, prewritten statements/tests/solutions; no generated questions or personal attempts. */
import { ARENA_FILES } from "./problems";
import { NEETCODE_150 } from "@/lib/notes/neetcode150";
export const PROBLEMS = Object.values(ARENA_FILES).flat();
const byNumber = new Map(PROBLEMS.map(p=>[p.lc,p]));
export const problemByNumber = (lc:number) => byNumber.get(lc);
export const PRACTICE_LIST = NEETCODE_150.filter(p=>byNumber.has(p.lc));
export function starterCode(lc:number):string {
  const p=byNumber.get(lc);
  return p ? `${p.signature}\n${p.kind === "algorithm" ? "        pass\n" : ""}` : "";
}
