'use client';
import {useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import {makeUploader} from '@/components/articles/image-upload';
import {saveContentPhoto} from '@/app/actions/content-photo';
import {photoPath,photoUrl,validatePhotoFile,PHOTO_TYPES,type PhotoSlot} from '@/lib/content-drafts/photo-slots';
export function PhotoSlots({id,slots,disabled=false,onBusy}:{id:string;slots:PhotoSlot[];disabled?:boolean;onBusy?(busy:boolean):void}){
 return slots.length?<div className="draft-photo-slots">{slots.map(slot=><SlotUpload key={slot.slot} id={id} slot={slot} disabled={disabled} onBusy={onBusy}/>)}</div>:null;
}
function SlotUpload({id,slot,disabled,onBusy}:{id:string;slot:PhotoSlot;disabled:boolean;onBusy?(busy:boolean):void}){
 const input=useRef<HTMLInputElement>(null);const router=useRouter();const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 async function pick(files:File[]){
  if(disabled||busy||!files.length)return;
  if(files.length!==1){setMessage('Drop one picture for this slot.');return;}
  const problem=validatePhotoFile(files[0],slot);if(problem){setMessage(problem);return;}
  setBusy(true);onBusy?.(true);setMessage('Uploading…');
  try{
   await makeUploader(slot.bucket)(files,`drafts/${id}/${slot.slot}`);
   const result=await saveContentPhoto(id,slot.slot,photoPath(id,slot));setMessage(result.message);
   if(result.ok)router.refresh();
  }catch{setMessage('Could not upload. Check your connection and retry.');}
  finally{setBusy(false);onBusy?.(false);if(input.current)input.current.value='';}
 }
 return <section className="draft-photo-slot" aria-label={`Photo slot ${slot.slot}`} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void pick([...e.dataTransfer.files]);}}>
  <p>{slot.caption}</p><code>{slot.expected_filename}</code>
  {slot.path?<img src={photoUrl(slot.path)} alt={slot.caption}/>:<p className="small">Drop the matching file here. PNG, JPG or WebP · up to 5 MB.</p>}
  <button type="button" disabled={disabled||busy} onClick={()=>input.current?.click()}>{busy?'Uploading…':slot.path?'Replace photo':'Choose photo'}</button>
  <input ref={input} type="file" hidden accept={PHOTO_TYPES.join(',')} aria-label={`Upload ${slot.expected_filename}`} onChange={e=>void pick([...e.target.files??[]])}/>
  {message?<p role="status">{message}</p>:null}
 </section>;
}
