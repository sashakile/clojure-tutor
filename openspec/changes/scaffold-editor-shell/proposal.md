# Change: Phase 1 scaffolding — editor shell, squint pipeline, action log

**Status:** Draft

## Why

Phase 0 confirmed that CM6 action observation is viable across all three keymap
modes (default, vim, emacs) using mode-specific binding APIs. Phase 1 delivers
the minimal editor shell that every subsequent phase builds on: a live squint
REPL in a two-pane layout with action-log infrastructure wired up and ready to
validate lesson interactions.

## What Changes

- **Two-pane layout**: editor pane (left) + output pane (right), fills viewport
- **Single CM6 cell**: initialized with `@nextjournal/clojure-mode` + active profile keymap
- **Squint compile → eval**: bound to `Mod-Enter`; output pane shows results and compile errors
- **Persistent session namespace**: accumulates `def`/`defn` across evals; resets on profile switch
- **Storage abstraction**: thin wrapper binding to `window.storage` (widget env) or `localStorage` (standalone); no direct calls from application code
- **Action log**: per-cell JS object created on cell init, keyed by command keyword (`:slurp-forward`); cleared on profile switch
- **Command-wrapper production integration**: `wrapCommand` moves from spike to `src/validation/` and is integrated into each profile's binding setup
- **Profile-keyed binding setup**: three profiles use the Phase 0 validated patterns
  - default: `keymap.of([{ key, run: wrapCommand(...) }])`
  - vim: `Vim.defineAction("clt-<name>", ...)` + `Vim.mapCommand`
  - emacs: `EmacsHandler.addCommands` + `bindKey` (unbound chords only: `C-.`, `C-,`, `F5`–`F12`)
- **Command-keyword mapping layer**: `"slurp-forward"` (JS strings in wrapper) ↔ `":slurp-forward"` (`:keyword`-format strings in action log); coercion to real ClojureScript keywords at the Clojure validation layer
- Update `openspec/project.md` test runner entry: vitest confirmed by Phase 0

Action log and command wrapper stay in vanilla JS (no ClojureScript interop needed); editor shell, cell, pipeline, and profile components are ClojureScript (`.cljs`).

## Impact

- New specs: `editor-shell`, `squint-pipeline`
- Modified specs: `action-validation` (adds log lifecycle, wrapper integration, profile binding requirements)
- New directories (to be created): `src/editor/`, `src/pipeline/`, `src/validation/`, `src/storage/`
- Scope constraint: no lesson runner, no navigation, no profile-switch UI — single hardcoded profile for Phase 1 integration testing
