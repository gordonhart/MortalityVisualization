
(*
 * Statistical Analysis Tools
 *)


(* find the mean of an int list *)
let mean il = (foi (List.fold_left (+) 0 il)) /. (foi (List.length il));;

(* find standard deviation of an int list *)
let stdev mu il =
  sqrt ((1. /. (foi (List.length il))) *.
    (List.fold_left (fun acc x -> acc +. (((foi x) -. mu) ** 2.)) 0.0 il));;

(* mean of float list *)
let meanf fl = (List.fold_left (+.) 0. fl) /. (foi (List.length fl));;

(* find standard deviation of an int list *)
let stdevf mu fl =
  sqrt ((1. /. (foi (List.length fl))) *.
    (List.fold_left (fun acc x -> acc +. ((x -. mu) ** 2.)) 0.0 fl));;

let variance mu il =
  (stdev mu il) ** 2.;;

let gaussian mu sigma x =
  (1./.(sqrt (2.*.sigma*.pi))) *. exp (((x-.mu)**2.)/.(-.2.*.sigma));;



