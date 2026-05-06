import { PROFILES } from "./registry.js";

export function resolveBindings(profileId, registry = PROFILES) {
  const profile = registry[profileId];
  if (!profile) return {};

  return resolveProfile(profileId, registry, []);
}

function resolveProfile(profileId, registry, path) {
  if (path.includes(profileId)) {
    const cycle = [...path, profileId].join(" -> ");
    throw new Error(`Circular profile extends chain: ${cycle}`);
  }

  const profile = registry[profileId];
  if (!profile) return {};

  const parentBindings = profile.extends
    ? resolveProfile(profile.extends, registry, [...path, profileId])
    : {};

  return {
    ...parentBindings,
    ...profile.bindings,
  };
}
