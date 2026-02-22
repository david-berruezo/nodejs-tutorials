// ============================================
// src/routes/authRoutes.js
// ============================================
// Rutas de Autenticación
//
// CONCEPTO CLAVE - Router de Express
// Un Router es como un "mini-app" que agrupa rutas relacionadas.
// Se monta en la app principal con un prefijo:
//   app.use('/api/auth', authRoutes);
//
// Así las rutas definidas aquí se convierten en:
//   POST /api/auth/register
//   POST /api/auth/login
//   etc.

const express = require('express');
const router = express.Router();

// Importamos controllers y middleware
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../validators');

// ============================================
// Rutas PÚBLICAS (no requieren token)
// ============================================

// POST /api/auth/register
// validate(registerSchema) → valida req.body con Joi ANTES del controller
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

// ============================================
// Rutas PROTEGIDAS (requieren token JWT)
// ============================================
// protect → verifica el JWT y adjunta req.user

router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateMe);
router.put('/password', protect, authController.updatePassword);

module.exports = router;
