/**
 * ═══════════════════════════════════════════════════════════════
 * 03-promises/04-real-world.js — PROMISES: Patrones del mundo real
 * ═══════════════════════════════════════════════════════════════
 *
 * Ahora que entiendes las 3 APIs, este archivo muestra patrones
 * que usarás CONSTANTEMENTE en proyectos reales de Node.js.
 *
 * Aprenderás:
 * - Leer/escribir JSON (el patrón más usado)
 * - Procesar múltiples archivos de un directorio
 * - Crear utilidades reutilizables con async/await
 * - Gestionar configuración de una aplicación
 * - Logging a archivo
 * - Patrón "si no existe, créalo"
 *
 * Ejecutar: node 03-promises/04-real-world.js
 */

const fs = require('fs/promises');
const fsSync = require('fs');  // Solo para existsSync que no tiene versión promises
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

console.log('═══════════════════════════════════════');
console.log('  PROMISES — Patrones del mundo real');
console.log('═══════════════════════════════════════\n');

// ═══════════════════════════════════════════════════
// PATRÓN 1: Gestor de JSON (lo usarás en TODOS los proyectos)
// ═══════════════════════════════════════════════════

/**
 * Lee un archivo JSON y devuelve el objeto.
 * Si el archivo no existe, devuelve el valor por defecto.
 *
 * @param {string} filePath - Ruta al archivo JSON
 * @param {*} defaultValue - Valor si no existe (por defecto: {})
 * @returns {Promise<Object>}
 */
async function readJSON(filePath, defaultValue = {}) {
    try {
        const raw = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(raw);
    } catch (error) {
        if (error.code === 'ENOENT') {
            // Archivo no existe → devolver valor por defecto
            return defaultValue;
        }
        // Otro tipo de error → relanzar
        throw error;
    }
}

/**
 * Escribe un objeto como JSON en un archivo.
 * Crea el directorio padre si no existe.
 */
