## 0. Pre-flight

- [ ] 0.1 Close `CLT-29m` — the Phase 0 spikes achieved 100% action-observation
      coverage on all three keymap modes; structure-diff fallback is not needed;
      update the issue with this rationale and close it

## 1. Profile data layer

- [x] 1.1 Research Calva's default VS Code Paredit keybindings: open Calva docs
      and record exact key strings (in CM6 notation) for `slurp-forward`,
      `barf-forward`, and any other Phase 1–6 structural operations; decide
      whether `calva` extends `default` or is a flat profile; note findings in
      a code comment in `src/profiles/registry.js`
- [x] 1.2 Create `src/profiles/registry.js` exporting profile data objects for
      `default`, `calva`, `vim`, and `emacs` (each with `id`, `label`, `leader`,
      `bindings`; `calva` may include `extends`); index them by `id` in a
      `PROFILES` map
- [x] 1.3 Create `src/profiles/resolve.js` exporting `resolveBindings(profileId)`:
      look up `profileId` in the registry, walk the `extends` chain, shallow-merge
      `bindings` maps with child keys taking precedence (since all `bindings`
      values are strings, this is equivalent to `Object.assign` precedence);
      return the flat map
- [x] 1.4 Create `src/profiles/state.js` exporting `getActiveProfile()`,
      `setActiveProfile(id)` (no-op if same), and `onProfileChange(fn)` returning
      an unsubscribe function; initial active profile is `"default"`
- [ ] 1.5 Update `src/editor/cell.js`: replace hardcoded `ACTIVE_PROFILE` and
      `PROFILE_BINDINGS` with profile data from the registry; `createCell` accepts
      a resolved bindings map (the flat output of `resolveBindings`); add
      `reinitProfile(bindings)` that accepts a resolved bindings map, destroys
      the CM6 view and creates a new one in the same parent, preserving document
      content; attach the new action log to the new view

## 2. Profile switch wiring

- [ ] 2.1 Create `src/profiles/switch.js` exporting `applyProfileSwitch(newId,
      cells)`: calls `resolveBindings(newId)` to get a flat bindings map, then
      for each cell calls `cell.reinitProfile(bindings)`, then calls
      `resetSession()`, then clears each cell's new action log
- [ ] 2.2 Update `src/editor/shell.js` to maintain a `cells` array; subscribe to
      `onProfileChange` and call `applyProfileSwitch` on each change

## 3. Which-key navigation

- [x] 3.1 Create `src/nav/which-key.js` exporting `createWhichKey()` that returns
      a `{ show(hints), hide() }` object; `hints` is `[{key, label}]`; the overlay
      is a fixed-position `div` at the bottom center of the viewport; it registers
      a one-shot keydown listener on show and cleans up on hide; calls an optional
      `onKey(key)` callback before hiding
- [x] 3.2 Create `src/nav/profiles-panel.js` exporting `createProfilesPanel
      (registry)` returning a `{ open(), close() }` object; renders all profiles
      as a list in a fixed left-side overlay `div`; marks the active profile with
      `aria-current="true"`; subscribes to `onProfileChange` to update the active
      marker; activating an entry calls `setActiveProfile(id)` and closes the panel
- [ ] 3.3 Create `src/nav/nav-layer.js` exporting `installNavLayer(shell, panel,
      whichKey)`: adds a window-level `keydown` listener; reads `getActiveProfile()`
      to determine the leader; applies focus-gate for non-Space leaders (check
      `document.activeElement.closest(".cm-editor")`); for the vim profile, checks
      insert mode before intercepting Space; on interception calls
      `whichKey.show([{key:"p", label:"profiles"}])` and wires the `onKey` callback
      to route `"p"` → `panel.open()`
- [ ] 3.4 Mount nav-layer, profiles-panel, and which-key overlay in `shell.js`
      after the two-pane layout is created

## 4. Keybinding substitution

- [x] 4.1 Create `src/lesson/keybinding.js` exporting `renderKeybindings
      (container)`: queries `container.querySelectorAll("[data-command]")`,
      resolves each via `resolveBindings(getActiveProfile())`, sets `textContent`
      to the resolved string or the command keyword as fallback; subscribes to
      `onProfileChange` and re-resolves on each change
- [ ] 4.2 Create `src/lesson/fixture.js` exporting `createFixture(container)`:
      creates a lesson-text `section` element as the first child of the shell
      container with prose referencing at least two operations via
      `<kbd data-command="…">` placeholders; includes one CM6 cell; calls
      `renderKeybindings` on the section after mount; returns the created cell
- [ ] 4.3 Mount fixture in `shell.js` by calling `createFixture` before the
      two-pane layout is appended to the container; register the returned cell
      in the `cells` array before subscribing to `onProfileChange`

## 5. Tests

- [x] 5.1 Test profile resolution (`src/profiles/resolve.js`): flat profile
      returns own bindings; extended profile merges parent; child key overrides
      parent; unknown profile ID returns empty object
- [x] 5.2 Test profile state (`src/profiles/state.js`): subscriber called on
      `setActiveProfile`; no-op if same ID; unsubscribe prevents future calls;
      `getActiveProfile` reflects most recent set
- [ ] 5.3 Test profile switch effects (`src/profiles/switch.js`): after
      `applyProfileSwitch`, cell action log is empty, session namespace is reset,
      and cell document content is preserved
- [x] 5.4 Test keybinding substitution (`src/lesson/keybinding.js`):
      `[data-command]` element shows correct keybinding for active profile; updates
      when profile changes; unknown command keyword shows command keyword as text
- [x] 5.5 Test which-key overlay (`src/nav/which-key.js`): overlay visible after
      `show`; `onKey` callback receives pressed key; overlay hidden after `hide`
- [x] 5.6 Test profiles panel (`src/nav/profiles-panel.js`): all registry profiles
      listed; active profile has `aria-current="true"`; activating an entry calls
      `setActiveProfile` and closes the panel
- [ ] 5.7 Test nav-layer interception (`src/nav/nav-layer.js`): leader fires when
      no `.cm-editor` has focus; leader does not fire when a `.cm-editor` has
      focus; Space does not fire in vim insert mode (vim profile)

## 6. Validation

- [x] 6.1 Run `openspec validate implement-profile-system --strict` and resolve
      all issues before marking the proposal ready for approval
- [ ] 6.2 Run `just test` and confirm all new tests in §5 pass with no regressions
- [ ] 6.3 Run `just dev`, open browser, and verify: leader key fires the overlay,
      overlay lists hints, `[leader] p` opens the profiles panel, panel supports
      arrow-key navigation, selecting a profile updates keybinding text in the
      fixture slide
