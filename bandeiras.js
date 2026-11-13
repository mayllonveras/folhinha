/* Tema Bandeiras: raridades e verso da figurinha (capital, população, idioma, moeda, área e curiosidade).
   Mesma ordem do catálogo em stickers.js. Números aproximados (estimativas recentes); arredondados para ficarem fáceis de ler. */
(function(){
"use strict";
var FC=window.FC;
/* [capital, população, idioma, moeda, área, curiosidade] */
var F=[
 ["Brasília","cerca de 212 milhões","português","real","8,5 milhões de km² (o 5º maior do mundo)","A bandeira tem 27 estrelas: uma para cada estado e uma para o Distrito Federal. A faixa diz \"Ordem e Progresso\"."],
 ["Buenos Aires","cerca de 46 milhões","espanhol","peso argentino","2,8 milhões de km²","O Aconcágua, a montanha mais alta das Américas, fica na Argentina. A bandeira tem o Sol de Maio no centro."],
 ["Montevidéu","cerca de 3,4 milhões","espanhol","peso uruguaio","176 mil km²","O Uruguai ganhou a primeira Copa do Mundo, em 1930, jogando em casa."],
 ["Assunção","cerca de 6,9 milhões","espanhol e guarani","guarani","407 mil km²","A bandeira tem desenhos diferentes na frente e no verso, o que é raríssimo. O guarani é falado por quase todo mundo."],
 ["Santiago","cerca de 19,6 milhões","espanhol","peso chileno","756 mil km²","É um país comprido e estreito: tem mais de 4.000 km de norte a sul e só uns 175 km de largura em média."],
 ["Sucre (o governo fica em La Paz)","cerca de 12 milhões","espanhol e muitas línguas indígenas","boliviano","1,1 milhão de km²","La Paz, onde fica o governo, é uma das cidades mais altas do mundo: está a uns 3.600 metros de altura."],
 ["Lima","cerca de 34 milhões","espanhol, quéchua e aimará","sol","1,3 milhão de km²","Machu Picchu, a cidade dos incas no alto das montanhas, fica no Peru."],
 ["Bogotá","cerca de 52 milhões","espanhol","peso colombiano","1,1 milhão de km²","É um dos países com mais espécies de aves do mundo. O café colombiano é famoso."],
 ["Caracas","cerca de 28 milhões","espanhol","bolívar","916 mil km²","O Salto Ángel, a cachoeira mais alta do mundo, com 979 metros de queda, fica na Venezuela."],
 ["Quito","cerca de 18 milhões","espanhol","dólar americano","284 mil km²","O nome vem da linha do Equador, que passa pelo país. As ilhas Galápagos, com seus bichos únicos, também são dele."],
 ["Cidade do México","cerca de 130 milhões","espanhol","peso mexicano","2 milhões de km²","Ali viveram os maias e os astecas, que já faziam chocolate há muitos séculos."],
 ["Washington, D.C.","cerca de 335 milhões","inglês","dólar americano","9,8 milhões de km²","As 50 estrelas da bandeira são os 50 estados, e as 13 listras são as primeiras 13 colônias."],
 ["Ottawa","cerca de 40 milhões","inglês e francês","dólar canadense","10 milhões de km² (o 2º maior do mundo)","Tem milhões de lagos. A folha de bordo vermelha da bandeira é o símbolo do país."],
 ["Havana","cerca de 11 milhões","espanhol","peso cubano","110 mil km²","É a maior ilha do mar do Caribe."],
 ["Kingston","cerca de 2,8 milhões","inglês","dólar jamaicano","11 mil km²","É a terra do reggae e de Usain Bolt, o homem mais rápido do mundo."],
 ["Lisboa","cerca de 10,5 milhões","português","euro","92 mil km²","Das costas de Portugal saíram as caravelas que chegaram ao Brasil em 1500."],
 ["Madri","cerca de 48 milhões","espanhol (também catalão, galego e basco)","euro","506 mil km²","Todo ano, na cidade de Buñol, acontece a Tomatina: uma guerra de tomates."],
 ["Paris","cerca de 68 milhões","francês","euro","cerca de 550 mil km² (só a parte na Europa)","A Torre Eiffel foi feita para uma exposição em 1889 e tem cerca de 330 metros de altura."],
 ["Roma","cerca de 59 milhões","italiano","euro","301 mil km²","Dentro de Roma existe outro país: o Vaticano, o menor do mundo."],
 ["Berlim","cerca de 84 milhões","alemão","euro","358 mil km²","Tem trechos de autoestrada sem limite de velocidade, as famosas Autobahns."],
 ["Londres","cerca de 68 milhões","inglês","libra esterlina","244 mil km²","A bandeira, chamada de Union Jack, junta as bandeiras da Inglaterra, da Escócia e da Irlanda."],
 ["Dublin","cerca de 5,3 milhões","irlandês e inglês","euro","70 mil km²","O trevo de três folhas é o símbolo do país, e o Dia de São Patrício é festejado no mundo todo."],
 ["Amsterdã","cerca de 17,9 milhões","neerlandês (holandês)","euro","42 mil km²","Cerca de um quarto do país fica abaixo do nível do mar. Por isso eles constroem diques e moinhos."],
 ["Bruxelas","cerca de 11,8 milhões","neerlandês, francês e alemão","euro","31 mil km²","Foi lá que nasceram Tintim e os Smurfs. O chocolate belga é famoso."],
 ["Berna","cerca de 8,9 milhões","alemão, francês, italiano e romanche","franco suíço","41 mil km²","A bandeira é quadrada. No mundo, só ela e a do Vaticano não são retangulares."],
 ["Estocolmo","cerca de 10,5 milhões","sueco","coroa sueca","450 mil km²","O Prêmio Nobel foi criado por um sueco, Alfred Nobel."],
 ["Oslo","cerca de 5,5 milhões","norueguês","coroa norueguesa","385 mil km²","No verão, no norte, o sol não se põe: é o sol da meia-noite. No inverno, dá para ver auroras no céu."],
 ["Copenhague","cerca de 5,9 milhões","dinamarquês","coroa dinamarquesa","43 mil km²","Os blocos Lego nasceram lá. A bandeira é uma das mais antigas ainda usadas no mundo."],
 ["Helsinque","cerca de 5,6 milhões","finlandês e sueco","euro","338 mil km²","É a terra dos mil lagos (são quase 200 mil). Dizem que o Papai Noel mora na Lapônia finlandesa."],
 ["Atenas","cerca de 10,4 milhões","grego","euro","132 mil km²","Os Jogos Olímpicos nasceram na Grécia Antiga."],
 ["Moscou","cerca de 144 milhões","russo","rublo","17,1 milhões de km² (o maior do mundo)","É o maior país do mundo e tem 11 fusos horários: quando é manhã num canto, é noite no outro."],
 ["Varsóvia","cerca de 37,6 milhões","polonês","zloty","313 mil km²","Marie Curie, a cientista que ganhou dois Prêmios Nobel, nasceu em Varsóvia."],
 ["Kiev (Kyiv)","cerca de 37 milhões","ucraniano","hryvnia","603 mil km²","As cores da bandeira lembram o céu azul sobre os campos dourados de trigo."],
 ["Ancara","cerca de 85 milhões","turco","lira turca","784 mil km²","Istambul, a maior cidade, fica em dois continentes ao mesmo tempo: a Europa e a Ásia."],
 ["Tóquio","cerca de 124 milhões","japonês","iene","378 mil km²","É chamado de \"País do Sol Nascente\", e o círculo vermelho da bandeira é o Sol."],
 ["Pequim","cerca de 1,41 bilhão","chinês (mandarim)","yuan","9,6 milhões de km²","A Grande Muralha tem mais de 20 mil km de comprimento. O panda-gigante só vive na natureza lá."],
 ["Seul","cerca de 51 milhões","coreano","won","100 mil km²","A bandeira traz o símbolo azul e vermelho do equilíbrio, o taegeuk. O K-pop nasceu lá."],
 ["Nova Délhi","cerca de 1,43 bilhão","hindi e inglês (e muitas outras línguas)","rupia indiana","3,3 milhões de km²","É o país mais populoso do mundo. O xadrez nasceu na Índia."],
 ["Jacarta","cerca de 278 milhões","indonésio","rupia indonésia","1,9 milhão de km²","São mais de 17 mil ilhas! É o maior arquipélago do mundo."],
 ["Bangcoc","cerca de 71 milhões","tailandês","baht","513 mil km²","Antigamente o país se chamava Sião. O elefante é um animal muito querido por lá."],
 ["Hanói","cerca de 100 milhões","vietnamita","dong","331 mil km²","É um dos maiores produtores de café do mundo."],
 ["Jerusalém (muitos países têm embaixada em Tel Aviv)","cerca de 9,8 milhões","hebraico","novo shekel","22 mil km²","O Mar Morto fica entre Israel e a Jordânia: é o lugar mais baixo da Terra em terra firme, e a água é tão salgada que a gente boia."],
 ["Riade","cerca de 36 milhões","árabe","riyal saudita","2,1 milhões de km²","Quase todo o país é deserto, e ele não tem nenhum rio que corra o ano inteiro."],
 ["Cairo","cerca de 112 milhões","árabe","libra egípcia","1 milhão de km²","As pirâmides de Gizé têm mais de 4.500 anos. A de Quéops foi a construção mais alta do mundo por milhares de anos."],
 ["Pretória, Cidade do Cabo e Bloemfontein","cerca de 60 milhões","mais de 10 línguas oficiais","rand","1,2 milhão de km²","Tem três capitais! Cada uma cuida de uma parte do governo."],
 ["Abuja","cerca de 224 milhões","inglês","naira","924 mil km²","É o país mais populoso da África."],
 ["Rabat","cerca de 37 milhões","árabe e berbere","dirham marroquino","446 mil km²","Chefchaouen, a \"cidade azul\", tem casas e ruas pintadas de azul."],
 ["Nairóbi","cerca de 55 milhões","suaíli e inglês","xelim queniano","580 mil km²","Todo ano, milhões de gnus e zebras atravessam as planícies na Grande Migração."],
 ["Luanda","cerca de 37 milhões","português","kwanza","1,2 milhão de km²","É um dos países da África onde se fala português, como no Brasil."],
 ["Maputo","cerca de 34 milhões","português","metical","801 mil km²","Fala português e tem quase 2.500 km de costa no oceano Índico."],
 ["Camberra","cerca de 27 milhões","inglês","dólar australiano","7,7 milhões de km²","A capital não é Sydney, é Camberra! Dizem que tem mais cangurus do que gente."],
 ["Wellington","cerca de 5,2 milhões","inglês, maori e língua de sinais","dólar neozelandês","268 mil km²","Tem muito mais ovelhas do que habitantes. O filme O Senhor dos Anéis foi gravado lá."]
];
/* Raridade (índice = posição no catálogo). Precisa bater com a tabela sticker_rarity no banco.
   Ultrarraras: Brasil, Estados Unidos, Japão. Raras: Canadá, França, Itália, Alemanha, Reino Unido. */
var RARIDADE={0:"ultra",11:"ultra",34:"ultra",12:"rara",17:"rara",18:"rara",19:"rara",20:"rara"};
var t=FC.theme("bandeiras");
t.desc="As bandeiras de 52 países bem conhecidos, com capital, população e curiosidades no verso. As 8 mais famosas são raras.";
t.rarity=RARIDADE;
t.backOf=function(i){
  var f=F[i];
  return{facts:[
    ["🏛️","Capital",f[0]],
    ["👥","População",f[1]],
    ["🗣️","Idioma",f[2]],
    ["💰","Moeda",f[3]],
    ["📏","Área",f[4]]
  ],fun:f[5]};
};
})();
