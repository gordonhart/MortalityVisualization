
(*
 * Find the percentage of deaths attributable to a disease
 * for a given year of life, ultimately return timeseries showing
 * the 22 disease types and their likelihood to kill you as your
 * life progresses.
 *
 * Visualize with an animated bar graph with age on the time axis
 *)


let get_age_and_cod line =
  (String.sub line 159 2 |> ios |> nchs_code_to_name icd10_nchs_categories,
    String.sub line 69 4 |> icd10_age);;


let sort_by_ages cods =
  list_from_hash 150
    (fun tbl -> List.iter (fun (cod,age) ->
      inc_table tbl (fun acods -> cod::acods) (fun () -> [cod]) age) cods);;


let sort_by_cod (age,codlist) =
  list_from_hash 25
    (fun tbl -> List.iter (inc_table tbl (fun codct -> codct+1) (fun () -> 1)) codlist)
  |> fun sorted -> (age,sorted);;


let normalize_counts (age,codcts) =
  List.fold_left (fun acc (cod,ct) -> acc+ct) 0 codcts
  |> foi
  |> fun total -> maptr (fun (cod,ct) -> (cod,(foi ct) /. total)) codcts
  |> fun normalized -> (age,normalized);;


(* transform list of (age,[(cause,pct)]) pairs to json *)
let jsonify_dangers dl =
  `Dict [
    ("data",
    `List (List.map (fun (age,causelist) ->
      `Dict [
      ("age",`Int age);
      ("causes",`List (List.map (fun (c,pct) ->
        `Dict [
        ("cause",`String c);
        ("percent",`Float pct)]) causelist))]) dl))];;


let viz6_gendata fname =
  lines "raw/MORT14"
  |> maptr get_age_and_cod
  |> sort_by_ages
  |> List.map sort_by_cod
  |> List.map normalize_counts
  |> List.sort (fun (a1,_) (a2,_) -> a1-a2)
  |> List.map (fun (a,cods) -> (a,List.sort (fun (c1,_) (c2,_) -> String.compare c1 c2) cods))
  |> List.filter (fun (a,_) -> a>=0)
  |> jsonify_dangers
  |> json_to_string
  |~~> fname;;

