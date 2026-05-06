import { EmacsHandler } from "@replit/codemirror-emacs";
import { wrapCommand } from "../../validation/command-wrapper.js";

// Only use keys emacs doesn't claim: C-., C-,, F5–F12
export function emacsProfile(bindings, log) {
  const commands = {};
  const keys = {};
  bindings.forEach(({ key, command, label }) => {
    const name = "clt-" + label;
    commands[name] = (editor) => {
      const view = editor.cm;
      wrapCommand(command, label, log)(view);
    };
    keys[key] = name;
  });
  EmacsHandler.addCommands(commands);
  Object.entries(keys).forEach(([key, name]) => {
    EmacsHandler.bindKey(key, name);
  });
  return [];
}
