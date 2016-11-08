
type gender = Male | Female;;
type index_query = Age | Gender | Decoder;;
type sub_query = Start | Len | Decode of bytes;;
let make_indexer (age_start,age_len) (gender_start,gender_len) gender_decoder age_decoder = function
  | Age -> begin function
    | Start -> age_start
    | Len -> age_len
    | _ -> failwith "bad age subquery" end
  | Gender -> begin function
    | Start -> gender_start
    | Len -> gender_len
    | Decode genderstr -> gender_decoder genderstr end
  | Decoder -> begin function
    | Decode agestr -> age_decoder agestr
    | _ -> failwith "bad age decode subquery" end;;


let int_to_gender g = if g=1 then Male else Female;;
let icd8_9_age age =
  match ios (String.sub age 0 1) with
  | 0 -> ios (String.sub age 1 2)
  | 1 -> 100 + (ios (String.sub age 1 2))
  | 2 ->
      let months = ios (String.sub age 1 2) in
      if months = 99 then -1 else begin if months >= 6 then 1 else 0 end
  | 9 -> -1
  | _ -> 0;;

let icd10_age age =
  match ios (String.sub age 0 1) with
  | 1 ->
      let yrs = ios (String.sub age 1 3) in
      if yrs = 999 then -1 else yrs
  | 2 ->
      let months = ios (String.sub age 1 3) in
      if months = 999 then -1 else begin if months >= 6 then 1 else 0 end
  | 9 -> -1
  | _ -> 0;;

let icd8 = make_indexer (38,3) (34,1) ios icd8_9_age;;
let icd9 = make_indexer (63,3) (58,1) ios icd8_9_age;;
let icd10 = make_indexer (69,4) (68,1) (function "M" -> 1 | _ -> 2) icd10_age;;


(* read age, gender at death *)
let yearly_age_stats indexer raw_lines =
  let isolate gen ll = List.fold_left (fun acc (g,a) -> if g=gen then a::acc else acc) [] ll in
  maptr (fun l -> (
    indexer Gender (Decode (String.sub l (indexer Gender Start) (indexer Gender Len))) |> int_to_gender,
    indexer Decoder (Decode (String.sub l (indexer Age Start) (indexer Age Len))))) raw_lines
  |> List.fold_left (fun acc (g,a) -> if a<0 then acc else (g,a)::acc) [] (* remove no age data pairs *)
  |> fun data -> (* map to mean, stdev pairs for each gender *)
      let males,females = isolate Male data, isolate Female data in
      let male_mu,female_mu = mean males, mean females in
      ((Male,male_mu,stdev male_mu males),(Female,female_mu,stdev female_mu females));;


let jsonify_agedata ad =
  `Dict [
  ("data",
    `List (List.map (fun (yr,(m,mmu,ms),(f,fmu,fs)) ->
      `Dict [
      ("year",`Int yr);
      ("male",
        `Dict [
        ("mu",`Float mmu);
        ("stdev",`Float ms)]);
      ("female",
        `Dict [
        ("mu",`Float fmu);
        ("stdev",`Float fs)])]) ad))];;

