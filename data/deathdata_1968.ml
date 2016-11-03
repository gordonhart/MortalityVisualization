
(* category number(s), category name *)
let num_nchs_categories = 37;;
let icd8_start,icd8_len = 74,3;;
let icd9_start,icd9_len = 156,3;;
let nchs_categories = [
  ([010],"Tuberculosis");
  ([020],"Venereal Diseases");
  ([030],"Other Infectious Diseases");
  ([050;060;070;080;090;100;110],"Cancer");
  ([120],"Diabetes");
  ([150],"Rheumatic Disease");
  ([160;190],"Hypertension");
  ([170;180],"Heart Disease");
  ([200],"Cerebrovascular Disease");
  ([210;220],"Circulatory Disease");
  ([230],"Influenza and Pneumonia");
  ([240],"Bronchitis / COPD");
  ([250],"Digestive Tract Disease");
  ([260],"Cirrhosis of the Liver");
  ([270],"Nephritis and Nephrosis");
  ([280],"Pregnancy Complications");
  ([290],"Congenital Anomalies");
  ([300],"Perinatal Complications");
  ([310],"System or Organ Failure");
  ([320],"Other Unspecified Disease");
  ([330],"Vehiclular Accidents");
  ([340],"Other Accidental Causes");
  ([350],"Suicide");
  ([360],"Homicide");
  ([370],"Mortal Events of Undetermined Intent");
];;

(* transform a code to a name *)
let nchs_code_to_name code =
  List.fold_left (fun acc (cl,name) ->
    if List.exists (fun c -> c=code) cl then name else acc
  ) (sprintf "Unable to Find code %d" code) nchs_categories;;

(*
 *
 * TIMESERIES PLOT 1968 - 1978
 *
 *)

(* get list of causes with counts, from raw line data:
 *   (cause name, count) *)
let get_icdX_causes (start,len) data =

  (* helper function to remove unused categories and combine different
   * instances of the same category *)
  let fold_categories cs = list_from_hash num_nchs_categories
    (fun tbl -> List.map (fun (c,ct) -> (nchs_code_to_name c, ct)) cs
      |> List.iter (fun (cause,count) -> inc_table tbl (fun ct -> ct+count) (fun () -> count) cause)) in

  list_from_hash num_nchs_categories
    (fun tbl -> List.iter (fun l -> String.sub l start len
      |> ios
      |> inc_table tbl (fun prevct -> prevct + 1) (fun () -> 1)) data)
  |> fold_categories;;

(* good for 68 - 78 *)
let get_icd8_causes = get_icdX_causes (icd8_start,icd8_len);;
(* good for 79 - 98 *)
let get_icd9_causes = get_icdX_causes (icd9_start,icd9_len);;

(* read the linedata for years in the range, data in file "MORT__"
 * map to a list of year, [causes with counts] pairs*)
let read_yearly_causes causefun range =
  List.map (fun year ->
    sprintf "MORT%02d" year
    |> lines
    |> causefun
    |> fun causes -> (year,causes)
  ) range;;

(* get the yearly statistics for cause of death, using datasets of the
 * 1968-1978 format. return a list of causes with yearly pairs:
 *   (cause, [(19__,count);...]);... *)
let yearly_causes_to_timeseries yearly_cause_data =
  list_from_hash num_nchs_categories
    (fun tbl -> List.iter (fun (year,data) ->
      List.iter (fun (cause,count) ->
        inc_table tbl
          (fun yearct -> yearct @ [(year,count)])
          (fun () -> [(year,count)]) cause
      ) data
    ) yearly_cause_data);;

(* finally, transform the yearly cause of death timeseries to json *)
let timeseries_to_json ts_data =
  List.fold_left (fun acc (cause,years) ->
    let yearlist = List.fold_left (fun yacc (yr,ct) ->
      yacc ^ (sprintf "[%d,%d]," yr ct)) "[" years in
    acc ^ (sprintf "'%s': %s]," cause (chop_last yearlist))
  ) "" ts_data
  |> chop_last
  |> sprintf "{%s}"
  |> Str.global_replace (Str.regexp "'") "\"";;

(* and the full pipeline:
 *   "yearly_causes_68-78.json" <|~~ (read_yearly_causes get_icd8_causes (68|..|78) |> yearly_causes_to_timeseries |> timeseries_to_json)
 *)

(*
 * 1968-1988 together:
 * read_yearly_causes get_icd8_causes (68|..|78) @ read_yearly_causes get_icd9_causes
 * (79|..|88)
 *)

(* generate and save the json file for timeseries cause of death data *)
let viz2_gendata (* timeseries_1968_1998 *) fname =
  read_yearly_causes get_icd8_causes (68|..|78) (* get first year set data (ICD8) *)
  |> fun y68_78 -> y68_78 @ (read_yearly_causes get_icd9_causes (79|..|98)) (* ICD9 set data *)
  (* |> fun y68_98 -> y68_98 @ (read_yearly_causes get_icd10_causes (99|..|14)) *)
  |> yearly_causes_to_timeseries (* map to timeseries data *)
  |> timeseries_to_json (* transform to json string *)
  |> fun json -> fname <|~~ json;; (* write json string out *)

