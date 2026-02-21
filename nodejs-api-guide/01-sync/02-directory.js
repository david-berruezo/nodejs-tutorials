/**
 * ═══════════════════════════════════════════════════════════════
 * 01-sync/02-directory.js — API SÍNCRONA: Operaciones con directorios
 * ═══════════════════════════════════════════════════════════════
 * 
 * Ejecutar: node 01-sync/02-directory.js
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

console.log('═══════════════════════════════════════');
console.log('  API SÍNCRONA — Directorios');
console.log('═══════════════════════════════════════\n');

// ─────────────────────────────────────────────────
// 1. CREAR directorio
// ─────────────────────────────────────────────────
// fs.mkdirSync(ruta)
// fs.mkdirSync(ruta, { recursive: true })  ← crea padres si no existen

console.log('1️⃣  Creando directorios...');

// Crear un directorio simple
const testDir = path.join(dataDir, 'test-dir');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
  console.log('   ✅ Creado: data/test-dir/');
}

// Crear directorios anidados (como mkdir -p en Linux)
const nestedDir = path.join(dataDir, 'nivel1', 'nivel2', 'nivel3');
fs.mkdirSync(nestedDir, { recursive: true });
console.log('   ✅ Creado: data/nivel1/nivel2/nivel3/\n');

// ─────────────────────────────────────────────────
// 2. LISTAR contenido de un directorio
// ─────────────────────────────────────────────────
// fs.readdirSync(ruta) → array de nombres
// fs.readdirSync(ruta, { withFileTypes: true }) → array de Dirent

console.log('2️⃣  Listando directorio data/...');

// Versión simple: solo nombres
const nombres = fs.readdirSync(dataDir);
console.log('   Nombres:', nombres);

console.log();

// Versión con tipos: podemos saber si es archivo o directorio
const entries = fs.readdirSync(dataDir, { withFileTypes: true });
entries.forEach(entry => {
  const tipo = entry.isDirectory() ? '📁' : '📄';
  console.log(`   ${tipo} ${entry.name}`);
});

console.log();

// ─────────────────────────────────────────────────
// 3. INFORMACIÓN de un archivo (stat)
// ─────────────────────────────────────────────────
// fs.statSync(ruta) → objeto Stats con toda la info

console.log('3️⃣  Información de archivo (stat)...');

// Creamos un archivo de prueba
const testFile = path.join(dataDir, 'test-stat.txt');
fs.writeFileSync(testFile, 'Contenido de prueba para stat', 'utf-8');

const stats = fs.statSync(testFile);

console.log(`   Archivo: test-stat.txt`);
console.log(`   Tamaño: ${stats.size} bytes`);
console.log(`   ¿Es archivo?: ${stats.isFile()}`);
console.log(`   ¿Es directorio?: ${stats.isDirectory()}`);
console.log(`   Creado: ${stats.birthtime.toLocaleString('es-ES')}`);
console.log(`   Modificado: ${stats.mtime.toLocaleString('es-ES')}`);
console.log(`   Permisos (modo): ${stats.mode.toString(8)}`);  // Octal como en Linux

console.log();

// ─────────────────────────────────────────────────
// 4. EJEMPLO PRÁCTICO: Listar archivos con tamaño
// ─────────────────────────────────────────────────

console.log('4️⃣  Listado completo con tamaños...');
console.log('   ┌─────────┬──────────────────────────────────┐');
console.log('   │ Tamaño  │ Nombre                           │');
console.log('   ├─────────┼──────────────────────────────────┤');

const allEntries = fs.readdirSync(dataDir, { withFileTypes: true });
allEntries.forEach(entry => {
  const fullPath = path.join(dataDir, entry.name);
  if (entry.isFile()) {
    const size = fs.statSync(fullPath).size;
    const sizeStr = `${size}B`.padStart(7);
    console.log(`   │ ${sizeStr} │ 📄 ${entry.name.padEnd(32)} │`);
  } else {
    console.log(`   │    ---  │ 📁 ${entry.name.padEnd(32)} │`);
  }
});

console.log('   └─────────┴──────────────────────────────────┘');

// ─────────────────────────────────────────────────
// 5. ELIMINAR directorios
// ─────────────────────────────────────────────────
// fs.rmdirSync(ruta) → solo vacíos
// fs.rmSync(ruta, { recursive: true }) → con contenido (como rm -rf)

console.log('\n5️⃣  Limpiando directorios de prueba...');

fs.rmSync(path.join(dataDir, 'test-dir'), { recursive: true });
fs.rmSync(path.join(dataDir, 'nivel1'), { recursive: true });
fs.unlinkSync(testFile);
console.log('   ✅ Limpieza completada');

console.log('\n═══════════════════════════════════════');
console.log('  FIN — Directorios Sync');
console.log('  Siguiente: node 02-callbacks/01-readwrite.js');
console.log('═══════════════════════════════════════\n');
