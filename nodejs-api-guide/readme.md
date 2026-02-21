# 🧭 Cómo leer la documentación de Node.js — Las 3 APIs

> Antes de escribir una sola línea de Node.js, necesitas entender ESTO.

## El problema que te confunde

Cuando abres https://nodejs.org/docs/latest/api/fs.html ves esto:

```
fs.readFile()         ← ¿Callback?
fs.readFileSync()     ← ¿Sync?
fs/promises readFile  ← ¿Promises?
```

**¿Por qué hay 3 formas de hacer lo mismo?** Porque Node.js evolucionó con el tiempo
y cada forma corresponde a una "era" de JavaScript.

## La analogía del restaurante 🍽️

Imagina que vas a un restaurante y pides comida:

### 🔴 SÍNCRONO (Sync) — "Me quedo de pie en la barra hasta que me sirvan"
```
Tú pides → Te quedas esperando → Te sirven → Sigues con tu vida
```
- **Bloqueas todo**: nadie más puede pedir mientras tú esperas
- Es **simple** pero **ineficiente**
- En Node.js: `fs.readFileSync()`, `fs.writeFileSync()`

### 🟡 CALLBACK — "Me siento, dame un timbre y avísame cuando esté"
```
Tú pides → Te dan un timbre → Te sientas → [timbre suena] → Recoges comida
```
- **No bloqueas**: otros pueden pedir mientras esperas
- Pero si pides muchas cosas, tienes un lío de timbres ("callback hell")
- En Node.js: `fs.readFile(ruta, callback)`

### 🟢 PROMISES (async/await) — "Pido por la app y me avisan con notificación"
```
Tú pides por app → Haces otras cosas → [notificación] → Recoges comida
```
- **No bloqueas** + el código es **limpio y legible**
- Puedes encadenar pedidos fácilmente
- En Node.js: `const fs = require('fs/promises')` + `async/await`

## Mapa visual de la documentación

```
┌──────────────────────────────────────────────────────────────┐
│                    MÓDULO fs DE NODE.JS                       │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │   SYNCHRONOUS  │  │   CALLBACK     │  │   PROMISES     │ │
│  │   (Sync)       │  │   (Original)   │  │   (Moderno)    │ │
│  │                │  │                │  │                │ │
│  │ require('fs')  │  │ require('fs')  │  │require('fs/    │ │
│  │                │  │                │  │  promises')    │ │
│  │                │  │                │  │                │ │
│  │ readFileSync() │  │ readFile()     │  │ readFile()     │ │
│  │ writeFileSync()│  │ writeFile()    │  │ writeFile()    │ │
│  │ mkdirSync()    │  │ mkdir()        │  │ mkdir()        │ │
│  │ readdirSync()  │  │ readdir()      │  │ readdir()      │ │
│  │ unlinkSync()   │  │ unlink()       │  │ unlink()       │ │
│  │ statSync()     │  │ stat()         │  │ stat()         │ │
│  │                │  │                │  │                │ │
│  │ BLOQUEA ❌     │  │ NO BLOQUEA ✅  │  │ NO BLOQUEA ✅  │ │
│  │ Simple ✅      │  │ Callback hell❌│  │ Limpio ✅      │ │
│  │ try/catch      │  │ (err, data)    │  │ async/await    │ │
│  └────────────────┘  └────────────────┘  └────────────────┘ │
│                                                              │
│  ERA: 2009-2012       ERA: 2012-2017      ERA: 2017-HOY     │
│  Uso: scripts,        Uso: legacy,        Uso: RECOMENDADO  │
│       configs              libs antiguas        para todo    │
└──────────────────────────────────────────────────────────────┘
```

## ¿Cómo saber cuál usar?

```
¿Estás en un servidor web (Express, HTTP)?
  → SÍ → Usa PROMISES (async/await) SIEMPRE
  → NO → ¿Es un script simple o configuración inicial?
           → SÍ → Puedes usar SYNC
           → NO → Usa PROMISES
```

**Regla de oro**: En 2026, usa `fs/promises` con `async/await` para casi todo.
Las otras dos formas las necesitas conocer para:
- Leer código antiguo (callbacks)
- Scripts muy simples (sync)
- Entender cómo funciona Node.js por dentro

## Cómo ejecutar los ejemplos

```bash
# Instalar (no necesita dependencias)
cd nodejs-api-guide

# Ejecutar cada ejemplo en orden:
node 01-sync/01-readwrite.js
node 01-sync/02-directory.js
node 01-sync/03-file-info.js

node 02-callbacks/01-readwrite.js
node 02-callbacks/02-callback-hell.js
node 02-callbacks/03-error-handling.js

node 03-promises/01-readwrite.js
node 03-promises/02-chaining.js
node 03-promises/03-parallel.js
node 03-promises/04-real-world.js

node 04-comparison/01-same-task-3-ways.js
node 04-comparison/02-blocking-demo.js
```

## Estructura

```
nodejs-api-guide/
├── README.md
├── 01-sync/              ← API Síncrona
│   ├── 01-readwrite.js
│   ├── 02-directory.js
│   └── 03-file-info.js
├── 02-callbacks/         ← API Callback
│   ├── 01-readwrite.js
│   ├── 02-callback-hell.js
│   └── 03-error-handling.js
├── 03-promises/          ← API Promises (RECOMENDADA)
│   ├── 01-readwrite.js
│   ├── 02-chaining.js
│   ├── 03-parallel.js
│   └── 04-real-world.js
├── 04-comparison/        ← Comparación directa
│   ├── 01-same-task-3-ways.js
│   └── 02-blocking-demo.js
└── data/                 ← Archivos de prueba
```

## Conceptos clave de la documentación oficial

Cuando lees la doc de Node.js, cada función tiene esta estructura:

```
fs.readFile(path[, options], callback)
│           │      │          │
│           │      │          └── callback(err, data) → se llama cuando termina
│           │      └── [opciones] → los corchetes significan OPCIONAL
│           └── path → ruta al archivo (obligatorio)
└── fs. → el módulo
```

```
fsPromises.readFile(path[, options])
│                   │      │
│                   │      └── opciones (opcional)
│                   └── path (obligatorio)
└── Devuelve: Promise<Buffer|string>  → DEVUELVE UNA PROMESA
```

```
fs.readFileSync(path[, options])
│               │      │
│               │      └── opciones (opcional)
│               └── path (obligatorio)
└── Devuelve: <string|Buffer>  → DEVUELVE EL VALOR DIRECTAMENTE
└── Throws → puede lanzar excepción (usar try/catch)
```