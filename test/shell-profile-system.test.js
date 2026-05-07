import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createShell } from "../src/editor/shell.cljs";
import { setActiveProfile } from "../src/profiles/state.cljs";

describe("createShell profile-system wiring", () => {
  let shell;

  beforeEach(() => {
    document.body.innerHTML = '<main id="app"></main>';
    setActiveProfile("default");
  });

  afterEach(() => {
    shell?.unsubscribeProfile?.();
    shell?.uninstallNavLayer?.();
    shell = null;
    document.body.innerHTML = "";
  });

  it("maintains a cells array with fixture and main cells", () => {
    shell = createShell(document.getElementById("app"));

    expect(shell.cells).toEqual([shell.fixtureCell, shell.cell]);
    expect(shell.cells).toHaveLength(2);
  });

  it("profile changes reinitialize registered cells and update fixture key text", () => {
    shell = createShell(document.getElementById("app"));
    const oldFixtureView = shell.fixtureCell.view;
    const oldMainView = shell.cell.view;

    setActiveProfile("calva");

    expect(shell.fixtureCell.view).not.toBe(oldFixtureView);
    expect(shell.cell.view).not.toBe(oldMainView);
    expect(document.querySelector('[data-command="slurp-forward"]').textContent).toBe("Ctrl-Alt-ArrowRight");
  });

  it("mounts nav primitives so the profile panel opens through leader p", () => {
    shell = createShell(document.getElementById("app"));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "g", bubbles: true, cancelable: true }));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "p", bubbles: true, cancelable: true }));

    expect(shell.panel.element.hidden).toBe(false);
  });
});
