let usuario = JSON.parse(localStorage.getItem("usuario")) || { nome:"", treinos:[] }
let treinoAtual = null
let exercicioAtual = null

const grupos = [
 "ombro","peitoral","bíceps","tríceps","abdômen","oblíquos",
 "antebraços","lombar","trapézio","dorsal","isquiotibiais",
 "quadríceps","panturrilha","abdutores","adutores","cardio"
]

function salvarUsuario(){
  usuario.nome = nomeUsuario.value
  localStorage.setItem("usuario", JSON.stringify(usuario))
}

function abrirNovoTreino(){
  modalTreino.style.display="flex"
}

function fecharModal(){
  document.querySelectorAll(".modal").forEach(m=>m.style.display="none")
}

function salvarTreino(){
  const dias = [...document.querySelectorAll("#modalTreino input:checked")].map(i=>i.value)
  usuario.treinos.push({
    nome:nomeTreino.value,
    dias,
    exercicios:[],
    duracao:0
  })
  localStorage.setItem("usuario",JSON.stringify(usuario))
  fecharModal()
  listarTreinos()
}

function listarTreinos(){
  listaTreinos.innerHTML=""
  usuario.treinos.forEach((t,i)=>{
    const div=document.createElement("div")
    div.innerHTML=`<b>${t.nome}</b> ⏱ ${t.duracao} min`
    div.onclick=()=>abrirGrupo(i)
    listaTreinos.appendChild(div)
  })
}

function abrirGrupo(i){
  treinoAtual=i
  modalGrupo.style.display="flex"
  grupos.forEach(g=>{
    const b=document.createElement("button")
    b.textContent=g
    b.onclick=()=>buscarGif(g)
    gruposDiv.appendChild(b)
  })
}

async function buscarGif(grupo){
  const r=await fetch(`https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${grupo}+exercise&limit=5`)
  const d=await r.json()
  exercicioAtual={grupo, gif:d.data[0].images.fixed_height.url, series:[]}
  gifSelecionado.src=exercicioAtual.gif
  modalExercicio.style.display="flex"
}

function adicionarSerie(){
  if(exercicioAtual.series.length>=5) return
  exercicioAtual.series.push({reps:12,kg:20})
  renderSeries()
}

function renderSeries(){
  series.innerHTML=""
  exercicioAtual.series.forEach((s,i)=>{
    series.innerHTML+=`
      Série ${i+1}:
      <input type="number" placeholder="Reps" value="${s.reps}">
      <input type="number" placeholder="Kg" value="${s.kg}">
    `
  })
}

function salvarExercicio(){
  const descanso = Number(descanso.value)
  const duracao = exercicioAtual.series.length * 40 + (exercicioAtual.series.length-1)*descanso
  usuario.treinos[treinoAtual].duracao += Math.ceil(duracao/60)
  usuario.treinos[treinoAtual].exercicios.push(exercicioAtual)
  localStorage.setItem("usuario",JSON.stringify(usuario))
  fecharModal()
  listarTreinos()
}

listarTreinos()
