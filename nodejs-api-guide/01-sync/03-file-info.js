/**
 * ═══════════════════════════════════════════════════════════════
 * 01-sync/03-file-info.js — API SÍNCRONA: Información de archivos
 * ═══════════════════════════════════════════════════════════════
 *
 * fs.statSync() devuelve un objeto Stats con TODO lo que el
 * sistema operativo sabe sobre un archivo o directorio.
 * Es el equivalente a "ls -la" en Linux o "stat" en terminal.
 *
 * Aprenderás:
 * - fs.statSync() y el objeto Stats
 * - Métodos: isFile(), isDirectory(), isSymbolicLink()
 * - Propiedades: size, mtime, birthtime, mode
 * - path.extname(), path.basename(), path.dirname()
 * - Cálculo de tamaños legibles (bytes → KB → MB)
 *
 * Ejecutar: node 01-sync/03-file-info.js
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

console.log('═══════════════════════════════════════');
console.log('  API SÍNCRONA — Información de archivos');
console.log('═══════════════════════════════════════\n');

// ─────────────────────────────────────────────────
// Preparamos archivos de prueba
// ─────────────────────────────────────────────────

const archivos = {
    texto: path.join(dataDir, 'info-ejemplo.txt'),
    json: path.join(dataDir, 'info-ejemplo.json'),
    grande: path.join(dataDir, 'info-grande.txt'),
};

fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(archivos.texto, 'Un archivo de texto simple.\nCon dos líneas.');
fs.writeFileSync(archivos.json, JSON.stringify({ clave: 'valor', num: 42 }, null, 2));
fs.writeFileSync(archivos.grande, 'A'.repeat(1024 * 150)); // 150KB

// ─────────────────────────────────────────────────
// 1. OBJETO Stats — toda la información
// ─────────────────────────────────────────────────

console.log('1️⃣  Objeto Stats completo:\n');

const stats = fs.statSync(archivos.texto);

// El objeto Stats tiene MUCHAS propiedades:
console.log('   Propiedades del objeto Stats:');
console.log(`   ├── size:      ${stats.size} bytes`);
console.log(`   ├── mtime:     ${stats.mtime.toLocaleString('es-ES')}`);   // Última modificación
console.log(`   ├── atime:     ${stats.atime.toLocaleString('es-ES')}`);   // Último acceso
console.log(`   ├── birthtime: ${stats.birthtime.toLocaleString('es-ES')}`); // Creación
console.log(`   ├── mode:      ${stats.mode.toString(8)}`);   // Permisos en octal (como Linux)
console.log(`   ├── uid:       ${stats.uid}`);                 // User ID del propietario
console.log(`   ├── gid:       ${stats.gid}`);                 // Group ID
console.log(`   ├── ino:       ${stats.ino}`);                 // Inode (identificador en disco)
console.log(`   └── nlink:     ${stats.nlink}`);               // Número de hard links

console.log('\n   Métodos del objeto Stats:');
console.log(`   ├── isFile():          ${stats.isFile()}`);
console.log(`   ├── isDirectory():     ${stats.isDirectory()}`);
console.log(`   ├── isSymbolicLink():  ${stats.isSymbolicLink()}`);
console.log(`   ├── isBlockDevice():   ${stats.isBlockDevice()}`);
console.log(`   └── isFIFO():          ${stats.isFIFO()}`);

// ─────────────────────────────────────────────────
// 2. UTILIDADES del módulo path
// ─────────────────────────────────────────────────
// El módulo 'path' NO toca el disco — solo trabaja con STRINGS de rutas

console.log('\n2️⃣  Módulo path — analizar rutas:\n');

const ruta = '/home/david/proyectos/mi-app/src/index.js';

console.log(`   Ruta completa:  ${ruta}`);
console.log(`   ├── dirname:    ${path.dirname(ruta)}`);     // /home/david/proyectos/mi-app/src
console.log(`   ├── basename:   ${path.basename(ruta)}`);    // index.js
console.log(`   ├── extname:    ${path.extname(ruta)}`);     // .js
console.log(`   ├── basename sin ext: ${path.basename(ruta, '.js')}`);  // index
console.log(`   └── parse:`);

// path.parse devuelve un objeto con todas las partes
const parsed = path.parse(ruta);
console.log(`       ├── root: "${parsed.root}"`);     // /
console.log(`       ├── dir:  "${parsed.dir}"`);      // /home/david/proyectos/mi-app/src
console.log(`       ├── base: "${parsed.base}"`);     // index.js
console.log(`       ├── ext:  "${parsed.ext}"`);      // .js
console.log(`       └── name: "${parsed.name}"`);     // index

// ─────────────────────────────────────────────────
// 3. FUNCIÓN ÚTIL: tamaño legible
// ─────────────────────────────────────────────────

console.log('\n3️⃣  Función práctica — tamaño legible:\n');

/**
 * Convierte bytes a formato legible (KB, MB, GB)
 * Esta función la usarás en muchos proyectos
 */
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    // Math.log para saber en qué "escala" estamos
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    // toFixed(2) para 2 decimales
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

