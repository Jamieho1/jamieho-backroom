/**
 * IDE-style Python colours (Jamie 2026-10-28: "can the code be colored, like the ide"). One highlighter for the
 * arena editor and every read-only code block (notes, solutions, reports), using the artifact's Lezer Python parser so
 * both colour the same way. Colours live in CSS (`.tk-*`), with light and dark shades.
 */
import type { ReactNode } from "react";
import { tagHighlighter, highlightTree, tags as t } from "@lezer/highlight";
import { parser } from "@lezer/python";

export const codeHighlighter = tagHighlighter([
  { tag: t.keyword, class: "tk-kw" },
  { tag: [t.string, t.special(t.string)], class: "tk-str" },
  { tag: [t.number, t.bool, t.null], class: "tk-num" },
  { tag: t.comment, class: "tk-com" },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.function(t.definition(t.variableName))], class: "tk-fn" },
  { tag: [t.className, t.definition(t.className), t.self], class: "tk-cls" },
  { tag: t.definition(t.variableName), class: "tk-def" },
]);

/** Python built-ins the parser sees as ordinary names: coloured teal when called, like an IDE. */
export const BUILTINS = new Set(
  "abs all any bin bool chr dict divmod enumerate filter float frozenset hash int isinstance iter len list map max min next ord pow print range repr reversed round set sorted str sum super tuple type zip".split(" "),
);

export interface Span {
  text: string;
  cls: string;
}

/** Split Python source into coloured spans. Joining every span's text gives back the source exactly. */
export function highlightPython(code: string): Span[] {
  const out: Span[] = [];
  let pos = 0;
  const push = (to: number, cls: string) => {
    if (to > pos) out.push({ text: code.slice(pos, to), cls });
    pos = to;
  };
  highlightTree(parser.parse(code), codeHighlighter, (from, to, cls) => {
    push(from, "");
    push(to, cls);
  });
  push(code.length, "");
  // Built-in calls (len(…), range(…)) come out as function calls: recolour them. `self` is a plain name to the
  // parser; give it the class colour like an IDE.
  return out.flatMap((s) => {
    if (s.cls === "tk-fn" && BUILTINS.has(s.text)) return [{ ...s, cls: "tk-bi" }];
    if (s.cls || !/\bself\b/.test(s.text)) return [s];
    return s.text.split(/\b(self)\b/).filter(Boolean).map((text) => ({ text, cls: text === "self" ? "tk-cls" : "" }));
  });
}

/** A read-only code block with IDE colours. Non-Python languages stay plain. */
export function CodeBlock({ code, lang = "python", className = "code" }: { code: string; lang?: string; className?: string }): ReactNode {
  const py = !lang || /^(py|python|python3)$/i.test(lang);
  return (
    <pre className={className} data-lang={py ? "python" : lang}>
      {py ? highlightPython(code).map((s, i) => (s.cls ? <span key={i} className={s.cls}>{s.text}</span> : s.text)) : code}
    </pre>
  );
}

