import { afterAll, beforeAll, expect, it } from "vitest";
import type { PGlite } from "@electric-sql/pglite";
import { freshDb, addUser, as } from "./harness";
let db: PGlite;
const owner={id:"00000000-0000-4000-8000-0000000000a1",email:"owner@example.com"};
const member={id:"00000000-0000-4000-8000-0000000000a2",email:"member@example.com"};
beforeAll(async()=>{
 db=await freshDb();
 await db.query("insert into private.settings (key,value) values ('owner_email',$1)",[owner.email]);
 await addUser(db,owner); await addUser(db,member);
 await db.query("insert into public.notes (id,title,body,visual) values ('sample','Sample','Existing body','[{\"title\":\"Existing visual\"}]')");
});
afterAll(async()=>{await db.close();});
it("new free notes default to empty without changing body or visuals",async()=>{
 const {rows}=await db.query("select body,free,visual from public.notes where id='sample'");
 expect(rows).toEqual([{body:"Existing body",free:"",visual:[{title:"Existing visual"}]}]);
});
it("an owner save persists for another reader/session and keeps visual JSON",async()=>{
 await db.exec("begin");
 try {
  await db.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({role:"authenticated",sub:owner.id})]);
  await db.exec("set local role authenticated");
  await db.query("update public.notes set body=$1,free=$2,updated_at=now() where id='sample'",["Updated body","Owner free notes"]);
  await db.exec("commit");
 } catch(error){await db.exec("rollback");throw error;}
 const rows=await as(db,{role:"authenticated",sub:member.id},q=>q("select body,free,visual from public.notes where id='sample'"));
 expect(rows).toEqual([{body:"Updated body",free:"Owner free notes",visual:[{title:"Existing visual"}]}]);
});
it("members cannot alter free notes and size limits are enforced",async()=>{
 expect(await as(db,{role:"authenticated",sub:member.id},q=>q("update public.notes set free='Changed' where id='sample' returning id"))).toEqual([]);
 await expect(as(db,{role:"authenticated",sub:owner.id},q=>q("update public.notes set free=$1 where id='sample'",["x".repeat(200001)]))).rejects.toThrow(/check constraint/);
});
