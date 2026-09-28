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
    // Si ya está logueado, lo mandamos directo al Dashboard
    window.location.href = "dashboard.html";
    return;
  }

  // 2. Si NO hay sesión, escuchamos el evento del botón de login
  const btnIngresar = document.getElementById("btn-ingresar");

  if (btnIngresar) {
    btnIngresar.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = document.getElementById("user").value;
      const password = document.getElementById("pass").value;

      const { data, error } = await supabaseConn.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        const errorMsg = document.getElementById("error-msg");
        errorMsg.textContent = "Credenciales incorrectas";
        errorMsg.style.display = "block";
      } else {
        window.location.href = "dashboard.html";
      }
    });
    //enter
    // 2. Si NO hay sesión, escuchamos el evento del botón de login
  const entIngresar = document.getElementById("pass");

  if (entIngresar) {
    entIngresar.addEventListener("input", async (e) => {
      e.preventDefault();
      const email = document.getElementById("user").value;
      const password = document.getElementById("pass").value;

      const { data, error } = await supabaseConn.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        const errorMsg = document.getElementById("error-msg");
        errorMsg.textContent = "Credenciales incorrectas";
        errorMsg.style.display = "block";
      } else {
        window.location.href = "dashboard.html";
      }
    });
  }
});

//Evento de entrar en la sesión
document.addEventListener("DOMContentLoaded", () => {
  const btnIngresar = document.getElementById("btn-ingresar");

  if (btnIngresar) {
    btnIngresar.addEventListener("click", async (e) => {
      e.preventDefault();
      const email = document.getElementById("user").value;
      const password = document.getElementById("pass").value;

      const { data, error } = await supabaseConn.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        const errorMsg = document.getElementById("error-msg");
        errorMsg.textContent = "Credenciales incorrectas";
        errorMsg.style.display = "block";
      } else {
        window.location.href = "dashboard.html";
      }
    });
  }
});
