/** Run manually with the approved layer directory; production builds use committed assets. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
const input=process.argv[2];
if(!input)throw new Error('Usage: node scripts/prepare-desktop-art.mjs /path/to/approved/layers');
const keys=['day','night','clouds','sunDay','emptyNight','cutout','cutoutNight','riverDay','riverNight','eyeDay','eyeNight','eyeMatte'];
const transparent=new Set(['cutout','cutoutNight','eyeMatte']);
const destination=path.resolve('public/desktop-art');await fs.mkdir(destination,{recursive:true});
const assets={},details=[];
for(const key of keys){
 const source=path.join(input,key+'.png');
 const buffer=await sharp(source).webp(transparent.has(key)?{lossless:true,effort:6}:{quality:94,effort:6,smartSubsample:true}).toBuffer();
 const hash=crypto.createHash('sha256').update(buffer).digest('hex');const name=key+'-'+hash.slice(0,12)+'.webp';
 await fs.writeFile(path.join(destination,name),buffer);assets[key]='/desktop-art/'+name;
 const info=await sharp(buffer).metadata();details.push({key,file:assets[key],bytes:buffer.length,width:info.width,height:info.height,sha256:hash});
}
await fs.writeFile('components/desktop-scene/assets.ts','/** Approved public wallpaper layers; generated with prepare-desktop-art.mjs. */\nexport const DESKTOP_ASSETS='+JSON.stringify(assets,null,2)+' as const;\n');
await fs.writeFile('Resources/Desktop - Asset Manifest.json',JSON.stringify({approval:'Jamie approved committing these public illustrated wallpaper assets on 2026-11-03. This exception does not include CV/private content.',tool:'Built-in Imagegen; WebP encoding with Sharp for delivery. Original layered masters and prompts stay outside Git.',assets:details},null,2)+'\n');
console.log(JSON.stringify({files:details.length,totalBytes:details.reduce((sum,a)=>sum+a.bytes,0),assets:details.map(({key,bytes})=>({key,bytes}))}));
