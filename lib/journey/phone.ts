/** Phones use artwork instead of video. Contact follows the journey in natural flow. */
import type {Chapter} from "./timeline";
export const PHONE_QUERY="(max-width: 768px)";
export const PHONE_STILLS:Readonly<Record<string,"wallpaper"|string>>={c1:"wallpaper"};
export const phoneChapters=(chapters:Chapter[]):Chapter[]=>chapters;
