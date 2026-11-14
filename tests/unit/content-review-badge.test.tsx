// @vitest-environment jsdom
import {render,cleanup,waitFor,act} from '@testing-library/react';
import {afterEach,beforeEach,it,expect,vi} from 'vitest';
const m=vi.hoisted(()=>({viewer:{status:'owner',id:'owner'},count:vi.fn(),pathname:'/'}));
vi.mock('@/components/viewer-provider',()=>({useViewer:()=>({viewer:m.viewer})}));
vi.mock('next/navigation',()=>({usePathname:()=>m.pathname}));
vi.mock('next/link',()=>({default:({prefetch,children,...props}:React.AnchorHTMLAttributes<HTMLAnchorElement>&{prefetch?:boolean})=><a {...props}>{children}</a>}));
vi.mock('@/app/actions/content-draft-count',()=>({getContentDraftCount:m.count}));
import {ContentReviewBadge} from '@/components/content-drafts/review-badge';
beforeEach(()=>{vi.resetAllMocks();m.viewer={status:'owner',id:'owner'};m.pathname='/';m.count.mockResolvedValue(2);vi.spyOn(document,'visibilityState','get').mockReturnValue('visible');});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('owner sees the linked count; zero and failed counts render nothing',async()=>{
 const view=render(<ContentReviewBadge/>);const badge=await view.findByRole('link',{name:'2 to review'});expect(badge.getAttribute('href')).toBe('/manage/review');
 m.count.mockResolvedValueOnce(0);await act(async()=>{window.dispatchEvent(new Event('content-drafts-changed'))});await waitFor(()=>expect(view.queryByRole('link')).toBeNull());
 m.count.mockResolvedValueOnce(null);await act(async()=>{window.dispatchEvent(new Event('focus'))});expect(view.queryByRole('link')).toBeNull();
});
it('visitors/members/loading sessions do not query or render a badge',()=>{
 for(const status of ['anonymous','member','loading']){m.viewer={status,id:'other'};const view=render(<ContentReviewBadge/>);expect(view.queryByRole('link')).toBeNull();view.unmount();}expect(m.count).not.toHaveBeenCalled();
});
it('account changes immediately hide old counts and ignore late replies',async()=>{
 let resolve!:(n:number)=>void;m.count.mockImplementationOnce(()=>new Promise(r=>{resolve=r}));const view=render(<ContentReviewBadge/>);
 m.viewer={status:'member',id:'member'};view.rerender(<ContentReviewBadge/>);await act(async()=>resolve(2));expect(view.queryByRole('link')).toBeNull();
 m.viewer={status:'owner',id:'owner2'};view.rerender(<ContentReviewBadge/>);await view.findByRole('link',{name:'2 to review'});
 m.viewer={status:'anonymous',id:''};view.rerender(<ContentReviewBadge/>);expect(view.queryByRole('link')).toBeNull();
});
it('navigation and focus refresh the owner count',async()=>{
 const view=render(<ContentReviewBadge/>);await view.findByRole('link',{name:'2 to review'});
 m.count.mockResolvedValueOnce(3);m.pathname='/articles';view.rerender(<ContentReviewBadge/>);await view.findByRole('link',{name:'3 to review'});
 m.count.mockResolvedValueOnce(1);await act(async()=>{window.dispatchEvent(new Event('focus'))});await view.findByRole('link',{name:'1 to review'});
});
