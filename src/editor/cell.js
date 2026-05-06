import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { default_extensions, paredit_keymap } from "@nextjournal/clojure-mode";
import { vim } from "@replit/codemirror-vim";
import { emacs } from "@replit/codemirror-emacs";
import { create as createLog } from "../validation/action-log.js";
import { getActiveProfile } from "../profiles/state.js";
import { resolveBindings } from "../profiles/resolve.js";
import { defaultProfile } from "./profiles/default.js";
import { vimProfile } from "./profiles/vim.js";
import { emacsProfile } from "./profiles/emacs.js";

const COMMANDS = commandMapFromParedit();

function commandMapFromParedit() {
  const byDoc = (text) => {
    const entry = paredit_keymap.find((k) => k.doc && k.doc.includes(text));
    if (!entry?.run) throw new Error(`Paredit command not found: ${text}`);
    return entry.run;
  };

  return {
    "slurp-forward": byDoc("Expand collection to include form to the right"),
    "barf-forward": byDoc("Shrink collection forwards"),
    "barf-backward": byDoc("Shrink collection backwards"),
    "slurp-backward": byDoc("Grow collection backwards"),
    "splice-sexp": byDoc("Lift contents of collection into parent"),
  };
}

function bindingEntries(bindings) {
  return Object.entries(bindings)
    .map(([commandKeyword, key]) => {
      const label = commandKeyword.startsWith(":")
        ? commandKeyword.slice(1)
        : commandKeyword;
      const command = COMMANDS[label];
      if (!command) return null;
      return { key, motionKey: key, command, label };
    })
    .filter(Boolean);
}

function profileKindFromBindings(bindings) {
  if (bindings["slurp-forward"] === ">" || bindings[":slurp-forward"] === ">") {
    return "vim";
  }

  if (bindings["slurp-forward"] === "F5" || bindings[":slurp-forward"] === "F5") {
    return "emacs";
  }

  return "default";
}

function profileExtensions(bindings, log) {
  const entries = bindingEntries(bindings);
  const profileKind = profileKindFromBindings(bindings);

  switch (profileKind) {
    case "vim":
      return [vim(), ...vimProfile(entries, log)];
    case "emacs":
      return [emacs(), ...emacsProfile(entries, log)];
    default:
      return [defaultProfile(entries, log)];
  }
}

export function createCell(parent, { onEval, bindings = resolveBindings(getActiveProfile()) } = {}) {
  let currentBindings = bindings;
  let view;
  let actionLog;

  const evalKeymap = onEval
    ? keymap.of([{ key: "Mod-Enter", run: (editorView) => { onEval(editorView); return true; } }])
    : [];

  function mount(doc = "") {
    // Action log must be created before any profile binding extensions are attached (D2).
    actionLog = createLog();
    view = new EditorView({
      state: EditorState.create({
        doc,
        extensions: [
          ...profileExtensions(currentBindings, actionLog),
          evalKeymap,
          keymap.of([...defaultKeymap, indentWithTab]),
          ...default_extensions,
        ],
      }),
      parent,
    });
    view.actionLog = actionLog;
    return view;
  }

  mount();

  return {
    get view() { return view; },
    get state() { return view.state; },
    get dom() { return view.dom; },
    get contentDOM() { return view.contentDOM; },
    get actionLog() { return actionLog; },
    dispatch(...args) { return view.dispatch(...args); },
    focus() { return view.focus(); },
    reinitProfile(nextBindings) {
      currentBindings = nextBindings;
      const doc = view.state.doc.toString();
      view.destroy();
      return mount(doc);
    },
  };
}
