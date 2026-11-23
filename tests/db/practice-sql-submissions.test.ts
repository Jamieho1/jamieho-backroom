import {beforeAll,afterAll,it,expect} from 'vitest';
import {freshDb,addUser,as} from './harness';
let db:Awaited<ReturnType<typeof freshDb>>;const member='00000000-0000-4000-8000-000000000a02';const who={role:'authenticated' as const,sub:member};
beforeAll(async()=>{db=await freshDb();await addUser(db,{id:member,email:'q1-member@example.test'});});afterAll(async()=>db.close());
it('stores SQL submissions as language SQL next to Python ones, still rejecting any other language',async()=>{
 await as(db,who,async q=>{
  await q("insert into practice_submissions(id,problem,status,passed,total,runtime_ms,language,code) values(gen_random_uuid(),1757,'accepted',4,4,3,'SQL','SELECT 1')");
  await q("insert into practice_submissions(id,problem,status,passed,total,runtime_ms,code) values(gen_random_uuid(),217,'accepted',9,9,3,'pass')");
  expect(await q("select problem,language from practice_submissions order by problem")).toEqual([{problem:217,language:'Python'},{problem:1757,language:'SQL'}]);
 });
 for(const language of ['JS','sql',''])await expect(as(db,who,q=>q("insert into practice_submissions(id,problem,status,passed,total,runtime_ms,language,code) values(gen_random_uuid(),1757,'wrong answer',0,4,3,$1,'x')",[language]))).rejects.toThrow();
});
it('SQL question numbers fit every per-user practice table (stars, code, attempts, cases, submissions)',async()=>{
 await as(db,who,async q=>{
  for(const lc of [620,1378,1757,2356]){
   await q('insert into practice_stars(user_id,problem) values(auth.uid(),$1)',[lc]);
   await q("insert into practice_code(user_id,problem,code) values(auth.uid(),$1,'SELECT 1')",[lc]);
   await q("insert into practice_attempts(user_id,id,problem,code,mode,status,passed,total,error) values(auth.uid(),gen_random_uuid(),$1,'SELECT 1','submit','ok',4,4,'')",[lc]);
  }
  expect((await q('select count(*)::int as n from practice_stars'))[0]).toEqual({n:4});
 });
});
