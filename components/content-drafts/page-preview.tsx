import type {HomePreview} from '@/lib/content-drafts/types';
import {ContentPreviewBar} from './preview-bar';
import './preview.css';
export function PagePreview({preview,page}:{preview:HomePreview|null;page:string}){
 return preview?<ContentPreviewBar summary={preview.summary} page={page} experience={!!preview.experience} targets={preview.targets}/>:null;
}
