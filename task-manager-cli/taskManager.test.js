/**
 * taskManager.test.js - Tests unitarios con Jest
 * 
 * Concepto clave: Testing
 * Los tests verifican que tu código funciona como esperas.
 * Cada test es independiente y comprueba UNA cosa.
 * 
 * Aprenderás:
 * - describe / it (agrupar y definir tests)
 * - expect / toBe / toEqual (aserciones)
 * - beforeEach (setup antes de cada test)
 * - toThrow (verificar que una función lanza error)
 * 
 * Ejecutar: npm test
 */

const fs = require('fs');
const path = require('path');

// Cambiamos la ruta del archivo de datos para tests
// para no mezclar con datos reales
const DATA_FILE = path.join(__dirname, '..', 'data', 'tasks.json');

const { 
  addTask, listTasks, completeTask, deleteTask, 
  editTask, getStats, PRIORITY, STATUS 
} = require('../src/taskManager');

// beforeEach se ejecuta ANTES de cada test
// Limpiamos el archivo para que cada test empiece de cero
beforeEach(() => {
  if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE);
  }
});

// afterAll se ejecuta al terminar TODOS los tests
// Limpieza final
afterAll(() => {
  if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE);
  }
});

// ═══════════════════════════════════════════════════════════════
// Tests para addTask
// ═══════════════════════════════════════════════════════════════
describe('addTask', () => {

  it('debería crear una tarea con valores por defecto', () => {
    const task = addTask('Comprar leche');

    expect(task.id).toBe(1);
    expect(task.title).toBe('Comprar leche');
    expect(task.status).toBe(STATUS.PENDING);
    expect(task.priority).toBe(PRIORITY.MEDIUM); // Por defecto
    expect(task.createdAt).toBeDefined();
    expect(task.completedAt).toBeNull();
  });

  it('debería crear una tarea con prioridad alta', () => {
    const task = addTask('Urgente', PRIORITY.HIGH);
    expect(task.priority).toBe(PRIORITY.HIGH);
  });

  it('debería asignar IDs incrementales', () => {
    const task1 = addTask('Tarea 1');
    const task2 = addTask('Tarea 2');
    const task3 = addTask('Tarea 3');

    expect(task1.id).toBe(1);
    expect(task2.id).toBe(2);
    expect(task3.id).toBe(3);
  });

  it('debería lanzar error con título vacío', () => {
    expect(() => addTask('')).toThrow('título de la tarea no puede estar vacío');
  });

  it('debería lanzar error con prioridad inválida', () => {
    expect(() => addTask('Test', 'urgentisimo')).toThrow('Prioridad inválida');
  });

  it('debería hacer trim del título', () => {
    const task = addTask('  Espacios extra  ');
    expect(task.title).toBe('Espacios extra');
  });
});

// ═══════════════════════════════════════════════════════════════
// Tests para listTasks
// ═══════════════════════════════════════════════════════════════
describe('listTasks', () => {

  it('debería devolver array vacío si no hay tareas', () => {
    const tasks = listTasks();
    expect(tasks).toEqual([]);
  });

  it('debería listar todas las tareas', () => {
    addTask('Tarea 1');
    addTask('Tarea 2');
    addTask('Tarea 3');

    const tasks = listTasks();
    expect(tasks).toHaveLength(3);
  });

  it('debería filtrar por status', () => {
    addTask('Pendiente 1');
    addTask('Pendiente 2');
    const t3 = addTask('Hecha');
    completeTask(t3.id);

    const pending = listTasks({ status: STATUS.PENDING });
    const done = listTasks({ status: STATUS.DONE });

    expect(pending).toHaveLength(2);
    expect(done).toHaveLength(1);
  });

  it('debería filtrar por prioridad', () => {
    addTask('Baja', PRIORITY.LOW);
    addTask('Alta 1', PRIORITY.HIGH);
    addTask('Alta 2', PRIORITY.HIGH);

    const high = listTasks({ priority: PRIORITY.HIGH });
    expect(high).toHaveLength(2);
  });

  it('debería ordenar por prioridad (high primero)', () => {
    addTask('Baja', PRIORITY.LOW);
    addTask('Alta', PRIORITY.HIGH);
    addTask('Media', PRIORITY.MEDIUM);

    const tasks = listTasks();
    expect(tasks[0].priority).toBe(PRIORITY.HIGH);
    expect(tasks[1].priority).toBe(PRIORITY.MEDIUM);
    expect(tasks[2].priority).toBe(PRIORITY.LOW);
  });
});

// ═══════════════════════════════════════════════════════════════
// Tests para completeTask
// ═══════════════════════════════════════════════════════════════
describe('completeTask', () => {

  it('debería marcar tarea como completada', () => {
    const created = addTask('Mi tarea');
    const completed = completeTask(created.id);

    expect(completed.status).toBe(STATUS.DONE);
    expect(completed.completedAt).toBeDefined();
  });

  it('debería lanzar error si el ID no existe', () => {
    expect(() => completeTask(999)).toThrow('No se encontró la tarea');
  });

  it('debería lanzar error si ya está completada', () => {
    const task = addTask('Test');
    completeTask(task.id);
    expect(() => completeTask(task.id)).toThrow('ya está completada');
  });
});

// ═══════════════════════════════════════════════════════════════
// Tests para deleteTask
// ═══════════════════════════════════════════════════════════════
describe('deleteTask', () => {

  it('debería eliminar una tarea', () => {
    addTask('Tarea 1');
    const task2 = addTask('Tarea 2');
    addTask('Tarea 3');

    deleteTask(task2.id);

    const tasks = listTasks();
    expect(tasks).toHaveLength(2);
    expect(tasks.find(t => t.id === task2.id)).toBeUndefined();
  });

  it('debería devolver la tarea eliminada', () => {
    const task = addTask('A eliminar');
    const deleted = deleteTask(task.id);
    expect(deleted.title).toBe('A eliminar');
  });

  it('debería lanzar error si el ID no existe', () => {
    expect(() => deleteTask(999)).toThrow('No se encontró la tarea');
  });
});

// ═══════════════════════════════════════════════════════════════
// Tests para editTask
// ═══════════════════════════════════════════════════════════════
describe('editTask', () => {

  it('debería editar el título', () => {
    const task = addTask('Título original');
    const edited = editTask(task.id, 'Título editado');
    expect(edited.title).toBe('Título editado');
  });

  it('debería lanzar error con título vacío', () => {
    const task = addTask('Test');
    expect(() => editTask(task.id, '')).toThrow('título no puede estar vacío');
  });
});

// ═══════════════════════════════════════════════════════════════
// Tests para getStats
// ═══════════════════════════════════════════════════════════════
describe('getStats', () => {

  it('debería devolver estadísticas correctas', () => {
    addTask('Pendiente 1', PRIORITY.HIGH);
    addTask('Pendiente 2', PRIORITY.LOW);
    const t3 = addTask('Hecha', PRIORITY.MEDIUM);
    completeTask(t3.id);

    const stats = getStats();

    expect(stats.total).toBe(3);
    expect(stats.pending).toBe(2);
    expect(stats.done).toBe(1);
    expect(stats.byPriority.high).toBe(1);
    expect(stats.byPriority.low).toBe(1);
    expect(stats.byPriority.medium).toBe(0); // La medium está completada
  });

  it('debería funcionar sin tareas', () => {
    const stats = getStats();
    expect(stats.total).toBe(0);
    expect(stats.pending).toBe(0);
    expect(stats.done).toBe(0);
  });
});
