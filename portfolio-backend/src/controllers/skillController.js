// ============================================
// src/controllers/skillController.js
// ============================================
// Controller de Skills (Habilidades técnicas)

const { Skill } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { asyncHandler, buildPagination, paginatedResponse } = require('../utils/helpers');

// GET /api/skills - Lista todas las skills
const getAll = asyncHandler(async (req, res) => {
  const { skip, limit, sort, page } = buildPagination(req.query);

  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.isVisible !== undefined) filter.isVisible = req.query.isVisible === 'true';

  const [skills, total] = await Promise.all([
    Skill.find(filter).sort(sort).skip(skip).limit(limit).select('-__v'),
    Skill.countDocuments(filter),
  ]);

  res.json(paginatedResponse(skills, total, page, limit));
});

// GET /api/skills/grouped - Skills agrupadas por categoría (para el frontend)
const getGrouped = asyncHandler(async (req, res) => {
  const grouped = await Skill.findGroupedByCategory();

  res.json({
    success: true,
    data: grouped,
  });
});

// GET /api/skills/:id
const getOne = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id).select('-__v');
  if (!skill) throw new ApiError('Skill no encontrada', 404);

  res.json({ success: true, data: skill });
});

// POST /api/skills
const create = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;
  const skill = await Skill.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Skill creada correctamente',
    data: skill,
  });
});

// PUT /api/skills/:id
const update = asyncHandler(async (req, res) => {
  const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!skill) throw new ApiError('Skill no encontrada', 404);

  res.json({
    success: true,
    message: 'Skill actualizada',
    data: skill,
  });
});

// DELETE /api/skills/:id
const remove = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) throw new ApiError('Skill no encontrada', 404);

  await skill.deleteOne();

  res.json({ success: true, message: 'Skill eliminada', data: {} });
});

// PUT /api/skills/reorder - Reordena las skills (drag & drop)
const reorder = asyncHandler(async (req, res) => {
  const { items } = req.body; // [{ id: '...', sortOrder: 0 }, ...]

  if (!Array.isArray(items)) {
    throw new ApiError('Se espera un array de items con id y sortOrder', 400);
  }

  // Usamos bulkWrite para actualizar múltiples documentos en una sola operación
  // Esto es MUCHO más eficiente que hacer N updates individuales
  const operations = items.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { sortOrder: item.sortOrder },
    },
  }));

  await Skill.bulkWrite(operations);

  res.json({
    success: true,
    message: 'Orden actualizado',
  });
});

module.exports = { getAll, getGrouped, getOne, create, update, remove, reorder };
