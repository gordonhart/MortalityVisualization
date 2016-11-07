
(*
 * Statistical Analysis Tools
 *)


(* find the mean of an int list *)
let mean il =
  (foi (List.fold_left (+) 0 il)) /. (foi (List.length il));;

(* find standard deviation of an int list *)
let stdev mu il =
  sqrt ((1. /. (foi (List.length il))) *.
    (List.fold_left (fun acc x -> acc +. (((foi x) -. mu) ** 2.)) 0.0 il));;

let variance mu il =
  (stdev mu il) ** 2.;;


