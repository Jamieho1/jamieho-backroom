import {describe,it,expect} from "vitest";
import {readContact,validateContact,NEEDS,BUDGETS,TIMELINES} from "@/lib/contact-fields";
const base={name:"Synthetic",email:"brief@example.test",need:"",reason:"project",needs:[NEEDS[0]],budget:BUDGETS[0],timeline:TIMELINES[0]};
describe("brief validation",()=>{
 it("allows an optional message for every reason",()=>{for(const reason of ["project","hello","hiring","collaboration"])expect(validateContact(reason==="project"?base:{...base,reason,needs:null,budget:null,timeline:null})).toBeNull();});
 it("requires every project group and refuses unknown enums",()=>{for(const change of [{reason:"other"},{needs:[]},{needs:["unknown"]},{needs:[NEEDS[0],NEEDS[0]]},{budget:"Free consultation"},{timeline:"Yesterday"},{need:"x".repeat(4001)}])expect(validateContact({...base,...change})).not.toBeNull();});
 it("normalizes hidden project inputs to null and refuses them in direct validation",()=>{const f=new FormData();for(const [k,v] of Object.entries({name:base.name,email:base.email,reason:"hello",budget:base.budget,timeline:base.timeline,needs:NEEDS[0]}))f.set(k,v);expect(readContact(f)).toEqual({...base,reason:"hello",needs:null,budget:null,timeline:null});expect(validateContact({...base,reason:"hello"})).toMatch(/empty/);});
});
