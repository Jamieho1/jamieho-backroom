import {expect,it} from 'vitest';
import {articleSeries,guideSeries} from '@/lib/content-series';
it('shares named editorial series across articles and guides, with neutral unknown guide fallback',()=>{
 expect(articleSeries({slug:'stop-copy-pasting-into-claude',category:'ai'})).toBe('AI Engineering');
 expect(articleSeries({slug:'3-personal-ai-agents',category:'ai'})).toBe('Discover Tech');
 expect(guideSeries({slug:'mcp'})).toBe('AI Engineering');
 expect(guideSeries({slug:'unknown'})).toBe('General');
 expect(articleSeries({slug:'new',category:'career'})).toBe('Career');
});
