(ns profiles.resolve
  (:require ["./registry" :refer [PROFILES]]))

(defn- resolve-profile [profile-id registry path]
  (when (.includes path profile-id)
    (throw (js/Error. (str "Circular profile extends chain: "
                           (.join (conj (vec path) profile-id) " -> ")))))
  (let [profile (aget registry profile-id)]
    (if-not profile
      #js {}
      (let [parent-bindings (if (.-extends profile)
                              (resolve-profile (.-extends profile) registry
                                               (conj (vec path) profile-id))
                              #js {})]
        (js/Object.assign #js {} parent-bindings (.-bindings profile))))))

(defn ^:export resolveBindings
  ([profile-id] (resolveBindings profile-id PROFILES))
  ([profile-id registry]
   (let [profile (aget registry profile-id)]
     (if-not profile
       #js {}
       (resolve-profile profile-id registry [])))))
