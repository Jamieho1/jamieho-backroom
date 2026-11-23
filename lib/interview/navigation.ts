import {TOPICS} from '@/lib/notes/topics';
import {sectionTopics} from './content';
import {PRACTICE_LIST} from '@/lib/practice/catalog';
export const INTERVIEW_SECTIONS=[
 {id:'dashboard',label:'Dashboard',href:'/interview',group:null,color:TOPICS[0].dot},
 {id:'dsa',label:'Data Structures & Algorithms',href:'/interview/dsa/practice',group:'Interview Skills',color:TOPICS[0].dot},
 {id:'system-design',label:'System Design',href:'/interview/system-design/practice',group:'Interview Skills',color:TOPICS[12].dot},
 {id:'low-level-design',label:'Low Level Design',href:'/interview/low-level-design/practice',group:'Interview Skills',color:TOPICS[17].dot},
 {id:'fundamental',label:'Fundamental',href:'/interview/fundamental',group:'Interview Skills',color:'#38BDF8'},
 {id:'sql',label:'SQL',href:'/interview/sql/practice',group:'Interview Skills',color:'#2DD4BF'},
 {id:'full-stack',label:'Full-Stack',href:'/interview/full-stack',group:'Role',color:'#34D399'},
 {id:'finance',label:'Finance Engineering',href:'/interview/finance/practice',group:'Role',color:TOPICS[9].dot},
 {id:'ai-engineering',label:'AI Engineering',href:'/interview/ai-engineering/practice',group:'Role',color:TOPICS[7].dot},
 {id:'forward-deploy-engineer',label:'FDE',href:'/interview/forward-deploy-engineer',group:'Role',color:'#22D3EE'},
 {id:'data-scientist',label:'Data Science',href:'/interview/data-scientist',group:'Role',color:'#A78BFA'},
 {id:'machine-learning',label:'Machine Learning',href:'/interview/machine-learning',group:'Role',color:'#F472B6'},
 {id:'resume',label:'Resume',href:'/interview/resume',group:'Career',color:TOPICS[1].dot},
 {id:'behavioral',label:'Behavioral',href:'/interview/behavioral',group:'Career',color:TOPICS[2].dot},
 {id:'project',label:'Project',href:'/interview/project',group:'Career',color:'#FB923C'},
 {id:'mock-interview',label:'Mock Interview',href:'/interview/mock-interview',group:'Tools',color:'#F3CD7E'},
 {id:'companies',label:'Companies',href:'/interview/companies',group:'Tools',color:TOPICS[6].dot},
 {id:'roadmaps',label:'Roadmaps',href:'/interview/roadmaps',group:'Tools',color:TOPICS[8].dot},
 {id:'applications',label:'Application Tracker',href:'/interview/applications',group:'Tools',color:TOPICS[10].dot},
] as const;
export type InterviewSection=(typeof INTERVIEW_SECTIONS)[number];
export const interviewSection=(path:string)=>path.startsWith('/interview/problems/')?INTERVIEW_SECTIONS.find(s=>s.id===(PRACTICE_LIST.find(p=>p.lc===Number(path.split('/').at(-1)))?.topic==='class-design'?'low-level-design':'dsa'))!:INTERVIEW_SECTIONS.find(s=>s.id!=='dashboard'&&(path===`/interview/${s.id}`||path.startsWith(`/interview/${s.id}/`)))??INTERVIEW_SECTIONS[0];
export const interviewTopics=sectionTopics;
export const PRACTICE_SECTIONS=['dsa','system-design','low-level-design','finance','ai-engineering','sql'] as const;
