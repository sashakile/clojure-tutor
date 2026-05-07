(ns profiles.state
  (:require ["./registry" :refer [PROFILES]]))

(def ^:private active-profile (atom "default"))
(def ^:private subscribers (atom []))

(defn ^:export getActiveProfile []
  @active-profile)

(defn ^:export setActiveProfile [id]
  (when (and (aget PROFILES id) (not= id @active-profile))
    (let [previous @active-profile]
      (reset! active-profile id)
      (doseq [sub @subscribers]
        (sub @active-profile previous)))))

(defn ^:export onProfileChange [f]
  (swap! subscribers conj f)
  (fn [] (swap! subscribers (fn [subs] (vec (filter #(not (identical? % f)) subs))))))