Object.entries(archivos).forEach(([nombre, ruta]) => {
    const s = fs.statSync(ruta);
    console.log(`   📄 ${path.basename(ruta).padEnd(25)} ${formatSize(s.size).padStart(10)}`);
});

// ─────────────────────────────────────────────────
// 4. FUNCIÓN ÚTIL: explorar directorio recursivo
// ─────────────────────────────────────────────────

console.log('\n4️⃣  Exploración recursiva de directorio:\n');

/**
 * Lista archivos recursivamente con indentación visual
 * Como el comando "tree" en Linux
 *
 * @param {string} dir - Directorio a explorar
 * @param {string} prefix - Prefijo para indentación
 * @param {number} depth - Profundidad máxima
 */
function tree(dir, prefix = '   ', depth = 3) {
    if (depth === 0) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach((entry, index) => {
        const isLast = index === entries.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';

        if (entry.isDirectory()) {
            console.log(`${prefix}${connector}📁 ${entry.name}/`);
            tree(path.join(dir, entry.name), prefix + childPrefix, depth - 1);
        } else {
            const size = formatSize(fs.statSync(path.join(dir, entry.name)).size);
            console.log(`${prefix}${connector}📄 ${entry.name} (${size})`);
        }
    });
}

// Exploramos el directorio del proyecto
const projectDir = path.join(__dirname, '..');
console.log(`   📁 nodejs-api-guide/`);
tree(projectDir, '   ', 2);

// ─────────────────────────────────────────────────
// 5. COMPROBAR permisos de acceso
// ─────────────────────────────────────────────────

console.log('\n5️⃣  Comprobar permisos de acceso:\n');

// fs.accessSync lanza error si NO tiene los permisos
// fs.constants.R_OK = lectura, W_OK = escritura, X_OK = ejecución

function checkAccess(filePath) {
    const name = path.basename(filePath);
    const perms = [];

    try { fs.accessSync(filePath, fs.constants.R_OK); perms.push('lectura ✅'); }
    catch { perms.push('lectura ❌'); }

    try { fs.accessSync(filePath, fs.constants.W_OK); perms.push('escritura ✅'); }
    catch { perms.push('escritura ❌'); }

    console.log(`   ${name}: ${perms.join(', ')}`);
}

checkAccess(archivos.texto);
checkAccess(archivos.json);
checkAccess('/etc/shadow');  // No tendremos permisos

// ─────────────────────────────────────────────────
// Limpieza
// ─────────────────────────────────────────────────
Object.values(archivos).forEach(f => {
    if (fs.existsSync(f)) fs.unlinkSync(f);
});

console.log('\n═══════════════════════════════════════');
console.log('  FIN — Info de archivos');
console.log('  Siguiente: node 02-callbacks/01-readwrite.js');
console.log('═══════════════════════════════════════\n');