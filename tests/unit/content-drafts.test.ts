import { describe, it, expect } from "vitest";
import { affectedRoutes, validateOperations } from "@/lib/content-drafts/allowlist";
import { reviewFields } from "@/lib/content-drafts/types";
import { SECTION_KEYS } from "@/lib/sections";
const op = (fields: unknown = { title: "Proposal" }, extra = {}) => ({ op: "update", table: "site_sections", key: "hero", fields, ...extra });
describe("content draft allowlist", () => {
  it("supports every existing section key and revalidates only authored routes", () => {
    for (const key of SECTION_KEYS) expect(validateOperations([op({title:'',body:''},{key})]).ok).toBe(true);
    const result = validateOperations([op(),op({body:'New body'},{key:'about'})]);
    expect(result.ok).toBe(true); if(result.ok) expect(affectedRoutes(result.operations)).toEqual(['/','/journey','/about']);
  });
  for (const [name, input] of [
    ['unknown table',[op({}, {table:'profiles'})]], ['unknown field',[op({sort:99})]], ['unknown property',[op({title:'ok'},{sql:'anything'})]],
    ['unknown key',[op({title:'ok'},{key:'wrong'})]], ['long title',[op({title:'x'.repeat(121)})]], ['long body',[op({body:'x'.repeat(20001)})]],
    ['number',[op({title:12})]], ['null',[op({body:null})]], ['empty fields',[op({})]], ['insert',[op({}, {op:'insert'})]], ['delete',[op({}, {op:'delete'})]],
    ['NUL',[op({body:'\0'})]], ['empty set',[]], ['too many operations',Array.from({length:101},()=>op())], ['missing fields',[{op:'update',table:'site_sections',key:'hero'}]],
  ]) it(`rejects ${name} with an explanation`, () => {
    const result = validateOperations(input); expect(result.ok).toBe(false); if(!result.ok) expect(result.message).toContain('Invalid draft:');
  });
  it("matches Postgres code-point lengths for Unicode", () => { expect(validateOperations([op({title:'😀'.repeat(120)})]).ok).toBe(true); expect(validateOperations([op({title:'😀'.repeat(121)})]).ok).toBe(false); });
  it("reviews final repeated values against current live values, preserving empty values", () => {
    const result=validateOperations([op({title:'First'}),op({title:'',body:'Last'})]); if(!result.ok) throw Error(result.message);
    expect(reviewFields(result.operations,{hero:{title:'Live',body:'Live body'}})).toEqual([
      {field:'site_sections.hero.title',current:'Live',proposed:''}, {field:'site_sections.hero.body',current:'Live body',proposed:'Last'},
    ]);
  });
});
