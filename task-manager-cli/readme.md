# 📝 Task Manager CLI

> Gestión de tareas desde terminal con Node.js puro — sin frameworks, solo módulos nativos.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tests](https://img.shields.io/badge/Tests-Jest-C21325?logo=jest&logoColor=white)

## ¿Qué es?

Una aplicación de línea de comandos para gestionar tareas con prioridades, filtros y estadísticas. Construida 100% con módulos nativos de Node.js como primer proyecto para aprender los fundamentos.

## Qué aprendes con este proyecto

- **`fs` module** — Leer y escribir archivos (persistencia con JSON)
- **`path` module** — Construcción de rutas multiplataforma
- **`process.argv`** — Parsear argumentos de línea de comandos
- **Módulos CommonJS** — `require` / `module.exports`
- **Métodos de Array** — `find`, `filter`, `map`, `sort`, `splice`
- **Error handling** — `try/catch`, errores personalizados
- **Testing con Jest** — Tests unitarios, describe/it, expect

## Instalación

```bash
git clone https://github.com/david-berruezo/nodejs-tutorials.git
cd nodejs-tutorials/projects/task-manager-cli
npm install
```

## Uso

```bash
# Añadir tareas
node src/index.js add "Comprar leche"
node src/index.js add "Entregar informe" --priority high
node src/index.js add "Leer libro" --priority low

# Listar tareas
node src/index.js list
node src/index.js list --status pending
node src/index.js list --priority high

# Completar una tarea
node src/index.js done 1

# Editar una tarea
node src/index.js edit 2 "Entregar informe Q1"

# Eliminar una tarea
node src/index.js delete 3

# Ver estadísticas
node src/index.js stats

# Ayuda
node src/index.js help
```

## Ejemplo de salida

```
📋 Tareas:
  ─────────────────────────────────────────
  ⬜ [1] 🔴 Entregar informe Q1  (21/2/2026)
  ✅ [2] 🟡 Comprar leche  (21/2/2026)
  ⬜ [3] 🟢 Leer libro  (21/2/2026)
  ─────────────────────────────────────────
  Total: 3 tarea(s)
```

```
📊 Estadísticas:
  ─────────────────────────────────────────
  Total:       3
  Pendientes:  2
  Completadas: 1

  Pendientes por prioridad:
    🔴 Alta:   1
    🟡 Media:  0
    🟢 Baja:   1

  Progreso: [██████░░░░░░░░░░░░░░] 33%
```

## Estructura del proyecto

```
task-manager-cli/
├── src/
│   ├── index.js          ← Punto de entrada, parseo de comandos CLI
│   ├── taskManager.js    ← Lógica de negocio (CRUD de tareas)
│   └── storage.js        ← Capa de persistencia (lectura/escritura JSON)
├── tests/
│   └── taskManager.test.js  ← Tests unitarios con Jest
├── data/
│   └── tasks.json        ← Base de datos local (se crea automáticamente)
├── package.json
├── .gitignore
└── README.md
```

## Tests

```bash
npm test
```

Los tests cubren:
- Creación de tareas con validación
- Listado con filtros (status, prioridad)
- Completar tareas (incluido manejo de errores)
- Eliminación de tareas
- Edición de tareas
- Estadísticas

## Conceptos clave de Node.js

| Concepto | Dónde se usa | Descripción |
|----------|-------------|-------------|
| `fs.readFileSync` | storage.js | Lectura síncrona de archivos |
| `fs.writeFileSync` | storage.js | Escritura síncrona de archivos |
| `path.join` | storage.js | Rutas seguras multiplataforma |
| `process.argv` | index.js | Argumentos de línea de comandos |
| `module.exports` | todos | Exportar funciones entre módulos |
| `require()` | todos | Importar módulos |
| `JSON.parse/stringify` | storage.js | Serialización de datos |
| `Array.find/filter` | taskManager.js | Búsqueda y filtrado |
| `Object.freeze` | taskManager.js | Enums inmutables |
| `process.exit` | index.js | Códigos de salida |

## Tecnologías

- **Node.js** v18+ (solo módulos nativos: fs, path, process)
- **Jest** para testing
- **JSON** como almacenamiento persistente

## Autor

**David Berruezo** — [davidberruezo.com](https://www.davidberruezo.com)

## Licencia

MIT