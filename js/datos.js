// Datos de ejemplo para probar la interfaz.
// En el sistema final salen de la base de datos (MySQL).

var usuarioActual = "Administrador";

// Tabla Herramientas
var herramientas = [
  { id: 1, nombre: "Alicate",                categoria: "Manuales",    total: 20, disponible: 18, enReparacion: 0, minimo: 5,  ubicacion: "Panel 1" },
  { id: 2, nombre: "Destornillador Phillips", categoria: "Manuales",    total: 25, disponible: 22, enReparacion: 0, minimo: 6,  ubicacion: "Panel 1" },
  { id: 3, nombre: "Lima",                    categoria: "Manuales",    total: 18, disponible: 18, enReparacion: 0, minimo: 5,  ubicacion: "Panel 2" },
  { id: 4, nombre: "Llave francesa",          categoria: "Manuales",    total: 10, disponible: 9,  enReparacion: 0, minimo: 3,  ubicacion: "Panel 2" },
  { id: 5, nombre: "Escuadra",                categoria: "Medición",    total: 12, disponible: 12, enReparacion: 0, minimo: 4,  ubicacion: "Panel 3" },
  { id: 6, nombre: "Soldadora",               categoria: "Eléctricas",  total: 3,  disponible: 3,  enReparacion: 0, minimo: 2,  ubicacion: "Panel 4" },
  { id: 7, nombre: "Amoladora",               categoria: "Eléctricas",  total: 3,  disponible: 3,  enReparacion: 0, minimo: 2,  ubicacion: "Panel 4" },
  { id: 8, nombre: "Guantes (par)",           categoria: "Consumibles", total: 40, disponible: 12, enReparacion: 0, minimo: 15, ubicacion: "Panel 3" }
];

// Tabla Ejemplar_Individual (equipos que se identifican uno por uno)
var ejemplares = [
  { nombre: "Soldadora #1", estado: "Disponible" },
  { nombre: "Soldadora #2", estado: "Disponible" },
  { nombre: "Soldadora #3", estado: "Disponible" },
  { nombre: "Amoladora #1", estado: "Disponible" },
  { nombre: "Amoladora #2", estado: "Disponible" },
  { nombre: "Amoladora #3", estado: "Disponible" }
];
var estados = ["Disponible", "Prestada", "Faltante", "Fuera de servicio / en reparación", "Dada de baja"];

// Tabla Profesor
var profesores = ["García, Marcela", "Pérez, Julián", "Rossi, Carlos"];

// Tabla Usuario (personal del pañol)
var personal = [
  { nombre: "Administrador", dni: "", turno: "Mañana", activo: true }
];

// Tablas Prestamo y Movimiento_stock (arrancan vacías)
var prestamos = [];
var movimientos = [];
