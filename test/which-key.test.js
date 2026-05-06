import { describe, it, expect, afterEach } from "vitest";
import { createWhichKey } from "../src/nav/which-key.js";

describe("createWhichKey", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("shows an overlay with hints", () => {
    const whichKey = createWhichKey();

    whichKey.show([{ key: "p", label: "profiles" }]);

    const overlay = document.querySelector(".clt-which-key");
    expect(overlay).not.toBeNull();
    expect(overlay.textContent).toContain("p");
    expect(overlay.textContent).toContain("profiles");

    whichKey.hide();
  });

  it("onKey callback receives the pressed key", () => {
    const keys = [];
    const whichKey = createWhichKey({ onKey: (key) => keys.push(key) });

    whichKey.show([{ key: "p", label: "profiles" }]);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "p" }));

    expect(keys).toEqual(["p"]);
  });

  it("hides the overlay after hide", () => {
    const whichKey = createWhichKey();

    whichKey.show([{ key: "p", label: "profiles" }]);
    whichKey.hide();

    expect(document.querySelector(".clt-which-key")).toBeNull();
  });

  it("uses a per-show onKey callback when provided", () => {
    const keys = [];
    const whichKey = createWhichKey();

    whichKey.show([{ key: "p", label: "profiles" }], (key) => keys.push(key));
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "p" }));

    expect(keys).toEqual(["p"]);
    expect(document.querySelector(".clt-which-key")).toBeNull();
  });
});
