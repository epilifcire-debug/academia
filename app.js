// ============================
// ESTADO GLOBAL
// ============================
let usuario = JSON.parse(localStorage.getItem("usuario")) || {
  nome: "",
  treinos: []
};

let treinoAtual = null;
let exercicioAtual = null;

// ============================
// GRUPOS MUSCULARES
// ============================
const gruposMusculares = [
  "ombro","peitoral","bíceps","tríceps","abdômen","oblíquos",
  "antebraços","lombar","trapézio","dorsal","isquiotibiais",
  "quadríceps","panturrilha","abdutores","adutores","cardio"
];

// ============================
// USUÁRIO
// ============================
function salvarUsuario() {
  usuario.nome = document.getElementById("nomeUsuario").value;
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

// ============================
// TREINOS
// ============================
function abrirNovoTreino() {
  document.getElementById("modalTreino").style.display = "flex";
}

function salvarTreino() {
  const nome = document.getElementById("nomeTreino").value;
  const dias = [...document.querySelectorAll("#modalTreino input:checked")]
    .map(i => i.value);

  if (!nome || dias.length === 0) return;

  usuario.treinos.push({
    nome,
    dias,
    exercicios: [],
    duracao: 0
  });

  salvarStorage();
  fecharModais();
  listarTreinos();
}

function listarTreinos() {
  const lista = document.getElementById("listaTreinos");
  lista.innerHTML = "";

  usuario.treinos.forEach((t, index) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${t.nome}</strong><br>⏱ ${t.duracao} min`;
    div.onclick = () => abrirGrupo(index);
    lista.appendChild(div);
  });
}

// ============================
// GRUPO MUSCULAR
// ============================
function abrirGrupo(index) {
  treinoAtual = index;

  const gruposDiv = document.getElementById("grupos");
  gruposDiv.innerHTML = "";

  document.getElementById("modalGrupo").style.display = "flex";

  gruposMusculares.forEach(g => {
    const btn = document.createElement("button");
    btn.textContent = g;
    btn.onclick = () => buscarGif(g);
    gruposDiv.appendChild(btn);
  });
}

// ============================
// BUSCA GIF
// ============================
async function buscarGif(grupo) {
  fecharModais();

  const res = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=${grupo}+exercise&limit=1`
  );
  const data = await res.json();

  exercicioAtual = {
    grupo,
    gif: data.data[0]?.images.fixed_height.url || "",
    series: [],
    descanso: 0
  };

  document.getElementById("gifSelecionado").src = exercicioAtual.gif;
  document.getElementById("series").innerHTML = "";
  adicionarSerie();

  document.getElementById("modalExercicio").style.display = "flex";
}

// ============================
// SÉRIES
// ============================
function adicionarSerie() {
  if (exercicioAtual.series.length >= 5) return;

  exercicioAtual.series.push({ reps: 12, kg: 20 });
  renderSeries();
}

function renderSeries() {
  const div = document.getElementById("series");
  div.innerHTML = "";

  exercicioAtual.series.forEach((s, i) => {
    div.innerHTML += `
      <div>
        Série ${i + 1}
        <input type="number" value="${s.reps}" 
          onchange="exercicioAtual.series[${i}].reps=this.value">
        <input type="number" value="${s.kg}" 
          onchange="exercicioAtual.series[${i}].kg=this.value">
      </div>
    `;
  });
}

// ============================
// SALVAR EXERCÍCIO
// ============================
function salvarExercicio() {
  exercicioAtual.descanso =
    Number(document.getElementById("descanso").value) || 60;

  const totalSeries = exercicioAtual.series.length;
  const duracaoSeg =
    totalSeries * 40 +
    (totalSeries - 1) * exercicioAtual.descanso;

  usuario.treinos[treinoAtual].duracao += Math.ceil(duracaoSeg / 60);
  usuario.treinos[treinoAtual].exercicios.push(exercicioAtual);

  salvarStorage();
  fecharModais();
  listarTreinos();
}

// ============================
// UTIL
// ============================
function fecharModais() {
  document.querySelectorAll(".modal")
    .forEach(m => m.style.display = "none");
}

function salvarStorage() {
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

// ============================
// INIT
// ============================
listarTreinos();
