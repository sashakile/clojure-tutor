# Spec: Action-Based Validation

**Capability**: action-validation
**Status**: Draft (pending Phase-0 spike resolution)

## Overview

Action-based validation observes the CodeMirror 6 command dispatcher to
confirm the user invoked a specific editing command (e.g., `:slurp-forward`)
by pressing the taught keybinding — not merely that the resulting buffer state
matches a target.

This is the signature validation mode of the tutor: it enforces
"the keybinding is the lesson."

## ADDED Requirements

### REQ-AV-01: Command observation via wrapping

The tutor registers editing commands through a wrapper layer that records each
invocation to a per-cell, in-memory action log.

#### Scenario: User presses the slurp keybinding

Given a cell with the Calva profile active,
When the user presses `Ctrl-Shift-Right` (`:slurp-forward`),
Then the action log for that cell records `{command: :slurp-forward, at: <timestamp>}`,
And the editor state updates as expected (the form is slurped).

#### Scenario: User types characters that produce the same buffer state

Given a cell configured for action-based validation of `:slurp-forward`,
When the user manually types closing parentheses to produce the same code state,
Then the action log does NOT record a `:slurp-forward` entry,
And the validation check FAILS (action was not observed).

### REQ-AV-02: Per-cell action log

Each cell maintains its own action log. Action log entries from one cell do
not count toward validation of a different cell.

### REQ-AV-03: Validation predicate

A validation rule of the form:
```clojure
{:mode :action
 :require {:command :slurp-forward :min-invocations 1}}
```
passes if and only if the cell's action log contains at least `:min-invocations`
entries for the specified command keyword.

### REQ-AV-04: Coverage across base keymaps

The wrapper captures invocations across all three supported base keymaps:
default CM6, vim emulation (`@replit/codemirror-vim`), and emacs emulation.

Known gaps (if any) are documented per profile and surfaced in the profile's
metadata, not silently ignored.

### REQ-AV-05: Fallback degraded mode

If wrapping cannot cleanly capture invocations for a base keymap, the system
falls back to structure-diff inference: comparing before/after document
snapshots to infer the command. This mode is less reliable and is surfaced to
the user as "approximate" validation.

## Dependencies

- Phase-0 spike must resolve feasibility before REQ-AV-04 can be finalized.
