## ADDED Requirements

### Requirement: Compile and Eval on Mod-Enter
The pipeline SHALL compile the cell's current content with squint and evaluate
it in the browser when the user presses `Mod-Enter`.

#### Scenario: Successful eval
- **WHEN** the user presses Mod-Enter with valid Clojure-like code
- **THEN** the output pane displays the evaluation result

#### Scenario: Compile error displayed
- **WHEN** the user presses Mod-Enter with code that squint cannot compile
- **THEN** the output pane displays the squint compile error message

#### Scenario: Runtime error displayed
- **WHEN** the user presses Mod-Enter with code that throws at runtime
- **THEN** the output pane displays the runtime error

### Requirement: Persistent Session Namespace
The pipeline SHALL accumulate `def` and `defn` definitions across evaluations
within a session so that names defined in earlier evals are available in later ones.

#### Scenario: Definition available after eval
- **WHEN** a `(def x 42)` is evaluated
- **THEN** a subsequent eval of `x` returns `42`

#### Scenario: Namespace cleared on profile switch
- **WHEN** the active profile changes
- **THEN** all previously defined names are removed from the session namespace

### Requirement: Storage Abstraction
All persistent state (progress, profile preference) SHALL be read and written
through a single `getStorage()` helper. Application code MUST NOT call
`localStorage` or `window.storage` directly.

#### Scenario: Widget environment
- **WHEN** `window.storage` is defined (Anthropic widget env)
- **THEN** `getStorage()` returns `window.storage`

#### Scenario: Standalone deploy
- **WHEN** `window.storage` is not defined
- **THEN** `getStorage()` returns `localStorage`
