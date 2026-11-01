// @vitest-environment jsdom
import { beforeEach,afterEach,it,expect,vi } from 'vitest';
import { render,screen,fireEvent,cleanup,within } from '@testing-library/react';
const m=vi.hoisted(()=>({save:vi.fn()}));vi.mock('@/app/actions/behavioral',()=>({saveStory:vi.fn(),saveAnswer:m.save}));
import { Behavioral } from '@/components/behavioral/workspace';
import type { Story } from '@/lib/behavioral';
import { emptyAnswer } from '@/lib/behavioral/answers';
const story:Story={id:'00000000-0000-4000-8000-000000000001',bullet_id:null,title:'Example story',situation:'Context',task:'Goal',action:'Steps',result:'Outcome',skills:'Ownership',numbers:'Two improvements',updated_at:'now'};
beforeEach(()=>{m.save.mockReset();m.save.mockImplementation(async a=>({ok:true,answer:{...a,updated_at:'now'}}));});afterEach(cleanup);
function open(){fireEvent.click(screen.getByRole('tab',{name:'Questions'}));fireEvent.change(screen.getByLabelText('Theme'),{target:{value:'Conflict'}});}
it('owner mappings update coverage only on saved success; failures retain mappings and text',async()=>{
 m.save.mockRejectedValueOnce(new Error('offline'));
 render(<Behavioral items={[]} initialStories={[story]} canEdit />);open();
 fireEvent.click(screen.getByRole('button',{name:'Edit answer'}));
 fireEvent.change(screen.getByLabelText('Best story 1'),{target:{value:story.id}});fireEvent.change(screen.getByLabelText('Answer outline'),{target:{value:'Draft outline'}});fireEvent.change(screen.getByLabelText('Follow-ups'),{target:{value:'Draft follow-up'}});
 expect((screen.getByRole('tab',{name:'CV & stories'}) as HTMLButtonElement).disabled).toBe(true);
 expect((screen.getByLabelText('Question set') as HTMLSelectElement).disabled).toBe(true);
 fireEvent.click(screen.getByRole('button',{name:'Save answer'}));await screen.findByRole('button',{name:'Retry'});
 expect((screen.getByLabelText('Answer outline') as HTMLTextAreaElement).value).toBe('Draft outline');expect((screen.getByLabelText('Best story 1') as HTMLSelectElement).value).toBe(story.id);
 expect(screen.getByRole('button',{name:/Conflict: 0\//})).toBeTruthy();
 const first=m.save.mock.calls[0][0];fireEvent.click(screen.getByRole('button',{name:'Retry'}));await screen.findByRole('button',{name:'Edit answer'});
 expect(m.save.mock.calls[1][0]).toEqual(first);expect(screen.getByRole('button',{name:/Conflict: 1\//})).toBeTruthy();
 const article=screen.getByRole('article',{name:'Selected question'});expect(article.textContent).toContain('Draft follow-up');
 fireEvent.click(within(article).getByRole('button',{name:'Example story'}));expect(screen.getByRole('article',{name:'Selected STAR story'}).textContent).toContain('Outcome');
});
it('owner can clear mappings and Cancel discards further edits',async()=>{
 render(<Behavioral items={[]} initialStories={[story]} initialAnswers={[{...emptyAnswer('g-disagree'),primary_story_id:story.id,outline:'Saved',updated_at:'now'}]} canEdit />);open();
 fireEvent.click(screen.getByRole('button',{name:'Edit answer'}));fireEvent.change(screen.getByLabelText('Best story 1'),{target:{value:''}});fireEvent.click(screen.getByRole('button',{name:'Save answer'}));await screen.findByRole('button',{name:'Edit answer'});expect(screen.getByRole('button',{name:/Conflict: 0\//})).toBeTruthy();
 fireEvent.click(screen.getByRole('button',{name:'Edit answer'}));fireEvent.change(screen.getByLabelText('Answer outline'),{target:{value:'Discard this'}});fireEvent.click(screen.getByRole('button',{name:'Cancel'}));expect(screen.queryByText('Discard this')).toBeNull();expect(screen.getByText('Saved')).toBeTruthy();
});
it('invitees read saved answers and story mappings but never see editing controls',()=>{
 render(<Behavioral items={[]} initialStories={[story]} initialAnswers={[{...emptyAnswer('g-disagree'),primary_story_id:story.id,outline:'Read-only outline',followups:'Read-only follow-up',updated_at:'now'}]} />);open();
 expect(screen.getByText('Read-only outline')).toBeTruthy();expect(screen.getByText('Read-only follow-up')).toBeTruthy();expect(screen.getByRole('button',{name:/Conflict: 1\//})).toBeTruthy();expect(screen.queryByRole('button',{name:'Edit answer'})).toBeNull();expect(m.save).not.toHaveBeenCalled();
});
it('filters company sets, themes and search without affecting full coverage denominators',()=>{
 render(<Behavioral items={[]} initialStories={[]} />);fireEvent.click(screen.getByRole('tab',{name:'Questions'}));
 fireEvent.change(screen.getByLabelText('Question set'),{target:{value:'Palantir'}});
 const nav=screen.getByRole('navigation',{name:'Choose question'});expect(within(nav).getAllByRole('button')).toHaveLength(5);
 fireEvent.change(screen.getByLabelText('Search questions'),{target:{value:'no-such-prompt'}});expect(screen.getByText('No questions match these filters.')).toBeTruthy();expect(screen.getByRole('button',{name:/Conflict: 0\//})).toBeTruthy();
});
it('story drafts lock switching to the question bank',()=>{
 render(<Behavioral items={[]} initialStories={[]} canEdit />);fireEvent.click(screen.getByRole('button',{name:'Add story'}));expect((screen.getByRole('tab',{name:'Questions'}) as HTMLButtonElement).disabled).toBe(true);
});
