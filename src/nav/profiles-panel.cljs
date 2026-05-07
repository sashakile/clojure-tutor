(ns nav.profiles-panel
  (:require ["../profiles/state" :refer [getActiveProfile onProfileChange setActiveProfile]]))

(defn ^:export createProfilesPanel [registry]
  (let [prev-focused (atom nil)
        panel (.createElement js/document "aside")]
    (set! (.-className panel) "clt-profiles-panel")
    (set! (.-hidden panel) true)
    (set! (.-cssText (.-style panel))
          (str "position:fixed;"
               "inset:0 auto 0 0;"
               "z-index:1001;"
               "width:16rem;"
               "max-width:80vw;"
               "padding:1rem;"
               "border-right:1px solid #ccc;"
               "background:#fff;"
               "box-shadow:0.25rem 0 1rem rgba(0,0,0,0.15);"
               "font-family:system-ui,sans-serif;"))

    (let [title (.createElement js/document "h2")
          list (.createElement js/document "div")]
      (set! (.-textContent title) "Profiles")
      (set! (.-cssText (.-style title)) "margin:0 0 0.75rem;font-size:1rem;")
      (.setAttribute list "role" "list")
      (.appendChild panel title)
      (.appendChild panel list)
      (.appendChild (.-body js/document) panel)

      (defn entries []
        (js/Array.from (.querySelectorAll list "button[data-profile-id]")))

      (defn focus-entry [index]
        (let [items (entries)]
          (when (pos? (.-length items))
            (let [n (mod (+ index (.-length items)) (.-length items))]
              (.focus (aget items n))))))

      (defn focus-active-entry []
        (let [items (entries)
              active (getActiveProfile)
              idx (.findIndex items (fn [item] (= (.-profileId (.-dataset item)) active)))]
          (focus-entry (if (>= idx 0) idx 0))))

      (declare close)

      (defn activate [id]
        (setActiveProfile id)
        (close))

      (defn handle-entry-keydown [event]
        (let [items (entries)
              current (.indexOf items (.-currentTarget event))]
          (case (.-key event)
            "ArrowDown" (do (.preventDefault event) (focus-entry (inc current)))
            "ArrowUp"   (do (.preventDefault event) (focus-entry (dec current)))
            "Enter"     (do (.preventDefault event) (activate (.-profileId (.-dataset (.-currentTarget event)))))
            "Escape"    (do (.preventDefault event) (close))
            nil)))

      (defn render []
        (set! (.-innerHTML list) "")
        (let [active (getActiveProfile)]
          (doseq [[_ profile] (js/Object.entries registry)]
            (let [item (.createElement js/document "button")]
              (set! (.-type item) "button")
              (set! (.-profileId (.-dataset item)) (.-id profile))
              (set! (.-textContent item) (.-label profile))
              (.setAttribute item "role" "listitem")
              (set! (.-cssText (.-style item))
                    "display:block;width:100%;margin:0 0 0.25rem;padding:0.5rem;text-align:left;")
              (when (= (.-id profile) active)
                (.setAttribute item "aria-current" "true"))
              (.addEventListener item "click" (fn [] (activate (.-id profile))))
              (.addEventListener item "keydown" handle-entry-keydown)
              (.appendChild list item)))))

      (defn open []
        (reset! prev-focused (.-activeElement js/document))
        (render)
        (set! (.-hidden panel) false)
        (focus-active-entry))

      (defn close []
        (set! (.-hidden panel) true)
        (when (and @prev-focused (.-focus @prev-focused))
          (.focus @prev-focused))
        (reset! prev-focused nil))

      (render)
      (onProfileChange render)

      #js {:open open :close close :element panel})))
