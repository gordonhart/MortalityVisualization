
(*
 * Timeseries for the average age at death for each disease type
 *)

(* read and map a year's data to (cause,[ages]) list *)
let read_yearly year causefun age_indexer =
  sprintf "raw/MORT%02d" year
  |> lines
  |> maptr (fun l -> (String.sub l))
  |> list_from_hash num_nchs_categories
      (


  list_from_hash num_nchs_categories
    (fun tbl -> List.iter (fun (year,data) ->
      List.iter (fun (cause,count) ->
        inc_table tbl
          (fun yearct -> yearct @ [(year,count)])
          (fun () -> [(year,count)]) cause
      ) data
    ) yearly_cause_data);;
