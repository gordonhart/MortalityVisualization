
(*
 * Visualize data based on location
 *)

module Viz8 : sig
  val viz8_states : string -> unit
end = struct

  (* fuck 2003-2014, inconsistent and some don't even have location *)
  let state_len,age_len = 2,3
  let icd8_state_start,icd8_age_start = 25,38 (* good for 1968-1978 *)
  let icd9_state_start,icd9_age_start = 30,63 (* good for 1979-2002 *)
  let icd8_cod_start,icd8_cod_len = 74,3 (* 68-78 *)
  let icd9_cod_start,icd9_cod_len = 156,3 (* 79-98 *)
  let icd10_cod_start,icd10_cod_len = 156,2 (* 99-02 *)

  let decode_state codestr =
    let states = [
      ("Alabama", "AL"); ("Alaska", "AK"); ("Arizona", "AZ"); ("Arkansas", "AR"); ("California", "CA");
      ("Colorado", "CO"); ("Connecticut", "CT"); ("Delaware", "DE"); ("District of Columbia", "DC");
      ("Florida", "FL"); ("Georgia", "GA"); ("Hawaii", "HI"); ("Idaho", "ID"); ("Illinois", "IL");
      ("Indiana", "IN"); ("Iowa", "IA"); ("Kansas", "KS"); ("Kentucky", "KY"); ("Louisiana", "LA");
      ("Maine", "ME"); ("Maryland", "MD"); ("Massachusetts", "MA"); ("Michigan", "MI"); ("Minnesota", "MN");
      ("Mississippi", "MS"); ("Missouri", "MO"); ("Montana", "MT"); ("Nebraska", "NE"); ("Nevada", "NV");
      ("New Hampshire", "NH"); ("New Jersey", "NJ"); ("New Mexico", "NM"); ("New York", "NY");
      ("North Carolina", "NC"); ("North Dakota", "ND"); ("Ohio", "OH"); ("Oklahoma", "OK");
      ("Oregon", "OR"); ("Pennsylvania", "PA"); ("Rhode Island", "RI"); ("South Carolina", "SC");
      ("South Dakota", "SD"); ("Tennessee", "TN"); ("Texas", "TX"); ("Utah", "UT"); ("Vermont", "VT");
      ("Virginia", "VA"); ("Washington", "WA"); ("West Virginia", "WV");
      ("Wisconsin", "WI"); ("Wyoming", "WY")] in
    try codestr |> ios |> List.nth states
    with _ -> ("Outside of the USA or unknown", "!!")

  let read_age_cod_state year =
    String.sub (soi year) 2 2
    |> sprintf "raw/MORT%s"
    |> lines
    |> fun ls -> (match year with
        | y when y >= 1968 && y <= 1978 ->
            (ls,icd8_state_start,icd8_age_start,icd8_cod_start,icd8_cod_len,nchs.decode nchs.recode34)
        | y when y >= 1979 && y <= 1998 ->
            (ls,icd9_state_start,icd9_age_start,icd9_cod_start,icd9_cod_len,nchs.decode nchs.recode34)
        | y when y >= 1999 && y <= 2002 ->
            (ls,icd9_state_start,icd9_age_start,icd10_cod_start,icd10_cod_len,nchs.decode nchs.recode39)
        | _ -> failwith "Can't read that year")
    |> fun (ls,sstart,astart,cstart,clen,cdecode) -> maptr (fun l ->
        (String.sub l sstart state_len |> decode_state,
          String.sub l astart age_len |> icd8_9_age,
          String.sub l cstart clen |> ios |> cdecode)) ls

  let group_states state_data =
    list_from_hash 51 (fun tbl -> List.iter (fun (state,age,cod) ->
      inc_table tbl (fun acl -> (age,cod)::acl) (fun () -> [(age,cod)]) state) state_data)

  let process_states =
    List.map (fun (state,age_cods) ->
      let ages = maptr fst age_cods in
      let age_mean = mean ages in
      let cods = list_from_hash nchs.icd_length (fun tbl ->
        List.iter (fun (age,cod) ->
          inc_table tbl (fun ages -> age::ages) (fun () -> [age]) cod) age_cods) in
      let leading_cod = List.fold_left (fun (accod,accages) (cod,ages) ->
        let agelen = List.length ages in
        if agelen > accages then (cod,agelen) else (accod,accages)) ("",0) cods
        |> fun (cod,ct) -> (cod, (foi ct) /. (List.length age_cods |> foi)) in
      let cod_data = List.map (fun (cod,ages) ->
        let cod_mean_age = mean ages in
        (cod,cod_mean_age,stdev cod_mean_age ages)) cods
        |> List.sort (fun (c1,_,_) (c2,_,_) -> String.compare c1 c2) in
      (state, (age_mean, stdev age_mean ages), leading_cod, cod_data))

  let remove_dc_and_foreign = List.filter (fun ((_,s),_,_,_) -> s <> "DC" && s <> "!!")
  let sort_years = List.sort (fun (y1,_) (y2,_) -> y1-y2)
  let sort_states =
    List.map (fun (y,sl) -> y, List.sort (fun ((_,s1),_,_,_) ((_,s2),_,_,_) -> String.compare s1 s2) sl)

  let jsonify_state_ages sages_list = `Dict [
    ("years",`List (List.map (fun (yr,sages) -> `Dict [
      ("year",`Int yr);
      ("data",`Dict (List.map (fun ((long,short),(mu,sigma),(leading_cod,pct),cods) ->
        (short, `Dict [
          ("name",`String long);
          ("age_mu",`Float mu);
          ("age_stdev",`Float sigma);
          ("leading_killer",`String leading_cod);
          ("lk_percent",`Float pct);
          ("causes", `Dict (List.map (fun (cause,cmu,csigma) ->
            (cause, `Dict [
              ("mu",`Float cmu);
              ("stdev",`Float csigma)])) cods) )])) sages)) ]) sages_list))]

  (* get average age, cod weights for each state for a range of years (timeseries) *)
  (* this is a beast: for a range of years, return a timeseries of the form:
   * {
   * years: [
   *   {
   *   "year": year (4-digit year)
   *   "data": {
   *     state: { (keyed on state's shortform abbreviation)
   *       name: "", (full name of state)
   *       state_mu: 0.0, (average age of death for state in given year)
   *       state_stdev: 0.0, (stdev on age of death)
   *       leading_cause: "" (leading cause of death in state)
   *       leading_cause_percent: 0.0 (percent of total deaths leading_cause is responsible for)
   *       causes: {
   *         cause_name: { (full name of the cause of death in the 34/9 recode)
   *           cause_mu: 0.0 (average age at death for this cause in this year)
   *           cause_stdev: 0.0 (stdev on that value)
   *         }
   *         ...
   *       }
   *     },
   *     ...
   *   }
   *   },
   *   ...
   *   ]
   * }
   *)
  let viz8_states fname =
    1968|..|2002
    |> List.map (fun yr -> yr, read_age_cod_state yr
        |> group_states
        |> process_states
        |> remove_dc_and_foreign
        |> pass (fun d -> print_endline (sprintf "finished preprocessing %d" yr)))
    |> sort_years
    |> sort_states
    |> jsonify_state_ages
    |> json_to_string
    |~~> fname

end;;
