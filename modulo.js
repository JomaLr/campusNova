// Conexión con Supabase
const BASE_URL = "https://pjuabhjyxekejoqfwxpt.supabase.co";
const BASE_ANON_KEY = "sb_publishable_6A8SA8l_ryXomSoo2N66bg_CB5A9YKd";
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
    textoDesc.innerHTML = `Estás en el apartado público de <strong>${deptoFiltro}</strong>. Aquí puedes consultar la información y avisos correspondientes a esta área.`;
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
    query = query.eq("departamentos.nombre", deptoFiltro);
  }

  const { data, error } = await query;
  renderizarNoticias(data, error);
}

function renderizarNoticias(data, error) {
  const contenedor = document.getElementById("contenedor-noticias");

  if (error) {
    contenedor.innerHTML = `<p style="color: red;">Error al cargar publicaciones: ${error.message}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    contenedor.innerHTML = `
      <div class="content-card" style="text-align: center; color: #666;">
        No se encontraron publicaciones con estos criterios.
      </div>`;
    return;
  }

  contenedor.innerHTML = "";

  // Formato de Lista apilada usando la clase evento-card
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
      <div class="evento-card" style="width: 100%; box-sizing: border-box; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
          <h3 style="margin-top: 0; font-size: 1.4rem;">${pub.titulo}</h3>
          <span class="depto-tag" style="margin-top: 0; margin-bottom: 10px;">${nombreDepto}</span>
        </div>
        <div class="evento-meta" style="margin-top: 5px; margin-bottom: 15px;">
          <span>El  ${fechaFormateada}</span>
          <span>A las ${horaFormateada}</span>
          ${lugar}
        </div>
        <p style="color: #444; line-height: 1.6;">${pub.contenido}</p>
      </div>
    `;
  });
}
