import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { default_extensions, paredit_keymap } from "@nextjournal/clojure-mode";
import { emacs, EmacsHandler } from "@replit/codemirror-emacs";
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

function dispatchKey(view, key, modifiers = {}) {
  const opts = {
    key,
    code: key,
    bubbles: true,
    cancelable: true,
    ctrlKey: modifiers.ctrl ?? false,
    metaKey: modifiers.meta ?? false,
    shiftKey: modifiers.shift ?? false,
    altKey: modifiers.alt ?? false,
  };
  view.contentDOM.dispatchEvent(new KeyboardEvent("keydown", opts));
}

// ── Via EmacsHandler native binding ─────────────────────────────────────────
//
// The correct integration path for emacs: register a command in EmacsHandler's
// own dispatch pipeline.  This works for both single-chord and prefix sequences
// because emacs processes the key before CM6's keymap system runs — meaning
// the registered exec function must call through wrapCommand to be observed.

const EMACS_CMD_SINGLE = "clt-slurpSexp-single";
const EMACS_CMD_PREFIX = "clt-slurpSexp-prefix";

describe("emacs keymap — EmacsHandler native binding", () => {
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
          emacs(),
          keymap.of([...defaultKeymap, indentWithTab]),
          ...default_extensions,
        ],
      }),
      parent,
    });

    const wrapped = wrapCommand(slurpEntry.run, "slurpSexp", log);
    EmacsHandler.addCommands({
      [EMACS_CMD_SINGLE]: () => wrapped(view),
      [EMACS_CMD_PREFIX]: () => wrapped(view),
    });
    // C-. is not bound by emacs by default
    EmacsHandler.bindKey("C-.", EMACS_CMD_SINGLE);
    // C-c C-x is a safe 2-key prefix sequence
    EmacsHandler.bindKey("C-c C-x", EMACS_CMD_PREFIX);

    view.dispatch({ selection: { anchor: SAMPLE.indexOf("[name]") + 1 } });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("single-chord emacs binding records one log entry", () => {
    dispatchKey(view, ".", { ctrl: true });
    expect(log).toHaveLength(1);
    expect(log[0].command).toBe("slurpSexp");
    expect(typeof log[0].at).toBe("number");
  });

  it("prefix sequence C-c C-x records one log entry — wrapper is NOT bypassed", () => {
    dispatchKey(view, "c", { ctrl: true });
    dispatchKey(view, "x", { ctrl: true });
    expect(log).toHaveLength(1);
    expect(log[0].command).toBe("slurpSexp");
  });

  it("prefix sequence repeated twice records two entries", () => {
    dispatchKey(view, "c", { ctrl: true });
    dispatchKey(view, "x", { ctrl: true });
    dispatchKey(view, "c", { ctrl: true });
    dispatchKey(view, "x", { ctrl: true });
    expect(log).toHaveLength(2);
  });

  it("doc changes after emacs-triggered slurp", () => {
    const docBefore = view.state.doc.toString();
    dispatchKey(view, ".", { ctrl: true });
    expect(log.length).toBeGreaterThan(0);
    expect(view.state.doc.toString()).not.toBe(docBefore);
  });
});

// ── Bypass findings ──────────────────────────────────────────────────────────
//
// Two bypass scenarios, both must be understood before Phase 1:
//
// 1. Standard CM6 keymap.of (no Prec.highest): emacs claims the key first.
// 2. Prec.highest keymap.of for an emacs-claimed key (e.g. C-Right):
//    emacs's key handler fires at the DOM level before CM6 keymaps evaluate,
//    so even Prec.highest loses.  Only keys NOT in EmacsHandler's key table
//    can be bound via Prec.highest.

describe("emacs keymap — bypass findings", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("standard CM6 keymap binding is NOT observed when emacs claims the key", () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);

    const bypassLog = makeActionLog();
    const wrapped = wrapCommand(slurpEntry.run, "slurpSexp", bypassLog);

    const bypassView = new EditorView({
      state: EditorState.create({
        doc: SAMPLE,
        extensions: [
          emacs(),
          keymap.of([{ key: "Ctrl-f", run: wrapped }]),
          keymap.of([...defaultKeymap, indentWithTab]),
          ...default_extensions,
        ],
      }),
      parent,
    });

    bypassView.dispatch({ selection: { anchor: SAMPLE.indexOf("[name]") + 1 } });
    dispatchKey(bypassView, "f", { ctrl: true });
    expect(bypassLog).toHaveLength(0);
  });

  it("Prec.highest binding is also bypassed for emacs-claimed keys (C-Right)", () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);

    const bypassLog = makeActionLog();
    const wrapped = wrapCommand(slurpEntry.run, "slurpSexp", bypassLog);

    const bypassView = new EditorView({
      state: EditorState.create({
        doc: SAMPLE,
        extensions: [
          emacs(),
          Prec.highest(keymap.of([{ key: "Ctrl-ArrowRight", run: wrapped }])),
          keymap.of([...defaultKeymap, indentWithTab]),
          ...default_extensions,
        ],
      }),
      parent,
    });

    bypassView.dispatch({ selection: { anchor: SAMPLE.indexOf("[name]") + 1 } });
    dispatchKey(bypassView, "ArrowRight", { ctrl: true });
    // emacs claims C-Right at the DOM level — Prec.highest cannot override it
    expect(bypassLog).toHaveLength(0);
  });

  it("Prec.highest binding DOES fire for keys not in emacs's key table (F5)", () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);

    const f5Log = makeActionLog();
    const wrapped = wrapCommand(slurpEntry.run, "slurpSexp", f5Log);

    const f5View = new EditorView({
      state: EditorState.create({
        doc: SAMPLE,
        extensions: [
          emacs(),
          Prec.highest(keymap.of([{ key: "F5", run: wrapped }])),
          keymap.of([...defaultKeymap, indentWithTab]),
          ...default_extensions,
        ],
      }),
      parent,
    });

    f5View.dispatch({ selection: { anchor: SAMPLE.indexOf("[name]") + 1 } });
    f5View.contentDOM.dispatchEvent(
      new KeyboardEvent("keydown", { key: "F5", bubbles: true, cancelable: true })
    );
    expect(f5Log).toHaveLength(1);
    expect(f5Log[0].command).toBe("slurpSexp");
  });
});
