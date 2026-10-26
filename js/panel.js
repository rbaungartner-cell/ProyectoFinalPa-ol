// Interfaz del pañol. Los datos de ejemplo están en datos.js.
// Todo se guarda en variables: al recargar la página vuelven los datos de ejemplo.

var carrito = [];          // herramientas del préstamo que se está armando
var accion = null;         // acción abierta en el inventario, ej: { tipo: "reponer", id: 3 }
var siguientePrestamo = 1;

// ---------- Funciones auxiliares ----------

function buscar(id) {
  for (var i = 0; i < herramientas.length; i++) {
    if (herramientas[i].id == id) return herramientas[i];
  }
}

function pocoStock(h) { return h.disponible <= h.minimo; }
function valor(id) { return document.getElementById(id).value; }
function mensaje(texto) { document.getElementById("mensaje").textContent = texto; }
function fecha(f) { return new Date(f).toLocaleString("es-AR"); }

function etiqueta(texto, color) { return "<span class='etiqueta " + color + "'>" + texto + "</span>"; }
function boton(texto, onclick, clase) { return "<button class='" + clase + "' onclick=\"" + onclick + "\">" + texto + "</button>"; }

// Arma las <option> de un select a partir de una lista
function opciones(lista, elegido) {
  var html = "";
  for (var i = 0; i < lista.length; i++) {
    html += "<option" + (lista[i] == elegido ? " selected" : "") + ">" + lista[i] + "</option>";
  }
  return html;
}

// Arma una tabla: titulos es una lista de textos y filas es una lista de listas
function tabla(titulos, filas) {
  var html = "<table><tr>";
  for (var i = 0; i < titulos.length; i++) html += "<th>" + titulos[i] + "</th>";
  html += "</tr>";
  for (var j = 0; j < filas.length; j++) {
    html += "<tr>";
    for (var k = 0; k < filas[j].length; k++) html += "<td>" + filas[j][k] + "</td>";
    html += "</tr>";
  }
  return html + "</table>";
}

// Guarda un movimiento (tabla Movimiento_stock)
function mover(tipo, herramienta, cantidad, profesor, detalle) {
  movimientos.unshift({ fecha: new Date(), tipo: tipo, herramienta: herramienta, cantidad: cantidad, profesor: profesor, detalle: detalle });
}

function vencidos() {
  var cuenta = 0;
  for (var i = 0; i < prestamos.length; i++) {
    if (prestamos[i].estado == "Activo" && prestamos[i].limite < new Date()) cuenta++;
  }
  return cuenta;
}

// Numeritos rojos del menú
function ponerAviso(nombre, cantidad) {
  var el = document.getElementById("aviso-" + nombre);
  el.textContent = cantidad;
  el.classList.toggle("visible", cantidad > 0);
}

// ---------- Menú ----------

function mostrarSeccion(nombre) {
  var botones = document.querySelectorAll(".menu-superior button");
  for (var i = 0; i < botones.length; i++) {
    botones[i].classList.toggle("activo", botones[i].dataset.seccion == nombre);
  }
  if (nombre != "inventario") accion = null;

  var vistas = { prestamos: vistaPrestamos, inventario: vistaInventario, historial: vistaHistorial, personal: vistaPersonal };
  document.getElementById("contenido").innerHTML = vistas[nombre]();

  if (nombre == "prestamos") dibujarCarrito();
  ponerAviso("prestamos", vencidos());
  ponerAviso("inventario", herramientas.filter(pocoStock).length);
}

// ---------- Préstamos ----------

function dato(texto, numero, alerta) {
  return "<div class='dato" + (alerta ? " alerta" : "") + "'><span>" + texto + "</span><strong>" + numero + "</strong></div>";
}

