
type json =
  [ `List of json list
  | `Dict of (string * json) list
  | `Float of float
  | `Int of int
  | `String of string
  | `Bool of bool
  | `Null ];;


let json_to_string j =
  let chop_last s =
    let len = String.length s in
    if len > 0 then String.sub s 0 (len - 1) else s in
  let fold_chop f start_token l end_token =
    List.fold_left f start_token l
    |> chop_last
    |> fun s -> s ^ end_token in
  let rec jsonify = function
    | `List   l -> fold_chop (fun acc j -> acc ^ (jsonify j)) "[" l "],"
    | `Dict   d -> fold_chop (fun acc (k,v) -> acc ^ (sprintf "\"%s\": %s" k (jsonify v))) "{" d "},"
    | `Float  f -> sprintf "%0.7f," f
    | `Int    i -> sprintf "%d," i
    | `String s -> sprintf "\"%s\"," s
    | `Bool   b -> sprintf "%b," b in
  j |> jsonify |> chop_last;;

