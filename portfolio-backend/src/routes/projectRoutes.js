// ============================================
// src/routes/projectRoutes.js
// ============================================
// Rutas de Proyectos
//
// NOTA sobre el orden de las rutas:
// Las rutas estáticas (/featured, /slug/:slug) deben ir ANTES
// que las rutas con parámetros (/:id), porque Express evalúa
// las rutas en orden y "featured" podría interpretarse como un :id

const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const { validate, projectSchema, projectUpdateSchema, paginationSchema } = require('../validators');

// ============================================
// Rutas PÚBLICAS
// ============================================

// GET /api/projects - Lista con paginación y filtros
router.get('/', validate(paginationSchema, 'query'), projectController.getAll);

// GET /api/projects/featured - Solo proyectos destacados
router.get('/featured', projectController.getFeatured);

// GET /api/projects/slug/:slug - Buscar por slug
router.get('/slug/:slug', projectController.getBySlug);

// GET /api/projects/:id - Obtener por ID
router.get('/:id', projectController.getOne);

// ============================================
// Rutas PROTEGIDAS
// ============================================

// POST /api/projects - Crear proyecto
router.post('/', protect, validate(projectSchema), projectController.create);

// PUT /api/projects/:id - Actualizar proyecto
router.put('/:id', protect, validate(projectUpdateSchema), projectController.update);

// DELETE /api/projects/:id - Eliminar proyecto
router.delete('/:id', protect, projectController.remove);

// POST /api/projects/:id/images - Subir imágenes al proyecto
router.post('/:id/images', protect, uploadMultiple, projectController.uploadImages);

module.exports = router;
