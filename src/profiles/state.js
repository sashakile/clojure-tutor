let activeProfile = "default";
const subscribers = new Set();

export function getActiveProfile() {
  return activeProfile;
}

export function setActiveProfile(id) {
  if (id === activeProfile) return;

  const previous = activeProfile;
  activeProfile = id;

  for (const subscriber of [...subscribers]) {
    subscriber(activeProfile, previous);
  }
}

export function onProfileChange(fn) {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}
