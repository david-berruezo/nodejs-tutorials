/**
 * ═══════════════════════════════════════════════════════════════
 * 01-sync/01-readwrite.js — API SÍNCRONA: Leer y escribir archivos
 * ═══════════════════════════════════════════════════════════════
 * 
 * La API síncrona es la más SIMPLE de entender.
 * Funciona como PHP: ejecuta línea por línea, en orden.
 * 
 * ⚠️ PROBLEMA: Bloquea el programa mientras lee/escribe.
 *    Si un archivo tarda 5 segundos en leerse, tu programa
 *    se congela 5 segundos. NADIE más puede hacer nada.
 * 
 * ✅ CUÁNDO USARLA:
 *    - Scripts de terminal (como el task-manager)
 *    - Leer configuración al arrancar la app
 *    - Prototipos rápidos
 * 
 * ❌ CUÁNDO NO USARLA:
 *    - Servidores web (Express, HTTP)
 *    - Cualquier cosa que atienda a múltiples usuarios
 * 
 * Ejecutar: node 01-sync/01-readwrite.js
 */

const fs = require('fs');
const path = require('path');

// Directorio para nuestros archivos de prueba
const dataDir = path.join(__dirname, '..', 'data');

console.log('═══════════════════════════════════════');
console.log('  API SÍNCRONA — fs.*Sync()');
console.log('═══════════════════════════════════════\n');

// ─────────────────────────────────────────────────
// 1. ESCRIBIR un archivo
// ─────────────────────────────────────────────────
// fs.writeFileSync(ruta, contenido, encoding)
//
// Es como file_put_contents() en PHP
// Si el archivo no existe, lo CREA
// Si existe, lo SOBREESCRIBE

console.log('1️⃣  Escribiendo archivo...');

const contenido = 'Hola desde Node.js!\nEsta es la segunda línea.\nY esta la tercera.';

fs.writeFileSync(
  path.join(dataDir, 'ejemplo-sync.txt'),   // ruta
  contenido,                                  // contenido
  'utf-8'                                     // encoding
);

console.log('   ✅ Archivo escrito: data/ejemplo-sync.txt\n');

// ─────────────────────────────────────────────────
// 2. LEER un archivo
// ─────────────────────────────────────────────────
// fs.readFileSync(ruta, encoding)
//
// Es como file_get_contents() en PHP
// Devuelve el contenido DIRECTAMENTE (no una promesa, no un callback)
//
// Sin encoding → devuelve Buffer (datos binarios crudos)
// Con 'utf-8'  → devuelve String (texto legible)

console.log('2️⃣  Leyendo archivo...');

// Sin encoding → Buffer
const buffer = fs.readFileSync(path.join(dataDir, 'ejemplo-sync.txt'));
console.log('   Tipo sin encoding:', typeof buffer, '→', buffer.constructor.name);
console.log('   Contenido Buffer:', buffer);
// Verás algo como: <Buffer 48 6f 6c 61 20 64 65 73 ...>
// Esos son los bytes en hexadecimal

console.log();

// Con encoding → String
const texto = fs.readFileSync(path.join(dataDir, 'ejemplo-sync.txt'), 'utf-8');
console.log('   Tipo con utf-8:', typeof texto, '→ String');
console.log('   Contenido String:');
console.log('   ┌──────────────────────────────┐');
texto.split('\n').forEach(linea => {
  console.log(`   │ ${linea.padEnd(28)} │`);
});
console.log('   └──────────────────────────────┘\n');

// ─────────────────────────────────────────────────
// 3. AÑADIR contenido (append, no sobreescribir)
// ─────────────────────────────────────────────────
// fs.appendFileSync(ruta, contenido)
//
// Añade al final del archivo sin borrar lo que hay

console.log('3️⃣  Añadiendo al archivo (append)...');

fs.appendFileSync(
  path.join(dataDir, 'ejemplo-sync.txt'),
  '\nLínea añadida con appendFileSync!'
);

const textoActualizado = fs.readFileSync(path.join(dataDir, 'ejemplo-sync.txt'), 'utf-8');
console.log('   Contenido actualizado:');
textoActualizado.split('\n').forEach(linea => {
  console.log(`   │ ${linea}`);
});
console.log();

