import { Vim } from "@replit/codemirror-vim";
import { wrapCommand } from "../../validation/command-wrapper.js";

export function vimProfile(bindings, log) {
  bindings.forEach(({ motionKey, command, label }) => {
    const actionName = "clt-" + label;
    Vim.defineAction(actionName, (cm) => {
      const view = cm.cm6;
      wrapCommand(command, label, log)(view);
    });
    Vim.mapCommand(motionKey, "action", actionName, undefined, { context: "normal" });
  });
  return [];
}
