# Spec: Action-Based Validation

**Capability**: action-validation
**Status**: Active

## Purpose

Action-based validation observes the CodeMirror 6 command dispatcher to
confirm the user invoked a specific editing command (e.g., `:slurp-forward`)
by pressing the taught keybinding — not merely that the resulting buffer state
matches a target. This is the signature validation mode of the tutor: it
enforces "the keybinding is the lesson."
## Requirements

Requirements are populated from change proposals below.

### Requirement: Command observation via wrapping

The tutor SHALL register editing commands through a proxy wrapper that appends
`{command, timestamp}` entries to a per-cell action log on each invocation,
without affecting the command's return value or editor-state side effects.

#### Scenario: Keybinding triggers wrapper

- **WHEN** the user presses the `:slurp-forward` keybinding in a cell
- **THEN** the cell's action log records one entry for `:slurp-forward`
- **AND** the editor state reflects the slurp (form boundaries updated)

#### Scenario: Manual text edit does not trigger wrapper

- **WHEN** the user types characters that reproduce the same code state
  without pressing the taught keybinding
- **THEN** the action log does NOT contain a `:slurp-forward` entry
- **AND** action-based validation for that command FAILS

### Requirement: Per-cell isolation

Each cell SHALL maintain its own action log; entries in one cell SHALL NOT
satisfy action-based validation requirements of a different cell.

#### Scenario: Slurp in cell 1 only

- **WHEN** a slide has two cells both requiring `:slurp-forward`
- **AND** the user performs slurp only in cell 1
- **THEN** cell 1's action-based validation passes
- **AND** cell 2's action-based validation fails

### Requirement: Min-invocations predicate

The system SHALL evaluate a validation rule
`{:mode :action :require {:command :kw :min-invocations N}}`
as passing if and only if the cell's action log contains at least N entries
for command keyword `:kw`.

#### Scenario: Threshold met

- **WHEN** a drill requires `:slurp-forward` with `min-invocations 3`
- **AND** the user presses the slurp keybinding 3 times
- **THEN** the action-based check passes

#### Scenario: Threshold not met

- **WHEN** the user presses the slurp keybinding only 2 times
- **THEN** the action-based check does not pass

### Requirement: Cross-keymap coverage

The wrapper SHALL capture invocations on the default CM6 keymap, vim
emulation (`@replit/codemirror-vim`), and emacs emulation. Known gaps
SHALL be documented per profile and SHALL NOT silently pass validation.

#### Scenario: Default keymap capture

- **WHEN** `:slurp-forward` is bound via the default CM6 keymap
- **AND** the user presses the binding
- **THEN** one action log entry is recorded

#### Scenario: Vim normal-mode capture

- **WHEN** `:slurp-forward` is bound to a normal-mode key under vim emulation
- **AND** the user presses the key in normal mode
- **THEN** one action log entry is recorded

#### Scenario: Emacs chord capture

- **WHEN** `:slurp-forward` is bound to a chord under emacs emulation
- **AND** the user completes the chord
- **THEN** one action log entry is recorded

### Requirement: Structure-diff fallback

When a coverage gap is confirmed for a base keymap, the system SHALL provide
a structure-diff inference fallback that compares before/after document
snapshots to infer the command. This mode SHALL be surfaced as approximate.

#### Scenario: Fallback active for partial-coverage keymap

- **WHEN** a profile uses a base keymap with a documented coverage gap
- **AND** the user performs the teaching action
- **THEN** validation is attempted via structure-diff inference
- **AND** the result is labeled as approximate in the UI

## Notes

- Emacs keybinding restriction: only keys not claimed by EmacsHandler may be
  bound (e.g. `C-.`, `C-,`, `F5`–`F12`). Emacs intercepts claimed keys at the
  DOM level, bypassing even `Prec.highest` CM6 keymaps.
- Vim binding path: `Vim.defineAction` + `Vim.mapCommand` (not `keymap.of`).
  Vim runs at `Prec.highest` internally.
- `:keyword`-format labels are JS strings in the form `":name"`. Coercion to
  real ClojureScript keywords happens at the Clojure validation layer.
