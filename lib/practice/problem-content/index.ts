import {QUESTION_CONCEPTS} from './concepts';
import type {ArenaProblemSeed,ArenaProblem} from '../types';
import type {AuthoredContent} from './types';
import {content as c0} from './trees';
import {content as c1} from './backtracking';
import {content as c2} from './math-geometry';
import {content as c3} from './advanced-graphs';
import {content as c4} from './tries';
import {content as c5} from './graphs';
import {content as c6} from './dp-2d';
import {content as c7} from './dp-1d';
import {content as c8} from './stack';
import {content as c9} from './class-design';
import {content as c10} from './intervals';
import {content as c11} from './two-pointers';
import {content as c12} from './greedy';
import {content as c13} from './arrays-hashing';
import {content as c14} from './binary-search';
import {content as c15} from './linked-list';
import {content as c16} from './heap';
import {content as c17} from './sliding-window';
export const CURRICULUM:Record<number,AuthoredContent>=Object.assign({},c0,c1,c2,c3,c4,c5,c6,c7,c8,c9,c10,c11,c12,c13,c14,c15,c16,c17);
export function enrichProblem(problem:ArenaProblemSeed):ArenaProblem{
 const content=CURRICULUM[problem.lc];if(!content)throw Error(`Missing practice lesson for ${problem.lc}`);
 const tags=QUESTION_CONCEPTS[problem.lc];if(!tags)throw Error(`Missing concepts for ${problem.lc}`);
 return {...problem,...tags,followUps:content.followUps,approaches:[content.alternative,{...content.reference,id:'reference',code:problem.solution,optimal:!content.alternative.optimal}]};
}
