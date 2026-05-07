(ns calva)

(def ^:export CALVA_BINDINGS
  [{:key "Ctrl-Alt-ArrowRight" :label "slurp-forward"}
   {:key "Ctrl-Alt-Shift-ArrowLeft" :label "slurp-backward"}
   {:key "Ctrl-Alt-ArrowLeft" :label "barf-forward"}
   {:key "Ctrl-Alt-Shift-ArrowRight" :label "barf-backward"}
   {:key "Ctrl-Alt-r" :label "raise-sexp"}
   {:key "Ctrl-Alt-s" :label "splice-sexp"}
   {:key "Ctrl-Shift-s" :label "split-sexp"}
   {:key "Ctrl-Shift-j" :label "join-sexp"}])
