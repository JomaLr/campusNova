// Conexión con Supabase
const BASE_URL = CONFIG.SUPABASE_URL;
const BASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;
const supabaseConn = window.supabase.createClient(BASE_URL, BASE_ANON_KEY);

let fechaActual = new Date();
let eventosGlobales = [];

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Configurar barra de búsqueda general
  const inputBusqueda = document.getElementById("input-busqueda");
  if (inputBusqueda) {
    inputBusqueda.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && inputBusqueda.value.trim() !== "") {
        const termino = encodeURIComponent(inputBusqueda.value.trim());
        window.location.href = `modulo.html?buscar=${termino}`;
      }
    });
  }

  // 2. Listeners para los botones del calendario
  document
    .getElementById("btn-prev")
    .addEventListener("click", () => cambiarMes(-1));
  document
    .getElementById("btn-next")
    .addEventListener("click", () => cambiarMes(1));

  // 3. Cargar eventos de la base de datos
  await obtenerEventos();

  // 4. Dibujar calendario
  renderizarCalendario();
});

async function obtenerEventos() {
  const { data, error } = await supabaseConn
    .from("publicaciones")
    .select("id, titulo, tipo, fecha_inicio, lugar_evento")
    .not("fecha_inicio", "is", null);

  if (!error && data) {
    eventosGlobales = data;
  } else {
    console.error("Error al cargar eventos:", error);
  }
}

function cambiarMes(direccion) {
  fechaActual.setMonth(fechaActual.getMonth() + direccion);
  renderizarCalendario();
}

function renderizarCalendario() {
  const grid = document.getElementById("calendario-grid");
  const tituloMes = document.getElementById("mes-anio");

  const anio = fechaActual.getFullYear();
  const mes = fechaActual.getMonth();

  // Actualizar título (Ej: Octubre 2026)
  const nombreMes = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
    fechaActual,
  );
  tituloMes.textContent = `${nombreMes} ${anio}`;

  grid.innerHTML = "";

  // Cabecera de días de la semana
  const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  diasSemana.forEach((dia) => {
    const div = document.createElement("div");
    div.className = "calendar-day-header";
    div.textContent = dia;
    grid.appendChild(div);
  });

  // Cálculos del mes
  const primerDiaMes = new Date(anio, mes, 1).getDay(); // 0 (Dom) a 6 (Sáb)
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const hoy = new Date();

  // 1. Celdas vacías previas
  for (let i = 0; i < primerDiaMes; i++) {
    const div = document.createElement("div");
    div.className = "calendar-cell empty";
    grid.appendChild(div);
  }

  // 2. Días del mes
  for (let dia = 1; dia <= diasEnMes; dia++) {
    const celda = document.createElement("div");
    celda.className = "calendar-cell";

    // Marcar el día de hoy
    if (
      dia === hoy.getDate() &&
      mes === hoy.getMonth() &&
      anio === hoy.getFullYear()
    ) {
      celda.classList.add("today");
    }

    // Número del día
    const dateLabel = document.createElement("div");
    dateLabel.className = "calendar-date";
    dateLabel.textContent = dia;
    celda.appendChild(dateLabel);

    // Filtrar eventos que ocurran en este día, mes y año
    const eventosDelDia = eventosGlobales.filter((evt) => {
      const fechaEvt = new Date(evt.fecha_inicio);
      return (
        fechaEvt.getDate() === dia &&
        fechaEvt.getMonth() === mes &&
        fechaEvt.getFullYear() === anio
      );
    });

    // Añadir insignias de eventos
    eventosDelDia.forEach((evt) => {
      const badge = document.createElement("div");
      // Asignar clase de color según el tipo
      const tipoNormalizado = evt.tipo ? evt.tipo.toLowerCase() : "aviso";
      badge.className = `event-badge ${tipoNormalizado}`;

      const horaObj = new Date(evt.fecha_inicio);
      const horaStr = horaObj.toLocaleTimeString("es-MX", {
        hour: "2-digit",
        minute: "2-digit",
      });

      badge.textContent = `${horaStr} - ${evt.titulo}`;
      badge.title = `${evt.titulo}\nLugar: ${evt.lugar_evento || "Por definir"}`;
      celda.appendChild(badge);
    });

    grid.appendChild(celda);
  }
}
