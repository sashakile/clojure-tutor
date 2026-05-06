import { CALVA_BINDINGS } from "../calva.js";

function bindingsByKeyword(bindings) {
  return Object.fromEntries(
    bindings.map(({ label, key }) => [`:${label}`, key])
  );
}

// Calva bindings are sourced from BetterThanTomorrow/calva package.json
// contributes.keybindings (fetched 2026-05-06) via src/calva.js. Keep Calva
// flat rather than extending default: these are explicit VS Code Paredit
// defaults, not fallbacks to CodeMirror's built-in paredit keymap.
export const DEFAULT_PROFILE = {
  id: "default",
  label: "Default",
  leader: "g",
  bindings: {
    ":slurp-forward": "Ctrl-ArrowRight",
  },
};

export const CALVA_PROFILE = {
  id: "calva",
  label: "Calva",
  leader: "g",
  bindings: bindingsByKeyword(CALVA_BINDINGS),
};

export const VIM_PROFILE = {
  id: "vim",
  label: "Vim / Conjure",
  leader: "Space",
  bindings: {
    ":slurp-forward": ">",
  },
};

export const EMACS_PROFILE = {
  id: "emacs",
  label: "Emacs / CIDER",
  leader: "g",
  bindings: {
    ":slurp-forward": "F5",
  },
};

export const PROFILES = {
  [DEFAULT_PROFILE.id]: DEFAULT_PROFILE,
  [CALVA_PROFILE.id]: CALVA_PROFILE,
  [VIM_PROFILE.id]: VIM_PROFILE,
  [EMACS_PROFILE.id]: EMACS_PROFILE,
};
