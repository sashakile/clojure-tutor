import { describe, it, expect, beforeEach } from "vitest";
import { renderKeybindings } from "../src/lesson/keybinding.js";
import { setActiveProfile } from "../src/profiles/state.js";

describe("renderKeybindings", () => {
  beforeEach(() => {
    setActiveProfile("default");
  });

  it("renders the active profile keybinding for data-command elements", () => {
    const container = document.createElement("section");
    container.innerHTML = '<kbd data-command=":slurp-forward"></kbd>';

    const unsubscribe = renderKeybindings(container);

    expect(container.querySelector("kbd").textContent).toBe("Ctrl-ArrowRight");
    unsubscribe();
  });

  it("updates when the active profile changes", () => {
    const container = document.createElement("section");
    container.innerHTML = '<kbd data-command=":slurp-forward"></kbd>';

    const unsubscribe = renderKeybindings(container);
    setActiveProfile("calva");

    expect(container.querySelector("kbd").textContent).toBe("Ctrl-Alt-ArrowRight");
    unsubscribe();
  });

  it("falls back to the command keyword for unknown commands", () => {
    const container = document.createElement("section");
    container.innerHTML = '<kbd data-command=":unknown-command"></kbd>';

    const unsubscribe = renderKeybindings(container);

    expect(container.querySelector("kbd").textContent).toBe(":unknown-command");
    unsubscribe();
  });

  it("accepts data-command values without a leading colon", () => {
    const container = document.createElement("section");
    container.innerHTML = '<kbd data-command="slurp-forward"></kbd>';

    const unsubscribe = renderKeybindings(container);

    expect(container.querySelector("kbd").textContent).toBe("Ctrl-ArrowRight");
    unsubscribe();
  });
});
