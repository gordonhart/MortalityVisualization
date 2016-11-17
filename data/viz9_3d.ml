
(*
 * 3D Viz:
 *   x: Age
 *   y: Year
 *   z: percentage of all-time deaths from this disease
 *)

module Viz9 : sig
  val viz9_3d : string -> unit
end = struct

  (* return list of (year,[(cod,[(age,count)...])...]) pairs *)
  let read_years yearlist =
    let range (lo,hi) n = n>=lo && n <= hi in

    let get_age_cod (ages,agel,agef) (cods,codl,codf) =
      maptr (fun l -> (String.sub l ages agel |> agef, String.sub l cods codl |> ios |> codf)) in

    let group_by_cod age_cods =
      list_from_hash nchs.icd_length (fun tbl ->
        List.iter (fun (age,cod) ->
          inc_table tbl (fun ages -> age::ages) (fun () -> [age]) cod) age_cods) in

    let cleanup_ages =
      List.map (fun (cod,agelist) -> cod,
        list_from_hash 121 (fun tbl -> (* sum age counts *)
          List.iter (fun age -> inc_table tbl (fun ct -> ct+1) (fun () -> 1) age) agelist)
        |> List.filter (fun (a,_) -> a>=0 && a<=120) (* remove negative (undefined) ages (and too high) *)
        |> fun aglst -> List.fold_left (fun acc new_age -> (* add missing ages 0-120 *)
            if not (List.exists (fun (a,_) -> a=new_age) acc)
            then (new_age,0)::acc else acc) aglst (0|..|120)
        |> List.sort (fun (a1,_) (a2,_) -> a1-a2)) in (* sort ages *)

    List.map (fun year ->
      read_year year
      |> begin match year with
        | y when range (1968,1978) y -> get_age_cod (38,3,icd8_9_age) (74,3,nchs.decode nchs.recode34)
        | y when range (1979,1998) y -> get_age_cod (63,3,icd8_9_age) (156,3,nchs.decode nchs.recode34)
        | y when range (1999,2002) y -> get_age_cod (63,3,icd8_9_age) (156,2,nchs.decode nchs.recode39)
        | y when range (2003,2014) y -> get_age_cod (69,4,icd10_age) (159,2,nchs.decode nchs.recode39)
        | _ -> failwith "bad year" end
      |> group_by_cod
      |> cleanup_ages
      |> pair year
      |> alert_progress year) yearlist

  (* group by cod to return list of (cod,[(year,[(age,count)...])...]) pairs *)
  let condense_around_causes yearlist =
    list_from_hash (2014 - 1968) (fun tbl ->
      List.iter (fun (year,codlist) ->
        List.iter (fun (cod,agelist) -> inc_table tbl
          (fun years -> (year,agelist)::years)
          (fun () -> [(year,agelist)]) cod) codlist) yearlist)
    |> List.map (fun (cod,years) -> cod,List.sort (fun (y1,_) (y2,_) -> y1-y2) years)
    |> List.sort (fun (c1,_) (c2,_) -> String.compare c1 c2)

  (* transform counts to percentage of total kills *)
  let normalize_counts codlist =
    List.map (fun (cod,yearlist) ->
      let total = foi @@ List.fold_left (fun acc (year,agelist) -> acc +
        (List.fold_left (fun acc2 (age,ct) -> acc2+ct) 0 agelist)) 0 yearlist in
      cod,List.map (fun (year,agelist) -> year,
        List.map (fun (age,ct) -> age,(foi (100*ct)) /. total) agelist) yearlist) codlist

  let jsonify_cod3d codlist =
    Dict (List.map (fun (cod,yearlist) -> cod,
      List (List.map (fun (year,ages) ->
        Dict [
        ("year",Int year);
        ("ages",
          List (List.map (fun (age,pct) ->
            Dict [
            ("age",Int age); (* could encode age as list index, but that's somewhat unclear *)
            ("pct",Float pct)]) ages))]) yearlist)) codlist)

  let viz9_3d fname =
    read_years (1968|..|2014)
    |> condense_around_causes
    |> normalize_counts
    |> jsonify_cod3d
    |> json_to_string
    |~~> fname

end;;

