export function create() {
  const _entries = [];
  return {
    append(label) {
      _entries.push({ command: ":" + label, at: Date.now() });
    },
    clear() {
      _entries.length = 0;
    },
    entries() {
      return _entries.slice();
    },
  };
}
