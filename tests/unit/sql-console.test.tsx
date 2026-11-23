// @vitest-environment jsdom
import {it,expect,afterEach} from 'vitest';
import {render,screen,cleanup,within,fireEvent} from '@testing-library/react';
import {SqlConsole} from '@/components/practice/sql-console';
import {SqlProblemView,SqlSolutionView} from '@/components/practice/sql-problem';
import {sqlProblemByNumber} from '@/lib/practice/sql-catalog';
import {compareResults} from '@/lib/practice/sql-compare';
import type {SqlRunResult} from '@/lib/practice/sql-runner';
afterEach(cleanup);
const problem=sqlProblemByNumber(620)!;
function result(rows:any[][],ordered=true):SqlRunResult{
 const test=problem.tests[0];const comparison=compareResults(test.expected,{columns:test.expected.columns,rows},ordered);
 return {outcome:{status:'ok',passed:comparison.pass?1:0,total:1,stdout:'',results:[{id:test.name,visible:true,status:comparison.pass?'pass':'fail',error:comparison.summary}]},details:[{name:test.name,ordered,comparison}]};
}
it('shows expected vs your result with mismatched rows highlighted and NULL spelled out',()=>{
 const right=problem.tests[0].expected.rows as any[][];
 const {container}=render(<SqlConsole problem={problem} result={result([right[0],right[1],[9,'Extra','Drama',1]])} mode="run" busy={false} loading={false}/>);
 expect(screen.getByRole('heading',{name:/Run results · 0\/1 passed/})).toBeTruthy();
 const grids=container.querySelectorAll('.sql-diff figure');expect(grids).toHaveLength(2);
 expect(within(grids[0] as HTMLElement).getAllByRole('row').filter(r=>r.hasAttribute('data-mismatch'))).toHaveLength(1);
 expect(within(grids[1] as HTMLElement).getAllByRole('row').filter(r=>r.hasAttribute('data-mismatch'))).toHaveLength(1);
 expect(container.querySelector('.sql-null')?.textContent).toBe('NULL');
 expect(screen.getByRole('status').textContent).toMatch(/not the same|missing|unexpected/);
});
it('shows Accepted for a passing submit and the Postgres error text verbatim for a failing query',()=>{
 const right=problem.tests[0].expected.rows as any[][];
 const accepted=result(right);const {rerender}=render(<SqlConsole problem={problem} result={accepted} mode="submit" busy={false} loading={false}/>);
 expect(screen.getByRole('heading',{name:'Accepted 1/1'})).toBeTruthy();
 const failing:SqlRunResult={outcome:{status:'ok',passed:0,total:1,stdout:'',results:[{id:'sample',visible:true,status:'error',error:'column "nope" does not exist'}]},details:[{name:'sample',ordered:true,failure:{kind:'error',message:'column "nope" does not exist',code:'42703',position:'8'}}]};
 rerender(<SqlConsole problem={problem} result={failing} mode="run" busy={false} loading={false}/>);
 expect(screen.getByRole('heading',{name:'Runtime error'})).toBeTruthy();expect(screen.getByRole('alert').textContent).toBe('column "nope" does not exist');expect(screen.getByText(/SQLSTATE 42703 · position 8/)).toBeTruthy();
});
it('test data tab lists the cases with setup SQL and the expected grid',()=>{
 render(<SqlConsole problem={problem} result={null} mode="run" busy={false} loading={false}/>);
 expect(screen.getAllByRole('tab',{name:/Case \d/})).toHaveLength(problem.tests.length);expect(screen.getByText(/this exact order/)).toBeTruthy();
 fireEvent.click(screen.getByRole('tab',{name:'Case 2'}));expect(screen.getByRole('heading',{name:problem.tests[1].name})).toBeTruthy();
});
it('problem and solution views render statement, S1 table cards, examples, approaches and the MySQL note',()=>{
 const {container}=render(<><SqlProblemView problem={problem}/><SqlSolutionView problem={problem}/></>);
 expect(container.querySelector('[data-table-schema="film_catalog"]')).toBeTruthy();expect(screen.getAllByText('PK')).toHaveLength(1);
 expect(container.querySelectorAll('.sql-example')).toHaveLength(problem.examples.length);
 expect(screen.getAllByText('Optimal approach')).toHaveLength(1);expect(screen.getByRole('heading',{name:'On MySQL'})).toBeTruthy();expect(container.querySelector('pre[data-lang="sql"]')).toBeTruthy();
});
