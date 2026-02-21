#!/usr/bin/env node

/**
 * index.js - Punto de entrada del CLI Task Manager
 * 
 * Concepto clave: process.argv
 * Cuando ejecutas "node src/index.js add 'Comprar leche' --priority high"
 * process.argv es un array:
 *   [0] = ruta a node     → "/usr/bin/node"
 *   [1] = ruta al script  → "/home/david/task-manager-cli/src/index.js"
 *   [2] = primer argumento → "add"
 *   [3] = segundo argumento → "Comprar leche"
 *   [4] = tercer argumento  → "--priority"
 *   [5] = cuarto argumento  → "high"
 * 
 * Aprenderás:
 * - process.argv para leer argumentos de línea de comandos
 * - Shebang (#!/usr/bin/env node) para ejecutar como script
 * - Switch/case para routing de comandos
 * - process.exit() con códigos de salida (0 = OK, 1 = error)
 * - Colores en terminal con códigos ANSI
 */

const { 
  addTask, listTasks, completeTask, deleteTask, 
  editTask, getStats, formatTask, PRIORITY 
} = require('./taskManager');

// ═══════════════════════════════════════════════════════════════
// Colores ANSI para terminal (sin dependencias externas)
// ═══════════════════════════════════════════════════════════════
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

// ═══════════════════════════════════════════════════════════════
// Parser de argumentos
// ═══════════════════════════════════════════════════════════════

/**
 * Parsea argumentos con flags tipo --priority high --status done
 * 
 * @param {Array} args - Array de argumentos (process.argv.slice(2))
 * @returns {Object} { command, args, flags }
 */
function parseArgs(argv) {
  const args = argv.slice(2); // Quitamos node y script path
  const command = args[0];     // Primer argumento = comando
  const positional = [];       // Argumentos sin flag
  const flags = {};            // Flags con --nombre valor

  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      // Es un flag: guardamos --nombre valor
      const flagName = args[i].slice(2); // Quitamos los --
      const flagValue = args[i + 1];     // El siguiente es el valor
      flags[flagName] = flagValue;
      i++; // Saltamos el valor
    } else {
      positional.push(args[i]);
    }
  }

  return { command, positional, flags };
}

// ═══════════════════════════════════════════════════════════════
// Manejadores de comandos
// ═══════════════════════════════════════════════════════════════

function handleAdd(positional, flags) {
  const title = positional.join(' ');
  const priority = flags.priority || 'medium';

  if (!title) {
    console.log(colorize('❌ Debes indicar un título para la tarea', 'red'));
    console.log(colorize('   Uso: node src/index.js add "Mi tarea" --priority high', 'dim'));
    process.exit(1);
  }

  try {
    const task = addTask(title, priority);
    console.log(colorize('\n✨ Tarea creada con éxito:', 'green'));
    console.log(formatTask(task));
    console.log();
  } catch (error) {
    console.log(colorize(`❌ ${error.message}`, 'red'));
    process.exit(1);
  }
}

function handleList(flags) {
  const filters = {};
  if (flags.status) filters.status = flags.status;
  if (flags.priority) filters.priority = flags.priority;

  const tasks = listTasks(filters);

  if (tasks.length === 0) {
    console.log(colorize('\n📋 No hay tareas', 'dim'));
    if (Object.keys(filters).length > 0) {
      console.log(colorize('   (con los filtros actuales)', 'dim'));
    }
    console.log(colorize('   Añade una con: node src/index.js add "Mi tarea"', 'dim'));
    console.log();
    return;
  }

  // Header
  const filterText = Object.keys(filters).length > 0 
    ? ` (filtro: ${Object.entries(filters).map(([k,v]) => `${k}=${v}`).join(', ')})`
    : '';
  console.log(colorize(`\n📋 Tareas${filterText}:`, 'bold'));
  console.log(colorize('  ─────────────────────────────────────────', 'dim'));

  // Mostrar cada tarea formateada
  tasks.forEach(task => {
    console.log(formatTask(task));
  });

  console.log(colorize('  ─────────────────────────────────────────', 'dim'));
  console.log(colorize(`  Total: ${tasks.length} tarea(s)`, 'dim'));
  console.log();
}

function handleDone(positional) {
  const id = parseInt(positional[0], 10);

  if (isNaN(id)) {
    console.log(colorize('❌ Debes indicar el ID de la tarea', 'red'));
    console.log(colorize('   Uso: node src/index.js done 1', 'dim'));
    process.exit(1);
  }

  try {
    const task = completeTask(id);
    console.log(colorize('\n🎉 ¡Tarea completada!', 'green'));
    console.log(formatTask(task));
    console.log();
  } catch (error) {
    console.log(colorize(`❌ ${error.message}`, 'red'));
    process.exit(1);
  }
}

