

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


(* read, format, and write out life expectancy data (completely different source) *)
let viz3_lifeexp fname =
  let lifeexp_to_json l =
    `Dict [("data",
      `List (List.map (fun (yr,f,m) ->
        `Dict [("year",`Int yr);("female",`Float f);("male",`Float m)]) l))] in
  lines "raw/LifeExpectancy1950-2050.csv"
  |> List.map (Str.split (Str.regexp ","))
  |> List.tl
  |> List.map (fun l -> (List.nth l 0, List.nth l 1, List.nth l 2))
  |> List.map (fun (yr,f,m) -> (String.sub yr (String.length yr - 4) 4,f,m))
  |> List.map (fun (yr,f,m) -> (ios yr, fos f, fos m))
  |> List.fold_left (fun acc (yr,f,m) -> if yr < 1965 || yr > 2014 then acc else (yr,f,m)::acc) []
  |> lifeexp_to_json
  |> json_to_string
  |> fun json -> fname <|~~ json;;


(* generate mean,stdev age at death for each death cause over years 1968-2014 *)
let viz4_gendata fname =
  List.map (read_yearly_cod_ages viz4_icd8_9_causes viz4_icd8) (1968|..|1978)
  |> fun y68_78 -> y68_78 @ (List.map (read_yearly_cod_ages viz4_icd8_9_causes viz4_icd9) (1979|..|1998))
  |> fun y68_98 -> y68_98 @ (List.map (read_yearly_cod_ages viz4_icd10_causes viz4_icd10a) (1999|..|2002))
  |> fun y68_02 -> y68_02 @ (List.map (read_yearly_cod_ages viz4_icd10_causes viz4_icd10b) (2003|..|2014))
  |> fun yearlist -> list_from_hash num_nchs_categories
      (fun tbl -> List.iteri (fun i causelist ->
        List.iter (fun (cause,mu,stdev) -> inc_table tbl (fun mus -> (1968 + i,mu,stdev) :: mus)
          (fun () -> [(1968 + i,mu,stdev)]) cause) causelist) yearlist)
  |> jsonify_cod_age_list
  |> json_to_string
  |> fun json -> fname <|~~ json;;



