

(* helper to fold a hashtable into a (key,value) pair list *)
let loh h = Hashtbl.fold (fun key value acc -> (key,value) :: acc) h [];;

(* expand a (key,value) pair list into a hashtable, with custom definiton
 * for how key,value are passed *)
let hol keymap l =
  let tbl = Hashtbl.create (List.length l) in
  List.iter (fun item -> keymap item
    |> fun (k,v) -> Hashtbl.add tbl k v) l;
  tbl;;

(* reusable increment function *)
let inc_table table incfun base key =
  if Hashtbl.mem table key then Hashtbl.replace table key (incfun (Hashtbl.find table key))
  else Hashtbl.add table key (base ());;

(* reusable function to create temporary hashtable and return list *)
let list_from_hash size populatefun =
  Hashtbl.create size
  |> fun tbl -> populatefun tbl; tbl
  |> loh;;

(* helper funcction to chop off last char in string (for jsonification) *)
let chop_last s =
  let len = String.length s in
  if len > 0 then String.sub s 0 (len - 1) else s;;

(* final steps to prepare json *)
let json_cleanup d = d
  |> chop_last
  |> sprintf "{%s}"
  |> Str.global_replace (Str.regexp "'") "\"";;




(* read a file and split by linesep *)
let lines fname =
  ~~|> fname
  |> Str.split (Str.regexp "\n");;

(* tail recursive map to prevent overflow *)
let maptr f l =
  let rec m acc = function
    | [] -> acc
    | h::t -> m ((f h) :: acc) t in
  m [] l;;
