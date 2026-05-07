import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { installNavLayer } from "../src/nav/nav-layer.cljs";
import { setActiveProfile } from "../src/profiles/state.cljs";

function press(key, options = {}) {
  const event = new KeyboardEvent("keydown", {
    key,
    code: options.code ?? key,
    bubbles: true,
    cancelable: true,
  });
  window.dispatchEvent(event);
  return event;
}

function focusEditor() {
  const editor = document.createElement("div");
  editor.className = "cm-editor";
  editor.tabIndex = 0;
  document.body.appendChild(editor);
  editor.focus();
  return editor;
}

describe("installNavLayer", () => {
  let cleanup;
  let panel;
  let whichKey;
  let shown;
  let opened;

  beforeEach(() => {
    document.body.innerHTML = "";
    setActiveProfile("default");
    shown = [];
    opened = 0;
    panel = { open: () => { opened += 1; } };
    whichKey = {
      show(hints, onKey) {
        shown.push(hints);
        this.onKey = onKey;
      },
      onKey: null,
    };
  });

  afterEach(() => {
    cleanup?.();
    cleanup = null;
    document.body.innerHTML = "";
  });

  it("leader fires when no .cm-editor has focus", () => {
    cleanup = installNavLayer({}, panel, whichKey);

    const event = press("g");

    expect(shown).toEqual([[{ key: "p", label: "profiles" }]]);
    expect(event.defaultPrevented).toBe(true);
  });

  it("routes p from which-key to the profiles panel", () => {
    cleanup = installNavLayer({}, panel, whichKey);

    press("g");
    whichKey.onKey("p");

    expect(opened).toBe(1);
  });

  it("non-Space leader does not fire when a .cm-editor has focus", () => {
    focusEditor();
    cleanup = installNavLayer({}, panel, whichKey);

    const event = press("g");

    expect(shown).toEqual([]);
    expect(event.defaultPrevented).toBe(false);
  });

  it("Space does not fire in vim insert mode", () => {
    setActiveProfile("vim");
    const editor = focusEditor();
    cleanup = installNavLayer(
      { cells: [{ dom: editor, view: { state: { vim: { insertMode: true } } } }] },
      panel,
      whichKey
    );

    const event = press(" ", { code: "Space" });

    expect(shown).toEqual([]);
    expect(event.defaultPrevented).toBe(false);
  });

  it("Space fires in vim normal mode", () => {
    setActiveProfile("vim");
    const editor = focusEditor();
    cleanup = installNavLayer(
      { cells: [{ dom: editor, view: { state: { vim: { insertMode: false } } } }] },
      panel,
      whichKey
    );

    const event = press(" ", { code: "Space" });

    expect(shown).toEqual([[{ key: "p", label: "profiles" }]]);
    expect(event.defaultPrevented).toBe(true);
  });
});
