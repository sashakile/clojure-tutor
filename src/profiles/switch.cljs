(ns profiles.switch
  (:require ["../pipeline/eval" :refer [resetSession]]
            ["./state" :refer [getActiveProfile setActiveProfile]]
            ["./resolve" :refer [resolveBindings]]))

(defn ^:export applyProfileSwitch
  ([new-id cells] (applyProfileSwitch new-id cells (getActiveProfile)))
  ([new-id cells previous-id]
   (try
     (let [bindings (resolveBindings new-id)]
       (doseq [cell cells]
         (.reinitProfile cell bindings))
       (resetSession)
       (doseq [cell cells]
         (.clear (.-actionLog cell))))
     (catch js/Error e
       (when (not= previous-id (getActiveProfile))
         (setActiveProfile previous-id))
       (throw e)))))
