import {it,expect} from 'vitest';
import {practiceNavigation} from '@/lib/interview/practice-navigation';
import {sectionTopics,sectionQuestions} from '@/lib/interview/content';
import type {Anchor} from '@/lib/notes/neetcode150';
it('orders every section question by its topic list then its catalogue order, crossing topic boundaries',()=>{
 const expected=sectionTopics('dsa').flatMap(t=>sectionQuestions('dsa',t.id));
 expect(practiceNavigation(217).questions).toEqual(expected);
 for(let i=0;i<expected.length;i++){const n=practiceNavigation(expected[i].lc);expect(n.previous?.lc).toBe(expected[i-1]?.lc);expect(n.next?.lc).toBe(expected[i+1]?.lc);}
 expect(practiceNavigation(128).next?.lc).toBe(125);
 expect(practiceNavigation(125).previous?.lc).toBe(128);
});
it('labels the topic rather than section, and never crosses DSA/LLD boundaries',()=>{
 expect(practiceNavigation(3).topicLabel).toBe('Sliding Window');
 const rows:Anchor[]=[{lc:1,title:'DSA fixture',topic:'arrays-hashing',difficulty:'Easy'},{lc:2,title:'Cache fixture',topic:'class-design',difficulty:'Medium'},{lc:3,title:'Class fixture',topic:'class-design',difficulty:'Hard'}];
 expect(practiceNavigation(2,rows)).toMatchObject({section:'low-level-design',topicLabel:'Low Level Design',previous:undefined,next:rows[2]});
 expect(practiceNavigation(1,rows).next).toBeUndefined();expect(practiceNavigation(-1,rows).next).toBeUndefined();
});
