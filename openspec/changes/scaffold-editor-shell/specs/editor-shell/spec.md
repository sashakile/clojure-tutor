## ADDED Requirements

### Requirement: Two-Pane Layout
The shell SHALL render a two-pane layout with the editor pane on the left and
the output pane on the right, filling the viewport with no overflow.

#### Scenario: Initial render
- **WHEN** the application loads
- **THEN** both the editor pane and the output pane are visible

#### Scenario: Viewport fill
- **WHEN** the application loads
- **THEN** the layout fills 100% of the viewport height and width with no scrollbar

### Requirement: CM6 Cell Initialization
The shell SHALL initialize a single CodeMirror 6 cell with
`@nextjournal/clojure-mode` and the active profile's keymap extension on mount.

#### Scenario: Cell focused on load
- **WHEN** the shell mounts
- **THEN** the CM6 editor is focused and ready for keyboard input

#### Scenario: Profile keymap active
- **WHEN** `ACTIVE_PROFILE` is `"default"`, `"vim"`, or `"emacs"`
- **THEN** the corresponding keymap extension is loaded into the cell's extension set

### Requirement: Active Profile Constant
The shell SHALL read the active profile from a compile-time `ACTIVE_PROFILE`
constant; no UI profile selector is required for Phase 1.

#### Scenario: Default profile
- **WHEN** `ACTIVE_PROFILE` is not set
- **THEN** the shell initializes with the `"default"` profile
