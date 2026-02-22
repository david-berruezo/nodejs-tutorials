/**
 * ═══════════════════════════════════════════════════════════════
 * 01-event-loop/02-execution-order.js — Orden de ejecución
 * ═══════════════════════════════════════════════════════════════
 * 
 * ESTE ES EL ARCHIVO MÁS IMPORTANTE DE TODO EL TUTORIAL.
 * Si entiendes el orden de ejecución, entiendes Node.js.
 * 
 * El Event Loop tiene FASES, y cada fase tiene su cola:
 * 
 *   ┌───────────────────────────────────────┐
 *   │          CALL STACK                   │  ← Tu código síncrono
 *   │   (pila de funciones ejecutándose)    │     Se ejecuta PRIMERO
 *   └───────────────┬───────────────────────┘
 *                   │ cuando está vacío...
 *   ┌───────────────▼───────────────────────┐
 *   │       MICROTASK QUEUE                 │  ← process.nextTick()
 *   │   (máxima prioridad)                  │     Promise.then()
 *   └───────────────┬───────────────────────┘     Se ejecuta SEGUNDO
 *                   │ cuando está vacía...
 *   ┌───────────────▼───────────────────────┐
 *   │       CALLBACK QUEUE (macrotasks)     │  ← setTimeout()
 *   │   (timers, I/O, etc.)                 │     setInterval()
 *   └───────────────┬───────────────────────┘     fs callbacks
 *                   │                              Se ejecuta TERCERO
 *                   ▼
 *              (vuelve arriba)
 * 
 * Ejecutar: node 01-event-loop/02-execution-order.js
 */

console.log('═══════════════════════════════════════');
console.log('  Orden de ejecución del Event Loop');
console.log('═══════════════════════════════════════\n');

// ─────────────────────────────────────────────────
// QUIZ: ¿En qué orden se imprimen estos?
// Intenta adivinarlo ANTES de ejecutar el archivo.
// ─────────────────────────────────────────────────

console.log('🧪 QUIZ — Adivina el orden antes de mirar:\n');

// 1. Código síncrono (Call Stack)
console.log('   [1] console.log → SÍNCRONO');

// 2. setTimeout → va a la Callback Queue (macrotask)
setTimeout(() => {
  console.log('   [5] setTimeout(0) → MACROTASK QUEUE');
}, 0);

// 3. Promise.resolve → va a la Microtask Queue
Promise.resolve().then(() => {
  console.log('   [3] Promise.then → MICROTASK QUEUE');
});

// 4. process.nextTick → va a la Microtask Queue (PRIORIDAD sobre Promise)
process.nextTick(() => {
  console.log('   [2] process.nextTick → MICROTASK QUEUE (prioridad)');
});

// 5. Otro setTimeout
setTimeout(() => {
  console.log('   [6] setTimeout(0) segundo → MACROTASK QUEUE');
}, 0);

// 6. Otra Promise
Promise.resolve().then(() => {
  console.log('   [4] Promise.then segundo → MICROTASK QUEUE');
});

// 7. Más código síncrono
console.log('   [1b] console.log → SÍNCRONO (mismo nivel que [1])');

// ─────────────────────────────────────────────────
// Esperamos a que todo se ejecute para mostrar la explicación
// ─────────────────────────────────────────────────

setTimeout(() => {
  console.log('\n═══════════════════════════════════════');
  console.log('  EXPLICACIÓN');
  console.log('═══════════════════════════════════════\n');

  console.log('  El orden correcto es:');
  console.log('  [1]  console.log         → Síncrono (Call Stack)');
  console.log('  [1b] console.log         → Síncrono (Call Stack)');
  console.log('  [2]  process.nextTick    → Microtask (prioridad máxima)');
  console.log('  [3]  Promise.then        → Microtask');
  console.log('  [4]  Promise.then 2º     → Microtask');
  console.log('  [5]  setTimeout          → Macrotask');
  console.log('  [6]  setTimeout 2º       → Macrotask\n');

  console.log('  ¿POR QUÉ este orden?');
  console.log('  ┌────────────────────────────────────────────────┐');
  console.log('  │ 1. CALL STACK: TODO el código síncrono primero │');
  console.log('  │    → [1] y [1b] se ejecutan en orden           │');
  console.log('  │                                                │');
  console.log('  │ 2. MICROTASK QUEUE: cuando el stack está vacío │');
  console.log('  │    → nextTick tiene PRIORIDAD sobre Promise    │');
  console.log('  │    → [2] nextTick primero                      │');
  console.log('  │    → [3] [4] Promises después, en orden FIFO   │');
  console.log('  │                                                │');
  console.log('  │ 3. MACROTASK QUEUE: cuando microtasks vacías   │');
  console.log('  │    → [5] [6] setTimeouts en orden FIFO         │');
  console.log('  └────────────────────────────────────────────────┘\n');

  // ─────────────────────────────────────────────
  // QUIZ 2: Más complejo
  // ─────────────────────────────────────────────

  console.log('═══════════════════════════════════════');
  console.log('  QUIZ 2 — Más complejo');
  console.log('═══════════════════════════════════════\n');

  console.log('  ¿Qué pasa si un callback genera nuevas microtasks?\n');

  setTimeout(() => {
    console.log('   [A] setTimeout');

    // Dentro del setTimeout, generamos una Promise
    Promise.resolve().then(() => {
      console.log('   [B] Promise DENTRO del setTimeout');
    });

    console.log('   [C] Síncrono dentro del setTimeout');
  }, 0);

  setTimeout(() => {
    console.log('   [D] Segundo setTimeout');
  }, 0);

  setTimeout(() => {
    console.log('\n   Orden: A → C → B → D');
    console.log('   ¿Por qué B antes de D?');
    console.log('   Porque entre cada macrotask, el Event Loop');
    console.log('   vacía TODAS las microtasks pendientes.\n');
    console.log('   A (macrotask) → C (síncrono dentro de A)');
    console.log('   → B (microtask generada por A, se ejecuta antes de D)');
    console.log('   → D (siguiente macrotask)\n');

    console.log('═══════════════════════════════════════');
    console.log('  Siguiente: node 01-event-loop/03-timers.js');
    console.log('═══════════════════════════════════════\n');
  }, 10);

}, 100);
