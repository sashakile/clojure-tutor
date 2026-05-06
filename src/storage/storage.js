// All storage access goes through this module; no app code calls storage directly.
export const storage = {
  get: (key) => {
    const item = window.localStorage?.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  set: (key, value) => {
    window.localStorage?.setItem(key, JSON.stringify(value));
  },
  remove: (key) => {
    window.localStorage?.removeItem(key);
  },
  clear: () => {
    window.localStorage?.clear();
  },
};
