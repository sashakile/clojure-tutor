import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createFixture } from "../src/lesson/fixture.cljs";
import { setActiveProfile } from "../src/profiles/state.cljs";

describe("createFixture", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    setActiveProfile("default");
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("creates a lesson-text section as the first shell child", () => {
    const container = document.createElement("main");
    const existing = document.createElement("div");
    container.appendChild(existing);
    document.body.appendChild(container);

    const cell = createFixture(container);

    expect(container.firstElementChild.className).toBe("lesson-text");
    expect(cell.state.doc.toString()).toBe("");
    expect(container.querySelector(".lesson-text .cm-editor")).not.toBeNull();
  });

  it("renders at least two keybinding placeholders", () => {
    const container = document.createElement("main");
    document.body.appendChild(container);

    createFixture(container);

    const placeholders = container.querySelectorAll("[data-command]");
    expect(placeholders).toHaveLength(2);
    expect([...placeholders].map((el) => el.textContent)).toEqual([
      "Ctrl-ArrowRight",
      "Ctrl-ArrowLeft",
    ]);
  });
});
