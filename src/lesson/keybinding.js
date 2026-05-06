import { getActiveProfile, onProfileChange } from "../profiles/state.js";
import { resolveBindings } from "../profiles/resolve.js";

export function renderKeybindings(container) {
  const render = () => {
    const bindings = resolveBindings(getActiveProfile());
    const placeholders = container.querySelectorAll("[data-command]");

    placeholders.forEach((element) => {
      const command = element.dataset.command;
      const keyword = command.startsWith(":") ? command.slice(1) : command;
      element.textContent = bindings[keyword] ?? command;
    });
  };

  render();
  return onProfileChange(render);
}
