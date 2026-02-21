# Tutorial y ejemplos Node.js

**David Berruezo** | Febrero 2026

---

### GitHub (código fuente organizado)
Estructura del repo `nodejs-tutorials` ampliada, siguiendo los capítulos del libro:

```
nodejs-tutorials/
├── 01-fundamentos/
│   ├── blocking_versus_not_blocking/   
│   ├── events/                          
│   ├── process/                         
│   ├── modules-commonjs/
│   ├── modules-esm/
│   ├── filesystem/
│   ├── streams/
│   └── buffers/
├── 02-npm-packages/
│   ├── creating-package/
│   ├── publishing-package/
│   ├── semantic-versioning/
│   └── scripts-npm/
├── 03-async-programming/
│   ├── callbacks/
│   ├── promises/
│   ├── async-await/
│   ├── event-loop/
│   └── error-handling-async/
├── 04-http-server/
│   ├── http/                            
│   ├── url/                             
│   ├── http-server-basic/
│   ├── routing-manual/
│   ├── serving-static-files/
│   └── https-ssl/
├── 05-express-js/
│   ├── hello-express/
│   ├── middleware/
│   ├── routing/
│   ├── template-engines/
│   ├── error-handling/
│   └── static-files/
├── 06-rest-api/
│   ├── crud-api-memory/
│   ├── crud-api-mongodb/
│   ├── validation-joi/
│   ├── pagination-filtering/
│   └── file-upload-multer/
├── 07-mongodb/
│   ├── connection/
│   ├── crud-operations/
│   ├── mongoose-models/
│   ├── aggregation/
│   └── indexes/
├── 08-auth-security/
│   ├── jwt-basics/
│   ├── bcrypt-passwords/
│   ├── auth-middleware/
│   ├── roles-permissions/
│   └── rate-limiting/
├── 09-testing/
│   ├── jest-basics/
│   ├── supertest-api/
│   ├── mocking/
│   └── integration-tests/
├── 10-deploy-docker/
│   ├── dockerfile-node/
│   ├── docker-compose/
│   ├── pm2-config/
│   └── nginx-reverse-proxy/
└── projects/                 ← Proyectos completos para portfolio
    ├── task-manager-api/
    ├── url-shortener/
    ├── blog-api/
    ├── weather-dashboard/
    ├── chat-realtime/
    ├── ecommerce-api/
    └── job-board-scraper/
```

---

## 20 Proyectos ordenados por dificultad

### NIVEL 1 — Fundamentos (Semanas 1-3)

#### Proyecto 1: CLI Task Manager
**Qué hace**: Aplicación de terminal para gestionar tareas (añadir, listar, completar, eliminar)
**Tecnologías**: Node.js core (fs, readline, process)
**Aprenderás**: Filesystem, módulos, JSON, stdin/stdout
**Carpeta GitHub**: `01-fundamentos/` + `projects/task-manager-cli/`
```
Comandos: node tasks.js add "Comprar leche"
          node tasks.js list
          node tasks.js done 1
          node tasks.js delete 1
```

#### Proyecto 2: File Watcher & Logger
**Qué hace**: Monitoriza cambios en un directorio y genera logs
**Tecnologías**: fs.watch, streams, events
**Aprenderás**: Event emitters, streams de escritura, watchers
**Carpeta GitHub**: `01-fundamentos/` + demo en portfolio

#### Proyecto 3: NPM Package — String Utils
**Qué hace**: Tu propio paquete npm con utilidades para strings (slugify, capitalize, truncate, etc.)
**Tecnologías**: npm, package.json, módulos ESM
**Aprenderás**: Publicar paquetes, semantic versioning, testing básico
**Carpeta GitHub**: `02-npm-packages/creating-package/`
**Extra para portfolio**: Publicar en npmjs.com → link en tu web

#### Proyecto 4: Async Data Fetcher
**Qué hace**: Script que consulta múltiples APIs (weather, quotes, news) en paralelo
**Tecnologías**: fetch/axios, Promise.all, async/await
**Aprenderás**: Programación asíncrona, manejo de errores, concurrencia
**Carpeta GitHub**: `03-async-programming/`

---

### NIVEL 2 — Servidor HTTP y Express (Semanas 4-7)

#### Proyecto 5: HTTP Server desde cero (sin Express)
**Qué hace**: Servidor HTTP que sirve HTML, JSON y archivos estáticos
**Tecnologías**: http module, url module, fs
**Aprenderás**: Protocolo HTTP, routing manual, content types, status codes
**Carpeta GitHub**: `04-http-server/http-server-basic/`

#### Proyecto 6: URL Shortener
**Qué hace**: Acortador de URLs tipo bit.ly
**Tecnologías**: Express, MongoDB/JSON file, nanoid
**Aprenderás**: Express routing, redirects, almacenamiento persistente
**Carpeta GitHub**: `projects/url-shortener/`
**Demo portfolio**: Formulario web + contador de clicks

#### Proyecto 7: REST API — Todo List
**Qué hace**: API CRUD completa para gestionar tareas
**Tecnologías**: Express, middleware, validación con Joi
**Aprenderás**: Patrones REST, middleware, validación, error handling
**Carpeta GitHub**: `06-rest-api/crud-api-memory/`
**Demo portfolio**: Documentación Swagger/OpenAPI integrada

#### Proyecto 8: Blog API
**Qué hace**: API para un blog con posts, categorías y comentarios
**Tecnologías**: Express, MongoDB, Mongoose
**Aprenderás**: Relaciones en MongoDB, populate, paginación
**Carpeta GitHub**: `projects/blog-api/`
**Demo portfolio**: Frontend simple con las llamadas a la API

---

### NIVEL 3 — Base de datos y autenticación (Semanas 8-11)

