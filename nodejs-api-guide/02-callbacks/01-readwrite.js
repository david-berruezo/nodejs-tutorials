/**
 * ═══════════════════════════════════════════════════════════════
 * 02-callbacks/01-readwrite.js — API CALLBACK: Leer y escribir
 * ═══════════════════════════════════════════════════════════════
 *
 * La API Callback es la ORIGINAL de Node.js (2009).
 * Es ASÍNCRONA: no bloquea el programa mientras trabaja.
 *
 * PATRÓN: Todas las funciones callback de Node.js siguen esta firma:
 *
 *   fs.operacion(argumentos, function(error, resultado) {
 *       if (error) {
 *           // algo salió mal
 *       }
 *       // aquí tienes el resultado
 *   });
 *
 * El callback SIEMPRE tiene:
 *   - Primer argumento: error (null si todo OK)
 *   - Segundo argumento: resultado (los datos)
 *
 * Esto se llama "Error-first callback" y es un PATRÓN de Node.js.
 * Lo verás en TODA la documentación antigua.
 *
 * Ejecutar: node 02-callbacks/01-readwrite.js
 */

const fs = require('fs');  // ← Mismo módulo que sync, MISMA importación
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

console.log('═══════════════════════════════════════');
console.log('  API CALLBACK — fs.readFile(), fs.writeFile()');
console.log('═══════════════════════════════════════\n');

// ─────────────────────────────────────────────────
// CONCEPTO CLAVE: El orden de ejecución NO es lineal
// ─────────────────────────────────────────────────

console.log('🔵 ANTES de escribir archivo');

// fs.writeFile es ASÍNCRONO
// Le pasamos una función (callback) que Node.js ejecutará DESPUÉS
fs.writeFile(
    path.join(dataDir, 'ejemplo-callback.txt'),
    'Hola desde la API Callback!\nSegunda línea.\nTercera línea.',
    'utf-8',
    function(error) {                       // ← Este es el CALLBACK
        if (error) {
            console.log('❌ Error escribiendo:', error.message);
            return;
        }
        console.log('🟢 Archivo ESCRITO (dentro del callback de writeFile)');

        // Ahora leemos el archivo DENTRO del callback de escritura
        // porque necesitamos que la escritura haya terminado primero
        fs.readFile(
            path.join(dataDir, 'ejemplo-callback.txt'),
            'utf-8',
            function(error, data) {             // ← Otro CALLBACK anidado
                if (error) {
                    console.log('❌ Error leyendo:', error.message);
                    return;
                }
                console.log('🟢 Archivo LEÍDO (dentro del callback de readFile)');
                console.log('   Contenido:');
                data.split('\n').forEach(line => console.log(`   │ ${line}`));
                console.log();

                // ¡IMPORTANTE! Fíjate en la INDENTACIÓN
                // Estamos dentro de un callback, dentro de otro callback
                // Esto ya empieza a ser difícil de leer... 🤔
            }
        );
    }
);

// ⚠️ ESTA LÍNEA SE EJECUTA ANTES que los callbacks de arriba!
// Porque writeFile y readFile son ASÍNCRONOS
console.log('🔵 DESPUÉS de llamar a writeFile (pero ANTES de que termine!)');
console.log('   Node.js NO espera a que el archivo se escriba.');
console.log('   Sigue ejecutando código mientras el disco trabaja.\n');

// ─────────────────────────────────────────────────
// PREGUNTA: ¿Por qué el log de DESPUÉS sale ANTES?
// ─────────────────────────────────────────────────
//
// Porque Node.js funciona así:
//
// 1. console.log('ANTES')            → se ejecuta AHORA
// 2. fs.writeFile(... callback)      → se LANZA la operación, Node.js sigue
// 3. console.log('DESPUÉS')          → se ejecuta AHORA
//    [el disco sigue escribiendo en background]
// 4. [disco termina] → Node.js ejecuta el callback de writeFile
// 5. fs.readFile(... callback)       → se LANZA otra operación
//    [el disco sigue leyendo en background]
// 6. [disco termina] → Node.js ejecuta el callback de readFile
//
// Esto es el "Event Loop" de Node.js — lo más importante de entender.

// ─────────────────────────────────────────────────
// EJEMPLO 2: Error handling con callbacks
// ─────────────────────────────────────────────────

// Intentamos leer un archivo que no existe
fs.readFile('/archivo/que/no/existe.txt', 'utf-8', function(error, data) {
    if (error) {
        console.log('🔴 Error controlado:');
        console.log(`   Código: ${error.code}`);      // ENOENT
        console.log(`   Mensaje: ${error.message.split(',')[0]}`);
        // Con callbacks, NUNCA hacemos throw error
        // porque no hay un try/catch que lo atrape
        // simplemente manejamos el error aquí dentro
        return;
    }
    // Este código NO se ejecuta si hay error
    console.log(data);
});