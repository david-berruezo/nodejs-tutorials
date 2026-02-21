/**
 * taskManager.js - Lógica de negocio del gestor de tareas
 * 
 * Concepto clave: Separación de responsabilidades (SoC)
 * - storage.js → se encarga de leer/escribir archivos
 * - taskManager.js → se encarga de la lógica (crear, listar, completar, eliminar)
 * - index.js → se encarga de interpretar los comandos del usuario
 * 
 * Aprenderás:
 * - Destructuring de módulos: const { func1, func2 } = require(...)
 * - Métodos de Array: find, filter, map, sort
 * - Date y toISOString (fechas en formato estándar)
 * - Template literals para formatear strings
 * - Enums simulados con objetos congelados (PRIORITY, STATUS)
 */

const { loadTasks, saveTasks, getNextId } = require('./storage');

// "Enums" en JavaScript: objetos congelados para evitar valores mágicos
// Object.freeze impide que nadie modifique estos valores por accidente
const PRIORITY = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
});

const STATUS = Object.freeze({
  PENDING: 'pending',
  DONE: 'done'
});

// Emojis para hacer la salida más visual en terminal
const PRIORITY_ICONS = {
  [PRIORITY.LOW]: '🟢',
  [PRIORITY.MEDIUM]: '🟡',
  [PRIORITY.HIGH]: '🔴'
};

const STATUS_ICONS = {
  [STATUS.PENDING]: '⬜',
  [STATUS.DONE]: '✅'
};

/**
 * Añade una nueva tarea
 * 
 * @param {string} title - Título de la tarea
 * @param {string} priority - Prioridad (low, medium, high)
 * @returns {Object} La tarea creada
 */
function addTask(title, priority = PRIORITY.MEDIUM) {
  // Validación de entrada
  if (!title || title.trim() === '') {
    throw new Error('El título de la tarea no puede estar vacío');
  }

  // Validamos que la prioridad sea válida
  const validPriorities = Object.values(PRIORITY);
  if (!validPriorities.includes(priority)) {
    throw new Error(`Prioridad inválida: "${priority}". Usa: ${validPriorities.join(', ')}`);
  }

  const tasks = loadTasks();
  
  // Creamos el objeto tarea con toda su información
  const newTask = {
    id: getNextId(tasks),
    title: title.trim(),
    status: STATUS.PENDING,
    priority,
    createdAt: new Date().toISOString(),   // Formato: "2026-02-21T10:30:00.000Z"
    completedAt: null
  };

  tasks.push(newTask);
  saveTasks(tasks);

  return newTask;
}

/**
 * Lista tareas con filtros opcionales
 * 
 * @param {Object} filters - Filtros opcionales { status, priority }
 * @returns {Array} Tareas filtradas y ordenadas
 */
function listTasks(filters = {}) {
  let tasks = loadTasks();

  // Aplicar filtros si existen
  if (filters.status) {
    tasks = tasks.filter(task => task.status === filters.status);
  }

  if (filters.priority) {
    tasks = tasks.filter(task => task.priority === filters.priority);
  }

  // Ordenar: primero por prioridad (high > medium > low), luego por fecha
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  tasks.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  return tasks;
}

/**
 * Marca una tarea como completada
 * 
 * @param {number} id - ID de la tarea
 * @returns {Object} La tarea actualizada
 */
function completeTask(id) {
  const tasks = loadTasks();
  
  // Array.find → devuelve el primer elemento que cumple la condición
  const task = tasks.find(t => t.id === id);

  if (!task) {
    throw new Error(`No se encontró la tarea con ID ${id}`);
  }

  if (task.status === STATUS.DONE) {
    throw new Error(`La tarea "${task.title}" ya está completada`);
  }

  task.status = STATUS.DONE;
  task.completedAt = new Date().toISOString();

  saveTasks(tasks);
  return task;
}

/**
 * Elimina una tarea por ID
 * 
 * @param {number} id - ID de la tarea
 * @returns {Object} La tarea eliminada
 */
function deleteTask(id) {
  const tasks = loadTasks();
  
  // Buscamos el índice con findIndex
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    throw new Error(`No se encontró la tarea con ID ${id}`);
  }

  // splice devuelve array con elementos eliminados, tomamos el primero
  const [deleted] = tasks.splice(index, 1);
  saveTasks(tasks);

  return deleted;
}

/**
 * Edita el título de una tarea existente
 * 
 * @param {number} id - ID de la tarea
 * @param {string} newTitle - Nuevo título
 * @returns {Object} La tarea actualizada
 */
function editTask(id, newTitle) {
  if (!newTitle || newTitle.trim() === '') {
    throw new Error('El nuevo título no puede estar vacío');
  }

  const tasks = loadTasks();
  const task = tasks.find(t => t.id === id);

  if (!task) {
    throw new Error(`No se encontró la tarea con ID ${id}`);
  }

  task.title = newTitle.trim();
  saveTasks(tasks);

  return task;
}

/**
 * Devuelve estadísticas de las tareas
 * 
 * @returns {Object} Resumen con totales, completadas, pendientes
 */
function getStats() {
  const tasks = loadTasks();

  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === STATUS.PENDING).length,
    done: tasks.filter(t => t.status === STATUS.DONE).length,
    byPriority: {
      high: tasks.filter(t => t.priority === PRIORITY.HIGH && t.status === STATUS.PENDING).length,
      medium: tasks.filter(t => t.priority === PRIORITY.MEDIUM && t.status === STATUS.PENDING).length,
      low: tasks.filter(t => t.priority === PRIORITY.LOW && t.status === STATUS.PENDING).length,
    }
  };
}

/**
 * Formatea una tarea para mostrar en terminal
 * 
 * @param {Object} task - Objeto tarea
 * @returns {string} String formateado para terminal
 */
function formatTask(task) {
  const statusIcon = STATUS_ICONS[task.status];
  const priorityIcon = PRIORITY_ICONS[task.priority];
  const date = new Date(task.createdAt).toLocaleDateString('es-ES');
  
  // Template literal multilínea
  return `  ${statusIcon} [${task.id}] ${priorityIcon} ${task.title}  (${date})`;
}

// Exportamos todo lo necesario
module.exports = {
  addTask,
  listTasks,
  completeTask,
  deleteTask,
  editTask,
  getStats,
  formatTask,
  PRIORITY,
  STATUS
};
