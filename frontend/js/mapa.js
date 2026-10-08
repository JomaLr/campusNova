// Conexión con Supabase
const BASE_URL = CONFIG.SUPABASE_URL;
const BASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;
const supabaseConn = window.supabase.createClient(BASE_URL, BASE_ANON_KEY);

let lugaresGlobales = [];

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Configurar buscador global del header
  const inputGlobal = document.getElementById("input-busqueda-global");
  if (inputGlobal) {
    inputGlobal.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && inputGlobal.value.trim() !== "") {
        const termino = encodeURIComponent(inputGlobal.value.trim());
        window.location.href = `modulo.html?buscar=${termino}`;
      }
    });
  }

  // 2. Obtener lista de salones/lugares desde la DB
  await cargarDirectorio();

  // 3. Configurar buscador local del directorio
  const buscadorLocal = document.getElementById("buscador-lugares");
  if (buscadorLocal) {
    buscadorLocal.addEventListener("input", (e) => {
      filtrarDirectorio(e.target.value);
    });
  }
});

async function cargarDirectorio() {
  const listaContenedor = document.getElementById("lista-lugares");

  const { data, error } = await supabaseConn
    .from("salones")
    .select("*")
    .order("codigo", { ascending: true });

  if (error || !data) {
    listaContenedor.innerHTML = "<li>Error al cargar directorio.</li>";
    return;
  }

  lugaresGlobales = data;
  renderizarLista(lugaresGlobales);
}

function renderizarLista(lugares) {
  const listaContenedor = document.getElementById("lista-lugares");
  listaContenedor.innerHTML = "";

  if (lugares.length === 0) {
    listaContenedor.innerHTML =
      "<li style='padding:10px; color:#666;'>No se encontraron resultados.</li>";
    return;
  }

  lugares.forEach((lugar) => {
    const li = document.createElement("li");
    li.className = "lugar-item";

    const nombreLugar = lugar.nombre || `Espacio: ${lugar.codigo}`;
    const descCorta = lugar.descripcion
      ? lugar.descripcion.substring(0, 30) + "..."
      : "Área del campus";

    li.innerHTML = `
      <strong>${nombreLugar}</strong>
      <span>${lugar.codigo}</span>
    `;

    li.addEventListener("click", () => mostrarInfoLugar(lugar, li));
    listaContenedor.appendChild(li);
  });
}

function filtrarDirectorio(termino) {
  const terminoMin = termino.toLowerCase();
  const filtrados = lugaresGlobales.filter((lugar) => {
    const nombre = (lugar.nombre || "").toLowerCase();
    const codigo = (lugar.codigo || "").toLowerCase();
    return nombre.includes(terminoMin) || codigo.includes(terminoMin);
  });
  renderizarLista(filtrados);
}

function mostrarInfoLugar(lugar, elementoLi) {
  // Resaltar el seleccionado en la lista
  document
    .querySelectorAll(".lugar-item")
    .forEach((el) => el.classList.remove("activo"));
  if (elementoLi) elementoLi.classList.add("activo");

  const tarjetaInfo = document.getElementById("tarjeta-info");
  tarjetaInfo.style.display = "block";

  document.getElementById("info-titulo").textContent =
    lugar.nombre || `Espacio: ${lugar.codigo}`;
  document.getElementById("info-codigo").textContent = lugar.codigo;

  document.getElementById("info-horario").textContent =
    lugar.horario || "Lunes a Viernes, 09:00 - 18:00 hrs";
  document.getElementById("info-descripcion").textContent =
    lugar.descripcion ||
    "Este es un espacio del campus disponible para actividades académicas y administrativas.";
}
