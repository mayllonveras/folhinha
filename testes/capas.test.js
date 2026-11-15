/* Capas e pacotes: todo álbum tem as duas imagens, leves o bastante para o celular. */
var fs=require("fs"),path=require("path"),assert=require("assert");
var root=path.join(__dirname,"..");
var src=fs.readFileSync(path.join(root,"index.html"),"utf8");
var scripts=src.match(/<script src="([^"]+)"/g).map(function(s){return s.slice(13,-1)});
// os temas são declarados nos arquivos dos álbuns; basta achar os ids
var ids=[];
["stickers.js","dinos.js","pets.js","bandeiras.js","ameacados.js","espaco.js"].forEach(function(f){
  var t=fs.readFileSync(path.join(root,f),"utf8"),m;var re=/THEMES(?:\.push\(|=\[)\s*\{id:"([a-z]+)"/g;
  while((m=re.exec(t)))ids.push(m[1]);
});
assert(ids.length===5,"esperava 5 álbuns, achei "+ids.length+": "+ids.join(","));
ids.forEach(function(id){
  ["capas","pacotes"].forEach(function(d){
    var p=path.join(root,"stickers",d,id+".webp");
    assert(fs.existsSync(p),"falta "+p);
    var kb=fs.statSync(p).size/1024;
    assert(kb>10&&kb<250,p+" com "+Math.round(kb)+" KB (esperado entre 10 e 250)");
  });
});
console.log("capas.test.js: ok ("+ids.length+" álbuns, capa e pacote)");
