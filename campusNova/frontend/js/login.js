// Conexión con la DB
const BASE_URL = CONFIG.SUPABASE_URL;
const BASE_ANON_KEY = CONFIG.SUPABASE_ANON_KEY;
const supabaseConn = window.supabase.createClient(BASE_URL, BASE_ANON_KEY);

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

    // Estado de carga: evita envíos dobles mientras se valida
    const btn = document.getElementById("btn-ingresar");
    const textoBtn = btn ? btn.textContent : "";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Ingresando...';
    }

    const { data, error } = await supabaseConn.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      if (btn) {
        btn.disabled = false;
        btn.textContent = textoBtn;
      }
      if (errorMsg) {
        errorMsg.textContent = "Credenciales incorrectas";
        errorMsg.style.display = "flex";
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

  // 5. Mostrar / ocultar contraseña
  const btnVer = document.getElementById("toggle-pass");
  if (btnVer && inputPass) {
    btnVer.addEventListener("click", () => {
      const visible = inputPass.type === "text";
      inputPass.type = visible ? "password" : "text";
      btnVer.setAttribute("aria-pressed", String(!visible));
      btnVer.setAttribute("aria-label", visible ? "Mostrar contraseña" : "Ocultar contraseña");
      btnVer.innerHTML = NC.icon(visible ? "eye" : "eye-off");
    });
  }
});
