
module Viz3 : sig
  val icd8_9_age : string -> int
  val icd10_age : string -> int
  val viz3_deathage : string -> unit
  val viz3_lifeexp : string -> unit
  val viz3_marriage_status : string -> unit
end = struct

  type gender = Male | Female
  type index_query = Age | Gender | Marital
  type sub_query = Start | Len | Value of bytes

  let make_indexer (age_start,age_len,age_decoder) (gender_start,gender_decoder) (marital_start,marital_decoder) = function
    | Age -> begin function
      | Start -> age_start
      | Len -> age_len
      | Value agestr -> age_decoder agestr end
    | Gender -> begin function
      | Start -> gender_start
      | Len -> 1
      | Value genderstr -> gender_decoder genderstr end
    | Marital -> begin function
      | Start -> marital_start
      | Len -> 1
      | Value marriagestr -> marital_decoder marriagestr end

  let int_to_gender g = if g=1 then Male else Female
  let gender_to_string = function Male -> "male" | Female -> "female"
  let icd8_9_age age =
    match ios (String.sub age 0 1) with
    | 0 -> ios (String.sub age 1 2)
    | 1 -> 100 + (ios (String.sub age 1 2))
    (* | 2 ->
        let months = ios (String.sub age 1 2) in
        if months = 99 then -1 else begin if months >= 6 then 1 else 0 end *)
    | 9 -> -1
    | _ -> 0

  let icd10_age age =
    match ios (String.sub age 0 1) with
    | 1 ->
        let yrs = ios (String.sub age 1 3) in
        if yrs = 999 then -1 else yrs
    | 2 ->
        let months = ios (String.sub age 1 3) in
        if months = 999 then -1 else begin if months >= 6 then 1 else 0 end
    | 9 -> -1
    | _ -> 0

  let icd10_marital_decoder = function
    | "S" -> 1
    | "M" -> 2
    | "W" -> 3
    | "D" -> 4
    | _ -> -1

  let translate_marriage = function
    | 1 -> "Single"
    | 2 -> "Married"
    | 3 -> "Widowed"
    | 4 -> "Divorced"
    | _ -> "!!"

  let icd8 = make_indexer (38,3,icd8_9_age) (34,ios) (0,fun x -> 0)
  let icd9 = make_indexer (63,3,icd8_9_age) (58,ios) (76,fun x -> ios x)
  let icd10 = make_indexer (69,4,icd10_age) (68,(function "M" -> 1 | _ -> 2)) (83,icd10_marital_decoder)

  (* read age, gender at death *)
  let yearly_age_stats indexer raw_lines =
    let isolate gen ll = List.fold_left (fun acc (g,a) -> if g=gen then a::acc else acc) [] ll in
    maptr (fun l -> (
      indexer Gender (Value (String.sub l (indexer Gender Start) (indexer Gender Len))) |> int_to_gender,
      indexer Age (Value (String.sub l (indexer Age Start) (indexer Age Len))))) raw_lines
    |> List.fold_left (fun acc (g,a) -> if a<0 then acc else (g,a)::acc) [] (* remove no age data pairs *)
    |> fun data -> (* map to mean, stdev pairs for each gender *)
        let males,females = isolate Male data, isolate Female data in
        let male_mu,female_mu = mean males, mean females in
        ((Male,male_mu,stdev male_mu males),(Female,female_mu,stdev female_mu females))

  let get_marital_age_gender get l = (
    get Marital @@ Value (String.sub l (get Marital Start) (get Marital Len)) |> translate_marriage,
    get Age @@ Value (String.sub l (get Age Start) (get Age Len)),
    get Gender @@ Value (String.sub l (get Gender Start) (get Gender Len)) |> int_to_gender |> gender_to_string)

  (* some real ugly shit here *)
  let read_year_marriages decoder yr = read_year yr
    |> maptr (get_marital_age_gender decoder)
    |> fun statuses -> list_from_hash 5 (fun tbl ->
        List.iter (fun (status,age,gender) ->
          inc_table tbl (fun ages -> age::ages) (fun () -> [age]) (status,gender)) statuses)
    |> List.filter (fun ((s,_),_) -> s <> "!!")
    |> List.map (fun ((s,g),ages) -> s,g,mean ages)
    |> pair yr
    |> pass (fun d -> print_endline (sprintf "finished processing %d" yr))

  let group_by_gender data =
    list_from_hash 2 (fun tbl ->
      List.iter (fun (c,g,a) ->
        inc_table tbl (fun cs -> (c,a)::cs) (fun () -> [(c,a)]) g) data)

  let jsonify_agedata ad = `Dict [
    ("data", `List (List.map (fun (yr,(m,mmu,ms),(f,fmu,fs)) -> `Dict [
        ("year",`Int yr);
        ("male", `Dict [
          ("mu",`Float mmu);
          ("stdev",`Float ms)]);
        ("female", `Dict [
          ("mu",`Float fmu);
          ("stdev",`Float fs)])]) ad))]

  let jsonify_marriages years =
    `Dict (List.map (fun (y,data) -> soi y,
      `Dict (List.map (fun (gender,ages) -> gender,
        `Dict (List.map (fun (code,age) -> code,`Float age) ages)) data)) years)

  let viz3_deathage fname =
    let read_and_map decoder yr = ~~||> (sprintf "raw/MORT%02d" yr) |> yearly_age_stats decoder in
    List.map (read_and_map icd8) (68|..|78)
    |> grow_list (List.map (read_and_map icd9) ((79|..|99) @ (0|..|2)))
    |> grow_list (List.map (read_and_map icd10) (3|..|14))
    |> List.mapi (fun i (m,f) -> (1968 + i,m,f))
    |> jsonify_agedata
    |> json_to_string
    |~~> fname

  let viz3_lifeexp fname =
    ~~||> "raw/other/LifeExpectancy1950-2050.csv"
    |> List.map (Str.split (Str.regexp ","))
    |> List.tl (* remove header at top *)
    |> List.map (fun l -> (List.nth l 0, List.nth l 1, List.nth l 2)) (* grab first three cols *)
    |> List.map (fun (yr,f,m) -> (String.sub yr (String.length yr - 4) 4 |> ios, fos f, fos m))
    |> List.fold_left (fun acc (yr,f,m) -> if yr < 1965 || yr > 2014 then acc else (yr,f,m)::acc) []
    |> fun l -> `Dict [("data", `List (List.map (fun (yr,f,m) ->
         `Dict [("year",`Int yr);("female",`Float f);("male",`Float m)]) l))]
    |> json_to_string
    |~~> fname

let viz3_marriage_status fname =
  List.map (read_year_marriages icd9) (1979|..|2002)
  |> grow_list (List.map (read_year_marriages icd10) (2003|..|2014))
  |> List.map (fun (year,data) -> year,group_by_gender data)
  |> jsonify_marriages
  |> json_to_string
  |~~> fname

end;;

