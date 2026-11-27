/* Alternância entre modo claro e escuro. A escolha fica em localStorage ("fv-tema"); sem escolha, vale o tema do aparelho. */
(function(){
  var root=document.documentElement,btn=document.getElementById("theme-btn"),bar=btn&&btn.parentNode;
  function aplica(t){
    root.dataset.theme=t;
    if(btn)btn.setAttribute("aria-label",t==="dark"?"Mudar para o modo claro":"Mudar para o modo escuro");
    var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="dark"?"#0A1123":"#2457D6");
  }
  aplica(root.dataset.theme==="dark"?"dark":"light");
  if(btn)btn.addEventListener("click",function(){
    var t=root.dataset.theme==="dark"?"light":"dark";aplica(t);
    try{localStorage.setItem("fv-tema",t)}catch(e){}
  });
  /* O botão (só ícone) vive no cabeçalho de cada tela: ao lado do perfil/sair; sem cabeçalho, fica no canto superior direito. */
  function acomoda(){
    if(!btn)return;
    var ab=document.querySelector("#app .appbar");
    if(!ab){if(btn.parentNode!==bar)bar.appendChild(btn);return}
    var who=ab.querySelector(".who"),ref=ab.querySelector("#profileBtn")||ab.querySelector("#logout"),pai=ref?ref.parentNode:(who||ab);
    if(btn.parentNode===pai&&(ref?btn.nextSibling===ref:!btn.nextSibling))return;
    pai.insertBefore(btn,ref||null);
  }
  var app=document.getElementById("app");
  if(app&&window.MutationObserver)new MutationObserver(acomoda).observe(app,{childList:true,subtree:true});
  acomoda();
})();
