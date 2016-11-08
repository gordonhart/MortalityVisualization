
(* category number(s), category name *)
let num_nchs_categories = 37;;
let icd8_start,icd8_len = 74,3;;
let icd9_start,icd9_len = 156,3;;
let icd10a_start,icd10a_len = 156,2;;
let icd10b_start,icd10b_len = 159,2;;

(* 34 cause recode *)
let nchs_categories = [
  ([010],"Tuberculosis");
  ([020],"Venereal Diseases");
  ([030],"Other Infectious Diseases");
  ([050;060;070;080;090;100;110],"Cancer");
  ([120],"Diabetes");
  ([160;190],"Hypertension");
  ([150;170;180],"Heart Disease");
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
  ([330],"Vehicular Accidents");
  ([340],"Other Accidental Causes");
  ([350],"Suicide");
  ([360],"Homicide");
  ([370],"Mortal Events of Undetermined Intent");
];;

(* 39 cause recode : not exactly the same but close enough *)
let icd10_nchs_categories = [
  ([001],"Tuberculosis");
  ([002;003],"Venereal Diseases");
  ([004;005;006;007;008;009;010;011;012;013;014;015],"Cancer");
  ([016],"Diabetes");
  ([017],"Alzheimer's");
  ([018;019;021;022],"Heart Disease");
  ([020;023],"Hypertension");
  ([024],"Cerebrovascular Disease");
  ([025;026],"Circulatory Disease");
  ([027],"Influenza and Pneumonia");
  ([028],"Bronchitis / COPD");
  ([029],"Digestive Tract Disease");
  ([030],"Cirrhosis of the Liver");
  ([031],"Nephritis and Nephrosis");
  ([032],"Pregnancy Complications");
  ([033],"Perinatal Complications");
  ([034],"Congenital Anomalies");
  ([035;036],"Other Infectious Diseases");
  ([037],"Other Unspecified Disease");
  ([038],"Vehicular Accidents");
  ([039],"Other Accidental Causes");
  ([040],"Suicide");
  ([041],"Homicide");
  ([042],"Mortal Events of Undetermined Intent")
];;

(* transform a code to a name *)
let nchs_code_to_name code_map code =
  List.fold_left (fun acc (cl,name) ->
    if List.exists (fun c -> c=code) cl then name else acc
  ) (sprintf "Unable to Find code %d" code) code_map;;

(*
 *
 * COD TIMESERIES PLOT 1968 - 2014
 *
 *)

(* get list of causes with counts, from raw line data:
 *   (cause name, count) *)
let get_icdX_causes code_map (start,len) data =
  (* helper function to remove unused categories and combine different
   * instances of the same category *)
  let fold_categories cs = list_from_hash num_nchs_categories
    (fun tbl -> List.map (fun (c,ct) -> (nchs_code_to_name code_map c, ct)) cs
      |> List.iter (fun (cause,count) -> inc_table tbl (fun ct -> ct+count) (fun () -> count) cause)) in
  list_from_hash num_nchs_categories
    (fun tbl -> List.iter (fun l -> String.sub l start len
      |> ios
      |> inc_table tbl (fun prevct -> prevct + 1) (fun () -> 1)) data)
  |> fold_categories;;

(* good for 68 - 78 *)
let get_icd8_causes = get_icdX_causes nchs_categories (icd8_start,icd8_len);;
(* good for 79 - 98 *)
let get_icd9_causes = get_icdX_causes nchs_categories (icd9_start,icd9_len);;
(* good for 99 - 14 *)
let get_icd10a_causes = get_icdX_causes icd10_nchs_categories (icd10a_start,icd10a_len);;
let get_icd10b_causes = get_icdX_causes icd10_nchs_categories (icd10b_start,icd10b_len);;

(* read the linedata for years in the range, data in file "MORT__"
 * map to a list of year, [causes with counts] pairs*)
let read_yearly_causes causefun range =
  List.map (fun year ->
    String.sub (soi year) 2 2
    |> sprintf "raw/MORT%s"
    |> lines
    |> causefun
    |> fun causes -> (year,causes)
  ) range;;

(* normalize raw numbers to percentage of total deaths in a given year *)
let normalize_yearly_causes yearly_causes =
  List.map (fun (year,causes) ->
    let total = List.fold_left (fun acc (cause,count) -> acc + count) 0 causes |> foi in
    (year, List.map (fun (cause,count) -> (cause, (foi count) /. total)) causes)) yearly_causes;;

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


let timeseries_to_json ts =
  `Dict (List.map (fun (cause,years) ->
    (cause, `List (List.map (fun (yr,pct) -> `List [`Int yr; `Float pct]) years))) ts);;

(* and the full pipeline:
 *   "yearly_causes_68-78.json" <|~~ (read_yearly_causes get_icd8_causes (68|..|78) |> yearly_causes_to_timeseries |> timeseries_to_json)
 *)

(*
 * 1968-1988 together:
 * read_yearly_causes get_icd8_causes (68|..|78) @ read_yearly_causes get_icd9_causes
 * (79|..|88)
 *)

