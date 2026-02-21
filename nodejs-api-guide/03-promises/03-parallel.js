/**
 * ═══════════════════════════════════════════════════════════════
 * 03-promises/03-parallel.js — Promises: Operaciones en PARALELO
 * ═══════════════════════════════════════════════════════════════
 *
 * Una VENTAJA enorme de las promises sobre sync y callbacks:
 * puedes lanzar varias operaciones A LA VEZ y esperar a que
 * TODAS terminen.
 *
 * Imagina: tienes que leer 10 archivos.
 * - Sync: los lees uno por uno (10 segundos si cada uno tarda 1s)
 * - Callback: puedes lanzarlos todos pero ¿cómo sabes cuándo terminaron TODOS?
 * - Promise.all: los lanzas todos y await espera a que TODOS terminen (≈1 segundo)
 *
 * Ejecutar: node 03-promises/03-parallel.js
 */

const fs = require('fs/promises');
const fsSync = require('fs');  // También lo importamos para comparar tiempos
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

console.log('═══════════════════════════════════════');
console.log('  PROMISES — Promise.all, Promise.allSettled');
console.log('═══════════════════════════════════════\n');

async function main() {

    const parallelDir = path.join(dataDir, 'parallel-test');
    await fs.mkdir(parallelDir, { recursive: true });

    // ─────────────────────────────────────────────
    // 1. Crear varios archivos EN PARALELO
    // ─────────────────────────────────────────────

    console.log('1️⃣  Creando 5 archivos en PARALELO con Promise.all...\n');

    const archivos = ['uno', 'dos', 'tres', 'cuatro', 'cinco'];

    // Promise.all recibe un ARRAY de promises
    // Espera a que TODAS se resuelvan
    // Si UNA falla, TODAS fallan (fast-fail)

    const inicio = Date.now();

    await Promise.all(
        archivos.map((nombre, i) =>
            fs.writeFile(
                path.join(parallelDir, `${nombre}.txt`),
                `Contenido del archivo "${nombre}" (creado como operación #${i + 1})`
            )
        )
    );

    console.log(`   ✅ 5 archivos creados en ${Date.now() - inicio}ms\n`);

    // ─────────────────────────────────────────────
    // 2. Leer todos los archivos EN PARALELO
    // ─────────────────────────────────────────────

    console.log('2️⃣  Leyendo 5 archivos en PARALELO...\n');

    const inicioLectura = Date.now();

    // Promise.all con readFile devuelve un ARRAY de resultados
    // en el MISMO ORDEN que las promises originales
    const contenidos = await Promise.all(
        archivos.map(nombre =>
            fs.readFile(path.join(parallelDir, `${nombre}.txt`), 'utf-8')
        )
    );

    console.log(`   Leídos en ${Date.now() - inicioLectura}ms`);
    contenidos.forEach((contenido, i) => {
        console.log(`   📄 ${archivos[i]}.txt → "${contenido}"`);
    });
    console.log();

    // ─────────────────────────────────────────────
    // 3. Promise.allSettled — cuando NO quieres que un fallo pare todo
    // ─────────────────────────────────────────────

    console.log('3️⃣  Promise.allSettled (tolera errores)...\n');

    // Promise.all → si UNA falla, todo falla
    // Promise.allSettled → espera a TODAS, te dice cuáles OK y cuáles no

    const resultados = await Promise.allSettled([
        fs.readFile(path.join(parallelDir, 'uno.txt'), 'utf-8'),       // ✅ existe
        fs.readFile(path.join(parallelDir, 'no-existe.txt'), 'utf-8'), // ❌ no existe
        fs.readFile(path.join(parallelDir, 'tres.txt'), 'utf-8'),      // ✅ existe
        fs.readFile(path.join(parallelDir, 'tampoco.txt'), 'utf-8'),   // ❌ no existe
    ]);

    resultados.forEach((resultado, i) => {
        if (resultado.status === 'fulfilled') {
            // La promesa se resolvió OK
            console.log(`   ✅ Operación ${i + 1}: "${resultado.value.substring(0, 40)}..."`);
        } else {
            // La promesa fue rechazada (error)
            console.log(`   ❌ Operación ${i + 1}: ${resultado.reason.code} — ${resultado.reason.path}`);
        }
    });

    // ─────────────────────────────────────────────
    // 4. RESUMEN: Cuándo usar cada Promise.*
    // ─────────────────────────────────────────────

    console.log('\n   ┌──────────────────────────────────────────────────┐');
    console.log('   │ MÉTODO              │ USO                         │');
    console.log('   ├──────────────────────────────────────────────────┤');
    console.log('   │ Promise.all()       │ Todas deben funcionar.      │');
    console.log('   │                     │ Si 1 falla, todo falla.     │');
    console.log('   ├──────────────────────────────────────────────────┤');
    console.log('   │ Promise.allSettled() │ Quiero el resultado de     │');
    console.log('   │                     │ todas, aunque fallen.       │');
    console.log('   ├──────────────────────────────────────────────────┤');
    console.log('   │ Promise.race()      │ La primera que termine      │');
    console.log('   │                     │ gana (timeout, fallback).   │');
    console.log('   ├──────────────────────────────────────────────────┤');
    console.log('   │ Promise.any()       │ La primera que FUNCIONE     │');
    console.log('   │                     │ (ignora fallos).            │');
    console.log('   └──────────────────────────────────────────────────┘');

    // Limpieza
    await fs.rm(parallelDir, { recursive: true });

    console.log('\n═══════════════════════════════════════');
    console.log('  Siguiente: node 04-comparison/01-same-task-3-ways.js');
    console.log('═══════════════════════════════════════\n');
}

main().catch(console.error);