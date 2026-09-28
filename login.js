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

  // 2. Función reutilizable para procesar el Login
  const realizarLogin = async () => {
    const emailInput = document.getElementById("user");
    const passwordInput = document.getElementById("pass");
    const errorMsg = document.getElementById("error-msg");

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    // Ocultar mensaje de error previo si existe
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

  // 3. Listener para el botón "Ingresar"
  const btnIngresar = document.getElementById("btn-ingresar");
  if (btnIngresar) {
    btnIngresar.addEventListener("click", (e) => {
      e.preventDefault();
      realizarLogin();
    });
  }

  // 4. Listener para la tecla Enter en los inputs
  const inputUser = document.getElementById("user");
  const inputPass = document.getElementById("pass");

  const manejarEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      realizarLogin();
    }
  };

  if (inputUser) inputUser.addEventListener("keydown", manejarEnter);
  if (inputPass) inputPass.addEventListener("keydown", manejarEnter);
});
