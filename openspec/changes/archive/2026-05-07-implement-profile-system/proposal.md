# Change: Phase 2 — Profile system

**Status**: Draft

## Why

Phase 1 delivers a hardcoded single-profile editor shell. Phase 2 makes the
profile a first-class runtime concept: users choose their editor environment
(Calva, Vim/Conjure, Emacs/CIDER) and every keybinding reference in lesson
prose updates to match. The profile-aware which-key navigation layer reinforces
the tutor's pedagogical thesis — that each editor culture has its own idioms —
by making the tutor's own UI navigable using the idiom of the active profile.

## What Changes

- **Profile data schema**: profiles are JS data objects (`id`, `label`,
  `leader`, `bindings`, optional `extends`); the `bindings` map from command
  keywords (`:slurp-forward`) to keybinding strings is the source of truth for
  both keymap setup and prose rendering
- **Profile resolution**: `resolveBindings` walks the `extends` chain and
  shallow-merges `bindings` maps; child keys take precedence
- **Calva profile**: first fully-authored profile; keybinding map covers all
  structural editing operations taught in Phase 1–6 using Calva's default VS
  Code Paredit keybindings
- **Active-profile reactive state**: a pub/sub module (`getActiveProfile`,
  `setActiveProfile`, `onProfileChange`) replaces the hardcoded `ACTIVE_PROFILE`
  constant in `cell.js`
- **Profile switch effects**: `setActiveProfile` triggers keymap
  re-initialization on all cells, session namespace reset, and action log clear
- **Profiles panel**: left-side slide-in panel (Claude Code style); lists all
  registered profiles; highlights the active profile
- **Which-key navigation layer**: window-level leader key interceptor; leader
  is profile-aware (`g` for default/Calva/Emacs; `Space` for Vim); shows a
  hint overlay after the leader press; `[leader] p` opens the profiles panel;
  the leader itself reinforces each profile's idiom (Doom-style Space for Vim,
  `g`-motion-style for others)
- **Keybinding substitution**: lesson text elements with
  `data-command="<keyword>"` are resolved to the active profile's keybinding
  string and updated reactively on profile change
- **Fixture slide**: a synthetic lesson section with one cell and keybinding
  placeholders; proves end-to-end substitution without requiring a lesson runner

## Impact

- New specs: `profile-system`, `which-key-nav`, `keybinding-substitution`
- Affected code:
  - `src/editor/cell.js` — remove `ACTIVE_PROFILE`, `PROFILE_BINDINGS`;
    accept profile data object; expose `reinitProfile`
  - `src/editor/shell.js` — mount nav layer, profiles panel, fixture slide;
    subscribe to profile state
  - New directories: `src/profiles/`, `src/nav/`, `src/lesson/`
- Affected tests: Phase 1 integration tests that reference `ACTIVE_PROFILE`
  or pass a string profile ID to `createCell` must be updated to use registry
  objects
