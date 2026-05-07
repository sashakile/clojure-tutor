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

      (let [entries (fn []
                      (js/Array.from (.querySelectorAll list "button[data-profile-id]")))
            focus-entry (fn [index]
                          (let [items (entries)]
                            (when (pos? (.-length items))
                              (let [n (mod (+ index (.-length items)) (.-length items))]
                                (.focus (aget items n))))))
            focus-active-entry (fn []
                                 (let [items (entries)
                                       active (getActiveProfile)
                                       idx (.findIndex items (fn [item] (= (.-profileId (.-dataset item)) active)))]
                                   (focus-entry (if (>= idx 0) idx 0))))
            close (fn []
                    (set! (.-hidden panel) true)
                    (when (and @prev-focused (.-focus @prev-focused))
                      (.focus @prev-focused))
                    (reset! prev-focused nil))
            activate (fn [id]
                       (setActiveProfile id)
                       (close))
            handle-entry-keydown (fn [event]
                                   (let [items (entries)
                                         current (.indexOf items (.-currentTarget event))]
                                     (case (.-key event)
                                       "ArrowDown" (do (.preventDefault event) (focus-entry (inc current)))
                                       "ArrowUp"   (do (.preventDefault event) (focus-entry (dec current)))
                                       "Enter"     (do (.preventDefault event) (activate (.-profileId (.-dataset (.-currentTarget event)))))
                                       "Escape"    (do (.preventDefault event) (close))
                                       nil)))
            render (fn []
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
            open (fn []
                   (reset! prev-focused (.-activeElement js/document))
                   (render)
                   (set! (.-hidden panel) false)
                   (focus-active-entry))]

        (render)
        (onProfileChange render)

        #js {:open open :close close :element panel}))))
