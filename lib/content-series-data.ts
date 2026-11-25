import {z} from 'zod';
import {CATEGORY_LABEL,slugSchema,seriesPartSchema} from './articles';
/** Content series (H1): an ordered run of posts and guides on one topic. Labels for the topics live in articles.ts (CATEGORY_LABEL); lib/content-series.ts only maps the old editorial labels. */
export const SERIES_TOPICS=['ai','career','productivity','building'] as const;
export const MAX_PLANNED_PARTS=50;
export const seriesSchema=z.object({id:z.uuid(),slug:slugSchema,title:z.string().trim().min(1).max(80),goal:z.string().max(200),topic:z.enum(SERIES_TOPICS),planned_parts:seriesPartSchema,sort:z.number().int().min(-1000).max(1000),published:z.boolean()});
export type SeriesEdit=z.infer<typeof seriesSchema>;
export type SeriesRow=SeriesEdit&{draftChanged?:boolean;created_at:string;updated_at:string};
/** What the post and guide editors need to pick a series. */
export type SeriesOption=Pick<SeriesRow,'id'|'slug'|'title'>;
export const SERIES_SELECT='id,slug,title,goal,topic,planned_parts,sort,published,created_at,updated_at';
export const SERIES_OPTION_SELECT='id,slug,title';
export const seriesHref=(slug:string)=>`/content/series/${encodeURIComponent(slug)}`;
export const SERIES_TOPIC_LABEL=CATEGORY_LABEL;
export const emptySeries=():SeriesEdit=>({id:crypto.randomUUID(),slug:'',title:'',goal:'',topic:'ai',planned_parts:1,sort:100,published:false});
export type SeriesSave={ok:true;series:SeriesRow}|{ok:false;message:string};
