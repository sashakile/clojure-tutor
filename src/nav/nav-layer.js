import { getCM } from "@replit/codemirror-vim";
import { getActiveProfile } from "../profiles/state.js";
import { PROFILES } from "../profiles/registry.js";

function isSpaceKey(event) {
  return event.key === " " || event.key === "Space" || event.code === "Space";
}

function isLeaderKey(event, leader) {
  return leader === "Space" ? isSpaceKey(event) : event.key === leader;
}

function focusedEditorRoot() {
  return document.activeElement?.closest?.(".cm-editor") ?? null;
}

function focusedCell(shell, editorRoot) {
  return shell?.cells?.find((cell) => cell.dom === editorRoot || cell.dom?.contains(editorRoot));
}

function isVimInsertMode(shell, editorRoot) {
  const cell = focusedCell(shell, editorRoot);
  const view = cell?.view ?? cell;
  const insertMode = view?.state?.vim?.insertMode ?? getCMIfPossible(view)?.state?.vim?.insertMode;

  if (insertMode === undefined) {
    console.warn("Unable to determine vim insert mode; treating focused vim editor as normal mode");
    return false;
  }

  return Boolean(insertMode);
}

function getCMIfPossible(view) {
  try {
    return view ? getCM(view) : null;
  } catch (_) {
    return null;
  }
}

export function installNavLayer(shell, panel, whichKey) {
  const handler = (event) => {
    const profileId = getActiveProfile();
    const profile = PROFILES[profileId] ?? PROFILES.default;

    if (!isLeaderKey(event, profile.leader)) return;

    const editorRoot = focusedEditorRoot();
    if (profile.leader === "Space" && profileId === "vim" && editorRoot && isVimInsertMode(shell, editorRoot)) return;

    event.preventDefault();
    event.stopPropagation();

    whichKey.show([{ key: "p", label: "profiles" }], (key) => {
      if (key === "p") panel.open();
    });
  };

  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}
