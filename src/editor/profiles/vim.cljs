(ns editor.profiles.vim
  (:require ["@replit/codemirror-vim" :refer [Vim]]
            ["../../validation/command-wrapper.js" :refer [wrapCommand]]))

(defn ^:export vimProfile [bindings log]
  (doseq [b bindings]
    (let [action-name (str "clt-" (.-label b))]
      (.defineAction Vim action-name
                     (fn [cm]
                       (let [view (.-cm6 cm)]
                         ((wrapCommand (.-command b) (.-label b) log) view))))
      (.mapCommand Vim (.-motionKey b) "action" action-name js/undefined
                   #js {:context "normal"})))
  #js [])
