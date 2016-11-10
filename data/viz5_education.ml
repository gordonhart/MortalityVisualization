
(*
 * Age of Death by Education Level 2014
 *)

module Viz5 : sig
  val viz5_education : string -> unit
end = struct

  let start_edu,len_edu = 62,1
  let start_age,len_age = 69,4

  (* map education code to (code,level in words) pairs *)
  let edu_decode ecode =
    let edu_levels = [
      "8th grade or less";
      "9 - 12th grade, no diploma";
      "High school graduate or GED completed";
      "Some college credit, but no degree";
      "Associate degree";
      "Bachelor's degree";
      "Master's degree";
      "Doctorate or professional degree";
    ] in
    try (ecode, List.nth edu_levels (ecode-1))
    with _ -> (0,"Unknown")

  (* map ((education code,education words), death age) triplets to json *)
  let edu_age_to_json eal =
    (* shrink list by accumulating counts for each age,edu level pair *)
    let gen_counts l =
      list_from_hash 500
        (fun tbl -> List.iter (fun ((ecode,elevel),age) ->
          inc_table tbl (fun ct -> ct+1) (fun () -> 1) (ecode,elevel,age)) l)
      |> List.map (fun ((ecode,elevel,age),ct) -> (ecode,elevel,age,ct)) in
    (* generate mean values for age by education *)
    let gen_means l =
      list_from_hash 10
        (fun tbl -> List.iter (fun (edu,age) ->
          inc_table tbl (fun agelist -> age :: agelist) (fun () -> [age]) edu) l)
      |> List.map (fun (edu,agelist) -> (edu,mean agelist)) in
    `Dict [
    ("data", `List (List.map (fun (ecode,elevel,age,ct) ->
      `Dict [
        ("edu-code",`Int ecode);
        ("edu-level",`String elevel);
        ("age",`Int age);
        ("count",`Int ct)]) (gen_counts eal)));
    ("means", `List (List.map (fun ((ecode,elevel),amean) ->
      `Dict [
        ("edu-code",`Int ecode);
        ("edu-level",`String elevel);
        ("mean-age",`Float amean)]) (gen_means eal)))]

  let viz5_education fname =
    lines "raw/MORT14"
    |> maptr (fun l -> (String.sub l start_edu len_edu, String.sub l start_age len_age |> icd10_age))
    |> List.fold_left (fun acc (e,age) -> if age<0 || e=" " then acc
        else (e |> ios |> edu_decode, age)::acc) [] (* remove negative ages, blank edu sections *)
    |> edu_age_to_json
    |> json_to_string
    |~~> fname

end;;
