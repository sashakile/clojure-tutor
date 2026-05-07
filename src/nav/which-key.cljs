(ns nav.which-key)

(defn ^:export createWhichKey
  ([] (createWhichKey #js {}))
  ([opts]
   (let [overlay-ref (atom nil)
         handler-ref (atom nil)
         on-key (.-onKey opts)
         hide (fn []
                (when @handler-ref
                  (.removeEventListener js/window "keydown" @handler-ref)
                  (reset! handler-ref nil))
                (when @overlay-ref
                  (.remove @overlay-ref)
                  (reset! overlay-ref nil)))
         show (fn show
                ([] (show #js [] on-key))
                ([hints] (show hints on-key))
                ([hints next-on-key]
                 (hide)
                 (let [overlay (.createElement js/document "div")]
                   (set! (.-className overlay) "clt-which-key")
                   (set! (.-cssText (.-style overlay))
                         (str "position:fixed;"
                              "left:50%;"
                              "bottom:1rem;"
                              "transform:translateX(-50%);"
                              "z-index:1000;"
                              "display:flex;"
                              "gap:0.75rem;"
                              "padding:0.5rem 0.75rem;"
                              "border:1px solid #ccc;"
                              "border-radius:0.5rem;"
                              "background:#fff;"
                              "box-shadow:0 0.25rem 1rem rgba(0,0,0,0.15);"
                              "font-family:system-ui,sans-serif;"
                              "font-size:0.875rem;"))
                   (doseq [hint (js/Array.from hints)]
                     (let [item (.createElement js/document "span")
                           key-el (.createElement js/document "kbd")
                           label-el (.createElement js/document "span")]
                       (set! (.-className item) "clt-which-key__item")
                       (set! (.-textContent key-el) (.-key hint))
                       (set! (.-textContent label-el) (str " " (.-label hint)))
                       (.appendChild item key-el)
                       (.appendChild item label-el)
                       (.appendChild overlay item)))
                   (.appendChild (.-body js/document) overlay)
                   (reset! overlay-ref overlay)
                   (let [kh (fn [event]
                               (when next-on-key (next-on-key (.-key event)))
                               (hide))]
                     (reset! handler-ref kh)
                     (.addEventListener js/window "keydown" kh #js {:once true :capture true})))))]
     #js {:show show :hide hide})))
