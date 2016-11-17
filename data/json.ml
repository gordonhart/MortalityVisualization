

(* currently only used for output, could be used for input at a later
 * data but I don't have much interest in writing a parser.
 *
 * plus, actually performing operations using this as a data type
 * kind of sucks. vastly prefer using list/record/whatever structures
 * until it's time for output, then using this mini-module as a
 * one-way street *)


(* type description for an internal representation of json *)
(*
type json =
  [ `List of json list
  | `Dict of (string * json) list
  | `Float of float
  | `Int of int
  | `String of string
  | `Bool of bool
  | `Null ];;
*)

(* use custom json type, not yojson's polymorphic json (why doesn't it
 * use a standard enum?) *)
type json =
  | Dict of (string * json) list
  | List of json list
  | Float of float
  | Int of int
  | String of string
  | Bool of bool
  | Null;;


(* transform json into a single-line valid "minified" string
 * (run it through a formatter if you want to read it) *)
let json_to_string j =
  let chop_last s =
    let len = String.length s in
    if len > 0 then String.sub s 0 (len - 1) else s in
  let fold_chop f start_token l end_token =
    List.fold_left f start_token l
    |> chop_last
    |> fun s -> s ^ end_token in
  let rec jsonify = function
    | List l -> fold_chop (fun acc j -> acc ^ (jsonify j)) "[ " l "],"
    | Dict d -> fold_chop (fun acc (k,v) -> acc ^ (sprintf "\"%s\":%s" k (jsonify v))) "{ " d "},"
    | Float f -> sprintf "%0.7f," f
    | Int i -> sprintf "%d," i
    | String s -> sprintf "\"%s\"," s
    | Bool b -> sprintf "%b," b
    | Null -> "null," in
  j |> jsonify |> chop_last;;


(* transform yojson basic polymorphic json to strict json *)
let rec yojson_to_regular = function
  | `Assoc l -> Dict (List.map (fun (s,j) -> s,yojson_to_regular j) l)
  | `List l -> List (List.map yojson_to_regular l)
  | `Float f -> Float f
  | `Int i -> Int i
  | `String s -> String s
  | `Bool b -> Bool b
  | `Null -> Null;;


(* example for reading alzheimer's data back from file *)
let alz () =
  Yojson.Basic.from_file "json/pmf_1968-2014.json"
  |> yojson_to_regular
  |> (function Dict l -> List.filter (fun (f,_) -> f="Alzheimer's") l | _ -> failwith "?")
  |> fun a -> List.nth a 0
  |> snd
  |> (function List l -> l | _ -> failwith "?")q
  |> List.map (function Dict a -> List.nth a 0, List.nth a 1 | _ -> failwith "?")
  |> List.map (function ((_,Int x),(_,Float y)) -> x,y | _ -> failwith "?");;



