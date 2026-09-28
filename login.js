// Conexión con la DB
const supabaseUrl = "https://pjuabhjyxekejoqfwxpt.supabase.co";
const supabaseKey = "sb_publishable_6A8SA8l_ryXomSoo2N66bg_CB5A9YKd";
const supabaseConn = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Verificar si YA existe una sesión activa
  const {
    data: { session },
  } = await supabaseConn.auth.getSession();

  if (session) {
    // Si ya está logueado, redirigir al Dashboard
    window.location.href = "dashboard.html";
    return;
  }

  // Función reutilizable para iniciar sesión
  const ejecutarLogin = async () => {
    const email = document.getElementById("user").value.trim();
    const password = document.getElementById("pass").value;
    const errorMsg = document.getElementById("error-msg");

    // Ocultar mensaje previo si existe
    if (errorMsg) errorMsg.style.display = "none";

    const { data, error } = await supabaseConn.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      if (errorMsg) {
        errorMsg.textContent = "Credenciales incorrectas";
        errorMsg.style.display = "block";
      }
    } else {
      window.location.href = "dashboard.html";
    }
  };

  // 2. Evento Click en el Botón de Ingresar
  const btnIngresar = document.getElementById("btn-ingresar");
  if (btnIngresar) {
    btnIngresar.addEventListener("click", (e) => {
      e.preventDefault();
      ejecutarLogin();
    });
  }

  // 3. Evento Enter en los inputs (Usuario y Contraseña)
  const inputPass = document.getElementById("pass");
  const inputUser = document.getElementById("user");

  const manejarEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      ejecutarLogin();
    }
  };

  if (inputPass) inputPass.addEventListener("keydown", manejarEnter);
  if (inputUser) inputUser.addEventListener("keydown", manejarEnter);
});