function vistaPrestamos() {
  var activos = prestamos.filter(function (p) { return p.estado == "Activo"; });
  var html = "<h2>Préstamos</h2><div class='resumen'>";
  html += dato("Prestados ahora", activos.length, false);
  html += dato("Vencidos", vencidos(), vencidos() > 0);
  html += dato("Para reponer", herramientas.filter(pocoStock).length, herramientas.some(pocoStock));
  html += "</div><div class='dos-columnas'>";

  // Formulario de nuevo préstamo
  html += "<div class='tarjeta'><h3>Nuevo préstamo</h3><div class='fila'>";
  html += "<label>Profesor responsable<select id='profesor'><option value=''>Elegir...</option>" + opciones(profesores) + "</select></label>";
  html += "<label>Devolución límite<input type='datetime-local' id='limite'></label></div>";
  html += "<div class='fila fila-herramienta'><label>Herramienta<select id='herramienta'>";
  for (var i = 0; i < herramientas.length; i++) {
    html += "<option value='" + herramientas[i].id + "'>" + herramientas[i].nombre + " (" + herramientas[i].disponible + " disp.)</option>";
  }
  html += "</select></label><label>Cantidad<input type='number' id='cantidad' min='1' value='1'></label>";
  html += boton("Agregar", "agregar()", "btn secundario") + "</div>";
  html += "<div id='lista'></div><p>" + boton("Confirmar préstamo", "confirmar()", "btn") + "</p><p id='mensaje' class='vacio'></p></div>";

  // Préstamos que están activos
  html += "<div class='tarjeta'><h3>Prestadas ahora</h3>";
  for (var j = 0; j < activos.length; j++) {
    var p = activos[j], vencido = p.limite < new Date();
    html += "<div class='prestamo" + (vencido ? " vencido" : "") + "'><strong>" + p.profesor + "</strong> " + etiqueta(vencido ? "Vencido" : "Activo", vencido ? "roja" : "verde");
    html += "<br><small>Retiró " + fecha(p.fecha) + " · Límite " + fecha(p.limite) + "</small><ul>";
    for (var k = 0; k < p.detalle.length; k++) html += "<li>" + buscar(p.detalle[k].herramienta).nombre + " x " + p.detalle[k].cantidad + "</li>";
    html += "</ul><select id='res_" + p.id + "'><option value='bien'>Vuelve bien</option><option value='rota'>Vuelve rota</option></select> ";
    html += boton("Registrar devolución", "devolver(" + p.id + ")", "btn") + "</div>";
  }
  if (activos.length == 0) html += "<p class='vacio'>No hay herramientas prestadas.</p>";
  return html + "</div></div>";
}

function agregar() {
  var h = buscar(valor("herramienta")), cantidad = parseInt(valor("cantidad"));
  if (!(cantidad >= 1) || cantidad > h.disponible) { mensaje("Solo hay " + h.disponible + " disponibles de " + h.nombre + "."); return; }
  carrito.push({ herramienta: h.id, cantidad: cantidad });
  mensaje("");
  dibujarCarrito();
}

function quitar(posicion) {
  carrito.splice(posicion, 1);
  dibujarCarrito();
}

function dibujarCarrito() {
  var filas = [];
  for (var i = 0; i < carrito.length; i++) {
    filas.push([buscar(carrito[i].herramienta).nombre, carrito[i].cantidad, boton("Quitar", "quitar(" + i + ")", "enlace")]);
  }
  document.getElementById("lista").innerHTML = carrito.length ? tabla(["Herramienta", "Cant.", ""], filas) : "<p class='vacio'>Todavía no agregaste herramientas.</p>";
}

function confirmar() {
  if (valor("profesor") == "" || valor("limite") == "") { mensaje("Elegí el profesor y la fecha límite."); return; }
  if (carrito.length == 0) { mensaje("Agregá al menos una herramienta."); return; }

  var p = { id: siguientePrestamo++, profesor: valor("profesor"), fecha: new Date(), limite: new Date(valor("limite")), estado: "Activo", detalle: carrito };
  for (var i = 0; i < carrito.length; i++) {
    var h = buscar(carrito[i].herramienta);
    h.disponible -= carrito[i].cantidad;
    mover("Egreso", h.nombre, carrito[i].cantidad, p.profesor, "Préstamo #" + p.id);
  }
  prestamos.push(p);
  carrito = [];
  mostrarSeccion("prestamos");
}

