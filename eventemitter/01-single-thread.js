/**
 * ═══════════════════════════════════════════════════════════════
 * 01-event-loop/01-single-thread.js — Node.js tiene UN solo hilo
 * ═══════════════════════════════════════════════════════════════
 * 
 * CONCEPTO CLAVE:
 * Node.js ejecuta tu código JavaScript en UN SOLO HILO.
 * No hay "hilos paralelos" como en Java o C#.
 * 
 * Entonces, ¿cómo puede atender a 10.000 usuarios a la vez?
 * Porque las operaciones lentas (disco, red, DB) las delega
 * al sistema operativo, y mientras tanto sigue ejecutando código.
 * 
 * Es como un chef que mete 5 cosas al horno y mientras corta verduras.
 * No necesita 5 ayudantes — solo necesita NO quedarse mirando el horno.
 * 
 * Ejecutar: node 01-event-loop/01-single-thread.js
 */

console.log('═══════════════════════════════════════');
console.log('  Node.js — Un solo hilo de ejecución');
console.log('═══════════════════════════════════════\n');

// ─────────────────────────────────────────────────
// 1. DEMOSTRACIÓN: Todo es secuencial en el hilo principal
// ─────────────────────────────────────────────────

console.log('1️⃣  El código síncrono se ejecuta línea por línea:\n');

console.log('   Línea 1 - se ejecuta primero');
console.log('   Línea 2 - se ejecuta segunda');
console.log('   Línea 3 - se ejecuta tercera');

// Hasta aquí, igual que PHP, Python, Java...

// ─────────────────────────────────────────────────
// 2. ¿Qué pasa si una operación tarda mucho?
// ─────────────────────────────────────────────────

console.log('\n2️⃣  Simulando operación que bloquea (bucle pesado):\n');

console.log('   Antes del bucle pesado...');

const inicio = Date.now();

// Este bucle BLOQUEA el hilo principal
// Nada más se ejecuta hasta que termine
let suma = 0;
for (let i = 0; i < 100_000_000; i++) {
  suma += i;
}

const duracion = Date.now() - inicio;
console.log(`   Bucle terminado en ${duracion}ms (resultado: ${suma})`);
console.log('   ⚠️  Durante esos milisegundos, Node.js NO podía hacer NADA más');

// ─────────────────────────────────────────────────
// 3. SOLUCIÓN: Delegar operaciones lentas
// ─────────────────────────────────────────────────

console.log('\n3️⃣  La solución: delegar al sistema operativo\n');

console.log('   Cuando haces fs.readFile() o http.get():');
console.log('   1. Node.js le dice al SO: "lee este archivo"');
console.log('   2. Node.js sigue ejecutando tu código');
console.log('   3. El SO lee el archivo en background');
console.log('   4. Cuando termina, avisa a Node.js');
console.log('   5. Node.js ejecuta tu callback/promise\n');

console.log('   Visualización:');
console.log('   ┌─────────────────────────────────────────────────┐');
console.log('   │ HILO PRINCIPAL (tu código JavaScript)           │');
console.log('   │                                                 │');
console.log('   │  console.log("A")                               │');
console.log('   │  fs.readFile("x.txt", cb) → delega al SO ──┐   │');
console.log('   │  console.log("B")                            │   │');
console.log('   │  http.get(url, cb) → delega al SO ────┐     │   │');
console.log('   │  console.log("C")                      │     │   │');
console.log('   │  ... espera eventos ...                │     │   │');
console.log('   │  [SO avisa: archivo listo] → ejecuta cb│     │   │');
console.log('   │  [SO avisa: HTTP listo] → ejecuta cb ──┘     │   │');
console.log('   │                                               │   │');
console.log('   └─────────────────────────────────────────────────┘');
console.log('                                     │             │');
console.log('   ┌───────────────────────────────────────────────┐');
console.log('   │ SISTEMA OPERATIVO (hilos internos, libuv)     │');
console.log('   │  → Lee archivo del disco                      │');
console.log('   │  → Hace petición HTTP por la red              │');
console.log('   └───────────────────────────────────────────────┘');

// ─────────────────────────────────────────────────
// 4. DEMOSTRACIÓN REAL: setTimeout NO bloquea
// ─────────────────────────────────────────────────

console.log('\n4️⃣  Demostración: setTimeout no bloquea\n');

console.log('   → Lanzando setTimeout de 0ms...');

setTimeout(() => {
  console.log('   → ⏰ setTimeout ejecutado (DESPUÉS de "Fin")');
  console.log('\n═══════════════════════════════════════');
  console.log('  Siguiente: node 01-event-loop/02-execution-order.js');
  console.log('═══════════════════════════════════════\n');
}, 0);

// ⚠️ Aunque es 0ms, este console.log se ejecuta ANTES que el setTimeout
// Porque setTimeout SIEMPRE se pone en la cola y espera su turno
console.log('   → "Fin del script" (se ejecuta ANTES del setTimeout!)');
console.log('   → ¿Por qué? Porque el código síncrono SIEMPRE va primero.');
console.log('   → setTimeout espera en la "callback queue" su turno.');
