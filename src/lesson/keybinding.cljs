(ns lesson.keybinding
  (:require ["../profiles/state" :refer [getActiveProfile onProfileChange]]
            ["../profiles/resolve" :refer [resolveBindings]]))

(defn ^:export renderKeybindings [container]
  (let [render (fn []
                 (let [bindings (resolveBindings (getActiveProfile))
                       placeholders (.querySelectorAll container "[data-command]")]
                   (doseq [element (js/Array.from placeholders)]
                     (let [command (.-command (.-dataset element))
                           kw (if (.startsWith command ":") (.slice command 1) command)]
                       (set! (.-textContent element)
                             (or (aget bindings kw) command))))))]
    (render)
    (onProfileChange render)))
