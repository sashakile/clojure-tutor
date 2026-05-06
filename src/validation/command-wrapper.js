/**
 * Wraps a CM6 Command to record every successful invocation to an action log.
 * wrapCommand MUST NOT log entries for commands that return falsy — only log on truthy return.
 *
 * @param {import("@codemirror/view").Command} command
 * @param {string} label - without colon (e.g. "slurp-forward"); action-log prepends ":"
 * @param {ReturnType<import("./action-log.js").create>} log
 * @returns {import("@codemirror/view").Command}
 */
export function wrapCommand(command, label, log) {
  return (view) => {
    const result = command(view);
    if (result) {
      log.append(label);
    }
    return result;
  };
}
