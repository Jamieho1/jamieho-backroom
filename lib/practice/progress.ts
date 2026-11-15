import {validProblem} from './data';
export function completedProblems(rows:readonly {problem:number;mode:string;status:string;passed:number;total:number}[]):number[]{
 return [...new Set(rows.filter(r=>validProblem(r.problem)&&r.mode==='submit'&&r.status==='ok'&&r.total>0&&r.passed===r.total).map(r=>r.problem))];
}
