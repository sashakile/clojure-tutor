(ns profiles.registry
  (:require ["../calva" :refer [CALVA_BINDINGS]]))

(defn- bindings-by-keyword [bindings]
  (js/Object.fromEntries
   (vec (map (fn [b] #js [(.-label b) (.-key b)]) bindings))))

(def ^:export DEFAULT_PROFILE
  #js {:id "default"
       :label "Default"
       :leader "g"
       :bindings #js {"slurp-forward" "Ctrl-ArrowRight"
                      "barf-forward" "Ctrl-ArrowLeft"}})

(def ^:export CALVA_PROFILE
  #js {:id "calva"
       :label "Calva"
       :leader "g"
       :bindings (bindings-by-keyword CALVA_BINDINGS)})

(def ^:export VIM_PROFILE
  #js {:id "vim"
       :label "Vim / Conjure"
       :leader "Space"
       :bindings #js {"slurp-forward" ">"}})

(def ^:export EMACS_PROFILE
  #js {:id "emacs"
       :label "Emacs / CIDER"
       :leader "g"
       :bindings #js {"slurp-forward" "F5"}})

(def ^:export PROFILES
  #js {:default DEFAULT_PROFILE
       :calva CALVA_PROFILE
       :vim VIM_PROFILE
       :emacs EMACS_PROFILE})
