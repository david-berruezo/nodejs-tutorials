/**
 * ═══════════════════════════════════════════════════════════════
 * 04-comparison/01-same-task-3-ways.js
 * LA MISMA TAREA con las 3 APIs — Comparación directa
 * ═══════════════════════════════════════════════════════════════
 *
 * TAREA: Leer un JSON, modificarlo, guardarlo y confirmar
 *
 * Esto es EXACTAMENTE lo que necesitas entender para leer
 * la documentación de Node.js sin confundirte.
 *
 * Ejecutar: node 04-comparison/01-same-task-3-ways.js
 */

const fsSync = require('fs');               // Para Sync y Callbacks
const fsPromises = require('fs/promises');   // Para Promises
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

console.log('═══════════════════════════════════════');
console.log('  COMPARACIÓN — La misma tarea, 3 formas');
console.log('═══════════════════════════════════════\n');

// Preparar datos iniciales
const datosIniciales = {
    app: 'NodeJS Tutorial',
    version: '1.0.0',
    visitas: 0,
    ultimaVisita: null
};

// ═══════════════════════════════════════════════════
// FORMA 1: SÍNCRONA
// ═══════════════════════════════════════════════════

function tareaSync() {
    console.log('🔴 FORMA 1: SÍNCRONA');
    console.log('   require("fs") + *Sync()\n');

    const archivo = path.join(dataDir, 'config-sync.json');

    try {
        // 1. Escribir el JSON inicial
        fsSync.writeFileSync(archivo, JSON.stringify(datosIniciales, null, 2));
        console.log('   1. Archivo creado');

        // 2. Leer el archivo
        const raw = fsSync.readFileSync(archivo, 'utf-8');
        const datos = JSON.parse(raw);
        console.log(`   2. Leído: visitas=${datos.visitas}`);

        // 3. Modificar
        datos.visitas += 1;
        datos.ultimaVisita = new Date().toISOString();

        // 4. Guardar de nuevo
        fsSync.writeFileSync(archivo, JSON.stringify(datos, null, 2));
        console.log(`   3. Guardado: visitas=${datos.visitas}`);

        // 5. Verificar
        const verificacion = JSON.parse(fsSync.readFileSync(archivo, 'utf-8'));
        console.log(`   4. Verificado: visitas=${verificacion.visitas} ✅`);

        // Limpiar
        fsSync.unlinkSync(archivo);

    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    console.log();
}

// ═══════════════════════════════════════════════════
// FORMA 2: CALLBACKS
// ═══════════════════════════════════════════════════

function tareaCallback() {
    return new Promise((resolve) => {
        console.log('🟡 FORMA 2: CALLBACKS');
        console.log('   require("fs") + callback(err, data)\n');

        const archivo = path.join(dataDir, 'config-callback.json');

        // 1. Escribir
        fsSync.writeFile(archivo, JSON.stringify(datosIniciales, null, 2), (err) => {
            if (err) { console.log('   ❌', err.message); resolve(); return; }
            console.log('   1. Archivo creado');

            // 2. Leer
            fsSync.readFile(archivo, 'utf-8', (err, raw) => {
                if (err) { console.log('   ❌', err.message); resolve(); return; }
                const datos = JSON.parse(raw);
                console.log(`   2. Leído: visitas=${datos.visitas}`);

                // 3. Modificar
                datos.visitas += 1;
                datos.ultimaVisita = new Date().toISOString();

                // 4. Guardar
                fsSync.writeFile(archivo, JSON.stringify(datos, null, 2), (err) => {
                    if (err) { console.log('   ❌', err.message); resolve(); return; }
                    console.log(`   3. Guardado: visitas=${datos.visitas}`);

                    // 5. Verificar
                    fsSync.readFile(archivo, 'utf-8', (err, raw2) => {
                        if (err) { console.log('   ❌', err.message); resolve(); return; }
                        const verificacion = JSON.parse(raw2);
                        console.log(`   4. Verificado: visitas=${verificacion.visitas} ✅`);

                        // Limpiar
                        fsSync.unlinkSync(archivo);
                        console.log();
                        resolve(); // Para que el programa espere a que termine
                    });
                });
            });
        });
    });
}

// ═══════════════════════════════════════════════════
// FORMA 3: PROMISES (async/await) — LA RECOMENDADA
// ═══════════════════════════════════════════════════

async function tareaPromises() {
    console.log('🟢 FORMA 3: PROMISES (async/await)');
    console.log('   require("fs/promises") + await\n');

    const archivo = path.join(dataDir, 'config-promises.json');

    try {
        // 1. Escribir
        await fsPromises.writeFile(archivo, JSON.stringify(datosIniciales, null, 2));
        console.log('   1. Archivo creado');

        // 2. Leer
        const raw = await fsPromises.readFile(archivo, 'utf-8');
        const datos = JSON.parse(raw);
        console.log(`   2. Leído: visitas=${datos.visitas}`);

        // 3. Modificar
        datos.visitas += 1;
        datos.ultimaVisita = new Date().toISOString();

        // 4. Guardar
        await fsPromises.writeFile(archivo, JSON.stringify(datos, null, 2));
        console.log(`   3. Guardado: visitas=${datos.visitas}`);

        // 5. Verificar
        const verificacion = JSON.parse(await fsPromises.readFile(archivo, 'utf-8'));
        console.log(`   4. Verificado: visitas=${verificacion.visitas} ✅`);

        // Limpiar
        await fsPromises.unlink(archivo);

    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    console.log();
}

// ═══════════════════════════════════════════════════
// EJECUTAR LAS 3 EN ORDEN
// ═══════════════════════════════════════════════════

async function ejecutar() {
    tareaSync();             // Sync: se ejecuta y termina inmediatamente
    await tareaCallback();   // Callback: esperamos a que termine
    await tareaPromises();   // Promises: esperamos a que termine

    console.log('═══════════════════════════════════════════════════');
    console.log('  RESUMEN FINAL');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('  ┌────────────┬──────────────────┬───────────────────┬──────────────────┐');
    console.log('  │            │ 🔴 SYNC          │ 🟡 CALLBACK       │ 🟢 PROMISES      │');
    console.log('  ├────────────┼──────────────────┼───────────────────┼──────────────────┤');
    console.log('  │ Import     │ require("fs")    │ require("fs")     │ require           │');
    console.log('  │            │                  │                   │ ("fs/promises")  │');
    console.log('  ├────────────┼──────────────────┼───────────────────┼──────────────────┤');
    console.log('  │ Función    │ readFileSync()   │ readFile(cb)      │ readFile()       │');
    console.log('  ├────────────┼──────────────────┼───────────────────┼──────────────────┤');
    console.log('  │ Bloquea?   │ SÍ ❌            │ NO ✅             │ NO ✅            │');
    console.log('  ├────────────┼──────────────────┼───────────────────┼──────────────────┤');
    console.log('  │ Errores    │ try/catch        │ if (err) {...}    │ try/catch        │');
    console.log('  ├────────────┼──────────────────┼───────────────────┼──────────────────┤');
    console.log('  │ Legible?   │ ✅ Sí            │ ❌ Anidación      │ ✅ Sí            │');
    console.log('  ├────────────┼──────────────────┼───────────────────┼──────────────────┤');
    console.log('  │ Paralelo?  │ ❌ No            │ Difícil           │ ✅ Promise.all   │');
    console.log('  ├────────────┼──────────────────┼───────────────────┼──────────────────┤');
    console.log('  │ Usar en    │ Scripts,         │ Legacy,           │ TODO lo demás    │');
    console.log('  │            │ configs          │ libs antiguas     │ ⭐ RECOMENDADO   │');
    console.log('  └────────────┴──────────────────┴───────────────────┴──────────────────┘');

    console.log('\n  📖 PARA LEER LA DOCUMENTACIÓN DE NODE.JS:');
    console.log('  Cuando veas una función en la doc, identifica:');
    console.log('  - ¿Tiene "Sync" al final?     → Es síncrona');
    console.log('  - ¿Está en "fs/promises"?      → Devuelve Promise');
    console.log('  - ¿Tiene callback(err, data)?  → Es callback\n');
    console.log('  Todas hacen LO MISMO. Solo cambia CÓMO esperas el resultado.\n');
}

ejecutar().catch(console.error);