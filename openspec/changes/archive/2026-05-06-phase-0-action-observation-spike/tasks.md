# Tasks: phase-0-action-observation-spike

> **Note**: Live status is tracked in bd (prefix CLT — run `bd list`).
> This file is the definition of done — acceptance criteria and task breakdown only.

## Setup

- [x] Initialize a minimal Vite project with squint + CodeMirror 6
- [x] Install `@nextjournal/clojure-mode`, `@replit/codemirror-vim`,
      and an emacs keymap extension
- [x] Implement a thin command-wrapper utility that:
  - Takes a CM6 `Command` function and a keyword label
  - Returns a wrapped command that records `{command: kw, at: timestamp}` to a
    mutable action log
  - Passes through the return value of the original command

## Spike: default keymap

- [x] Register `slurpSexp` (or equivalent from clojure-mode) through the
      wrapper on the default CM6 keymap
- [x] Manually trigger slurp via the keybinding in a test cell
- [x] Verify the action log records one entry per keypress
- [x] Verify the editor state changes correctly (i.e., wrapping didn't break
      the command's effect)

## Spike: vim emulation

- [x] Apply `@replit/codemirror-vim` as the base keymap
- [x] Bind `slurpSexp` to a vim normal-mode key through the wrapper
- [x] Trigger slurp from normal mode; verify action log entry
- [x] Investigate: does vim's operator queue or motion resolution call CM6
      commands in a way that bypasses the keymap registration?
- [x] Document findings

## Spike: emacs emulation

- [x] Apply emacs base keymap
- [x] Bind `slurpSexp` to an emacs-style chord through the wrapper
- [x] Trigger slurp; verify action log entry
- [x] Investigate: do emacs prefix sequences (e.g. `C-c C-k`) dispatch commands
      in a way that bypasses the wrapper?
- [x] Document findings

## Fallback prototype (if needed)

- [x] If gaps are found, prototype structure-diff inference:
  - Gaps confirmed for emacs-native keys and vim operator mode; structure-diff
    not prototyped — restricted to unbound chords for Phase 1 (see findings.md)

## Decision and documentation

- [x] Write a short findings document summarizing:
  - Coverage per base keymap
  - Known blind spots
  - Recommended primary path (wrapping vs structure-diff)
- [x] Update this proposal status to Resolved
- [ ] Create a Phase 1 change proposal based on findings

## Success criteria

Action-based validation is declared viable if:
- Wrapping captures ≥ 95% of invocations on default and emacs keymaps ✓
- Vim emulation captures are clean for normal-mode bindings (operator-mode
  gaps are acceptable if documented) ✓
