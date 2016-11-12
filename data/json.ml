

(* currently only used for output, could be used for input at a later
 * data but I don't have much interest in writing a parser.
 *
 * plus, actually performing operations using this as a data type
 * kind of sucks. vastly prefer using list/record/whatever structures
 * until it's time for output, then using this mini-module as a
 * one-way street *)


(* type description for an internal representation of json *)
type json =
  [ `List of json list
  | `Dict of (string * json) list
  | `Float of float
  | `Int of int
  | `String of string
  | `Bool of bool
  | `Null ];;


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
    | `List l -> fold_chop (fun acc j -> acc ^ (jsonify j)) "[" l "],"
    | `Dict d -> fold_chop (fun acc (k,v) -> acc ^ (sprintf "\"%s\":%s" k (jsonify v))) "{" d "},"
    | `Float f -> sprintf "%0.7f," f
    | `Int i -> sprintf "%d," i
    | `String s -> sprintf "\"%s\"," s
    | `Bool b -> sprintf "%b," b in
  j |> jsonify |> chop_last;;


(* example for reading alzheimer's data back from file *)
let alz () =
  Yojson.Basic.from_file "json/pmf_1968-2014.json"
  |> fun j -> (match j with `Assoc l -> List.filter (fun (f,_) -> f="Alzheimer's") l | _ -> failwith "?")
  |> fun a -> List.nth a 0
  |> snd
  |> fun a -> (match a with `List l -> l | _ -> failwith "?")
  |> List.map (function `Assoc a -> List.nth a 0, List.nth a 1 | _ -> failwith "?")
  |> List.map (function ((_,`Int x),(_,`Float y)) -> x,y | _ -> failwith "?");;

