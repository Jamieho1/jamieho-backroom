/**
 * A Supabase-shaped Postgres for RLS tests (TKT-52): PGlite (real Postgres, in-process) plus the bits of
 * Supabase the migrations rely on: the anon / authenticated roles with Supabase's default broad grants,
 * an auth schema with auth.users, and auth.uid() / auth.jwt() read from request.jwt.claims.
 * Then every file in supabase/migrations is applied in order, exactly as written.
 */
import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const BOOTSTRAP = `
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;

create schema auth;
grant usage on schema auth to anon, authenticated, service_role;
create table auth.users (
  id uuid primary key,
  email text,
  email_confirmed_at timestamptz,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);
create function auth.jwt() returns jsonb language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;
create function auth.uid() returns uuid language sql stable as $$
  select nullif(auth.jwt() ->> 'sub', '')::uuid
$$;
grant execute on function auth.jwt(), auth.uid() to anon, authenticated, service_role;
`;

export const MIGRATIONS_DIR = join(__dirname, "..", "..", "supabase", "migrations");

export async function freshDb(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(BOOTSTRAP);
  for (const f of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(join(MIGRATIONS_DIR, f), "utf8"));
  }
  return db;
}

export interface Who {
  role: "anon" | "authenticated";
  sub?: string;
  email?: string;
}

/** Run `fn` as an API caller: SET ROLE plus JWT claims, inside a transaction that is always rolled back. */
export async function as<T>(db: PGlite, who: Who, fn: (q: <R = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<R[]>) => Promise<T>): Promise<T> {
  await db.exec("begin");
  try {
    const claims = JSON.stringify({ role: who.role, sub: who.sub ?? "", email: who.email ?? "" });
    await db.query("select set_config('request.jwt.claims', $1, true)", [claims]);
    await db.exec(`set local role ${who.role}`);
    return await fn(async (sql, params) => (await db.query(sql, params)).rows as never);
  } finally {
    await db.exec("rollback");
  }
}

/** Admin-side setup (what Supabase Auth / the service role would do). */
export async function addUser(db: PGlite, u: { id: string; email: string; confirmed?: boolean; name?: string }) {
  await db.query("insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values ($1, $2, $3, $4)", [
    u.id,
    u.email,
    u.confirmed === false ? null : new Date().toISOString(),
    JSON.stringify({ full_name: u.name ?? u.email.split("@")[0] }),
  ]);
}
