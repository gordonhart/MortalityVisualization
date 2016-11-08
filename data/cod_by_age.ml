
(*
 * Timeseries for the average age at death for each disease type
 *)

type viz4_query = Age | Cause | Decoder;;
type viz4_subquery = Start | Len | Decode of bytes;;
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
    | _ -> failwith "bad decode subquery" end;;


let viz4_icd8_9_causes = nchs_code_to_name nchs_categories;;
let viz4_icd10_causes = nchs_code_to_name icd10_nchs_categories;;
let viz4_icd8 = make_indexer (38,3) (74,3) icd8_9_age;;
let viz4_icd9 = make_indexer (63,3) (156,3) icd8_9_age;;
let viz4_icd10a = make_indexer (63,3) (156,2) icd8_9_age;;
let viz4_icd10b = make_indexer (69,4) (159,2) icd10_age;;


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
  |> fun items -> list_from_hash num_nchs_categories
      (fun tbl -> List.iter (fun (a,cod) -> inc_table tbl (fun ages -> a::ages) (fun () -> [a]) cod) items)
  |> List.map (fun (cod,ages) -> mean ages |> fun mu -> (cod,mu,stdev mu ages));;


(* transform list of (cause,[(year,mu,sigma)]) pairs to internal json format *)
let jsonify_cod_age_list cal =
  `Dict (List.map (fun (cause,yearlist) -> (cause,
    `List (List.map (fun (yr,mu,sigma) ->
      `Dict [("year",`Int yr);("mu",`Float mu);("stdev",`Float sigma)]) yearlist))) cal);;

