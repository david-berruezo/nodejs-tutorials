/**
 * ═══════════════════════════════════════════════════════════════
 * 02-eventemitter/01-basics.js — EventEmitter: La clase fundamental
 * ═══════════════════════════════════════════════════════════════
 * 
 * EventEmitter es el PATRÓN CENTRAL de Node.js.
 * Casi todo en Node.js es un EventEmitter:
 * - Servidores HTTP emiten 'request'
 * - Streams emiten 'data', 'end', 'error'
 * - process emite 'exit', 'uncaughtException'
 * 
 * Es el patrón "Observer" / "Pub-Sub":
 * - Un objeto EMITE eventos (publish)
 * - Otros objetos ESCUCHAN esos eventos (subscribe)
 * 
 * Piensa en ello como addEventListener del navegador,
 * pero para TODO en Node.js.
 * 
 * Ejecutar: node 02-eventemitter/01-basics.js
 */

// EventEmitter está en el módulo 'events'
const EventEmitter = require('events');

console.log('═══════════════════════════════════════');
console.log('  EventEmitter — Fundamentos');
console.log('═══════════════════════════════════════\n');

// ─────────────────────────────────────────────────
// 1. Crear un EventEmitter y emitir eventos
// ─────────────────────────────────────────────────

console.log('1️⃣  Crear, escuchar (on) y emitir (emit):\n');

// Creamos una instancia
const emisor = new EventEmitter();

// .on(evento, callback) → escuchar un evento
// Es como addEventListener() en el navegador
emisor.on('saludo', (nombre) => {
  console.log(`   👋 ¡Hola ${nombre}!`);
});

// Podemos registrar MÚLTIPLES listeners para el mismo evento
emisor.on('saludo', (nombre) => {
  console.log(`   📝 Log: se saludó a ${nombre}`);
});

// .emit(evento, ...argumentos) → disparar el evento
// Todos los listeners registrados se ejecutan en orden
emisor.emit('saludo', 'David');
emisor.emit('saludo', 'Ana');

console.log();

// ─────────────────────────────────────────────────
// 2. once — escuchar solo UNA vez
// ─────────────────────────────────────────────────

console.log('2️⃣  .once() — escuchar solo una vez:\n');

const servidor = new EventEmitter();

// .once() → el listener se ejecuta UNA VEZ y se auto-elimina
servidor.once('inicio', () => {
  console.log('   🚀 Servidor iniciado (este mensaje solo aparece 1 vez)');
});

servidor.emit('inicio');   // ✅ Se ejecuta
servidor.emit('inicio');   // ❌ No se ejecuta (ya se eliminó)
servidor.emit('inicio');   // ❌ Tampoco

console.log('   Se emitió "inicio" 3 veces, pero el listener solo se ejecutó 1 vez\n');

// ─────────────────────────────────────────────────
// 3. Pasar datos con eventos
// ─────────────────────────────────────────────────

console.log('3️⃣  Pasar datos con los eventos:\n');

const tienda = new EventEmitter();

// Podemos pasar CUALQUIER número de argumentos al emit
tienda.on('venta', (producto, cantidad, precio) => {
  const total = cantidad * precio;
  console.log(`   🛒 Venta: ${cantidad}x ${producto} = ${total}€`);
});

// También podemos pasar un OBJETO (más limpio para muchos datos)
tienda.on('devolucion', ({ producto, motivo, fecha }) => {
  console.log(`   🔄 Devolución: ${producto} — "${motivo}" (${fecha})`);
});

tienda.emit('venta', 'Camiseta', 3, 19.99);
tienda.emit('venta', 'Pantalón', 1, 49.99);
tienda.emit('devolucion', {
  producto: 'Zapatos',
  motivo: 'Talla incorrecta',
  fecha: '2026-02-21'
});

console.log();

// ─────────────────────────────────────────────────
// 4. removeListener / off — dejar de escuchar
// ─────────────────────────────────────────────────

console.log('4️⃣  removeListener / off — dejar de escuchar:\n');

const chat = new EventEmitter();

// Para poder hacer removeListener, la función debe tener NOMBRE
// (no puede ser anónima)
function onMensaje(msg) {
  console.log(`   💬 Mensaje: ${msg}`);
}

chat.on('mensaje', onMensaje);

chat.emit('mensaje', 'Hola');           // ✅ Se ejecuta
chat.emit('mensaje', 'Qué tal');        // ✅ Se ejecuta

chat.removeListener('mensaje', onMensaje);  // ← Eliminamos el listener
// .off() es un alias de .removeListener()
// chat.off('mensaje', onMensaje);  // Lo mismo

chat.emit('mensaje', 'Adiós');         // ❌ No se ejecuta (listener eliminado)
console.log('   Después de removeListener: "Adiós" no se imprimió\n');

// ─────────────────────────────────────────────────
// 5. removeAllListeners — limpiar todo
// ─────────────────────────────────────────────────

console.log('5️⃣  removeAllListeners — limpiar todo:\n');

const radio = new EventEmitter();

radio.on('cancion', () => console.log('   🎵 Listener 1'));
radio.on('cancion', () => console.log('   🎵 Listener 2'));
radio.on('cancion', () => console.log('   🎵 Listener 3'));

console.log(`   Listeners de "cancion": ${radio.listenerCount('cancion')}`);

radio.emit('cancion');   // Los 3 se ejecutan

radio.removeAllListeners('cancion');
console.log(`   Después de removeAll: ${radio.listenerCount('cancion')} listeners`);

radio.emit('cancion');   // Ninguno se ejecuta

console.log();

// ─────────────────────────────────────────────────
// 6. Métodos útiles
// ─────────────────────────────────────────────────

console.log('6️⃣  Métodos útiles de EventEmitter:\n');

const em = new EventEmitter();

em.on('a', () => {});
em.on('a', () => {});
em.on('b', () => {});
em.once('c', () => {});

// .eventNames() → array con nombres de eventos registrados
console.log(`   eventNames():      ${JSON.stringify(em.eventNames())}`);

// .listenerCount(evento) → número de listeners
console.log(`   listenerCount("a"): ${em.listenerCount('a')}`);

// .listeners(evento) → array de funciones listener
console.log(`   listeners("a"):     [${em.listeners('a').length} funciones]`);

// Límite de listeners (por defecto 10, avisa con warning)
console.log(`   getMaxListeners():  ${em.getMaxListeners()} (default)`);
em.setMaxListeners(20);  // Subir si necesitas más
console.log(`   setMaxListeners(20): ${em.getMaxListeners()}`);

console.log('\n═══════════════════════════════════════');
console.log('  Siguiente: node 02-eventemitter/02-builtin-events.js');
console.log('═══════════════════════════════════════\n');
