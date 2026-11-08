// Conexión con Supabase
const BASE_URL = CONFIG.SUPABASE_URL;
const BASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;
const supabaseConn = window.supabase.createClient(BASE_URL, BASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Activar el buscador en el header
  const inputBusqueda = document.getElementById("input-busqueda");
  if (inputBusqueda) {
    inputBusqueda.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && inputBusqueda.value.trim() !== "") {
        const termino = encodeURIComponent(inputBusqueda.value.trim());
        window.location.href = `modulo.html?buscar=${termino}`;
      }
    });
  }

  // 2. Ejecutar la carga de datos
  await cargarModulo();
});

async function cargarModulo() {
  const urlParams = new URLSearchParams(window.location.search);
  const terminoBusqueda = urlParams.get("buscar");
  const deptoFiltro = urlParams.get("departamento");

  const tituloPagina = document.getElementById("titulo-pagina");
  const textoDesc = document.getElementById("texto-descripcion");
  const pageTitle = document.getElementById("page-title");

  // 3. Ajustar el texto de cabecera según el tipo de vista
  if (terminoBusqueda) {
    const terminoLimpio = decodeURIComponent(terminoBusqueda);
    pageTitle.textContent = `Búsqueda: ${terminoLimpio} - NOVACAMPUS`;
    tituloPagina.textContent = `Resultados para "${terminoLimpio}"`;
    textoDesc.textContent =
      "A continuación se muestran las publicaciones que coinciden con tu búsqueda en toda la plataforma.";
  } else if (deptoFiltro) {
    pageTitle.textContent = `${deptoFiltro} - NOVACAMPUS`;
    tituloPagina.textContent = deptoFiltro;
    textoDesc.innerHTML = `Estás en el apartado público de <strong>${NC.esc(deptoFiltro)}</strong>. Aquí puedes consultar la información y avisos correspondientes a esta área.`;
  } else {
    tituloPagina.textContent = "Publicaciones Generales";
    textoDesc.textContent =
      "Mostrando todas las publicaciones recientes de la institución.";
  }

  // 4. Preparar la consulta a Supabase
  // Usamos !inner para poder filtrar por el nombre del departamento si es necesario
  let query = supabaseConn
    .from("publicaciones")
    .select(
      `
      id,
      titulo,
      contenido,
      tipo,
      fecha_publicacion,
      lugar_evento,
      departamentos!inner ( nombre )
    `,
    )
    .order("fecha_publicacion", { ascending: false });

  if (terminoBusqueda) {
    query = query.or(
      `titulo.ilike.%${terminoBusqueda}%,contenido.ilike.%${terminoBusqueda}%`,
    );
  } else if (deptoFiltro) {
    // ilike + "_" en vocales acentuadas: el mismo enlace funciona con
    // "Vinculación", "vinculacion", etc. (los menús tenían ambas variantes).
    const patron = deptoFiltro.replace(/[áéíóúÁÉÍÓÚñÑ]/g, "_");
    query = query.ilike("departamentos.nombre", patron);
  }

  const contenedor = document.getElementById("contenedor-noticias");
  if (contenedor) {
    contenedor.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div>';
  }

  const { data, error } = await query;
  renderizarNoticias(data, error);
}

function renderizarNoticias(data, error) {
  const contenedor = document.getElementById("contenedor-noticias");

  if (error) {
    contenedor.innerHTML = `<div class="state state--error">${NC.icon("alert-circle")}<strong>Error al cargar publicaciones</strong><span>${NC.esc(error.message)}</span></div>`;
    return;
  }

  if (!data || data.length === 0) {
    contenedor.innerHTML = `
      <div class="state">${NC.icon("inbox")}<strong>Sin resultados</strong>
        <span>No se encontraron publicaciones con estos criterios.</span>
        <a class="btn btn-ghost btn-sm" href="index.html" style="margin-top:.5rem">Volver al inicio</a>
      </div>`;
    return;
  }

  contenedor.innerHTML = "";

  const conteo = document.getElementById("conteo-resultados");
  if (conteo) {
    conteo.textContent = `${data.length} publicación${data.length === 1 ? "" : "es"}`;
    conteo.hidden = false;
  }

  const iconos = { aviso: "bell", evento: "calendar", noticia: "newspaper" };

  // Formato de Lista apilada usando la clase evento-card
  data.forEach((pub, i) => {
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
    const lugar = pub.lugar_evento
      ? `<span>${NC.icon("map-pin")}${NC.esc(pub.lugar_evento)}</span>`
      : "";
    const t = (pub.tipo || "").toLowerCase();
    const chip = t
      ? `<span class="chip chip--${NC.esc(t)}">${NC.icon(iconos[t] || "info")}${NC.esc(pub.tipo)}</span>`
      : "";

    contenedor.innerHTML += `
      <article class="evento-card evento-card--lista" style="animation-delay: ${Math.min(i, 8) * 50}ms">
        <div class="evento-top">
          ${chip}
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