async function writeJSON(filePath, data) {
    // Aseguramos que el directorio existe
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ═══════════════════════════════════════════════════
// PATRÓN 2: Configuración de la aplicación
// ═══════════════════════════════════════════════════

/**
 * Gestiona la configuración con valores por defecto.
 * Si el archivo no existe, lo crea con los defaults.
 * Si existe, mezcla los valores guardados con los defaults
 * (por si has añadido nuevas opciones).
 */
async function loadConfig(configPath) {
    const defaults = {
        port: 3000,
        host: 'localhost',
        database: {
            url: 'mongodb://localhost:27017',
            name: 'myapp'
        },
        logging: {
            level: 'info',
            file: 'app.log'
        },
        version: '1.0.0'
    };

    const saved = await readJSON(configPath, {});

    // Mezclamos: saved sobreescribe defaults (spread operator)
    // Esto es "deep merge" a un nivel
    const config = {
        ...defaults,
        ...saved,
        database: { ...defaults.database, ...(saved.database || {}) },
        logging: { ...defaults.logging, ...(saved.logging || {}) },
    };

    // Guardamos la config resultante (para que el usuario vea todas las opciones)
    await writeJSON(configPath, config);

    return config;
}

// ═══════════════════════════════════════════════════
// PATRÓN 3: Logger a archivo
// ═══════════════════════════════════════════════════

/**
 * Logger simple que escribe a archivo Y a consola.
 * Usa appendFile para añadir sin sobreescribir.
 */
function createLogger(logPath) {
    // Devolvemos un objeto con métodos (patrón "factory")
    return {
        async log(level, message) {
            const timestamp = new Date().toISOString();
            const line = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;

            // Escribimos a archivo (append)
            await fs.appendFile(logPath, line, 'utf-8');

            // También a consola con colores
            const colors = { info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m' };
            const color = colors[level] || '\x1b[0m';
            process.stdout.write(`${color}${line}\x1b[0m`);
        },

        info(msg)  { return this.log('info', msg); },
        warn(msg)  { return this.log('warn', msg); },
        error(msg) { return this.log('error', msg); },
    };
}

// ═══════════════════════════════════════════════════
// PATRÓN 4: Procesar todos los archivos de un directorio
// ═══════════════════════════════════════════════════

/**
 * Lee todos los archivos .json de un directorio
 * y devuelve un array con sus contenidos.
 */
async function readAllJSON(dirPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    // Filtramos solo archivos .json
    const jsonFiles = entries.filter(
        entry => entry.isFile() && path.extname(entry.name) === '.json'
    );

    // Leemos todos en paralelo
    const results = await Promise.all(
        jsonFiles.map(async (entry) => {
            const filePath = path.join(dirPath, entry.name);
            const data = await readJSON(filePath);
            return { filename: entry.name, data };
        })
    );

    return results;
}

// ═══════════════════════════════════════════════════
// PATRÓN 5: "Ensure" — si no existe, créalo
// ═══════════════════════════════════════════════════

/**
 * Asegura que un archivo existe.
 * Si no existe, lo crea con el contenido por defecto.
 * Si ya existe, no lo toca.
 *
 * Muy útil para: configs, caches, lockfiles, etc.
 */
async function ensureFile(filePath, defaultContent = '') {
    try {
        await fs.access(filePath);
        // Si no lanza error, el archivo existe
        return false; // No se creó
    } catch {
        // No existe → crear
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, defaultContent, 'utf-8');
        return true; // Se creó
    }
}

// ═══════════════════════════════════════════════════
// EJECUCIÓN: Demostración de todos los patrones
// ═══════════════════════════════════════════════════

async function main() {
    const testDir = path.join(dataDir, 'real-world-test');
    await fs.mkdir(testDir, { recursive: true });

    // ─── Patrón 1: JSON ───
    console.log('1️⃣  Patrón readJSON / writeJSON:\n');

    const usersFile = path.join(testDir, 'users.json');

    // Primera lectura: no existe → devuelve default
    const users = await readJSON(usersFile, []);
    console.log(`   Usuarios (archivo no existe): ${JSON.stringify(users)}`);

    // Añadimos datos y guardamos
    users.push({ id: 1, name: 'David', role: 'developer' });
    users.push({ id: 2, name: 'Ana', role: 'designer' });
    await writeJSON(usersFile, users);
    console.log(`   Guardados ${users.length} usuarios`);

    // Releemos
    const usersLoaded = await readJSON(usersFile);
    console.log(`   Releídos: ${usersLoaded.map(u => u.name).join(', ')}\n`);

    // ─── Patrón 2: Config ───
    console.log('2️⃣  Patrón Config con defaults:\n');

    const configFile = path.join(testDir, 'config.json');
    const config = await loadConfig(configFile);
    console.log(`   Puerto: ${config.port}`);
    console.log(`   DB: ${config.database.url}/${config.database.name}`);
    console.log(`   Log level: ${config.logging.level}\n`);

    // ─── Patrón 3: Logger ───
    console.log('3️⃣  Patrón Logger a archivo:\n');

    const logger = createLogger(path.join(testDir, 'app.log'));
    await logger.info('Aplicación iniciada');
    await logger.warn('Cache no encontrada, usando defaults');
    await logger.error('Conexión a DB fallida, reintentando...');

    // Verificamos que se escribió al archivo
    const logContent = await fs.readFile(path.join(testDir, 'app.log'), 'utf-8');
    console.log(`   Líneas en archivo de log: ${logContent.trim().split('\n').length}\n`);

    // ─── Patrón 4: Leer todos los JSON ───
    console.log('4️⃣  Patrón: leer todos los .json de un directorio:\n');

    // Creamos unos JSON más de prueba
    await writeJSON(path.join(testDir, 'products.json'), [
        { id: 1, name: 'Widget', price: 9.99 }
    ]);

    const allJson = await readAllJSON(testDir);
    allJson.forEach(({ filename, data }) => {
        const preview = JSON.stringify(data).substring(0, 50);
        console.log(`   📄 ${filename.padEnd(20)} → ${preview}...`);
    });
    console.log();

    // ─── Patrón 5: Ensure ───
    console.log('5️⃣  Patrón "ensure" (si no existe, créalo):\n');

    const cacheFile = path.join(testDir, 'cache.json');
    const created1 = await ensureFile(cacheFile, '{}');
    console.log(`   Primera vez: ${created1 ? 'CREADO' : 'ya existía'}`);

    const created2 = await ensureFile(cacheFile, '{}');
    console.log(`   Segunda vez: ${created2 ? 'CREADO' : 'ya existía'}`);

    // ─── Resumen ───
    console.log('\n   ┌─────────────────────────────────────────────────────┐');
    console.log('   │ PATRÓN              │ USO TÍPICO                     │');
    console.log('   ├─────────────────────────────────────────────────────┤');
    console.log('   │ readJSON/writeJSON  │ Cualquier dato persistente     │');
    console.log('   │ loadConfig          │ Arranque de apps               │');
    console.log('   │ createLogger        │ Debugging, auditoría           │');
    console.log('   │ readAllJSON         │ Procesar lotes de archivos     │');
    console.log('   │ ensureFile          │ Inicializar cache, configs     │');
    console.log('   └─────────────────────────────────────────────────────┘');

    // Limpieza
    await fs.rm(testDir, { recursive: true });

    console.log('\n═══════════════════════════════════════');
    console.log('  FIN — Patrones del mundo real');
    console.log('  Siguiente: node 04-comparison/01-same-task-3-ways.js');
    console.log('═══════════════════════════════════════\n');
}

main().catch(console.error);