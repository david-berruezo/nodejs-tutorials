// ============================================
// src/routes/skillRoutes.js
// ============================================

const express = require('express');
const router = express.Router();

const skillController = require('../controllers/skillController');
const { protect } = require('../middleware/auth');
const { validate, skillSchema, paginationSchema } = require('../validators');

// Públicas
router.get('/', validate(paginationSchema, 'query'), skillController.getAll);
router.get('/grouped', skillController.getGrouped);
router.get('/:id', skillController.getOne);

// Protegidas
router.post('/', protect, validate(skillSchema), skillController.create);
router.put('/reorder', protect, skillController.reorder);
router.put('/:id', protect, validate(skillSchema), skillController.update);
router.delete('/:id', protect, skillController.remove);

module.exports = router;
