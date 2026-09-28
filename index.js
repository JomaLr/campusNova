// Conexión con credenciales a Supabase
const BASE_URL = "https://pjuabhjyxekejoqfwxpt.supabase.co";
const BASE_ANON_KEY = "sb_publishable_6A8SA8l_ryXomSoo2N66bg_CB5A9YKd";
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
    slideContent.textContent = "Bienvenido a NOVACAMPUS";
    return;
  }

  destacados = data;
  renderizarSlide(0);

  // Generar los puntos (dots)
  dotsContainer.innerHTML = "";
  destacados.forEach((_, idx) => {
    const dot = document.createElement("span");
    dot.className = `dot ${idx === 0 ? "active" : ""}`;
    dot.onclick = () => cambiarSlideManual(idx);
    dotsContainer.appendChild(dot);
  });

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

// Carga hasta 20 publicaciones recientes de más nuevo a más antiguo
async function cargarNoticiasPeriodico() {
  const contenedor = document.getElementById("contenedor-noticias");
  contenedor.innerHTML = "<p>Cargando anuncios recientes...</p>";

  const { data, error } = await supabaseConn
    .from("publicaciones")
    .select(
      `
      id,
      titulo,
      contenido,
      tipo,
      lugar_evento,
      fecha_publicacion,
      departamentos ( nombre )
    `,
    )
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

  contenedor.innerHTML = "";
  data.forEach((pub) => {
    const fechaObj = new Date(pub.fecha_publicacion);
    const fechaFormateada = fechaObj.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const horaFormateada = fechaObj.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });

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
