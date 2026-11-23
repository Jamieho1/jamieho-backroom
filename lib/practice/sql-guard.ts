/**
 * Accepts exactly one SELECT / WITH statement. A small scanner skips strings, quoted identifiers, dollar quotes
 * and comments so a semicolon inside them never counts. Postgres still has the last word: the query also runs in a
 * READ ONLY transaction, so a data-modifying CTE fails there with Postgres' own message.
 */
export const MAX_QUERY_LENGTH=20000;
export type GuardResult={ok:true;sql:string}|{ok:false;message:string};

interface Scan{statements:string[];}
function scan(input:string):Scan{
 const statements:string[]=[];let current='',meaningful=false,i=0;
 const push=()=>{if(meaningful)statements.push(current.trim());current='';meaningful=false;};
 while(i<input.length){
  const c=input[i],next=input[i+1];
  if(c==='-'&&next==='-'){const end=input.indexOf('\n',i);const stop=end<0?input.length:end;current+=input.slice(i,stop);i=stop;continue;}
  if(c==='/'&&next==='*'){let depth=1,j=i+2;while(j<input.length&&depth>0){if(input[j]==='/'&&input[j+1]==='*'){depth++;j+=2;}else if(input[j]==='*'&&input[j+1]==='/'){depth--;j+=2;}else j++;}current+=input.slice(i,j);i=j;continue;}
  if(c==="'"){const escaped=/[eE]$/.test(current)&&!/[A-Za-z0-9_]e$/i.test(current.slice(-2));let j=i+1;while(j<input.length){if(escaped&&input[j]==='\\'){j+=2;continue;}if(input[j]==="'"){if(input[j+1]==="'"){j+=2;continue;}break;}j++;}j=Math.min(j+1,input.length);current+=input.slice(i,j);meaningful=true;i=j;continue;}
  if(c==='"'){let j=i+1;while(j<input.length){if(input[j]==='"'){if(input[j+1]==='"'){j+=2;continue;}break;}j++;}j=Math.min(j+1,input.length);current+=input.slice(i,j);meaningful=true;i=j;continue;}
  if(c==='$'){const tag=/^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(input.slice(i));if(tag){const close=input.indexOf(tag[0],i+tag[0].length);const stop=close<0?input.length:close+tag[0].length;current+=input.slice(i,stop);meaningful=true;i=stop;continue;}}
  if(c===';'){push();i++;continue;}
  if(!/\s/.test(c))meaningful=true;
  current+=c;i++;
 }
 push();return {statements};
}
/** First keyword outside comments and opening parentheses. */
function firstWord(statement:string){
 let rest=statement;
 for(;;){rest=rest.replace(/^\s+/,'');if(rest.startsWith('--')){const end=rest.indexOf('\n');rest=end<0?'':rest.slice(end+1);}else if(rest.startsWith('/*')){const end=rest.indexOf('*/');rest=end<0?'':rest.slice(end+2);}else if(rest.startsWith('(')){rest=rest.slice(1);}else break;}
 return /^[A-Za-z]+/.exec(rest)?.[0].toLowerCase()??'';
}
export function guardQuery(input:string):GuardResult{
 if(typeof input!=='string'||!input.trim())return {ok:false,message:'Write a query first.'};
 if(input.length>MAX_QUERY_LENGTH)return {ok:false,message:`Keep the query under ${MAX_QUERY_LENGTH.toLocaleString('en-GB')} characters.`};
 const {statements}=scan(input);
 if(!statements.length)return {ok:false,message:'Write a query first.'};
 if(statements.length>1)return {ok:false,message:'Only one statement is allowed. Remove everything after the first semicolon.'};
 const word=firstWord(statements[0]);
 if(word!=='select'&&word!=='with')return {ok:false,message:'Only SELECT queries (including WITH ... SELECT) can run here.'};
 return {ok:true,sql:statements[0]};
}
