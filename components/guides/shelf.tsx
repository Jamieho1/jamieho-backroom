import {PrimaryPill} from "@/components/primary-pill";
/** The toolkit links shown at the top of a guide. */
export function GuideToolkit({notion,doc}:{notion:string;doc:string}){
 if(!notion&&!doc)return null;
 return <div className="guide-toolkit" aria-label="Toolkit">
  {notion?<PrimaryPill href={notion} target="_blank" rel="noopener noreferrer" aria-label="Open the Notion toolkit ↗">Open the Notion toolkit</PrimaryPill>:null}
  {doc?<a className="btn ghost" href={doc} target="_blank" rel="noopener noreferrer">Copy the Google Doc ↗</a>:null}
 </div>;
}
