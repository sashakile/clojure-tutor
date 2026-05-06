import { createCell } from "../editor/cell.js";
import { renderKeybindings } from "./keybinding.js";

export function createFixture(container) {
  const section = document.createElement("section");
  section.className = "lesson-text";
  section.style.cssText = [
    "padding:0.75rem 1rem",
    "border-bottom:1px solid #ddd",
    "background:#fff",
    "font-family:system-ui,sans-serif",
  ].join(";");

  section.innerHTML = `
    <p>
      Practice structural editing with
      <kbd data-command="slurp-forward"></kbd>
      for slurp forward and
      <kbd data-command="barf-forward"></kbd>
      for barf forward.
    </p>
  `;

  const cellHost = document.createElement("div");
  cellHost.className = "lesson-text__cell";
  cellHost.style.cssText = "min-height:8rem;border:1px solid #ddd;";
  section.appendChild(cellHost);

  container.insertBefore(section, container.firstChild);
  const cell = createCell(cellHost);
  renderKeybindings(section);

  return cell;
}
