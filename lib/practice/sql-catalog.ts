/** SQL 50 practice catalogue: only original, prewritten problems; separate from the DSA catalogue and its numbers. */
import {SqlCatalogueSchema,SQL_TOPICS,type SqlProblem,type SqlTopicId} from './sql-types';
import {sql as select} from './problems/sql-select';
import {sql as basicJoins} from './problems/sql-basic-joins';
import {sql as basicAggregate} from './problems/sql-basic-aggregate';
import {sql as sortingGrouping} from './problems/sql-sorting-grouping';
import {sql as advancedSelectJoins} from './problems/sql-advanced-select-joins';
import {sql as subqueries} from './problems/sql-subqueries';
import {sql as stringsRegexClause} from './problems/sql-strings-regex-clause';

/** Plan order: topics in SQL 50 order, then each topic file's own order. */
export const SQL_PROBLEMS:SqlProblem[]=SqlCatalogueSchema.parse([...select,...basicJoins,...basicAggregate,...sortingGrouping,...advancedSelectJoins,...subqueries,...stringsRegexClause]);
const byNumber=new Map(SQL_PROBLEMS.map(p=>[p.lc,p]));
export const sqlProblemByNumber=(lc:number)=>byNumber.get(lc);
export const isSqlProblem=(lc:number)=>byNumber.has(lc);

export interface SqlAnchor{lc:number;title:string;difficulty:SqlProblem['difficulty'];topic:SqlTopicId;/** Never set; lets list code read the DSA-only flag from either kind of entry. */extra?:boolean}
export const SQL_LIST:readonly SqlAnchor[]=SQL_PROBLEMS.map(p=>({lc:p.lc,title:p.title,difficulty:p.difficulty,topic:p.topic}));
export const sqlTopicLabel=(id:string)=>SQL_TOPICS.find(t=>t.id===id)?.label??'Questions';
export const sqlProblemHref=(lc:number|string)=>`/interview/sql/problems/${encodeURIComponent(String(lc))}`;
export const starterSql=(lc:number)=>sqlProblemByNumber(lc)?`-- One SELECT (or WITH ... SELECT) statement. Postgres dialect.\n\nSELECT\n`:'';

/** Previous/next follow topic order, then catalogue order inside each topic. */
export function sqlNavigation(lc:number){
 const current=SQL_LIST.find(p=>p.lc===lc);
 const questions=SQL_TOPICS.flatMap(t=>SQL_LIST.filter(p=>p.topic===t.id));
 const index=questions.findIndex(p=>p.lc===lc);
 return {current,questions,topics:SQL_TOPICS,topicLabel:sqlTopicLabel(current?.topic??''),previous:index>0?questions[index-1]:undefined,next:index>=0?questions[index+1]:undefined};
}
