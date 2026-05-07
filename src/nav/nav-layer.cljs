(ns nav.nav-layer
  (:require ["@replit/codemirror-vim" :refer [getCM]]
            ["../profiles/state" :refer [getActiveProfile]]
            ["../profiles/registry" :refer [PROFILES]]))

(defn- space-key? [event]
  (or (= (.-key event) " ")
      (= (.-key event) "Space")
      (= (.-code event) "Space")))

(defn- leader-key? [event leader]
  (if (= leader "Space")
    (space-key? event)
    (= (.-key event) leader)))

(defn- focused-editor-root []
  (let [el (.-activeElement js/document)]
    (when el (.closest el ".cm-editor"))))

(defn- focused-cell [shell editor-root]
  (let [cells (.-cells shell)]
    (when cells
      (.find cells (fn [cell]
                     (or (= (.-dom cell) editor-root)
                         (and (.-dom cell) (.contains (.-dom cell) editor-root))))))))

(defn- get-cm-safe [view]
  (try
    (when view (getCM view))
    (catch js/Error _ nil)))

(defn- safe-vim-insert-mode [view]
  (when view
    (let [s (.-state view)]
      (when s
        (let [v (.-vim s)]
          (when v
            (.-insertMode v)))))))

(defn- vim-insert-mode? [shell editor-root]
  (let [cell (focused-cell shell editor-root)
        view (or (.-view cell) cell)
        insert-mode (let [v1 (safe-vim-insert-mode view)]
                      (if (some? v1)
                        v1
                        (safe-vim-insert-mode (get-cm-safe view))))]
    (if (some? insert-mode)
      (boolean insert-mode)
      (do (js/console.warn "Unable to determine vim insert mode; treating as normal mode")
          false))))

(defn ^:export installNavLayer [shell panel which-key]
  (let [handler (fn [event]
                  (let [profile-id (getActiveProfile)
                        profile (or (aget PROFILES profile-id) (.-default PROFILES))
                        leader (.-leader profile)]
                    (when (leader-key? event leader)
                      (let [editor-root (focused-editor-root)
                            skip? (or (and (not= leader "Space") editor-root)
                                      (and (= leader "Space")
                                           (= profile-id "vim")
                                           editor-root
                                           (vim-insert-mode? shell editor-root)))]
                        (when-not skip?
                          (.preventDefault event)
                          (.stopPropagation event)
                          (.show which-key
                                 (into-array [#js {:key "p" :label "profiles"}])
                                 (fn [key]
                                   (when (= key "p") (.open panel)))))))))]
    (.addEventListener js/window "keydown" handler)
    (fn [] (.removeEventListener js/window "keydown" handler))))
