/**
 * SQL practice problems (ticket Q1). The list follows LeetCode's public "SQL 50" plan (numbers and titles only);
 * every statement, table, sample row, test, solution and explanation is written in our own words with our own data.
 * Answers run on Postgres in the browser (PGlite); nothing is sent to a server or a model.
 */
import {z} from 'zod';
import {guardQuery} from './sql-guard';

/** The seven SQL 50 topics in plan order. Ids are prefixed so they never collide with DSA or note ids. */
export const SQL_TOPICS=[
 {id:'sql-select',label:'Select'},
 {id:'sql-basic-joins',label:'Basic Joins'},
 {id:'sql-basic-aggregate',label:'Basic Aggregate Functions'},
 {id:'sql-sorting-grouping',label:'Sorting and Grouping'},
 {id:'sql-advanced-select-joins',label:'Advanced Select and Joins'},
 {id:'sql-subqueries',label:'Subqueries'},
 {id:'sql-strings-regex-clause',label:'Advanced String Functions / Regex / Clause'},
] as const;
export type SqlTopicId=(typeof SQL_TOPICS)[number]['id'];
const topicIds=SQL_TOPICS.map(t=>t.id) as [SqlTopicId,...SqlTopicId[]];

const text=(max:number)=>z.string().refine(s=>!s.includes('\0')&&Array.from(s).length<=max,`Text must be at most ${max} characters.`);
const required=(max:number)=>text(max).refine(s=>!!s.trim(),'Text cannot be blank.');
const identifier=z.string().regex(/^[a-z_][a-z0-9_]{0,40}$/,'Use lower-case snake_case names.');

/** A value in a result grid or sample row. Dates are ISO strings; NULL is null. */
export const SqlCellSchema=z.union([z.string().max(2000),z.number().finite(),z.boolean(),z.null()]);
export type SqlCell=z.infer<typeof SqlCellSchema>;

const row=z.array(SqlCellSchema).max(20);
export const SqlGridSchema=z.object({columns:z.array(identifier).min(1).max(20),rows:z.array(row).max(200)}).strict()
 .superRefine((g,ctx)=>{
  if(new Set(g.columns).size!==g.columns.length)ctx.addIssue({code:'custom',message:'Result column names must be unique.'});
  g.rows.forEach((r,i)=>{if(r.length!==g.columns.length)ctx.addIssue({code:'custom',message:`Row ${i+1} has ${r.length} values for ${g.columns.length} columns.`});});
 });
export type SqlGrid=z.infer<typeof SqlGridSchema>;

/** Same shape as the system-design table-schema card, with `name` instead of `table`. */
export const SqlTableSchema=z.object({
 name:identifier,note:text(200).optional(),
 columns:z.array(z.object({name:identifier,type:required(40),pk:z.boolean().optional(),note:text(120).optional()}).strict()).min(1).max(30),
}).strict().refine(t=>new Set(t.columns.map(c=>c.name)).size===t.columns.length,{message:'Table column names must be unique.'});
export type SqlTable=z.infer<typeof SqlTableSchema>;

export const SqlExampleSchema=z.object({
 tables:z.array(SqlGridSchema.safeExtend({name:identifier})).min(1).max(4),
 result:SqlGridSchema,
 explanation:text(1500).optional(),
}).strict();
export type SqlExample=z.infer<typeof SqlExampleSchema>;

export const SqlTestSchema=z.object({
 name:required(60),
 /** CREATE TABLE + INSERT statements, run on a fresh schema before the learner's query. */
 setup:required(20000),
 expected:SqlGridSchema,
 /** True only when the question asks for an order; otherwise rows are compared as a multiset. */
 ordered:z.boolean(),
}).strict();
export type SqlTest=z.infer<typeof SqlTestSchema>;

export const SqlApproachSchema=z.object({id:z.string().regex(/^[a-z][a-z0-9-]*$/),title:required(160),explanation:required(3000).refine(s=>s.length>=20,'Explain the approach and why.'),code:required(20000),optimal:z.boolean()}).strict();

const singleQuery=(sql:string)=>guardQuery(sql).ok;
export const SqlProblemSchema=z.object({
 kind:z.literal('sql'),
 lc:z.number().int().positive(),
 topic:z.enum(topicIds),
 title:required(120),
 difficulty:z.enum(['Easy','Medium','Hard']),
 /** Statement in our own words (Markdown). */
 statement:required(6000).refine(s=>s.length>=60,'Describe the task fully.'),
 tables:z.array(SqlTableSchema).min(1).max(5),
 examples:z.array(SqlExampleSchema).min(1).max(3),
 tests:z.array(SqlTestSchema).min(1).max(12),
 /** Reference solution in Postgres; every test passes against it. */
 solution:required(20000).refine(singleQuery,'The solution must be one SELECT or WITH statement.'),
 approaches:z.array(SqlApproachSchema).min(2).max(6),
 hints:z.array(required(600)).max(6),
 clarify:z.array(z.object({question:required(300),answer:required(600)}).strict()).max(6),
 followUps:z.array(required(400).refine(s=>s.length>=15)).min(1).max(2),
 /** How the MySQL version of this question differs, when it does. */
 mysqlNote:text(1500).optional(),
}).strict().superRefine((p,ctx)=>{
 if(p.approaches.filter(a=>a.optimal).length!==1)ctx.addIssue({code:'custom',message:'Mark exactly one optimal approach.'});
 if(new Set(p.approaches.map(a=>a.id)).size!==p.approaches.length)ctx.addIssue({code:'custom',message:'Approach IDs must be unique.'});
 p.approaches.forEach((a,i)=>{if(!singleQuery(a.code))ctx.addIssue({code:'custom',message:`Approach ${i+1} must be one SELECT or WITH statement.`});});
 if(new Set(p.tests.map(t=>t.name)).size!==p.tests.length)ctx.addIssue({code:'custom',message:'Test names must be unique.'});
});
export type SqlProblem=z.infer<typeof SqlProblemSchema>;
export type SqlProblemSeed=z.input<typeof SqlProblemSchema>;

export const SqlCatalogueSchema=z.array(SqlProblemSchema).superRefine((list,ctx)=>{
 if(new Set(list.map(p=>p.lc)).size!==list.length)ctx.addIssue({code:'custom',message:'SQL question numbers must be unique.'});
});
