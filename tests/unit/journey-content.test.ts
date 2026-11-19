import { describe, expect, it } from "vitest";
import { HOME_CHAPTERS } from "@/lib/journey/chapters";
import { educationLine, excerpt, spread, withContent } from "@/lib/journey/content";
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
  it("omits the classification from the About education line without changing the source item", () => {
    const education = item({ kind: "education", title: "MEng Engineering – 2:1 Upper Second Class", org: "University", dates: "2020–2024" });
    expect(educationLine(education)).toBe("MEng Engineering · University · 2020–2024");
    expect(education.title).toContain("Upper Second Class");
    expect(educationLine(item({ title: "MSc Engineering", org: "University", dates: "" }))).toBe("MSc Engineering · University");
  });

  it("separates the hero role from its description and reuses Creator social destinations", () => {
    const custom = { ...sections,
      hero: { key: "hero" as const, title: "Test Name", body: "Engineering role.\n\nA concise description." },
      contact: { key: "contact" as const, title: "Contact", body: "[YouTube](https://youtube.com/@test) [Instagram](https://instagram.com/test) [LinkedIn](https://linkedin.com/in/test)" },
    };
    const hero = panelsOf(withContent(HOME_CHAPTERS, { sections: custom, experience: [], technologies: [] }), "sky")[0];
    expect(hero.meta).toBe("Engineering role.");
    expect(hero.body).toBe("A concise description.");
    expect(hero.actions?.map(a => a.platform)).toEqual(["youtube", "instagram", "linkedin"]);
    const creator = panelsOf(withContent(HOME_CHAPTERS, { sections: custom, experience: [], technologies: [] }), "creator")[0];
    expect(creator.actions).toEqual(hero.actions);
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
    expect(panelsOf(out, "about")[0]).toMatchObject({
      title: "From labs to production", body: "First para.", md: true,
      meta: "MEng Biomedical Engineering · Imperial College London · 2016–2020",
    });
  });

  it("keeps the pivot without an education line, and drops it when About is empty", () => {
    const withAbout = withContent(HOME_CHAPTERS, { sections, experience: [], technologies: [] });
    expect(panelsOf(withAbout, "about")[0]).toMatchObject({ title: "About", body: "About text.", meta: undefined });
    const empty = { ...sections, about: { key: "about" as const, title: "", body: "" } };
    const skipped = withContent(HOME_CHAPTERS, { sections: empty, experience: [], technologies: [] });
    expect(skipped.some((c) => c.id === "about")).toBe(true); // the whole section is skipped, not left blank
  });

  it("puts the latest posts and Subscribe/Follow in Creator, and leaves the room free of text panels", () => {
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
    expect(panelsOf(out, "room")).toEqual([]);
  });

  it("skips Creator when there's no pitch, no links and no posts; the monitor remains available", () => {
    const quiet = { ...sections, writing: { key: "writing" as const, title: "Writing", body: "" } };
    const out = withContent(HOME_CHAPTERS, { sections: quiet, experience: [], technologies: [] });
    expect(out.some((c) => c.id === "creator")).toBe(false);
    expect(panelsOf(out, "room")).toEqual([]);
    expect(out.some(c => ["screen","room","to-room"].includes(c.id))).toBe(false);
  });

  it("binds all featured public projects and opted-in journey stops into the single dial",()=>{
    const project={id:"p",slug:"example",name:"Example",tagline:"",body:"",tags:[],screenshots:[],url:"",featured:true,public:true,sort:0,created_at:""};
    const row={id:"e",kind:"role" as const,title:"Engineer",org:"Example",dates:"2024",location:"London",summary:"",public:true,sort:0,show_on_journey:true,journey_icon:"code" as const,experience_bullets:[]};
    const out=withContent(HOME_CHAPTERS,{sections,experience:[],technologies:[],journeyStops:[row],projects:[project]});
    const chapter=out.find(c=>c.id==="about");expect(chapter?.kind==="section"&&chapter.dial).toEqual({experiences:[row],projects:[project]});expect(out.some(c=>c.id==="projects"||c.id==="experience")).toBe(false);
  });

  it("binds the editable Technology section to What I build while safely retiring legacy layers",()=>{
    const chapter=withContent(HOME_CHAPTERS,{sections,experience:[],technologies:[]}).find(c=>c.id==="toolkit");
    expect(chapter?.kind==="section"&&chapter.build?.items).toHaveLength(5);
  });
});
