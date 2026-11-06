import { describe, expect, it } from "vitest";
import { HOME_CHAPTERS } from "@/lib/journey/chapters";
import { CONTACT_HREF, DESKTOP_HREF, excerpt, spread, withContent } from "@/lib/journey/content";
import { FALLBACK_SECTIONS } from "@/lib/sections";
import type { Item } from "@/lib/experience";

const item = (over: Partial<Item>): Item => ({ kind: "role", title: "T", org: "O", dates: "2024", location: "", summary: "S", public: true, bullets: [], ...over });
const sections = {
  ...FALLBACK_SECTIONS,
  hero: { key: "hero" as const, title: "Test Name", body: "First line.\n\nSecond paragraph." },
  about: { key: "about" as const, title: "About", body: "About text." },
  interests: { key: "interests" as const, title: "Interests", body: "" },
  technology: { key: "technology" as const, title: "Technology", body: "" },
};
const panelsOf = (chapters: ReturnType<typeof withContent>, id: string) => chapters.find((c) => c.id === id)?.panels ?? [];

describe("journey content (TKT-77)", () => {
  it("separates the hero role from its description and reuses Creator social destinations", () => {
    const custom = { ...sections,
      hero: { key: "hero" as const, title: "Test Name", body: "Engineering role.\n\nA concise description." },
      contact: { key: "contact" as const, title: "Contact", body: "[YouTube](https://youtube.com/@test) [Instagram](https://instagram.com/test)" },
    };
    const hero = panelsOf(withContent(HOME_CHAPTERS, { sections: custom, experience: [], technologies: [] }), "sky")[0];
    expect(hero.meta).toBe("Engineering role.");
    expect(hero.body).toBe("A concise description.");
    expect(hero.actions?.map(a => a.platform)).toEqual(["youtube", "instagram"]);
    expect(hero.cta).toBeUndefined();
  });

  it("keeps panels short", () => {
    expect(excerpt("One.\n\nTwo.")).toBe("One.");
    const long = excerpt("word ".repeat(200), 50);
    expect(long.length).toBeLessThanOrEqual(51);
    expect(long.endsWith("…")).toBe(true);
  });

  it("spreads milestones evenly without overlap", () => {
    const w = spread(3, 0, 0.6);
    expect(w).toHaveLength(3);
    expect(w[0].from).toBe(0);
    expect(w[2].to).toBeCloseTo(0.6);
    for (let i = 1; i < w.length; i++) expect(w[i].from).toBeGreaterThan(w[i - 1].to);
    expect(spread(0, 0, 1)).toEqual([]);
  });

  it("maps the hero and the pivot (About statement + education line)", () => {
    const experience = [
      item({ kind: "education", title: "MEng Biomedical Engineering", org: "Imperial College London", dates: "2016–2020" }),
      item({ title: "Engineer", org: "B" }),
    ];
    const pivotSections = { ...sections, about: { key: "about" as const, title: "From labs to production", body: "First para.\n\nSecond." } };
    const out = withContent(HOME_CHAPTERS, { sections: pivotSections, experience, technologies: [] });
    expect(panelsOf(out, "sky")[0]).toMatchObject({ title: "Test Name", body: "Second paragraph.", meta: "First line.", md: true, cta: undefined });
    expect(panelsOf(out, "pivot")[0]).toMatchObject({
      title: "From labs to production", body: "First para.", md: true, look: "statement",
      meta: "MEng Biomedical Engineering · Imperial College London · 2016–2020",
    });
  });

  it("keeps the pivot without an education line, and drops it when About is empty", () => {
    const withAbout = withContent(HOME_CHAPTERS, { sections, experience: [], technologies: [] });
    expect(panelsOf(withAbout, "pivot")[0]).toMatchObject({ title: "About", body: "About text.", meta: undefined });
    const empty = { ...sections, about: { key: "about" as const, title: "", body: "" } };
    const skipped = withContent(HOME_CHAPTERS, { sections: empty, experience: [], technologies: [] });
    expect(skipped.some((c) => c.id === "pivot")).toBe(false); // the whole section is skipped, not left blank
  });

  it("puts the latest posts and Subscribe/Follow in Creator, and leaves the desk with Now + the contact line", () => {
    const latest = {
      video: { slug: "v", title: "My video", platform: "youtube" as const, source_url: "https://youtube.com/watch?v=x", cover_url: "https://img/v.jpg", created_at: "" },
      instagram: { slug: "ig", title: "My reel", platform: "instagram" as const, source_url: "https://instagram.com/p/1", cover_url: "", created_at: "" },
      article: { slug: "a-post", title: "My post", platform: "other" as const, source_url: "", cover_url: "", created_at: "" },
    };
    const full = { ...sections, now: { key: "now" as const, title: "Now", body: "Building things." },
      writing: { key: "writing" as const, title: "I teach production AI", body: "Ten-minute builds.\n\nMore." },
      contact: { key: "contact" as const, title: "Contact", body: "[YT](https://www.youtube.com/@me) [IG](https://instagram.com/me)" } };
    const out = withContent(HOME_CHAPTERS, { sections: full, experience: [], technologies: [], latest });
    const creator = panelsOf(out, "creator");
    expect(creator.map((p) => p.id)).toEqual(["pitch", "latest"]);
    expect(creator[0]).toMatchObject({ title: "I teach production AI", body: "Ten-minute builds.", look: "statement" });
    expect(creator[0].actions).toEqual([
      { label: "YouTube", href: "https://www.youtube.com/@me", platform: "youtube" }, { label: "Instagram", href: "https://instagram.com/me", platform: "instagram" },
    ]);
    expect(creator[1].links).toEqual([
      { platform: "youtube", kicker: "Latest video", title: "My video", href: "https://youtube.com/watch?v=x", image: "https://img/v.jpg", external: true },
      { platform: "instagram", kicker: "Instagram", title: "My reel", href: "https://instagram.com/p/1", image: undefined, external: true },
      { platform: "article", kicker: "Latest article", title: "My post", href: "/articles/a-post", image: undefined },
    ]);
    // No post yet → a card that points at the profile (here YouTube from the Contact links), never an empty slot.
    const noVideo = withContent(HOME_CHAPTERS, { sections: full, experience: [], technologies: [], latest: { ...latest, video: null } });
    expect(panelsOf(noVideo, "creator")[1].links?.[0]).toMatchObject({ platform: "youtube", placeholder: true, href: "https://www.youtube.com/@me" });
    const room = panelsOf(out, "room");
    expect(room.map((p) => p.id)).toEqual(["now", "contact"]);
    expect(room[0]).toMatchObject({ title: "Now", body: "Building things." });
    expect(room[1].links).toBeUndefined();
    expect(room[1].foot?.map((f) => f.label)).toEqual(["Send a message", "YouTube", "Instagram"]);
    expect(room[1].foot?.[0].href).toBe(CONTACT_HREF);
  });

  it("skips Creator when there's no pitch, no links and no posts; the desk still offers the contact line", () => {
    const quiet = { ...sections, writing: { key: "writing" as const, title: "Writing", body: "" } };
    const out = withContent(HOME_CHAPTERS, { sections: quiet, experience: [], technologies: [] });
    expect(out.some((c) => c.id === "creator")).toBe(false);
    expect(panelsOf(out, "room").map((p) => p.id)).toEqual(["contact"]);
  });

  it("fills the showcase with featured public projects (max 4) and sizes its scroll; skips it with none", () => {
    const proj = (slug: string, over: Record<string, unknown> = {}) => ({ id: slug, slug, name: slug.toUpperCase(), tagline: "t", body: "", tags: ["a", "b", "c", "d"], screenshots: ["https://x/1.png"], url: "", featured: true, public: true, sort: 1, created_at: "", ...over });
    const projects = [proj("one"), proj("two"), proj("plain", { featured: false }), proj("hidden", { public: false }), proj("three"), proj("four"), proj("five")];
    const out = withContent(HOME_CHAPTERS, { sections, experience: [], technologies: [], projects });
    const sc = out.find((c) => c.id === "projects");
    expect(sc?.kind === "section" && sc.showcase?.map((i) => i.slug)).toEqual(["one", "two", "three", "four"]);
    expect(sc?.kind === "section" && sc.showcase?.[0]).toEqual({ slug: "one", name: "ONE", tagline: "t", tags: ["a", "b", "c"], href: "/projects/one", shots: ["https://x/1.png"] });
    expect(sc?.scroll).toBeCloseTo(0.6 + 4);
    const none = withContent(HOME_CHAPTERS, { sections, experience: [], technologies: [], projects: [proj("plain", { featured: false })] });
    expect(none.some((c) => c.id === "projects")).toBe(false);
  });

  it("gives Experience one screen per public role with up to 3 public bullets; skips it with no roles", () => {
    const experience = [
      item({ kind: "education", title: "MEng" }),
      item({ title: "Software Engineer", org: "Global Relay", dates: "2024 – now", bullets: [
        { text: "One", public: true }, { text: "Hidden", public: false }, { text: "Two", public: true }, { text: "Three", public: true }, { text: "Four", public: true },
      ] }),
      item({ title: "ML Intern", org: "KOLN3D", dates: "2022", bullets: [] }),
    ];
    const ex = withContent(HOME_CHAPTERS, { sections, experience, technologies: [] }).find((c) => c.id === "experience")!;
    expect(ex.scroll).toBeCloseTo(0.4 + 2);
    const ps = ex.panels!;
    expect(ps.map((p) => [p.id, p.title, p.meta, p.eyebrow, p.look])).toEqual([
      ["r1", "Software Engineer", "Global Relay", "2024 – now", "role"], ["r2", "ML Intern", "KOLN3D", "2022", "role"],
    ]);
    expect(ps[0].points).toEqual(["One", "Two", "Three"]);
    expect(ps[1].points).toEqual([]);
    expect(ps[0].from).toBeCloseTo(0.4 / 2.4);
    expect(ps[1].to).toBe(1);
    expect(withContent(HOME_CHAPTERS, { sections, experience: [item({ kind: "education" })], technologies: [] }).some((c) => c.id === "experience")).toBe(false);
  });

  it("builds the Toolkit from '## layer' blocks plus public certificate badges, or falls back to project tags", () => {
    const tech = { ...sections, technology: { key: "technology" as const, title: "Toolkit", body: "## Cloud\nAWS at work.\n- AWS, SQS\n## AI\n- LLMs" } };
    const experience = [
      item({ kind: "certificate", title: "AWS SA Pro", org: "AWS", summary: "[Credly](https://www.credly.com/badges/1)" }),
      item({ kind: "certificate", title: "Hidden cert", public: false }),
    ];
    const tk = withContent(HOME_CHAPTERS, { sections: tech, experience, technologies: [] }).find((c) => c.id === "toolkit")!;
    expect(tk.kind === "section" && tk.toolkit).toEqual({
      title: "Toolkit",
      layers: [{ name: "Cloud", how: "AWS at work.", tools: ["AWS", "SQS"] }, { name: "AI", how: "", tools: ["LLMs"] }],
      certs: [{ title: "AWS SA Pro", org: "AWS", href: "https://www.credly.com/badges/1" }],
    });
    expect(tk.scroll).toBeCloseTo(0.5 + 2 * 0.7 + 0.6);
    const fallback = withContent(HOME_CHAPTERS, { sections, experience: [], technologies: ["Next.js", "Supabase"] }).find((c) => c.id === "toolkit")!;
    expect(fallback.kind === "section" && fallback.toolkit?.layers).toEqual([{ name: "Stack", how: "", tools: ["Next.js", "Supabase"] }]);
    expect(withContent(HOME_CHAPTERS, { sections, experience: [], technologies: [] }).some((c) => c.id === "toolkit")).toBe(false);
  });

  it("turns a certificate entry's public bullets into one badge each (e.g. AWS)", () => {
    const tech = { ...sections, technology: { key: "technology" as const, title: "Toolkit", body: "## AI\n- LLMs" } };
    const aws = item({ kind: "certificate", title: "AWS", org: "", summary: "", bullets: [
      { text: "AWS Machine Learning Specialty", public: true }, { text: "Hidden one", public: false },
      { text: "AWS Solutions Architect Professional [Credly](https://www.credly.com/badges/2)", public: true },
    ] });
    const tk = withContent(HOME_CHAPTERS, { sections: tech, experience: [aws], technologies: [] }).find((c) => c.id === "toolkit")!;
    expect(tk.kind === "section" && tk.toolkit?.certs).toEqual([
      { title: "AWS Machine Learning Specialty", org: "AWS", href: undefined, badge: expect.stringMatching(/aws-ml-specialty/) },
      { title: "AWS Solutions Architect Professional", org: "AWS", href: "https://www.credly.com/badges/2", badge: expect.stringMatching(/aws-sa-pro/) },
    ]);
  });
});
