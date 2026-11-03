/** Every pre-written arena problem: complete, well-formed, and its reference solution passes all its tests in the real harness (CPython). Run one topic: npx vitest run tests/unit/arena-all.test.ts -t "arena two-pointers" */
import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { solutionOf, extraOf } from "@/lib/practice/solutions";
import { Visual } from "@/lib/notes/visual";
import { ARENA_FILES } from "@/lib/practice/problems";
import { PRACTICE_ANCHORS } from "@/lib/notes/neetcode150";

const HARNESS_DIR = fileURLToPath(new URL("../../public/runner/", import.meta.url));
const PY = `
import sys, json
sys.path.insert(0, ${JSON.stringify(HARNESS_DIR)})
import harness
d = json.loads(sys.stdin.read())
print(harness.run_tests(d["code"], d["method"], json.dumps(d["tests"]), json.dumps(d["extra"])))
`;
function runPy(code: string, method: string, tests: unknown[], extra: unknown) {
  const out = execFileSync("python3", ["-c", PY], { input: JSON.stringify({ code, method, tests, extra }), timeout: 60_000 }).toString();
  return JSON.parse(out.trim().split("\n").pop()!) as { compile_error: string | null; results: { id: string; status: string; got?: string; expected?: string; error?: string }[] };
}

for (const [topic, problems] of Object.entries(ARENA_FILES)) {
  if (!problems.length) continue;
  describe(`arena ${topic}`, () => {
    it("covers every practice problem (NeetCode 150 + extras) of the topic once", () => {
      const want = PRACTICE_ANCHORS.filter((a) => a.topic === topic).map((a) => a.lc).sort((a, b) => a - b);
      expect(problems.map((p) => p.lc).sort((a, b) => a - b)).toEqual(want);
    });
    for (const p of problems) {
      it(`${p.lc}: well-formed and the reference passes every test`, () => {
        expect(p.statement.length).toBeGreaterThan(60);
        expect(p.examples.length).toBeGreaterThanOrEqual(1);
        expect(p.constraints.length).toBeGreaterThanOrEqual(1);
        expect(p.hints.length).toBeGreaterThanOrEqual(2);
        expect(p.clarify.length).toBeGreaterThanOrEqual(2);
        expect(p.tests.length).toBeGreaterThanOrEqual(6);
        expect(p.tests.filter((t) => t.visible).length).toBeGreaterThanOrEqual(2);
        expect(p.tests.filter((t) => !t.visible).length).toBeGreaterThanOrEqual(3);
        expect(new Set(p.tests.map((t) => t.id)).size).toBe(p.tests.length);
        if (p.kind === "algorithm" && !p.driver) expect(p.signature).toMatch(new RegExp(`def ${p.method}\\(self`));
        if (p.kind === "class_design") expect(p.signature).toMatch(new RegExp(`class ${p.method}\\b`));
        const r = runPy(p.solution, p.method, p.tests.map((t) => ({ ...t, kind: "functional" })), { prelude: p.prelude, driver: p.driver });
        expect(r.compile_error, r.compile_error ?? "").toBeNull();
        for (const x of r.results) expect(x.status, `${x.id}: got ${x.got} expected ${x.expected} ${x.error ?? ""}`).toBe("pass");
        // the starter (signature + pass) must at least load, so the arena can run a fresh attempt
        const starter = `${p.signature}\n${p.kind === "algorithm" ? "        pass\n" : ""}`;
        if (p.kind === "algorithm") expect(runPy(starter, p.method, [], { prelude: p.prelude, driver: p.driver }).compile_error).toBeNull();
      });
    }
  });
}

it("every problem has a valid solution visual, complexity and pitfalls", () => {
  for (const p of Object.values(ARENA_FILES).flat()) {
    const solution=solutionOf(p.lc);
    expect(solution, `solution ${p.lc}`).toBeTruthy();
    expect(Visual.safeParse(solution?.visual).success, `visual ${p.lc}`).toBe(true);
    const extra=extraOf(p.lc);
    expect(extra?.time.o, `time ${p.lc}`).toBeTruthy();
    expect(extra?.space.o, `space ${p.lc}`).toBeTruthy();
    expect(extra?.pitfalls.length, `pitfalls ${p.lc}`).toBeGreaterThan(0);
  }
});
