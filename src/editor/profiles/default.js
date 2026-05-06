import { keymap } from "@codemirror/view";
import { wrapCommand } from "../../validation/command-wrapper.js";

export function defaultProfile(bindings, log) {
  return keymap.of(
    bindings.map(({ key, command, label }) => ({
      key,
      run: wrapCommand(command, label, log),
    }))
  );
}
