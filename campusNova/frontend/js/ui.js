/* ==========================================================================
   NOVACAMPUS · ui.js
   Componentes de interfaz compartidos (sin dependencias):
   - Sprite de iconos SVG          → NC.icon("nombre")
   - Encabezado y pie de página    → se pintan en #shell-header / #shell-footer
   - Menú hamburguesa y desplegable accesibles
   - Avisos (toast) y confirmación → NC.toast(), NC.confirm()
   - Escape de HTML                → NC.esc()
   Debe cargarse ANTES que el script de cada página.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Iconos (estilo Lucide, trazo 2, viewBox 24) ---------- */
  const P = (d) => `<path d="${d}"/>`;
  const ICONS = {
    search: '<circle cx="11" cy="11" r="8"/>' + P("m21 21-4.3-4.3"),
    menu: P("M4 6h16M4 12h16M4 18h16"),
    x: P("M18 6 6 18M6 6l12 12"),
    "chevron-down": P("m6 9 6 6 6-6"),
    "chevron-left": P("m15 18-6-6 6-6"),
    "chevron-right": P("m9 18 6-6-6-6"),
    "arrow-right": P("M5 12h14m-7-7 7 7-7 7"),
    "arrow-left": P("m12 19-7-7 7-7M19 12H5"),
    "map-pin": P("M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z") + '<circle cx="12" cy="10" r="3"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/>' + P("M16 2v4M8 2v4M3 10h18"),
    clock: '<circle cx="12" cy="12" r="10"/>' + P("M12 6v6l4 2"),
    map: '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>' + P("M9 3v15M15 6v15"),
    home: P("M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z") + '<polyline points="9 22 9 12 15 12 15 22"/>',
    "file-text": P("M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z") + P("M14 2v6h6M16 13H8M16 17H8M10 9H8"),
    users: P("M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2") + '<circle cx="9" cy="7" r="4"/>' + P("M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"),
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    globe: '<circle cx="12" cy="12" r="10"/>' + P("M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"),
    link: P("M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"),
    bell: P("M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"),
    newspaper: P("M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"),
    "log-out": P("M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"),
    pencil: P("M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"),
    trash: P("M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"),
    eye: P("M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z") + '<circle cx="12" cy="12" r="3"/>',
    "eye-off": P("M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"),
    plus: P("M12 5v14M5 12h14"),
    check: P("M20 6 9 17l-5-5"),
    "check-circle": P("M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3"),
    "alert-circle": '<circle cx="12" cy="12" r="10"/>' + P("M12 8v4M12 16h.01"),
    info: '<circle cx="12" cy="12" r="10"/>' + P("M12 16v-4M12 8h.01"),
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/>' + P("M7 11V7a5 5 0 0 1 10 0v4"),
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/>' + P("m22 7-10 7L2 7"),
    layers: P("m12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5"),
    building: P("M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18ZM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4"),
    inbox: P("M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"),
    "graduation-cap": P("M22 10 12 5 2 10l10 5 10-5zM6 12v5c3 2 9 2 12 0v-5M22 10v6"),
    shield: P("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"),
    home2: P("M3 12 12 3l9 9M5 10v10h14V10"),
  };

  function icon(name, extraClass) {
    return (
      '<svg class="icon' + (extraClass ? " " + extraClass : "") +
      '" aria-hidden="true" focusable="false"><use href="#i-' + name + '"></use></svg>'
    );
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function injectSprite() {
    if (document.getElementById("nc-sprite")) return;
    const symbols = Object.keys(ICONS)
      .map(
        (k) =>
          '<symbol id="i-' + k + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
          'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + ICONS[k] + "</symbol>"
      )
      .join("");
    const wrap = document.createElement("div");
    wrap.innerHTML =
      '<svg id="nc-sprite" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>' +
      symbols + "</defs></svg>";
    document.body.insertBefore(wrap.firstChild, document.body.firstChild);
  }

  /* ---------- Departamentos (enlaces del menú) ---------- */
  const DEPARTAMENTOS = [
    { nombre: "Servicios escolares", icono: "file-text", desc: "Trámites, inscripciones y constancias" },
    { nombre: "Actividades Extraescolares", icono: "users", desc: "Deportes, cultura y talleres" },
    { nombre: "Eventos", icono: "star", desc: "Congresos, ferias y ceremonias" },
    { nombre: "Lengua extranjera", icono: "globe", desc: "Idiomas y certificaciones" },
    { nombre: "Vinculación", icono: "link", desc: "Empresas, residencias y servicio social" },
  ];

  function deptoHref(nombre) {
    return "modulo.html?departamento=" + encodeURIComponent(nombre);
  }

  /* ---------- Encabezado ---------- */
  function renderHeader(host) {
    const body = document.body;
    const page = body.dataset.page || "";
    const searchId = body.dataset.searchId || "input-busqueda";
    const placeholder = "Buscar en el portal y presiona Enter...";
    const params = new URLSearchParams(window.location.search);
    const enDepto = page === "modulo" && params.has("departamento");
    const cur = (cond) => (cond ? ' aria-current="page"' : "");

    host.outerHTML =
      '<a class="skip-link" href="#contenido">Saltar al contenido</a>' +
      '<header class="site-header">' +
      '<div class="container bar">' +
      '<a class="brand" href="index.html" aria-label="NOVACAMPUS, ir al inicio">' +
      '<span class="brand-mark"><img src="img/logo-mark.png" alt="" width="28" height="28"></span>' +
      '<span class="brand-text"><strong>NOVACAMPUS</strong><small>Portal Institucional de Asistencia</small></span>' +
      "</a>" +
      '<button type="button" class="menu-toggle" id="menu-toggle" aria-expanded="false" aria-controls="menu-principal" aria-label="Abrir menú">' +
      icon("menu", "i-open") + icon("x", "i-close") +
      "</button>" +
      '<div class="header-panel" id="menu-principal">' +
      '<nav aria-label="Navegación principal"><ul class="nav-menu">' +
      '<li><a href="index.html"' + cur(page === "inicio") + ">" + icon("home") + "Inicio</a></li>" +
      '<li class="has-dropdown' + (enDepto ? " is-current" : "") + '">' +
      '<button type="button" class="nav-trigger" aria-expanded="false" aria-haspopup="true">' +
      icon("layers") + 'Departamentos ' + icon("chevron-down", "caret") + "</button>" +
      '<ul class="dropdown">' +
      DEPARTAMENTOS.map(
        (d) =>
          '<li><a href="' + deptoHref(d.nombre) + '">' +
          '<span class="dd-icon">' + icon(d.icono) + "</span>" +
          '<span><strong>' + esc(d.nombre) + "</strong><small>" + esc(d.desc) + "</small></span></a></li>"
      ).join("") +
      "</ul></li>" +
      '<li><a href="mapa.html"' + cur(page === "mapa") + ">" + icon("map") + "Mapa interactivo</a></li>" +
      '<li><a href="calendario.html"' + cur(page === "calendario") + ">" + icon("calendar") + "Calendario</a></li>" +
      "</ul></nav>" +
      '<div class="search-bar" role="search">' + icon("search") +
      '<input type="search" id="' + esc(searchId) + '" placeholder="' + placeholder +
      '" aria-label="Buscar en el portal" autocomplete="off"></div>' +
      "</div></div></header>";
  }

  /* ---------- Pie de página ---------- */
  function renderFooter(host) {
    host.outerHTML =
      '<footer class="site-footer"><div class="container">' +
      '<div class="footer-grid">' +
      '<div class="footer-brand">' +
      '<a class="brand brand--light" href="index.html"><span class="brand-mark"><img src="img/logo-mark.png" alt="" width="28" height="28"></span>' +
      '<span class="brand-text"><strong>NOVACAMPUS</strong><small>Portal Institucional de Asistencia</small></span></a>' +
      "<p>Avisos, eventos y servicios de la comunidad universitaria en un solo lugar.</p></div>" +
      '<div><h4>Departamentos</h4><ul>' +
      DEPARTAMENTOS.map((d) => '<li><a href="' + deptoHref(d.nombre) + '">' + esc(d.nombre) + "</a></li>").join("") +
      "</ul></div>" +
      '<div><h4>Explora</h4><ul>' +
      '<li><a href="index.html">Inicio</a></li><li><a href="mapa.html">Mapa interactivo</a></li>' +
      '<li><a href="calendario.html">Calendario</a></li></ul></div>' +
      "</div>" +
      '<div class="footer-bottom">' +
      '<p><a href="login.html" class="footer-copy" aria-label="Acceso administrativo">©</a> 2026 Universidad. Todos los derechos reservados.</p>' +
      '<a class="footer-admin" href="login.html">' + icon("lock") + "Acceso administrativo</a>" +
      "</div></div></footer>";
  }

  /* ---------- Menú móvil y desplegable ---------- */
  function wireNavigation() {
    const toggle = document.getElementById("menu-toggle");
    const panel = document.getElementById("menu-principal");
    if (!toggle || !panel) return;

    const desktop = window.matchMedia("(min-width: 961px)");
    const dd = panel.querySelector(".has-dropdown");
    const trigger = dd && dd.querySelector(".nav-trigger");

    const setMenu = (open) => {
      panel.classList.toggle("mostrar", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      document.body.classList.toggle("menu-abierto", open && !desktop.matches);
    };
    const setDropdown = (open) => {
      if (!dd) return;
      dd.classList.toggle("abierto", open);
      trigger.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => setMenu(!panel.classList.contains("mostrar")));
    if (trigger) {
      trigger.addEventListener("click", () => setDropdown(!dd.classList.contains("abierto")));
      dd.addEventListener("mouseenter", () => desktop.matches && setDropdown(true));
      dd.addEventListener("mouseleave", () => desktop.matches && setDropdown(false));
      dd.addEventListener("focusout", (e) => {
        if (desktop.matches && !dd.contains(e.relatedTarget)) setDropdown(false);
      });
    }
    document.addEventListener("click", (e) => {
      if (dd && !dd.contains(e.target)) setDropdown(false);
      if (!desktop.matches && !panel.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (dd && dd.classList.contains("abierto")) { setDropdown(false); trigger.focus(); }
      else if (panel.classList.contains("mostrar")) { setMenu(false); toggle.focus(); }
    });
    desktop.addEventListener("change", () => { setMenu(false); setDropdown(false); });

    // Sombra del encabezado al hacer scroll
    const header = document.querySelector(".site-header");
    const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Avisos (toast) ---------- */
  function toast(message, type) {
    type = type || "info";
    let region = document.getElementById("toast-region");
    if (!region) {
      region = document.createElement("div");
      region.id = "toast-region";
      region.className = "toast-region";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    const names = { success: "check-circle", error: "alert-circle", info: "info" };
    const el = document.createElement("div");
    el.className = "toast toast--" + type;
    el.innerHTML = icon(names[type] || "info") + "<span>" + esc(message) + "</span>";
    region.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-leaving");
      setTimeout(() => el.remove(), 300);
    }, type === "error" ? 6000 : 3800);
  }

  /* ---------- Confirmación (reemplaza window.confirm) ---------- */
  function confirmDialog(opts) {
    opts = opts || {};
    if (typeof HTMLDialogElement !== "function") {
      return Promise.resolve(window.confirm(opts.message || "¿Continuar?"));
    }
    return new Promise((resolve) => {
      const dlg = document.createElement("dialog");
      dlg.className = "modal";
      dlg.setAttribute("aria-labelledby", "modal-title");
      dlg.innerHTML =
        '<div class="modal-body">' +
        '<span class="modal-icon' + (opts.danger ? " is-danger" : "") + '">' + icon(opts.danger ? "trash" : "info") + "</span>" +
        '<h3 id="modal-title">' + esc(opts.title || "Confirmar acción") + "</h3>" +
        "<p>" + esc(opts.message || "") + "</p></div>" +
        '<div class="modal-actions">' +
        '<button type="button" class="btn btn-ghost" data-r="0">' + esc(opts.cancelText || "Cancelar") + "</button>" +
        '<button type="button" class="btn ' + (opts.danger ? "btn-solid-danger" : "btn-primary") + '" data-r="1">' +
        esc(opts.confirmText || "Aceptar") + "</button></div>";
      document.body.appendChild(dlg);
      let result = false;
      dlg.addEventListener("click", (e) => {
        const b = e.target.closest("[data-r]");
        if (b) { result = b.dataset.r === "1"; dlg.close(); }
        else if (e.target === dlg) dlg.close();
      });
      dlg.addEventListener("close", () => { dlg.remove(); resolve(result); });
      dlg.showModal();
      dlg.querySelector('[data-r="0"]').focus();
    });
  }

  window.NC = { icon, esc, toast, confirm: confirmDialog, departamentos: DEPARTAMENTOS };

  /* ---------- Arranque ---------- */
  function init() {
    injectSprite();
    const h = document.getElementById("shell-header");
    const f = document.getElementById("shell-footer");
    if (h) renderHeader(h);
    if (f) renderFooter(f);
    wireNavigation();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
