# Bounded Context: Structural Editing

**Form** — an s-expression; a Lisp atom or list. The fundamental unit of
structural editing. Never called "expression" in user-facing text.

**Slurp** — extend the boundary of the current form to include the next
adjacent form. Has `:slurp-forward` and `:slurp-backward` variants.

**Barf** — contract the boundary of the current form to exclude its last
(forward) or first (backward) child form. Inverse of slurp.

**Raise** — replace the parent form with the current child form, eliminating
one level of nesting.

**Splice** — remove the delimiters of the current form, merging its contents
into the parent. Like raise but keeps all children.

**Wrap** — surround an existing form with new delimiters. Three variants:
`:wrap-round` `()`, `:wrap-square` `[]`, `:wrap-curly` `{}`.

**Transpose** — swap the current form with the next sibling form.

**Convolute** — swap the inner form's parent with the inner form's grandparent.

**Kill form** — delete the current form and everything after it within the
parent.

**Paredit** — the family of structural-editing operations originating in Emacs.
Used as a category name, not a specific implementation.

**Structural editing** — manipulating code as forms (trees) rather than as
raw characters. The skill this tutor teaches.
