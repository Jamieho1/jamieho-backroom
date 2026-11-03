/** Article pictures (2026-11-03): owner uploads to the public `article-images` bucket, one folder per article slug. */
export const IMAGE_BUCKET='article-images';
export const IMAGE_TYPES=['image/png','image/jpeg','image/webp','image/gif'];
export const IMAGE_MAX_BYTES=5*1024*1024;

/** "My Slide 01.PNG" → "my-slide-01.png": keeps a predictable name so re-uploading replaces the same picture. */
export function imageName(name:string):string{
 const m=/^(.*?)(\.[a-z0-9]+)?$/i.exec(name.trim())!;
 const base=m[1].toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)||'image';
 const ext=(m[2]??'').toLowerCase().replace('.jpeg','.jpg');
 return base+(['.png','.jpg','.webp','.gif'].includes(ext)?ext:'');
}
export const imagePath=(slug:string,name:string)=>`${slug||'unsorted'}/${imageName(name)}`;
export function imageProblem(file:{name:string;type:string;size:number}):string|null{
 if(!IMAGE_TYPES.includes(file.type))return `${file.name}: use PNG, JPG, WebP or GIF.`;
 if(file.size>IMAGE_MAX_BYTES)return `${file.name}: keep pictures under 5 MB.`;
 return null;
}
/** Markdown for an uploaded picture; the file name (without extension) becomes the caption placeholder. */
export const imageMarkdown=(url:string,name:string)=>`![${imageName(name).replace(/\.[a-z]+$/,'').replace(/-/g,' ')}](${url})`;
