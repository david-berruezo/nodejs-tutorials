// ============================================
// src/validators/index.js
// ============================================
// Validación de datos de entrada con Joi
//
// CONCEPTO CLAVE - Validación en capas
// 1. Frontend: UX (feedback inmediato al usuario)
// 2. Backend - Joi: Estructura y formato de datos
// 3. Backend - Mongoose: Reglas de negocio y BD
//
// ¿Por qué validar en el backend si Mongoose ya valida?
// - Joi valida ANTES de tocar la BD (más eficiente)
// - Mensajes de error más claros y personalizables
// - Puede validar datos que no van a la BD (query params, etc.)

const Joi = require('joi');

// ============================================
// Middleware factory de validación
// ============================================
// Recibe un schema de Joi y retorna un middleware
// que valida req.body, req.query o req.params

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,    // Reporta TODOS los errores, no solo el primero
      stripUnknown: true,   // Elimina campos no definidos en el schema
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors: messages,
      });
    }

    // Reemplazamos con los datos validados y limpios
    req[source] = value;
    next();
  };
};

// ============================================
// Schemas de Auth
// ============================================

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'El nombre es obligatorio',
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede superar 100 caracteres',
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'Introduce un email válido',
    'string.empty': 'El email es obligatorio',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'string.empty': 'La contraseña es obligatoria',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.email': 'Introduce un email válido',
    'string.empty': 'El email es obligatorio',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'La contraseña es obligatoria',
  }),
});

// ============================================
// Schemas de Project
// ============================================

const projectSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().min(10).max(2000).required(),
  shortDescription: Joi.string().trim().max(300).allow('', null),
  technologies: Joi.array().items(Joi.string().trim()).default([]),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
  category: Joi.string()
    .valid('web', 'mobile', 'plugin', 'api', 'ecommerce', 'other')
    .default('web'),
  liveUrl: Joi.string().uri().allow('', null),
  githubUrl: Joi.string().uri().allow('', null),
  sortOrder: Joi.number().integer().min(0).default(0),
  isFeatured: Joi.boolean().default(false),
  projectDate: Joi.date().iso().default(Date.now),
});

const projectUpdateSchema = projectSchema.fork(
  ['title', 'description'], // Campos que hacemos opcionales
  (schema) => schema.optional()
);

// ============================================
// Schemas de Skill
// ============================================

const skillSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  category: Joi.string()
    .valid(
      'frontend', 'backend', 'database', 'devops',
      'tools', 'languages', 'frameworks', 'other'
    )
    .required(),
  proficiency: Joi.number().integer().min(1).max(100).default(50),
  icon: Joi.string().trim().allow('', null),
  sortOrder: Joi.number().integer().min(0).default(0),
  isVisible: Joi.boolean().default(true),
});

// ============================================
// Schemas de Experience
// ============================================

const experienceSchema = Joi.object({
  company: Joi.string().trim().min(1).max(200).required(),
  position: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().max(2000).allow('', null),
  highlights: Joi.array().items(Joi.string().trim()).default([]),
  technologies: Joi.array().items(Joi.string().trim()).default([]),
  location: Joi.string().trim().allow('', null),
  companyUrl: Joi.string().uri().allow('', null),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().allow(null).default(null),
  isCurrent: Joi.boolean().default(false),
  employmentType: Joi.string()
    .valid('full-time', 'part-time', 'freelance', 'contract', 'internship')
    .default('full-time'),
  sortOrder: Joi.number().integer().min(0).default(0),
  isVisible: Joi.boolean().default(true),
});

// ============================================
// Schema para query params de paginación
// ============================================

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().trim().default('-createdAt'),
  search: Joi.string().trim().allow(''),
  status: Joi.string().valid('draft', 'published', 'archived'),
  category: Joi.string().trim(),
});

// ============================================
// Exportamos todo
// ============================================

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  projectSchema,
  projectUpdateSchema,
  skillSchema,
  experienceSchema,
  paginationSchema,
};
