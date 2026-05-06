import { getActiveProfile, onProfileChange, setActiveProfile } from "../profiles/state.js";

export function createProfilesPanel(registry) {
  let previouslyFocused = null;
  const panel = document.createElement("aside");
  panel.className = "clt-profiles-panel";
  panel.hidden = true;
  panel.style.cssText = [
    "position:fixed",
    "inset:0 auto 0 0",
    "z-index:1001",
    "width:16rem",
    "max-width:80vw",
    "padding:1rem",
    "border-right:1px solid #ccc",
    "background:#fff",
    "box-shadow:0.25rem 0 1rem rgba(0,0,0,0.15)",
    "font-family:system-ui,sans-serif",
  ].join(";");

  const title = document.createElement("h2");
  title.textContent = "Profiles";
  title.style.cssText = "margin:0 0 0.75rem;font-size:1rem;";

  const list = document.createElement("div");
  list.setAttribute("role", "list");

  panel.appendChild(title);
  panel.appendChild(list);
  document.body.appendChild(panel);

  function entries() {
    return [...list.querySelectorAll("button[data-profile-id]")];
  }

  function render() {
    list.innerHTML = "";
    const active = getActiveProfile();

    Object.values(registry).forEach((profile) => {
      const item = document.createElement("button");
      item.type = "button";
      item.dataset.profileId = profile.id;
      item.textContent = profile.label;
      item.setAttribute("role", "listitem");
      item.style.cssText = "display:block;width:100%;margin:0 0 0.25rem;padding:0.5rem;text-align:left;";

      if (profile.id === active) {
        item.setAttribute("aria-current", "true");
      }

      item.addEventListener("click", () => activate(profile.id));
      item.addEventListener("keydown", handleEntryKeydown);
      list.appendChild(item);
    });
  }

  function focusEntry(index) {
    const items = entries();
    if (items.length === 0) return;
    const next = (index + items.length) % items.length;
    items[next].focus();
  }

  function focusActiveEntry() {
    const items = entries();
    const active = getActiveProfile();
    const activeIndex = items.findIndex((item) => item.dataset.profileId === active);
    focusEntry(activeIndex >= 0 ? activeIndex : 0);
  }

  function handleEntryKeydown(event) {
    const items = entries();
    const current = items.indexOf(event.currentTarget);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusEntry(current + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusEntry(current - 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      activate(event.currentTarget.dataset.profileId);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  function activate(id) {
    setActiveProfile(id);
    close();
  }

  function open() {
    previouslyFocused = document.activeElement;
    render();
    panel.hidden = false;
    focusActiveEntry();
  }

  function close() {
    panel.hidden = true;
    if (previouslyFocused?.focus) {
      previouslyFocused.focus();
    }
    previouslyFocused = null;
  }

  render();
  onProfileChange(render);

  return { open, close, element: panel };
}
