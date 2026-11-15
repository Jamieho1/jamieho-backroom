import {TOPICS} from '@/lib/notes/topics';
import {sectionTopics} from './content';
import {PRACTICE_LIST} from '@/lib/practice/catalog';
export const INTERVIEW_SECTIONS=[
 {id:'dashboard',label:'Dashboard',href:'/interview',group:null,color:TOPICS[0].dot},
 {id:'dsa',label:'Data Structures & Algorithms',href:'/interview/dsa/practice',group:'Interview Skills',color:TOPICS[0].dot},
 {id:'system-design',label:'System Design',href:'/interview/system-design/practice',group:'Interview Skills',color:TOPICS[12].dot},
 {id:'low-level-design',label:'Low Level Design',href:'/interview/low-level-design/practice',group:'Interview Skills',color:TOPICS[17].dot},
 {id:'finance',label:'Finance',href:'/interview/finance/practice',group:'Interview Skills',color:TOPICS[9].dot},
 {id:'ai-engineering',label:'AI Engineering',href:'/interview/ai-engineering/practice',group:'Interview Skills',color:TOPICS[7].dot},
 {id:'forward-deploy-engineer',label:'Forward Deploy Engineer',href:'/interview/forward-deploy-engineer',group:'Interview Skills',color:'#22D3EE'},
 {id:'data-scientist',label:'Data Scientist',href:'/interview/data-scientist',group:'Interview Skills',color:'#A78BFA'},
 {id:'resume',label:'Resume',href:'/interview/resume',group:'Career',color:TOPICS[1].dot},
 {id:'behavioral',label:'Behavioral',href:'/interview/behavioral',group:'Career',color:TOPICS[2].dot},
 {id:'mock-interview',label:'Mock Interview',href:'/interview/mock-interview',group:'Tools',color:'#F3CD7E'},
 {id:'companies',label:'Companies',href:'/interview/companies',group:'Tools',color:TOPICS[6].dot},
 {id:'roadmaps',label:'Roadmaps',href:'/interview/roadmaps',group:'Tools',color:TOPICS[8].dot},
 {id:'applications',label:'Application Tracker',href:'/interview/applications',group:'Tools',color:TOPICS[10].dot},
] as const;
export type InterviewSection=(typeof INTERVIEW_SECTIONS)[number];
export const interviewSection=(path:string)=>path.startsWith('/interview/problems/')?INTERVIEW_SECTIONS.find(s=>s.id===(PRACTICE_LIST.find(p=>p.lc===Number(path.split('/').at(-1)))?.topic==='class-design'?'low-level-design':'dsa'))!:INTERVIEW_SECTIONS.find(s=>s.id!=='dashboard'&&(path===`/interview/${s.id}`||path.startsWith(`/interview/${s.id}/`)))??INTERVIEW_SECTIONS[0];
export const interviewTopics=sectionTopics;
export const PRACTICE_SECTIONS=['dsa','system-design','low-level-design','finance','ai-engineering'] as const;
