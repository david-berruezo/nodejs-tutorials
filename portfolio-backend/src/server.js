// ============================================
// src/server.js
// ============================================
// Punto de entrada principal de la aplicación
//
// ARQUITECTURA DE LA APP:
//
//   server.js (este archivo)
//     ├── config/database.js      → Conexión MongoDB
//     ├── middleware/
//     │   ├── auth.js             → JWT protect & authorize
//     │   ├── errorHandler.js     → Manejo centralizado de errores
//     │   └── upload.js           → Subida de archivos (Multer)
//     ├── models/                 → Schemas de Mongoose
//     │   ├── User.js
//     │   ├── Project.js
//     │   ├── Skill.js
//     │   └── Experience.js
//     ├── controllers/            → Lógica de negocio
//     │   ├── authController.js
//     │   ├── projectController.js
//     │   ├── skillController.js
//     │   └── experienceController.js
//     ├── routes/                 → Definición de endpoints
//     │   ├── authRoutes.js
//     │   ├── projectRoutes.js
//     │   ├── skillRoutes.js
//     │   └── experienceRoutes.js
//     ├── validators/             → Validación con Joi
//     └── utils/                  → Helpers reutilizables

// ============================================
// 1. IMPORTACIONES
// ============================================

// dotenv carga las variables de .env en process.env
// DEBE ser lo primero que se ejecuta
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const connectDB = require('./config/database');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');

// ============================================
// 2. INICIALIZACIÓN
// ============================================

const app = express();
const PORT = process.env.PORT || 3000;

// Conectamos a MongoDB
connectDB();

// ============================================
// 3. MIDDLEWARE GLOBALES
// ============================================
// Se ejecutan en TODAS las peticiones, en orden

// Helmet: Añade headers de seguridad HTTP
// Protege contra XSS, clickjacking, sniffing, etc.
app.use(helmet());

// CORS: Permite peticiones desde otros dominios (frontend)
// En producción, restringir a tu dominio:
//   cors({ origin: 'https://davidberruezo.com' })
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : '*',
    credentials: true,
  })
);

// Rate Limiting: Limita peticiones por IP
// Previene ataques de fuerza bruta y DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 peticiones por ventana
  message: {
    success: false,
    message: 'Demasiadas peticiones. Inténtalo de nuevo en 15 minutos.',
  },
});
app.use('/api/', limiter);

// Morgan: Logger de peticiones HTTP
// 'dev' = formato colorido para desarrollo
// 'combined' = formato Apache para producción
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body Parsers: Parsea el body de las peticiones
app.use(express.json({ limit: '10mb' })); // JSON
app.use(express.urlencoded({ extended: true })); // Form data

// Archivos estáticos: Sirve la carpeta uploads
// GET /uploads/image-123.jpg → ./uploads/image-123.jpg
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ============================================
// 4. RUTAS
// ============================================

// Todas las rutas de la API bajo /api
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Portfolio API v1.0.0',
    documentation: '/api/health',
    endpoints: {
      auth: '/api/auth',
      projects: '/api/projects',
      skills: '/api/skills',
      experience: '/api/experience',
    },
  });
});

// ============================================
// 5. MANEJO DE ERRORES
// ============================================

// Ruta no encontrada (404)
// DEBE ir después de todas las rutas definidas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Error handler global - DEBE ser el ÚLTIMO middleware
app.use(errorHandler);

// ============================================
// 6. INICIO DEL SERVIDOR
// ============================================

const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║       🚀 PORTFOLIO BACKEND API          ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  Entorno:  ${process.env.NODE_ENV.padEnd(28)} ║`);
  console.log(`║  Puerto:   ${String(PORT).padEnd(28)} ║`);
  console.log(`║  URL:      http://localhost:${String(PORT).padEnd(12)} ║`);
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  Endpoints:                              ║');
  console.log('║  GET  /api/health                        ║');
  console.log('║  POST /api/auth/register                 ║');
  console.log('║  POST /api/auth/login                    ║');
  console.log('║  GET  /api/projects                      ║');
  console.log('║  GET  /api/skills                        ║');
  console.log('║  GET  /api/experience                    ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION:', err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err.message);
  process.exit(1);
});

module.exports = app; // Exportamos para testing
