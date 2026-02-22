// ============================================
// src/controllers/projectController.js
// ============================================
// Controller de Proyectos - CRUD Completo
//
// CONCEPTO CLAVE - REST API
// GET    /api/projects        → getAll    (Listar)
// GET    /api/projects/:id    → getOne    (Obtener uno)
// POST   /api/projects        → create    (Crear)
// PUT    /api/projects/:id    → update    (Actualizar completo)
// DELETE /api/projects/:id    → remove    (Eliminar)
//
// Rutas adicionales:
// GET    /api/projects/featured     → getFeatured
// GET    /api/projects/slug/:slug   → getBySlug
// POST   /api/projects/:id/images   → uploadImages

const { Project } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const {
  asyncHandler,
  buildPagination,
  paginatedResponse,
  deleteFile,
} = require('../utils/helpers');

// ============================================
// GET /api/projects
// ============================================
// Lista todos los proyectos con paginación, filtros y búsqueda
const getAll = asyncHandler(async (req, res) => {
  const { skip, limit, sort, page } = buildPagination(req.query);

  // Construimos el filtro dinámicamente
  const filter = {};

  // Filtro por estado
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Filtro por categoría
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Filtro por tecnología
  if (req.query.technology) {
    // $in busca documentos donde el array contiene el valor
    filter.technologies = { $in: [req.query.technology] };
  }

  // Búsqueda por texto (usa el índice de texto que definimos en el modelo)
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Ejecutamos query y count en paralelo con Promise.all
  // Esto es más eficiente que hacerlo secuencialmente
  const [projects, total] = await Promise.all([
    Project.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email') // JOIN con User (solo name y email)
      .select('-__v'),                      // Excluimos el campo __v de Mongoose
    Project.countDocuments(filter),
  ]);

  res.json(paginatedResponse(projects, total, page, limit));
});

// ============================================
// GET /api/projects/featured
// ============================================
// Obtiene solo los proyectos destacados y publicados
const getFeatured = asyncHandler(async (req, res) => {
  const projects = await Project.findFeatured();

  res.json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

// ============================================
// GET /api/projects/:id
// ============================================
// Obtiene un proyecto por su ID
const getOne = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('createdBy', 'name email')
    .select('-__v');

  if (!project) {
    throw new ApiError('Proyecto no encontrado', 404);
  }

  res.json({
    success: true,
    data: project,
  });
});

// ============================================
// GET /api/projects/slug/:slug
// ============================================
// Obtiene un proyecto por su slug (URL amigable)
// Útil para el frontend: /portfolio/mi-proyecto-genial
const getBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug })
    .populate('createdBy', 'name email')
    .select('-__v');

  if (!project) {
    throw new ApiError('Proyecto no encontrado', 404);
  }

  res.json({
    success: true,
    data: project,
  });
});

// ============================================
// POST /api/projects
// ============================================
// Crea un nuevo proyecto
const create = asyncHandler(async (req, res) => {
  // Añadimos el usuario autenticado como creador
  req.body.createdBy = req.user._id;

  const project = await Project.create(req.body);

  // 201 = Created (código HTTP estándar para creación exitosa)
  res.status(201).json({
    success: true,
    message: 'Proyecto creado correctamente',
    data: project,
  });
});

// ============================================
// PUT /api/projects/:id
// ============================================
// Actualiza un proyecto existente
const update = asyncHandler(async (req, res) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError('Proyecto no encontrado', 404);
  }

  // Verificamos que el usuario sea el creador
  if (project.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError('No tienes permiso para editar este proyecto', 403);
  }

  // Actualizamos
  // findByIdAndUpdate NO ejecuta pre-save hooks
  // Si necesitamos que se ejecute el hook del slug, hacemos save()
  Object.assign(project, req.body);
  await project.save(); // Esto SÍ ejecuta los pre-save hooks

  res.json({
    success: true,
    message: 'Proyecto actualizado',
    data: project,
  });
});

// ============================================
// DELETE /api/projects/:id
// ============================================
// Elimina un proyecto
const remove = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError('Proyecto no encontrado', 404);
  }

  // Verificamos permisos
  if (project.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError('No tienes permiso para eliminar este proyecto', 403);
  }

  // Eliminamos las imágenes asociadas del disco
  if (project.images && project.images.length > 0) {
    project.images.forEach((img) => {
      if (img.url.startsWith('uploads/')) {
        deleteFile(img.url);
      }
    });
  }

  // deleteOne() es el método recomendado por Mongoose 8.x
  await project.deleteOne();

  res.json({
    success: true,
    message: 'Proyecto eliminado',
    data: {},
  });
});

// ============================================
// POST /api/projects/:id/images
// ============================================
// Sube imágenes a un proyecto
const uploadImages = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    throw new ApiError('Proyecto no encontrado', 404);
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError('No se han proporcionado imágenes', 400);
  }

  // Procesamos los archivos subidos por Multer
  const newImages = req.files.map((file, index) => ({
    url: `uploads/${file.filename}`,
    alt: req.body.alt || project.title,
    isPrimary: project.images.length === 0 && index === 0, // Primera imagen = primary
  }));

  // Añadimos las nuevas imágenes al array existente
  project.images.push(...newImages);
  await project.save();

  res.status(201).json({
    success: true,
    message: `${newImages.length} imagen(es) subida(s) correctamente`,
    data: {
      images: project.images,
    },
  });
});

module.exports = {
  getAll,
  getFeatured,
  getOne,
  getBySlug,
  create,
  update,
  remove,
  uploadImages,
};
