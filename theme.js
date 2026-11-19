/* Alternância entre modo claro e escuro. A escolha fica em localStorage ("fv-tema"); sem escolha, vale o tema do aparelho. */
(function(){
  var root=document.documentElement,btn=document.getElementById("theme-btn"),txt=document.getElementById("theme-txt");
  function aplica(t){
    root.dataset.theme=t;
    if(txt)txt.textContent=t==="dark"?"Modo claro":"Modo escuro";
    var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="dark"?"#0A1123":"#2457D6");
  }
  aplica(root.dataset.theme==="dark"?"dark":"light");
  if(btn)btn.addEventListener("click",function(){
    var t=root.dataset.theme==="dark"?"light":"dark";aplica(t);
    try{localStorage.setItem("fv-tema",t)}catch(e){}
  });
})();
