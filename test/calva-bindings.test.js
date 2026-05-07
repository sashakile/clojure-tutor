import { describe, it, expect } from "vitest";
import { CALVA_BINDINGS } from "../src/calva.cljs";

const REQUIRED_LABELS = [
  "slurp-forward",
  "slurp-backward",
  "barf-forward",
  "barf-backward",
  "raise-sexp",
  "splice-sexp",
  "split-sexp",
  "join-sexp",
];

describe("CALVA_BINDINGS", () => {
  it("exports all 8 required Paredit commands", () => {
    const labels = CALVA_BINDINGS.map((b) => b.label);
    for (const required of REQUIRED_LABELS) {
      expect(labels).toContain(required);
    }
  });

  it("every binding has a key and label string", () => {
    for (const b of CALVA_BINDINGS) {
      expect(typeof b.key).toBe("string");
      expect(b.key.length).toBeGreaterThan(0);
      expect(typeof b.label).toBe("string");
      expect(b.label.length).toBeGreaterThan(0);
    }
  });

  it("keys use CM6 notation (capitalized modifier, hyphen separator)", () => {
    const cm6Key = /^(Ctrl|Alt|Shift|Mod)(-(?:Ctrl|Alt|Shift|Mod))*-\S+$/;
    for (const b of CALVA_BINDINGS) {
      expect(b.key).toMatch(cm6Key);
    }
  });

  it("no two bindings share the same key", () => {
    const keys = CALVA_BINDINGS.map((b) => b.key);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });
});
