// ============================================
// src/controllers/experienceController.js
// ============================================
// Controller de Experiencia Laboral

const { Experience } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { asyncHandler, buildPagination, paginatedResponse } = require('../utils/helpers');

// GET /api/experience
const getAll = asyncHandler(async (req, res) => {
  const { skip, limit, sort, page } = buildPagination(req.query);

  const filter = {};
  if (req.query.isVisible !== undefined) filter.isVisible = req.query.isVisible === 'true';
  if (req.query.isCurrent !== undefined) filter.isCurrent = req.query.isCurrent === 'true';
  if (req.query.employmentType) filter.employmentType = req.query.employmentType;

  const [experiences, total] = await Promise.all([
    Experience.find(filter)
      .sort(sort.createdAt ? sort : { startDate: -1 }) // Default: más reciente primero
      .skip(skip)
      .limit(limit)
      .select('-__v'),
    Experience.countDocuments(filter),
  ]);

  res.json(paginatedResponse(experiences, total, page, limit));
});

// GET /api/experience/timeline - Para mostrar en formato timeline
const getTimeline = asyncHandler(async (req, res) => {
  const experiences = await Experience.find({ isVisible: true })
    .sort({ startDate: -1 })
    .select('company position startDate endDate isCurrent location employmentType technologies');

  res.json({
    success: true,
    count: experiences.length,
    data: experiences,
  });
});

// GET /api/experience/:id
const getOne = asyncHandler(async (req, res) => {
  const experience = await Experience.findById(req.params.id).select('-__v');
  if (!experience) throw new ApiError('Experiencia no encontrada', 404);

  res.json({ success: true, data: experience });
});

// POST /api/experience
const create = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user._id;
  const experience = await Experience.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Experiencia creada correctamente',
    data: experience,
  });
});

// PUT /api/experience/:id
const update = asyncHandler(async (req, res) => {
  let experience = await Experience.findById(req.params.id);
  if (!experience) throw new ApiError('Experiencia no encontrada', 404);

  // Usamos save() para que se ejecuten los hooks de validación
  Object.assign(experience, req.body);
  await experience.save();

  res.json({
    success: true,
    message: 'Experiencia actualizada',
    data: experience,
  });
});

// DELETE /api/experience/:id
const remove = asyncHandler(async (req, res) => {
  const experience = await Experience.findById(req.params.id);
  if (!experience) throw new ApiError('Experiencia no encontrada', 404);

  await experience.deleteOne();

  res.json({ success: true, message: 'Experiencia eliminada', data: {} });
});

module.exports = { getAll, getTimeline, getOne, create, update, remove };
