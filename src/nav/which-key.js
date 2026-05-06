export function createWhichKey({ onKey } = {}) {
  let overlay = null;
  let keydownHandler = null;
  let activeOnKey = onKey;

  function hide() {
    if (keydownHandler) {
      window.removeEventListener("keydown", keydownHandler);
      keydownHandler = null;
    }

    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  function show(hints, nextOnKey = onKey) {
    hide();
    activeOnKey = nextOnKey;

    overlay = document.createElement("div");
    overlay.className = "clt-which-key";
    overlay.style.cssText = [
      "position:fixed",
      "left:50%",
      "bottom:1rem",
      "transform:translateX(-50%)",
      "z-index:1000",
      "display:flex",
      "gap:0.75rem",
      "padding:0.5rem 0.75rem",
      "border:1px solid #ccc",
      "border-radius:0.5rem",
      "background:#fff",
      "box-shadow:0 0.25rem 1rem rgba(0,0,0,0.15)",
      "font-family:system-ui,sans-serif",
      "font-size:0.875rem",
    ].join(";");

    hints.forEach(({ key, label }) => {
      const item = document.createElement("span");
      item.className = "clt-which-key__item";

      const keyEl = document.createElement("kbd");
      keyEl.textContent = key;

      const labelEl = document.createElement("span");
      labelEl.textContent = ` ${label}`;

      item.appendChild(keyEl);
      item.appendChild(labelEl);
      overlay.appendChild(item);
    });

    document.body.appendChild(overlay);

    keydownHandler = (event) => {
      activeOnKey?.(event.key);
      hide();
    };
    window.addEventListener("keydown", keydownHandler, { once: true });
  }

  return { show, hide };
}
