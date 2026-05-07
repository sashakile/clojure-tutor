(ns editor.profiles.default
  (:require ["@codemirror/view" :refer [keymap]]
            ["../../validation/command-wrapper.js" :refer [wrapCommand]]))

(defn ^:export defaultProfile [bindings log]
  (.of keymap
       (into-array
        (map (fn [b]
               #js {:key (.-key b)
                    :run (wrapCommand (.-command b) (.-label b) log)})
             bindings))))
