

(* helper to fold a hashtable into a (key,value) pair list *)
let loh h = Hashtbl.fold (fun key value acc -> (key,value) :: acc) h [];;

(* expand a (key,value) pair list into a hashtable, with custom definiton
 * for how key,value are passed *)
let hol keymap l =
  let tbl = Hashtbl.create (List.length l) in
  List.iter (fun item -> keymap item |> fun (k,v) -> Hashtbl.add tbl k v) l;
  tbl;;

(* reusable increment function *)
let inc_table table incfun base key =
  if Hashtbl.mem table key then Hashtbl.replace table key (incfun (Hashtbl.find table key))
  else Hashtbl.add table key (base ());;

(* reusable function to create temporary hashtable and return list *)
let list_from_hash size populatefun =
  Hashtbl.create size
  |> pass populatefun
  |> loh;;

(* read a file and split by linesep *)
let lines fname =
  ~~|> fname
  |> Str.split (Str.regexp "\n");;

(* tail recursive map to prevent overflow *)
let maptr f l =
  let rec m acc = function
    | [] -> acc
    | h::t -> m ((f h) :: acc) t in
  m [] l;;


(*
 * important mapping data
 *
 * store as one big, ugly, clean and contained monster
 *)


type nchs_code = {
  recode34: (int list * string) list;
  recode39: (int list * string) list;
  recode113: ((char*int*int) list * string * string) list;
  decode: (int list * string) list -> int -> string;
  length: int;
  icd_length: int };;
let nchs = {
  length = 37;
  icd_length = 22;
  recode34 = [
    ([010],"Tuberculosis");
    ([020],"Venereal Diseases");
    ([030],"Other Infectious Diseases");
    ([050;060;070;080;090;100;110],"Cancer");
    ([120],"Diabetes");
    ([160;190],"Hypertension");
    ([150;170;180],"Heart Diseases");
    ([200],"Stroke");
    ([210;220],"Circulatory Diseases");
    ([230],"Influenza and Pneumonia");
    ([240],"Bronchitis / COPD");
    ([250],"Digestive Tract Diseases");
    ([260],"Liver Diseases");
    ([270],"Kidney Diseases");
    ([280],"Pregnancy Complications");
    ([290],"Congenital Anomalies");
    ([300],"Perinatal Complications");
    ([310],"Undetermined Diseases");
    ([320],"All Other Diseases");
    ([330],"Motor Vehicle Accidents");
    ([350],"Suicide");
    ([360],"Homicide");
    ([340;370],"All Other External Causes")];
  recode39 = [
    ([001],"Tuberculosis");
    ([002;003],"Venereal Diseases");
    ([004;005;006;007;008;009;010;011;012;013;014;015],"Cancer");
    ([016],"Diabetes");
    ([017],"Alzheimer's");
    ([018;019;021;022],"Heart Diseases");
    ([020;023],"Hypertension");
    ([024],"Stroke");
    ([025;026],"Circulatory Diseases");
    ([027],"Influenza and Pneumonia");
    ([028],"Bronchitis / COPD");
    ([029],"Digestive Tract Diseases");
    ([030],"Liver Diseases");
    ([031],"Kidney Diseases");
    ([032],"Pregnancy Complications");
    ([033],"Perinatal Complications");
    ([034],"Congenital Anomalies");
    ([035;036],"Undetermined Diseases");
    ([037],"All Other Diseases");
    ([038],"Motor Vehicle Accidents");
    ([040],"Suicide");
    ([041],"Homicide");
    ([039;042],"All Other External Causes")];
  recode113 = [
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
    ([('U',0,859)], "Codes for special purposes", "Special Reasons")];
  decode = fun code_map code ->
    List.fold_left (fun acc (cl,name) -> if List.exists (fun c -> c=code) cl then name else acc)
      (sprintf "Unable to Find code %d" code) code_map
};;

