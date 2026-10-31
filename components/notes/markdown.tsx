"use client";
/**
 * A small, safe Markdown renderer for notes (headings, paragraphs, lists, code fences, inline code, bold, italics,
 * links). It builds React elements, never HTML strings, so nothing in a note can inject markup.
 */
import { CodeBlock } from "./code-highlight";
import { Fragment, useState, type ReactNode } from "react";

export const slug = (t: string) => "sec-" + t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
/** Headings (## and ###) for an "On this page" bar. */
export function mdHeadings(text: string): { id: string; text: string; level: number }[] {
  return text
    .split(/\r?\n/)
    .map((l) => /^(#{2,3})\s+(.*)$/.exec(l.trim()))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => ({ id: slug(m[2].replace(/[*`]/g, "")), text: m[2].replace(/\*\*|`/g, ""), level: m[1].length }));
}

/** Recall mode: a section's content stays hidden until Jamie has tried to recall it. */
function Hidden({ children, label }: { children: ReactNode; label: string }) {
  const [open, setOpen] = useState(false);
  return open ? (
    <div className="recall open">{children}</div>
  ) : (
    <div
      className="recall"
      role="button"
      tabIndex={0}
      aria-label={`Reveal ${label}`}
      onClick={() => setOpen(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOpen(true);
        }
      }}
    >
      <div aria-hidden="true" className="recall-body">
        {children}
      </div>
      <span className="recall-hint">Recall it, then click to reveal</span>
    </div>
  );
}

/** Table rows: "| a | b |". Pipes inside `code` don't split cells. */
const isRow = (l: string) => /^\s*\|.*\|\s*$/.test(l);
function cells(l: string): string[] {
  const t = l.trim().replace(/^\|/, "").replace(/\|$/, "");
  const out: string[] = [];
  let cur = "";
  let code = false;
  for (const ch of t) {
    if (ch === "`") code = !code;
    if (ch === "|" && !code) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/* ---------- nested lists: "1." / "-" / "*" items, indented children, continuation lines ---------- */
const ITEM = /^(\s*)([-*]|\d+[.)])\s+(.*)$/;
interface LI {
  indent: number;
  ordered: boolean;
  text: string[];
  kids: LI[];
}
function parseList(lines: string[], start: number): [LI[], number] {
  const roots: LI[] = [];
  const stack: LI[] = [];
  let last: LI | null = null;
  let i = start;
  while (i < lines.length) {
    const l = lines[i];
    const m = ITEM.exec(l);
    if (m) {
      const indent = m[1].replace(/\t/g, "    ").length;
      const it: LI = { indent, ordered: /\d/.test(m[2]), text: [m[3]], kids: [] };
      while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
      if (stack.length) stack[stack.length - 1].kids.push(it);
      else roots.push(it);
      stack.push(it);
      last = it;
      i++;
      continue;
    }
    if (!l.trim()) {
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;
      if (j < lines.length && last && (ITEM.test(lines[j]) || /^\s{2,}\S/.test(lines[j]))) {
        i = j;
        continue;
      }
      break;
    }
    if (/^\s*(```|#{1,4}\s)/.test(l) || isRow(l) || !last) break;
    last.text.push(l.trim()); // continuation line (indented or lazy)
    i++;
  }
  return [roots, i];
}
function renderList(items: LI[], key: string): ReactNode[] {
  // consecutive siblings of the same kind share one <ol>/<ul>
  const runs: LI[][] = [];
  for (const it of items) {
    const r = runs[runs.length - 1];
    if (r && r[0].ordered === it.ordered) r.push(it);
    else runs.push([it]);
  }
  return runs.map((run, ri) => {
    const lis = run.map((it, j) => (
      <li key={j}>
        {it.text.map((t, ti) => (
          <Fragment key={ti}>
            {ti ? <br /> : null}
            {inline(t)}
          </Fragment>
        ))}
        {it.kids.length ? renderList(it.kids, `${key}-${ri}-${j}`) : null}
      </li>
    ));
    return run[0].ordered ? <ol key={`${key}-${ri}`}>{lis}</ol> : <ul key={`${key}-${ri}`}>{lis}</ul>;
  });
}

/* ---------- auto-links: problem names in a topic summary → the problem page ---------- */
export interface AutoLink {
  alias: string;
  href: string;
  /** Only when it is the whole text of a cell / list item / paragraph. */
  exact: boolean;
}
let LINKS: { re: RegExp | null; byAlias: Map<string, string>; exact: Map<string, string> } | null = null;
const esc = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function compileLinks(rules: AutoLink[]) {
  const byAlias = new Map<string, string>();
  const exact = new Map<string, string>();
  for (const r of rules) (r.exact ? exact : byAlias).set(r.alias.toLowerCase(), r.href);
  for (const [a, h] of byAlias) if (!exact.has(a)) exact.set(a, h);
  const alts = [...byAlias.keys()].sort((a, b) => b.length - a.length).map(esc);
  return { re: alts.length ? new RegExp(`(?<![A-Za-z0-9])(${alts.join("|")})(?![A-Za-z0-9])(?!\\s+(?:I{1,3}|IV)\\b)`, "gi") : null, byAlias, exact };
}
function linkify(str: string, key: number): ReactNode[] {
  if (!LINKS?.re || !str) return [str];
  const out: ReactNode[] = [];
  let last = 0;
  let k = key;
  LINKS.re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = LINKS.re.exec(str))) {
    if (m.index > last) out.push(str.slice(last, m.index));
    out.push(
      <a key={`al${k++}`} href={LINKS.byAlias.get(m[0].toLowerCase())} className="plink" target="_blank" rel="noopener noreferrer">
        {m[0]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < str.length) out.push(str.slice(last));
  return out;
}

function inline(text: string, key = 0): ReactNode[] {
  const whole = LINKS ? LINKS.exact.get(text.replace(/[*`=]/g, "").trim().toLowerCase()) : undefined;
  if (whole) {
    const saved = LINKS;
    LINKS = null; // no nested links
    const inner = inline(text, key);
    LINKS = saved;
    return [
      <a key={`ax${key}`} href={whole} className="plink" target="_blank" rel="noopener noreferrer">
        {inner}
      </a>,
    ];
  }
  const out: ReactNode[] = [];
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(\[[^\]]+\]\((https?:\/\/[^)\s]+)\))|(==[^=\s](?:[^=\n]*[^=\s])?==)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = key;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(...linkify(text.slice(last, m.index), k++ * 1000));
    const t = m[0];
    if (m[1]) out.push(<code key={k++}>{t.slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={k++}>{inline(t.slice(2, -2), k * 100)}</strong>);
    else if (m[3]) out.push(<em key={k++}>{t.slice(1, -1)}</em>);
    else if (m[6]) out.push(<mark key={k++} className="hl">{inline(t.slice(2, -2), k * 100)}</mark>);
    else if (m[4]) {
      const label = t.slice(1, t.indexOf("]("));
      out.push(
        <a key={k++} href={m[5]} target="_blank" rel="noopener noreferrer">
          {label}
        </a>,
      );
    }
    last = m.index + t.length;
  }
  if (last < text.length) out.push(...linkify(text.slice(last), k * 1000 + 999));
  return out;
}

