'use client';
import {useRef,useState} from 'react';
import {supabaseBrowser} from '@/lib/supabase/browser';
import {IMAGE_BUCKET,IMAGE_TYPES,imagePath,imageProblem} from '@/lib/article-images';

export type Uploader=(files:File[],slug:string)=>Promise<{name:string;url:string}[]>;

/** Uploads with the signed-in owner's session; Storage policies refuse anyone else. Same name = replaced. */
export const uploadToStorage:Uploader=async(files,slug)=>{
 const sb=supabaseBrowser(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
 const out=[];
 for(const f of files){
  const path=imagePath(slug,f.name);
  const {error}=await sb.storage.from(IMAGE_BUCKET).upload(path,f,{upsert:true,contentType:f.type,cacheControl:'31536000'});
  if(error)throw new Error(`${f.name}: ${error.message}`);
  out.push({name:f.name,url:sb.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl});
 }
 return out;
};

export function ImageUploadButton({slug,label,multiple=false,disabled,onUploaded,upload=uploadToStorage}:{slug:string;label:string;multiple?:boolean;disabled?:boolean;onUploaded(files:{name:string;url:string}[]):void;upload?:Uploader}){
 const input=useRef<HTMLInputElement>(null);const [busy,setBusy]=useState(false);const [msg,setMsg]=useState('');
 async function pick(list:FileList|null){
  const files=[...(list??[])].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));if(!files.length)return;
  const bad=files.map(imageProblem).find(Boolean);if(bad){setMsg(bad);return;}
  if(!slug){setMsg('Add the URL slug first: pictures are stored in a folder named after it.');return;}
  setBusy(true);setMsg(`Uploading ${files.length} picture${files.length>1?'s':''}…`);
  try{const done=await upload(files,slug);onUploaded(done);setMsg(`Uploaded ${done.length}.`);}catch(e){setMsg(`Couldn't upload: ${e instanceof Error?e.message:'try again'}.`);}
  finally{setBusy(false);if(input.current)input.current.value='';}
 }
 return <span className="article-upload"><button type="button" className="btn ghost small" disabled={disabled||busy} onClick={()=>input.current?.click()}>{busy?'Uploading…':label}</button>
  <input ref={input} type="file" hidden accept={IMAGE_TYPES.join(',')} multiple={multiple} onChange={e=>void pick(e.target.files)} aria-label={label} />
  {msg?<span role="status" className="muted small">{msg}</span>:null}</span>;
}
