(*
 * Gather the ages for all deaths of each disease type from
 * all years (1968-2014) in order to compute the probability
 * mass function for each cause of death, along with cumulative
 * distribution function.
 *
 * Also generate a "danger function" which is a pmf that normalizes the
 * percentages based on all deaths for that age group (so not actually
 * a pmf, integral is not actually a cdf).
 *)


(*
 * type it out
 *
 * int list
 *   int
 *   |> string list
 *   |> (int,string) list
 *   |> (string,(int int) list) list
 * |> ((string,(int,int) list) list) list
 * |> (string,(int,int) list) list
 * |> (string,(int,float) list) list
 * |> json
 * |> string
 *
 *)

module Viz7 : sig
  val viz7_pmf : string -> unit
  val viz7_cdf : string -> unit
  val viz7_dangerfun : string -> unit
end = struct

  (* delegate responsibility of knowing file types to the reading function *)
  let read_age_and_cod_from_file year =
    let range (lo,hi) n = n>=lo && n <= hi in
    let get (ages,agel,agef) (cods,codl,codf) =
      maptr (fun l -> (String.sub l ages agel |> agef, String.sub l cods codl |> ios |> codf)) in
    let yr = String.sub (soi year) 2 2 |> sprintf "raw/MORT%s" |> (~~||>) in
    yr |> match year with
    | y when range (1968,1978) y -> get (38,3,icd8_9_age) (74,3,nchs.decode nchs.recode34)
    | y when range (1979,1998) y -> get (63,3,icd8_9_age) (156,3,nchs.decode nchs.recode34)
    | y when range (1999,2002) y -> get (63,3,icd8_9_age) (156,2,nchs.decode nchs.recode39)
    | y when range (2003,2014) y -> get (69,4,icd10_age) (159,2,nchs.decode nchs.recode39)
    | _ -> failwith "bad year"

  let group_by_cod age_cods =
    list_from_hash 25
      (fun tbl -> List.iter (fun (age,cod) ->
        inc_table tbl (fun ages -> age :: ages) (fun () -> [age]) cod) age_cods)

  let generate_age_counts =
    List.map (fun (cod,ages) -> (cod, list_from_hash 121
      (fun tbl -> List.iter (inc_table tbl (fun c -> c+1) (fun () -> 1)) ages)))

  let remove_invalid_ages =
    List.map (fun (cod,ages) -> (cod,
      List.fold_left (fun acc (age,ct) -> (* can't trust ages over 120, wiki says there aren't any from the US *)
        if age<0 || age>120 then acc else (age,ct)::acc) [] ages))

  let group_by_cause yrs =
    list_from_hash 25 (fun tbl ->
      List.iter (fun yr ->
        List.iter (fun (cod,agects) ->
          inc_table tbl (fun agectsl -> agects @ agectsl) (fun () -> agects) cod) yr) yrs)

  let sum_years causes =
    List.map (fun (cod,agecountlist) -> (cod,list_from_hash 121 (fun tbl ->
      List.iter (fun (age,count) ->
        inc_table tbl (fun ct -> ct+count) (fun () -> count) age) agecountlist))) causes

  let normalize_counts =
    List.map (fun (cod,agects) ->
      let total = List.fold_left (fun acc (age,ct) -> acc+ct) 0 agects |> foi in
      (cod, List.map (fun (age,ct) -> (age, (foi ct)/.total)) agects))

  let normalize_by_age cod_ages =
    let cts = list_from_hash 121 (fun tbl -> List.iter (fun (cod,ages) ->
        List.iter (fun (age,ct) -> inc_table tbl (fun c -> c+ct) (fun () -> ct) age) ages) cod_ages)
      |> List.sort (fun (a1,_) (a2,_) -> a1-a2)
      |> Array.of_list in
    let agects a = cts.(a) |> snd |> foi in
    List.map (fun (cod,ages) -> (cod,
      List.map (fun (age,ct) -> (age, (foi ct)/.(agects age))) ages)) cod_ages

  let sort_counts =
    List.map (fun (cause,ages) -> (cause, List.sort (fun (a1,_) (a2,_) -> a1-a2) ages))

  let fill_missing_years =
    List.map (fun (cause,ages) -> (cause, List.fold_left (fun acc age ->
      if List.exists (fun (a1,_) -> a1=age) acc then acc else (age,0.0)::acc) ages (0|..|120)))

  let cdfify =
    List.map (fun (cause,ages) -> (cause,
      List.fold_left (fun (accages,accpct) (age,pct) ->
        ((age,accpct+.pct)::accages,accpct+.pct)) ([],0.) ages |> fst |> List.rev))

  let chop_centenarians =
    List.map (fun (cause,ages) -> (cause, List.filter (fun (age,_) -> age<=100) ages))

  let sort_causes = List.sort (fun (c1,_) (c2,_) -> String.compare c1 c2)

  let pmfs_to_json pmfs = (* pmf representation list of form [(name,[(age,prob)])] to json *)
    `Dict (List.map (fun (pmf_name,pts) -> (pmf_name,
      `List (List.map (fun (age,prob) ->
        `Dict [("age",`Int age);("percentage",`Float prob)]) pts))) pmfs)

  type fundesc = Pmf | Cdf | Danger
  let viz7 ftype fname =
    1968|..|2014
    |> List.map (fun y -> y
      |> read_age_and_cod_from_file
      |> group_by_cod
      |> generate_age_counts
      |> remove_invalid_ages
      |> pass (fun _ -> print_endline (sprintf "finished preprocessing year %d" y)))
    |> group_by_cause
    |> sum_years
    |> (match ftype with Danger -> normalize_by_age | _ -> normalize_counts)
    |> fill_missing_years
    |> sort_counts
    |> (match ftype with Cdf -> cdfify (* | Danger -> chop_centenarians *) | _ -> skip)
    |> sort_causes
    |> pmfs_to_json
    |> json_to_string
    |~~> fname

  let viz7_pmf = viz7 Pmf
  let viz7_cdf = viz7 Cdf
  let viz7_dangerfun = viz7 Danger

end;;

