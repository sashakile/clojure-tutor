/**
 * Wraps a CM6 Command so every invocation is recorded to an action log.
 *
 * @param {import("@codemirror/view").Command} command - the original CM6 command
 * @param {string} label - identifier written to the log (e.g. "slurpSexp")
 * @param {Array<{command: string, at: number}>} log - mutable array; entries are pushed here
 * @returns {import("@codemirror/view").Command}
 */
export function wrapCommand(command, label, log) {
  return (view) => {
    const result = command(view);
    if (result) {
      log.push({ command: label, at: Date.now() });
    }
    return result;
  };
}

/**
 * Creates a fresh, empty action log.
 * @returns {Array<{command: string, at: number}>}
 */
export function makeActionLog() {
  return [];
}
