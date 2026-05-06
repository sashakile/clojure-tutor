# Tasks: phase-0-action-observation-spike

## Setup

- [ ] Initialize a minimal Vite project with squint + CodeMirror 6
- [ ] Install `@nextjournal/clojure-mode`, `@replit/codemirror-vim`,
      and an emacs keymap extension
- [ ] Implement a thin command-wrapper utility that:
  - Takes a CM6 `Command` function and a keyword label
  - Returns a wrapped command that records `{command: kw, at: timestamp}` to a
    mutable action log
  - Passes through the return value of the original command

## Spike: default keymap

- [ ] Register `slurpSexp` (or equivalent from clojure-mode) through the
      wrapper on the default CM6 keymap
- [ ] Manually trigger slurp via the keybinding in a test cell
- [ ] Verify the action log records one entry per keypress
- [ ] Verify the editor state changes correctly (i.e., wrapping didn't break
      the command's effect)

## Spike: vim emulation

- [ ] Apply `@replit/codemirror-vim` as the base keymap
- [ ] Bind `slurpSexp` to a vim normal-mode key through the wrapper
- [ ] Trigger slurp from normal mode; verify action log entry
- [ ] Investigate: does vim's operator queue or motion resolution call CM6
      commands in a way that bypasses the keymap registration?
- [ ] Document findings

## Spike: emacs emulation

- [ ] Apply emacs base keymap
- [ ] Bind `slurpSexp` to an emacs-style chord through the wrapper
- [ ] Trigger slurp; verify action log entry
- [ ] Investigate: do emacs prefix sequences (e.g. `C-c C-k`) dispatch commands
      in a way that bypasses the wrapper?
- [ ] Document findings

## Fallback prototype (if needed)

- [ ] If gaps are found, prototype structure-diff inference:
  - Before and after each keypress, snapshot the CM6 document
  - Diff the snapshots to infer which structural operation was performed
  - Assess: is the inferred-command set accurate enough for validation?

## Decision and documentation

- [ ] Write a short findings document summarizing:
  - Coverage per base keymap
  - Known blind spots
  - Recommended primary path (wrapping vs structure-diff)
- [ ] Update this proposal status to Resolved
- [ ] Create a Phase 1 change proposal based on findings

## Success criteria

Action-based validation is declared viable if:
- Wrapping captures ≥ 95% of invocations on default and emacs keymaps
- Vim emulation captures are clean for normal-mode bindings (operator-mode
  gaps are acceptable if documented)
