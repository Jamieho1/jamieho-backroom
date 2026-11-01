/** Generic prompts only. Personal outlines, follow-ups and story mappings live in Supabase. */
export const THEMES=['Conflict','Failure','Leadership','Ambiguity','Ownership','Impact','Customer'] as const;
export type Theme=typeof THEMES[number];
export const SETS=['General','Palantir','Balyasny','JPMorgan'] as const;
export type QuestionSet=typeof SETS[number];
export interface Question {id:string;text:string;theme:Theme;set:QuestionSet}
const q=(id:string,text:string,theme:Theme,set:QuestionSet='General'):Question=>({id,text,theme,set});
export const QUESTIONS:Question[]=[
 q('g-intro','How would you introduce your experience and the work you want to do next?','Impact'),
 q('g-proud','Which project are you proudest of, and what did you contribute?','Impact'),
 q('g-disagree','Describe a disagreement with a colleague and how you resolved it.','Conflict'),
 q('g-fail','Describe a mistake you made and what changed afterward.','Failure'),
 q('g-ownership','When did you take responsibility beyond your assigned role?','Ownership'),
 q('g-incident','Describe an incident you helped resolve and the follow-through.','Ownership'),
 q('g-deadline','How did you choose what to deliver under a tight deadline?','Ambiguity'),
 q('g-ambiguous','Describe turning unclear requirements into a workable plan.','Ambiguity'),
 q('g-mentor','How have you helped someone develop their skills?','Leadership'),
 q('g-influence','Describe influencing a decision without formal authority.','Leadership'),
 q('g-learn','When did you need to learn something quickly to deliver a result?','Ambiguity'),
 q('g-feedback','Describe difficult feedback and how you acted on it.','Failure'),
 q('g-crossteam','How did you work with another team whose priorities differed?','Conflict'),
 q('g-incomplete','Describe deciding with incomplete evidence and managing the risk.','Ambiguity'),
 q('g-process','What process did you improve, and how did you measure the benefit?','Impact'),
 q('g-tradeoff','Describe a technical trade-off and the alternatives you considered.','Ambiguity'),
 q('g-pushback','When did you challenge a request and offer a better alternative?','Conflict'),
 q('g-customer','Describe going beyond the initial request to help a user.','Customer'),
 q('g-bug','What difficult bug did you investigate, and what was your approach?','Ownership'),
 q('g-pivot','Describe a change in your career direction and what you learned.','Ownership'),
 q('g-why-leave','What are you looking for in your next role?','Impact'),
 q('g-weakness','Which skill are you improving, and how do you track progress?','Failure'),
 q('p-why','Why does working at Palantir interest you?','Impact','Palantir'),
 q('p-deepdive','Walk through a project from problem to outcome and what you would change.','Ownership','Palantir'),
 q('p-domain','How did you learn an unfamiliar domain to solve a user problem?','Customer','Palantir'),
 q('p-userconflict','Describe reconciling a stakeholder request with your technical judgment.','Conflict','Palantir'),
 q('p-messy','How did you make progress with incomplete or inconsistent data?','Ambiguity','Palantir'),
 q('b-why','What interests you about Balyasny and working in an investment business?','Impact','Balyasny'),
 q('b-pressure','Describe delivering while priorities changed under pressure.','Ambiguity','Balyasny'),
 q('b-latency','How did you improve a system’s speed or reliability?','Impact','Balyasny'),
 q('b-users','Describe meeting the needs of demanding internal users.','Customer','Balyasny'),
 q('b-wrong','When did new evidence change your technical opinion?','Failure','Balyasny'),
 q('j-why','Why are you interested in JPMorgan and this team?','Impact','JPMorgan'),
 q('j-risk','Describe balancing delivery speed with safety and controls.','Ownership','JPMorgan'),
 q('j-explain','How did you explain a technical decision to a non-technical audience?','Customer','JPMorgan'),
 q('j-bigorg','Describe coordinating across a large organisation to get a result.','Leadership','JPMorgan'),
 q('j-current','How do you keep learning and apply new skills to your work?','Ownership','JPMorgan'),
];
export const questionById=(id:string)=>QUESTIONS.find(q=>q.id===id);
