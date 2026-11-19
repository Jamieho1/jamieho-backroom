import {pad2} from "@/lib/project-view";

/** Generated title card (dial ring motif): the visual for a project with no screenshots. */
export function TitleCard({n,total,name,tags}:{n:number;total:number;name:string;tags:string[]}){
 return <div className={`pj-tc${name.length>26?" long":""}`} data-title-card="true">
  <svg className="rg" viewBox="0 0 200 200" aria-hidden="true"><circle className="r1" cx="100" cy="100" r="96"/><circle className="r4" cx="100" cy="100" r="88"/><g className="rdg"><circle className="r2" cx="100" cy="100" r="68"/><circle className="rd" cx="168" cy="100" r="3.2"/></g><circle className="r3" cx="100" cy="100" r="44"/><circle className="rd" cx="100" cy="100" r="2.4"/></svg>
  <div className="pj-tc-top">{pad2(n)} / {pad2(total)}</div>
  <div className="pj-tc-bot"><p className="pj-tc-name">{name}</p><div className="pj-tc-tags">{tags.slice(0,4).map(t=><span key={t}>{t}</span>)}</div></div>
 </div>;
}
