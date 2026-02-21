/**
 * storage.js - Módulo de almacenamiento persistente
 * 
 * Concepto clave: Node.js puede leer y escribir archivos con el módulo 'fs'.
 * Usamos JSON como "base de datos" simple guardada en un archivo local.
 * 
 * Aprenderás:
 * - fs.readFileSync / fs.writeFileSync (operaciones síncronas de archivo)
 * - fs.existsSync (comprobar si un archivo existe)
 * - JSON.parse / JSON.stringify (serialización de datos)
 * - path.join (construir rutas de forma segura entre SO)
 * - Patrón módulo: exportar funciones reutilizables
 */

const fs = require('fs');
const path = require('path');

// Ruta al archivo donde se guardan las tareas
// __dirname = directorio donde está ESTE archivo
// path.join construye la ruta correcta para cualquier SO (Windows, Mac, Linux)
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');


/**
 * Asegura que el directorio 'data/' existe
 * Si no existe, lo crea con { recursive: true }
 */
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Lee todas las tareas del archivo JSON
 * Si el archivo no existe, devuelve un array vacío
 * 
 * @returns {Array} Array de objetos tarea
 */
function loadTasks() {
  ensureDataDir();

  // Si el archivo no existe todavía, devolvemos array vacío
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }

  try {
    // Leemos el archivo como texto (utf-8) y lo parseamos a objeto JS
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Si el JSON está corrupto, empezamos de cero
    console.error('⚠️  Error leyendo tasks.json, creando archivo nuevo.');
    return [];
  }
}


/**
 * Guarda el array de tareas en el archivo JSON
 * 
 * JSON.stringify con 2 espacios de indentación para que sea legible
 * 
 * @param {Array} tasks - Array de objetos tarea
 */
function saveTasks(tasks) {
  ensureDataDir();

  // null = sin replacer, 2 = indentación de 2 espacios (legible)
  const data = JSON.stringify(tasks, null, 2);
  fs.writeFileSync(DATA_FILE, data, 'utf-8');
}

/**
 * Obtiene el siguiente ID disponible
 * Busca el ID más alto existente y suma 1
 * 
 * @param {Array} tasks - Array de tareas actuales
 * @returns {number} Siguiente ID
 */
function getNextId(tasks) {
  if (tasks.length === 0) return 1;
  
  // Math.max con spread operator para encontrar el ID máximo
  const maxId = Math.max(...tasks.map(task => task.id));
  return maxId + 1;
}

// Exportamos las funciones para usarlas en otros módulos
// Patrón CommonJS: module.exports
module.exports = {
  loadTasks,
  saveTasks,
  getNextId
};
