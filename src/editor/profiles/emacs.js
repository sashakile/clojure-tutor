import { EmacsHandler } from "@replit/codemirror-emacs";
import { keymap } from "@codemirror/view";
import { wrapCommand } from "../../validation/command-wrapper.js";

// F5–F12 are browser-owned shortcuts (reload, devtools, etc.). EmacsHandler
// doesn't call preventDefault for them, so they must go through CM6 keymap.of()
// which always calls preventDefault when a key is handled.
const BROWSER_CONFLICT_KEYS = new Set(["F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12"]);

export function emacsProfile(bindings, log) {
  const commands = {};
  const emacsKeys = {};
  const cmKeys = [];

  bindings.forEach(({ key, command, label }) => {
    if (BROWSER_CONFLICT_KEYS.has(key)) {
      cmKeys.push({ key, run: wrapCommand(command, label, log) });
    } else {
      const name = "clt-" + label;
      commands[name] = (editor) => {
        const view = editor.cm;
        wrapCommand(command, label, log)(view);
      };
      emacsKeys[key] = name;
    }
  });

  EmacsHandler.addCommands(commands);
  Object.entries(emacsKeys).forEach(([key, name]) => {
    EmacsHandler.bindKey(key, name);
  });
  return cmKeys.length ? [keymap.of(cmKeys)] : [];
}
