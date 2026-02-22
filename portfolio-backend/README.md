# 🚀 Portfolio Backend API

Backend REST API para portfolio personal construido con **Node.js**, **Express** y **MongoDB**.

## 📋 Requisitos

- Node.js >= 18.x
- MongoDB >= 6.x (local o MongoDB Atlas)
- npm o yarn

## ⚡ Instalación rápida

```bash
# 1. Clonar o copiar el proyecto
cd portfolio-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Poblar la base de datos con datos de ejemplo
node src/seed.js

# 5. Iniciar en modo desarrollo
npm run dev
```

## 🔑 Credenciales por defecto (seeder)

| Campo    | Valor               |
|----------|---------------------|
| Email    | admin@portfolio.com |
| Password | password123         |

## 📁 Estructura del proyecto

```
portfolio-backend/
├── src/
│   ├── config/
│   │   └── database.js          # Conexión a MongoDB
│   ├── controllers/
│   │   ├── authController.js    # Register, Login, Profile
│   │   ├── projectController.js # CRUD Proyectos
│   │   ├── skillController.js   # CRUD Skills
│   │   └── experienceController.js # CRUD Experiencia
│   ├── middleware/
│   │   ├── auth.js              # JWT protect & authorize
│   │   ├── errorHandler.js      # Manejo centralizado de errores
│   │   └── upload.js            # Multer (subida de archivos)
│   ├── models/
│   │   ├── User.js              # Modelo de Usuario
│   │   ├── Project.js           # Modelo de Proyecto
│   │   ├── Skill.js             # Modelo de Skill
│   │   └── Experience.js        # Modelo de Experiencia
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── skillRoutes.js
│   │   └── experienceRoutes.js
│   ├── utils/
│   │   └── helpers.js           # Funciones reutilizables
│   ├── validators/
│   │   └── index.js             # Validación con Joi
│   ├── seed.js                  # Seeder de datos
│   └── server.js                # Punto de entrada
├── uploads/                     # Archivos subidos
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 📡 Endpoints de la API

### Auth
| Método | Ruta                | Descripción          | Auth |
|--------|---------------------|----------------------|------|
| POST   | /api/auth/register  | Registrar usuario    | ❌   |
| POST   | /api/auth/login     | Iniciar sesión       | ❌   |
| GET    | /api/auth/me        | Obtener mi perfil    | ✅   |
| PUT    | /api/auth/me        | Actualizar perfil    | ✅   |
| PUT    | /api/auth/password  | Cambiar contraseña   | ✅   |

### Projects
| Método | Ruta                         | Descripción              | Auth |
|--------|------------------------------|--------------------------|------|
| GET    | /api/projects                | Listar (con paginación)  | ❌   |
| GET    | /api/projects/featured       | Proyectos destacados     | ❌   |
| GET    | /api/projects/slug/:slug     | Buscar por slug          | ❌   |
| GET    | /api/projects/:id            | Obtener por ID           | ❌   |
| POST   | /api/projects                | Crear proyecto           | ✅   |
| PUT    | /api/projects/:id            | Actualizar proyecto      | ✅   |
| DELETE | /api/projects/:id            | Eliminar proyecto        | ✅   |
| POST   | /api/projects/:id/images     | Subir imágenes           | ✅   |

### Skills
| Método | Ruta                    | Descripción              | Auth |
|--------|-------------------------|--------------------------|------|
| GET    | /api/skills             | Listar skills            | ❌   |
| GET    | /api/skills/grouped     | Agrupadas por categoría  | ❌   |
| GET    | /api/skills/:id         | Obtener por ID           | ❌   |
| POST   | /api/skills             | Crear skill              | ✅   |
| PUT    | /api/skills/:id         | Actualizar skill         | ✅   |
| PUT    | /api/skills/reorder     | Reordenar skills         | ✅   |
| DELETE | /api/skills/:id         | Eliminar skill           | ✅   |

### Experience
| Método | Ruta                        | Descripción              | Auth |
|--------|-----------------------------|--------------------------|------|
| GET    | /api/experience             | Listar experiencia       | ❌   |
| GET    | /api/experience/timeline    | Formato timeline         | ❌   |
| GET    | /api/experience/:id         | Obtener por ID           | ❌   |
| POST   | /api/experience             | Crear experiencia        | ✅   |
| PUT    | /api/experience/:id         | Actualizar experiencia   | ✅   |
| DELETE | /api/experience/:id         | Eliminar experiencia     | ✅   |

## 🧪 Ejemplos con cURL

### Registrar usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"David","email":"david@test.com","password":"123456"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portfolio.com","password":"password123"}'
```

### Crear proyecto (con token)
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "title": "Mi Nuevo Proyecto",
    "description": "Descripción del proyecto con al menos 10 caracteres",
    "technologies": ["Node.js", "Express", "MongoDB"],
    "category": "api",
    "status": "published"
  }'
```

### Listar proyectos con filtros
```bash
# Paginación
curl "http://localhost:3000/api/projects?page=1&limit=5"

# Filtro por categoría
curl "http://localhost:3000/api/projects?category=web"

# Búsqueda por texto
curl "http://localhost:3000/api/projects?search=wordpress"

# Filtro por estado
curl "http://localhost:3000/api/projects?status=published"
```

### Subir imágenes
```bash
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/images \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -F "images=@./foto1.jpg" \
  -F "images=@./foto2.png"
```

## 🧠 Conceptos Node.js que aprendes

| Concepto              | Dónde se usa                                     |
|-----------------------|--------------------------------------------------|
| Express Routing       | `routes/*.js`                                    |
| Middleware            | `middleware/*.js`, `server.js`                   |
| Mongoose ODM          | `models/*.js`                                    |
| JWT Auth              | `middleware/auth.js`, `models/User.js`           |
| File Upload (Multer)  | `middleware/upload.js`                           |
| Validation (Joi)      | `validators/index.js`                            |
| Error Handling        | `middleware/errorHandler.js`                     |
| Pagination            | `utils/helpers.js`, controllers                  |
| Aggregation Pipeline  | `models/Skill.js` (findGroupedByCategory)        |
| Security (Helmet)     | `server.js`                                      |
| Rate Limiting         | `server.js`                                      |
| Environment Config    | `.env`, `server.js`                              |
| Async/Await           | Todos los controllers                            |
| Higher-Order Functions| `asyncHandler`, `authorize`, `validate`          |

## 📜 Scripts

```bash
npm start        # Producción
npm run dev      # Desarrollo (con nodemon)
npm test         # Tests
node src/seed.js          # Poblar BD
node src/seed.js --delete # Limpiar BD
```

## 📄 Licencia

MIT
