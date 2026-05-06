import { createCell } from "./cell.js";
import { evalClojure } from "../pipeline/eval.js";
import { PROFILES } from "../profiles/registry.js";
import { onProfileChange } from "../profiles/state.js";
import { applyProfileSwitch } from "../profiles/switch.js";
import { createFixture } from "../lesson/fixture.js";
import { installNavLayer } from "../nav/nav-layer.js";
import { createProfilesPanel } from "../nav/profiles-panel.js";
import { createWhichKey } from "../nav/which-key.js";

export function createShell(container) {
  container.innerHTML = "";
  container.style.cssText = "display:flex;flex-direction:column;height:100vh;width:100%;box-sizing:border-box;";

  const cells = [];
  const shell = { container, cells };

  const fixtureCell = createFixture(container);
  cells.push(fixtureCell);

  const panes = document.createElement("div");
  panes.style.cssText = "display:flex;flex:1;min-height:0;width:100%;box-sizing:border-box;";

  const editorPane = document.createElement("div");
  editorPane.style.cssText = "flex:1;min-width:0;border-right:1px solid #ccc;overflow:auto;";

  const outputPane = document.createElement("div");
  outputPane.style.cssText =
    "flex:1;min-width:0;padding:0.5rem;font-family:monospace;white-space:pre-wrap;overflow:auto;background:#fafafa;";
  outputPane.textContent = ";; output";

  panes.appendChild(editorPane);
  panes.appendChild(outputPane);
  container.appendChild(panes);

  function onEval(view) {
    const source = view.state.doc.toString();
    const { result, error } = evalClojure(source);
    outputPane.textContent = error != null ? "Error: " + error : String(result);
  }

  const cell = createCell(editorPane, { onEval });
  cells.push(cell);

  const unsubscribeProfile = onProfileChange((newProfileId, previousProfileId) => {
    applyProfileSwitch(newProfileId, cells, previousProfileId);
  });

  const whichKey = createWhichKey();
  const panel = createProfilesPanel(PROFILES);
  const uninstallNavLayer = installNavLayer(shell, panel, whichKey);

  return { cell, fixtureCell, cells, outputPane, panel, whichKey, unsubscribeProfile, uninstallNavLayer };
}