// ─────────────────────────────────────────────────
// 4. COMPROBAR si un archivo existe
// ─────────────────────────────────────────────────
// fs.existsSync(ruta) → true / false

console.log('4️⃣  Comprobando existencia...');

const existe = fs.existsSync(path.join(dataDir, 'ejemplo-sync.txt'));
const noExiste = fs.existsSync(path.join(dataDir, 'no-existe.txt'));

console.log(`   ejemplo-sync.txt: ${existe ? '✅ Existe' : '❌ No existe'}`);
console.log(`   no-existe.txt:    ${noExiste ? '✅ Existe' : '❌ No existe'}\n`);

// ─────────────────────────────────────────────────
// 5. COPIAR un archivo
// ─────────────────────────────────────────────────
// fs.copyFileSync(origen, destino)

console.log('5️⃣  Copiando archivo...');

fs.copyFileSync(
  path.join(dataDir, 'ejemplo-sync.txt'),
  path.join(dataDir, 'ejemplo-sync-copia.txt')
);
console.log('   ✅ Copiado a data/ejemplo-sync-copia.txt\n');

// ─────────────────────────────────────────────────
// 6. RENOMBRAR un archivo
// ─────────────────────────────────────────────────
// fs.renameSync(viejo, nuevo)

console.log('6️⃣  Renombrando archivo...');

fs.renameSync(
  path.join(dataDir, 'ejemplo-sync-copia.txt'),
  path.join(dataDir, 'ejemplo-sync-renombrado.txt')
);
console.log('   ✅ Renombrado a data/ejemplo-sync-renombrado.txt\n');

// ─────────────────────────────────────────────────
// 7. ELIMINAR un archivo
// ─────────────────────────────────────────────────
// fs.unlinkSync(ruta)   ← ¡Ojo! No es "deleteSync", es "unlink"

console.log('7️⃣  Eliminando archivo renombrado...');

fs.unlinkSync(path.join(dataDir, 'ejemplo-sync-renombrado.txt'));
console.log('   ✅ Eliminado data/ejemplo-sync-renombrado.txt\n');

// ─────────────────────────────────────────────────
// 8. MANEJO DE ERRORES con try/catch
// ─────────────────────────────────────────────────
// Las funciones Sync lanzan EXCEPCIONES si algo falla
// SIEMPRE usa try/catch con Sync

console.log('8️⃣  Manejo de errores (try/catch)...');

try {
  // Intentamos leer un archivo que no existe
  fs.readFileSync('/ruta/que/no/existe.txt', 'utf-8');
} catch (error) {
  // error.code tiene el código de error del sistema operativo
  console.log(`   Error capturado:`);
  console.log(`   - Código: ${error.code}`);        // ENOENT = "Error NO ENTry" (no existe)
  console.log(`   - Mensaje: ${error.message.split(',')[0]}`);
}

console.log();

// ─────────────────────────────────────────────────
// 9. ESCRIBIR JSON (muy común)
// ─────────────────────────────────────────────────

console.log('9️⃣  Escribiendo y leyendo JSON...');

const datos = {
  nombre: 'David',
  lenguajes: ['JavaScript', 'PHP', 'Node.js'],
  experiencia: { años: 10, empresas: ['AUBAY', 'Avantio'] }
};

// Escribir: objeto JS → JSON string → archivo
fs.writeFileSync(
  path.join(dataDir, 'datos-sync.json'),
  JSON.stringify(datos, null, 2),  // null=no filter, 2=indentación
  'utf-8'
);

// Leer: archivo → JSON string → objeto JS
const datosLeidos = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'datos-sync.json'), 'utf-8')
);

console.log(`   Nombre: ${datosLeidos.nombre}`);
console.log(`   Lenguajes: ${datosLeidos.lenguajes.join(', ')}`);
console.log(`   Empresas: ${datosLeidos.experiencia.empresas.join(', ')}`);

console.log('\n═══════════════════════════════════════');
console.log('  FIN — API Síncrona');
console.log('  Siguiente: node 01-sync/02-directory.js');
console.log('═══════════════════════════════════════\n');
