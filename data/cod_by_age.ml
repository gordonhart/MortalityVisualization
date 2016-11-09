
(*
 * Timeseries for the average age at death for each disease type
 *)

type viz4_query = Age | Cause | Decoder;;
type viz4_subquery = Start | Len | Decode of bytes;;

let viz4_gendata fname =

  let make_indexer (age_start,age_len) (cause_start,cause_len) age_decoder = function
    | Age -> begin function
      | Start -> age_start
      | Len -> age_len
      | _ -> failwith "bad age subquery" end
    | Cause -> begin function
      | Start -> cause_start
      | Len -> cause_len
      | _ -> failwith "bad cause subquery" end
    | Decoder -> begin function
      | Decode agestr -> age_decoder agestr
      | _ -> failwith "bad decode subquery" end in

  let viz4_icd8_9_causes = nchs_code_to_name nchs.recode34 in
  let viz4_icd10_causes = nchs_code_to_name nchs.recode39 in
  let viz4_icd8 = make_indexer (38,3) (74,3) icd8_9_age in
  let viz4_icd9 = make_indexer (63,3) (156,3) icd8_9_age in
  let viz4_icd10a = make_indexer (63,3) (156,2) icd8_9_age in
  let viz4_icd10b = make_indexer (69,4) (159,2) icd10_age in

  (* read and map a year's data to (cause,[ages]) list *)
  let read_yearly_cod_ages causefun indexer year =
    String.sub (soi year) 2 2
    |> sprintf "raw/MORT%s"
    |> lines
    |> maptr (fun l -> (
        Decode (String.sub l (indexer Age Start) (indexer Age Len))
          |> indexer Decoder,
        String.sub l (indexer Cause Start) (indexer Cause Len)
          |> ios
          |> causefun))
    |> fun items -> list_from_hash nchs.length
        (fun tbl -> List.iter (fun (a,cod) -> inc_table tbl (fun ages -> a::ages) (fun () -> [a]) cod) items)
    |> List.map (fun (cod,ages) -> mean ages |> fun mu -> (cod,mu,stdev mu ages)) in

  (* transform list of (cause,[(year,mu,sigma)]) pairs to internal json format *)
  let jsonify_cod_age_list cal =
    `Dict (List.map (fun (cause,yearlist) -> (cause,
      `List (List.map (fun (yr,mu,sigma) ->
        `Dict [("year",`Int yr);("mu",`Float mu);("stdev",`Float sigma)]) yearlist))) cal) in

  List.map (read_yearly_cod_ages viz4_icd8_9_causes viz4_icd8) (1968|..|1978)
  |> fun y68_78 -> y68_78 @ (List.map (read_yearly_cod_ages viz4_icd8_9_causes viz4_icd9) (1979|..|1998))
  |> fun y68_98 -> y68_98 @ (List.map (read_yearly_cod_ages viz4_icd10_causes viz4_icd10a) (1999|..|2002))
  |> fun y68_02 -> y68_02 @ (List.map (read_yearly_cod_ages viz4_icd10_causes viz4_icd10b) (2003|..|2014))
  |> fun yearlist -> list_from_hash nchs.length
      (fun tbl -> List.iteri (fun i causelist ->
        List.iter (fun (cause,mu,stdev) -> inc_table tbl (fun mus -> (1968 + i,mu,stdev) :: mus)
          (fun () -> [(1968 + i,mu,stdev)]) cause) causelist) yearlist)
  |> jsonify_cod_age_list
  |> json_to_string
  |~~> fname;;
