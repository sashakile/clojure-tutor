import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { default_extensions, paredit_keymap } from "@nextjournal/clojure-mode";
import { vim, Vim, getCM } from "@replit/codemirror-vim";
import { wrapCommand, makeActionLog } from "../src/editor/command-wrapper.js";

const SAMPLE = `(defn greet [name]
  (str "hello " name))`;

const slurpEntry = (() => {
  const entry = paredit_keymap.find(
    (k) => k.doc && k.doc.includes("Expand collection")
  );
  if (!entry?.run) throw new Error("slurpSexp not found in paredit_keymap");
  return entry;
})();

// Unique name avoids collisions if tests run alongside other suites
const VIM_ACTION = "clt-slurpSexp";

// ── Via vim's own action registry ────────────────────────────────────────────
//
// vim() installs itself at Prec.highest, so it claims every key in normal mode
// before a standard CM6 keymap can fire.  The correct integration point is
// Vim.defineAction + Vim.mapCommand — not keymap.of([{ key, run }]).

describe("vim keymap — command-wrapper via Vim.defineAction", () => {
  let view;
  let log;

  beforeEach(() => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    log = makeActionLog();

    view = new EditorView({
      state: EditorState.create({
        doc: SAMPLE,
        extensions: [
          vim(),
          keymap.of([...defaultKeymap, indentWithTab]),
          ...default_extensions,
        ],
      }),
      parent,
    });

    const wrapped = wrapCommand(slurpEntry.run, "slurpSexp", log);
    // Capture view via closure — view is assigned before the action fires
    Vim.defineAction(VIM_ACTION, () => wrapped(view));
    // Map backslash (unbound by default) to the action in normal mode
    Vim.mapCommand("\\", "action", VIM_ACTION, {}, { context: "normal" });

    // Position cursor inside the vector to make slurp applicable
    view.dispatch({ selection: { anchor: SAMPLE.indexOf("[name]") + 1 } });
  });

  afterEach(() => {
    document.body.innerHTML = "";
    try { Vim.unmap("\\", "normal"); } catch (_) {}
  });

  it("records one log entry when vim-mapped key triggers slurpSexp", () => {
    Vim.handleKey(getCM(view), "\\", "mapping");
    expect(log).toHaveLength(1);
    expect(log[0].command).toBe("slurpSexp");
    expect(typeof log[0].at).toBe("number");
  });

  it("records additional entries for repeated vim-mapped invocations", () => {
    Vim.handleKey(getCM(view), "\\", "mapping");
    Vim.handleKey(getCM(view), "\\", "mapping");
    expect(log).toHaveLength(2);
  });

  it("doc changes after vim-triggered slurp", () => {
    const docBefore = view.state.doc.toString();
    Vim.handleKey(getCM(view), "\\", "mapping");
    expect(log.length).toBeGreaterThan(0);
    expect(view.state.doc.toString()).not.toBe(docBefore);
  });
});

// ── Standard CM6 keymap is bypassed by vim in normal mode ────────────────────
//
// Documented in spike.js: vim() uses Prec.highest, so it intercepts keys
// before keymap.of([{ key, run }]) fires.  This test encodes that finding so
// any future refactor that accidentally "fixes" the bypass will be noticed.

describe("vim keymap — cm6-keymap bypass finding", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("standard CM6 keymap binding is NOT observed when vim claims the key in normal mode", () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);

    const bypassLog = makeActionLog();
    const wrapped = wrapCommand(slurpEntry.run, "slurpSexp", bypassLog);

    const bypassView = new EditorView({
      state: EditorState.create({
        doc: SAMPLE,
        extensions: [
          vim(),
          keymap.of([{ key: ">", run: wrapped }]),
          keymap.of([...defaultKeymap, indentWithTab]),
          ...default_extensions,
        ],
      }),
      parent,
    });

    bypassView.dispatch({ selection: { anchor: SAMPLE.indexOf("[name]") + 1 } });

    // Dispatch ">" — vim claims it as the indent operator before our binding fires
    bypassView.contentDOM.dispatchEvent(
      new KeyboardEvent("keydown", { key: ">", bubbles: true, cancelable: true })
    );

    expect(bypassLog).toHaveLength(0);
  });
});
