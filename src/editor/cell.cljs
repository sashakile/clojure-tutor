(ns editor.cell
  (:require ["@codemirror/state" :refer [EditorState]]
            ["@codemirror/view" :refer [EditorView keymap]]
            ["@codemirror/commands" :refer [defaultKeymap indentWithTab]]
            ["@nextjournal/clojure-mode" :refer [default_extensions paredit_keymap]]
            ["@replit/codemirror-vim" :refer [vim]]
            ["@replit/codemirror-emacs" :refer [emacs]]
            ["../validation/action-log.js" :refer [create]]
            ["../profiles/state" :refer [getActiveProfile]]
            ["../profiles/resolve" :refer [resolveBindings]]
            ["./profiles/default" :refer [defaultProfile]]
            ["./profiles/vim" :refer [vimProfile]]
            ["./profiles/emacs" :refer [emacsProfile]]))

(defn- find-paredit-cmd [text]
  (let [entry (.find paredit_keymap (fn [k] (and (.-doc k) (.includes (.-doc k) text))))]
    (when-not (and entry (.-run entry))
      (throw (js/Error. (str "Paredit command not found: " text))))
    (.-run entry)))

(def ^:private COMMANDS
  #js {"slurp-forward"  (find-paredit-cmd "Expand collection to include form to the right")
       "barf-forward"   (find-paredit-cmd "Shrink collection forwards")
       "barf-backward"  (find-paredit-cmd "Shrink collection backwards")
       "slurp-backward" (find-paredit-cmd "Grow collection backwards")
       "splice-sexp"    (find-paredit-cmd "Lift contents of collection into parent")})

(defn- binding-entries [bindings]
  (vec
   (filter identity
           (map (fn [[cmd-kw key]]
                  (let [label (if (.startsWith cmd-kw ":") (.slice cmd-kw 1) cmd-kw)
                        command (aget COMMANDS label)]
                    (when command
                      #js {:key key :motionKey key :command command :label label})))
                (js/Object.entries bindings)))))

(defn- profile-kind-from-bindings [bindings]
  (let [slurp (or (aget bindings "slurp-forward") (aget bindings ":slurp-forward"))]
    (cond
      (= slurp ">") "vim"
      (= slurp "F5") "emacs"
      :else "default")))

(defn- profile-extensions [bindings log]
  (let [entries (binding-entries bindings)
        kind (profile-kind-from-bindings bindings)]
    (case kind
      "vim"   (concat [(vim)] (js/Array.from (vimProfile entries log)))
      "emacs" (concat [(emacs)] (js/Array.from (emacsProfile entries log)))
      [(defaultProfile entries log)])))

(defn ^:export createCell
  ([parent] (createCell parent #js {}))
  ([parent opts]
   (let [on-eval (.-onEval opts)
         current-bindings (atom (or (.-bindings opts) (resolveBindings (getActiveProfile))))
         view-ref (atom nil)
         action-log-ref (atom nil)
         eval-exts (fn []
                     (if on-eval
                       [(.of keymap (into-array [#js {:key "Mod-Enter"
                                                      :run (fn [ev] (on-eval ev) true)}]))]
                       []))
         mount (fn mount
                 ([] (mount ""))
                 ([doc]
                  (let [log (create)]
                    (reset! action-log-ref log)
                    (let [view (EditorView.
                                #js {:state (.create EditorState
                                             #js {:doc doc
                                                  :extensions (into-array
                                                               (concat
                                                                (profile-extensions @current-bindings log)
                                                                (eval-exts)
                                                                [(.of keymap (into-array
                                                                              (concat
                                                                               (js/Array.from defaultKeymap)
                                                                               [indentWithTab])))]
                                                                (js/Array.from default_extensions)))})
                                     :parent parent})]
                      (set! (.-actionLog view) log)
                      (reset! view-ref view)
                      view))))]
     (mount)
     (let [cell #js {:dispatch (fn [& args]
                                  (.apply (.-dispatch @view-ref) @view-ref (into-array args)))
                     :focus (fn [] (.focus @view-ref))
                     :reinitProfile (fn [next-bindings]
                                      (reset! current-bindings next-bindings)
                                      (let [doc (.toString (.-doc (.-state @view-ref)))]
                                        (.destroy @view-ref)
                                        (mount doc)))}]
       (.defineProperties js/Object cell
                          #js {:view       #js {:get (fn [] @view-ref) :configurable true}
                               :state      #js {:get (fn [] (.-state @view-ref)) :configurable true}
                               :dom        #js {:get (fn [] (.-dom @view-ref)) :configurable true}
                               :contentDOM #js {:get (fn [] (.-contentDOM @view-ref)) :configurable true}
                               :actionLog  #js {:get (fn [] @action-log-ref) :configurable true}})
       cell))))
