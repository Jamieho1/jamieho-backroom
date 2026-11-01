import { Decoration, MatchDecorator, ViewPlugin, type DecorationSet, type EditorView, type ViewUpdate } from "@codemirror/view";
import { BUILTINS } from "@/components/notes/code-highlight";
export { codeHighlighter } from "@/components/notes/code-highlight";
const BUILTIN_CALL = /\bself\b|\b([a-z]+)(?=\s*\()/g;
const builtinMatcher = new MatchDecorator({
  regexp: BUILTIN_CALL,
  decorate: (add, from, to, m) => {
    if (m[0] === "self") add(from, to, Decoration.mark({ class: "tk-cls" }));
    else if (BUILTINS.has(m[1])) add(from, from + m[1].length, Decoration.mark({ class: "tk-bi" }));
  },
});
export const builtinHighlight = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = builtinMatcher.createDeco(view);
    }
    update(u: ViewUpdate) {
      this.decorations = builtinMatcher.updateDeco(u, this.decorations);
    }
  },
  { decorations: (v) => v.decorations },
);
