// Disposable loopback Supabase-shaped API backed by the real migration chain in PGlite.
// For local integration checks only. No live database, keys, accounts or test hooks in app code.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const root = process.cwd();
const port = Number(process.env.CONTENT_PREVIEW_TEST_PORT || 3208);
const users = {
  owner: { id: '00000000-0000-4000-8000-000000000101', email: 'preview-owner@example.test' },
  member: { id: '00000000-0000-4000-8000-000000000102', email: 'preview-member@example.test' },
};
const tokenFor = user => Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url') + '.' + Buffer.from(JSON.stringify({ sub: user.id, role: 'authenticated', exp: Math.floor(Date.now()/1000)+86400 })).toString('base64url') + '.local-test-signature';
const sessions = Object.fromEntries(Object.entries(users).map(([role, user]) => [role, {
  access_token: tokenFor(user), refresh_token: 'local-only-refresh', expires_at: Math.floor(Date.now()/1000)+86400, expires_in: 86400, token_type: 'bearer',
  user: { ...user, aud: 'authenticated', role: 'authenticated', email_confirmed_at: '2026-11-14T00:00:00Z', app_metadata: { provider: 'google' }, user_metadata: {}, created_at: '2026-11-14T00:00:00Z' },
}]));
(async () => {
  const db = new PGlite();
  const bootstrap = fs.readFileSync(path.join(root, 'tests/db/harness.ts'), 'utf8').match(/const BOOTSTRAP = `([\s\S]*?)`;/)[1];
  await db.exec(bootstrap);
  await db.exec(fs.readFileSync(path.join(root,"tests/support/storage-bootstrap.sql"),"utf8"));
  for (const file of fs.readdirSync(path.join(root, 'supabase/migrations')).filter(f => f.endsWith('.sql')).sort()) await db.exec(fs.readFileSync(path.join(root, 'supabase/migrations', file), 'utf8'));
  await db.query("insert into private.settings(key,value) values ('owner_email',$1)", [users.owner.email]);
  for (const user of Object.values(users)) await db.query('insert into auth.users(id,email,email_confirmed_at) values ($1,$2,now())', [user.id,user.email]);
  await db.query("update public.site_sections set title='Live hero heading',body='Live hero body' where key='hero'");
  await db.query("update public.site_sections set title='Live About heading',body='Live About body' where key='about'");
  // Allow the member fixture to read CV data, so cookie isolation is tested beyond a gate screen.
  await db.query("insert into public.invites(email) values ($1)",[users.member.email]);
  let publishingSeed=0;
  const send = (res,status,data) => { res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'}); res.end(JSON.stringify(data)); };
  const server = http.createServer(async (req,res) => {
    if (/^http:\/\/127\.0\.0\.1:\d+$/.test(req.headers.origin || '')) {
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
      res.setHeader('Access-Control-Allow-Headers','authorization, apikey, x-client-info, content-type, prefer, range, x-supabase-api-version, x-upsert, accept-profile, content-profile, x-retry-count');
      res.setHeader('Access-Control-Allow-Methods','GET,HEAD,PATCH,POST,OPTIONS');
      res.setHeader('Access-Control-Expose-Headers','Content-Range');
    }
    if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
    const chunks=[]; for await(const chunk of req)chunks.push(chunk); const rawBody=Buffer.concat(chunks);const body=rawBody.toString('utf8');
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    try {
      if(url.pathname==='/__feedback_reset'&&req.method==='POST'){await db.exec('delete from public.messages');return send(res,200,{ok:true});}
      if(url.pathname==='/__feedback_limit'&&req.method==='POST'){await db.exec("insert into public.messages(kind,need) select 'idea','Synthetic limit fixture' from generate_series(1,30)");return send(res,200,{ok:true});}
      if(url.pathname==='/__feedback_state')return send(res,200,(await db.query('select kind,need,page_path,name,email from public.messages order by created_at')).rows);
      if (url.pathname === '/__session') {
        const session = sessions[url.searchParams.get('role') || 'owner'];
        if (!session) return send(res,400,{});
        return send(res,200,{ cookie: {name:'sb-127-auth-token',value:'base64-'+Buffer.from(JSON.stringify(session)).toString('base64url')} });
      }
      if (url.pathname === '/__seed' && req.method === 'POST') {
        const proposal=JSON.parse(body); const r=await db.query('insert into public.content_changes(summary,operations,photo_slots) values ($1,$2,$3) returning id',[proposal.summary,JSON.stringify(proposal.operations),JSON.stringify(proposal.photo_slots??[])]);
        return send(res,200,r.rows[0]);
      }
      if (url.pathname === '/__experience_seed' && req.method === 'POST') {
        const ids=['00000000-0000-4000-8000-000000000501','00000000-0000-4000-8000-000000000502'];
        await db.query('delete from public.experience_items where id=any($1::uuid[])',[ids]);
        await db.query("insert into public.experience_items(id,title,summary,sort,public) values ($1,'Live fixture role','Live fixture summary',1,true),($2,'Hide fixture role','Second fixture summary',2,true)",ids);
        await db.query("insert into public.experience_bullets(id,item_id,text,sort,public) values ('00000000-0000-4000-8000-000000000503',$1,'Delete fixture proof',1,true),('00000000-0000-4000-8000-000000000505',$1,'Private fixture proof',2,false)",[ids[0]]);
        return send(res,200,{ok:true});
      }
      if (url.pathname === '/__publishing_seed' && req.method === 'POST') {
        const suffix=++publishingSeed;
        const ids=['00000000-0000-4000-8000-000000000701','00000000-0000-4000-8000-000000000702','00000000-0000-4000-8000-000000000703','00000000-0000-4000-8000-000000000704'];
        for(const table of ['projects','articles','guides'])await db.query('delete from public.'+table+' where id=any($1::uuid[])',[ids]);
        await db.query("insert into public.projects(id,slug,name,public,featured) values ($1,$2,'Live fixture project',true,true)",[ids[0],'live-fixture-project-'+suffix]);
        await db.query("insert into public.articles(id,slug,title,published) values ($1,$2,'Live fixture article',true)",[ids[1],'live-fixture-article-'+suffix]);
        await db.query("insert into public.guides(id,slug,title,published) values ($1,$2,'Live fixture guide',true)",[ids[2],'live-fixture-guide-'+suffix]);
        return send(res,200,{project:'live-fixture-project-'+suffix,article:'live-fixture-article-'+suffix,guide:'live-fixture-guide-'+suffix});
      }
      if (url.pathname === '/__app_seed' && req.method==='POST') {
        await db.exec("delete from public.behavioral_answers; delete from public.behavioral_stories; delete from public.notes; delete from public.question_notes; delete from public.practice_code; delete from public.practice_attempts; delete from public.practice_stars");
        await db.exec("insert into public.notes(id,title,body,free,sort) values ('fixture-note','Fixture note','Live fixture note','Live free',1),('sd-fixture','System design: Synthetic architecture','Synthetic system note','',2),('class-design','Class design','Synthetic class note','',3); insert into public.question_notes(problem,body) values (217,'Live fixture question'); insert into public.practice_code(user_id,problem,code) values ('00000000-0000-4000-8000-000000000101',217,'# Live fixture code'); insert into public.practice_stars(user_id,problem) values('00000000-0000-4000-8000-000000000101',217)");
        await db.exec("insert into public.behavioral_stories(id,title,situation) values ('00000000-0000-4000-8000-000000000903','Live fixture story','Live fixture situation'); insert into public.behavioral_answers(question_id,outline) values ('g-intro','Live fixture outline')");
        return send(res,200,{ok:true});
      }
      if(url.pathname==='/__behavioral_seed'&&req.method==='POST'){await db.exec('delete from public.interview_behavioral_answers; delete from public.interview_behavioral_custom_questions');return send(res,200,{ok:true});}
      if(url.pathname==='/__resume_seed'&&req.method==='POST'){await db.exec("delete from public.user_resumes; update public.resume_templates set title='Resume guide',content='{\"entries\":[]}'");return send(res,200,{ok:true});}
      if (url.pathname === '/__state') return send(res,200,{ app:Object.fromEntries(await Promise.all(['notes','question_notes','practice_code','practice_stars','behavioral_stories','behavioral_answers'].map(async table=>[table,(await db.query('select * from public.'+table)).rows]))),projects:(await db.query('select * from public.projects')).rows,articles:(await db.query('select * from public.articles')).rows,guides:(await db.query('select * from public.guides')).rows,sections:(await db.query('select key,title,body from public.site_sections')).rows, sets:(await db.query('select id,status,previous,approved_by,photo_slots from public.content_changes')).rows, items:(await db.query('select * from public.experience_items')).rows, bullets:(await db.query('select * from public.experience_bullets')).rows });
      const session=Object.values(sessions).find(s=>req.headers.authorization==='Bearer '+s.access_token);
      if(url.pathname.startsWith('/storage/v1/object/')){
        if(!session)return send(res,403,{message:'Owner session required'});
        const info=url.pathname.startsWith('/storage/v1/object/info/');
        const objectName=decodeURIComponent(url.pathname.slice(info?'/storage/v1/object/info/'.length:'/storage/v1/object/'.length));
        const [bucket,...parts]=objectName.split('/');const name=parts.join('/');
        const result=await db.transaction(async tx=>{
          await tx.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:session.user.id,role:'authenticated'})]);await tx.exec('set local role authenticated');
          if(info){const rows=(await tx.query('select * from storage.objects where bucket_id=$1 and name=$2',[bucket,name])).rows;if(!rows.length)throw Error('Object not found');const row=rows[0];return {id:row.id,name:row.name,bucket_id:row.bucket_id,size:row.metadata.size,content_type:row.metadata.mimetype};}
          if(req.method!=='POST')throw Error('Unsupported storage request');
          const request=new Request('http://127.0.0.1/storage',{method:'POST',headers:{'content-type':req.headers['content-type']},body:rawBody});
          const form=await request.formData();const file=[...form.values()].find(value=>typeof value!=='string');
          if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5242880)throw Error('Invalid file type or size');
          const rows=(await tx.query('insert into storage.objects(bucket_id,name,owner_id,metadata) values ($1,$2,$3,$4) on conflict(bucket_id,name) do update set metadata=excluded.metadata returning id',[bucket,name,session.user.id,JSON.stringify({mimetype:file.type,size:file.size})])).rows;
          return {Key:objectName,Id:rows[0].id};
        });return send(res,200,result);
      }
      if (url.pathname === '/auth/v1/user') return session ? send(res,200,session.user) : send(res,401,{message:'No local session'});
      if (!url.pathname.startsWith('/rest/v1/')) return send(res,404,{});
      const table=url.pathname.slice('/rest/v1/'.length);
      if (!['messages','content_changes','site_sections','profiles','experience_items','experience_bullets','desktop_apps','projects','articles','guides','notes','question_notes','practice_code','practice_stars','practice_attempts','behavioral_stories','behavioral_answers','user_resumes','resume_templates','interview_behavioral_themes','interview_behavioral_questions','interview_behavioral_custom_questions','interview_behavioral_answers'].includes(table)) return send(res,200,[]);
      const rows=await db.transaction(async tx=>{
        await tx.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:session?.user.id || '',role:session?'authenticated':'anon'})]);
        await tx.exec('set local role '+(session?'authenticated':'anon'));
        if (table==='profiles') return (await tx.query('select * from public.profiles where id=$1',[session?.user.id || users.member.id])).rows;
        const where=[],params=[];
        for (const col of (table.startsWith('interview_behavioral_')?['id','user_id','question_id','theme_id','published']:table==='user_resumes'?['user_id','revision']:table==='resume_templates'?['key']:table==='content_changes'?['id','status','operations','photo_slots']:table==='site_sections'?['key']:table==='projects'?['id','slug','public']:['articles','guides'].includes(table)?['id','slug','published']:['question_notes','practice_code','practice_stars','practice_attempts'].includes(table)?['problem','user_id','mode','status']:table==='behavioral_answers'?['question_id']:['id'])) {
          const value=url.searchParams.get(col);
          if (value?.startsWith('eq.')) { params.push(value.slice(3));where.push(col+'=$'+params.length+(['operations','photo_slots'].includes(col)?'::jsonb':'')); }
        }
        const clause=where.length?' where '+where.join(' and '):'';
        if (req.method==='PATCH' && table==='content_changes') {
          const patch=JSON.parse(body); if (!['status','photo_slots'].includes(Object.keys(patch).join(','))) throw Error('Test adapter accepts status changes only');
          const field=Object.keys(patch)[0];params.push(field==='photo_slots'?JSON.stringify(patch[field]):patch[field]);return (await tx.query('update public.content_changes set '+field+'=$'+params.length+(field==='photo_slots'?'::jsonb':'')+clause+' returning *',params)).rows;
        }
        if(['interview_behavioral_answers','interview_behavioral_custom_questions'].includes(table)&&req.method==='POST'){
          const row=JSON.parse(body);const allowed=table==='interview_behavioral_answers'?['user_id','question_id','custom','situation','task','action','result','role_id']:['id','user_id','theme_id','prompt'];
          const keys=Object.keys(row);if(keys.some(k=>!allowed.includes(k)))throw Error('Unknown Behavioral field');
          const conflict=table==='interview_behavioral_answers'?' on conflict(user_id,question_id) do update set '+keys.map(k=>k+'=excluded.'+k).join(','):'';
          return (await tx.query('insert into public.'+table+'('+keys.join(',')+') values ('+keys.map((_,i)=>'$'+(i+1)).join(',')+')'+conflict+' returning *',keys.map(k=>row[k]))).rows;
        }
        if(table==='messages'){
          if(req.method==='POST'){const row=JSON.parse(body);const keys=Object.keys(row);if(keys.some(k=>!['kind','need','page_path','name','email','budget','ip_hash'].includes(k)))throw Error('Unknown message field');await tx.query('insert into public.messages('+keys.join(',')+') values ('+keys.map((_,i)=>'$'+(i+1)).join(',')+')',keys.map(k=>row[k]));return [];}
          if(req.method==='PATCH'){const row=JSON.parse(body);if(Object.keys(row).join(',')!=='read')throw Error('Only read status may change');params.push(row.read);return (await tx.query('update public.messages set read=$'+params.length+clause+' returning *',params)).rows;}
          if(req.method==='DELETE')return (await tx.query('delete from public.messages'+clause+' returning *',params)).rows;
        }
        if(table==='user_resumes'){
          if(req.method==='POST'){const row=JSON.parse(body);return (await tx.query('insert into public.user_resumes(user_id,content) values ($1,$2) returning *',[row.user_id,JSON.stringify(row.content)])).rows;}
          if(req.method==='PATCH'){const row=JSON.parse(body);params.push(JSON.stringify(row.content),row.revision);return (await tx.query('update public.user_resumes set content=$'+(params.length-1)+'::jsonb,revision=$'+params.length+clause+' returning *',params)).rows;}
        }
        if(['practice_code','practice_stars','practice_attempts'].includes(table)){
          if(req.method==='DELETE')return (await tx.query('delete from public.'+table+clause+' returning *',params)).rows;
          if(req.method==='POST'){
            const row=JSON.parse(body);const allowed=table==='practice_stars'?['user_id','problem']:table==='practice_code'?['user_id','problem','code','updated_at']:['user_id','id','problem','code','mode','status','passed','total','error'];
            const keys=Object.keys(row);if(keys.some(k=>!allowed.includes(k)))throw Error('Unknown practice field');
            const conflicts=table==='practice_attempts'?['user_id','id']:['user_id','problem'];
            return (await tx.query('insert into public.'+table+'('+keys.join(',')+') values ('+keys.map((_,i)=>'$'+(i+1)).join(',')+') on conflict('+conflicts.join(',')+') do update set '+keys.map(k=>k+'=excluded.'+k).join(',')+' returning *',keys.map(k=>row[k]))).rows;
          }
        }
        if (req.method!=='GET' && req.method!=='HEAD') throw Error('Unsupported local request');
        if (table==='experience_items' && url.searchParams.get('select')?.includes('experience_bullets(')) {
          return (await tx.query('select i.*, coalesce((select jsonb_agg(b) from public.experience_bullets b where b.item_id=i.id),\'[]\'::jsonb) as experience_bullets from public.experience_items i'+clause+' order by sort',params)).rows;
        }
        return (await tx.query('select * from public.'+table+clause+(table==='content_changes'?' order by created_at desc':''),params)).rows;
      });
      if(req.method==='HEAD'){res.writeHead(200,{'Content-Range':`0-${Math.max(0,rows.length-1)}/${rows.length}`});return res.end();}
      const single=(req.headers.accept||'').includes('application/vnd.pgrst.object+json');
      send(res,200,single?(rows[0] || null):rows);
    } catch(error) { send(res,400,{code:error.code || 'XX000',message:error.message,details:null,hint:null}); }
  });
  server.listen(port,'127.0.0.1',()=>console.log(`Disposable preview API ready on 127.0.0.1:${port}`));
  for (const signal of ['SIGTERM','SIGINT']) process.on(signal,()=>server.close(()=>db.close().then(()=>process.exit())));
})().catch(error=>{ console.error(error.message);process.exitCode=1; });
