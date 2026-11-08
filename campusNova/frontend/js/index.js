// Conexión con credenciales a Supabase
const BASE_URL = CONFIG.SUPABASE_URL;
const BASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;

const supabaseConn = window.supabase.createClient(BASE_URL, BASE_ANON_KEY);

let destacados = [];
let indiceCarrusel = 0;
let intervaloCarrusel = null;
let noticiasCargadas = [];
let filtroTipo = "";

// Acceso rápido a departamentos (usa la lista compartida de ui.js)
function renderizarAccesoRapido() {
  const cont = document.getElementById("acceso-rapido");
  if (!cont || !window.NC) return;
  const extra = [
    { nombre: "Mapa interactivo", icono: "map", desc: "Ubica salones y edificios", href: "mapa.html" },
    { nombre: "Calendario", icono: "calendar", desc: "Eventos y fechas clave", href: "calendario.html" },
  ];
  const items = NC.departamentos
    .map((d) => ({ ...d, href: "modulo.html?departamento=" + encodeURIComponent(d.nombre) }))
    .concat(extra);
  cont.innerHTML = items
    .map(
      (d) => `
      <a class="quick-card" href="${d.href}">
        <span class="qc-icon">${NC.icon(d.icono)}</span>
        <strong>${NC.esc(d.nombre)}</strong>
        <small>${NC.esc(d.desc)}</small>
        <span class="qc-go">Abrir ${NC.icon("arrow-right")}</span>
      </a>`,
    )
    .join("");
}

// Etiqueta de tipo (aviso / evento / noticia) con su color
function chipTipo(tipo) {
  const t = (tipo || "").toLowerCase();
  if (!t) return "";
  const iconos = { aviso: "bell", evento: "calendar", noticia: "newspaper" };
  return `<span class="chip chip--${NC.esc(t)}">${NC.icon(iconos[t] || "info")}${NC.esc(tipo)}</span>`;
}

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Configurar buscador
  const inputBusqueda = document.getElementById("input-busqueda");
  if (inputBusqueda) {
    inputBusqueda.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && inputBusqueda.value.trim() !== "") {
        const termino = encodeURIComponent(inputBusqueda.value.trim());
        window.location.href = `modulo.html?buscar=${termino}`;
      }
    });
  }

  // 1.b Controles del carrusel y filtros de noticias
  document.getElementById("carousel-prev")?.addEventListener("click", () => moverCarrusel(-1));
  document.getElementById("carousel-next")?.addEventListener("click", () => moverCarrusel(1));
  const caja = document.getElementById("carousel-box");
  if (caja) {
    // Pausar la rotación automática mientras se interactúa con el carrusel
    ["mouseenter", "focusin"].forEach((ev) => caja.addEventListener(ev, detenerCarrusel));
    ["mouseleave", "focusout"].forEach((ev) => caja.addEventListener(ev, iniciarCarrusel));
  }
  document.getElementById("filtros-tipo")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    filtroTipo = btn.dataset.tipo;
    document
      .querySelectorAll("#filtros-tipo .filter-btn")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    pintarNoticias();
  });

  // 2. Cargar contenido dinámico desde Supabase
  renderizarAccesoRapido();
  await cargarCarrusel();
  await cargarNoticiasPeriodico();
});

// Carga las últimas 5 publicaciones para el carrusel
async function cargarCarrusel() {
  const slideContent = document.getElementById("carousel-slide-content");
  const dotsContainer = document.getElementById("carousel-dots");

  const { data, error } = await supabaseConn
    .from("publicaciones")
    .select("id, titulo, contenido, tipo")
    .order("fecha_publicacion", { ascending: false })
    .limit(5);

  if (error || !data || data.length === 0) {
    if (slideContent) {
      slideContent.innerHTML = `<div class="slide-title">Bienvenido a NOVACAMPUS</div>
        <div class="slide-text">Aquí aparecerán los avisos más recientes de la institución.</div>`;
    }
    document.querySelector(".carousel-arrows")?.setAttribute("hidden", "");
    return;
  }

  destacados = data;
  renderizarSlide(0);

  // Generar los puntos (dots)
  if (dotsContainer) {
    dotsContainer.innerHTML = "";
    destacados.forEach((_, idx) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `dot ${idx === 0 ? "active" : ""}`;
      dot.setAttribute("aria-label", `Ir al aviso ${idx + 1}`);
      dot.onclick = () => cambiarSlideManual(idx);
      dotsContainer.appendChild(dot);
    });
  }

  // Iniciar rotación automática cada 4 segundos
  iniciarCarrusel();
}

