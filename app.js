let usuario=JSON.parse(localStorage.getItem("usuario"))||{nome:"",treinos:[]}
let treinoAtual=null
let exercicioAtual=null

const grupos=["ombro","peitoral","bíceps","tríceps","abdômen","oblíquos","antebraços","lombar","trapézio","dorsal","isquiotibiais","quadríceps","panturrilha","abdutores","adutores","cardio"]

function salvarUsuario(){
  usuario.nome=nomeUsuario.value
  salvar()
}

function abrirNovoTreino(){
  modalTreino.style.display="flex"
}

function salvarTreino(){
  const nome=nomeTreino.value
  const dias=[...modalTreino.querySelectorAll("input:checked")].map(i=>i.value)
  if(!nome||!dias.length)return
  usuario.treinos.push({nome,dias,exercicios:[],duracao:0})
  salvar()
  fecharModais()
  listarTreinos()
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
  const duracao=(exercicioAtual.series.length*40+(exercicioAtual.series.length-1)*exercicioAtual.descanso)
  usuario.treinos[treinoAtual].duracao+=Math.ceil(duracao/60)
  usuario.treinos[treinoAtual].exercicios.push(exercicioAtual)
  salvar()
  fecharModais()
  listarTreinos()
}

function fecharModais(){
  document.querySelectorAll(".modal").forEach(m=>m.style.display="none")
}

function salvar(){
  localStorage.setItem("usuario",JSON.stringify(usuario))
}

/* ===== EXECUÇÃO ===== */
let exec={}

function iniciarExecucaoTreino(i){
  exec={treino:i,ex:0,serie:0,tempo:40,rodando:true}
  carregarExecucao()
  modalExecucao.style.display="flex"
  iniciarTimer()
}

function carregarExecucao(){
  const t=usuario.treinos[exec.treino]
  const e=t.exercicios[exec.ex]
  execGif.src=e.gif
  execTreinoNome.textContent=t.nome
  execGrupo.textContent=e.grupo
  execSerie.textContent=`Série ${exec.serie+1}/${e.series.length}`
  atualizarProgresso()
}

function iniciarTimer(){
  exec.timer=setInterval(()=>{
    exec.tempo--
    atualizarCronometro()
    if(exec.tempo<=0)avancar()
  },1000)
}

function pausarOuContinuar(){
  if(exec.rodando){clearInterval(exec.timer);exec.rodando=false}
  else{exec.rodando=true;iniciarTimer()}
}

function avancar(){
  clearInterval(exec.timer)
  exec.tempo=40
  const t=usuario.treinos[exec.treino]
  const e=t.exercicios[exec.ex]
  if(exec.serie<e.series.length-1)exec.serie++
  else if(exec.ex<t.exercicios.length-1){exec.ex++;exec.serie=0}
  else return finalizarTreino()
  carregarExecucao()
  iniciarTimer()
}

function pularSerie(){avancar()}

function atualizarCronometro(){
  cronometro.textContent=`00:${String(exec.tempo).padStart(2,"0")}`
}

function atualizarProgresso(){
  const t=usuario.treinos[exec.treino]
  let total=0,atual=0
  t.exercicios.forEach((e,i)=>{total+=e.series.length;if(i<exec.ex)atual+=e.series.length})
  atual+=exec.serie+1
  barraProgresso.style.width=Math.min((atual/total)*100,100)+"%"
}

function finalizarTreino(){
  clearInterval(exec.timer)
  modalExecucao.style.display="none"
  alert("Treino finalizado 💪🔥")
}

listarTreinos()
