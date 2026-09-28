// Conexión con la DB
const supabaseUrl = "https://pjuabhjyxekejoqfwxpt.supabase.co";
const supabaseKey = "sb_publishable_6A8SA8l_ryXomSoo2N66bg_CB5A9YKd";
const supabaseConn = window.supabase.createClient(supabaseUrl, supabaseKey);

let usuarioActual = null;
let publicacionEditandoId = null;
let listaPublicaciones = [];

window.addEventListener("pageshow", async () => {
  // 1. Validar sesión activa en Supabase
  const {
    data: { session },
  } = await supabaseConn.auth.getSession();

  if (!session) {
    window.location.replace("login.html");
    return;
  }

  // 2. Obtener datos del perfil del usuario
  const { data: perfil, error } = await supabaseConn
    .from("usuarios")
    .select(
      `
        nombre,
        departamento_id,
        rol_id,
        roles ( nombre_rol ),
        departamentos ( nombre )
      `,
    )
    .eq("id", session.user.id)
    .single();

  if (error || !perfil) {
    console.error("Error al obtener perfil:", error);
    return;
  }

  usuarioActual = {
    uid: session.user.id,
    nombre: perfil.nombre,
    rol: perfil.roles.nombre_rol,
    departamento: perfil.departamentos?.nombre || "General",
    departamento_id: perfil.departamento_id,
  };

  document.getElementById("info-usuario").textContent =
    `${usuarioActual.nombre} | Depto: ${usuarioActual.departamento}`;

  // 3. Adaptar interfaz según el rol
  if (usuarioActual.rol === "superusuario") {
    document.getElementById("grupo-departamento").style.display = "block";
    await cargarSelectDepartamentos();
  } else {
    document.getElementById("grupo-departamento").style.display = "none";
  }

  // 4. Cargar combo box de Salones utilizando el campo 'codigo'
  await cargarSelectSalones();

  // Asignar listeners
  const btnCerrar = document.getElementById("btn-cerrar-sesion");
  const btnPublicar = document.getElementById("btn-publicar");
  const btnCancelar = document.getElementById("btn-cancelar");

  if (btnCerrar) btnCerrar.onclick = cerrarSesion;
  if (btnPublicar) btnPublicar.onclick = guardarPublicacion;
  if (btnCancelar) btnCancelar.onclick = cancelarEdicion;

  // 5. Cargar la tabla de publicaciones
  await cargarPublicaciones();
});

// Llenar combo box de Salones
async function cargarSelectSalones() {
  const select = document.getElementById("lugar");
  if (!select) return;

  const { data: salonesList, error } = await supabaseConn
    .from("salones")
    .select("id, codigo")
    .order("codigo", { ascending: true });

  select.innerHTML =
    '<option value="">-- Selecciona un salón/lugar --</option>';

  if (error) {
    console.error("Error al cargar salones:", error);
    return;
  }

  if (salonesList) {
    salonesList.forEach((s) => {
      select.innerHTML += `<option value="${s.codigo}">${s.codigo}</option>`;
    });
  }
}

// Cargar catálogo de departamentos (Superusuarios)
async function cargarSelectDepartamentos() {
  const select = document.getElementById("select-departamento");
  if (!select) return;

  const { data: deptoList, error } = await supabaseConn
    .from("departamentos")
    .select("id, nombre");

  if (!error && deptoList) {
    select.innerHTML = "";
    deptoList.forEach((d) => {
      select.innerHTML += `<option value="${d.id}">${d.nombre}</option>`;
    });
  }
}