/** Render Markdown. `links`: problem names to turn into links (topic summaries). */
export function Markdown({ text, recall = false, links }: { text: string; recall?: boolean; links?: AutoLink[] }) {
  const saved = LINKS;
  LINKS = links?.length ? compileLinks(links) : null;
  try {
    return renderMarkdown(text, recall);
  } finally {
    LINKS = saved;
  }
}

function renderMarkdown(text: string, recall: boolean) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  const heads = new Set<number>();
  const headText = new Map<number, string>();
  let i = 0;
  let k = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim() || "python";
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) body.push(lines[i++]);
      i++;
      blocks.push(
        <CodeBlock key={k++} code={body.join("\n")} lang={lang} />,
      );
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const level = Math.min(5, h[1].length + 1);
      const content = inline(h[2]);
      const id = slug(h[2].replace(/[*`]/g, ""));
      heads.add(k);
      headText.set(k, h[2].replace(/[*`]/g, ""));
      blocks.push(level === 2 ? <h2 key={k++} id={id}>{content}</h2> : level === 3 ? <h3 key={k++} id={id}>{content}</h3> : level === 4 ? <h4 key={k++} id={id}>{content}</h4> : <h5 key={k++} id={id}>{content}</h5>);
      i++;
      continue;
    }
    if (isRow(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isRow(lines[i])) rows.push(cells(lines[i++]));
      blocks.push(
        <div key={k++} className="md-table">
          <table>
            <thead>
              <tr>
                {head.map((c, j) => (
                  <th key={j}>{inline(c)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, ri) => (
                <tr key={ri}>
                  {head.map((_, j) => (
                    <td key={j}>{inline(r[j] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (ITEM.test(line)) {
      const [items, next] = parseList(lines, i);
      i = next;
      blocks.push(<Fragment key={k++}>{renderList(items, "l")}</Fragment>);
      continue;
    }
    if (!line.trim()) {
      i++;
      continue;
    }
    const para: string[] = [lines[i++]];
    while (i < lines.length && lines[i].trim() && !isRow(lines[i]) && !/^(```|#{1,4}\s|\s*[-*]\s+|\s*\d+[.)]\s+)/.test(lines[i])) para.push(lines[i++]);
    blocks.push(<p key={k++}>{inline(para.join(" "))}</p>);
  }
  if (!recall) return <div className="md">{blocks.map((b, j) => <Fragment key={j}>{b}</Fragment>)}</div>;
  // Recall: every heading stays visible; the blocks under it are hidden together until revealed.
  const out: ReactNode[] = [];
  let group: ReactNode[] = [];
  let label = "the summary";
  const flush = () => {
    if (group.length) out.push(<Hidden key={`g${out.length}`} label={label}>{group}</Hidden>);
    group = [];
  };
  blocks.forEach((b, j) => {
    if (heads.has(j)) {
      flush();
      label = headText.get(j) ?? "this section";
      out.push(<Fragment key={j}>{b}</Fragment>);
    } else group.push(<Fragment key={j}>{b}</Fragment>);
  });
  flush();
  return <div className="md recalling">{out}</div>;
}

/** Inline Markdown only (bold, italic, `code`, links, ==highlight==): for one block of the notes editor. */
export function MdInline({ text }: { text: string }) {
  const saved = LINKS;
  LINKS = null;
  try {
    return <>{inline(text)}</>;
  } finally {
    LINKS = saved;
  }
}
