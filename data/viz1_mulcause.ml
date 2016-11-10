
(*
 *
 * MULTIPLE CAUSES GRAPH 2014
 *
 *)

module Viz1 : sig
  val viz1_mulcause : string -> unit
end = struct

  let start_icd,len_icd = 145,4
  let start_multiple,len_multiple = 166,138

  (* use hash table to store category codes for ICD-10
   * hash table key is the letter associated with the code,
   * returns a function accepting an integer on 0-999 to access
   * the disease type *)
  let icd_category_map = Hashtbl.create nchs.icd_length

  (* boolean tester to check if a 113 cause is within a specified range, inclusive *)
  let cause_range (b,e) cause =
    b <= cause && cause <= e

  (* define the lookup function: give pair of both short and long form name *)
  let lookup_fun range name =
    fun num -> if cause_range range num then Some name else None

  let () = (* populate the map *)
    List.iter (fun (cl,name,shortform) ->
      List.iter (fun (tag,lo,hi) -> Hashtbl.add icd_category_map tag (lookup_fun (lo,hi) (name,shortform))) cl
    ) nchs.recode113

  (* simple accessor to map *)
  let disease_type tag =
    let code = String.get tag 0 in
    try
      let num = ios (String.sub tag 1 (String.length tag - 1)) in
      let entries = Hashtbl.find_all icd_category_map code in
      List.fold_left (fun acc rangefun -> match rangefun num with
        | None -> acc
        | Some entry -> entry
      ) ("Codes for special purposes","Special Reasons") entries
    with _ -> failwith (sprintf "%s" (String.sub tag 1 (String.length tag-1)))

  (* multiple causes of death of the form:
   *   (icd_cause, [icd_preexisting])
   *
   * note that the first two digits of each preexisting condition
   * are more or less meaningless, so they are discarded *)
  let lines_to_mulcause data = data
    |> maptr (fun l ->
        (String.sub l start_icd len_icd (* cause *)
          |> Str.global_replace (Str.regexp " +") "",
         String.sub l start_multiple len_multiple (* multiple conditions *)
          |> Str.split (Str.regexp " +\([0-9][0-9]\)?")))

  (* transform an mc list to names *)
  let mulcause_to_humanized mc_data =
    maptr (fun (cause,multiple) -> (disease_type cause, maptr disease_type multiple)) mc_data

  (* turn a humanized dataset into a list of nodes
   *   (name, count, [(edge1, count); (edge2, count)...])
   * representing the name of the disease that caused death, the number
   * of times death was caused by said diseaese in the dataset, and the
   * number of times another certain disease was a preexisting condition
   * for a death of the given type
   *
   * intermediately, the nodes are stored as a hashtable of counts indexed
   * by disease category, with form (count, preexisting hashtable)
   * where preexisting hashtable is indexed by type, with count as value *)
  let humanized_to_graph humanized_data =
    (* define the node hashtable, populate with an entry for each disease *)
    let nodes = hol (fun (code,name,short) ->
      ((name,short),(0,Hashtbl.create nchs.icd_length))) nchs.recode113 in
    (* iterate through data, building counts *)
    List.iter (fun (cod,multiple) -> inc_table nodes
      (fun (ct,preex_ht) -> (* regular case: update existing hashtable *)
        List.iter (inc_table preex_ht (fun c -> c+1) (fun () -> 1)) multiple;
        (ct+1,preex_ht)) (* following will never be called (already initialized) *)
      (fun () -> failwith "never reach here") cod) humanized_data;
    (* fold hashtable of hashtables to list *)
    Hashtbl.fold (fun cond (ct,preex_ht) acc -> (cond,ct,loh preex_ht) :: acc) nodes []

  (* finally, transform the directed graph structure to json:
   *   dict of "nodename" : {ct,[edges]} *)
  let jsonify_graph gd =
    `Dict (List.map (fun ((name,short),ct,edges) -> (name,
      `Dict [
      ("short",`String short);
      ("count",`Int ct);
      ("edges",`List (List.map (fun ((ename,eshort),ect) ->
        `Dict [
        ("name",`String ename);
        ("short",`String eshort);
        ("count",`Int ect)]) edges))])) gd)

  let viz1_mulcause fname =
    lines "raw/MORT14" (* read raw text lines from file MORT14 *)
    |> lines_to_mulcause (* map lines to cause, [preexisting] pairs *)
    |> mulcause_to_humanized (* map ICD codes to humanized names *)
    |> humanized_to_graph (* transform to graph structure by summing occurrences *)
    |> jsonify_graph (* transform graph structure to internal json format *)
    |> json_to_string
    |~~> fname (* write json string to file *)

end;;


