import { resetSession } from "../pipeline/eval.js";
import { getActiveProfile, setActiveProfile } from "./state.js";
import { resolveBindings } from "./resolve.js";

export function applyProfileSwitch(newId, cells, previousId = getActiveProfile()) {
  try {
    const bindings = resolveBindings(newId);

    cells.forEach((cell) => {
      cell.reinitProfile(bindings);
    });

    resetSession();

    cells.forEach((cell) => {
      cell.actionLog.clear();
    });
  } catch (error) {
    if (previousId !== getActiveProfile()) {
      setActiveProfile(previousId);
    }
    throw error;
  }
}
