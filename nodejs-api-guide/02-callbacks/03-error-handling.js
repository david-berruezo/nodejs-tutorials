/**
 * ═══════════════════════════════════════════════════════════════
 * 02-callbacks/03-error-handling.js — CALLBACKS: Manejo de errores
 * ═══════════════════════════════════════════════════════════════
 *
 * Con callbacks, los errores NO se capturan con try/catch.
 * ¿Por qué? Porque el callback se ejecuta DESPUÉS, cuando
 * el try/catch ya ha terminado hace rato.
 *
 * Este es uno de los problemas más comunes para gente que
 * viene de PHP o Python: intentan poner try/catch alrededor
 * de una función async con callback y no entienden por qué
 * no funciona.
 *
 * Aprenderás:
 * - Por qué try/catch NO funciona con callbacks
 * - Patrón "error-first callback" de Node.js
 * - Errores comunes y sus códigos (ENOENT, EACCES, EEXIST...)
 * - Cómo propagar errores entre callbacks
 *
 * Ejecutar: node 02-callbacks/03-error-handling.js
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

console.log('═══════════════════════════════════════');
console.log('  CALLBACKS — Manejo de errores');
console.log('═══════════════════════════════════════\n');

// ─────────────────────────────────────────────────
// 1. ¿POR QUÉ try/catch NO funciona con callbacks?
// ─────────────────────────────────────────────────

console.log('1️⃣  try/catch con callbacks — NO FUNCIONA:\n');

try {
    fs.readFile('/archivo/que/no/existe.txt', 'utf-8', (err, data) => {
        // El error llega AQUÍ, dentro del callback
        // NO al catch de abajo
        if (err) {
            console.log('   ✅ Error capturado DENTRO del callback');
            console.log(`   Código: ${err.code}\n`);
            return;
        }
    });
    // Si llegamos aquí, parece que todo fue bien...
    // pero en realidad la operación aún no terminó
    console.log('   ⚠️  try/catch cree que todo fue bien (pero no lo sabe aún)');
} catch (error) {
    // ❌ Este catch NUNCA se ejecuta para errores async
    // Porque cuando el error ocurre, ya salimos del try/catch
    console.log('   Este mensaje NUNCA aparecerá');
}

// ─────────────────────────────────────────────────
// 2. Patrón correcto: error-first callback
// ─────────────────────────────────────────────────

console.log('2️⃣  Patrón "error-first callback" (el correcto):\n');

// REGLA DE ORO en callbacks de Node.js:
// 1. SIEMPRE comprueba err PRIMERO
// 2. Si hay err, return inmediatamente (no sigas ejecutando)
// 3. Si no hay err, usa los datos

function leerArchivoSeguro(ruta, callback) {
    fs.readFile(ruta, 'utf-8', (err, data) => {
        // Paso 1: SIEMPRE comprobar err primero
        if (err) {
            // Paso 2: Si hay error, return
            console.log(`   ❌ Error leyendo ${path.basename(ruta)}: ${err.code}`);
            callback(err, null);  // Propagamos el error al siguiente callback
            return;               // ← MUY IMPORTANTE: return para no seguir
        }

        // Paso 3: Solo si no hay error, procesamos
        console.log(`   ✅ Leído ${path.basename(ruta)}: ${data.length} caracteres`);
        callback(null, data);   // null = sin error
    });
}

// Probamos con archivo que existe y uno que no
fs.writeFileSync(path.join(dataDir, 'error-test.txt'), 'Datos de prueba');

leerArchivoSeguro(path.join(dataDir, 'error-test.txt'), (err, data) => {
    // Este es nuestro callback — recibimos err o data
    if (!err) {
        console.log(`   Contenido: "${data}"`);
    }
});

leerArchivoSeguro('/no/existe.txt', (err, data) => {
    if (err) {
        console.log(`   Manejado correctamente, seguimos adelante\n`);
    }
});

// ─────────────────────────────────────────────────
// 3. Códigos de error comunes en Node.js
// ─────────────────────────────────────────────────

// Esperamos un poco para que los callbacks anteriores terminen
setTimeout(() => {
    console.log('3️⃣  Códigos de error comunes de Node.js:\n');

    const errores = [];

    // ENOENT — archivo no encontrado
    fs.readFile('/no/existe.txt', (err) => {
        if (err) errores.push({ code: err.code, desc: 'Archivo o directorio no encontrado' });

        // EACCES — sin permisos
        fs.readFile('/etc/shadow', (err) => {
            if (err) errores.push({ code: err.code, desc: 'Sin permisos de acceso' });

            // EEXIST — ya existe (intentamos crear directorio que ya existe sin recursive)
            fs.mkdir(dataDir, (err) => {
                if (err) errores.push({ code: err.code, desc: 'El archivo/directorio ya existe' });

                // EISDIR — es un directorio (intentamos leer directorio como archivo)
                fs.readFile(dataDir, 'utf-8', (err) => {
                    if (err) errores.push({ code: err.code, desc: 'Es un directorio, no un archivo' });

                    // Mostramos todos los errores recopilados
                    console.log('   ┌────────────┬─────────────────────────────────────────┐');
                    console.log('   │ Código     │ Significado                             │');
                    console.log('   ├────────────┼─────────────────────────────────────────┤');
                    errores.forEach(e => {
                        console.log(`   │ ${e.code.padEnd(10)} │ ${e.desc.padEnd(39)} │`);
                    });
                    console.log('   ├────────────┼─────────────────────────────────────────┤');
                    console.log('   │ EMFILE     │ Demasiados archivos abiertos            │');
                    console.log('   │ EPERM      │ Operación no permitida                  │');
                    console.log('   │ ENOTEMPTY  │ Directorio no está vacío                │');
                    console.log('   └────────────┴─────────────────────────────────────────┘');

                    // ─────────────────────────────────────────────
                    // 4. ANTI-PATRÓN: Olvidar return después de error
                    // ─────────────────────────────────────────────

                    console.log('\n4️⃣  Anti-patrón: olvidar return después de error:\n');

                    console.log('   🚫 MAL (sin return):');
                    console.log('   fs.readFile(ruta, (err, data) => {');
                    console.log('     if (err) {');
                    console.log('       console.log("Error!");');
                    console.log('       // ❌ Sin return! El código sigue ejecutándose');
                    console.log('     }');
                    console.log('     procesarDatos(data); // 💥 data es undefined!');
                    console.log('   });\n');

                    console.log('   ✅ BIEN (con return):');
                    console.log('   fs.readFile(ruta, (err, data) => {');
                    console.log('     if (err) {');
                    console.log('       console.log("Error!");');
                    console.log('       return; // ✅ Salimos inmediatamente');
                    console.log('     }');
                    console.log('     procesarDatos(data); // Solo se ejecuta sin error');
                    console.log('   });\n');

                    // Limpieza
                    fs.unlinkSync(path.join(dataDir, 'error-test.txt'));

                    console.log('═══════════════════════════════════════');
                    console.log('  FIN — Errores con Callbacks');
                    console.log('  Siguiente: node 03-promises/01-readwrite.js');
                    console.log('═══════════════════════════════════════\n');
                });
            });
        });
    });

    // ↑ ¿Ves? Incluso un ejemplo de errores se convierte en
    //   callback hell. Otra razón más para usar Promises. 😅

}, 300);