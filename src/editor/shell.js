import { createCell, ACTIVE_PROFILE } from "./cell.js";
import { evalClojure } from "../pipeline/eval.js";

export function createShell(container) {
  container.innerHTML = "";
  container.style.cssText = "display:flex;height:100vh;width:100%;box-sizing:border-box;";

  const editorPane = document.createElement("div");
  editorPane.style.cssText = "flex:1;min-width:0;border-right:1px solid #ccc;overflow:auto;";

  const outputPane = document.createElement("div");
  outputPane.style.cssText =
    "flex:1;min-width:0;padding:0.5rem;font-family:monospace;white-space:pre-wrap;overflow:auto;background:#fafafa;";
  outputPane.textContent = ";; output";

  container.appendChild(editorPane);
  container.appendChild(outputPane);

  function onEval(view) {
    const source = view.state.doc.toString();
    const { result, error } = evalClojure(source);
    outputPane.textContent = error != null ? "Error: " + error : String(result);
  }

  const cell = createCell(editorPane, { onEval, profile: ACTIVE_PROFILE });
  return { cell, outputPane };
}
