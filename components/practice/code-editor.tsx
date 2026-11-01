"use client";
/**
 * Code editor: CodeMirror 6, bundled into the page (Monaco needs stylesheets and workers from a CDN, which the
 * artifact frame blocks). Python mode, line numbers, bracket matching, indentation; deliberately NO autocomplete
 * (PRD §7: interview conditions).
 */
import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, indentOnInput, syntaxHighlighting, indentUnit } from "@codemirror/language";
import { python } from "@codemirror/lang-python";
import { builtinHighlight, codeHighlighter } from "./editor-highlight";


const theme = EditorView.theme({
  "&": { height: "100%", fontSize: "14px", backgroundColor: "var(--input)", color: "var(--ink)" },
  ".cm-scroller": { fontFamily: "var(--f-mono)", lineHeight: "21px" },
  ".cm-content": { caretColor: "var(--ink)" },
  ".cm-gutters": { backgroundColor: "var(--bg-accent)", color: "var(--muted)", border: "none" },
  ".cm-activeLine": { backgroundColor: "color-mix(in srgb, var(--bg-accent) 55%, transparent)" },
  ".cm-activeLineGutter": { backgroundColor: "var(--bg-accent)", color: "var(--ink)" },
  "&.cm-focused": { outline: "1.5px solid var(--blue)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": { backgroundColor: "color-mix(in srgb, var(--blue) 25%, transparent)" },
  ".cm-matchingBracket": { backgroundColor: "color-mix(in srgb, var(--green) 25%, transparent)", outline: "none" },
});

export function CodeEditor({ initial, onChange, onActivity, readOnly = false, label, wrap = false }: { initial: string; onChange: (code: string) => void; onActivity?: () => void; readOnly?: boolean; label: string; wrap?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const cb = useRef({ onChange, onActivity });
  cb.current = { onChange, onActivity };
  useEffect(() => {
    if (!host.current) return;
    const view = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: initial,
        extensions: [
          lineNumbers(),
          history(),
          drawSelection(),
          highlightActiveLine(),
          indentOnInput(),
          bracketMatching(),
          indentUnit.of("    "),
          python(),
          syntaxHighlighting(codeHighlighter),
          builtinHighlight,
          keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
          theme,
          ...(wrap ? [EditorView.lineWrapping] : []),
          EditorState.readOnly.of(readOnly),
          EditorView.contentAttributes.of({ "aria-label": label, spellcheck: "false", autocapitalize: "off", autocorrect: "off" }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) {
              cb.current.onChange(u.state.doc.toString());
              cb.current.onActivity?.();
            }
          }),
        ],
      }),
    });
    return () => view.destroy();
    // The editor owns its document after mount; `initial` is only the starting text.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div ref={host} className="editor" />;
}
