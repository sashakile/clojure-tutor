import { describe, it, expect, afterEach } from "vitest";
import { createCell } from "../src/editor/cell.cljs";
import { resolveBindings } from "../src/profiles/resolve.cljs";

const SAMPLE = `(defn greet [name]\n  (str "hello " name))`;

describe("createCell profile reinitialization", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("creates a cell from a resolved bindings map", () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);

    const cell = createCell(parent, { bindings: resolveBindings("default") });

    expect(cell.state.doc.toString()).toBe("");
    expect(cell.actionLog.entries()).toEqual([]);
    expect(parent.querySelector(".cm-editor")).not.toBeNull();
  });

  it("reinitProfile remounts in the same parent and preserves document content", () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    const cell = createCell(parent, { bindings: resolveBindings("default") });
    cell.dispatch({ changes: { from: 0, insert: SAMPLE } });
    const oldView = cell.view;

    const newView = cell.reinitProfile(resolveBindings("calva"));

    expect(newView).not.toBe(oldView);
    expect(cell.view).toBe(newView);
    expect(cell.state.doc.toString()).toBe(SAMPLE);
    expect(parent.querySelectorAll(".cm-editor")).toHaveLength(1);
    expect(parent.querySelector(".cm-editor")).toBe(newView.dom);
  });

  it("reinitProfile attaches a fresh action log", () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    const cell = createCell(parent, { bindings: resolveBindings("default") });
    const oldLog = cell.actionLog;
    oldLog.append("slurp-forward");

    cell.reinitProfile(resolveBindings("calva"));

    expect(cell.actionLog).not.toBe(oldLog);
    expect(cell.actionLog.entries()).toEqual([]);
    expect(oldLog.entries()).toHaveLength(1);
  });

  it("destroys the old EditorView", () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    const cell = createCell(parent, { bindings: resolveBindings("default") });
    const oldView = cell.view;

    cell.reinitProfile(resolveBindings("calva"));

    expect(oldView.destroyed).toBe(true);
  });
});
