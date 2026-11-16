import type {Category} from './articles';
/** Public editorial taxonomy. Add slug assignments here as new series are introduced. */
export const SERIES = ['AI Engineering', 'Discover Tech', 'Career', 'Productivity & Tools', 'Building in Public', 'General'] as const;
export type ContentSeries = typeof SERIES[number];
const ARTICLE_SERIES: Readonly<Record<string, ContentSeries>> = {
  'stop-copy-pasting-into-claude': 'AI Engineering',
  '3-personal-ai-agents': 'Discover Tech',
};
const GUIDE_SERIES: Readonly<Record<string, ContentSeries>> = {mcp: 'AI Engineering'};
const CATEGORY_SERIES: Record<Category, ContentSeries> = {ai: 'AI Engineering', career: 'Career', productivity: 'Productivity & Tools', building: 'Building in Public'};
export function articleSeries(article: {slug: string; category: Category}): ContentSeries {
  return ARTICLE_SERIES[article.slug] ?? CATEGORY_SERIES[article.category];
}
export function guideSeries(guide: {slug: string}): ContentSeries {
  return GUIDE_SERIES[guide.slug] ?? 'General';
}