// Cargar la lista de publicaciones
async function cargarPublicaciones() {
  const tbody = document.getElementById("tabla-publicaciones");
  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan='5'>Cargando...</td></tr>";

  let query = supabaseConn
    .from("publicaciones")
    .select("*")
    .order("fecha_publicacion", { ascending: false });

  if (usuarioActual.rol !== "superusuario") {
    query = query.eq("departamento_id", usuarioActual.departamento_id);
  }

  const { data, error } = await query;

  if (error) {
    tbody.innerHTML = `<tr><td colspan='5'>Error: ${error.message}</td></tr>`;
    return;
  }

  if (!data || data.length === 0) {
    tbody.innerHTML =
      "<tr><td colspan='5'>No hay publicaciones registradas.</td></tr>";
    return;
  }

  listaPublicaciones = data;
  tbody.innerHTML = "";

  data.forEach((pub) => {
    const fechaIni = pub.fecha_inicio
      ? new Date(pub.fecha_inicio).toLocaleString("es-MX", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "N/A";

    tbody.innerHTML += `
      <tr>
        <td><strong>${pub.titulo}</strong></td>
        <td>${pub.tipo}</td>
        <td>${fechaIni}</td>
        <td>${pub.lugar_evento || "N/A"}</td>
        <td style="white-space: nowrap;">
          <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.8rem; width: auto;" onclick="prepararEdicion(${pub.id})">Editar</button>
          <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.8rem; width: auto;" onclick="eliminarPublicacion(${pub.id})">Eliminar</button>
        </td>
      </tr>
    `;
  });
}

// Guardar/Actualizar con el esquema exacto de la DB
async function guardarPublicacion() {
  const titulo = document.getElementById("titulo").value.trim();
  const contenido = document.getElementById("contenido").value.trim();
  const tipo = document.getElementById("tipo-pub").value;
  const fechaInicio = document.getElementById("fecha-inicio").value;
  const lugar = document.getElementById("lugar").value;

  if (!titulo || !contenido) {
    alert("El título y contenido son obligatorios.");
    return;
  }

  let deptoId = usuarioActual.departamento_id;
  if (usuarioActual.rol === "superusuario") {
    deptoId = document.getElementById("select-departamento").value;
  }

  const datosPayload = {
    titulo: titulo,
    contenido: contenido,
    tipo: tipo,
    fecha_inicio: fechaInicio ? new Date(fechaInicio).toISOString() : null,
    lugar_evento: lugar,
    departamento_id: deptoId,
    usuario_id: usuarioActual.uid,
  };

  let error = null;

  if (publicacionEditandoId) {
    // UPDATE
    const res = await supabaseConn
      .from("publicaciones")
      .update(datosPayload)
      .eq("id", publicacionEditandoId);
    error = res.error;
  } else {
    // INSERT
    const res = await supabaseConn.from("publicaciones").insert([datosPayload]);
    error = res.error;
  }

  if (error) {
    alert("Error al guardar: " + error.message);
  } else {
    alert(
      publicacionEditandoId
        ? "Publicación actualizada correctamente"
        : "Publicación creada con éxito",
    );
    cancelarEdicion();
    await cargarPublicaciones();
  }
}

// Cargar datos en el formulario para modificar
function prepararEdicion(id) {
  const pub = listaPublicaciones.find((p) => p.id === id);
  if (!pub) return;

  publicacionEditandoId = id;

  document.getElementById("form-titulo").textContent = "Editar Publicación";
  document.getElementById("btn-publicar").textContent =
    "Actualizar Publicación";
  document.getElementById("btn-cancelar").style.display = "inline-block";

  document.getElementById("titulo").value = pub.titulo || "";
  document.getElementById("contenido").value = pub.contenido || "";
  document.getElementById("tipo-pub").value = pub.tipo || "Aviso";
  document.getElementById("lugar").value = pub.lugar_evento || "";

  if (pub.fecha_inicio) {
    const fecha = new Date(pub.fecha_inicio);
    fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
    document.getElementById("fecha-inicio").value = fecha
      .toISOString()
      .slice(0, 16);
  } else {
    document.getElementById("fecha-inicio").value = "";
  }

  if (usuarioActual.rol === "superusuario" && pub.departamento_id) {
    document.getElementById("select-departamento").value = pub.departamento_id;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Limpiar formulario
function cancelarEdicion() {
  publicacionEditandoId = null;
  document.getElementById("form-titulo").textContent =
    "Crear Nueva Publicación";
  document.getElementById("btn-publicar").textContent = "Guardar Publicación";
  document.getElementById("btn-cancelar").style.display = "none";

  document.getElementById("titulo").value = "";
  document.getElementById("contenido").value = "";
  document.getElementById("tipo-pub").value = "Aviso";
  document.getElementById("fecha-inicio").value = "";
  document.getElementById("lugar").value = "";
}

// Eliminar registro
async function eliminarPublicacion(id) {
  if (!confirm("¿Seguro que deseas eliminar esta publicación?")) return;

  const { error } = await supabaseConn
    .from("publicaciones")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Error al eliminar: " + error.message);
  } else {
    if (publicacionEditandoId === id) cancelarEdicion();
    await cargarPublicaciones();
  }
}

// Cerrar Sesión
async function cerrarSesion() {
  await supabaseConn.auth.signOut();
  window.location.replace("login.html");
}
