import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { default_extensions, paredit_keymap } from "@nextjournal/clojure-mode";
import { vim, Vim, getCM } from "@replit/codemirror-vim";
import { emacs, EmacsHandler } from "@replit/codemirror-emacs";
import { create as createLog } from "../src/validation/action-log.js";
import { wrapCommand } from "../src/validation/command-wrapper.js";
import { evalClojure, resetSession } from "../src/pipeline/eval.cljs";

const SAMPLE = `(defn greet [name]
  (str "hello " name))`;

const slurpEntry = (() => {
  const entry = paredit_keymap.find((k) => k.doc && k.doc.includes("Expand collection"));
  if (!entry?.run) throw new Error("slurpSexp not found in paredit_keymap");
  return entry;
})();

function dispatchKey(view, key, modifiers = {}) {
  view.contentDOM.dispatchEvent(
    new KeyboardEvent("keydown", {
      key,
      code: key,
      bubbles: true,
      cancelable: true,
      ctrlKey: modifiers.ctrl ?? false,
      metaKey: modifiers.meta ?? false,
      shiftKey: modifiers.shift ?? false,
      altKey: modifiers.alt ?? false,
    })
  );
}

// ── 6.1 — Eval pipeline ──────────────────────────────────────────────────────

describe("eval pipeline — squint compile + session namespace", () => {
  beforeEach(() => resetSession());

  it("evaluates a literal expression", () => {
    const { result, error } = evalClojure("(+ 1 2)");
    expect(error).toBeNull();
    expect(result).toBe(3);
  });

  it("def persists across evals", () => {
    evalClojure("(def x 42)");
    const { result, error } = evalClojure("x");
    expect(error).toBeNull();
    expect(result).toBe(42);
  });

  it("rebinding def works (var not const)", () => {
    evalClojure("(def x 1)");
    evalClojure("(def x 2)");
    const { result } = evalClojure("x");
    expect(result).toBe(2);
  });

  it("returns error on invalid clojure", () => {
    const { error } = evalClojure("(def");
    expect(error).not.toBeNull();
  });
});

// ── action-log module ─────────────────────────────────────────────────────────

describe("action-log module", () => {
  it("create() returns empty log", () => {
    const log = createLog();
    expect(log.entries()).toEqual([]);
  });

  it("append() stores :keyword-format entries", () => {
    const log = createLog();
    log.append("slurp-forward");
    const entries = log.entries();
    expect(entries).toHaveLength(1);
    expect(entries[0].command).toBe(":slurp-forward");
    expect(typeof entries[0].at).toBe("number");
  });

  it("entries() returns a snapshot, not the live array", () => {
    const log = createLog();
    log.append("slurp-forward");
    const snap1 = log.entries();
    log.append("slurp-forward");
    expect(snap1).toHaveLength(1);
    expect(log.entries()).toHaveLength(2);
  });
});

// ── 6.5 — Clear APIs ─────────────────────────────────────────────────────────

describe("clear APIs (task 6.5)", () => {
  it("log.clear() resets action log to empty", () => {
    const log = createLog();
    log.append("slurp-forward");
    log.append("slurp-forward");
    log.clear();
    expect(log.entries()).toEqual([]);
  });

  it("resetSession() clears window.__clt_session__", () => {
    evalClojure("(def x 99)");
    expect(window.__clt_session__["x"]).toBe(99);
    resetSession();
    expect(window.__clt_session__).toEqual({});
  });
});

// ── 6.2 — Default profile: :slurp-forward in action log ─────────────────────

describe("default profile — wrapCommand with action-log", () => {
  let view;
  let log;

  beforeEach(() => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    log = createLog();
    const wrapped = wrapCommand(slurpEntry.run, "slurp-forward", log);

    view = new EditorView({
      state: EditorState.create({
        doc: SAMPLE,
        extensions: [
          keymap.of([{ key: "Ctrl-ArrowRight", run: wrapped }, ...defaultKeymap, indentWithTab]),
          ...default_extensions,
        ],
      }),
      parent,
    });
    view.dispatch({ selection: { anchor: SAMPLE.indexOf("[name]") + 1 } });
  });

  afterEach(() => { document.body.innerHTML = ""; });

  it("records :slurp-forward on Ctrl-ArrowRight", () => {
    dispatchKey(view, "ArrowRight", { ctrl: true });
    const entries = log.entries();
    expect(entries).toHaveLength(1);
    expect(entries[0].command).toBe(":slurp-forward");
  });

  it("does not log when command declines", () => {
    const log2 = createLog();
    const declining = wrapCommand(() => false, "slurp-forward", log2);
    declining(view);
    expect(log2.entries()).toHaveLength(0);
  });
});

// ── 6.3 — Vim profile: :slurp-forward via Vim.defineAction ──────────────────

describe("vim profile — :slurp-forward via Vim.defineAction", () => {
  let view;
  let log;
  const VIM_ACTION = "clt-slurpForwardIntegration";

  beforeEach(() => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    log = createLog();

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

    // Close over view — same pattern as Phase 0 vim test
    Vim.defineAction(VIM_ACTION, () => wrapCommand(slurpEntry.run, "slurp-forward", log)(view));
    Vim.mapCommand("\\", "action", VIM_ACTION, {}, { context: "normal" });

    view.dispatch({ selection: { anchor: SAMPLE.indexOf("[name]") + 1 } });
  });

  afterEach(() => {
    document.body.innerHTML = "";
    try { Vim.unmap("\\", "normal"); } catch (_) {}
  });

  it("records :slurp-forward when vim-mapped key fires", () => {
    Vim.handleKey(getCM(view), "\\", "mapping");
    const entries = log.entries();
    expect(entries).toHaveLength(1);
    expect(entries[0].command).toBe(":slurp-forward");
  });
});

// ── 6.4 — Emacs profile: :slurp-forward via bindKey ────────────────────────

describe("emacs profile — :slurp-forward via EmacsHandler.bindKey", () => {
  let view;
  let log;
  const EMACS_CMD = "clt-slurpForwardIntegration";

  beforeEach(() => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    log = createLog();

    view = new EditorView({
      state: EditorState.create({
        doc: SAMPLE,
        extensions: [
          emacs(),
          keymap.of([...defaultKeymap, indentWithTab]),
          ...default_extensions,
        ],
      }),
      parent,
    });

    // Close over view — emacs handler exec functions don't receive the CM6 view
    const wrapped = wrapCommand(slurpEntry.run, "slurp-forward", log);
    EmacsHandler.addCommands({
      [EMACS_CMD]: () => wrapped(view),
    });
    EmacsHandler.bindKey("F5", EMACS_CMD);

    view.dispatch({ selection: { anchor: SAMPLE.indexOf("[name]") + 1 } });
  });

  afterEach(() => { document.body.innerHTML = ""; });

  it("records :slurp-forward when F5 is pressed", () => {
    dispatchKey(view, "F5");
    const entries = log.entries();
    expect(entries).toHaveLength(1);
    expect(entries[0].command).toBe(":slurp-forward");
  });
});
