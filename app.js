const SIZE=12;
const themes=[
 {name:"ANIMAIS",words:["GATO","CACHORRO","PORCO","RATO","COELHO","TIGRE","LEAO","URSO"]},
 {name:"ESPAÇO",words:["PLANETA","ESTRELA","LUA","FOGUETE","MARTE","COMETA","GALAXIA","ASTRO"]},
 {name:"TECNOLOGIA",words:["CELULAR","COMPUTADOR","INTERNET","JOGO","CODIGO","ROBO","TELA","MOUSE"]}
];
let level=Number(localStorage.forgeWordsLevel||1);
let coins=Number(localStorage.forgeWordsCoins||100);
let score=0,time=120,theme,grid=[],placements=[],found=new Set(),startCell=null,dragging=false,timer;

const $=s=>document.querySelector(s);
const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function save(){localStorage.forgeWordsLevel=level;localStorage.forgeWordsCoins=coins}
function updateHUD(){$("#level").textContent=level;$("#score").textContent=score;$("#coins").textContent=coins;$("#time").textContent=time}
function say(t){$("#message").textContent=t;clearTimeout(say.t);say.t=setTimeout(()=>$("#message").textContent="Continue procurando 👀",2600)}

function emptyGrid(){return Array.from({length:SIZE},()=>Array(SIZE).fill(""))}
function canPlace(g,w,r,c,dr,dc){
 for(let i=0;i<w.length;i++){let rr=r+dr*i,cc=c+dc*i;if(rr<0||rr>=SIZE||cc<0||cc>=SIZE)return false;if(g[rr][cc]&&g[rr][cc]!==w[i])return false}
 return true;
}
function put(g,w,r,c,dr,dc){for(let i=0;i<w.length;i++)g[r+dr*i][c+dc*i]=w[i]}
function makeGame(){
 clearInterval(timer);grid=emptyGrid();placements=[];found=new Set();startCell=null;dragging=false;
 theme=themes[(level-1)%themes.length];
 let dirs=[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
 for(const word of theme.words){
   let placed=false;
   for(let tries=0;tries<300&&!placed;tries++){
     const d=dirs[Math.floor(Math.random()*dirs.length)],r=Math.floor(Math.random()*SIZE),c=Math.floor(Math.random()*SIZE);
     if(canPlace(grid,word,r,c,d[0],d[1])){put(grid,word,r,c,d[0],d[1]);placements.push({word,r,c,dr:d[0],dc:d[1]});placed=true}
   }
 }
 for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(!grid[r][c])grid[r][c]=alphabet[Math.floor(Math.random()*26)];
 render();time=120;updateHUD();
 timer=setInterval(()=>{time--;updateHUD();if(time<=0){clearInterval(timer);say("⏰ O tempo acabou! Tente novamente.");disableGrid()}},1000);
}
function render(){
 $("#theme").textContent=theme.name;const g=$("#grid");g.innerHTML="";
 for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++){
   const el=document.createElement("div");el.className="cell";el.textContent=grid[r][c];el.dataset.r=r;el.dataset.c=c;
   el.addEventListener("pointerdown",e=>{e.preventDefault();startCell={r,c};dragging=true;clearSelection();el.classList.add("selected")});
   el.addEventListener("pointerenter",()=>{if(dragging)preview(r,c)});
   g.appendChild(el);
 }
 document.addEventListener("pointerup",finishSelection,{once:false});
 $("#wordList").innerHTML=theme.words.map(w=>`<span class="word" id="w-${w}">${w}</span>`).join("");
}
function clearSelection(){document.querySelectorAll(".cell.selected").forEach(e=>e.classList.remove("selected"))}
function cellsBetween(a,b){
 let dr=Math.sign(b.r-a.r),dc=Math.sign(b.c-a.c);
 if(a.r!==b.r&&a.c!==b.c&&Math.abs(b.r-a.r)!==Math.abs(b.c-a.c))return[];
 let n=Math.max(Math.abs(b.r-a.r),Math.abs(b.c-a.c))+1;
 return Array.from({length:n},(_,i)=>({r:a.r+dr*i,c:a.c+dc*i}));
}
function preview(r,c){clearSelection();for(const p of cellsBetween(startCell,{r,c})){const e=document.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`);if(e)e.classList.add("selected")}}
function finishSelection(e){
 if(!dragging)return;dragging=false;
 const target=e.target.closest(".cell");if(!target||!startCell)return;
 const end={r:+target.dataset.r,c:+target.dataset.c};const cells=cellsBetween(startCell,end);
 if(!cells.length){clearSelection();return}
 const selected=cells.map(p=>grid[p.r][p.c]).join("");
 const reversed=selected.split("").reverse().join("");
 const match=theme.words.find(w=>w===selected||w===reversed);
 if(match&&!found.has(match)){
   found.add(match);score+=100;coins+=5;cells.forEach(p=>document.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`)?.classList.add("found"));
   $(`#w-${match}`).classList.add("found");say(`🎉 Você encontrou ${match}! +100 pontos`);
   if(found.size===theme.words.length)win();
 }else if(match) say("Essa palavra já foi encontrada.");
 else say("Não é uma das palavras da lista.");
 clearSelection();startCell=null;updateHUD();save();
}
function win(){
 clearInterval(timer);score+=time*2;coins+=30;updateHUD();save();
 say("🏆 Fase concluída! +30 moedas");
 setTimeout(()=>{level++;save();makeGame()},1800);
}
function disableGrid(){document.querySelectorAll(".cell").forEach(c=>c.style.pointerEvents="none")}
$("#newGame").onclick=makeGame;
$("#hint").onclick=()=>{
 if(coins<10){say("Você precisa de 10 moedas.");return}
 const remaining=theme.words.filter(w=>!found.has(w));if(!remaining.length)return;
 const p=placements.find(x=>x.word===remaining[0]);coins-=10;
 const e=document.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`);e.classList.add("selected");
 setTimeout(()=>e.classList.remove("selected"),1000);say(`💡 A palavra ${remaining[0]} começa nesta casa.`);
 updateHUD();save();
};
makeGame();
