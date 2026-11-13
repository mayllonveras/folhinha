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

/* Verso da figurinha. Mesma ordem do catálogo: [o nome significa, quando viveu, onde foi achado, comprimento, peso, curiosidade].
   Medidas são aproximadas: os cientistas estimam a partir dos fósseis, e os números variam entre estudos. */
var F=[
 ["ladrão da aurora","há cerca de 231 milhões de anos","Argentina","cerca de 1 metro","cerca de 10 kg","Um dos dinossauros mais antigos que se conhecem. Era pequeno e comia de tudo: bichinhos e plantas."],
 ["forma oca","há cerca de 210 milhões de anos","Estados Unidos","cerca de 3 metros","cerca de 20 kg","Seus ossos eram ocos e leves, por isso ele era rápido. Já acharam centenas de esqueletos juntos."],
 ["lagarto de Herrera","há cerca de 231 milhões de anos","Argentina","4 a 6 metros","cerca de 250 kg","Foi um dos primeiros grandes caçadores. O nome homenageia o agricultor que achou o fóssil."],
 ["lagarto plano","há cerca de 214 milhões de anos","Alemanha, França e Suíça","8 a 10 metros","de 600 kg a 4 toneladas","Era um dos maiores animais do seu tempo. Já foram achados vários esqueletos juntos, de grupos inteiros."],
 ["lagarto da Cruz do Sul","há cerca de 233 milhões de anos","Brasil (Rio Grande do Sul)","cerca de 2 metros","cerca de 30 kg","É brasileiro! O fóssil foi achado perto de Santa Maria, no Rio Grande do Sul."],
 ["lagarto de duas cristas","há cerca de 190 milhões de anos","Estados Unidos","cerca de 7 metros","cerca de 400 kg","As duas cristas finas na cabeça serviam para se exibir. No cinema ele cospe veneno, mas isso é invenção."],
 ["lagarto de crista congelada","há cerca de 190 milhões de anos","Antártida","6 a 7 metros","cerca de 500 kg","Foi achado no gelo da Antártida. A crista na testa parecia um pente de cabelo."],
 ["lagarto com chifre","há cerca de 150 milhões de anos","Estados Unidos e Portugal","5 a 6 metros","cerca de 700 kg","Tinha um chifre pequeno no focinho, e a cauda larga ajudava a nadar."],
 ["lagarto diferente","há cerca de 150 milhões de anos","Estados Unidos e Portugal","cerca de 8,5 metros","cerca de 2 toneladas","Era um dos grandes caçadores do Jurássico. Tinha dentes afiados e garras fortes nas mãos."],
 ["grande lagarto","há cerca de 166 milhões de anos","Inglaterra","6 a 9 metros","cerca de 1 tonelada","Foi o primeiro dinossauro a receber um nome científico, em 1824."],
 ["mandíbula elegante","há cerca de 150 milhões de anos","Alemanha e França","cerca de 1 metro","cerca de 3 kg","Do tamanho de uma galinha, era um dos menores dinossauros. Corria atrás de lagartos."],
 ["lagarto com telhado","há cerca de 150 milhões de anos","Estados Unidos e Portugal","cerca de 9 metros","cerca de 5 toneladas","Tinha placas nas costas e quatro espinhos na cauda. O cérebro era bem pequeno para o tamanho do corpo."],
 ["lagarto de espinhos","há cerca de 150 milhões de anos","Tanzânia (África)","cerca de 4,5 metros","cerca de 1 tonelada","Era coberto de placas e espinhos longos. Os do quadril e da cauda defendiam contra caçadores."],
 ["lagarto braço","há cerca de 150 milhões de anos","Estados Unidos","cerca de 22 metros","cerca de 30 toneladas","As patas da frente eram mais longas que as de trás. Com o pescoço erguido, chegava a uns 12 metros de altura."],
 ["viga dupla","há cerca de 150 milhões de anos","Estados Unidos","cerca de 25 metros","15 a 25 toneladas","Tinha uma cauda finíssima e muito longa, que podia estalar no ar como um chicote."],
 ["lagarto enganoso","há cerca de 152 milhões de anos","Estados Unidos","cerca de 21 metros","20 a 25 toneladas","Seu pescoço era mais grosso e forte que o dos outros gigantes de pescoço comprido."],
 ["lagarto trovão","há cerca de 150 milhões de anos","Estados Unidos","cerca de 22 metros","15 a 20 toneladas","Os cientistas já acharam que ele era igual ao Apatossauro, mas em 2015 voltou a ser um dinossauro só dele."],
 ["lagarto com câmaras","há cerca de 150 milhões de anos","Estados Unidos","cerca de 15 metros","15 a 20 toneladas","Tinha o pescoço mais curto que os outros gigantes e uma cabeça alta e quadrada. Seus ossos tinham cavidades que deixavam o esqueleto mais leve."],
 ["lagarto de Mamenchi","há cerca de 160 milhões de anos","China","cerca de 22 metros","cerca de 25 toneladas","Tinha um dos pescoços mais compridos de todos os dinossauros, com cerca de 10 metros."],
 ["lagarto com membros","há cerca de 190 milhões de anos","Inglaterra","cerca de 4 metros","cerca de 270 kg","Foi um dos primeiros dinossauros com armadura. A pele era coberta de pequenos ossos redondos."],
 ["rei dos lagartos tiranos","há cerca de 67 milhões de anos","América do Norte","cerca de 12 metros","cerca de 8 toneladas","Tinha uma das mordidas mais fortes de todos os tempos, e os braços eram curtinhos."],
 ["lagarto de Alberta","há cerca de 70 milhões de anos","Canadá","cerca de 9 metros","cerca de 2 toneladas","Parente menor e mais veloz do T. rex. Tinha um pequeno chifre na frente de cada olho."],
 ["lagarto gigante do sul","há cerca de 98 milhões de anos","Argentina","cerca de 12 metros","6 a 8 toneladas","Era um dos maiores caçadores que já pisaram na Terra, ainda maior que muitos T. rex."],
 ["lagarto de dentes de tubarão","há cerca de 95 milhões de anos","Norte da África","cerca de 12 metros","cerca de 6 toneladas","Seus dentes eram serrilhados e chegavam a 20 cm, como os do tubarão-branco."],
 ["touro carnívoro","há cerca de 70 milhões de anos","Argentina","cerca de 8 metros","1,5 a 2 toneladas","Tinha dois chifres sobre os olhos, como um touro, e braços minúsculos."],
 ["lagarto de espinhos","há cerca de 95 milhões de anos","Norte da África","cerca de 14 metros","cerca de 7 toneladas","Tinha uma grande vela nas costas e caçava peixes. Era um ótimo nadador."],
 ["garra pesada","há cerca de 125 milhões de anos","Inglaterra","cerca de 10 metros","cerca de 1,5 tonelada","Uma das garras da mão media uns 30 cm. Comia peixes, e o focinho parecia o de um crocodilo."],
 ["irritador","há cerca de 110 milhões de anos","Brasil (Chapada do Araripe)","6 a 8 metros","cerca de 1 tonelada","É brasileiro! O nome vem da irritação dos cientistas ao descobrirem que o fóssil tinha sido adulterado por vendedores."],
 ["ladrão veloz","há cerca de 75 milhões de anos","Mongólia","cerca de 2 metros","cerca de 15 kg","Era do tamanho de um peru grande e tinha penas. No cinema ele aparece bem maior do que era."],
 ["garra terrível","há cerca de 110 milhões de anos","Estados Unidos","cerca de 3,4 metros","cerca de 70 kg","Tinha uma garra em forma de foice em cada pé. Era rápido e ágil, e pode ter caçado em bando."],
 ["ladrão de Utah","há cerca de 125 milhões de anos","Estados Unidos","6 a 7 metros","cerca de 500 kg","O maior dos dinossauros com garra de foice. A garra do pé media uns 24 cm."],
 ["pequeno ladrão","há cerca de 120 milhões de anos","China","cerca de 80 cm","cerca de 1 kg","Tinha penas nos braços e também nas pernas, como se fossem quatro asas. Planava entre as árvores."],
 ["dente que fere","há cerca de 75 milhões de anos","América do Norte","cerca de 2,5 metros","cerca de 50 kg","Tinha olhos grandes e um cérebro grande para um dinossauro. É um dos mais espertos."],
 ["ladrão de ovos","há cerca de 75 milhões de anos","Mongólia","cerca de 2 metros","cerca de 35 kg","O nome é injusto: um fóssil foi achado em cima de ovos, mas ele estava chocando os próprios ovos."],
 ["imitador de galinha","há cerca de 70 milhões de anos","Mongólia","cerca de 6 metros","cerca de 450 kg","Não tinha dentes e corria muito rápido, como um avestruz."],
 ["lagarto da foice","há cerca de 70 milhões de anos","Mongólia","cerca de 10 metros","cerca de 5 toneladas","Tinha as garras mais compridas de qualquer animal: até 70 cm! Mesmo assim, comia só plantas."],
 ["lagarto da Argentina","há cerca de 95 milhões de anos","Argentina","cerca de 30 metros","cerca de 70 toneladas","Foi um dos maiores animais que já andaram em terra firme. Pesava quase como 10 elefantes."],
 ["titã da Patagônia","há cerca de 100 milhões de anos","Argentina","cerca de 37 metros","cerca de 57 toneladas","Seu esqueleto foi achado em 2014 e é um dos maiores já descobertos, mais comprido que uma baleia-azul."],
 ["lagarto dos Maxakali","há cerca de 80 milhões de anos","Brasil (Minas Gerais)","cerca de 13 metros","cerca de 9 toneladas","É brasileiro! O nome homenageia o povo indígena Maxakali, da região onde o fóssil foi achado."],
 ["lagarto de Salta","há cerca de 70 milhões de anos","Argentina","cerca de 9 metros","cerca de 7 toneladas","Era um gigante de pescoço comprido, mas tinha placas de osso na pele, como uma armadura."],
 ["lagarto de La Amarga","há cerca de 130 milhões de anos","Argentina","cerca de 10 metros","2 a 3 toneladas","Tinha espinhos altos e finos no pescoço e nas costas, em duas fileiras."],
 ["face com três chifres","há cerca de 67 milhões de anos","América do Norte","cerca de 9 metros","cerca de 6 toneladas","O crânio chegava a 2 metros de comprimento. Os três chifres e o grande escudo protegiam contra caçadores."],
 ["primeira face com chifre","há cerca de 75 milhões de anos","Mongólia","cerca de 2 metros","cerca de 180 kg","Do tamanho de uma ovelha e sem chifres. Já acharam um fóssil dele lutando com um Velociraptor."],
 ["lagarto com pontas","há cerca de 75 milhões de anos","Canadá","cerca de 5,5 metros","cerca de 2,7 toneladas","Tinha uma coroa de espinhos no escudo e um chifre longo no nariz."],
 ["lagarto rígido","há cerca de 68 milhões de anos","América do Norte","6 a 8 metros","cerca de 6 toneladas","Era um tanque: placas de osso na pele, até nas pálpebras, e uma clava pesada na ponta da cauda."],
 ["cabeça bem blindada","há cerca de 75 milhões de anos","Canadá","cerca de 6 metros","cerca de 2 toneladas","Parente menor do Anquilossauro. Até a cabeça era protegida por placas de osso."],
 ["lagarto de cabeça grossa","há cerca de 68 milhões de anos","Estados Unidos","cerca de 4,5 metros","cerca de 450 kg","A cúpula de osso na cabeça chegava a 25 cm de espessura."],
 ["quase lagarto de crista","há cerca de 75 milhões de anos","América do Norte","cerca de 10 metros","cerca de 2,5 toneladas","A crista oca, em forma de tubo, tinha mais de 1 metro e funcionava como uma trombeta para chamar o grupo."],
 ["lagarto de Edmonton","há cerca de 70 milhões de anos","América do Norte","10 a 12 metros","cerca de 4 toneladas","Tinha bico de pato e mais de mil dentinhos dentro da boca para triturar plantas."],
 ["boa mãe lagarto","há cerca de 76 milhões de anos","Estados Unidos","cerca de 9 metros","cerca de 3 toneladas","Cuidava dos filhotes no ninho, por isso ganhou o nome de \"boa mãe\"."],
 ["lagarto com capacete","há cerca de 76 milhões de anos","Canadá","cerca de 9 metros","cerca de 3 toneladas","A crista em meia-lua parecia um capacete dos antigos guerreiros gregos."],
 ["dente de iguana","há cerca de 125 milhões de anos","Bélgica e Inglaterra","cerca de 10 metros","cerca de 3,5 toneladas","Foi um dos primeiros dinossauros descobertos. Tinha um espinho grande no polegar de cada mão."]
];
function comida(d){return d==="carnívoro"?"carnes":d==="herbívoro"?"plantas":"um pouco de tudo: carnes e plantas"}
/* Verso: lista de fatos [ícone, título, texto] e a curiosidade, que o stickers.js desenha na parte de trás do cartão. */
function verso(i){
  var f=F[i],d=D[i];
  return{facts:[
    ["📖","O nome significa",f[0]],
    ["🕰️","Viveu",f[1]+" (período "+d[1]+")"],
    ["🌍","Onde foi achado",f[2]],
    ["📏","Tamanho",f[3]],
    ["⚖️","Peso",f[4]],
    ["🍽️","Comia",comida(d[2])]
  ],fun:f[5]};
}
/* Raridade (índice = número do catálogo - 1). Precisa bater com a tabela sticker_rarity no banco.
   Ultrarraras: Tiranossauro rex, Tricerátops, Velociraptor. Raras: Estegossauro, Braquiossauro, Diplodoco, Espinossauro, Anquilossauro. */
var RARIDADE={20:"ultra",41:"ultra",28:"ultra",11:"rara",13:"rara",14:"rara",25:"rara",44:"rara"};
function pad(n){return (n<10?"0":"")+n}
FC.THEMES.push({id:"dinossauros",name:"Dinossauros",desc:"52 dinossauros de verdade, catalogados por período e alimentação. Os 8 mais famosos são raros.",kind:"dino",
  rarity:RARIDADE,
  cover:20,backOf:verso,
  nameOf:function(i){return D[i][0]},subOf:function(i){return D[i][1]+" · "+D[i][2]},
  art:function(i){return '<img src="stickers/dinossauros/'+pad(i+1)+'.webp" alt="'+FC.esc(D[i][0])+'" loading="lazy">'}});
FC.DINOS=D;
})();
