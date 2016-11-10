
(*
 *
 * COD TIMESERIES PLOT 1968 - 2014
 *
 *)

module Viz2 : sig
  val viz2_cod_by_year : string -> unit
end = struct

  let icd8_start,icd8_len = 74,3
  let icd9_start,icd9_len = 156,3
  let icd10a_start,icd10a_len = 156,2
  let icd10b_start,icd10b_len = 159,2

  (* get list of causes with counts, from raw line data:
   *   (cause name, count) *)
  let get_icdX_causes code_map (start,len) data =
    (* helper function to remove unused categories and combine different
     * instances of the same category *)
    let fold_categories cs = list_from_hash nchs.length
      (fun tbl -> List.map (fun (c,ct) -> (nchs.decode code_map c, ct)) cs
        |> List.iter (fun (cause,count) -> inc_table tbl (fun ct -> ct+count) (fun () -> count) cause)) in
    list_from_hash nchs.length
      (fun tbl -> List.iter (fun l -> String.sub l start len
        |> ios
        |> inc_table tbl (fun prevct -> prevct + 1) (fun () -> 1)) data)
    |> fold_categories

  (* good for 68 - 78 *)
  let get_icd8_causes = get_icdX_causes nchs.recode34 (icd8_start,icd8_len)
  (* good for 79 - 98 *)
  let get_icd9_causes = get_icdX_causes nchs.recode34 (icd9_start,icd9_len)
  (* good for 99 - 14 *)
  let get_icd10a_causes = get_icdX_causes nchs.recode39 (icd10a_start,icd10a_len)
  let get_icd10b_causes = get_icdX_causes nchs.recode39 (icd10b_start,icd10b_len)

  (* read the linedata for years in the range, data in file "MORT__"
   * map to a list of year, [causes with counts] pairs*)
  let read_yearly_causes causefun range =
    List.map (fun year ->
      String.sub (soi year) 2 2
      |> sprintf "raw/MORT%s"
      |> lines
      |> causefun
      |> fun causes -> (year,causes)
    ) range

  (* normalize raw numbers to percentage of total deaths in a given year *)
  let normalize_yearly_causes yearly_causes =
    List.map (fun (year,causes) ->
      let total = List.fold_left (fun acc (cause,count) -> acc + count) 0 causes |> foi in
      (year, List.map (fun (cause,count) -> (cause, (foi count) /. total)) causes)) yearly_causes

  (* get the yearly statistics for cause of death, using datasets of the
   * 1968-1978 format. return a list of causes with yearly pairs:
   *   (cause, [(19__,count);...]);... *)
  let yearly_causes_to_timeseries yearly_cause_data =
    list_from_hash nchs.length
      (fun tbl -> List.iter (fun (year,data) ->
        List.iter (fun (cause,count) ->
          inc_table tbl
            (fun yearct -> yearct @ [(year,count)])
            (fun () -> [(year,count)]) cause
        ) data
      ) yearly_cause_data)


  let timeseries_to_json ts =
    `Dict (List.map (fun (cause,years) ->
      (cause, `List (List.map (fun (yr,pct) -> `List [`Int yr; `Float pct]) years))) ts)

  (* generate and save the json file for timeseries cause of death data *)
  let viz2_cod_by_year (* timeseries_1968_1998 *) fname =
    read_yearly_causes get_icd8_causes (1968|..|1978) (* get first year set data (ICD8) *)
    |> fun y68_78 -> y68_78 @ (read_yearly_causes get_icd9_causes (1979|..|1998)) (* ICD9 set data *)
    |> fun y68_98 -> y68_98 @ (read_yearly_causes get_icd10a_causes (1999|..|2002)) (* yes, ICD10 is encoded two different ways *)
    |> fun y68_02 -> y68_02 @ (read_yearly_causes get_icd10b_causes (2003|..|2014))
    |> normalize_yearly_causes
    |> yearly_causes_to_timeseries (* map to timeseries data *)
    |> timeseries_to_json (* transform to internal json format *)
    |> json_to_string
    |~~> fname

end;;