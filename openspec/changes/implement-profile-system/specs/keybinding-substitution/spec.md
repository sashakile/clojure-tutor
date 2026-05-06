## ADDED Requirements

### Requirement: Keybinding placeholder format

Any DOM element with a `data-command` attribute SHALL be treated as a keybinding
placeholder by `renderKeybindings`. Block-level and inline elements are both
valid carriers (e.g., `<kbd data-command="slurp-forward">`). The attribute
value SHALL be a command keyword string without the leading colon.

Placeholders are inert HTML until `renderKeybindings` is called; their initial
text content has no specified value.

#### Scenario: Inline placeholder

- **WHEN** lesson prose contains `<kbd data-command="slurp-forward">`
- **AND** `renderKeybindings` has been called on the containing element
- **THEN** the `<kbd>` displays the active profile's keybinding for `slurp-forward`

#### Scenario: Multiple placeholders in one container

- **WHEN** a container holds `<kbd data-command="slurp-forward">` and
  `<kbd data-command="barf-forward">`
- **AND** `renderKeybindings` is called
- **THEN** each element displays its respective keybinding

### Requirement: Keybinding resolution

`renderKeybindings(container)` SHALL:
1. Query all `[data-command]` descendant elements of `container`
2. For each element, call `resolveBindings(getActiveProfile())` and look up the
   command keyword
3. Set the element's `textContent` to the resolved keybinding string
4. If the command keyword is not present in the resolved bindings, set
   `textContent` to the command keyword string itself (graceful fallback)

`renderKeybindings` SHALL NOT throw on an empty container or zero placeholders.

#### Scenario: Known command resolved

- **WHEN** the active profile binds `"slurp-forward"` to `"Ctrl-Right"`
- **AND** `renderKeybindings` is called on a container with
  `<kbd data-command="slurp-forward">`
- **THEN** the element's text content is `"Ctrl-Right"`

#### Scenario: Unknown command falls back

- **WHEN** the active profile has no binding for `"wrap-round"`
- **AND** `renderKeybindings` is called on a container with
  `<kbd data-command="wrap-round">`
- **THEN** the element's text content is `"wrap-round"`

#### Scenario: Empty container is a no-op

- **WHEN** `renderKeybindings` is called on a container with no `[data-command]` elements
- **THEN** no error is thrown

### Requirement: Reactive keybinding updates

`renderKeybindings(container)` SHALL subscribe to profile state changes via
`onProfileChange`. On each profile change, it SHALL re-resolve all
`[data-command]` descendants of `container` and update their `textContent`.
`renderKeybindings` SHALL be idempotent on the same container: calling it
twice SHALL NOT register duplicate subscriptions.

The subscription SHALL remain active for the lifetime of the container. If the
container is removed from the DOM, the subscription need not be cleaned up in
Phase 2.

#### Scenario: Placeholders update on profile switch

- **WHEN** `renderKeybindings` has been called on a container
- **AND** the user switches from profile `"default"` to `"calva"`
- **AND** the two profiles have different keybindings for `"slurp-forward"`
- **THEN** all `<[data-command="slurp-forward"]>` elements show the Calva keybinding

#### Scenario: Update reflects new profile immediately

- **WHEN** `setActiveProfile("vim")` is called
- **THEN** keybinding placeholders are updated before the next animation frame

### Requirement: Fixture slide

Phase 2 SHALL include a synthetic fixture slide section (`src/lesson/fixture.js`)
that demonstrates keybinding substitution end-to-end without a lesson runner.
The fixture SHALL contain:
- At least two `data-command` keybinding placeholders referencing different operations
- Prose text surrounding the placeholders
- One CM6 cell (to verify that cell re-initialization on profile switch
  coexists with keybinding substitution in the same fixture)

The fixture SHALL mount above the two-pane editor layout and call
`renderKeybindings` on itself on mount.

#### Scenario: Fixture shows correct keys on load

- **WHEN** the shell mounts with default profile
- **THEN** the fixture slide displays the default profile's keybinding strings
  in its placeholder elements

#### Scenario: Fixture updates on profile switch

- **WHEN** the user switches to the Calva profile via the profiles panel
- **THEN** the fixture slide's keybinding placeholders update to Calva's keybindings
