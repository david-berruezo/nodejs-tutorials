/**
 * ═══════════════════════════════════════════════════════════════
 * 04-comparison/02-blocking-demo.js — Demostración VISUAL de bloqueo
 * ═══════════════════════════════════════════════════════════════
 *
 * Este ejemplo demuestra por qué NUNCA debes usar Sync en un servidor.
 * Simula un servidor que recibe peticiones mientras lee un archivo.
 *
 * Ejecutar: node 04-comparison/02-blocking-demo.js
 */

const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

console.log('═══════════════════════════════════════');
console.log('  BLOCKING vs NON-BLOCKING — Demo visual');
console.log('═══════════════════════════════════════\n');

// Creamos un archivo grande para simular una lectura que tarda
const bigFile = path.join(dataDir, 'big-file.txt');
fs.writeFileSync(bigFile, 'X'.repeat(50 * 1024 * 1024)); // 50MB
console.log('Archivo de 50MB creado para la prueba.\n');

// ─────────────────────────────────────────────────
// Simulamos "peticiones de usuario" con setInterval
// (cada 100ms llega un usuario nuevo)
// ─────────────────────────────────────────────────

// ═══════════════════════════════════════════════════
// DEMO 1: SYNC (bloqueante)
// ═══════════════════════════════════════════════════

console.log('🔴 PRUEBA 1: Leyendo con readFileSync (BLOQUEA)...\n');
console.log('   Simulando peticiones cada 100ms mientras se lee el archivo:');

let peticionesSync = 0;
const intervalSync = setInterval(() => {
    peticionesSync++;
    // Este log NO se va a imprimir hasta que readFileSync termine
    // porque Sync BLOQUEA el event loop
}, 100);

const inicioSync = Date.now();

// Esta línea BLOQUEA todo el programa hasta que termine de leer 50MB
const dataSync = fs.readFileSync(bigFile);

clearInterval(intervalSync);

const tiempoSync = Date.now() - inicioSync;
console.log(`   Tiempo de lectura: ${tiempoSync}ms`);
console.log(`   Peticiones atendidas durante la lectura: ${peticionesSync}`);
console.log(`   ⚠️  ¡CERO peticiones! Todo estuvo BLOQUEADO ${tiempoSync}ms\n`);

// ═══════════════════════════════════════════════════
// DEMO 2: ASYNC (no bloqueante)
// ═══════════════════════════════════════════════════

console.log('🟢 PRUEBA 2: Leyendo con fs/promises (NO BLOQUEA)...\n');
console.log('   Simulando peticiones cada 100ms mientras se lee el archivo:');

async function demoAsync() {
    let peticionesAsync = 0;
    const intervalAsync = setInterval(() => {
        peticionesAsync++;
    }, 100);

    const inicioAsync = Date.now();

    // Esta línea NO bloquea — el event loop sigue atendiendo peticiones
    const dataAsync = await fsPromises.readFile(bigFile);

    clearInterval(intervalAsync);

    const tiempoAsync = Date.now() - inicioAsync;
    console.log(`   Tiempo de lectura: ${tiempoAsync}ms`);
    console.log(`   Peticiones atendidas durante la lectura: ${peticionesAsync}`);
    console.log(`   ✅ ¡${peticionesAsync} peticiones atendidas mientras se leía!\n`);

    // ─────────────────────────────────────────────
    // Resumen
    // ─────────────────────────────────────────────

    console.log('═══════════════════════════════════════════════════');
    console.log('  RESULTADO:');
    console.log(`  🔴 Sync:    ${tiempoSync}ms, ${peticionesSync} peticiones atendidas`);
    console.log(`  🟢 Async:   ${tiempoAsync}ms, ${peticionesAsync} peticiones atendidas`);
    console.log('═══════════════════════════════════════════════════\n');

    console.log('  Conclusión:');
    console.log('  En un servidor con 1000 usuarios, si un usuario pide');
    console.log('  un archivo grande con readFileSync, los otros 999');
    console.log(`  usuarios esperan ${tiempoSync}ms sin respuesta. 😱`);
    console.log('  Con async, todos siguen recibiendo respuestas.\n');

    // Limpieza
    fs.unlinkSync(bigFile);
}

demoAsync().catch(console.error);