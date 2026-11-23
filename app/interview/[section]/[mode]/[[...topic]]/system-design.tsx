import {notFound} from 'next/navigation';
import {SystemDesignPage} from '@/components/interview/sd-page';
import {SystemDesignWhiteboard} from '@/components/interview/sd-whiteboard';
import {getSdQuestion,getSdQuestions} from '@/lib/interview/system-design-data';
/** /interview/system-design/<slug>: the question page. Reserved list slugs never reach here. */
export async function systemDesignQuestionRoute(slug:string){
 const [question,questions]=await Promise.all([getSdQuestion(slug),getSdQuestions()]);
 if(!question)notFound();
 return <SystemDesignPage question={question} questions={questions}/>;
}
/** /interview/system-design/<slug>/whiteboard: the full-height whiteboard workspace. */
export async function systemDesignWhiteboardRoute(slug:string){
 const question=await getSdQuestion(slug);
 if(!question)notFound();
 return <SystemDesignWhiteboard question={{id:question.id,slug:question.slug,title:question.title,solution:question.solution}}/>;
}