function devolver(id) {
  var p = prestamos.filter(function (x) { return x.id == id; })[0];
  var rota = valor("res_" + id) == "rota";
  for (var i = 0; i < p.detalle.length; i++) {
    var h = buscar(p.detalle[i].herramienta), c = p.detalle[i].cantidad;
    if (rota) h.enReparacion += c; else h.disponible += c;
    mover("Ingreso", h.nombre, c, p.profesor, (rota ? "Devuelta rota #" : "Devolución #") + p.id);
  }
  p.estado = "Finalizado";
  mostrarSeccion("prestamos");
}

// ---------- Inventario ----------

function vistaInventario() {
  var filas = [];
  for (var i = 0; i < herramientas.length; i++) {
    var h = herramientas[i], id = h.id;
    filas.push([h.nombre, h.categoria, h.ubicacion, h.disponible + " / " + h.total, h.enReparacion, h.minimo,
      pocoStock(h) ? etiqueta("Bajo stock", "roja") : etiqueta("Normal", "verde"),
      boton("Reponer", "abrir('reponer', " + id + ")", "mini") + boton("Reparación", "abrir('reparacion', " + id + ")", "mini") +
      boton("Dar de baja", "abrir('baja', " + id + ")", "mini") + boton("Eliminar", "abrir('eliminar', " + id + ")", "mini peligro")]);
  }
  var equipos = [];
  for (var j = 0; j < ejemplares.length; j++) {
    equipos.push([ejemplares[j].nombre, "<select>" + opciones(estados, ejemplares[j].estado) + "</select>"]);
  }
  return "<h2>Inventario</h2><p>" + boton("+ Agregar herramienta", "abrir('agregar', 0)", "btn") + "</p>" + formulario() +
    "<div class='tarjeta'>" + tabla(["Herramienta", "Categoría", "Ubicación", "Disp. / Total", "En reparación", "Mínimo", "Stock", "Acciones"], filas) + "</div>" +
    "<div class='tarjeta'><h3>Equipos individuales (eléctricos)</h3>" + tabla(["Equipo", "Estado"], equipos) + "</div>";
}

function abrir(tipo, id) {
  accion = { tipo: tipo, id: id };
  mostrarSeccion("inventario");
  window.scrollTo(0, 0);
}

// Tarjeta con el formulario de la acción elegida
function formulario() {
  if (!accion) return "";
  var t = accion.tipo, h = buscar(accion.id);
  var titulos = { agregar: "Agregar herramienta", reponer: "Reponer", reparacion: "Enviar a reparación", baja: "Dar de baja", eliminar: "Eliminar" };
  var html = "<div class='tarjeta accion'><h3>" + titulos[t] + (h ? ": " + h.nombre : "") + "</h3>";
  if (t == "agregar") {
    html += "<div class='fila'><label>Nombre<input id='nombre'></label><label>Categoría<input id='categoria'></label>";
    html += "<label>Ubicación<select id='ubicacion'>" + opciones(["Panel 1", "Panel 2", "Panel 3", "Panel 4"]) + "</select></label></div>";
  }
  if (t == "eliminar") html += "<p class='vacio'>La herramienta deja de aparecer en la lista. Los movimientos viejos quedan en el historial.</p>";
  else html += "<div class='fila'><label>Cantidad<input type='number' id='cantidad' min='1' value='1'></label></div>";
  return html + boton("Confirmar", "confirmarAccion()", "btn") + " " + boton("Cancelar", "abrir(null, 0)", "btn secundario") + "<p id='mensaje' class='vacio'></p></div>";
}

