import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createProfilesPanel } from "../src/nav/profiles-panel.js";
import { PROFILES } from "../src/profiles/registry.js";
import { getActiveProfile, setActiveProfile } from "../src/profiles/state.js";

function keydown(target, key) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
}

describe("createProfilesPanel", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    setActiveProfile("default");
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("lists all registry profiles", () => {
    const panel = createProfilesPanel(PROFILES);
    panel.open();

    const entries = panel.element.querySelectorAll("button[data-profile-id]");
    expect([...entries].map((entry) => entry.dataset.profileId)).toEqual(Object.keys(PROFILES));
  });

  it("marks the active profile with aria-current", () => {
    setActiveProfile("calva");
    const panel = createProfilesPanel(PROFILES);
    panel.open();

    const active = panel.element.querySelector('[aria-current="true"]');
    expect(active.dataset.profileId).toBe("calva");
  });

  it("clicking an entry sets the active profile and closes the panel", () => {
    const panel = createProfilesPanel(PROFILES);
    panel.open();

    panel.element.querySelector('[data-profile-id="vim"]').click();

    expect(getActiveProfile()).toBe("vim");
    expect(panel.element.hidden).toBe(true);
  });

  it("panel.open focuses the active profile entry", () => {
    setActiveProfile("emacs");
    const panel = createProfilesPanel(PROFILES);

    panel.open();

    expect(document.activeElement.dataset.profileId).toBe("emacs");
  });

  it("Arrow Up/Down navigates between entries", () => {
    const panel = createProfilesPanel(PROFILES);
    panel.open();

    keydown(document.activeElement, "ArrowDown");
    expect(document.activeElement.dataset.profileId).toBe("calva");

    keydown(document.activeElement, "ArrowUp");
    expect(document.activeElement.dataset.profileId).toBe("default");
  });

  it("Enter activates the focused entry and closes the panel", () => {
    const panel = createProfilesPanel(PROFILES);
    panel.open();

    keydown(document.activeElement, "ArrowDown");
    keydown(document.activeElement, "Enter");

    expect(getActiveProfile()).toBe("calva");
    expect(panel.element.hidden).toBe(true);
  });

  it("Escape closes the panel and restores previous focus", () => {
    const before = document.createElement("button");
    before.textContent = "before";
    document.body.appendChild(before);
    before.focus();

    const panel = createProfilesPanel(PROFILES);
    panel.open();
    expect(document.activeElement).not.toBe(before);

    keydown(document.activeElement, "Escape");

    expect(panel.element.hidden).toBe(true);
    expect(document.activeElement).toBe(before);
  });
});
