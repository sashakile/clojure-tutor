import { describe, it, expect } from "vitest";
import { CALVA_BINDINGS } from "../src/calva.cljs";
import { PROFILES } from "../src/profiles/registry.cljs";

const REQUIRED_PROFILES = ["default", "calva", "vim", "emacs"];

describe("PROFILES registry", () => {
  it("exports all Phase 2 profiles keyed by id", () => {
    expect(Object.keys(PROFILES).sort()).toEqual(REQUIRED_PROFILES.sort());

    for (const id of REQUIRED_PROFILES) {
      expect(PROFILES[id].id).toBe(id);
      expect(typeof PROFILES[id].label).toBe("string");
      expect(PROFILES[id].label.length).toBeGreaterThan(0);
      expect(typeof PROFILES[id].leader).toBe("string");
      expect(PROFILES[id].leader.length).toBeGreaterThan(0);
      expect(PROFILES[id].bindings).toBeTypeOf("object");
    }
  });

  it("stores command-keyword bindings as strings", () => {
    for (const profile of Object.values(PROFILES)) {
      for (const [command, key] of Object.entries(profile.bindings)) {
        expect(command).toMatch(/^[a-z-]+$/);
        expect(typeof key).toBe("string");
        expect(key.length).toBeGreaterThan(0);
      }
    }
  });

  it("uses the researched Calva bindings as the Calva profile source", () => {
    const calvaBindings = Object.fromEntries(
      CALVA_BINDINGS.map(({ label, key }) => [label, key])
    );

    expect(PROFILES.calva.bindings).toEqual(calvaBindings);
    expect(PROFILES.calva.bindings["slurp-forward"]).toBe("Ctrl-Alt-ArrowRight");
    expect(PROFILES.calva.bindings["join-sexp"]).toBe("Ctrl-Shift-j");
  });

  it("uses profile-specific leader keys", () => {
    expect(PROFILES.default.leader).toBe("g");
    expect(PROFILES.calva.leader).toBe("g");
    expect(PROFILES.emacs.leader).toBe("g");
    expect(PROFILES.vim.leader).toBe("Space");
  });
});
