import { describe, it, expect, beforeEach } from "vitest";
import {
  getActiveProfile,
  onProfileChange,
  setActiveProfile,
} from "../src/profiles/state.js";

function restoreDefault() {
  setActiveProfile("default");
}

describe("profile state", () => {
  beforeEach(() => {
    restoreDefault();
  });

  it("starts with the default profile", () => {
    expect(getActiveProfile()).toBe("default");
  });

  it("subscriber is called on setActiveProfile", () => {
    const calls = [];
    const unsubscribe = onProfileChange((next, previous) => {
      calls.push({ next, previous });
    });

    setActiveProfile("calva");

    expect(calls).toEqual([{ next: "calva", previous: "default" }]);
    unsubscribe();
  });

  it("setActiveProfile is a no-op if the id is unchanged", () => {
    const calls = [];
    const unsubscribe = onProfileChange((next) => calls.push(next));

    setActiveProfile("default");

    expect(calls).toEqual([]);
    unsubscribe();
  });

  it("unsubscribe prevents future calls", () => {
    const calls = [];
    const unsubscribe = onProfileChange((next) => calls.push(next));

    unsubscribe();
    setActiveProfile("vim");

    expect(calls).toEqual([]);
  });

  it("getActiveProfile reflects the most recent set", () => {
    setActiveProfile("emacs");
    expect(getActiveProfile()).toBe("emacs");
  });
});
