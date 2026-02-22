// ============================================
// src/routes/experienceRoutes.js
// ============================================

const express = require('express');
const router = express.Router();

const experienceController = require('../controllers/experienceController');
const { protect } = require('../middleware/auth');
const { validate, experienceSchema, paginationSchema } = require('../validators');

// Públicas
router.get('/', validate(paginationSchema, 'query'), experienceController.getAll);
router.get('/timeline', experienceController.getTimeline);
router.get('/:id', experienceController.getOne);

// Protegidas
router.post('/', protect, validate(experienceSchema), experienceController.create);
router.put('/:id', protect, validate(experienceSchema), experienceController.update);
router.delete('/:id', protect, experienceController.remove);

module.exports = router;
