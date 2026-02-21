/**
 * ═══════════════════════════════════════════════════════════════
 * 03-promises/01-readwrite.js — API PROMISES: La forma MODERNA
 * ═══════════════════════════════════════════════════════════════
 *
 * Esta es la API que DEBES usar en 2026.
 * Es asíncrona (como callbacks) pero con código LIMPIO.
 *
 * DIFERENCIA CLAVE:
 *   require('fs')           → Sync + Callbacks
 *   require('fs/promises')  → Promises (async/await)
 *      ↑ FÍJATE: es otro import diferente!
 *
 * ¿Qué es una Promise?
 * Es un objeto que representa "algo que pasará en el futuro".
 * - PENDING  → La operación está en curso
 * - FULFILLED → La operación terminó OK (tiene el resultado)
 * - REJECTED  → La operación falló (tiene el error)
 *
 * ¿Qué es async/await?
 * - async → marca una función como "aquí dentro voy a esperar cosas"
 * - await → "para aquí hasta que esta Promise se resuelva"
 *
 * Ejecutar: node 03-promises/01-readwrite.js
 */

// ⚠️ IMPORTACIÓN DIFERENTE: 'fs/promises' en vez de solo 'fs'
const fs = require('fs/promises');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

console.log('═══════════════════════════════════════');
console.log('  API PROMISES — fs/promises + async/await');
console.log('═══════════════════════════════════════\n');

// ─────────────────────────────────────────────────
// Una función async/await
// ─────────────────────────────────────────────────
// "async" delante de function = esta función puede usar "await"
// "await" delante de una Promise = espera a que termine

async function main() {

    // ─────────────────────────────────────────────
    // 1. ESCRIBIR un archivo
    // ─────────────────────────────────────────────
    // await fs.writeFile() → espera a que termine de escribir
    // Sin await, seguiría sin esperar (como los callbacks)

    console.log('1️⃣  Escribiendo archivo...');

    await fs.writeFile(
        path.join(dataDir, 'ejemplo-promises.txt'),
        'Hola desde Promises!\nMucho más limpio que callbacks.\nTercera línea.',
        'utf-8'
    );
    // ↑ El programa ESPERA aquí hasta que se escriba
    //   pero NO bloquea como Sync (otros procesos pueden seguir)

    console.log('   ✅ Archivo escrito\n');

    // ─────────────────────────────────────────────
    // 2. LEER un archivo
    // ─────────────────────────────────────────────

    console.log('2️⃣  Leyendo archivo...');

    const contenido = await fs.readFile(
        path.join(dataDir, 'ejemplo-promises.txt'),
        'utf-8'
    );

    console.log('   Contenido:');
    contenido.split('\n').forEach(line => console.log(`   │ ${line}`));
    console.log();

    // ─────────────────────────────────────────────
    // 3. INFORMACIÓN del archivo
    // ─────────────────────────────────────────────

    console.log('3️⃣  Info del archivo (stat)...');

    const stats = await fs.stat(path.join(dataDir, 'ejemplo-promises.txt'));
    console.log(`   Tamaño: ${stats.size} bytes`);
    console.log(`   Modificado: ${stats.mtime.toLocaleString('es-ES')}`);
    console.log();

    // ─────────────────────────────────────────────
    // 4. CREAR directorio
    // ─────────────────────────────────────────────

    console.log('4️⃣  Creando directorio...');

    await fs.mkdir(path.join(dataDir, 'promises-test'), { recursive: true });
    console.log('   ✅ Directorio creado\n');

    // ─────────────────────────────────────────────
    // 5. LISTAR directorio
    // ─────────────────────────────────────────────

    console.log('5️⃣  Listando directorio data/...');

    const entries = await fs.readdir(dataDir, { withFileTypes: true });
    entries.forEach(entry => {
        const tipo = entry.isDirectory() ? '📁' : '📄';
        console.log(`   ${tipo} ${entry.name}`);
    });
    console.log();

    // ─────────────────────────────────────────────
    // 6. MANEJO DE ERRORES con try/catch
    // ─────────────────────────────────────────────
    // Con async/await, los errores se manejan IGUAL que con Sync:
    // try/catch. Mucho más natural que el error-first callback.

    console.log('6️⃣  Manejo de errores...');

    try {
        await fs.readFile('/ruta/que/no/existe.txt', 'utf-8');
    } catch (error) {
        console.log(`   Error capturado con try/catch:`);
        console.log(`   Código: ${error.code}`);
        console.log(`   Mensaje: ${error.message.split(',')[0]}`);
    }
    console.log();

    // ─────────────────────────────────────────────
    // 7. JSON con promises
    // ─────────────────────────────────────────────

    console.log('7️⃣  JSON con promises...');

    const datos = {
        framework: 'Express.js',
        version: '4.18',
        features: ['routing', 'middleware', 'templates']
    };

    // Escribir JSON
    await fs.writeFile(
        path.join(dataDir, 'datos-promises.json'),
        JSON.stringify(datos, null, 2),
        'utf-8'
    );

    // Leer JSON
    const raw = await fs.readFile(path.join(dataDir, 'datos-promises.json'), 'utf-8');
    const parsed = JSON.parse(raw);
    console.log(`   Framework: ${parsed.framework} v${parsed.version}`);
    console.log(`   Features: ${parsed.features.join(', ')}`);

    // ─────────────────────────────────────────────
    // Limpieza
    // ─────────────────────────────────────────────
    await fs.rm(path.join(dataDir, 'promises-test'), { recursive: true });

    console.log('\n═══════════════════════════════════════');
    console.log('  FIN — Promises básico');
    console.log('  Siguiente: node 03-promises/02-chaining.js');
    console.log('═══════════════════════════════════════\n');
}


fs.writeFile(
    path.join(dataDir, 'ejemplo-promises-2.txt'),
    'Hola desde Promises!\nMucho más limpio que callbacks.\nTercera línea.',
    'utf-8'
).then((valor)=>{
    console.log("hay valor: "+valor);
});

fs.readFile(
    path.join(dataDir, 'ejemplo-promises-2.txt'),
    'utf-8'
).then((valor)=>{
    console.log("hay valor: "+valor);
})


// ─────────────────────────────────────────────────
// EJECUTAR la función async
// ─────────────────────────────────────────────────
// Una función async devuelve una Promise
// .catch() captura errores no manejados

main().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});