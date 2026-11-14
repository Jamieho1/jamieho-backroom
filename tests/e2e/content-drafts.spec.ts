import { test, expect, type Page } from '@playwright/test';
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import type { PGlite } from '@electric-sql/pglite';
import { freshDb, addUser } from '../db/harness';
import { validateOperations } from '../../lib/content-drafts/allowlist';
import { reviewFields, type ContentChange } from '../../lib/content-drafts/types';
let db:PGlite, bundle:string;
const ownerId='00000000-0000-4000-8000-0000000000f1';
test.beforeAll(async()=>{
 db=await freshDb();await db.query("insert into private.settings(key,value) values ('owner_email','local-owner@example.test')");await addUser(db,{id:ownerId,email:'local-owner@example.test'});
 const result=await build({stdin:{contents:`import React from 'react';import {createRoot} from 'react-dom/client';import {ContentReviewList} from './components/content-drafts/review-list';createRoot(document.getElementById('review-fixture')).render(<main className="app-page"><div className="app-page-content content-review-page"><h1>Review content</h1><ContentReviewList drafts={window.reviewDrafts}/></div></main>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'review-fixture',setup(b){
  b.onResolve({filter:/app\/actions\/content-preview$/},()=>({path:'preview',namespace:'preview-action'}));
  b.onLoad({filter:/.*/,namespace:'preview-action'},()=>({contents:'export async function startContentPreview(){return {ok:false,message:"Preview is exercised separately"}}'}));
  b.onResolve({filter:/app\/actions\/content-drafts$/},()=>({path:'actions',namespace:'review'}));
  b.onLoad({filter:/.*/,namespace:'review'},()=>({contents:`async function run(id,approve){const r=await fetch('/__review_action',{method:'POST',body:JSON.stringify({id,approve})});return r.json()}export const approveContentChange=id=>run(id,true);export const discardContentChange=id=>run(id,false);`}));
  b.onResolve({filter:/^next\/navigation$/},()=>({path:'navigation',namespace:'review-nav'}));
  b.onLoad({filter:/.*/,namespace:'review-nav'},()=>({contents:'export function useRouter(){return {refresh(){}}}'}));
 }}]});bundle=result.outputFiles[0].text;
});
test.afterAll(async()=>{await db?.close()});
async function mountOwner(page:Page){
 await db.query('delete from public.content_changes');
 await db.query("update public.site_sections set title='Current local title' where key='hero'");
 for(const [summary,title,date] of [['Older draft','Older proposal','2026-11-13'],['Newest draft','Approved local title','2026-11-14']]) await db.query("insert into public.content_changes(summary,operations,created_at) values ($1,$2,$3)",[summary,JSON.stringify([{op:'update',table:'site_sections',key:'hero',fields:{title}}]),date]);
 const sets=(await db.query<ContentChange>("select * from public.content_changes where status='draft' order by created_at desc")).rows;
 const sections=(await db.query<{key:string;title:string;body:string}>('select key,title,body from public.site_sections')).rows;
 const live=Object.fromEntries(sections.map(s=>[s.key,s]));
 const drafts=sets.map(set=>{const v=validateOperations(set.operations);if(!v.ok)throw Error(v.message);return {...set,fields:reviewFields(v.operations,live)}});
 await page.route('**/manage/review',r=>r.fulfill({contentType:'text/html',body:'<!DOCTYPE html><html><head></head><body><div id="review-fixture"></div></body></html>'}));
 await page.route('**/__review_action',async r=>{
  const {id,approve}=r.request().postDataJSON();
  try{await db.transaction(async tx=>{
   await tx.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:ownerId})]);await tx.exec('set local role authenticated');
   await tx.query('update public.content_changes set status=$1 where id=$2 and status=\'draft\'',[approve?'approved':'discarded',id]);
  });await r.fulfill({json:{ok:true,message:approve?'Approved. The live content is updated.':'Discarded. Live content was not changed.'}})}catch{await r.fulfill({json:{ok:false,message:'Approval failed. No content changes were applied.'}})}
 });
 await page.goto('/manage/review');
 await page.addStyleTag({content:readFileSync('app/globals.css','utf8')+'\n'+readFileSync('app/manage/review/review.css','utf8')});
 await page.evaluate(d=>{(window as unknown as {reviewDrafts:unknown}).reviewDrafts=d},drafts);
 await page.route('**/__review_fixture.js',r=>r.fulfill({contentType:'text/javascript',body:bundle}));await page.addScriptTag({url:'/__review_fixture.js'});
}
// Uses the real protected Next route; the owner fixture below runs the real SQL trigger in local Postgres.
test('visitor gets a 404 from the uncached review route',async({page})=>{
 const response=await page.goto('/manage/review');expect(response?.status()).toBe(404);await expect(page.getByRole('heading',{name:'Review content'})).toHaveCount(0);
});
test('owner review shows newest drafts and current/proposed values; approve commits, discard preserves content',async({page})=>{
 await mountOwner(page);const cards=page.locator('.review-set');await expect(cards).toHaveCount(2);
 await expect(cards.first().getByRole('heading')).toHaveText('Newest draft');
 await expect(cards.first().getByRole('cell',{name:'Current local title',exact:true})).toBeVisible();
 await expect(cards.first().getByRole('cell',{name:'Approved local title',exact:true})).toBeVisible();
 await cards.first().getByRole('button',{name:'Approve',exact:true}).click();await expect(page.getByRole('status')).toContainText('Approved');
 expect((await db.query<{title:string}>("select title from public.site_sections where key='hero'")).rows[0].title).toBe('Approved local title');
 await page.getByRole('button',{name:'Discard',exact:true}).click();await expect(page.getByRole('status').last()).toContainText('Discarded');
 expect((await db.query<{title:string}>("select title from public.site_sections where key='hero'")).rows[0].title).toBe('Approved local title');
 expect((await db.query<{status:string}>('select status from public.content_changes order by created_at desc')).rows.map(x=>x.status)).toEqual(['approved','discarded']);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
