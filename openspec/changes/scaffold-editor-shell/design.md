## Context

Phase 0 validated three mode-specific binding APIs. Phase 1 wires them into a
single editor shell that will serve as the stable foundation for all lesson
authoring. Key decisions from findings.md flow directly into architecture here.

Stakeholders: lesson authors (depend on action log API), Phase 2 (profile
switching UI), Phase 4 (action-based validation logic).

## Goals / Non-Goals

- Goals: working squint REPL in a browser, action log populated on keypress,
  integration tests passing for all three profiles, storage abstraction in place
- Non-Goals: profile-switch UI, lesson runner, navigation, mobile, i18n,
  operator-mode vim bindings, emacs-native key wrapping

## Decisions

### D1 — Emacs profiles restricted to unbound chords

Command binding via `addCommands` + `bindKey` only. Never attempt to wrap
emacs-native keys (`C-f`, `C-Right`, etc.) — they dispatch internally before
any CM6 extension fires, even `Prec.highest`. Unbound candidates for Phase 1:
`C-.`, `C-,`, `F5`–`F12`.

Alternatives considered: structure-diff inference for emacs-native keys.
Deferred: adds significant complexity; no lesson content requires it in Phase 1.

### D2 — Action log is per-cell, not global

Each CM6 cell holds a reference to its own action log object (`cell.actionLog`).
The lesson validator receives the cell ref and reads `cell.actionLog.entries()`.
This avoids global state and supports multi-cell layouts in later phases.

Alternatives considered: global singleton log. Rejected: breaks when two cells
are visible simultaneously (Phase 5+).

### D3 — Command keyword mapping at the log boundary

`wrapCommand(command, "slurp-forward", log)` — the wrapper receives a JS string.
The action log's `append(label)` stores it as a `:keyword`-format JS string:
`":slurp-forward"`. Coercion to real ClojureScript keywords happens at the
Clojure validation layer, not in `action-log.js`. Lesson specs use Clojure
keywords throughout.

This keeps the wrapper API simple (no Clojure interop needed) and the lesson
validator purely Clojure-idiomatic.

**Invariant**: `wrapCommand` MUST NOT log entries for commands that return falsy
— only log on truthy return. Violation causes false-positive lesson validation.

### D4 — Session namespace is a plain JS object on `window`

`window.__clt_session__ = {}` — simple, debuggable, easily cleared on profile
switch. No module-level atom; the namespace must survive across eval calls
but not across page reloads.

Squint's compile output for `def` determines the shim implementation. Two paths,
depending on what task 3.1's spike reveals:

- **If squint emits `var`**: prepend `var <name> = window.__clt_session__.<name>;`
  before each eval; on return, write back `window.__clt_session__.<name> = <name>`.
- **If squint emits `const`**: post-process squint output — replace `const <name> =`
  with `window.__clt_session__.<name> =` before passing to `eval()`.

Task 3.1 must confirm the `(def x 1)` → `(def x 2)` re-binding scenario passes
before either approach is considered final.

### D5 — Storage abstraction is a single-function module

```js
export function getStorage() {
  return window.storage ?? localStorage;
}
```

No class, no wrapper type. Application code calls `getStorage().getItem(key)`.
This is the minimal surface needed and is trivially replaceable.

## Risks / Trade-offs

- Squint session namespace shim is unproven — D4 may need revision once squint
  compile output is examined. Task 3.1 spike validates before any eval code is
  written. The re-binding scenario `(def x 1)` → `(def x 2)` must pass before
  task 3.2 begins.
- Vim global registry collision — mitigated by `clt-` prefix on all action names.
- Emacs `bindKey` chord space is narrow — if lesson designs outgrow unbound
  chords, structure-diff fallback must be built before Phase 8.

### D6 — Action log is a plain object factory, not a class

`action-log.js` exports a `create()` factory function returning a plain object
with `append`, `clear`, and `entries` methods. No `class` keyword, no `this`.

Rationale: CM6 dispatch callbacks don't reliably preserve `this`; factory
closures avoid needing `.bind()` everywhere.

## Open Questions

- Squint emit format (`const` vs `var`): addressed in D4 + resolved by task 3.1 spike.
