(ns editor.shell
  (:require ["./cell" :refer [createCell]]
            ["../pipeline/eval" :refer [evalClojure]]
            ["../profiles/registry" :refer [PROFILES]]
            ["../profiles/state" :refer [onProfileChange]]
            ["../profiles/switch" :refer [applyProfileSwitch]]
            ["../lesson/fixture" :refer [createFixture]]
            ["../nav/nav-layer" :refer [installNavLayer]]
            ["../nav/profiles-panel" :refer [createProfilesPanel]]
            ["../nav/which-key" :refer [createWhichKey]]))

(defn ^:export createShell [container]
  (set! (.-innerHTML container) "")
  (set! (.-cssText (.-style container))
        "display:flex;flex-direction:column;height:100vh;width:100%;box-sizing:border-box;")

  (let [cells #js []
        shell #js {:container container :cells cells}
        fixture-cell (createFixture container)]
    (.push cells fixture-cell)

    (let [panes (.createElement js/document "div")
          editor-pane (.createElement js/document "div")
          output-pane (.createElement js/document "div")]
      (set! (.-cssText (.-style panes))
            "display:flex;flex:1;min-height:0;width:100%;box-sizing:border-box;")
      (set! (.-cssText (.-style editor-pane))
            "flex:1;min-width:0;border-right:1px solid #ccc;overflow:auto;")
      (set! (.-cssText (.-style output-pane))
            "flex:1;min-width:0;padding:0.5rem;font-family:monospace;white-space:pre-wrap;overflow:auto;background:#fafafa;")
      (set! (.-textContent output-pane) ";; output")

      (.appendChild panes editor-pane)
      (.appendChild panes output-pane)
      (.appendChild container panes)

      (defn on-eval [view]
        (let [source (.toString (.-doc (.-state view)))
              res (evalClojure source)]
          (set! (.-textContent output-pane)
                (if (not= nil (.-error res))
                  (str "Error: " (.-error res))
                  (str (.-result res))))))

      (let [cell (createCell editor-pane #js {:onEval on-eval})]
        (.push cells cell)

        (let [unsubscribe-profile (onProfileChange
                                   (fn [new-profile-id previous-profile-id]
                                     (applyProfileSwitch new-profile-id cells previous-profile-id)))
              which-key (createWhichKey)
              panel (createProfilesPanel PROFILES)
              uninstall-nav (installNavLayer shell panel which-key)]

          #js {:cell cell
               :fixtureCell fixture-cell
               :cells cells
               :outputPane output-pane
               :panel panel
               :whichKey which-key
               :unsubscribeProfile unsubscribe-profile
               :uninstallNavLayer uninstall-nav})))))
