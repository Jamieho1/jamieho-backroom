'use client';
import {useState} from 'react';
import {CodeBlock} from '@/components/notes/code-highlight';

const LABEL:Record<string,string>={text:'Text',prompt:'Prompt',bash:'Terminal',sh:'Terminal',shell:'Terminal',zsh:'Terminal',python:'Python',py:'Python',js:'JavaScript',ts:'TypeScript',json:'JSON',sql:'SQL',md:'Markdown',markdown:'Markdown'};

/** A copyable block for prompts and commands; `collapsed` blocks start folded behind their title. */
export function ArticleCode({code,lang,title,collapsed}:{code:string;lang:string;title:string;collapsed:boolean}){
 const [copied,setCopied]=useState(false);
 const label=title||LABEL[lang]||lang||'Text';
 const copy=async()=>{try{await navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),1600);}catch{/* clipboard blocked: the text stays selectable */}};
 const body=/^(py|python|python3)$/i.test(lang)?<CodeBlock code={code} lang="python" className="article-code-pre" />:<pre className="article-code-pre"><code>{code}</code></pre>;
 const bar=<button type="button" className="article-copy" onClick={e=>{e.preventDefault();void copy();}} aria-label={`Copy ${label}`}>{copied?'Copied ✓':'Copy'}</button>;
 return collapsed
  ?<details className="article-code"><summary><span className="article-code-label">{label}</span>{bar}</summary>{body}</details>
  :<div className="article-code"><div className="article-code-bar"><span className="article-code-label">{label}</span>{bar}</div>{body}</div>;
}
