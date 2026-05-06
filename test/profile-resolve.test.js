import { describe, it, expect } from "vitest";
import { PROFILES } from "../src/profiles/registry.js";
import { resolveBindings } from "../src/profiles/resolve.js";

describe("resolveBindings", () => {
  it("returns own bindings for a flat profile", () => {
    expect(resolveBindings("default")).toEqual(PROFILES.default.bindings);
  });

  it("merges an extends chain with child bindings taking precedence", () => {
    const registry = {
      parent: {
        id: "parent",
        bindings: {
          ":slurp-forward": "Ctrl-ArrowRight",
          ":barf-forward": "Ctrl-ArrowLeft",
        },
      },
      child: {
        id: "child",
        extends: "parent",
        bindings: {
          ":slurp-forward": "Ctrl-Alt-ArrowRight",
          ":raise-sexp": "Ctrl-Alt-r",
        },
      },
    };

    expect(resolveBindings("child", registry)).toEqual({
      ":slurp-forward": "Ctrl-Alt-ArrowRight",
      ":barf-forward": "Ctrl-ArrowLeft",
      ":raise-sexp": "Ctrl-Alt-r",
    });
  });

  it("returns an empty object for an unknown profile ID", () => {
    expect(resolveBindings("missing-profile")).toEqual({});
  });

  it("throws a descriptive error for circular extends chains", () => {
    const registry = {
      a: { id: "a", extends: "b", bindings: {} },
      b: { id: "b", extends: "c", bindings: {} },
      c: { id: "c", extends: "a", bindings: {} },
    };

    expect(() => resolveBindings("a", registry)).toThrow(
      "Circular profile extends chain: a -> b -> c -> a"
    );
  });
});
