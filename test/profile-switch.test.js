import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createCell } from "../src/editor/cell.cljs";
import { evalClojure } from "../src/pipeline/eval.cljs";
import { getActiveProfile, setActiveProfile } from "../src/profiles/state.cljs";
import { applyProfileSwitch } from "../src/profiles/switch.cljs";
import { resolveBindings } from "../src/profiles/resolve.cljs";

const SAMPLE = `(defn greet [name]\n  (str "hello " name))`;

describe("applyProfileSwitch", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    setActiveProfile("default");
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("calls reinitProfile on each cell with the resolved bindings map", () => {
    const calls = [];
    const cells = [
      { actionLog: { clear() {} }, reinitProfile(bindings) { calls.push(bindings); } },
      { actionLog: { clear() {} }, reinitProfile(bindings) { calls.push(bindings); } },
    ];

    applyProfileSwitch("calva", cells);

    expect(calls).toEqual([resolveBindings("calva"), resolveBindings("calva")]);
  });

  it("resets the session namespace", () => {
    evalClojure("(def x 42)");
    expect(window.__clt_session__.x).toBe(42);

    applyProfileSwitch("calva", []);

    expect(window.__clt_session__).toEqual({});
  });

  it("clears each cell action log after reinitialization", () => {
    const clears = [];
    const cells = [
      { reinitProfile() {}, actionLog: { clear() { clears.push("a"); } } },
      { reinitProfile() {}, actionLog: { clear() { clears.push("b"); } } },
    ];

    applyProfileSwitch("calva", cells);

    expect(clears).toEqual(["a", "b"]);
  });

  it("reverts the active profile ID if an effect throws", () => {
    setActiveProfile("calva");
    const cells = [{ actionLog: { clear() {} }, reinitProfile() { throw new Error("boom"); } }];

    expect(() => applyProfileSwitch("calva", cells, "default")).toThrow("boom");
    expect(getActiveProfile()).toBe("default");
  });
});

describe("reinitProfile integration", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    setActiveProfile("default");
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("preserves document content and refreshes action log through applyProfileSwitch", () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    const cell = createCell(parent, { bindings: resolveBindings("default") });
    cell.dispatch({ changes: { from: 0, insert: SAMPLE } });
    cell.actionLog.append("slurp-forward");
    const oldView = cell.view;

    applyProfileSwitch("calva", [cell]);

    expect(cell.view).not.toBe(oldView);
    expect(oldView.destroyed).toBe(true);
    expect(cell.state.doc.toString()).toBe(SAMPLE);
    expect(cell.actionLog.entries()).toEqual([]);
    expect(parent.querySelectorAll(".cm-editor")).toHaveLength(1);
  });
});
