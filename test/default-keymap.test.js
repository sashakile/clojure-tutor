import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { default_extensions, paredit_keymap } from "@nextjournal/clojure-mode";
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
    // "ArrowRight" is both its own key and code value per DOM spec
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

describe("default keymap — command-wrapper", () => {
  let view;
  let log;

  beforeEach(() => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    log = makeActionLog();
    const wrapped = wrapCommand(slurpEntry.run, "slurpSexp", log);

    view = new EditorView({
      state: EditorState.create({
        doc: SAMPLE,
        extensions: [
          keymap.of([
            { key: "Ctrl-ArrowRight", run: wrapped },
            ...defaultKeymap,
            indentWithTab,
          ]),
          ...default_extensions,
        ],
      }),
      parent,
    });

    // Position cursor inside the vector to make slurp applicable
    view.dispatch({
      selection: { anchor: SAMPLE.indexOf("[name]") + 1 },
    });
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("records one log entry when slurpSexp fires", () => {
    dispatchKey(view, "ArrowRight", { ctrl: true });
    expect(log).toHaveLength(1);
    expect(log[0].command).toBe("slurpSexp");
    expect(typeof log[0].at).toBe("number");
  });

  it("records additional entries for repeated slurp invocations", () => {
    dispatchKey(view, "ArrowRight", { ctrl: true });
    dispatchKey(view, "ArrowRight", { ctrl: true });
    expect(log).toHaveLength(2);
  });

  it("does not record an entry when the command returns false", () => {
    // Directly test the wrapper contract: a command that always declines must not log
    const decliningLog = makeActionLog();
    const alwaysDeclines = wrapCommand(() => false, "noop", decliningLog);
    alwaysDeclines(view);
    expect(decliningLog).toHaveLength(0);
  });

  it("command effect is preserved — doc changes after slurp", () => {
    const docBefore = view.state.doc.toString();
    dispatchKey(view, "ArrowRight", { ctrl: true });
    expect(log.length).toBeGreaterThan(0);
    expect(view.state.doc.toString()).not.toBe(docBefore);
  });
});
