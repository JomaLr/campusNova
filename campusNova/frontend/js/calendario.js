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
  document.getElementById("btn-hoy").addEventListener("click", () => {
    fechaActual = new Date();
    renderizarCalendario();
  });

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
  // Fijar el día 1 evita saltos de mes (p. ej. 31 de enero + 1 mes → marzo)
  fechaActual.setDate(1);
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
  ocultarDetalle();

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

    // Al elegir un día con eventos se muestra su detalle debajo del calendario
    if (eventosDelDia.length > 0) {
      celda.classList.add("has-events");
      celda.tabIndex = 0;
      celda.setAttribute("role", "button");
      celda.setAttribute(
        "aria-label",
        `${dia} de ${nombreMes}: ${eventosDelDia.length} evento${eventosDelDia.length === 1 ? "" : "s"}`,
      );
      const abrir = () => mostrarDetalleDia(celda, dia, eventosDelDia);
      celda.addEventListener("click", abrir);
      celda.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          abrir();
        }
      });
    }

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

// ---------- Detalle del día seleccionado ----------
function ocultarDetalle() {
  const panel = document.getElementById("dia-detalle");
  if (panel) {
    panel.hidden = true;
    panel.innerHTML = "";
  }
}

function mostrarDetalleDia(celda, dia, eventos) {
  const panel = document.getElementById("dia-detalle");
  if (!panel) return;

  document
    .querySelectorAll(".calendar-cell.selected")
    .forEach((el) => el.classList.remove("selected"));
  celda.classList.add("selected");

  const fecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), dia);
  const titulo = fecha.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const ordenados = [...eventos].sort(
    (a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio),
  );

  panel.innerHTML = `
    <h3>${NC.esc(titulo)}</h3>
    <ul>
      ${ordenados
        .map((evt) => {
          const hora = new Date(evt.fecha_inicio).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const t = (evt.tipo || "").toLowerCase();
          return `<li class="day-item">
            <time>${NC.esc(hora)}</time>
            <strong>${NC.esc(evt.titulo)}</strong>
            <small>${t ? `<span class="chip chip--${NC.esc(t)}">${NC.esc(evt.tipo)}</span>` : ""}
              ${NC.icon("map-pin")}${NC.esc(evt.lugar_evento || "Por definir")}</small>
          </li>`;
        })
        .join("")}
    </ul>`;
  panel.hidden = false;
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
