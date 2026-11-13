/* Tema Animais ameaçados: 52 animais raros ou em risco de extinção, do Brasil e do mundo.
   As figurinhas são imagens (stickers/ameacados/NN.webp, NN = número do catálogo).
   Situação de conservação segundo a lista vermelha da IUCN (conferir antes de publicar: a classificação muda com o tempo).
   Números e medidas são aproximados e arredondados. */
(function(){
"use strict";
var FC=window.FC;
/* [nome, nível, gênero ("a" ou "o", só para "quase ameaçado/a")]
   Níveis: ew = extinto na natureza, cr = criticamente em perigo, en = em perigo, vu = vulnerável, nt = quase ameaçado. */
var D=[
 // Folha 1: Brasil
 ["Onça-pintada","nt","a"],["Mico-leão-dourado","en"],["Ararinha-azul","ew","a"],["Arara-azul-grande","vu"],["Tamanduá-bandeira","vu"],["Boto-cor-de-rosa","en"],
 ["Peixe-boi-amazônico","vu"],["Ariranha","en"],["Muriqui-do-norte","cr"],["Tatu-bola","vu"],["Lobo-guará","nt","o"],["Harpia","vu"],
 // Folha 2: mamíferos do mundo
 ["Panda-gigante","vu"],["Tigre","en"],["Orangotango","cr"],["Gorila-de-montanha","en"],["Rinoceronte-negro","cr"],["Elefante-asiático","en"],
 ["Leopardo-das-neves","vu"],["Lêmure-catta","en"],["Coala","vu"],["Diabo-da-tasmânia","en"],["Okapi","en"],["Pangolim-malaio","cr"],
 // Folha 3: mares
 ["Baleia-azul","en"],["Vaquita","cr"],["Dugongo","vu"],["Foca-monge-havaiana","en"],["Tartaruga-de-couro","vu"],["Tartaruga-verde","en"],
 ["Tartaruga-de-pente","cr"],["Tubarão-martelo","cr"],["Tubarão-baleia","en"],["Raia-manta","en"],["Cavalo-marinho","vu"],["Albatroz-errante","vu"],
 // Folha 4: aves, répteis, anfíbios e insetos
 ["Kakapo","cr"],["Condor-dos-Andes","vu"],["Águia-filipina","cr"],["Pinguim-imperador","en"],["Dragão-de-komodo","en"],["Gavial","cr"],
 ["Salamandra-gigante","cr"],["Axolote","cr"],["Borboleta-monarca","en"],["Iguana-azul","en"],["Rã-dourada","cr"],["Calau-de-capacete","cr"],
 // Folha 5: extras
 ["Urso-polar","vu"],["Lince-ibérico","vu"],["Bonobo","en"],["Elefante-africano","en"]
];

/* Verso da figurinha. Mesma ordem do catálogo:
   [onde vive, o que come, tamanho, peso, por que está ameaçado, o que está ajudando, curiosidade]. */
var F=[
 ["Américas, do México ao norte da Argentina. No Brasil: Amazônia, Pantanal, Cerrado e Mata Atlântica","carne: capivaras, jacarés, veados e peixes","1,2 a 1,8 m, fora a cauda","50 a 120 kg","perde a mata onde vive e é caçada","Corredores ecológicos ligam as florestas e projetos no Pantanal protegem as onças. É vulnerável no Brasil.","Nada muito bem e adora água: ela mergulha e até caça jacaré."],
 ["Mata Atlântica do estado do Rio de Janeiro","frutas, insetos e bichinhos pequenos","cerca de 25 cm, fora a cauda","cerca de 600 g","a Mata Atlântica foi quase toda derrubada","Criação em zoológicos, soltura na mata e corredores de floresta fizeram a população crescer.","Os dedos compridos e finos servem para tirar insetos de buracos e folhas."],
 ["Caatinga da Bahia. Desapareceu da natureza no ano 2000","sementes e frutos da Caatinga","cerca de 57 cm","cerca de 300 g","foi capturada para venda e perdeu seu ambiente","Nascidas em cativeiro, as ararinhas foram soltas na Caatinga em 2022 e já nasceram filhotes livres.","É a ave do filme Rio: Blu é uma ararinha-azul."],
 ["Pantanal, Cerrado e sul da Amazônia","castanhas de palmeiras, como o acuri e a bocaiuva","cerca de 1 m","1,2 a 1,7 kg","era capturada como animal de estimação e perdeu árvores de ninho","O Projeto Arara Azul instala ninhos artificiais, e a população do Pantanal cresceu muito.","É a maior arara do mundo, e o bico forte quebra até castanhas bem duras."],
 ["Da América Central ao norte da Argentina. No Brasil, em quase todos os biomas","formigas e cupins, até milhares por dia","1 a 1,3 m, fora a cauda","30 a 40 kg","sofre atropelamentos, queimadas e perda do Cerrado","Projetos resgatam tamanduás atropelados e protegem o Cerrado onde eles vivem.","Não tem dentes: pega formigas com uma língua de até 60 cm."],
 ["Rios da Amazônia e do Orinoco","peixes e caranguejos","2 a 2,5 m","100 a 180 kg","é morto por redes de pesca e pelo mercúrio nos rios","Pesquisadores acompanham os botos, e leis proíbem pescar o boto.","Pode virar a cabeça de lado, porque o pescoço não é preso como o dos golfinhos do mar."],
 ["Rios e lagos da Amazônia","plantas aquáticas","2,5 a 2,8 m","400 a 500 kg","foi muito caçado e é atingido por barcos","Centros de resgate cuidam de filhotes órfãos e os devolvem aos rios.","Passa o dia comendo plantas e sobe à superfície para respirar de tempos em tempos."],
 ["Rios da Amazônia e do Pantanal","peixes","1,5 a 1,8 m","25 a 32 kg","perde rios limpos e fica sem peixe","Cientistas reconhecem cada ariranha pelas manchas claras do pescoço e contam as famílias para proteger os rios.","Vive em família de até 10 e é chamada de “lobo-do-rio”."],
 ["Mata Atlântica de Minas Gerais e do Espírito Santo","folhas, frutas e flores","cerca de 60 cm, fora a cauda","cerca de 10 kg","restam poucos pedaços de mata onde ele vive","Reservas protegem a mata que sobrou e a população vem crescendo devagar.","É o maior macaco das Américas e vive em grupos bem pacíficos."],
 ["Caatinga e Cerrado do Nordeste e do Centro do Brasil","formigas, cupins e algumas frutas","25 a 30 cm","cerca de 1,2 kg","perde a Caatinga e é caçado","Áreas protegidas e pesquisas ajudam a descobrir quantos ainda existem.","Quando se assusta, se enrola numa bola e fecha a casca. Foi o Fuleco, mascote da Copa de 2014."],
 ["Cerrado e campos da América do Sul","frutos como a lobeira, e bichos pequenos","cerca de 1 m, fora a cauda","20 a 30 kg","é atropelado nas estradas e perde os campos","Passagens de fauna e placas nas estradas ajudam a salvar os lobos-guarás.","É o maior canídeo da América do Sul e aparece na nota de 200 reais."],
 ["Florestas da América Central e da América do Sul, como a Amazônia","preguiças, macacos e outros bichos","cerca de 1 m, com asas de até 2 m abertas","4 a 9 kg","perde a floresta e é caçada","Monitoram-se os ninhos e protege-se a floresta onde ela vive.","As garras chegam a uns 12 cm, quase do tamanho das de um urso."],
 ["Montanhas do centro da China","bambu, quase o dia inteiro","1,2 a 1,9 m","70 a 125 kg","perdeu muito do bambuzal onde vive","A China criou reservas e corredores de bambu, e o panda deixou de estar “em perigo” em 2016.","Tem um “falso polegar”, um osso do pulso, que ajuda a segurar o bambu."],
 ["Florestas e pântanos da Ásia: Índia, Rússia, Sumatra e outros","veados, javalis e outros bichos grandes","2,5 a 3 m com a cauda","100 a 300 kg","é caçado e perde as florestas","Reservas e fiscalização fizeram o número de tigres voltar a subir em alguns países.","As listras são únicas, como impressão digital, e vão até a pele."],
 ["Floresta de Bornéu, na Indonésia e na Malásia","frutas, folhas e cascas de árvore","1,2 a 1,4 m","40 a 90 kg","perde a floresta para plantações","Santuários cuidam de filhotes órfãos e ensinam a viver na mata para devolvê-los à floresta.","O nome significa “homem da floresta”. Ele faz um ninho novo para dormir toda noite."],
 ["Montanhas de Uganda, Ruanda e Congo, na África","folhas, brotos e talos","1,5 a 1,8 m em pé","140 a 200 kg","perde a floresta e cai em armadilhas","Guardas-florestais e visitas cuidadosas fizeram o número de gorilas passar de mil.","O macho adulto tem pelos prateados nas costas e é chamado de “costas-prateadas”."],
 ["Savanas e arbustais da África: Namíbia, África do Sul, Quênia e outros","folhas e galhos","cerca de 3,5 m","800 kg a 1,4 t","é caçado pelo chifre","Guardas e comunidades protegem os rinocerontes, e a população voltou a crescer.","O lábio de cima é pontudo como um dedo, ótimo para pegar folhas."],
 ["Índia e Sudeste da Ásia","capim, galhos, cascas e frutas, mais de 100 kg por dia","2 a 3,5 m de altura","3 a 5 t","perde as florestas e é caçado","Corredores deixam os elefantes passarem entre as matas, e cercas de abelhas afastam eles das plantações.","As orelhas são menores que as do elefante africano, e só alguns machos têm presas grandes."],
 ["Montanhas altas da Ásia, como o Himalaia","cabras e carneiros selvagens","cerca de 1,2 m, mais a cauda de quase 1 m","25 a 55 kg","é caçado e perde os animais de que se alimenta","Comunidades cercam os rebanhos para que os leopardos não precisem ser caçados.","A cauda grossa serve de cachecol quando ele dorme, e os saltos chegam a uns 15 m."],
 ["Sul de Madagascar","frutas, folhas e flores","cerca de 40 cm, mais a cauda de uns 55 cm","2 a 3,5 kg","perde a floresta e é capturado como bicho de estimação","Reservas e reflorestamento protegem a mata onde ele vive em Madagascar.","A cauda tem 13 anéis pretos e brancos, e ele toma banho de sol de braços abertos."],
 ["Leste da Austrália","folhas de eucalipto","60 a 85 cm","4 a 14 kg","sofre incêndios e perde as florestas","Hospitais de coalas cuidam dos feridos e plantam-se mais eucaliptos.","Dorme cerca de 20 horas por dia, porque o eucalipto dá pouca energia."],
 ["Ilha da Tasmânia, na Austrália","carne, inclusive de bichos que já estavam mortos","60 a 80 cm","6 a 12 kg","tem um câncer contagioso","Os cientistas criam diabos saudáveis e os soltam na natureza.","Tem uma mordida muito forte para o tamanho, e as orelhas ficam vermelhas quando ele se zanga."],
 ["Floresta da República Democrática do Congo, na África","folhas, frutas e capim","2 a 2,5 m","200 a 350 kg","perde a floresta e é caçado","Uma reserva especial no Congo protege o okapi, e zoológicos criam okapis.","Parece primo da zebra, mas é parente da girafa. A língua, de uns 35 cm, limpa até os olhos."],
 ["Florestas do Sudeste da Ásia","formigas e cupins","40 a 65 cm, mais a cauda","2 a 7 kg","é caçado e vendido ilegalmente","Leis proíbem a caça e a venda, e centros resgatam pangolins para soltá-los de novo.","É o único mamífero com escamas e se enrola em bola quando se assusta."],
 ["Todos os oceanos do mundo","krill, pequenos bichinhos do mar, toneladas por dia","25 a 30 m","100 a 150 t","foi caçada demais até o século passado","Desde que a caça foi proibida, em 1966, as baleias-azuis vêm se recuperando devagar.","É o maior animal que já viveu na Terra. Só a língua pesa quanto um elefante."],
 ["Parte norte do Golfo da Califórnia, no México","peixes pequenos e lulas","1,4 a 1,5 m","40 a 55 kg","morre presa por acidente em redes de pesca","Proibir as redes e vigiar o mar são a esperança, pois restam cerca de 10 vaquitas.","É o menor golfinho do mundo e parece ter maquiagem preta em volta dos olhos e dos lábios."],
 ["Mares quentes do Oceano Índico e do Pacífico","ervas marinhas","2,5 a 3 m","250 a 400 kg","perde as ervas marinhas e é pego em redes","Áreas marinhas protegidas cuidam das ervas de que ele se alimenta.","Dizem que os marinheiros antigos confundiam o dugongo com sereias."],
 ["Ilhas do Havaí, no Oceano Pacífico","peixes, lulas e polvos","2,1 a 2,4 m","170 a 270 kg","fica preso em redes e perde as praias","Voluntários protegem os filhotes nas praias, e a população vem crescendo devagar.","Descansa nas praias, e as pessoas devem observar de longe, para não assustar."],
 ["Mares tropicais e temperados do mundo. No Brasil desova no Espírito Santo","águas-vivas","1,5 a 2 m","250 a 700 kg","engole sacos plásticos e morre em redes de pesca","O Projeto Tamar vigia as praias onde elas põem os ovos.","É a maior tartaruga do mundo e mergulha a mais de 1.000 m de profundidade."],
 ["Mares tropicais do mundo, inclusive o do Brasil","algas e ervas marinhas, quando adulta","1 a 1,5 m","110 a 190 kg","perde as praias e é pega em redes","O Projeto Tamar protege os ninhos e solta os filhotes no mar.","O nome vem da cor da gordura, e não da casca."],
 ["Mares tropicais do mundo, inclusive o do Brasil","esponjas do mar","80 a 90 cm","45 a 70 kg","foi caçada pelo casco bonito","A venda de objetos de casco de tartaruga é proibida em quase todo o mundo.","O bico fino e pontudo alcança esponjas escondidas nos recifes."],
 ["Mares tropicais e quentes do mundo, inclusive o litoral do Brasil","peixes, lulas e raias","3 a 4 m","80 a 150 kg","é pescado demais, por exemplo pelas nadadeiras","Limites de pesca e a proibição de cortar nadadeiras protegem os tubarões.","Os olhos nas pontas da cabeça dão uma visão muito ampla."],
 ["Mares quentes e tropicais do mundo","plâncton e peixes pequenos","10 a 12 m","10 a 20 t","é pescado demais e atingido por barcos","Áreas de proteção e passeios com regras ajudam os tubarões-baleia.","É o maior peixe do mundo, mas só come bichinhos minúsculos. As pintas são únicas em cada um."],
 ["Mares tropicais e temperados do mundo","plâncton","5 a 7 m com as asas abertas","cerca de 1 t","é pescada demais e fica presa em redes","Proteção internacional e passeios de mergulho com regras ajudam as raias-mantas.","As manchas da barriga são únicas, como impressão digital."],
 ["Águas rasas tropicais e temperadas do mundo","bichinhos minúsculos, os crustáceos","de 2 a 35 cm, conforme a espécie","poucos gramas","perde os mangues e os recifes e é pescado (no mundo todo, é considerado quase ameaçado)","Protege-se os recifes e os mangues, onde eles se escondem.","É o pai que carrega os ovos numa bolsa na barriga e “dá à luz”."],
 ["Oceanos do Sul, perto da Antártida","lulas e peixes","3 a 3,5 m com as asas abertas","6 a 12 kg","morre presa em linhas de pesca","Linhas de pesca com fitas que espantam as aves reduzem os acidentes.","É a ave de asas mais compridas do mundo e voa milhares de km quase sem bater as asas."],
 ["Florestas das ilhas da Nova Zelândia","folhas, frutos e sementes","cerca de 60 cm","1 a 4 kg","gatos e ratos trazidos por pessoas comem os filhotes","Cuidadores monitoram cada kakapo: de 51 aves em 1995 para 325 em 2026.","É o único papagaio que não voa e o mais pesado do mundo. Tem um cheiro adocicado."],
 ["Cordilheira dos Andes, na América do Sul","animais que já estavam mortos","1 m, com asas de até 3,2 m abertas","11 a 15 kg","sofre envenenamento e perde o ambiente","Programas de criação soltam condores nos Andes.","É uma das maiores aves que voam e plana horas sem bater as asas."],
 ["Florestas das Filipinas","macacos, morcegos e aves","cerca de 1 m, com asas de uns 2 m abertas","4 a 8 kg","perde a floresta onde vive","Centros criam filhotes, e a ave é protegida por lei.","É a ave-símbolo das Filipinas e já foi chamada de “águia comedora de macacos”."],
 ["Antártida","peixes, lulas e krill","1,1 a 1,3 m","22 a 45 kg","o gelo do mar derrete e os filhotes perdem o chão","Cientistas acompanham as colônias por satélite, e proteger o gelo é a esperança.","O pai choca o ovo sobre os pés por cerca de dois meses, em pleno inverno gelado."],
 ["Ilhas da Indonésia, como Komodo e Rinca","carne, inclusive de bichos mortos","2 a 3 m","70 a 90 kg","as ilhas perdem as presas e o clima esquenta","O Parque Nacional de Komodo protege as ilhas onde ele vive.","É o maior lagarto do mundo e cheira o ar com a língua dividida."],
 ["Rios do norte da Índia e do Nepal","peixes","4 a 6 m","cerca de 200 kg ou mais","perde os rios limpos e é pego em redes","Ovos são cuidados em criadouros e os gaviais são soltos em rios protegidos.","O macho tem uma bola no focinho, a “ghara”, que zumbe para chamar as fêmeas."],
 ["Riachos de montanha da China","peixes, caranguejos e outros bichos de rio","1 a 1,5 m","25 a 50 kg","é pescada e perde os rios limpos","Reservas e criadouros ajudam a salvar as salamandras.","É o maior anfíbio do mundo e respira também pela pele."],
 ["Canais e lagos de Xochimilco, no México","vermes, larvas e peixinhos","15 a 30 cm","60 a 110 g","a água da cidade está poluída","Refúgios nos canais e hortas flutuantes protegem os axolotes.","Pode crescer de novo as patas perdidas e vive nas águas com as guelras para sempre."],
 ["Américas do Norte e Central; migra para o México","as lagartas comem só asclépias; os adultos bebem néctar","asas de 9 a 10 cm abertas","menos de 1 g","perde as asclépias e a floresta onde passa o inverno","Plantar asclépias em jardins ajuda as monarcas.","Voa até uns 4.000 km, sem nunca ter feito o caminho antes."],
 ["Ilha Grand Cayman, no Mar do Caribe","plantas, frutas e flores","1,2 a 1,5 m","11 a 14 kg","as florestas da ilha foram derrubadas","Um programa de criação e soltura fez as iguanas passarem de menos de 25 em 2002 para centenas hoje.","Vive quase sempre sozinha, esquentando-se ao sol sobre as pedras."],
 ["Florestas de montanha do Panamá","insetos pequenos","4 a 6 cm","3 a 15 g","um fungo mortal ataca os anfíbios, e talvez já não existam rãs-douradas livres na natureza","Centros de criação mantêm rãs-douradas salvas do fungo.","Acena com uma pata para as outras rãs, porque o barulho dos riachos abafa o som."],
 ["Florestas do Sudeste da Ásia: Bornéu, Sumatra e Malásia","figos e frutos","cerca de 1,2 m","cerca de 3 kg","é caçado pelo “capacete” e perde a floresta","Campanhas e leis tentam acabar com o comércio do capacete.","O canto parece uma gargalhada, e o “capacete” é feito de osso maciço."],
 ["Gelo do Ártico","focas, principalmente","2 a 2,5 m","300 a 600 kg","o gelo do mar derrete","Menos poluição e proteção do gelo do Ártico ajudam os ursos-polares.","A pele é preta, e o pelo não é branco, é transparente."],
 ["Sul da Espanha e de Portugal","coelhos, quase um por dia","80 a 110 cm","8 a 15 kg","perdeu os coelhos de que se alimenta","Programas de criação fizeram os linces passarem de cerca de 100 a mais de 2.000.","Os tufos pretos nas orelhas e a barba nas bochechas são a sua marca registrada."],
 ["Floresta do rio Congo, na África","frutas, folhas e bichinhos","70 a 83 cm","30 a 40 kg","perde a floresta e é caçado","Santuários de resgate e comunidades locais protegem os bonobos.","Vive em grupos comandados pelas fêmeas e resolve brigas com carinhos."],
 ["Savanas e florestas da África","capim, folhas, galhos e frutas","3 a 3,5 m de altura","4 a 7 t","é caçado pelas presas de marfim","Guardas, leis contra o marfim e áreas protegidas ajudam os elefantes.","É o maior animal terrestre. A tromba serve para beber, cheirar e até abraçar."]
];

var NIVEL={ew:"Extinto na natureza",cr:"Criticamente em perigo",en:"Em perigo",vu:"Vulnerável",nt:"Quase ameaçado"};
var STATUS_EXTRA={34:"Vulnerável no Brasil"};   // Cavalo-marinho: vulnerável na lista do Brasil, quase ameaçado no mundo
function status(i){
  var d=D[i],n=d[1];
  if(STATUS_EXTRA[i])return STATUS_EXTRA[i];
  if(n==="ew")return d[2]==="a"?"Extinta na natureza":"Extinto na natureza";
  if(n==="nt")return d[2]==="a"?"Quase ameaçada":"Quase ameaçado";
  return NIVEL[n];
}
/* Verso: lista de fatos [ícone, título, texto] e a curiosidade, que o stickers.js desenha na parte de trás do cartão. */
function verso(i){
  var f=F[i];
  return{facts:[
    ["📍","Onde vive",f[0]],
    ["⚠️","Situação",status(i)+": "+f[4]],
    ["🍽️","Come",f[1]],
    ["📏","Tamanho e peso",f[2]+" · "+f[3]],
    ["💚","Como está sendo ajudado",f[5]]
  ],fun:f[6]};
}
/* Raridade (índice = número do catálogo - 1). Precisa bater com a tabela sticker_rarity no banco.
   Ultrarraras (as mais perto de sumir): Ararinha-azul, Vaquita, Kakapo.
   Raras (as mais queridas): Onça-pintada, Mico-leão-dourado, Panda-gigante, Tigre, Baleia-azul. */
var RARIDADE={2:"ultra",25:"ultra",36:"ultra",0:"rara",1:"rara",12:"rara",13:"rara",24:"rara"};
function pad(n){return (n<10?"0":"")+n}
FC.THEMES.push({id:"ameacados",name:"Animais ameaçados",desc:"52 animais raros ou em risco de extinção, do Brasil e do mundo, com o que está sendo feito para salvá-los. Os 8 mais especiais são raros.",kind:"ameacado",
  rarity:RARIDADE,
  cover:1,backOf:verso,
  nameOf:function(i){return D[i][0]},subOf:function(i){return status(i)},
  art:function(i){return '<img src="stickers/ameacados/'+pad(i+1)+'.webp" alt="'+FC.esc(D[i][0])+'" loading="lazy">'}});
FC.AMEACADOS=D;
})();
