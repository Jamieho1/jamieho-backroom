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
      res.setHeader('Access-Control-Allow-Headers','authorization, apikey, x-client-info, content-type, prefer, range, x-supabase-api-version');
      res.setHeader('Access-Control-Allow-Methods','GET,HEAD,PATCH,POST,OPTIONS');
      res.setHeader('Access-Control-Expose-Headers','Content-Range');
    }
    if(req.method==='OPTIONS'){res.writeHead(204);return res.end();}
    let body=''; for await (const chunk of req) body+=chunk;
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    try {
      if (url.pathname === '/__session') {
        const session = sessions[url.searchParams.get('role') || 'owner'];
        if (!session) return send(res,400,{});
        return send(res,200,{ cookie: {name:'sb-127-auth-token',value:'base64-'+Buffer.from(JSON.stringify(session)).toString('base64url')} });
      }
      if (url.pathname === '/__seed' && req.method === 'POST') {
        const proposal=JSON.parse(body); const r=await db.query('insert into public.content_changes(summary,operations) values ($1,$2) returning id',[proposal.summary,JSON.stringify(proposal.operations)]);
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
      if (url.pathname === '/__state') return send(res,200,{ projects:(await db.query('select * from public.projects')).rows,articles:(await db.query('select * from public.articles')).rows,guides:(await db.query('select * from public.guides')).rows,sections:(await db.query('select key,title,body from public.site_sections')).rows, sets:(await db.query('select id,status,previous,approved_by from public.content_changes')).rows, items:(await db.query('select * from public.experience_items')).rows, bullets:(await db.query('select * from public.experience_bullets')).rows });
      const session=Object.values(sessions).find(s=>req.headers.authorization==='Bearer '+s.access_token);
      if (url.pathname === '/auth/v1/user') return session ? send(res,200,session.user) : send(res,401,{message:'No local session'});
      if (!url.pathname.startsWith('/rest/v1/')) return send(res,404,{});
      const table=url.pathname.slice('/rest/v1/'.length);
      if (!['content_changes','site_sections','profiles','experience_items','experience_bullets','desktop_apps','projects','articles','guides'].includes(table)) return send(res,200,[]);
      const rows=await db.transaction(async tx=>{
        await tx.query("select set_config('request.jwt.claims',$1,true)",[JSON.stringify({sub:session?.user.id || '',role:session?'authenticated':'anon'})]);
        await tx.exec('set local role '+(session?'authenticated':'anon'));
        if (table==='profiles') return (await tx.query('select * from public.profiles where id=$1',[session?.user.id || users.member.id])).rows;
        const where=[],params=[];
        for (const col of (table==='content_changes'?['id','status','operations']:table==='site_sections'?['key']:table==='projects'?['id','slug','public']:['articles','guides'].includes(table)?['id','slug','published']:['id'])) {
          const value=url.searchParams.get(col);
          if (value?.startsWith('eq.')) { params.push(value.slice(3));where.push(col+'=$'+params.length+(col==='operations'?'::jsonb':'')); }
        }
        const clause=where.length?' where '+where.join(' and '):'';
        if (req.method==='PATCH' && table==='content_changes') {
          const patch=JSON.parse(body); if (Object.keys(patch).join(',')!=='status') throw Error('Test adapter accepts status changes only');
          params.push(patch.status);return (await tx.query('update public.content_changes set status=$'+params.length+clause+' returning *',params)).rows;
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
