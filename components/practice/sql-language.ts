/** Small SQL tokenizer for the editor (no new dependency): keywords, strings, numbers, comments and function calls. */
import {StreamLanguage,type StringStream} from '@codemirror/language';
const KEYWORDS=new Set(('select from where group by having order limit offset fetch join inner left right full outer cross natural on using as and or not in is null like ilike similar between exists case when then else end distinct union all intersect except with recursive over partition rows range groups unbounded preceding following current row asc desc nulls first last cast interval any some filter within lateral values escape to true false at time zone collate').split(' '));
interface State{block:number}
export const sqlLanguage=StreamLanguage.define<State>({
 startState:()=>({block:0}),
 token(stream:StringStream,state:State){
  if(state.block>0){
   while(!stream.eol()){if(stream.match('/*')){state.block++;continue;}if(stream.match('*/')){state.block--;if(state.block===0)break;continue;}stream.next();}
   return 'comment';
  }
  if(stream.eatSpace())return null;
  if(stream.match('--')){stream.skipToEnd();return 'comment';}
  if(stream.match('/*')){state.block=1;while(!stream.eol()){if(stream.match('/*')){state.block++;continue;}if(stream.match('*/')){state.block--;if(state.block===0)break;continue;}stream.next();}return 'comment';}
  const ch=stream.peek();
  if(ch==="'"){stream.next();while(!stream.eol()){const c=stream.next();if(c==="'"){if(stream.peek()==="'")stream.next();else break;}}return 'string';}
  if(ch==='"'){stream.next();while(!stream.eol()){const c=stream.next();if(c==='"'){if(stream.peek()==='"')stream.next();else break;}}return 'variableName';}
  if(stream.match(/^\d+(\.\d+)?([eE][+-]?\d+)?/))return 'number';
  if(stream.match(/^[A-Za-z_][A-Za-z0-9_$]*/)){
   const word=stream.current().toLowerCase();
   if(word==='null'||word==='true'||word==='false')return 'number';
   if(KEYWORDS.has(word))return 'keyword';
   return /^\s*\(/.test(stream.string.slice(stream.pos))?'variableName.function':'variableName';
  }
  stream.next();return null;
 },
 languageData:{commentTokens:{line:'--',block:{open:'/*',close:'*/'}}},
});
