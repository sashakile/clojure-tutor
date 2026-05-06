## ADDED Requirements

### Requirement: Profile-aware leader key

The system SHALL install a window-level `keydown` listener that intercepts a
leader key determined by the active profile's `leader` field. Two interception
modes apply:

**Focus-gated mode** (profiles with `leader !== " "`): the leader key is only
intercepted when no descendant of any `.cm-editor` element holds focus. If a
CM6 editor is focused, the event is NOT intercepted and the editor receives it
normally.

**Vim-mode-aware mode** (any profile with `leader: " "`): the Space key is
intercepted when the focused editor is not in insert mode. Insert mode is
determined by locating the CM6 EditorView for the focused `.cm-editor` element
(via `document.activeElement.closest(".cm-editor")` and the
`EditorView.findFromDOM` API) and checking its internal vim state. If insert-
mode status is undetectable (field absent or no focused editor), the system
SHALL log a console warning and NOT intercept (fail safe). This gate applies to
any Space-leader profile: future profiles using Space (e.g., Doom Emacs) that
lack a modal editor state will consistently trigger the fail-safe.

When the leader IS intercepted, the handler SHALL call both
`event.stopPropagation()` and `event.preventDefault()`.

#### Scenario: `g` leader fires when editor not focused

- **WHEN** the active profile has `leader: "g"`
- **AND** no CM6 editor has focus
- **AND** the user presses `g`
- **THEN** the which-key overlay is shown

#### Scenario: `g` leader does not fire inside editor

- **WHEN** the active profile has `leader: "g"`
- **AND** a CM6 editor has focus
- **AND** the user presses `g`
- **THEN** the editor receives the `g` keypress normally
- **AND** the which-key overlay is NOT shown

#### Scenario: Space leader fires in vim normal mode

- **WHEN** the active profile is `"vim"`
- **AND** the vim editor is in normal mode
- **AND** the user presses Space
- **THEN** the which-key overlay is shown
- **AND** the editor does NOT advance the cursor

#### Scenario: Space leader does not fire in vim insert mode

- **WHEN** the active profile is `"vim"`
- **AND** the vim editor is in insert mode
- **AND** the user presses Space
- **THEN** the editor receives the Space and inserts a space character
- **AND** the which-key overlay is NOT shown

### Requirement: Which-key hint overlay

After the leader key is intercepted, the system SHALL display a floating
overlay listing available chord completions. Each entry SHALL be rendered as
`{key} — {label}`. The overlay SHALL be dismissed (hidden) when the user presses
`Escape` or a key not in the completion list. Recognized chord keys SHALL
trigger their registered navigation action and dismiss the overlay.

The overlay SHALL not steal focus from the editor. After a chord key dispatches
its action, focus management is the responsibility of the action's target
(e.g., the profiles panel SHALL take focus per its own requirement).

#### Scenario: Overlay shown after leader

- **WHEN** the leader key is intercepted
- **THEN** the which-key overlay becomes visible
- **AND** it lists at least `p — profiles`

#### Scenario: Overlay dismissed by Escape

- **WHEN** the which-key overlay is visible
- **AND** the user presses `Escape`
- **THEN** the overlay is hidden
- **AND** no navigation action is triggered

#### Scenario: Overlay dismissed by unrecognized key

- **WHEN** the which-key overlay is visible
- **AND** the user presses a key not in the completion list
- **THEN** the overlay is hidden
- **AND** no navigation action is triggered

#### Scenario: Recognized chord triggers action

- **WHEN** the which-key overlay is visible
- **AND** the user presses `p`
- **THEN** the profiles panel opens
- **AND** the overlay is hidden

### Requirement: Profiles panel

The system SHALL provide a left-side slide-in panel that lists all registered
profiles. The active profile SHALL be visually distinguished (e.g., bold text
and/or an `aria-current="true"` attribute). Selecting a profile entry SHALL
call `setActiveProfile(id)` and close the panel.

The panel SHALL open when the user presses `[leader] p` via the which-key
layer. The panel SHALL close when the user presses `Escape` or activates a
profile entry. The panel SHALL overlay the editor without pushing or resizing
it (no layout shift).

When the panel opens, focus SHALL move to the panel (the active profile entry,
or the first entry if the active entry is not visible). The panel SHALL support
arrow-key navigation between entries. `Enter` SHALL activate the focused entry.
`Escape` SHALL close the panel and restore focus to its prior location.

#### Scenario: Panel opens on leader-p

- **WHEN** the user presses the leader key followed by `p`
- **THEN** the profiles panel slides into view from the left

#### Scenario: Active profile highlighted

- **WHEN** the profiles panel is open
- **THEN** the active profile entry is visually distinguished
- **AND** its element has `aria-current="true"`

#### Scenario: Selecting a profile switches and closes

- **WHEN** the profiles panel is open
- **AND** the user activates a profile entry (click or Enter)
- **THEN** `setActiveProfile` is called with that profile's ID
- **AND** the panel closes

#### Scenario: Panel closes on Escape

- **WHEN** the profiles panel is open
- **AND** the user presses `Escape`
- **THEN** the panel closes without changing the active profile

#### Scenario: No layout shift

- **WHEN** the profiles panel opens
- **THEN** the editor and output panes do not resize or shift
