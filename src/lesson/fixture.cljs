(ns lesson.fixture
  (:require ["../editor/cell" :refer [createCell]]
            ["./keybinding" :refer [renderKeybindings]]))

(defn ^:export createFixture [container]
  (let [section (.createElement js/document "section")]
    (set! (.-className section) "lesson-text")
    (set! (.-cssText (.-style section))
          (str "padding:0.75rem 1rem;"
               "border-bottom:1px solid #ddd;"
               "background:#fff;"
               "font-family:system-ui,sans-serif;"))
    (set! (.-innerHTML section)
          (str "<p>"
               "Practice structural editing with "
               "<kbd data-command=\"slurp-forward\"></kbd>"
               " for slurp forward and "
               "<kbd data-command=\"barf-forward\"></kbd>"
               " for barf forward."
               "</p>"))

    (let [cell-host (.createElement js/document "div")]
      (set! (.-className cell-host) "lesson-text__cell")
      (set! (.-cssText (.-style cell-host)) "min-height:8rem;border:1px solid #ddd;")
      (.appendChild section cell-host)

      (.insertBefore container section (.-firstChild container))
      (let [cell (createCell cell-host)]
        (renderKeybindings section)
        cell))))
