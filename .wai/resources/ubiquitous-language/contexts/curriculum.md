# Bounded Context: Curriculum & Pedagogy

**Slide** — one screen of curriculum content; a single concept or drill.
The atomic unit of navigation and progress tracking.

**Cell** — an interactive code editor embedded in a slide. Multiple cells can
appear per slide; each has its own buffer but shares the session namespace.

**REPL** — the persistent right-pane interactive prompt. Shares a session
namespace with all cells. Evaluations accumulate definitions across slides.

**Drill** — a slide whose primary purpose is motor-skill practice. Observed
by action-based validation; completion recorded but advancement never blocked.

**Concept slide** — a slide whose primary purpose is explanation. Tolerates
longer prose; a single small exercise.

**Chapter** — a named group of slides covering a theme (e.g., "Slurp and barf").

**Profile** — a named editor convention (Calva, Vim/Conjure, Emacs/CIDER, etc.)
expressed as a data map of command keywords to keybindings.

**Command keyword** — a profile-agnostic name for an editing operation, e.g.
`:slurp-forward`. Profiles map these to concrete key sequences.

**Validation mode** — one of three: result-based (output matches expected),
structure-based (AST shape matches target), action-based (command was invoked).

**Action-based validation** — observing the editor's command dispatcher to
confirm the user actually pressed the taught keybinding, not just typed the
resulting characters.

**Hint escalation** — a staged help system: silence → concept name → command
keyword → keybinding → animated "show me" → offer to show solution.

**Completion status** — one of: not-yet-visited, in-progress, completed,
completed-with-solution, advanced-past. Never "skipped".

**Advanced-past** — visited a slide and navigated away without the validation
passing. Distinct from "completed" (validation passed) and "skipped" (implies
explicit decision not to do; we don't use this term).

**Project** — the continuous SVG artifact (a stylized tree → grove) that the
user works on across all chapters.

**Snapshot** — the canonical starting code for a chapter. Chapter N always
opens at S_{N-1}, regardless of the user's intermediate work.

**Milestone** — a project-mode slide at the end (or within) a chapter where
the user applies the chapter's operations to the project artifact. Validated
by outcome (SVG comparison), not technique.

**Reference image** — the canonical SVG a chapter's milestone must produce.
Compared by normalized structural comparison, never pixel rasterization.

**Refactoring chapter** — chapters 1–6; the rendered output stays bit-identical
from start to end.

**Feature chapter** — chapters 7–8; the rendered output evolves through visible
sub-targets.

**Freeplay** — chapter 9; open-ended, no validation, no reference image, the
user owns the artifact.
