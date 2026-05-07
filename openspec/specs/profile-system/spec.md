# profile-system Specification

## Purpose
TBD - created by archiving change implement-profile-system. Update Purpose after archive.
## Requirements
### Requirement: Profile data schema

A profile SHALL be a JS object with the following fields:
- `id` (string): unique identifier (e.g., `"calva"`)
- `label` (string): human-readable name (e.g., `"Calva"`)
- `leader` (string): the which-key leader key for this profile (e.g., `"g"` or `" "`)
- `bindings` (object): map of command keyword strings (e.g., `"slurp-forward"`) to keybinding strings (e.g., `"Ctrl-Right"`)
- `extends` (string, optional): the `id` of a parent profile whose `bindings` are inherited

> **Command keyword forms**: command keywords appear in two representations.
> The plain string form (`"slurp-forward"`) is used in profile `bindings` maps
> and `data-command` attributes. The colon-prefixed EDN keyword form
> (`:slurp-forward`) is used in the action log. These are the same semantic
> concept in different serializations.

Profiles SHALL NOT contain logic or functions; they are pure data objects.
The profile registry (`src/profiles/registry.js`) SHALL export all built-in
profiles indexed by `id`.

#### Scenario: Profile with no parent

- **WHEN** a profile object has no `extends` field
- **THEN** its `bindings` map is used as-is by `resolveBindings`

#### Scenario: Profile with extends

- **WHEN** a profile object has `extends: "default"`
- **THEN** its `bindings` map is merged with the parent's bindings
- **AND** the child's keys take precedence over the parent's keys for the same command

#### Scenario: Unknown profile ID

- **WHEN** `setActiveProfile` is called with an ID not found in the registry
- **THEN** the call is a no-op and the active profile does not change

### Requirement: Profile resolution

`resolveBindings(profileId)` SHALL return a flat object mapping every command
keyword reachable via the profile's `extends` chain to a keybinding string.
Child bindings take precedence over parent bindings for duplicate command
keywords. The function SHALL NOT mutate the registry or any profile object.
If `profileId` is not present in the registry, `resolveBindings` SHALL return
an empty object and SHALL NOT throw.
The `extends` chain SHALL be acyclic. If a cycle is detected, `resolveBindings`
SHALL throw a descriptive error.

#### Scenario: Flat resolution

- **WHEN** `resolveBindings("default")` is called
- **AND** the default profile has `{ "slurp-forward": "Ctrl-ArrowRight" }`
- **THEN** the result contains `{ "slurp-forward": "Ctrl-ArrowRight" }`

#### Scenario: Inheritance

- **WHEN** `resolveBindings("calva")` is called
- **AND** calva extends default, overriding only `"slurp-forward"`
- **THEN** the result contains calva's `"slurp-forward"` value
- **AND** all other default bindings are present in the result

#### Scenario: Child override takes precedence

- **WHEN** both parent and child define `"slurp-forward"`
- **THEN** the resolved map contains the child's keybinding string

### Requirement: Calva profile

The registry SHALL include a `"calva"` profile whose `bindings` map contains
keybinding strings matching Calva's default VS Code Paredit keybindings for all
structural editing operations covered in Phase 1–6 (at minimum `slurp-forward`
and `barf-forward`). Keybinding strings SHALL use CM6 key notation
(e.g., `"Ctrl-Right"`).

#### Scenario: Calva slurp key

- **WHEN** `resolveBindings("calva")` is called
- **THEN** the result contains a `"slurp-forward"` entry with Calva's actual keybinding

#### Scenario: Calva barf key

- **WHEN** `resolveBindings("calva")` is called
- **THEN** the result contains a `"barf-forward"` entry with Calva's actual keybinding

### Requirement: Active-profile reactive state

A state module SHALL expose:
- `getActiveProfile()` — returns the current profile ID string
- `setActiveProfile(id)` — updates the active profile and notifies subscribers;
  SHALL be a no-op if `id === getActiveProfile()`
- `onProfileChange(fn)` — registers `fn` as a subscriber; returns an unsubscribe
  function that, when called, removes `fn` from future notifications

Subscribers SHALL be called synchronously after `setActiveProfile` updates the
stored value.

#### Scenario: Initial state

- **WHEN** the module is first loaded
- **THEN** `getActiveProfile()` returns `"default"`

#### Scenario: Subscriber notification

- **WHEN** `setActiveProfile("calva")` is called
- **THEN** all registered subscribers are called with `"calva"` as the argument

#### Scenario: No-op on same ID

- **WHEN** `setActiveProfile` is called with the current active profile ID
- **THEN** no subscribers are notified

#### Scenario: Unsubscribe

- **WHEN** the unsubscribe function returned by `onProfileChange(fn)` is called
- **THEN** `fn` is NOT called on subsequent `setActiveProfile` calls

### Requirement: Profile switch effects

On a profile switch (i.e., `setActiveProfile` with a new ID), the system SHALL:
1. Re-initialize all registered cells' CM6 keymap extensions with the new
   profile's resolved bindings
2. Reset the session namespace (`resetSession()`)
3. Clear all registered cells' action logs (`cell.actionLog.clear()`)

Effects SHALL be applied in the order listed above. The existing document
content of each cell SHALL be preserved across the re-initialization.
If any effect throws, the active profile ID SHALL be reverted to its prior
value and the error SHALL be re-thrown (atomic switch semantics).

#### Scenario: Action log cleared on switch

- **WHEN** `:slurp-forward` has been recorded in a cell's action log
- **AND** `setActiveProfile("calva")` is called
- **THEN** `cell.actionLog.entries()` returns an empty array

#### Scenario: Session reset on switch

- **WHEN** `(def x 42)` has been evaluated and `x` is in the session namespace
- **AND** `setActiveProfile("calva")` is called
- **THEN** evaluating `x` returns an unbound error

#### Scenario: Document content preserved

- **WHEN** the cell contains code text
- **AND** `setActiveProfile("calva")` is called
- **THEN** the cell still displays the same code text after re-initialization

