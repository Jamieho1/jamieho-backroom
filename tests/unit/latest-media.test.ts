import { describe, expect, it } from "vitest";
import { pickLatest, type LatestItem } from "@/lib/articles-public";

const row = (slug: string, platform: LatestItem["platform"], source_url = "https://x/" + slug): LatestItem =>
  ({ slug, title: slug, platform, source_url, cover_url: "", created_at: "" });

describe("latest media for the Creator section (TKT-89)", () => {
  it("picks the newest YouTube, the newest Instagram and the newest remaining article", () => {
    const rows = [row("ig2", "instagram"), row("note", "other", ""), row("xhs", "xiaohongshu"), row("yt2", "youtube"), row("ig1", "instagram"), row("yt1", "youtube")];
    const got = pickLatest(rows);
    expect([got.video?.slug, got.instagram?.slug, got.rednote?.slug, got.article?.slug]).toEqual(["yt2", "ig2", "xhs", "note"]);
  });
  it("ignores posts without a link for video/Instagram and copes with nothing", () => {
    expect(pickLatest([row("yt", "youtube", "")]).video).toBeNull();
    expect(pickLatest([])).toEqual({ video: null, instagram: null, rednote: null, article: null });
  });
});
