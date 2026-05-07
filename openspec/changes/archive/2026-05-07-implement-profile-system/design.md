## Context

Phase 2 introduces three cross-cutting systems: a profile data layer, a
navigation layer, and a keybinding rendering layer. All three read from a
shared reactive state (the active profile). Phase 1 was implemented in vanilla
JS — no React, no ClojureScript — and Phase 2 continues that pattern.

Stakeholders: lesson authors (keybinding substitution API), Phase 3 (lesson
runner consumes the keybinding rendering layer), Phase 7/8 (Vim/Emacs profiles
extend the registry built here).

## Goals / Non-Goals

- Goals: profile switching that works at runtime, which-key nav grounded in the
  profile idiom, keybinding substitution proven on a fixture slide
- Non-Goals: full lesson runner, lesson navigation, mobile support, profile
  editor UI, user-created profiles

## Decisions

### D1 — Profile data as JS objects, not EDN files

`project.md` specifies EDN for profiles. Phase 1 implemented everything in
vanilla JS. Phase 2 continues in vanilla JS; profiles are plain JS module
exports that mirror EDN semantics (`id`, `label`, `bindings`, optional
`extends`). When the app migrates to squint, these JS objects map directly to
Clojure maps. No parsing step, no file I/O.

Alternatives considered: EDN files loaded at runtime via `fetch`. Rejected:
adds async complexity; EDN parsing requires a library; no benefit until the
lesson curriculum data (Phase 3) also moves to EDN.

> **Action**: Update `project.md` profiles section to reflect JS module format
> for Phases 2–N until the squint migration lands.

### D2 — Reactive state via pub/sub, not a reactive framework

A single `state.js` module with `getActiveProfile`, `setActiveProfile`, and
`onProfileChange` covers all Phase 2 reactivity needs. Subscribers (keybinding
renderer, which-key layer, cell reinit, shell) register callbacks. No signals,
no reactive atoms, no React.

Alternatives considered: using a lightweight signals library. Rejected: adds
a dependency for a single shared value; the pub/sub pattern maps directly to
the Clojure `atom` + `watch` pattern Phase 2's squint migration would use.

### D3 — `g` leader is focus-gated; `Space` leader gates on vim insert mode

`g` in default/Calva/Emacs profiles triggers the which-key layer only when
`document.activeElement` is not a descendant of a `.cm-editor` element. This
prevents typing `g` in the editor from accidentally opening the nav layer.
Users press `Escape` to blur the editor, then `g`.

`Space` in the Vim profile is intercepted when the focused editor is NOT in
vim insert mode (insert mode is detectable via `getCM(view)?.state?.vim
?.insertMode`). In normal mode, `Space` opens the nav layer instead of
advancing the cursor — the same convention as Doom Emacs and Spacemacs. In
insert mode, `Space` types normally.

Invariant: the intercepted event MUST call `event.stopPropagation()` and
`event.preventDefault()` to prevent CM6 from also processing the key.

### D4 — Keybinding substitution via `data-command` attributes, no template engine

Lesson text is static HTML. Elements with `data-command="<keyword>"` are
resolved by `renderKeybindings(container)` which queries `[data-command]`
descendants and sets `textContent` to the resolved keybinding string. No
template language, no virtual DOM. Falls back to the command keyword itself
if the active profile has no binding for it.

This approach is Phase-3-compatible: the lesson runner can call
`renderKeybindings(lessonContainer)` on each slide mount.

### D5 — Cell re-initialization on profile switch, not hot-swapping extensions

CM6 extensions are part of `EditorState` and cannot be mutated in-place.
On profile switch, `reinitProfile(profile)` destroys the old CM6 view and
creates a new one in the same DOM parent, preserving the document content.
The action log is cleared and a new one is created.

Alternatives considered: using a `StateEffect` to swap keymap extensions
only. Rejected: `@replit/codemirror-vim` and `@replit/codemirror-emacs` install
global handlers (via `Vim.mapCommand`, `EmacsHandler.bindKey`) that are
additive and not cleanly undone by removing the extension from state.

### D6 — Fixture slide mounts above the two-pane layout

The fixture is a narrow top bar (`src/lesson/fixture.js`), not a third pane.
Phase 3 will define the real lesson pane structure; Phase 2's fixture proves
substitution without constraining the Phase 3 layout.

## Risks / Trade-offs

- **Vim insert-mode detection** relies on `@replit/codemirror-vim` internal
  state shape. If the library changes `cm.state.vim.insertMode`, the gate
  breaks silently. Mitigation: log a console warning when the field is
  undefined; fall back to treating all vim states as normal mode.
- **Cell re-init on profile switch** causes a brief visual flash. A flash under
  100ms is acceptable; if subjectively noticeable, add a CSS opacity transition.
  Phase 3 can address this more comprehensively if needed.

## Open Questions

- Should the Calva profile's `:extends` point to `default`? Calva's Paredit
  keys are largely the same as the default CM6 bindings. If yes, the `default`
  profile becomes the true base and Calva only overrides divergent keys.
  Verify during task 1.1 (keybinding research).
