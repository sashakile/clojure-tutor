import * as squint_core from "squint-cljs/core.js";
import { compileString } from "squint-cljs";

function stripAndProcess(compiled) {
  const lines = compiled.split("\n");
  const body = lines
    .filter((l) => !l.startsWith("import ") && !l.startsWith("export {") && l.trim() !== "")
    .map((line) => {
      const m = line.match(/^var (\w+) = ([\s\S]*);$/);
      if (m) {
        return `window.__clt_session__["${m[1]}"] = ${m[2]};`;
      }
      return line;
    });
  return body;
}

export function evalClojure(source) {
  window.__clt_session__ = window.__clt_session__ || {};
  try {
    const compiled = compileString(source);
    const bodyLines = stripAndProcess(compiled);
    if (bodyLines.length === 0) return { result: undefined, error: null };

    const sessionInject = Object.keys(window.__clt_session__)
      .map((k) => `var ${k} = window.__clt_session__["${k}"];`)
      .join("\n");

    const lastLine = bodyLines[bodyLines.length - 1];
    const rest = bodyLines.slice(0, -1);
    const returnExpr = lastLine.replace(/;$/, "");
    const code = [sessionInject, ...rest, `return (${returnExpr});`].join("\n");

    const fn = new Function("squint_core", code);
    const result = fn(squint_core);
    return { result, error: null };
  } catch (e) {
    return { result: null, error: e.message };
  }
}

export function resetSession() {
  window.__clt_session__ = {};
}
