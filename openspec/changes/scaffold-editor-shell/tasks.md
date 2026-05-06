## 1. Project structure

- [ ] 1.1 Create `src/` directory layout: `editor/`, `editor/profiles/`, `pipeline/`, `validation/`, `storage/`
- [ ] 1.2 Add `src/storage/storage.js` — `window.storage` / `localStorage` abstraction; no app code calls storage directly
- [ ] 1.3 Create `src/main.js` — entry point; imports shell component and mounts to `#app`; referenced by `index.html`

## 2. Editor shell

- [ ] 2.1 Create `src/editor/shell.cljs` — two-pane layout component (editor left, output right, fills viewport)
- [ ] 2.2 Create `src/editor/cell.cljs` — CM6 cell init: clojure-mode + profile keymap extension + action-log ref
- [ ] 2.3 Define `ACTIVE_PROFILE` as a top-level constant in `src/editor/cell.cljs` (default: `"default"`); no UI toggle in Phase 1

## 3. Squint pipeline

- [ ] 3.1 Verify squint compile output for `(def x 1)` followed by `(def x 2)` in the same eval context (const vs var); implement `window.__clt_session__` shim per D4's contingent paths; confirm re-binding works before proceeding to 3.2
- [ ] 3.2 Create `src/pipeline/eval.cljs` — squint compile → eval via session namespace shim; capture result and errors
- [ ] 3.3 Bind `Mod-Enter` to eval in the cell; output pane updates on each eval

## 4. Action log

- [ ] 4.1 Move Phase 0 `command-wrapper.js` → `src/validation/command-wrapper.js`
- [ ] 4.2 Create `src/validation/action-log.js` — per-cell log: `create()`, `append(keyword)`, `clear()`, `entries()`; **must be called before any profile binding extensions are attached to the cell** (see D2)
- [ ] 4.3 Implement keyword mapping: wrapper receives string label (e.g. `"slurp-forward"`); log stores it as a `:keyword`-format JS string (e.g. `":slurp-forward"`); coercion to real ClojureScript keywords happens at the Clojure validation layer, not here

## 5. Profile binding setup

- [ ] 5.1 Create `src/editor/profiles/default.cljs` — `keymap.of([{ key, run: wrapCommand(cmd, label, log) }])`
- [ ] 5.2 Create `src/editor/profiles/vim.cljs` — `Vim.defineAction("clt-<name>", ...)` + `Vim.mapCommand`; namespace all action names with `clt-` prefix
- [ ] 5.3 Create `src/editor/profiles/emacs.cljs` — `addCommands` + `bindKey`; restrict to unbound chords (`C-.`, `C-,`, `F5`–`F12`)

## 6. Integration tests (vitest)

- [ ] 6.1 Test: eval a `(def x 42)`, verify output pane shows `42` on subsequent `x` eval
- [ ] 6.2 Test: trigger slurp in default profile, verify `:slurp-forward` in action log
- [ ] 6.3 Test: trigger slurp in vim profile (normal mode), verify `:slurp-forward` in action log
- [ ] 6.4 Test: trigger slurp in emacs profile, verify `:slurp-forward` in action log
- [ ] 6.5 Test: `log.clear()` resets action log to empty; resetting `window.__clt_session__` to `{}` clears the namespace (note: no runtime profile switch in Phase 1 — test the clear APIs directly)

## 7. Docs

- [ ] 7.1 Update `openspec/project.md` — replace "Test runner: TBD" with "vitest (confirmed by Phase 0 spike)"
- [ ] 7.2 Archive Phase 0 change: `openspec archive phase-0-action-observation-spike --yes`
