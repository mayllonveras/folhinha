/* Tema Dinossauros: 52 espécies reais, catalogadas por período e alimentação.
   As figurinhas são imagens (stickers/dinossauros/NN.webp, NN = número do catálogo). */
(function(){
"use strict";
var FC=window.FC;
var T="Triássico",J="Jurássico",C="Cretáceo";
var D=[
 ["Eoraptor",T,"onívoro","raptor",30,.8,[]],
 ["Coelofise",T,"carnívoro","raptor",95,.85,[]],
 ["Herrerassauro",T,"carnívoro","raptor",15,.95,[]],
 ["Plateossauro",T,"herbívoro","prosauro",70,1,[]],
 ["Estaurikossauro",T,"carnívoro","raptor",45,.85,[]],
 ["Dilofossauro",J,"carnívoro","raptor",160,1,["crest2"]],
 ["Criolofossauro",J,"carnívoro","trex",190,.9,["crest1"]],
 ["Ceratossauro",J,"carnívoro","trex",5,.95,["hornnose"]],
 ["Alossauro",J,"carnívoro","trex",25,1,[]],
 ["Megalossauro",J,"carnívoro","trex",50,.95,[]],
 ["Compsognato",J,"carnívoro","raptor",120,.6,[]],
 ["Estegossauro",J,"herbívoro","stego",100,1,["plates","tailspikes"]],
 ["Kentrossauro",J,"herbívoro","stego",75,.85,["plates","tailspikes"]],
 ["Braquiossauro",J,"herbívoro","sauro",140,1,[]],
 ["Diplodoco",J,"herbívoro","diplo",200,1,[]],
 ["Apatossauro",J,"herbívoro","sauro",215,.95,[]],
 ["Brontossauro",J,"herbívoro","sauro",260,.95,[]],
 ["Camarassauro",J,"herbívoro","sauro",110,.9,[]],
 ["Mamenchissauro",J,"herbívoro","diplo",330,1,[]],
 ["Escelidossauro",J,"herbívoro","anky",85,.7,["bumps"]],
 ["Tiranossauro rex",C,"carnívoro","trex",18,1,[]],
 ["Albertossauro",C,"carnívoro","trex",35,.9,[]],
 ["Giganotossauro",C,"carnívoro","trex",350,1,[]],
 ["Carcarodontossauro",C,"carnívoro","trex",235,1,[]],
 ["Carnotauro",C,"carnívoro","trex",8,.95,["hornbrow","tinyarm"]],
 ["Espinossauro",C,"carnívoro","trex",170,1,["sail","croc"]],
 ["Baryonyx",C,"carnívoro","trex",150,.9,["croc"]],
 ["Irritador",C,"carnívoro","trex",195,.85,["croc","crest1"]],
 ["Velociraptor",C,"carnívoro","raptor",28,.8,["feathers","sickle"]],
 ["Deinonico",C,"carnívoro","raptor",12,.85,["sickle"]],
 ["Utahraptor",C,"carnívoro","raptor",40,.95,["sickle","feathers"]],
 ["Microraptor",C,"carnívoro","raptor",200,.6,["feathers"]],
 ["Troodonte",C,"onívoro","raptor",270,.75,["sickle"]],
 ["Oviraptor",C,"onívoro","ostrich",330,.85,["crestovi"]],
 ["Galimimo",C,"onívoro","ostrich",60,.95,[]],
 ["Terizinossauro",C,"herbívoro","theriz",90,1,["claws"]],
 ["Argentinossauro",C,"herbívoro","sauro",20,1,[]],
 ["Patagotitã",C,"herbívoro","sauro",310,1,[]],
 ["Maxakalisauro",C,"herbívoro","sauro",140,.95,[]],
 ["Saltassauro",C,"herbívoro","sauro",55,.8,["bumps"]],
 ["Amargassauro",C,"herbívoro","diplo",175,.85,["spines"]],
 ["Tricerátops",C,"herbívoro","trice",25,1,["frill","horns3"]],
 ["Protocerátops",C,"herbívoro","trice",45,.7,["frill"]],
 ["Estiracossauro",C,"herbívoro","trice",280,.85,["frill","frillspikes","hornnose2"]],
 ["Anquilossauro",C,"herbívoro","anky",65,1,["bumps","club"]],
 ["Euoplocéfalo",C,"herbívoro","anky",150,.9,["bumps","club"]],
 ["Paquicefalossauro",C,"herbívoro","pachy",340,.9,[]],
 ["Parassaurolofo",C,"herbívoro","hadro",160,1,["crestlong"]],
 ["Edmontossauro",C,"herbívoro","hadro",35,1,[]],
 ["Maiassaura",C,"herbívoro","hadro",100,.95,[]],
 ["Coritossauro",C,"herbívoro","hadro",205,.95,["crestdome"]],
 ["Iguanodonte",C,"herbívoro","iguano",120,1,[]]
];

/* Raridade (índice = número do catálogo - 1). Precisa bater com a tabela sticker_rarity no banco.
   Ultrarraras: Tiranossauro rex, Tricerátops, Velociraptor. Raras: Estegossauro, Braquiossauro, Diplodoco, Espinossauro, Anquilossauro. */
var RARIDADE={20:"ultra",41:"ultra",28:"ultra",11:"rara",13:"rara",14:"rara",25:"rara",44:"rara"};
function pad(n){return (n<10?"0":"")+n}
FC.THEMES.push({id:"dinossauros",name:"Dinossauros",desc:"52 dinossauros de verdade, catalogados por período e alimentação. Os 8 mais famosos são raros.",kind:"dino",
  rarity:RARIDADE,
  nameOf:function(i){return D[i][0]},subOf:function(i){return D[i][1]+" · "+D[i][2]},
  art:function(i){return '<img src="stickers/dinossauros/'+pad(i+1)+'.webp" alt="'+FC.esc(D[i][0])+'" loading="lazy">'}});
FC.DINOS=D;
})();
