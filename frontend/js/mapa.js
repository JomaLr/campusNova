// Conexión con Supabase
const BASE_URL = CONFIG.SUPABASE_URL;
const BASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;
const supabaseConn = window.supabase.createClient(BASE_URL, BASE_ANON_KEY);

let lugaresGlobales = [];

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Configurar buscador global del header
  configurarBuscadores();

  // 2. Obtener lista de salones/lugares desde la DB y renderizar
  await cargarDirectorio();

  // 3. Inicializar los eventos del mapa SVG y la tarjeta
  inicializarMapaYTarjeta();
});

// --- FUNCIONES DE BÚSQUEDA ---
function configurarBuscadores() {
  const inputGlobal = document.getElementById("input-busqueda-global");
  if (inputGlobal) {
    inputGlobal.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && inputGlobal.value.trim() !== "") {
        const termino = encodeURIComponent(inputGlobal.value.trim());
        window.location.href = `modulo.html?buscar=${termino}`;
      }
    });
  }

  const buscadorLocal = document.getElementById("buscador-lugares");
  if (buscadorLocal) {
    buscadorLocal.addEventListener("input", (e) => {
      filtrarDirectorio(e.target.value);
    });
  }
}

// --- FUNCIONES DE BASE DE DATOS Y DIRECTORIO ---
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
    li.setAttribute("data-target", lugar.codigo); // Se alinea con el atributo del SVG
    li.tabIndex = 0;
    li.setAttribute("role", "button");

    const nombreLugar = lugar.nombre || `Espacio: ${lugar.codigo}`;

    li.innerHTML = `
      <span class="li-icon">${NC.icon("map-pin")}</span>
      <span class="li-text">
        <strong>${NC.esc(nombreLugar)}</strong>
        <span>${NC.esc(lugar.codigo)}</span>
      </span>
    `;

    // Eventos para la lista
    const triggerSeleccion = () => procesarSeleccion(lugar.codigo, null);
    li.addEventListener("click", triggerSeleccion);
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        triggerSeleccion();
      }
    });

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

// --- FUNCIONES DEL MAPA INTERACTIVO Y TARJETA ---
function inicializarMapaYTarjeta() {
  const areasMapa = document.querySelectorAll(".area-interactiva");
  const infoBox = document.getElementById("info-mapa"); // Tooltip opcional

  areasMapa.forEach((area) => {
    // Hover (ratón encima)
    area.addEventListener("mouseenter", (e) => {
      e.target.style.cursor = "pointer";
      e.target.style.opacity = "0.7";
      e.target.style.transition = "opacity 0.2s ease";

      if (infoBox) {
        const edificio = e.target.dataset.edificio;
        const nombreArea = e.target.dataset.area.replace(/-/g, " ");
        infoBox.innerHTML =
          edificio === "Ninguno"
            ? `Área: <strong>${nombreArea}</strong>`
            : `Edificio <strong>${edificio}</strong> - ${nombreArea}`;
      }
    });

    // Quitar hover
    area.addEventListener("mouseleave", (e) => {
      e.target.style.opacity = "1";
      if (infoBox) infoBox.innerHTML = "Pasa el cursor sobre un área...";
    });

    // Clic en el área del SVG
    area.addEventListener("click", function () {
      procesarSeleccion(this.id, this);
    });
  });
}

function procesarSeleccion(targetId, areaElement = null) {
  // 1. Limpiar selecciones previas
  document
    .querySelectorAll(".area-interactiva")
    .forEach((a) => a.classList.remove("iluminado", "activo"));
  document
    .querySelectorAll(".lista-lugares li, .lugar-item")
    .forEach((item) => item.classList.remove("activo"));

  // 2. Obtener el elemento SVG si no se pasó (cuando se hace clic desde la lista)
  const areaSvg = areaElement || document.getElementById(targetId);

  // 3. Iluminar SVG y marcar la lista
  if (areaSvg) areaSvg.classList.add("iluminado", "activo");

  const itemLista = document.querySelector(
    `.lista-lugares li[data-target="${targetId}"], .lugar-item[data-target="${targetId}"]`,
  );
  if (itemLista) {
    itemLista.classList.add("activo");
    // Scroll a la tarjeta en móviles
    if (window.matchMedia("(max-width: 960px)").matches) {
      document
        .getElementById("tarjeta-info")
        .scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  // 4. Extraer datos para la tarjeta
  // Primero intentamos sacar los datos de Supabase si existen
  const lugarData = lugaresGlobales.find((l) => l.codigo === targetId);

  // Extraemos del SVG como respaldo
  let edificio = areaSvg ? areaSvg.getAttribute("data-edificio") : "Ninguno";
  let nombreArea = areaSvg ? areaSvg.getAttribute("data-area") : targetId;

  // Si tenemos datos de Supabase, podemos usarlos para enriquecer la tarjeta
  const nombreFinal =
    lugarData && lugarData.nombre
      ? lugarData.nombre
      : nombreArea
        ? nombreArea.replace(/-/g, " ")
        : "Área Desconocida";
  const descFinal =
    lugarData && lugarData.descripcion ? lugarData.descripcion : null;

  actualizarTarjeta(edificio, nombreFinal, descFinal);
}

function actualizarTarjeta(edificio, nombreArea, descripcionPersonalizada) {
  const tarjeta = document.getElementById("tarjeta-info");
  const titulo = document.getElementById("tarjeta-titulo");
  const txtEdificio = document.getElementById("tarjeta-edificio");
  const txtArea = document.getElementById("tarjeta-area");
  const txtDesc = document.getElementById("tarjeta-desc");

  tarjeta.classList.remove("oculta");
  tarjeta.style.display = "block";

  titulo.textContent = nombreArea;
  txtArea.textContent = nombreArea;

  if (!edificio || edificio === "Ninguno") {
    txtEdificio.textContent = "Área Exterior";
    txtDesc.textContent =
      descripcionPersonalizada ||
      `Esta es un área al aire libre en el campus conocida como ${nombreArea}.`;
  } else {
    txtEdificio.textContent = `Edificio ${edificio}`;
    txtDesc.textContent =
      descripcionPersonalizada ||
      `El ${nombreArea} se encuentra ubicado en el Edificio ${edificio}. \n Aquí podrás consultar horarios y disponibilidad próximamente.`;
  }
}
