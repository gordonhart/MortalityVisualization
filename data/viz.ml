

(*
 * collection of the final functions required to assemble each visualization
 *
 * each function should start with a read of the raw data from the
 * filesystem and end with a write out of constructed json
 *)


(* function to create the json from start to finish for the viz1
 * multiple cause graph *)
let viz1_gendata fname =
  lines "raw/MORT14" (* read raw text lines from file MORT14 *)
  |> lines_to_mulcause (* map lines to cause, [preexisting] pairs *)
  |> mulcause_to_humanized (* map ICD codes to humanized names *)
  |> humanized_to_graph (* transform to graph structure by summing occurrences *)
  |> graph_to_json (* transform graph structure to json string *)
  |> fun json -> fname <|~~ json;; (* write json string to file *)


(* generate and save the json file for timeseries cause of death data *)
let viz2_gendata (* timeseries_1968_1998 *) fname =
  read_yearly_causes get_icd8_causes (1968|..|1978) (* get first year set data (ICD8) *)
  |> fun y68_78 -> y68_78 @ (read_yearly_causes get_icd9_causes (1979|..|1998)) (* ICD9 set data *)
  |> fun y68_98 -> y68_98 @ (read_yearly_causes get_icd10a_causes (1999|..|2002)) (* yes, ICD10 is encoded two different ways *)
  |> fun y68_02 -> y68_02 @ (read_yearly_causes get_icd10b_causes (2003|..|2014))
  |> normalize_yearly_causes
  |> yearly_causes_to_timeseries (* map to timeseries data *)
  |> timeseries_to_json (* transform to json string *)
  |> fun json -> fname <|~~ json;; (* write json string out *)


(* find mean age at death for each year *)
let viz3_gendata fname =
  let read_and_map decoder yr = lines (sprintf "raw/MORT%02d" yr) |> yearly_age_stats decoder in
  List.map (read_and_map icd8) (68|..|78)
  |> fun y68_78 -> y68_78 @ (List.map (read_and_map icd9) ((79|..|99) @ (0|..|2)))
  |> fun y68_02 -> y68_02 @ (List.map (read_and_map icd10) (3|..|14))
  |> List.mapi (fun i (m,f) -> (1968 + i,m,f))
  |> agedata_to_json
  |> fun json -> fname <|~~ json;;



