import type {Approach} from '../types';
export interface AuthoredContent {followUps:string[];reference:Pick<Approach,'title'|'explanation'|'time'|'space'>;alternative:Approach}