#### Proyecto 9: User Auth System
**Qué hace**: Sistema completo de registro, login, refresh tokens
**Tecnologías**: Express, MongoDB, JWT, bcrypt
**Aprenderás**: JWT, hashing de passwords, middleware de auth, roles
**Carpeta GitHub**: `08-auth-security/`
**Demo portfolio**: Flow de login/registro con Postman collection

#### Proyecto 10: File Upload Service
**Qué hace**: Servicio para subir, almacenar y servir archivos (imágenes, PDFs)
**Tecnologías**: Express, Multer, Sharp (para redimensionar imágenes)
**Aprenderás**: Multipart forms, file handling, image processing
**Carpeta GitHub**: `06-rest-api/file-upload-multer/`

#### Proyecto 11: E-commerce API
**Qué hace**: API de tienda online (productos, carrito, pedidos, pagos mock)
**Tecnologías**: Express, MongoDB, JWT auth, validación
**Aprenderás**: Lógica de negocio compleja, transacciones, relaciones
**Carpeta GitHub**: `projects/ecommerce-api/`
**Demo portfolio**: Colección Postman completa + diagrama de la API
**RELEVANTE**: Conecta directamente con tu experiencia en WooCommerce

#### Proyecto 12: API Rate Limiter & Security
**Qué hace**: Middleware reutilizable de seguridad (rate limiting, CORS, helmet, sanitización)
**Tecnologías**: express-rate-limit, helmet, cors, hpp
**Aprenderás**: Seguridad en APIs, headers HTTP, protección contra ataques
**Carpeta GitHub**: `08-auth-security/rate-limiting/`

---

### NIVEL 4 — Testing y calidad (Semanas 12-13)

#### Proyecto 13: Testing del Blog API
**Qué hace**: Suite completa de tests para el proyecto 8
**Tecnologías**: Jest, Supertest, mongodb-memory-server
**Aprenderás**: Unit tests, integration tests, mocking, coverage
**Carpeta GitHub**: `09-testing/`
**Demo portfolio**: Badge de coverage en el README

#### Proyecto 14: CI/CD Pipeline
**Qué hace**: GitHub Actions para lint, test y deploy automático
**Tecnologías**: GitHub Actions, ESLint, Docker
**Aprenderás**: Integración continua, automatización, calidad de código
**Carpeta GitHub**: `.github/workflows/` en los proyectos

---

### NIVEL 5 — Avanzado y deploy (Semanas 14-17)

#### Proyecto 15: Real-Time Chat
**Qué hace**: Chat en tiempo real con salas y usuarios online
**Tecnologías**: Express, Socket.io, MongoDB
**Aprenderás**: WebSockets, eventos en tiempo real, presencia de usuarios
**Carpeta GitHub**: `projects/chat-realtime/`
**Demo portfolio**: Aplicación web funcional con frontend

#### Proyecto 16: Weather Dashboard
**Qué hace**: Dashboard del tiempo con datos de múltiples ciudades, caché y gráficos
**Tecnologías**: Express, API externa (OpenWeatherMap), node-cron, Redis/cache
**Aprenderás**: Consumo de APIs externas, caching, cron jobs, SSR
**Carpeta GitHub**: `projects/weather-dashboard/`
**Demo portfolio**: Página web con gráficos interactivos

#### Proyecto 17: Job Board Scraper
**Qué hace**: Scraper que extrae ofertas de trabajo de portales y las sirve como API
**Tecnologías**: Puppeteer/Cheerio, Express, MongoDB, node-cron
**Aprenderás**: Web scraping, scheduling, almacenamiento de datos
**Carpeta GitHub**: `projects/job-board-scraper/`
**RELEVANTE**: Te sirve literalmente para tu búsqueda de empleo

#### Proyecto 18: Docker Deployment
**Qué hace**: Dockerizar el proyecto e-commerce con docker-compose (Node + MongoDB + Nginx)
**Tecnologías**: Docker, docker-compose, Nginx, PM2
**Aprenderás**: Contenedores, reverse proxy, process management, multi-stage builds
**Carpeta GitHub**: `10-deploy-docker/`

#### Proyecto 19: GraphQL API
**Qué hace**: Versión GraphQL del Blog API
**Tecnologías**: Apollo Server, GraphQL, MongoDB
**Aprenderás**: GraphQL vs REST, schemas, resolvers, queries, mutations
**Carpeta GitHub**: `projects/graphql-blog/`
**Extra**: Demuestra versatilidad más allá de REST

#### Proyecto 20: Microservices Demo
**Qué hace**: Arquitectura de microservicios con 3 servicios (users, products, orders) comunicados por eventos
**Tecnologías**: Express, RabbitMQ/Redis pub-sub, Docker, API Gateway
**Aprenderás**: Microservicios, message queues, service discovery
**Carpeta GitHub**: `projects/microservices-demo/`
**RELEVANTE**: Arquitectura enterprise que buscan las empresas

---

## Estructura recomendada para cada proyecto

```
project-name/
├── README.md          ← Importantísimo: descripción, screenshots, cómo ejecutar
├── package.json
├── .env.example       ← Variables de entorno (nunca .env real)
├── .gitignore
├── src/
│   ├── index.js       ← Entry point
│   ├── config/        ← Configuración DB, env vars
│   ├── routes/        ← Rutas Express
│   ├── controllers/   ← Lógica de negocio
│   ├── models/        ← Modelos Mongoose
│   ├── middleware/     ← Auth, validation, error handling
│   └── utils/         ← Helpers
├── tests/
│   ├── unit/
│   └── integration/
├── docs/
│   ├── api.md         ← Documentación de endpoints
│   └── screenshots/
├── Dockerfile
└── docker-compose.yml
```

---

