import { EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { default_extensions, paredit_keymap } from "@nextjournal/clojure-mode";
import { vim } from "@replit/codemirror-vim";
import { emacs } from "@replit/codemirror-emacs";
import { wrapCommand, makeActionLog } from "../src/editor/command-wrapper.js";

const SAMPLE = `(defn greet [name]
  (str "hello " name))`;

// slurpSexp is "Expand collection to include form to the right" in paredit_keymap
const slurpEntry = paredit_keymap.find(
  (k) => k.doc && k.doc.includes("Expand collection")
);
if (!slurpEntry?.run) {
  throw new Error("slurpSexp command not found in paredit_keymap");
}

function renderLog(el, log) {
  el.textContent = log.length === 0
    ? "log: (none)"
    : log.map((e) => `${e.command} @ ${new Date(e.at).toISOString()}`).join("\n");
}

// ── Default keymap ───────────────────────────────────────────────────────────
const defaultLog = makeActionLog();
const wrappedSlurpDefault = wrapCommand(slurpEntry.run, "slurpSexp", defaultLog);
const defaultLogEl = document.getElementById("log-default");

new EditorView({
  state: EditorState.create({
    doc: SAMPLE,
    extensions: [
      keymap.of([
        { key: "Ctrl-ArrowRight", run: wrappedSlurpDefault },
        ...defaultKeymap,
        indentWithTab,
      ]),
      ...default_extensions,
      EditorView.updateListener.of(() => renderLog(defaultLogEl, defaultLog)),
    ],
  }),
  parent: document.getElementById("editor-default"),
});

// ── Vim emulation ────────────────────────────────────────────────────────────
// Attempts to bind wrapped slurp to `>` via a standard CM6 keymap.
// vim() uses Prec.highest internally, so it intercepts `>` in normal mode
// before the keymap below fires — no log entry is expected here.
const vimLog = makeActionLog();
const wrappedSlurpVim = wrapCommand(slurpEntry.run, "slurpSexp", vimLog);
const vimLogEl = document.getElementById("log-vim");

new EditorView({
  state: EditorState.create({
    doc: SAMPLE,
    extensions: [
      vim(),
      keymap.of([{ key: ">", run: wrappedSlurpVim }]),
      keymap.of([...defaultKeymap, indentWithTab]),
      ...default_extensions,
      EditorView.updateListener.of(() => renderLog(vimLogEl, vimLog)),
    ],
  }),
  parent: document.getElementById("editor-vim"),
});

// ── Emacs emulation ──────────────────────────────────────────────────────────
const emacsLog = makeActionLog();
const wrappedSlurpEmacs = wrapCommand(slurpEntry.run, "slurpSexp", emacsLog);
const emacsLogEl = document.getElementById("log-emacs");

new EditorView({
  state: EditorState.create({
    doc: SAMPLE,
    extensions: [
      emacs(),
      Prec.highest(keymap.of([{ key: "Ctrl-ArrowRight", run: wrappedSlurpEmacs }])),
      keymap.of([...defaultKeymap, indentWithTab]),
      ...default_extensions,
      EditorView.updateListener.of(() => renderLog(emacsLogEl, emacsLog)),
    ],
  }),
  parent: document.getElementById("editor-emacs"),
});
