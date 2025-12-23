let usuario=JSON.parse(localStorage.getItem("usuario"))||{nome:"",treinos:[]}
let treinoAtual=null, exercicioAtual=null

const grupos=["ombro","peitoral","bíceps","tríceps","abdômen","oblíquos","antebraços","lombar","trapézio","dorsal","isquiotibiais","quadríceps","panturrilha","abdutores","adutores","cardio"]

function salvar(){localStorage.setItem("usuario",JSON.stringify(usuario))}
function salvarUsuario(){usuario.nome=nomeUsuario.value;salvar()}
function abrirNovoTreino(){modalTreino.style.display="flex"}

function salvarTreino(){
  const nome=nomeTreino.value
  const dias=[...modalTreino.querySelectorAll("input:checked")].map(i=>i.value)
  if(!nome||!dias.length)return
  usuario.treinos.push({nome,dias,exercicios:[],duracao:0})
  salvar();fecharModais();listarTreinos()
}

function listarTreinos(){
  listaTreinos.innerHTML=""
  usuario.treinos.forEach((t,i)=>{
    const d=document.createElement("div")
    d.innerHTML=`<b>${t.nome}</b><br>⏱ ${t.duracao} min`
    d.onclick=()=>abrirGrupo(i)
    d.ondblclick=()=>iniciarExecucaoTreino(i)
    listaTreinos.appendChild(d)
  })
}

function abrirGrupo(i){
  treinoAtual=i
  gruposDiv.innerHTML=""
  modalGrupo.style.display="flex"
  grupos.forEach(g=>{
    const b=document.createElement("button")
    b.textContent=g
    b.onclick=()=>buscarGif(g)
    gruposDiv.appendChild(b)
  })
}

async function buscarGif(grupo){
  fecharModais()
  const r=await fetch(`https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${grupo}+exercise&limit=1`)
  const d=await r.json()
  exercicioAtual={grupo,gif:d.data[0]?.images.fixed_height.url||"",series:[],descanso:60}
  gifSelecionado.src=exercicioAtual.gif
  series.innerHTML=""
  adicionarSerie()
  modalExercicio.style.display="flex"
}

function adicionarSerie(){
  if(exercicioAtual.series.length>=5)return
  exercicioAtual.series.push({reps:12,kg:20})
  renderSeries()
}

function renderSeries(){
  series.innerHTML=""
  exercicioAtual.series.forEach((s,i)=>{
    series.innerHTML+=`Série ${i+1}
    <input type="number" value="${s.reps}" onchange="exercicioAtual.series[${i}].reps=this.value">
    <input type="number" value="${s.kg}" onchange="exercicioAtual.series[${i}].kg=this.value">`
  })
}

function salvarExercicio(){
  exercicioAtual.descanso=+descanso.value||60
  const dur=(exercicioAtual.series.length*40+(exercicioAtual.series.length-1)*exercicioAtual.descanso)
  usuario.treinos[treinoAtual].duracao+=Math.ceil(dur/60)
  usuario.treinos[treinoAtual].exercicios.push(exercicioAtual)
  salvar();fecharModais();listarTreinos()
}

function fecharModais(){document.querySelectorAll(".modal").forEach(m=>m.style.display="none")}

/* ===== SONS ===== */
function som(freq,dur){
  try{
    const c=new AudioContext(),o=c.createOscillator(),g=c.createGain()
    o.frequency.value=freq;o.connect(g);g.connect(c.destination)
    o.start();g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dur/1000)
    o.stop(c.currentTime+dur/1000)
  }catch{}
}
function alertaSerie(){navigator.vibrate?.([150]);som(1000,150)}
function alertaDescanso(){navigator.vibrate?.([100,100,100]);som(700,200);setTimeout(()=>som(700,200),220)}
function alertaFinal(){navigator.vibrate?.([300,200,300,200,500]);som(400,500)}

/* ===== EXECUÇÃO ===== */
let exec={}

function iniciarExecucaoTreino(i){
  exec={t:i,e:0,s:0,tempo:40,rodando:true}
  carregarExecucao()
  modalExecucao.style.display="flex"
  iniciarTimer()
}

function carregarExecucao(){
  const t=usuario.treinos[exec.t],e=t.exercicios[exec.e]
  execGif.src=e.gif
  execTreinoNome.textContent=t.nome
  execGrupo.textContent=e.grupo
  execSerie.textContent=`Série ${exec.s+1}/${e.series.length}`
  atualizarProgresso()
}

function iniciarTimer(){
  exec.timer=setInterval(()=>{
    exec.tempo--
    cronometro.textContent=`00:${String(exec.tempo).padStart(2,"0")}`
    if(exec.tempo<=0){alertaSerie();avancar()}
  },1000)
}

function pausarOuContinuar(){
  if(exec.rodando){clearInterval(exec.timer);exec.rodando=false}
  else{exec.rodando=true;iniciarTimer()}
}

function avancar(){
  clearInterval(exec.timer)
  alertaDescanso()
  exec.tempo=40
  const t=usuario.treinos[exec.t],e=t.exercicios[exec.e]
  if(exec.s<e.series.length-1)exec.s++
  else if(exec.e<t.exercicios.length-1){exec.e++;exec.s=0}
  else return finalizarTreino()
  carregarExecucao();iniciarTimer()
}

function pularSerie(){avancar()}

function atualizarProgresso(){
  const t=usuario.treinos[exec.t]
  let total=0,atual=0
  t.exercicios.forEach((e,i)=>{total+=e.series.length;if(i<exec.e)atual+=e.series.length})
  atual+=exec.s+1
  barraProgresso.style.width=Math.min((atual/total)*100,100)+"%"
}

function finalizarTreino(){
  clearInterval(exec.timer)
  alertaFinal()
  modalExecucao.style.display="none"
  alert("Treino finalizado 💪🔥")
}

listarTreinos()
