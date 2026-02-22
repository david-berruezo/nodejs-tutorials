# 🔄 Node.js Events y Event Loop

> El Event Loop es el MOTOR de Node.js. Sin entenderlo, nada tiene sentido.

## ¿Por qué es importante?

En el tutorial anterior aprendiste que hay 3 formas de hacer operaciones (sync, callback, promises).
Pero ¿POR QUÉ existen callbacks y promises? ¿Qué pasa por debajo cuando haces `await`?

La respuesta es el **Event Loop**. Es el mecanismo que permite a Node.js hacer miles de cosas
"a la vez" usando UN SOLO HILO de ejecución.

## La analogía del camarero 🧑‍🍳

**PHP/Java** = Un camarero por mesa.
- 100 mesas = necesitas 100 camareros
- Si un camarero espera a que la cocina termine, no atiende a nadie más

**Node.js** = UN solo camarero para todas las mesas.
- Toma el pedido de mesa 1 → lo manda a cocina
- NO se queda esperando → va a mesa 2, toma pedido
- Va a mesa 3, toma pedido
- [cocina avisa: pedido de mesa 1 listo] → lo sirve
- Sigue con mesa 4...

Ese camarero es el **Event Loop**.

## Estructura del tutorial

```
nodejs-events/
├── README.md
├── 01-event-loop/           ← Cómo funciona el Event Loop
│   ├── 01-single-thread.js      Demostración del hilo único
│   ├── 02-execution-order.js    Orden de ejecución (fundamental!)
│   ├── 03-timers.js             setTimeout, setInterval, setImmediate
│   └── 04-microtasks.js         process.nextTick vs Promise (avanzado)
├── 02-eventemitter/         ← La clase EventEmitter
│   ├── 01-basics.js             on, emit, once, removeListener
│   ├── 02-builtin-events.js     Eventos en módulos nativos (process, fs)
│   └── 03-error-event.js        El evento 'error' especial
├── 03-custom-events/        ← Crear tus propios eventos
│   ├── 01-custom-emitter.js     Extender EventEmitter
│   ├── 02-file-monitor.js       Ejemplo práctico: monitor de archivos
│   └── 03-task-runner.js        Ejemplo práctico: ejecutor de tareas
├── 04-patterns/             ← Patrones del mundo real
│   ├── 01-observer-pattern.js   Patrón Observer con eventos
│   └── 02-event-driven-app.js   App completa event-driven
└── data/
```

## Ejecutar

```bash
# En orden (cada uno referencia al anterior):
node 01-event-loop/01-single-thread.js
node 01-event-loop/02-execution-order.js
node 01-event-loop/03-timers.js
node 01-event-loop/04-microtasks.js

node 02-eventemitter/01-basics.js
node 02-eventemitter/02-builtin-events.js
node 02-eventemitter/03-error-event.js

node 03-custom-events/01-custom-emitter.js
node 03-custom-events/02-file-monitor.js
node 03-custom-events/03-task-runner.js

node 04-patterns/01-observer-pattern.js
node 04-patterns/02-event-driven-app.js
```

## Conceptos clave

| Concepto | Qué es | Dónde se aprende |
|----------|--------|-----------------|
| Event Loop | El bucle que gestiona callbacks y eventos | 01-event-loop/ |
| Call Stack | La pila de funciones que se están ejecutando | 01-single-thread.js |
| Callback Queue | Cola donde esperan los callbacks (setTimeout, I/O) | 02-execution-order.js |
| Microtask Queue | Cola prioritaria (Promises, process.nextTick) | 04-microtasks.js |
| EventEmitter | Clase base para emitir y escuchar eventos | 02-eventemitter/ |
| Observer Pattern | Patrón de diseño "publicar/suscribir" | 04-patterns/ |