function confirmarAccion() {
  var t = accion.tipo, h = buscar(accion.id), c = (t == "eliminar") ? 0 : parseInt(valor("cantidad"));
  if (t != "eliminar" && !(c >= 1)) { mensaje("Ingresá una cantidad válida."); return; }
  if ((t == "reparacion" || t == "baja") && c > h.disponible) { mensaje("Solo hay " + h.disponible + " disponibles."); return; }

  if (t == "agregar") {
    if (valor("nombre") == "") { mensaje("Falta el nombre."); return; }
    herramientas.push({ id: Date.now(), nombre: valor("nombre"), categoria: valor("categoria"), total: c, disponible: c, enReparacion: 0, minimo: 1, ubicacion: valor("ubicacion") });
    mover("Ingreso", valor("nombre"), c, "-", "Herramienta agregada");
  }
  if (t == "reponer") { h.disponible += c; h.total += c; mover("Ingreso", h.nombre, c, "-", "Reposición"); }
  if (t == "reparacion") { h.disponible -= c; h.enReparacion += c; mover("Ajuste", h.nombre, c, "-", "Enviada a reparación"); }
  if (t == "baja") { h.disponible -= c; h.total -= c; mover("Egreso", h.nombre, c, "-", "Baja"); }
  if (t == "eliminar") { herramientas.splice(herramientas.indexOf(h), 1); mover("Ajuste", h.nombre, h.total, "-", "Eliminada de la lista"); }

  abrir(null, 0);
}

// ---------- Historial ----------

function vistaHistorial() {
  var filas = [];
  for (var i = 0; i < movimientos.length; i++) {
    var m = movimientos[i];
    filas.push([fecha(m.fecha), etiqueta(m.tipo, ""), m.herramienta, m.cantidad, m.profesor, m.detalle]);
  }
  var contenido = filas.length ? tabla(["Fecha", "Movimiento", "Herramienta", "Cant.", "Profesor", "Detalle"], filas) : "<p class='vacio'>Todavía no hay movimientos.</p>";
  return "<h2>Historial</h2><div class='tarjeta'>" + contenido + "</div>";
}

// ---------- Personal ----------

function vistaPersonal() {
  var filas = [];
  for (var i = 0; i < personal.length; i++) {
    var p = personal[i];
    filas.push([p.nombre, p.dni || "-", p.turno, etiqueta(p.activo ? "Activo" : "Desactivado", p.activo ? "verde" : "roja"),
      boton(p.activo ? "Desactivar" : "Activar", "cambiarActivo(" + i + ")", "enlace")]);
  }
  return "<h2>Personal del pañol</h2><div class='dos-columnas'><div class='tarjeta'>" + tabla(["Nombre", "DNI", "Turno", "Estado", ""], filas) + "</div>" +
    "<div class='tarjeta'><h3>Agregar personal</h3><div class='fila'><label>Nombre<input id='nombre'></label><label>DNI<input id='dni' maxlength='8'></label>" +
    "<label>Turno<select id='turno'>" + opciones(["Mañana", "Tarde", "Noche"]) + "</select></label></div>" +
    boton("Agregar", "agregarPersonal()", "btn") + "<p id='mensaje' class='vacio'></p></div></div>";
}

function agregarPersonal() {
  if (valor("nombre") == "") { mensaje("Falta el nombre."); return; }
  personal.push({ nombre: valor("nombre"), dni: valor("dni"), turno: valor("turno"), activo: true });
  mostrarSeccion("personal");
}

// No se borra al personal: se desactiva, así el historial no se pierde
function cambiarActivo(posicion) {
  personal[posicion].activo = !personal[posicion].activo;
  mostrarSeccion("personal");
}

// ---------- Inicio ----------
document.getElementById("usuario").textContent = usuarioActual;
document.getElementById("inicial").textContent = usuarioActual.charAt(0);
mostrarSeccion("prestamos");
