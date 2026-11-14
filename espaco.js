/* Tema Corpos do espaço: 52 corpos reais do universo, do Sol às galáxias.
   As figurinhas são imagens (stickers/espaco/NN.webp, NN = número do catálogo).
   Dados do verso conferidos em fontes oficiais: NASA (fichas do NSSDCA e páginas de ciência), JPL/SSD (luas e corpos pequenos),
   NASA Exoplanet Archive, ESA, ESO e Chandra. Distâncias entre a Terra e os planetas são o mínimo e o máximo calculados com efemérides
   (1900 a 2100), arredondados. Exoplanetas são ilustrações artísticas: ninguém viu esses mundos de perto. */
(function(){
"use strict";
var FC=window.FC;

/* Ícone de cada tipo de dado do verso. */
var IC={"De onde vem o nome":"📖","Onde fica":"📍","Distância da Terra":"🚀","Distância do Sol":"☀️","Tamanho":"📏","Temperatura":"🌡️","Luas":"🌙","Descoberta":"🔭",
 "Cor":"🎨","Cores":"🎨","Tipo":"🏷️","Companheira":"👯","Planetas":"🪐","Brilho":"✨","Sistema":"🔗","Um ano":"📅","Volta":"🔄","Visita":"🛰️","Visitada":"🛰️",
 "Cratera":"🕳️","Dia":"⏱️","Giro":"🌀","Rotação":"🌀","Superfície":"🧊","Massa":"⚖️","Foto":"📸","Fotos":"📸","Origem":"💥","Vista em":"👀","Idade":"⏳",
 "Visível":"👁️","Estrelas":"⭐","Berçário":"🍼","Material":"🌫️","Próxima visita":"📆","Mancha":"🔴","Catálogo":"🗂️","O que é":"❓","Centro":"💫","Forma":"🥔","Alfa A":"⭐","Alfa B":"⭐","Giram juntas":"🔄","Anel":"⭕","Aglomerados":"🔵","Também conhecida como":"🏷️","Também conhecidas como":"🏷️"};

var NOME="De onde vem o nome",ONDE="Onde fica",DT="Distância da Terra",DS="Distância do Sol",TAM="Tamanho",TEMP="Temperatura",LUAS="Luas",DESC="Descoberta";
var J="Fica na região de Júpiter: de uns 590 a 965 milhões de km da Terra.";
var SA="Fica na região de Saturno: de uns 1,2 a 1,65 bilhão de km da Terra.";
var MA="Fica na região de Marte: de uns 56 a 400 milhões de km da Terra.";

/* [nome, tipo (aparece embaixo do nome), [6 fatos: título e texto], você sabia?]
   Os 3 primeiros fatos ocupam a linha toda no cartão; os outros 3 ficam em colunas, então precisam ser curtos. */
var D=[
 // Folha 1: estrelas e planetas
 ["Sol","Estrela · anã amarela",[[NOME,"Vem de “sol”, palavra do latim. Os gregos chamavam o Sol de Hélios."],[ONDE,"No centro do Sistema Solar. É a nossa estrela."],[DT,"150 milhões de km. A luz do Sol leva uns 8 minutos para chegar aqui."],[TAM,"1,4 milhão de km (100× a Terra)"],[TEMP,"Superfície: 5.500 °C"],["Idade","4,5 bilhões de anos"]],
  "O Sol tem 99,8% de toda a massa do Sistema Solar. Tudo o resto, planetas e luas, soma só 0,2%."],
 ["Sirius","Estrela · a mais brilhante do céu",[[NOME,"É chamada de Estrela do Cão (Dog Star) porque brilha na constelação do Cão Maior."],[ONDE,"Constelação do Cão Maior. É uma das estrelas mais próximas do Sol."],[DT,"8,6 anos-luz."],[TAM,"2,4 milhões de km (1,7× o Sol)"],["Cor","Branco-azulada, mais quente que o Sol"],["Companheira","Sirius B, uma anã branca"]],
  "É a estrela mais brilhante do céu à noite, em boa parte porque está perto. Ela e a Sirius B giram uma em volta da outra a cada 50 anos."],
 ["Betelgeuse","Estrela · supergigante vermelha",[[NOME,"Nome de origem árabe. Fica no ombro do caçador Órion."],[ONDE,"Constelação de Órion: a estrela avermelhada do ombro do caçador. Dá para ver a olho nu."],[DT,"Entre 550 e 750 anos-luz (a medida varia porque a estrela pulsa)."],[TAM,"≈ 700× o tamanho do Sol"],["Cor","Vermelha: mais fria que o Sol"],["Tipo","Supergigante vermelha"]],
  "Em 2019 e 2020 ela escureceu de repente. O Hubble e o VLT mostraram que a estrela soltou uma nuvem de poeira. Um dia ela vai explodir como supernova."],
 ["Alfa do Centauro","Estrelas · sistema triplo",[["O que é","O sistema de estrelas mais próximo da Terra: duas estrelas, a A e a B, e a pequena Proxima, a “C”."],[ONDE,"Constelação de Centauro, no céu do sul."],[DT,"Cerca de 4,3 anos-luz."],["Alfa A","Do tipo do Sol, só um pouco maior"],["Alfa B","Tipo K1, um pouco menor"],["Giram juntas","Uma volta a cada 80 anos"]],
  "A e B giram em volta uma da outra e chegam a ficar a só 11 vezes a distância entre a Terra e o Sol. Em 2016 foi achado um planeta quase do tamanho da Terra em volta da Proxima, a terceira estrela do grupo."],
 ["Estrela Polar","Estrela · supergigante (Polaris)",[[NOME,"Polaris é a Estrela Polar: a estrela brilhante mais perto do eixo de giro da Terra no hemisfério norte."],[ONDE,"Constelação da Ursa Menor, quase exatamente sobre o polo norte do céu."],[DT,"Entre 430 e 520 anos-luz (os cientistas ainda discutem)."],["Brilho","Mais de 2.000 Sóis"],["Tipo","Supergigante que pulsa"],["Sistema","Triplo: tem 2 companheiras"]],
  "Ela quase não se mexe no céu, e as outras estrelas parecem girar ao redor dela. Por isso serve para achar o norte. No hemisfério sul ela não aparece."],
 ["Mercúrio","Planeta rochoso",[[NOME,"Tem o nome do mais veloz dos deuses romanos. É o planeta que mais depressa dá a volta no Sol."],[ONDE,"1º planeta a partir do Sol, o mais perto dele."],[DT,"De uns 82 a 217 milhões de km (muda conforme as órbitas)."],[TAM,"4.879 km: o menor planeta"],[TEMP,"De 430 °C de dia a −180 °C à noite"],[LUAS,"Nenhuma"]],
  "Um ano em Mercúrio dura só 88 dias terrestres, mas um dia inteiro, de um nascer do Sol ao outro, dura 176 dias."],
 ["Vênus","Planeta rochoso",[[NOME,"Deusa romana do amor e da beleza. É o 3º objeto mais brilhante do céu, depois do Sol e da Lua."],[ONDE,"2º planeta a partir do Sol. É o planeta vizinho mais próximo da Terra."],[DT,"De uns 40 a 260 milhões de km."],[TAM,"12.104 km (quase como a Terra)"],[TEMP,"464 °C: o planeta mais quente"],[LUAS,"Nenhuma"]],
  "Vênus gira ao contrário da maioria dos planetas, e devagar: um dia lá (243 dias terrestres) é mais longo que o ano (225 dias)."],
 ["Terra","Planeta rochoso",[[NOME,"Em inglês, “Earth” é uma palavra germânica que quer dizer “o chão”. É o único planeta que não leva nome de deus grego ou romano."],[ONDE,"3º planeta a partir do Sol, a uma distância em que a água pode ficar líquida."],[DT,"Nosso lar! Fica a 150 milhões de km do Sol. Essa distância é chamada de 1 UA (unidade astronômica)."],[TAM,"12.756 km"],[TEMP,"Média de 15 °C"],[LUAS,"1: a Lua"]],
  "É o único lugar do universo onde se sabe que existe vida. Cerca de 71% da superfície está coberta de água."],
 ["Marte","Planeta rochoso",[[NOME,"Deus romano da guerra. A cor vermelha lembrava sangue."],[ONDE,"4º planeta a partir do Sol. É o “planeta vermelho”."],[DT,"De uns 56 a 400 milhões de km."],[TAM,"6.792 km (um pouco mais da metade da Terra)"],[TEMP,"Média de −65 °C"],[LUAS,"2: Fobos e Deimos"]],
  "Marte tem o maior vulcão do Sistema Solar, o Monte Olimpo, e o maior cânion, o Valles Marineris, com 3.870 km de comprimento."],
 ["Júpiter","Planeta gasoso",[[NOME,"Rei dos deuses romanos. É o maior dos planetas."],[ONDE,"5º planeta a partir do Sol, depois do cinturão de asteroides."],[DT,"De uns 590 a 965 milhões de km."],[TAM,"143 mil km (11× a Terra)"],[TEMP,"−110 °C no topo das nuvens"],[LUAS,"95 conhecidas"]],
  "A Grande Mancha Vermelha é uma tempestade maior que a Terra, que dura há centenas de anos. Se Júpiter fosse oco, caberiam mil Terras dentro dele."],
 ["Saturno","Planeta gasoso",[[NOME,"Deus romano da agricultura."],[ONDE,"6º planeta a partir do Sol. É o “senhor dos anéis”."],[DT,"De uns 1,2 a 1,65 bilhão de km."],[TAM,"120.536 km (9,5× a Terra)"],[TEMP,"−140 °C"],[LUAS,"274 conhecidas"]],
  "É o único planeta menos denso que a água. Se existisse uma banheira enorme, Saturno boiaria!"],
 ["Urano","Planeta de gelo",[[NOME,"Deus grego do céu. Foi descoberto em 1781 por William Herschel, o primeiro planeta achado com telescópio."],[ONDE,"7º planeta a partir do Sol."],[DT,"De uns 2,6 a 3,2 bilhões de km."],[TAM,"51.118 km (4× a Terra)"],[TEMP,"−195 °C"],[LUAS,"28 conhecidas"]],
  "Urano gira “deitado”: o eixo é inclinado 98°. Parece uma bola rolando pela órbita."],
 ["Netuno","Planeta de gelo",[[NOME,"Deus romano do mar, por causa da cor azul. Foi o primeiro planeta achado por cálculos de matemática, em 1846."],[ONDE,"8º e último planeta a partir do Sol."],[DT,"De uns 4,3 a 4,7 bilhões de km."],[TAM,"49.528 km (3,9× a Terra)"],[TEMP,"−200 °C"],[LUAS,"16 conhecidas"]],
  "Em 2011 Netuno completou a 1ª volta no Sol desde que foi descoberto: um ano lá dura 165 anos terrestres. Os ventos dele são supersônicos."],
 // Folha 2: planetas anões e luas
 ["Plutão","Planeta anão",[[NOME,"Deus romano do mundo dos mortos. O nome foi sugerido em 1930 por Venetia Burney, uma menina inglesa de 11 anos."],[ONDE,"No Cinturão de Kuiper, uma região de corpos de gelo além de Netuno."],[DT,"De uns 4,3 a 7,5 bilhões de km."],[TAM,"2.376 km (menor que a Lua)"],[TEMP,"Cerca de −230 °C"],[LUAS,"5 conhecidas"]],
  "A região clara em forma de coração, vista pela sonda New Horizons em 2015, faz parte de uma superfície coberta de gelo de nitrogênio e metano. Plutão era o 9º planeta até 2006, quando virou planeta anão."],
 ["Ceres","Planeta anão",[[NOME,"Deusa romana da colheita e dos cereais: a palavra “cereal” vem do nome dela. Foi descoberto em 1801 por Giuseppe Piazzi."],[ONDE,"No cinturão de asteroides, entre Marte e Júpiter. É o único planeta anão do Sistema Solar interno."],[DT,"De uns 240 a 590 milhões de km."],[TAM,"939 km (1/4 da Lua)"],[TEMP,"−105 °C em média"],[LUAS,"Nenhuma"]],
  "Foi o primeiro planeta anão visitado por uma sonda: a Dawn, da NASA, chegou lá em 2015. Ceres tem grandes depósitos de sal."],
 ["Dione","Lua de Saturno",[[NOME,"Dione foi uma titã (deusa) da mitologia grega, que Homero descreveu como mãe de Afrodite."],[ONDE,"Lua de Saturno, a uns 377 mil km do planeta. Dá uma volta em Saturno a cada 2,7 dias."],[DT,SA],[TAM,"1.123 km (raio de 562 km)"],[TEMP,"−186 °C"],[DESC,"Giovanni Cassini, 1684"]],
  "Dione é feita de gelo em volta de um núcleo de rocha, que é cerca de 1/3 dela. As linhas claras e finas que se veem nas fotos são penhascos de gelo."],
 ["Réia","Lua de Saturno",[[NOME,"Réia era uma titã (deusa) da mitologia grega, filha de Urano e Gaia e mãe de vários deuses, como Zeus."],[ONDE,"Lua de Saturno, a 527 mil km do planeta. Fica mais longe de Saturno que Dione e Tétis."],[DT,SA],[TAM,"1.527 km (2ª maior de Saturno)"],[TEMP,"−174 °C ao sol, −220 °C na sombra"],[DESC,"Giovanni Cassini, 1672"]],
  "Réia é feita de cerca de 3/4 de gelo e 1/4 de rocha: uma bola de neve suja e cheia de crateras."],
 ["Tétis","Lua de Saturno",[[NOME,"Tétis era uma titã da mitologia grega, filha de Urano e Gaia e mãe dos rios e das Oceânides."],[ONDE,"Lua de Saturno, a uns 295 mil km do planeta."],[DT,SA],[TAM,"1.066 km (5ª maior de Saturno)"],[TEMP,"−187 °C"],[DESC,"Giovanni Cassini, 1684"]],
  "Tétis tem uma cratera enorme, a Odisseu, com 400 km (quase 2/5 do tamanho da lua), e um vale gigante, o Ítaca, com 2.000 km de comprimento. É feita quase só de gelo de água."],
 ["Lua","Lua da Terra",[["O que é","O único satélite natural da Terra. O lado oculto dela só foi visto em 1959, por uma nave soviética."],[ONDE,"Gira em volta da Terra. É o nosso satélite natural."],[DT,"384.400 km em média: de 363.300 km (mais perto) a 405.500 km."],[TAM,"3.475 km (1/4 da Terra)"],[TEMP,"−20 °C em média"],["Visita","Apollo 11, em 1969"]],
  "A Lua se afasta da Terra uns 3,8 cm por ano, mais ou menos o quanto crescem as unhas. E ela sempre mostra o mesmo lado para nós."],
 ["Fobos","Lua de Marte",[[NOME,"“Medo”, em grego. Era filho de Ares, o deus da guerra (o Marte dos romanos)."],[ONDE,"Gira em volta de Marte, bem pertinho: a 9.375 km do centro do planeta."],[DT,MA],[TAM,"22 km (forma de batata)"],["Volta","7 h 39 min em Marte"],[DESC,"Asaph Hall, 1877"]],
  "Fobos chega perto de Marte uns 2 cm por ano. Em cerca de 50 milhões de anos vai cair em Marte ou virar um anel."],
 ["Deimos","Lua de Marte",[[NOME,"“Pavor”, em grego. É irmão de Fobos, também filho de Ares."],[ONDE,"Gira em volta de Marte, mais longe que Fobos: a 23.457 km do centro do planeta."],[DT,MA],[TAM,"12 km (forma de batata)"],["Volta","30 h em Marte"],[DESC,"Asaph Hall, 1877"]],
  "As duas luas de Marte têm forma de batata, porque a gravidade delas é fraca demais para deixá-las redondas. Podem ser asteroides capturados por Marte."],
 ["Io","Lua de Júpiter",[[NOME,"Galileu achou Io em 1610, junto com Europa, Ganimedes e Calisto: foram as primeiras luas vistas girando em volta de um planeta que não a Terra."],[ONDE,"Lua de Júpiter, a mais próxima das 4 grandes: a 422 mil km do planeta."],[DT,J],[TAM,"3.643 km (um pouco maior que a Lua)"],[TEMP,"−155 °C"],["Volta","1,8 dia em Júpiter"]],
  "Io é o corpo com mais vulcões ativos do Sistema Solar: são centenas, e algumas erupções lançam lava a dezenas de quilômetros de altura. As cores vêm do enxofre."],
 ["Europa","Lua de Júpiter",[[NOME,"Europa foi uma mulher da mitologia grega raptada por Zeus (o Júpiter dos romanos)."],[ONDE,"Lua de Júpiter, a 671 mil km do planeta."],[DT,J],[TAM,"3.122 km (um pouco menor que a Lua)"],[TEMP,"−170 °C"],[DESC,"Galileu Galilei, 1610"]],
  "Sob a crosta de gelo há um oceano de água salgada, com cerca do dobro da água de todos os oceanos da Terra juntos. A sonda Europa Clipper, da NASA, vai estudá-la."],
 ["Ganimedes","Lua de Júpiter",[[NOME,"Ganimedes foi um príncipe de Troia, escolhido pelos deuses para ser o copeiro deles."],[ONDE,"Lua de Júpiter, a 1,07 milhão de km do planeta."],[DT,J],[TAM,"5.262 km: a maior lua"],[TEMP,"−160 °C"],[DESC,"Galileu Galilei, 1610"]],
  "Ganimedes é maior que o planeta Mercúrio (4.879 km), mas tem menos massa. É a única lua conhecida com campo magnético próprio."],
 ["Calisto","Lua de Júpiter",[[NOME,"Galileu achou Calisto em 1610, junto com Io, Europa e Ganimedes: foram as primeiras luas vistas girando em volta de um planeta que não a Terra."],[ONDE,"Lua de Júpiter, a mais distante das 4 grandes: a 1,88 milhão de km do planeta."],[DT,J],[TAM,"4.821 km (quase como Mercúrio)"],[TEMP,"−155 °C"],["Volta","16,7 dias em Júpiter"]],
  "Calisto tem uma das superfícies mais antigas e cheias de crateras do Sistema Solar: o gelo e a rocha vêm de mais de 4 bilhões de anos atrás."],
 ["Titã","Lua de Saturno",[[NOME,"Os titãs eram gigantes da mitologia grega. O nome foi sugerido por John Herschel."],[ONDE,"Lua de Saturno, a maior delas: a 1,2 milhão de km do planeta."],[DT,SA],[TAM,"5.150 km (maior que Mercúrio)"],[TEMP,"−180 °C"],[DESC,"Christiaan Huygens, 1655"]],
  "É a única lua com atmosfera espessa, e tem rios, lagos e mares de metano líquido. A sonda Huygens pousou em Titã em 2005."],
 // Folha 3: luas, asteroides e cometas
 ["Encélado","Lua de Saturno",[[NOME,"Encélado foi um gigante da mitologia grega."],[ONDE,"Lua de Saturno, a uns 238 mil km do planeta."],[DT,SA],[TAM,"504 km (1/7 da Lua)"],[TEMP,"Cerca de −200 °C"],[DESC,"William Herschel, 1789"]],
  "Jatos de vapor d’água saem do polo sul. A sonda Cassini voou por eles e achou um oceano salgado escondido sob o gelo, um dos lugares mais promissores para buscar vida."],
 ["Mimas","Lua de Saturno",[[NOME,"Mimas foi um gigante da mitologia grega. O nome foi dado por John Herschel, filho do descobridor."],[ONDE,"Lua de Saturno, a uns 186 mil km do planeta."],[DT,SA],[TAM,"Cerca de 395 km"],["Cratera","Herschel: 130 km"],[DESC,"William Herschel, 1789"]],
  "A cratera Herschel é tão grande, cerca de 1/3 da largura da lua, que Mimas lembra a Estrela da Morte, de Star Wars."],
 ["Jápeto","Lua de Saturno",[[NOME,"John Herschel sugeriu dar às luas de Saturno os nomes dos irmãos e irmãs de Cronos (o Saturno dos gregos). Jápeto era um titã."],[ONDE,"Lua de Saturno, a uns 3,6 milhões de km do planeta."],[DT,SA],[TAM,"1.469 km"],["Cores","Um lado escuro, outro claro"],[DESC,"Giovanni Cassini, 1671"]],
  "Um lado é escuro como carvão (reflete 5% da luz) e o outro é claro como gelo (50%). Uma cadeia de montanhas de 10 km de altura dá a volta no equador."],
 ["Tritão","Lua de Netuno",[[NOME,"Tritão era filho de Posídon, o Netuno dos gregos."],[ONDE,"Lua de Netuno, a maior delas: a uns 355 mil km do planeta."],[DT,"Fica na região de Netuno: de uns 4,3 a 4,7 bilhões de km da Terra."],[TAM,"2.705 km"],[TEMP,"−215 °C"],[DESC,"William Lassell, 1846"]],
  "É a única lua grande que gira ao contrário da rotação do planeta. Provavelmente nasceu no Cinturão de Kuiper e foi capturada por Netuno. Foi achada 17 dias depois do planeta."],
 ["Caronte","Lua de Plutão",[[NOME,"Caronte era o barqueiro que levava as almas para o mundo dos mortos."],[ONDE,"Lua de Plutão, a maior delas: a uns 19.600 km do planeta."],[DT,"Fica na região de Plutão: de uns 4,3 a 7,5 bilhões de km da Terra."],[TAM,"1.212 km (metade de Plutão)"],["Mancha","Polo norte avermelhado"],[DESC,"James Christy, 1978"]],
  "Plutão e Caronte formam quase um planeta duplo: Caronte mostra sempre o mesmo lado para Plutão e fica parado no céu dele."],
 ["Miranda","Lua de Urano",[[NOME,"É uma personagem da peça “A Tempestade”, de Shakespeare."],[ONDE,"Lua de Urano, a menor das 5 grandes: a uns 130 mil km do planeta."],[DT,"Fica na região de Urano: de uns 2,6 a 3,2 bilhões de km da Terra."],[TAM,"472 km"],["Visita","Só a Voyager 2, em 1986"],[DESC,"Gerard Kuiper, 1948"]],
  "Miranda parece um monstro de Frankenstein: um quebra-cabeça de terrenos diferentes. Os cânions dela são até 12 vezes mais fundos que o Grand Canyon."],
 ["Vesta","Asteroide",[[NOME,"Deusa romana da lareira e do lar. O nome foi escolhido pelo matemático Carl Friedrich Gauss."],[ONDE,"No cinturão de asteroides, entre Marte e Júpiter."],[DT,"De uns 170 a 540 milhões de km."],[TAM,"Cerca de 520 km"],["Dia","Dura só 5 h 20 min"],[DESC,"Heinrich Olbers, 1807"]],
  "Uma colisão gigante, há menos de 1 bilhão de anos, abriu a cratera do polo sul, com 500 km, quase a largura do asteroide. A sonda Dawn orbitou Vesta de 2011 a 2012."],
 ["Eros","Asteroide",[[NOME,"Eros era o deus grego do amor."],[ONDE,"Perto da Terra: a órbita dele cruza a de Marte."],[DT,"Em 31 de janeiro de 2012 chegou a 26,7 milhões de km da Terra."],[TAM,"34 × 11 km (forma de amendoim)"],["Dia","Dura 5,3 horas"],[DESC,"Gustav Witt, 1898"]],
  "Eros foi o primeiro asteroide orbitado por uma sonda e o primeiro onde uma sonda pousou: a NEAR Shoemaker, da NASA, em 2000 e 2001."],
 ["Bennu","Asteroide",[[NOME,"Bennu é uma ave sagrada do Egito antigo. O nome foi escolhido num concurso, por um menino de 9 anos."],[ONDE,"Perto da Terra: a órbita dele cruza a da Terra."],[DT,"A cada 6 anos chega a uns 300 mil km da Terra, mais perto que a Lua (384 mil km)."],[TAM,"Quase 500 m (forma de pião)"],["Cor","Escuro como carvão"],[DESC,"LINEAR, 1999"]],
  "A sonda OSIRIS-REx pegou um punhado de poeira e pedras de Bennu em 2020 e trouxe tudo para a Terra em 2023."],
 ["Cometa Halley","Cometa",[[NOME,"Homenagem a Edmond Halley, que em 1705 calculou que cometas vistos em anos diferentes eram o mesmo."],[ONDE,"Gira em volta do Sol numa órbita bem alongada, que vai além de Netuno."],[DT,"Só chega perto da Terra a cada 76 anos. Em 11 de abril de 1986 passou a 62 milhões de km."],[TAM,"Núcleo de 15 × 8 km"],["Volta","A cada 76 anos"],["Próxima visita","Em 2061"]],
  "A sonda Giotto, da ESA, chegou perto do núcleo em 1986 e viu que ele é escuro, quase preto, e não branco como uma bola de neve."],
 ["Cometa Hale-Bopp","Cometa",[[NOME,"Leva o nome de Alan Hale e Thomas Bopp, que o descobriram, cada um por conta própria, em 23 de julho de 1995."],[ONDE,"Gira em volta do Sol numa órbita enorme, bem além de Plutão."],[DT,"Chegou mais perto da Terra em março de 1997, a uns 197 milhões de km."],[TAM,"Núcleo de cerca de 60 km"],["Volta","A cada 2.500 anos"],["Visível","18 meses a olho nu"]],
  "Hale-Bopp tem duas caudas: uma de poeira, amarelada e curva, e outra de gás, azulada e reta."],
 ["Cometa 67P","Cometa",[[NOME,"Leva o nome de Klim Churyumov e Svetlana Gerasimenko, astrônomos que a descobriram em 1969."],[ONDE,"Gira em volta do Sol, indo da órbita da Terra até perto da de Júpiter."],[DS,"De 1,2 a 5,7 vezes a distância da Terra ao Sol."],[TAM,"3,4 km, em dois lóbulos"],["Volta","A cada 6,4 anos"],["Visitada","Rosetta e Philae, 2014"]],
  "Foi o primeiro cometa orbitado e pousado por sondas. A Rosetta (ESA) chegou em 2014 e deixou o módulo Philae na superfície. Ela tem forma de patinho de borracha."],
 // Folha 4: exoplanetas, objetos extremos, nebulosas e galáxias
 ["Hiperião","Lua de Saturno",[[NOME,"John Herschel sugeriu dar às luas de Saturno os nomes dos irmãos e irmãs de Cronos (o Saturno dos gregos). Hiperião era um titã."],[ONDE,"Lua de Saturno, a uns 1,5 milhão de km do planeta, numa órbita bem alongada."],[DT,SA],[TAM,"410 × 260 × 220 km"],["Forma","Batata cheia de buracos"],[DESC,"William Lassell, 1848"]],
  "A superfície de Hiperião parece uma esponja ou um ninho de vespas. Ele gira de um jeito caótico, caindo e rolando sem direção certa enquanto dá voltas em Saturno."],
 ["Ariel","Lua de Urano",[[NOME,"Ariel é uma personagem de “A Tempestade”, de Shakespeare, e de um poema de Alexander Pope. O nome foi dado por John Herschel."],[ONDE,"Lua de Urano, uma das cinco grandes. Dá uma volta em Urano a cada 2,5 dias."],[DT,"Fica na região de Urano: de uns 2,6 a 3,2 bilhões de km da Terra."],[TAM,"1.158 km (raio de 579 km)"],["Cor","Cinza claro: a mais brilhante das 5 grandes"],[DESC,"William Lassell, 1851"]],
  "Ariel tem a superfície mais jovem das luas de Urano: poucas crateras grandes e muitas pequenas, cortadas por vales entre falhas, os chamados grábens."],
 ["Nebulosa do Anel","Nebulosa planetária",[["Também conhecida como","M57, o 57º objeto do catálogo do astrônomo Charles Messier."],[ONDE,"Constelação da Lira, mais ou menos no meio entre duas estrelas da base da “lira”."],[DT,"Cerca de 2.000 anos-luz."],["O que é","Restos de uma estrela parecida com o Sol"],["Anel","Vermelho por fora, azul por dentro"],[DESC,"Antoine Darquier, 1779"]],
  "O Hubble mostrou que o formato é mais complicado do que um anel: o gás azul do centro é uma estrutura em forma de bola de futebol americano que fura a rosca vermelha. Os nós escuros do bordo interno parecem raios de bicicleta."],
 ["Galáxia do Sombreiro","Galáxia espiral",[["Também conhecida como","M104, o objeto nº 104 do catálogo de Messier. Parece um chapéu mexicano."],[ONDE,"Constelação de Virgem."],[DT,"Cerca de 28 milhões de anos-luz."],["Vista","De lado, quase de perfil"],["Aglomerados","Quase 2.000, 10× a Via Láctea"],[DESC,"Pierre Méchain, 1781"]],
  "O miolo branco e brilhante é cercado por faixas grossas de poeira, onde nascem estrelas. No centro mora um buraco negro enorme, e a galáxia tem massa de cerca de 800 bilhões de Sóis."],
 ["Sagitário A*","Buraco negro",[[NOME,"Fica na direção da constelação de Sagitário. “A*” é o nome da forte fonte de rádio que existe lá."],[ONDE,"No centro da Via Láctea, a nossa galáxia."],[DT,"Entre 26.000 e 27.000 anos-luz."],[TAM,"Cabe na órbita de Mercúrio"],["Massa","4,3 milhões de Sóis"],["Foto","Primeira imagem: 2022"]],
  "Nem a luz escapa de um buraco negro. O anel brilhante da foto é gás quente em volta dele. Provar que ele existe rendeu o Nobel de Física de 2020 a Reinhard Genzel e Andrea Ghez."],
 ["Nebulosa do Caranguejo","Nebulosa · restos de supernova",[["Também conhecida como","M1, o 1º objeto do catálogo do astrônomo Charles Messier, que a confundiu com o cometa Halley."],[ONDE,"Constelação de Touro."],[DT,"Cerca de 6.500 anos-luz."],[TAM,"Cerca de 10 anos-luz de largura"],["Origem","Supernova vista em 1054"],["Centro","Pulsar: 30 voltas por segundo"]],
  "No centro há um pulsar que gira 30 vezes por segundo. O Hubble mostrou faixas de luz saindo dele à metade da velocidade da luz. A explosão foi registrada por astrônomos chineses em 1054."],
 ["Nebulosa da Hélice","Nebulosa planetária",[["Também conhecida como","Caldwell 63, no catálogo Caldwell de objetos do céu."],[ONDE,"Constelação de Aquário."],[DT,"Cerca de 650 anos-luz: uma das nebulosas planetárias mais próximas da Terra."],[TAM,"Quase 3 anos-luz de largura"],["O que é","Gás de uma estrela parecida com o Sol"],[DESC,"Karl Harding, 1823"]],
  "Uma nebulosa planetária é o gás brilhante em volta de uma estrela parecida com o Sol que está morrendo. Nas fotos do Hubble aparecem nós de gás com forma de cometa."],
 ["Supernova 1987A","Explosão de estrela",[[NOME,"SN quer dizer supernova, 1987 é o ano e A mostra que foi a 1ª do ano."],[ONDE,"Na Grande Nuvem de Magalhães, uma galáxia vizinha vista no céu do sul."],[DT,"Cerca de 168.000 anos-luz."],[TAM,"Anel interno: ≈ 1,4 ano-luz"],["Vista em","23 de fevereiro de 1987"],["Tipo","Supernova"]],
  "Foi a supernova mais brilhante vista da Terra desde 1604. Os anéis são gás que a estrela soltou milhares de anos antes de explodir, iluminado pela explosão."],
 ["Quasar 3C 273","Quasar",[[NOME,"3C vem do Terceiro Catálogo de Cambridge, de fontes de rádio. 273 é o número na lista."],[ONDE,"Constelação de Virgem."],[DT,"Cerca de 2,5 bilhões de anos-luz."],[TAM,"Jato de mais de 200 mil anos-luz"],["Tipo","Centro de galáxia"],[DESC,"1963, Maarten Schmidt"]],
  "Um quasar é o centro de uma galáxia distante, onde um buraco negro gigante engole gás e brilha mais que a galáxia inteira. O 3C 273 foi o primeiro quasar identificado, em 1963."],
 ["Nebulosa de Órion","Nebulosa",[[NOME,"Fica na constelação de Órion. “M42” é o número 42 do catálogo do astrônomo Charles Messier."],[ONDE,"Na “espada” do caçador Órion. Dá para ver a olho nu como uma manchinha."],[DT,"Cerca de 1.500 anos-luz."],[TAM,"Dezenas de anos-luz de largura"],["Berçário","Estrelas nascendo agora"],["Catálogo","M42, de Messier"]],
  "É a região de nascimento de estrelas grande mais próxima da Terra. No centro há quatro estrelas jovens e quentes, o Trapézio, que fazem o gás brilhar."],
 ["Pilares da Criação","Nebulosa",[[NOME,"Têm esse nome porque dentro das colunas de gás e poeira estão nascendo estrelas."],[ONDE,"Na Nebulosa da Águia (M16), na constelação da Serpente."],[DT,"Entre 6.500 e 7.000 anos-luz."],[TAM,"Colunas de 4 a 5 anos-luz de altura"],["Material","Gás e poeira"],["Fotos","Hubble (1995) e Webb (2022)"]],
  "A luz que vemos dos pilares saiu de lá há mais de 6.000 anos. A foto do Hubble, de 1995, ficou famosa no mundo todo."],
 ["Plêiades","Aglomerado de estrelas",[["Também conhecidas como","As Sete Irmãs, ou M45, o 45º objeto do catálogo de Messier."],[ONDE,"Constelação de Touro. Dá para ver a olho nu."],[DT,"Cerca de 445 anos-luz."],["Estrelas","Mais de mil, unidas pela gravidade"],["Cor","Azul-esbranquiçada"],[DESC,"1º a observar com telescópio: Galileu"]],
  "Ninguém sabe quem descobriu as Plêiades, porque elas são vistas desde a Antiguidade. As faixas azuis do Hubble são poeira empurrada pela luz da estrela Merope."],
 ["Andrômeda","Galáxia",[["Também conhecida como","M31, o objeto nº 31 do catálogo do astrônomo Charles Messier."],[ONDE,"Na constelação de Andrômeda. É a grande galáxia mais próxima da Via Láctea."],[DT,"Cerca de 2,5 milhões de anos-luz."],[TAM,"Mais de 200.000 anos-luz"],["Estrelas","≈ 1 trilhão"],["Visível","A olho nu, no céu escuro"]],
  "É o objeto mais distante que dá para ver a olho nu: a luz que chega tem 2,5 milhões de anos. Ela e a Via Láctea estão se aproximando."],
 ["Galáxia do Redemoinho","Galáxia",[[NOME,"Os braços em espiral lembram um redemoinho (“whirlpool”, em inglês). M51 é o número 51 do catálogo de Messier."],[ONDE,"Constelação dos Cães de Caça."],[DT,"Cerca de 31 milhões de anos-luz."],["Companheira","Galáxia menor NGC 5195"],["Tipo","Espiral vista de frente"],[DESC,"Messier, 1773"]],
  "A galáxia menor, NGC 5195, passa ao lado há centenas de milhões de anos, e a gravidade dela ajuda a criar estrelas nos braços. Em 1845, Lord Rosse desenhou o formato de redemoinho dela, que ninguém tinha visto antes."]
];

/* Verso: lista de fatos [ícone, título, texto] e a curiosidade, que o stickers.js desenha na parte de trás do cartão. */
function verso(i){
  var d=D[i];
  return{facts:d[2].map(function(f){return [IC[f[0]]||"🔹",f[0],f[1]]}),fun:d[3]};
}
/* Raridade (índice = número do catálogo - 1). Precisa bater com a tabela sticker_rarity no banco.
   Ultrarraras: Saturno, Terra, Sagitário A*. Raras: Sol, Marte, Júpiter, Lua, Pilares da Criação. */
var RARIDADE={10:"ultra",7:"ultra",42:"ultra",0:"rara",8:"rara",9:"rara",18:"rara",48:"rara"};
function pad(n){return (n<10?"0":"")+n}
FC.THEMES.push({id:"espaco",name:"Corpos do espaço",desc:"52 corpos do espaço de verdade: estrelas, planetas, luas, cometas, buracos negros e galáxias. Os 8 mais marcantes são raros.",kind:"espaco",
  rarity:RARIDADE,
  cover:10,backOf:verso,
  nameOf:function(i){return D[i][0]},subOf:function(i){return D[i][1]},
  art:function(i){return '<img src="stickers/espaco/'+pad(i+1)+'.webp" alt="'+FC.esc(D[i][0])+'" loading="lazy">'}});
FC.ESPACO=D;
})();
