// Source: BetterThanTomorrow/calva package.json #contributes.keybindings (fetched 2026-05-06)
// raise-sexp uses a VS Code chord (ctrl+alt+p ctrl+alt+r); simplified to Ctrl-Alt-r for CM6
// slurp-forward / barf-forward have Linux variants (ctrl+alt+. and ctrl+alt+,) — using arrow key form

export const CALVA_BINDINGS = [
  { key: "Ctrl-Alt-ArrowRight", label: "slurp-forward" },
  { key: "Ctrl-Alt-Shift-ArrowLeft", label: "slurp-backward" },
  { key: "Ctrl-Alt-ArrowLeft", label: "barf-forward" },
  { key: "Ctrl-Alt-Shift-ArrowRight", label: "barf-backward" },
  { key: "Ctrl-Alt-r", label: "raise-sexp", note: "Calva uses chord ctrl+alt+p ctrl+alt+r; simplified to single key for CM6" },
  { key: "Ctrl-Alt-s", label: "splice-sexp" },
  { key: "Ctrl-Shift-s", label: "split-sexp" },
  { key: "Ctrl-Shift-j", label: "join-sexp" },
];
