(ns editor.profiles.emacs
  (:require ["@replit/codemirror-emacs" :refer [EmacsHandler]]
            ["@codemirror/view" :refer [keymap]]
            ["../../validation/command-wrapper.js" :refer [wrapCommand]]))

(def ^:private browser-conflict-keys
  #{"F1" "F2" "F3" "F4" "F5" "F6" "F7" "F8" "F9" "F10" "F11" "F12"})

(defn ^:export emacsProfile [bindings log]
  (let [commands #js {}
        emacs-keys #js {}
        cm-keys (atom [])]
    (doseq [b bindings]
      (let [key (.-key b)
            command (.-command b)
            label (.-label b)]
        (if (contains? browser-conflict-keys key)
          (swap! cm-keys conj #js {:key key :run (wrapCommand command label log)})
          (let [name (str "clt-" label)]
            (aset commands name
                  (fn [editor]
                    ((wrapCommand command label log) (.-cm editor))))
            (aset emacs-keys key name)))))
    (.addCommands EmacsHandler commands)
    (doseq [[key name] (js/Object.entries emacs-keys)]
      (.bindKey EmacsHandler key name))
    (if (pos? (.-length @cm-keys))
      #js [(.of keymap (into-array @cm-keys))]
      #js [])))
