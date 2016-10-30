
(* #require "str";; *)

(* constants constants constants *)
let gender_index = 68;;
let start_113,len_113 = 153,3;;
let start_icd,len_icd = 145,4;;
let start_multiple,len_multiple = 166,138;;

(* use hash table to store category codes for ICD-10
 * hash table key is the letter associated with the code,
 * returns a function accepting an integer on 0-999 to access
 * the disease type *)
let num_icd_categories = 22;;
let icd_category_map = Hashtbl.create num_icd_categories;;
(* Hashtbl.reset icd_category_map; *)

let icd_categories = [
  ([('A',0,999); ('B',0,999)], "Certain infectious and parasitic diseases", "Infection or Parasite");
  ([('C',0,999); ('D',0,489)], "Neoplasms", "Cancer");
  ([('D',500,899)], "Diseases of the blood and blood-forming organs and certain disorders involving the immune mechanism", "Immune Disease");
  ([('E',0,909)], "Endocrine, nutritional and metabolic diseases", "Endocrine and Metabolic");
  ([('F',0,999)], "Mental and behavioural disorders", "Mental Disorder");
  ([('G',0,999)], "Diseases of the nervous system", "Nervous System");
  ([('H',0,599)], "Diseases of the eye and adnexa", "Eye");
  ([('H',600,959)], "Diseases of the ear and mastoid process", "Ear");
  ([('I',0,999)], "Diseases of the circulatory system", "Circulatory");
  ([('J',0,999)], "Diseases of the respiratory system", "Respiratory");
  ([('K',0,939)], "Diseases of the digestive system", "Digestive");
  ([('L',0,999)], "Diseases of the skin and subcutaneous tissue", "Skin");
  ([('M',0,999)], "Diseases of the musculoskeletal system and connective tissue", "Musculoskeletal");
  ([('N',0,999)], "Diseases of the genitourinary system", "Genitourinary");
  ([('O',0,999)], "Pregnancy, childbirth and the puerperium", "Childbirth and Pregnancy");
  ([('P',0,969)], "Certain conditions originating in the perinatal period", "Perinatal");
  ([('Q',0,999)], "Congenital malformations, deformations and chromosomal abnormalities", "Chromosomal Abnormalities");
  ([('R',0,999)], "Symptoms, signs and abnormal clinical and laboratory findings, not elsewhere classified", "Abnormal Causes");
  ([('S',0,999); ('T',0,989)], "Injury, poisoning and certain other consequences of external causes", "Consequences of External Causes");
  ([('V',10,999); ('W',0,999); ('X',0,999); ('Y',0,989)], "External causes of morbidity and mortality", "Direct External Causes");
  ([('Z',0,999)], "Factors influencing health status and contact with health services", "Inability to Access Care");
  ([('U',0,859)], "Codes for special purposes", "Special Reasons")
];;

(* define the lookup function: give pair of both short and long form name *)
let lookup_fun range name =
  fun num -> if cause_range range num then Some name else None;;

(* populate the map *)
let setup_icd_map =
  List.iter (fun (cl,name,shortform) ->
    List.iter (fun (tag,lo,hi) -> Hashtbl.add icd_category_map tag (lookup_fun (lo,hi) (name,shortform))) cl
  ) icd_categories;;

(* simple accessor to map *)
let disease_type tag =
  let code = String.get tag 0 in
  let num = ios (String.sub tag 1 (String.length tag - 1)) in
  let entries = Hashtbl.find_all icd_category_map code in
  List.fold_left (fun acc rangefun -> match rangefun num with
    | None -> acc
    | Some entry -> entry
  ) ("","") entries;;

(* helper to fold a hashtable into a (key,value) pair list *)
let loh h = Hashtbl.fold (fun key value acc -> (key,value) :: acc) h [];;

(* expand a (key,value) pair list into a hashtable, with custom definiton
 * for how key,value are passed *)
let hol keymap l =
  let tbl = Hashtbl.create (List.length l) in
  List.iter (fun item -> keymap item
    |> fun (k,v) -> Hashtbl.add tbl k v) l;
  tbl;;




(* read a file and split by linesep *)
let lines fname =
  ~~|> fname
  |> Str.split (Str.regexp "\n");;

(* map data to genders *)
let genders data = data
  |> List.map (fun l -> String.get l gender_index);;

(* map data to cause of death, by number -- 113 cause codes *)
let causes_113 data = data
  |> List.map (fun l -> ios (String.sub l start_113 len_113));;

(* map data to cause of death, by number -- ICD-10 codes *)
let causes_icd data = data
  |> List.map (fun l -> String.sub l start_icd len_icd);;

(* boolean tester to check if a 113 cause is within a specified range, inclusive *)
let cause_range (b,e) cause =
  b <= cause && cause <= e;;

let range_query data (b,e) = data
  |> List.fold_left (fun acc c -> if cause_range (b,e) c then acc+1 else acc) 0;;

(* multiple causes of death of the form:
 *   (icd_cause, [icd_preexisting])
 *
 * note that the first two digits of each preexisting condition
 * are more or less meaningless, so they are discarded *)
let multiple_causes data = data
  |> List.map (fun l ->
      (String.sub l start_icd len_icd (* cause *)
        |> Str.global_replace (Str.regexp " +") "",
       String.sub l start_multiple len_multiple (* multiple conditions *)
        |> Str.split (Str.regexp " +\([0-9][0-9]\)?")));;

(* sum the number of cases for each number of preexisting conditions, return:
  *   (number of conditions, number of instances) list *)
let preexisting_counts mc_data =
  let counts = Array.make 20 0 in
  List.iter (fun (c,m) ->
    let index = List.length m - 1 in
    counts.(index) <- counts.(index) + 1) mc_data;
  Array.to_list counts
  |> List.mapi (fun i x -> (i+1,x));;

(* transform an mc list to names *)
let humanized mc_data =
  List.map (fun (cause,multiple) ->
    (disease_type cause, List.map disease_type multiple)
  ) mc_data;;

(* count the number of deaths from each of the ICD categories *)
let category_count humanized_data =
  let counts = Hashtbl.create num_icd_categories in
  List.iter (fun (cause,multiple) ->
    if Hashtbl.mem counts cause then
      Hashtbl.replace counts cause (Hashtbl.find counts cause + 1)
    else Hashtbl.add counts cause 1
  ) humanized_data;
  loh counts;;

(* turn a humanized dataset into a list of nodes
 *   (name, count, [(edge1, count); (edge2, count)...])
 * representing the name of the disease that caused death, the number
 * of times death was caused by said diseaese in the dataset, and the
 * number of times another certain disease was a preexisting condition
 * for a death of the given type
 *
 * intermediately, the nodes are stored as a hashtable of counts indexed
 * by disease category, with form (count, preexisting hashtable)
 * where preexisting hashtable is indexed by type, with count as value *)
let humanized_graph humanized_data =

  (* define the node hashtable, populate with an entry for each disease *)
  let nodes = hol (fun (code,name,short) ->
    ((name,short),(0,Hashtbl.create num_icd_categories))) icd_categories in

  (* reusable increment function *)
  let inc_table table incfun base key =
    if Hashtbl.mem table key then Hashtbl.replace table key (incfun (Hashtbl.find table key))
    else Hashtbl.add table key (base ()) in

  (* iterate through data, building counts *)
  List.iter (fun (cod,multiple) -> inc_table nodes
    (fun (ct,preex_ht) -> (* regular case: update existing hashtable *)
      List.iter (inc_table preex_ht (fun c -> c+1) (fun () -> 1)) multiple;
      (ct+1,preex_ht)) (* following will never be called (already initialized) *)
    (fun () -> failwith "never reach here") cod) humanized_data;

  (* fold hashtable ot hashtables to list *)
  Hashtbl.fold (fun cond (ct,preex_ht) acc -> (cond,ct,loh preex_ht) :: acc) nodes [];;




(* finally, transform the directed graph structure to json:
 *   dict of "nodename" : {ct,[edges]} *)
let graph_to_json graph_data =
  let chop_last s =
    let len = String.length s in
    if len > 0 then String.sub s 0 (len - 1) else s in
  List.fold_left (fun acc ((name,short),ct,edges) ->
    let edgestr = List.fold_left (fun eacc ((ename,eshort),ect) ->
      eacc ^ sprintf "{'name': '%s', 'short': '%s', 'count': %d}," ename eshort ect) "" edges in
    acc ^ sprintf "'%s': {'short': '%s', 'count': %d, 'edges': [%s]}," name short ct (chop_last edgestr)
  ) "" graph_data
  |> chop_last
  |> sprintf "{%s}"
  |> Str.global_replace (Str.regexp "'") "\"";;

(* save to file with:
 * fname <|~~ data
 *
 * full workflow from data read to json export:
 *   "fname" <|~~ (lines "infile" |> multiple_causes |> humanized |> humanized_graph |> graph_to_json);; *)

