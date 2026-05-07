(ns pipeline.eval
  (:require ["squint-cljs/core.js" :as sq-core]
            ["squint-cljs" :refer [compileString]]))

(def ^:private re-var (js/RegExp. "^var (\\w+) = ([\\s\\S]*);$"))

(defn- strip-and-process [compiled]
  (vec
   (->> (js/Array.from (.split compiled "\n"))
        (filter (fn [l]
                  (and (not (.startsWith l "import "))
                       (not (.startsWith l "export {"))
                       (not= "" (.trim l)))))
        (map (fn [line]
               (let [m (.match line re-var)]
                 (if m
                   (str "window.__clt_session__[\"" (aget m 1) "\"] = " (aget m 2) ";")
                   line)))))))

(defn ^:export evalClojure [source]
  (set! (.-__clt_session__ js/window) (or (.-__clt_session__ js/window) #js {}))
  (try
    (let [compiled (compileString source)
          body-lines (strip-and-process compiled)]
      (if (zero? (.-length body-lines))
        #js {:result js/undefined :error nil}
        (let [session-keys (js/Array.from (js/Object.keys (.-__clt_session__ js/window)))
              session-inject (.join (vec (map (fn [k]
                                               (str "var " k " = window.__clt_session__[\"" k "\"];"))
                                             session-keys))
                                    "\n")
              last-line (last body-lines)
              rest-lines (vec (butlast body-lines))
              return-expr (.replace last-line (js/RegExp. ";$") "")
              code (.join (into-array [session-inject
                                       (.join rest-lines "\n")
                                       (str "return (" return-expr ");")])
                          "\n")
              f (js/Function. "squint_core" code)
              result (f sq-core)]
          #js {:result result :error nil})))
    (catch js/Error e
      #js {:result nil :error (.-message e)})))

(defn ^:export resetSession []
  (set! (.-__clt_session__ js/window) #js {}))
