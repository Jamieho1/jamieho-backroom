"use client";
import {useState} from "react";
import {emptyItem, type Item, type Kind} from "@/lib/experience";
import {ItemEditor} from "../experience-item-editor";
import type {ExpResult} from "@/app/actions/experience";
import {saveItem, deleteItem, moveItem} from "@/app/actions/experience";
const sections: {kind:Kind; title:string}[] = [{kind:"role",title:"Professional experience"},{kind:"project",title:"Projects"},{kind:"education",title:"Education"},{kind:"certificate",title:"Certificates"},{kind:"skills",title:"Skills"},{kind:"other",title:"Other"}];
export function ResumeSections({items,canEdit,disabled,onItems,onEditing,onBullet,storyCount,activeBullet}:{items:Item[];canEdit:boolean;disabled:boolean;onItems(items:Item[]):void;onEditing(editing:boolean):void;onBullet(id:string):void;storyCount(id?:string):number;activeBullet:string|null}){
 const [edit,setEdit]=useState<Item|null>(null);
 function close(){setEdit(null);onEditing(false)}
 function after(result:ExpResult){if(result.ok&&result.items){onItems(result.items);close()}}
 return <section aria-label="CV" className="behavioral-cv">
  {sections.map(section=>{const rows=items.filter(item=>item.kind===section.kind);if(section.kind==='other'&&!rows.length)return null;
   return <section className="resume-section" key={section.kind} aria-label={section.title}>
    <header className="resume-section-head"><h3>{section.title}</h3>{canEdit?<button type="button" className="btn ghost small" disabled={disabled||!!edit} onClick={()=>{setEdit({...emptyItem(),kind:section.kind});onEditing(true)}}>Add {section.kind==='role'?'experience':section.kind==='project'?'project':section.kind==='certificate'?'certificate':section.kind==='skills'?'skills':section.kind==='education'?'education':'entry'}</button>:null}</header>
    {!rows.length&&edit?.kind!==section.kind?<p className="muted">No entries yet.</p>:null}
    {rows.map(item=>edit?.id&&edit.id===item.id?null:<article className="behavioral-role" key={item.id??item.title}>
     <header className="resume-entry-head"><div><h4>{item.title}{item.org?` · ${item.org}`:''}</h4><p className="muted">{[item.dates,item.location].filter(Boolean).join(' · ')}</p></div>{canEdit?<button type="button" className="btn ghost small" disabled={disabled||!!edit} aria-label={`Edit ${item.title}`} onClick={()=>{setEdit({...item,bullets:item.bullets.map(b=>({...b}))});onEditing(true)}}>Edit</button>:null}</header>
     {item.summary?<p className="behavioral-text">{item.summary}</p>:null}
     <ul>{item.bullets.map((b,i)=>{const count=storyCount(b.id);return <li key={b.id??i}><p>{b.text}</p><button className="btn ghost small" disabled={disabled||!!edit||!b.id} aria-label={`${count} ${count===1?'story':'stories'} for ${b.text}`} aria-pressed={activeBullet===b.id} onClick={()=>onBullet(b.id!)}>{count} {count===1?'story':'stories'}<span className="sr-only"> for {b.text}</span></button></li>})}</ul>
    </article>)}
    {edit?.kind===section.kind?<ItemEditor key={edit.id??'new'} initial={edit} api={{load:async()=>items,save:saveItem,remove:deleteItem,move:moveItem}} onSaved={after} onCancel={close} isNew={!edit.id} canUp={!!edit.id&&items.findIndex(i=>i.id===edit.id)>0} canDown={!!edit.id&&items.findIndex(i=>i.id===edit.id)<items.length-1}/>:null}
   </section>
  })}
 </section>
}
