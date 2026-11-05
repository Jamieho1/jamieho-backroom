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
    expect(panelsOf(out, "sky")[0]).toMatchObject({ title: "Test Name", body: "First line.", md: true, cta: { href: DESKTOP_HREF } });
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

  it("fills the desk with Now and Latest, with a contact line from the Contact section", () => {
    const latest = {
      video: { slug: "v", title: "My video", platform: "youtube" as const, source_url: "https://youtube.com/watch?v=x", cover_url: "https://img/v.jpg", created_at: "" },
      article: { slug: "a-post", title: "My post", platform: "other" as const, source_url: "", cover_url: "", created_at: "" },
    };
    const withNow = { ...sections, now: { key: "now" as const, title: "Now", body: "Building things." },
      contact: { key: "contact" as const, title: "Contact", body: "[YT](https://www.youtube.com/@me) [IG](https://instagram.com/me)" } };
    const room = panelsOf(withContent(HOME_CHAPTERS, { sections: withNow, experience: [], technologies: [], latest }), "room");
    expect(room.map((p) => p.id)).toEqual(["now", "latest"]);
    expect(room[0]).toMatchObject({ title: "Now", body: "Building things." });
    expect(room[1].links).toEqual([
      { kicker: "Latest video", title: "My video", href: "https://youtube.com/watch?v=x", image: "https://img/v.jpg", external: true },
      { kicker: "Latest article", title: "My post", href: "/articles/a-post", image: undefined },
    ]);
    expect(room[1].foot?.map((f) => f.label)).toEqual(["Say hello", "YouTube", "Instagram"]);
    expect(room[1].foot?.[0].href).toBe(CONTACT_HREF);
  });

  it("hides Now when it is empty and still offers the contact line", () => {
    const room = panelsOf(withContent(HOME_CHAPTERS, { sections, experience: [], technologies: [] }), "room");
    expect(room.map((p) => p.id)).toEqual(["latest"]);
    expect(room[0].links).toEqual([]);
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
});
