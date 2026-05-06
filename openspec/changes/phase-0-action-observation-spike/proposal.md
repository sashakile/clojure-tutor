# Change: Phase 0 spike — confirm CM6 action observation is viable

## Why

Action-based validation is the signature capability of this tutor: it confirms
the user pressed the taught keybinding, not just typed the resulting code.
Before committing to this validation model, we must verify that CodeMirror 6
command dispatch can be cleanly observed through wrapper interception across
the three supported base keymaps (default, vim, emacs).

## What Changes

- Implement a minimal command-wrapper utility that proxies CM6 `Command`
  functions and records invocations to a per-cell action log
- Validate wrapper coverage against `@nextjournal/clojure-mode` slurp on the
  default CM6 keymap
- Validate coverage on `@replit/codemirror-vim` (normal-mode bindings)
- Validate coverage on the emacs base keymap (chord sequences)
- Document any coverage gaps and decide primary validation path
- Prototype structure-diff inference fallback if gaps are unacceptable

## Impact

- Affected specs: `action-validation` (new capability)
- Affected code: future `src/editor/command-wrapper.*`, `src/validation/*`
- This change gates Phase 1 (scaffolding); no implementation work should
  begin until this spike is resolved
