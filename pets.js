/* Tema Gatinhos e cachorrinhos: 26 gatos e 26 cachorros, de raças conhecidas e de vira-latas.
   As figurinhas são imagens (stickers/pets/NN.webp, NN = número do catálogo). */
(function(){
"use strict";
var FC=window.FC;
/* [nome, espécie, grupo]. Os gatos vêm primeiro (nº 1 a 26) e os cachorros depois (nº 27 a 52). */
var D=[
 ["Siamês","gato","pelo curto"],
 ["Persa","gato","pelo longo"],
 ["Maine Coon","gato","pelo longo"],
 ["Bengal","gato","pelo curto"],
 ["Ragdoll","gato","pelo longo"],
 ["Sphynx","gato","sem pelo"],
 ["Angorá turco","gato","pelo longo"],
 ["British Shorthair","gato","pelo curto"],
 ["Abissínio","gato","pelo curto"],
 ["Scottish Fold","gato","pelo curto"],
 ["Siberiano","gato","pelo longo"],
 ["Birmanês","gato","pelo longo"],
 ["Azul Russo","gato","pelo curto"],
 ["Norueguês da Floresta","gato","pelo longo"],
 ["Munchkin","gato","pelo curto"],
 ["Bombaim","gato","pelo curto"],
 ["American Shorthair","gato","pelo curto"],
 ["Devon Rex","gato","pelo curto"],
 ["Himalaio","gato","pelo longo"],
 ["Chartreux","gato","pelo curto"],
 ["Somali","gato","pelo longo"],
 ["Ocicat","gato","pelo curto"],
 ["Manx","gato","pelo curto"],
 ["Gato preto","gato","pelo curto"],
 ["Gato laranja","gato","pelo curto"],
 ["Gato tricolor","gato","pelo curto"],
 ["Shih Tzu","cachorro","porte pequeno"],
 ["Yorkshire","cachorro","porte pequeno"],
 ["Chihuahua","cachorro","porte pequeno"],
 ["Pug","cachorro","porte pequeno"],
 ["Salsicha","cachorro","porte pequeno"],
 ["Lulu da Pomerânia","cachorro","porte pequeno"],
 ["Maltês","cachorro","porte pequeno"],
 ["Buldogue francês","cachorro","porte pequeno"],
 ["Beagle","cachorro","porte médio"],
 ["Corgi","cachorro","porte médio"],
 ["Border Collie","cachorro","porte médio"],
 ["Cocker Spaniel","cachorro","porte médio"],
 ["Shiba Inu","cachorro","porte médio"],
 ["Buldogue inglês","cachorro","porte médio"],
 ["Poodle","cachorro","porte médio"],
 ["Dálmata","cachorro","porte médio"],
 ["Basset Hound","cachorro","porte médio"],
 ["Vira-lata caramelo","cachorro","porte médio"],
 ["Golden Retriever","cachorro","porte grande"],
 ["Labrador","cachorro","porte grande"],
 ["Pastor-alemão","cachorro","porte grande"],
 ["Husky siberiano","cachorro","porte grande"],
 ["Boxer","cachorro","porte grande"],
 ["São Bernardo","cachorro","porte grande"],
 ["Samoieda","cachorro","porte grande"],
 ["Fila brasileiro","cachorro","porte grande"]
];

/* Verso da figurinha. Mesma ordem do catálogo: [origem, peso, quanto vive, pelo, jeito, curiosidade].
   Pesos e idades são médias aproximadas: variam de um bichinho para outro. */
var F=[
 ["Tailândia (antigo Sião)","3 a 5 kg","12 a 20 anos","curto e liso, claro com as pontas escuras","falante e muito apegado à família","Os filhotes nascem quase brancos. As pontas escuras aparecem com o tempo, porque o pelo escurece nas partes mais frias do corpo."],
 ["Pérsia (atual Irã)","3 a 6 kg","12 a 17 anos","longo e macio, pede escovação todo dia","calmo e carinhoso","O focinho achatado e o pelo fofo fazem dele um dos gatos mais famosos dos concursos de beleza."],
 ["Estados Unidos (estado do Maine)","4 a 8 kg","12 a 15 anos","longo e denso, aguenta bem o frio","gentil e brincalhão","É um dos maiores gatos domésticos: alguns chegam a cerca de 1 metro do nariz à ponta da cauda."],
 ["Estados Unidos","4 a 7 kg","12 a 16 anos","curto e brilhante, com manchas de leopardo","ativo e curioso","Nasceu do cruzamento de um gato doméstico com o gato-leopardo-asiático, e muitos Bengals gostam de água."],
 ["Estados Unidos (Califórnia)","4,5 a 9 kg","12 a 17 anos","meio longo e sedoso","dócil e tranquilo","O nome quer dizer \"boneca de pano\": ele fica molinho no colo, de tão relaxado."],
 ["Canadá","3 a 5 kg","8 a 14 anos","quase sem pelo, a pele fica quentinha","muito carinhoso, vive grudado na gente","Parece pelado, mas tem uma penugem fininha. Precisa de banho e de cuidado com o frio e com o sol."],
 ["Turquia","3 a 5 kg","12 a 18 anos","longo e sedoso, quase sempre branco","elegante e esperto","Ancara, a capital da Turquia, antigamente se chamava Angora. É daí que vem o nome."],
 ["Reino Unido","4 a 8 kg","12 a 17 anos","curto, denso e macio","calmo e tranquilo","O corpo robusto e as bochechas redondas dão a ele cara de ursinho de pelúcia."],
 ["Inglaterra (raça formada no século 19)","3 a 5 kg","12 a 15 anos","curto, cada pelo tem várias faixas de cor","ativo e bom de escalada","Cada pelo tem faixas de cores diferentes, o que dá um brilho dourado ao corpo todo."],
 ["Escócia","3 a 6 kg","11 a 14 anos","curto e macio","doce e calmo","As orelhinhas dobradas vêm de uma mutação genética rara. Todos os filhotes nascem com a orelha reta."],
 ["Rússia","4 a 9 kg","11 a 15 anos","longo e grosso, em três camadas","brincalhão e corajoso","O pelo grosso foi feito para aguentar o inverno russo."],
 ["Mianmar (antiga Birmânia)","3 a 6 kg","12 a 16 anos","longo e sedoso, pontas escuras","calmo e sociável","As quatro patinhas parecem ter luvinhas brancas."],
 ["Rússia","3 a 5 kg","15 a 20 anos","curto, denso, cinza-azulado e brilhante","tímido e muito leal","O pelo cinza-prateado e os olhos verdes fazem dele um dos gatos mais elegantes."],
 ["Noruega","4 a 9 kg","14 a 16 anos","longo e à prova d'água","forte e ótimo escalador","Na mitologia nórdica, dizem que gatos assim puxavam a carruagem da deusa Freya."],
 ["Estados Unidos","2 a 4 kg","12 a 15 anos","curto ou longo, de várias cores","brincalhão e rápido","As patinhas são bem curtinhas, mas ele corre e pula direitinho."],
 ["Estados Unidos","3 a 5 kg","12 a 16 anos","curto e preto brilhante","carinhoso, adora colo","Foi criado para parecer uma pantera-negra em miniatura."],
 ["Estados Unidos","4 a 7 kg","15 a 20 anos","curto e grosso","calmo e adaptável","Seus ancestrais viajaram nos navios dos primeiros colonos europeus para caçar ratos."],
 ["Inglaterra (Devon)","2 a 4 kg","9 a 15 anos","curto, ondulado e bem macio","brincalhão e agitado","As orelhas enormes e os olhos grandes dão a ele cara de duende."],
 ["Estados Unidos e Reino Unido","3 a 6 kg","9 a 15 anos","longo, com pontas escuras","calmo e meigo","É um cruzamento de Persa com Siamês: tem o pelo longo do Persa e as pontas escuras do Siamês."],
 ["França","3 a 7 kg","12 a 15 anos","curto e lanoso, cinza-azulado","quietinho e esperto","É conhecido por miar muito pouco e pelo \"sorriso\" no focinho."],
 ["Estados Unidos","3 a 5 kg","11 a 16 anos","meio longo, cor de ferrugem","ativo e brincalhão","É um Abissínio de pelo comprido, e a cauda cheia parece a de uma raposa."],
 ["Estados Unidos","3 a 6 kg","12 a 18 anos","curto, com manchas redondas","sociável e esperto","Parece um gato selvagem, a jaguatirica (ocelot, em inglês), mas não tem nada de selvagem."],
 ["Ilha de Man (Reino Unido)","3 a 6 kg","9 a 13 anos","curto e grosso","leal e brincalhão","Muitos Manx nascem sem rabinho ou com ele bem curtinho. A raça vem de uma ilha chamada Man."],
 ["do mundo todo (sem raça definida)","3 a 5 kg","12 a 18 anos","curto e preto","carinhoso e esperto","Em alguns países o gato preto dá sorte, e em outros dá azar. Mas ele é só um gato como os outros."],
 ["do mundo todo (sem raça definida)","3 a 6 kg","12 a 18 anos","curto, laranja com listras","carinhoso e comilão","Cerca de 80% dos gatos laranja são machos."],
 ["do mundo todo (sem raça definida)","3 a 5 kg","12 a 18 anos","curto, com manchas brancas, laranja e pretas","esperto e independente","Quase todos os gatos tricolores são fêmeas, por causa da genética das cores."],
 ["China (com origem no Tibete)","4 a 7 kg","10 a 16 anos","longo e sedoso","amigo e sossegado","O nome quer dizer \"cão-leão\" em chinês."],
 ["Inglaterra (Yorkshire)","2 a 3 kg","12 a 15 anos","longo e liso, azul-acinzentado e castanho","corajoso e agitado","Foi criado para caçar ratos nas fábricas, e hoje é um dos cachorrinhos de colo mais queridos."],
 ["México","1 a 3 kg","12 a 20 anos","curto ou longo, de várias cores","alerta e destemido","É o menor cachorro do mundo e tem o nome de um estado mexicano."],
 ["China","6 a 9 kg","12 a 15 anos","curto e macio","brincalhão e palhaço","Na China antiga, os Pugs eram companheiros dos imperadores."],
 ["Alemanha","4 a 12 kg","12 a 16 anos","curto, longo ou duro","corajoso e curioso","Foi criado para entrar em tocas de texugo. Em alemão, \"dachs\" é texugo e \"hund\" é cachorro."],
 ["Alemanha e Polônia (Pomerânia)","1,5 a 3,5 kg","12 a 16 anos","longo e fofo, como uma bolinha de pelo","esperto e animado","Seus ancestrais eram bem maiores. Ao longo dos séculos ele foi ficando pequeno."],
 ["região do Mediterrâneo (ilha de Malta)","3 a 4 kg","12 a 15 anos","longo, liso e branco","carinhoso e alegre","O pelo branco e sedoso cresce até o chão se ninguém aparar."],
 ["França e Inglaterra","8 a 14 kg","10 a 12 anos","curto e macio","brincalhão e companheiro","As orelhas de morcego são a marca registrada. Por causa do focinho achatado, ele sente calor com facilidade."],
 ["Inglaterra","9 a 11 kg","12 a 15 anos","curto","curioso e farejador","Tem um dos melhores narizes do mundo, e muitos trabalham farejando nos aeroportos."],
 ["País de Gales","10 a 14 kg","12 a 14 anos","médio e denso","alegre e esperto","Era o cachorro preferido da rainha Elizabeth II, que teve mais de 30 Corgis na vida."],
 ["fronteira entre Inglaterra e Escócia","14 a 20 kg","12 a 15 anos","médio, preto e branco","muito inteligente e cheio de energia","É um dos cachorros mais inteligentes do mundo e guia ovelhas só com o olhar."],
 ["Inglaterra","12 a 15 kg","12 a 15 anos","longo e sedoso","doce e alegre","\"Cocker\" vem de woodcock, uma ave que ele ajudava a caçar."],
 ["Japão","8 a 11 kg","12 a 15 anos","médio e grosso","independente e cheio de personalidade","É uma das raças mais antigas do Japão. \"Inu\" quer dizer cachorro."],
 ["Inglaterra","18 a 25 kg","8 a 10 anos","curto e macio","calmo e teimoso","O corpo forte e a cara amassada dão uma aparência brava, mas ele é bem dócil."],
 ["Alemanha (e famoso na França)","de 3 a 30 kg, conforme o tamanho","12 a 15 anos","cacheado, quase não solta pelo","esperto e animado","Foi criado para buscar patos na água. O nome vem do alemão \"pudeln\", que quer dizer \"chapinhar\"."],
 ["Croácia (Dalmácia)","20 a 32 kg","11 a 13 anos","curto, branco com pintas pretas","enérgico e brincalhão","Os filhotes nascem todos brancos. As pintinhas pretas aparecem com o tempo."],
 ["França","20 a 30 kg","10 a 12 anos","curto","calmo e paciente","As orelhas são tão compridas que ele pode pisar nelas. O faro dele é excelente."],
 ["Brasil (sem raça definida)","de 8 a 20 kg","12 a 15 anos","curto, cor de caramelo","esperto, alegre e muito leal","Não tem raça definida, mas virou um símbolo do carinho dos brasileiros pelos cachorros."],
 ["Escócia","25 a 34 kg","10 a 12 anos","longo e dourado","dócil e amigável","Foi criado para buscar aves caídas na água. Muitos viram cães-guia e cães de resgate."],
 ["Canadá (Terra Nova)","25 a 36 kg","10 a 12 anos","curto e denso","amigável e cheio de energia","Adora nadar: a cauda forte serve de leme e as patas têm uma pele entre os dedos."],
 ["Alemanha","22 a 40 kg","9 a 13 anos","médio, preto e marrom","leal e corajoso","Trabalha como cão policial, de resgate e de guia."],
 ["Sibéria (Rússia)","16 a 27 kg","12 a 14 anos","grosso, em duas camadas","enérgico e adora uivar","Puxava trenós no gelo, e muitos têm um olho de cada cor."],
 ["Alemanha","25 a 32 kg","10 a 12 anos","curto e liso","brincalhão e cheio de energia","Ele gosta de levantar as patas da frente ao brincar, como se estivesse lutando boxe."],
 ["Suíça e Itália (Alpes)","55 a 90 kg","8 a 10 anos","curto ou longo, vermelho e branco","calmo e gentil","Salvou muitos viajantes perdidos na neve dos Alpes. Mas o barrilzinho no pescoço é só lenda."],
 ["Sibéria (Rússia)","16 a 30 kg","12 a 14 anos","grosso, fofo e branco","amigável e sorridente","Tem o \"sorriso de samoieda\": o cantinho da boca vira para cima."],
 ["Brasil","40 a 50 kg","9 a 11 anos","curto e liso","guardião, fiel à família","É uma das poucas raças criadas no Brasil."]
];
/* Verso: lista de fatos [ícone, título, texto] e a curiosidade, que o stickers.js desenha na parte de trás do cartão. */
function verso(i){
  var f=F[i];
  return{facts:[
    ["🌍","Origem",f[0]],
    ["⚖️","Peso",f[1]],
    ["⏳","Vive",f[2]],
    ["🧶","Pelo",f[3]],
    ["💬","Jeito",f[4]]
  ],fun:f[5]};
}
/* Raridade (índice = número do catálogo - 1). Precisa bater com a tabela sticker_rarity no banco.
   Ultrarraras: Siamês, Golden Retriever, Vira-lata caramelo. Raras: Persa, Maine Coon, Corgi, Labrador, Husky siberiano. */
var RARIDADE={0:"ultra",1:"rara",2:"rara",35:"rara",43:"ultra",44:"ultra",45:"rara",47:"rara"};
function pad(n){return (n<10?"0":"")+n}
FC.THEMES.push({id:"pets",name:"Gatinhos e cachorrinhos",desc:"26 gatos e 26 cachorros, de raças famosas e de vira-latas, com curiosidades no verso. Os 8 mais queridos são raros.",kind:"pet",
  rarity:RARIDADE,
  cover:44,backOf:verso,
  nameOf:function(i){return D[i][0]},subOf:function(i){return (D[i][1]==="gato"?"Gato":"Cachorro")+" · "+D[i][2]},
  art:function(i){return '<img src="stickers/pets/'+pad(i+1)+'.webp" alt="'+FC.esc(D[i][0])+'" loading="lazy">'}});
FC.PETS=D;
})();
