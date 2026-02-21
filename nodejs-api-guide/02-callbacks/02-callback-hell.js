/**
 * ═══════════════════════════════════════════════════════════════
 * 02-callbacks/02-callback-hell.js — El problema: "Callback Hell"
 * ═══════════════════════════════════════════════════════════════
 *
 * Este archivo muestra POR QUÉ se inventaron las Promises.
 * Cuando necesitas hacer varias operaciones en secuencia,
 * los callbacks se anidan y el código se vuelve un desastre.
 *
 * Ejecutar: node 02-callbacks/02-callback-hell.js
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

console.log('═══════════════════════════════════════');
console.log('  CALLBACK HELL — "La Pirámide de la Muerte"');
console.log('═══════════════════════════════════════\n');

// ─────────────────────────────────────────────────
// TAREA: Crear directorio → escribir 3 archivos → leerlos → mostrarlos
// ─────────────────────────────────────────────────

// 😱 Esto es "callback hell" — mira cómo se anida:

console.log('Ejecutando tarea con callbacks anidados...\n');

const hellDir = path.join(dataDir, 'callback-hell');

fs.mkdir(hellDir, { recursive: true }, function(err) {                    // nivel 1
    if (err) { console.log('Error mkdir:', err.message); return; }
    console.log('1. ✅ Directorio creado');

    fs.writeFile(path.join(hellDir, 'a.txt'), 'Archivo A', function(err) { // nivel 2
        if (err) { console.log('Error write a:', err.message); return; }
        console.log('2. ✅ Archivo a.txt escrito');

        fs.writeFile(path.join(hellDir, 'b.txt'), 'Archivo B', function(err) { // nivel 3
            if (err) { console.log('Error write b:', err.message); return; }
            console.log('3. ✅ Archivo b.txt escrito');

            fs.writeFile(path.join(hellDir, 'c.txt'), 'Archivo C', function(err) { // nivel 4
                if (err) { console.log('Error write c:', err.message); return; }
                console.log('4. ✅ Archivo c.txt escrito');

                // Ahora leemos los 3 archivos
                fs.readFile(path.join(hellDir, 'a.txt'), 'utf-8', function(err, dataA) { // nivel 5
                    if (err) { console.log('Error read a:', err.message); return; }

                    fs.readFile(path.join(hellDir, 'b.txt'), 'utf-8', function(err, dataB) { // nivel 6
                        if (err) { console.log('Error read b:', err.message); return; }

                        fs.readFile(path.join(hellDir, 'c.txt'), 'utf-8', function(err, dataC) { // nivel 7!
                            if (err) { console.log('Error read c:', err.message); return; }

                            console.log('\n   Resultado final:');
                            console.log(`   a.txt → "${dataA}"`);
                            console.log(`   b.txt → "${dataB}"`);
                            console.log(`   c.txt → "${dataC}"`);

                            console.log('\n   ¿Ves el problema? 7 niveles de indentación.');
                            console.log('   Imagina si tuvieras 20 operaciones...\n');

                            // Limpieza
                            fs.rmSync(hellDir, { recursive: true });

                            console.log('═══════════════════════════════════════');
                            console.log('  SOLUCIÓN → Promises + async/await');
                            console.log('  Ver: 03-promises/02-chaining.js');
                            console.log('═══════════════════════════════════════\n');

                        }); // cierra readFile c
                    }); // cierra readFile b
                }); // cierra readFile a
            }); // cierra writeFile c
        }); // cierra writeFile b
    }); // cierra writeFile a
}); // cierra mkdir

// 😱 ¿Ves la "pirámide" de paréntesis y llaves al final?
// Eso es el "callback hell" o "pyramid of doom"
// Por eso en 2015 se añadieron las PROMISES a JavaScript
// Y en 2017 se añadió async/await que es todavía más limpio