function iniciarCarrusel() {
  if (intervaloCarrusel) clearInterval(intervaloCarrusel);
  if (destacados.length < 2) return;
  intervaloCarrusel = setInterval(() => {
    indiceCarrusel = (indiceCarrusel + 1) % destacados.length;
    renderizarSlide(indiceCarrusel);
  }, 4000);
}

function detenerCarrusel() {
  if (intervaloCarrusel) clearInterval(intervaloCarrusel);
  intervaloCarrusel = null;
}

function moverCarrusel(delta) {
  if (!destacados.length) return;
  indiceCarrusel = (indiceCarrusel + delta + destacados.length) % destacados.length;
  renderizarSlide(indiceCarrusel);
}

function renderizarSlide(index) {
  const slideContent = document.getElementById("carousel-slide-content");
  const dots = document.querySelectorAll("#carousel-dots .dot");

  if (!slideContent || !destacados[index]) return;

  const d = destacados[index];
  slideContent.innerHTML = `
    ${chipTipo(d.tipo)}
    <div class="slide-title">${NC.esc(d.titulo)}</div>
    <div class="slide-text">
      ${NC.esc(d.contenido.substring(0, 150))}${d.contenido.length > 150 ? "..." : ""}
    </div>
  `;
  slideContent.classList.remove("enter");
  void slideContent.offsetWidth; // reinicia la animación
  slideContent.classList.add("enter");

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

function cambiarSlideManual(index) {
  indiceCarrusel = index;
  renderizarSlide(index);
}

// Carga publicaciones y muestra la fecha/hora del evento
async function cargarNoticiasPeriodico() {
  const contenedor = document.getElementById("contenedor-noticias");
  if (!contenedor) return;

  contenedor.innerHTML =
    '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';

  // Usamos select("*") para traer todas las columnas sin romper si cambia el nombre
  const { data, error } = await supabaseConn
    .from("publicaciones")
    .select("*, departamentos ( nombre )")
    .order("fecha_publicacion", { ascending: false })
    .limit(20);

  if (error) {
    contenedor.innerHTML = `<div class="state state--error">${NC.icon("alert-circle")}<strong>No se pudieron cargar los anuncios</strong><span>${NC.esc(error.message)}</span></div>`;
    return;
  }

  if (!data || data.length === 0) {
    contenedor.innerHTML = `<div class="state">${NC.icon("inbox")}<strong>Sin publicaciones por ahora</strong><span>No hay noticias o anuncios publicados recientemente.</span></div>`;
    return;
  }

  // Ordenar por la fecha del evento
  data.sort((a, b) => {
    const valA = a.fecha_evento || a.fecha_publicacion;
    const valB = b.fecha_evento || b.fecha_publicacion;
    return new Date(valA) - new Date(valB);
  });

  noticiasCargadas = data;
  pintarNoticias();
}

// Dibuja las tarjetas aplicando el filtro por tipo activo
function pintarNoticias() {
  const contenedor = document.getElementById("contenedor-noticias");
  if (!contenedor) return;

  const lista = noticiasCargadas.filter(
    (p) => !filtroTipo || (p.tipo || "").toLowerCase() === filtroTipo,
  );

  if (lista.length === 0) {
    contenedor.innerHTML = `<div class="state">${NC.icon("inbox")}<strong>Nada en esta categoría</strong><span>Prueba con otro filtro.</span></div>`;
    return;
  }

  contenedor.innerHTML = "";
  lista.forEach((pub, i) => {
    // Se toma fecha_evento si existe, o fecha_publicacion como respaldo
    const fechaString = pub.fecha_evento || pub.fecha_publicacion;

    let fechaFormateada = "";
    let horaFormateada = "";

    if (fechaString) {
      const fechaObj = new Date(fechaString);

      fechaFormateada = fechaObj.toLocaleDateString("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      horaFormateada = fechaObj.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    const nombreDepto = pub.departamentos?.nombre || "General";
    const lugar = pub.lugar_evento
      ? `<span>${NC.icon("map-pin")}${NC.esc(pub.lugar_evento)}</span>`
      : "";

    contenedor.innerHTML += `
      <article class="evento-card" style="animation-delay: ${Math.min(i, 8) * 50}ms">
        <div class="evento-top">
          ${chipTipo(pub.tipo)}
          <span class="depto-tag">${NC.esc(nombreDepto)}</span>
        </div>
        <h3>${NC.esc(pub.titulo)}</h3>
        <div class="evento-meta">
          <span>${NC.icon("calendar")}El ${NC.esc(fechaFormateada)}</span>
          <span>${NC.icon("clock")}A las ${NC.esc(horaFormateada)}</span>
          ${lugar}
        </div>
        <p>${NC.esc(pub.contenido)}</p>
      </article>
    `;
  });
}
