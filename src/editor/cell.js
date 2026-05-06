import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { default_extensions, paredit_keymap } from "@nextjournal/clojure-mode";
import { vim } from "@replit/codemirror-vim";
import { emacs } from "@replit/codemirror-emacs";
import { create as createLog } from "../validation/action-log.js";
import { defaultProfile } from "./profiles/default.js";
import { vimProfile } from "./profiles/vim.js";
import { emacsProfile } from "./profiles/emacs.js";

export const ACTIVE_PROFILE = "default";

const slurpEntry = paredit_keymap.find((k) => k.doc && k.doc.includes("Expand collection"));
if (!slurpEntry?.run) throw new Error("slurpSexp not found in paredit_keymap");

const PROFILE_BINDINGS = {
  default: [{ key: "Ctrl-ArrowRight", command: slurpEntry.run, label: "slurp-forward" }],
  vim: [{ motionKey: ">", command: slurpEntry.run, label: "slurp-forward" }],
  emacs: [{ key: "F5", command: slurpEntry.run, label: "slurp-forward" }],
};

export function createCell(parent, { onEval, profile = ACTIVE_PROFILE } = {}) {
  // Action log must be created before any profile binding extensions are attached (D2).
  const log = createLog();

  const bindings = PROFILE_BINDINGS[profile] || PROFILE_BINDINGS.default;
  let profileExts;
  switch (profile) {
    case "vim":
      profileExts = [vim(), ...vimProfile(bindings, log)];
      break;
    case "emacs":
      profileExts = [emacs(), ...emacsProfile(bindings, log)];
      break;
    default:
      profileExts = [defaultProfile(bindings, log)];
  }

  const evalKeymap = onEval
    ? keymap.of([{ key: "Mod-Enter", run: (view) => { onEval(view); return true; } }])
    : [];

  const view = new EditorView({
    state: EditorState.create({
      extensions: [
        ...profileExts,
        evalKeymap,
        keymap.of([...defaultKeymap, indentWithTab]),
        ...default_extensions,
      ],
    }),
    parent,
  });

  view.actionLog = log;
  return view;
}