function handleDelete(positional) {
  const id = parseInt(positional[0], 10);

  if (isNaN(id)) {
    console.log(colorize('❌ Debes indicar el ID de la tarea', 'red'));
    console.log(colorize('   Uso: node src/index.js delete 1', 'dim'));
    process.exit(1);
  }

  try {
    const task = deleteTask(id);
    console.log(colorize('\n🗑️  Tarea eliminada:', 'yellow'));
    console.log(formatTask(task));
    console.log();
  } catch (error) {
    console.log(colorize(`❌ ${error.message}`, 'red'));
    process.exit(1);
  }
}

function handleEdit(positional, flags) {
  const id = parseInt(positional[0], 10);
  const newTitle = positional.slice(1).join(' ');

  if (isNaN(id) || !newTitle) {
    console.log(colorize('❌ Debes indicar el ID y el nuevo título', 'red'));
    console.log(colorize('   Uso: node src/index.js edit 1 "Nuevo título"', 'dim'));
    process.exit(1);
  }

  try {
    const task = editTask(id, newTitle);
    console.log(colorize('\n✏️  Tarea editada:', 'blue'));
    console.log(formatTask(task));
    console.log();
  } catch (error) {
    console.log(colorize(`❌ ${error.message}`, 'red'));
    process.exit(1);
  }
}

function handleStats() {
  const stats = getStats();

  console.log(colorize('\n📊 Estadísticas:', 'bold'));
  console.log(colorize('  ─────────────────────────────────────────', 'dim'));
  console.log(`  Total:       ${colorize(stats.total.toString(), 'bold')}`);
  console.log(`  Pendientes:  ${colorize(stats.pending.toString(), 'yellow')}`);
  console.log(`  Completadas: ${colorize(stats.done.toString(), 'green')}`);
  console.log();
  
  if (stats.pending > 0) {
    console.log(colorize('  Pendientes por prioridad:', 'dim'));
    console.log(`    🔴 Alta:   ${stats.byPriority.high}`);
    console.log(`    🟡 Media:  ${stats.byPriority.medium}`);
    console.log(`    🟢 Baja:   ${stats.byPriority.low}`);
  }

  // Barra de progreso visual
  if (stats.total > 0) {
    const percentage = Math.round((stats.done / stats.total) * 100);
    const filled = Math.round(percentage / 5);
    const empty = 20 - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    console.log(`\n  Progreso: [${colorize(bar, 'green')}] ${percentage}%`);
  }
  console.log();
}

function showHelp() {
  console.log(`
${colorize('📝 Task Manager CLI', 'bold')} ${colorize('v1.0.0', 'dim')}
${colorize('  Gestión de tareas desde terminal con Node.js', 'dim')}

${colorize('COMANDOS:', 'bold')}

  ${colorize('add', 'cyan')} <título> [--priority low|medium|high]
    Añade una nueva tarea
    ${colorize('Ejemplo: node src/index.js add "Comprar leche" --priority high', 'dim')}

  ${colorize('list', 'cyan')} [--status pending|done] [--priority low|medium|high]
    Lista todas las tareas con filtros opcionales
    ${colorize('Ejemplo: node src/index.js list --status pending', 'dim')}
    ${colorize('Ejemplo: node src/index.js list --priority high', 'dim')}

  ${colorize('done', 'cyan')} <id>
    Marca una tarea como completada
    ${colorize('Ejemplo: node src/index.js done 1', 'dim')}

  ${colorize('delete', 'cyan')} <id>
    Elimina una tarea
    ${colorize('Ejemplo: node src/index.js delete 1', 'dim')}

  ${colorize('edit', 'cyan')} <id> <nuevo título>
    Edita el título de una tarea
    ${colorize('Ejemplo: node src/index.js edit 1 "Título actualizado"', 'dim')}

  ${colorize('stats', 'cyan')}
    Muestra estadísticas y progreso

  ${colorize('help', 'cyan')}
    Muestra esta ayuda

${colorize('PRIORIDADES:', 'bold')}
  🔴 high   → Urgente
  🟡 medium → Normal (por defecto)
  🟢 low    → Puede esperar
`);
}

// ═══════════════════════════════════════════════════════════════
// Routing de comandos (punto de entrada principal)
// ═══════════════════════════════════════════════════════════════

function main() {
  const { command, positional, flags } = parseArgs(process.argv);

  // Si no hay comando, mostramos ayuda
  if (!command) {
    showHelp();
    return;
  }

  // Switch/case: equivalente a un router de comandos
  switch (command) {
    case 'add':
      handleAdd(positional, flags);
      break;

    case 'list':
    case 'ls':        // Alias corto
      handleList(flags);
      break;

    case 'done':
    case 'complete':  // Alias
      handleDone(positional);
      break;

    case 'delete':
    case 'rm':        // Alias corto
      handleDelete(positional);
      break;

    case 'edit':
      handleEdit(positional, flags);
      break;

    case 'stats':
      handleStats();
      break;

    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;

    default:
      console.log(colorize(`❌ Comando desconocido: "${command}"`, 'red'));
      console.log(colorize('   Escribe "node src/index.js help" para ver los comandos disponibles', 'dim'));
      process.exit(1);
  }
}

// Ejecutamos la función principal
main();

// Exportamos para testing
module.exports = { parseArgs };
