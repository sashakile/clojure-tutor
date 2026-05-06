# Project Context

## Purpose

A zero-install, browser-based tutor that teaches structural editing of Lisp
code — specifically Clojure, evaluated through the squint dialect — through
progressive, learn-by-doing lessons. No installation, no JVM, no backend; a
URL is the entire onboarding.

The distinguishing pedagogical commitment: **the keybinding is the lesson**.
Users learn by pressing the keys their chosen editor profile (Calva,
Vim/Conjure, Emacs/CIDER, Doom Emacs, Spacemacs, Helix) actually uses,
building muscle memory that transfers directly to their real editor.

## Tech Stack

- **Language**: squint (ClojureScript-like, compiles to JS, no JVM)
- **UI**: squint + React (via squint's React interop)
- **Editor**: CodeMirror 6 + `@nextjournal/clojure-mode` (paredit operations)
- **Vim emulation**: `@replit/codemirror-vim`
- **Emacs emulation**: `@codemirror/keymap-emacs`
- **Build**: Vite + squint-cljs
- **Persistence**: `localStorage` (standalone) / `window.storage` (widget env)

## Project Conventions

### Code Style

- Squint/ClojureScript idioms throughout; no raw JS except interop boundaries
- EDN data for curriculum, profiles, progress schema
- Kebab-case for Clojure identifiers; camelCase only at JS interop boundaries
- No floating-point coordinates; integer arithmetic throughout (SVG project)
- `Mod` token for cross-platform keys (resolves to `Cmd`/`Ctrl`)

### Architecture Patterns

- **Data-driven**: profiles, lessons, curricula are EDN data maps, not code
- **Profile-agnostic vocabulary**: command keywords (`:slurp-forward`) decouple
  lessons from concrete keybindings
- **Shallow-merge inheritance**: profiles extend parents via `:extends` chain
- **Session namespace**: flat JS object accumulating definitions; reset on
  profile switch
- **Non-gating validation**: advancement never blocked; completion is visible
  feedback, not a gate

### Testing Strategy

- Phase 0 spike drives the testing strategy for action-based validation
- Integration tests for squint compile → eval pipeline
- Normalized SVG structural comparison for milestone validation (no pixel diff)
- Integer coordinates eliminate floating-point comparison edge cases

### Git Workflow

- Feature branches; PRs via GitHub
- Conventional commits (feat/fix/refactor/docs/chore)
- Each phase (0–9) is a natural branch boundary
- Issue tracking via `bd` (prefix: CLT)

## Domain Context

**Structural editing** manipulates code as forms (trees), not characters.
Core operations: slurp, barf, raise, splice, wrap, transpose. The tutor
teaches both the operations and the exact keybindings of real editors.

**Three validation modes** (used independently or combined per slide):
1. **Result-based** — run code, compare output
2. **Structure-based** — parse code, compare AST shape
3. **Action-based** — observe CM6 command dispatcher, confirm specific command
   was invoked (not just the resulting text state)

**Completion status** (three states, never "skipped"):
- `completed` — validation passed
- `advanced-past` — visited, moved on without completing
- `completed-with-solution` — user invoked "show me"

**The project artifact**: a stylized SVG tree (→ grove). Chapters 1–6 are
refactoring (picture stays identical); chapters 7–8 are feature work; chapter
9 (Freeplay) is open-ended. SVG milestone validation uses normalized
structural comparison — attribute-sorted, whitespace-normalized, strict.

See `.wai/resources/ubiquitous-language/` for the full domain glossary.

## Important Constraints

- **Zero-install**: everything runs in the browser; no server, no JVM
- **Integer coordinates only**: SVG project uses a 1000×1000 viewBox with
  integer arithmetic to enable strict normalized comparison
- **Squint vs JVM Clojure**: squint uses native JS numbers (no rationals);
  documented as a deliberate tutor simplification
- **Non-gating navigation**: Next is never disabled; validation is feedback,
  not a gate (§3.5 of spec)
- **Curated curriculum only (v1)**: user-submitted lessons deferred pending
  sandboxed evaluation (Web Worker isolation)
- **Physical keyboard required**: mobile not a target; pedagogy presupposes keys

## External Dependencies

- `@nextjournal/clojure-mode` — CM6 structural editing extension (critical path)
- `squint-cljs` — in-browser Clojure-like compiler (runtime)
- `@replit/codemirror-vim` — Vim emulation for CM6
- `vite` — build tool
- `bd` (beads) — issue tracker (prefix CLT, Dolt-backed)
- `openspec` — change proposal system
