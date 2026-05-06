# Bounded Context: Technical Architecture

**Squint** — the ClojureScript-like dialect used as the runtime. Compiles to
JavaScript, no JVM, small runtime, fast cold start. The user's code runs in
squint; the application itself is also written in squint.

**Session namespace** — the JS object accumulating `defn` and `def` definitions
across cell evaluations and REPL inputs within a session. Shared across all
cells and the REPL. Reset on profile switch.

**Profile resolution** — the process of walking a profile's `:extends` chain
and shallow-merging `:bindings` maps to produce a flat command-keyword →
keybinding-string map.

**Normalized SVG comparison** — parsing both SVGs into a tree, sorting element
attributes alphabetically, normalizing whitespace, then comparing structurally.
Never string equality, never pixel rasterization.

**clojure-mode** — `@nextjournal/clojure-mode`; the CodeMirror 6 extension
providing paredit operations, form navigation, and selection by form.

**CM6** — CodeMirror 6; the browser editor. Each cell and the REPL prompt is
a CM6 instance.

**Action log** — the per-cell in-memory record of CM6 commands dispatched
through the tutor's keymap wrapper. Read by action-based validation.

**`Mod` token** — a portable key modifier that resolves to `Cmd` on macOS
and `Ctrl` elsewhere, following CM6 conventions.
