/**
 * Case-study body: a project's Markdown is split on its "## " headings into numbered sections, which also feed the
 * sticky mini-index. Pure and deterministic; fenced code is never mistaken for a heading.
 */
export interface CaseSection {id: string; title: string; body: string}
export interface CaseBody {intro: string; sections: CaseSection[]}

/** Plain heading text: inline Markdown markers and link targets removed. */
export function headingText(raw: string): string {
  return raw.replace(/\s+#+\s*$/, "").replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/[*_`~]/g, "").replace(/\s+/g, " ").trim();
}

/** URL-safe, unique anchor ids ("How it works" → "how-it-works", repeats get -2, -3...). */
export function headingIds(titles: string[]): string[] {
  const used = new Set<string>();
  return titles.map(title => {
    const base = title.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "section";
    let id = base, n = 2;
    while (used.has(id)) id = `${base}-${n++}`;
    used.add(id);
    return id;
  });
}

export function splitCaseBody(markdown: string): CaseBody {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const introLines: string[] = [];
  const found: {title: string; lines: string[]}[] = [];
  let fence = "";
  for (const line of lines) {
    const mark = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (mark) {
      if (!fence) fence = mark;
      else if (mark[0] === fence[0] && mark.length >= fence.length) fence = "";
    }
    const heading = !fence && !mark ? /^ {0,3}##[ \t]+(.+?)\s*$/.exec(line) : null;
    const title = heading ? headingText(heading[1]) : "";
    if (heading && title) {found.push({title, lines: []}); continue;}
    (found.length ? found[found.length - 1].lines : introLines).push(line);
  }
  const ids = headingIds(found.map(s => s.title));
  return {intro: introLines.join("\n").trim(), sections: found.map((s, i) => ({id: ids[i], title: s.title, body: s.lines.join("\n").trim()}))};
}

/** The mini-index entries for a body (one per ## heading). */
export const miniIndex = (markdown: string) => splitCaseBody(markdown).sections.map(({id, title}) => ({id, title}));

/** Whether a section is the one that hosts the "How it works" diagram. */
export const isHowItWorks = (title: string) => /how it works/i.test(title);
