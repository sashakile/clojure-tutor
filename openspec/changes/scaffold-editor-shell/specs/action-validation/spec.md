## ADDED Requirements

### Requirement: Action Log Lifecycle
The action log SHALL be a per-cell object created on cell initialization, keyed
by Clojure keyword (e.g. `:slurp-forward`), and cleared when the active profile
changes.

#### Scenario: Log created on cell init
- **WHEN** a CM6 cell is initialized
- **THEN** an empty action log is created and attached to the cell

#### Scenario: Log cleared on profile switch
- **WHEN** the active profile changes
- **THEN** the action log for all cells is cleared

#### Scenario: Log entries readable
- **WHEN** one or more commands have been triggered
- **THEN** `actionLog.entries()` returns the ordered list of command keywords

### Requirement: Command Wrapper Integration
The command wrapper SHALL be integrated into each profile's binding setup so
that every profile-bound command appends its keyword to the cell's action log.

#### Scenario: Default profile command logged
- **WHEN** a user triggers a `keymap.of`-bound command in the default profile
- **THEN** the command's Clojure keyword is appended to the action log

#### Scenario: Vim normal-mode command logged
- **WHEN** a user triggers a `Vim.defineAction`-bound command in normal mode
- **THEN** the command's Clojure keyword is appended to the action log

#### Scenario: Emacs chord command logged
- **WHEN** a user triggers an `EmacsHandler.addCommands`-bound chord
- **THEN** the command's Clojure keyword is appended to the action log

#### Scenario: Declined command not logged
- **WHEN** a command's CM6 handler returns `false`
- **THEN** no entry is appended to the action log

### Requirement: Profile Binding Setup
The profile system SHALL set up mode-specific bindings using the patterns
validated in Phase 0.

#### Scenario: Default profile binding pattern
- **WHEN** the active profile is `"default"`
- **THEN** each structural command is bound via `keymap.of([{ key, run: wrapCommand(...) }])`

#### Scenario: Vim profile binding pattern
- **WHEN** the active profile is `"vim"`
- **THEN** each structural command is registered via `Vim.defineAction("clt-<name>", ...)` and mapped via `Vim.mapCommand` in normal-mode context

#### Scenario: Emacs profile binding pattern
- **WHEN** the active profile is `"emacs"`
- **THEN** each structural command is registered via `EmacsHandler.addCommands` and bound via `bindKey` to an unbound chord (`C-.`, `C-,`, or `F5`–`F12`)
