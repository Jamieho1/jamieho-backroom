import {notFound} from 'next/navigation';
import {SystemDesignPage} from '@/components/interview/sd-page';
import {getSdQuestion,getSdQuestions} from '@/lib/interview/system-design-data';
/** /interview/system-design/<slug>: the question page. Reserved list slugs never reach here. */
export async function systemDesignQuestionRoute(slug:string){
 const [question,questions]=await Promise.all([getSdQuestion(slug),getSdQuestions()]);
 if(!question)notFound();
 return <SystemDesignPage question={question} questions={questions}/>;
}
