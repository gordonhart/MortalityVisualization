
(*
 * Find the percentage of deaths attributable to a disease
 * for a given year of life, ultimately return timeseries showing
 * the 22 disease types and their likelihood to kill you as your
 * life progresses.
 *
 * Visualize with an animated bar graph with age on the time axis
 *)

module Viz6 : sig
  val viz6_dangers : string -> unit
end = struct

  let get_age_and_cod lines =
    maptr (fun l -> (String.sub l 69 4 |> icd10_age,
      String.sub l 159 2 |> ios |> nchs.decode nchs.recode39)) lines

  let group_by_ages cods =
    list_from_hash 150
      (fun tbl -> List.iter (fun (age,cod) ->
        inc_table tbl (fun acods -> cod::acods) (fun () -> [cod]) age) cods)

  let group_causes age_codlist =
    List.map (fun (age,codlist) -> (age,list_from_hash 25
      (fun tbl -> List.iter (inc_table tbl (fun codct -> codct+1) (fun () -> 1)) codlist))) age_codlist

  let normalize_counts age_codlist =
    List.map (fun (age,codcts) -> (age, List.fold_left (fun acc (cod,ct) -> acc+ct) 0 codcts
      |> foi |> fun total -> maptr (fun (cod,ct) -> (cod,(foi ct) /. total)) codcts)) age_codlist

  let add_missing_causes age_codlist =
    let full_fields = List.fold_left (fun acc (a,cl) ->
      if (List.length cl) > (List.length acc) then (List.map fst cl) else acc) [] age_codlist in
    List.map (fun (a,cl) ->
      (a, cl @ (List.fold_left (fun acc f ->
        if List.exists (fun (c,pct) -> c=f) cl then acc else (f,0.0)::acc) [] full_fields))) age_codlist

  let sort_by_age = List.sort (fun (a1,_) (a2,_) -> a1-a2)
  let sort_causes = List.map (fun (a,cods) -> (a,List.sort (fun (c1,_) (c2,_) -> String.compare c1 c2) cods))
  let remove_invalid_ages = List.filter (fun (a,_) -> a>=0)

  let jsonify_dangers dl = `Dict [
    ("data",`List (List.map (fun (age,causelist) -> `Dict [
      ("age",`Int age);
      ("causes",`List (List.map (fun (c,pct) -> `Dict [
        ("cause",`String c);
        ("percent",`Float pct)]) causelist))]) dl))]

  let viz6_dangers fname =
    lines "raw/MORT14" (* read 2014 mortality data *)
    |> get_age_and_cod (* map to (age, cause of death) pairs *)
    |> group_by_ages (* group data into (age, [causes]) list *)
    |> group_causes (* group data in each year to (age,[(cause,count)]) pairs *)
    |> normalize_counts (* change counts to percentages of total deaths for that age *)
    |> add_missing_causes (* add any fields that did not result in any deaths for a certain age *)
    |> sort_by_age (* sort by age, ascending *)
    |> sort_causes (* sort causes by cause name, alphabetical *)
    |> remove_invalid_ages (* get rid of negative ages (undefined in dataset) *)
    |> jsonify_dangers (* turn (age,[(cause,pct)]) pairs into internal json *)
    |> json_to_string (* stringify the json *)
    |~~> fname (* write out *)

end;;


