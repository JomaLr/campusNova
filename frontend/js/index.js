// Conexión con credenciales a Supabase
const BASE_URL = CONFIG.SUPABASE_URL;
const BASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;

const supabaseConn = window.supabase.createClient(BASE_URL, BASE_ANON_KEY);

let destacados = [];
let indiceCarrusel = 0;
let intervaloCarrusel = null;

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

  // 2. Cargar contenido dinámico desde Supabase
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
    if (slideContent) slideContent.textContent = "Bienvenido a NOVACAMPUS";
    return;
  }

  destacados = data;
  renderizarSlide(0);

  // Generar los puntos (dots)
  if (dotsContainer) {
    dotsContainer.innerHTML = "";
    destacados.forEach((_, idx) => {
      const dot = document.createElement("span");
      dot.className = `dot ${idx === 0 ? "active" : ""}`;
      dot.onclick = () => cambiarSlideManual(idx);
      dotsContainer.appendChild(dot);
    });
  }

  // Iniciar rotación automática cada 4 segundos
  if (intervaloCarrusel) clearInterval(intervaloCarrusel);
  intervaloCarrusel = setInterval(() => {
    indiceCarrusel = (indiceCarrusel + 1) % destacados.length;
    renderizarSlide(indiceCarrusel);
  }, 4000);
}

function renderizarSlide(index) {
  const slideContent = document.getElementById("carousel-slide-content");
  const dots = document.querySelectorAll("#carousel-dots .dot");

  if (!slideContent || !destacados[index]) return;

  slideContent.innerHTML = `
    <div style="font-size: 1.6rem; margin-bottom: 8px; color: #1a3e6c;">${destacados[index].titulo}</div>
    <div style="font-size: 1rem; color: #555; font-weight: normal; max-width: 800px; margin: 0 auto;">
      ${destacados[index].contenido.substring(0, 150)}${destacados[index].contenido.length > 150 ? "..." : ""}
    </div>
  `;

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

  contenedor.innerHTML = "<p>Cargando anuncios recientes...</p>";

  // Usamos select("*") para traer todas las columnas sin romper si cambia el nombre
  const { data, error } = await supabaseConn
    .from("publicaciones")
    .select("*, departamentos ( nombre )")
    .order("fecha_publicacion", { ascending: false })
    .limit(20);

  if (error) {
    contenedor.innerHTML = `<p>Error al cargar anuncios: ${error.message}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    contenedor.innerHTML =
      "<p>No hay noticias o anuncios publicados recientemente.</p>";
    return;
  }

  // Ordenar por la fecha del evento
  data.sort((a, b) => {
    const valA = a.fecha_evento || a.fecha_publicacion;
    const valB = b.fecha_evento || b.fecha_publicacion;
    return new Date(valA) - new Date(valB);
  });

  contenedor.innerHTML = "";
  data.forEach((pub) => {
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
    const lugar = pub.lugar_evento ? `<span>📍 ${pub.lugar_evento}</span>` : "";

    contenedor.innerHTML += `
      <div class="evento-card">
        <h3>${pub.titulo}</h3>
        <div class="evento-meta">
          <span>El ${fechaFormateada}</span>
          <span>A las ${horaFormateada}</span>
          ${lugar}
        </div>
        <p>${pub.contenido}</p>
        <span class="depto-tag">${nombreDepto}</span>
      </div>
    `;
  });
}

