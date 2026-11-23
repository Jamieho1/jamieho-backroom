'use server';
import {getViewer} from '@/lib/viewer';
import {supabaseServer} from '@/lib/supabase/server';
import {PracticeCases,type EditableCase} from '@/lib/practice/cases';
import {validProblem,type SaveResult} from '@/lib/practice/data';
export async function loadPracticeCases(problem:number):Promise<{ok:true;cases:EditableCase[]}|{ok:false;message:string}>{
 if(!validProblem(problem))return {ok:false,message:'Choose a valid problem.'};
 try{const viewer=await getViewer();if(!viewer.id||viewer.role==='anonymous')return {ok:false,message:'Sign in to sync test cases.'};const sb=await supabaseServer();if(!sb)throw Error();const {data,error}=await sb.from('practice_cases').select('cases').eq('user_id',viewer.id).eq('problem',problem).maybeSingle();if(error)throw Error();return {ok:true,cases:PracticeCases.parse(data?.cases??[])};}catch{return {ok:false,message:'Could not load test cases. Your local cases remain available.'};}
}
export async function savePracticeCases(problem:number,cases:unknown,expectedUserId:string):Promise<SaveResult>{
 const parsed=PracticeCases.safeParse(cases);if(!validProblem(problem)||!parsed.success)return {ok:false,message:'Invalid test cases. Use at most 20 cases and 10000 characters per input.'};
 try{const viewer=await getViewer();if(!viewer.id||viewer.role==='anonymous'||viewer.id!==expectedUserId)return {ok:false,message:'Sign in to the same account to sync test cases.'};const sb=await supabaseServer();if(!sb)throw Error();const {data,error}=await sb.from('practice_cases').upsert({user_id:viewer.id,problem,cases:parsed.data,updated_at:new Date().toISOString()},{onConflict:'user_id,problem'}).select('problem');return error||!data?.length?{ok:false,message:'Could not sync test cases. Saved locally; retry when online.'}:{ok:true};}catch{return {ok:false,message:'Could not sync test cases. Saved locally; retry when online.'};}
}
