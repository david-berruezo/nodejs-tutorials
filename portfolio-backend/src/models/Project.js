// ============================================
// src/models/Project.js
// ============================================
// Modelo de Proyecto para el portfolio
//
// CONCEPTOS CLAVE:
// - Subdocumentos: Arrays de objetos embebidos (technologies, images)
// - Virtuals: Campos calculados que no se guardan en BD
// - Índices: Optimizan las búsquedas (similar a índices SQL)
// - Slug: URL amigable generada automáticamente desde el título

const mongoose = require('mongoose');
const slugify = require('slugify');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'El título del proyecto es obligatorio'],
      trim: true,
      maxlength: [200, 'El título no puede superar 200 caracteres'],
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      maxlength: [2000, 'La descripción no puede superar 2000 caracteres'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'La descripción corta no puede superar 300 caracteres'],
    },
    // Array de strings - las tecnologías usadas en el proyecto
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    // Subdocumento embebido para las imágenes
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    // Enum para el estado del proyecto
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'archived'],
        message: '{VALUE} no es un estado válido',
      },
      default: 'draft',
    },
    // Categoría del proyecto
    category: {
      type: String,
      enum: [
        'web',
        'mobile',
        'plugin',
        'api',
        'ecommerce',
        'other',
      ],
      default: 'web',
    },
    // URLs externas
    liveUrl: {
      type: String,
      default: null,
    },
    githubUrl: {
      type: String,
      default: null,
    },
    // Orden de aparición en el portfolio
    sortOrder: {
      type: Number,
      default: 0,
    },
    // Destacado
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Fecha del proyecto (puede ser diferente a createdAt)
    projectDate: {
      type: Date,
      default: Date.now,
    },
    // Referencia al usuario que creó el proyecto
    // ObjectId es el tipo de dato de los IDs en MongoDB
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Referencia al modelo User (para populate)
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// ÍNDICES
// ============================================
// Los índices mejoran el rendimiento de las búsquedas
// Piensa en ellos como el índice de un libro

projectSchema.index({ status: 1, sortOrder: 1 });  // Búsquedas por estado + orden
projectSchema.index({ category: 1 });               // Filtro por categoría
projectSchema.index({ technologies: 1 });            // Búsqueda por tecnología
projectSchema.index({ isFeatured: 1, status: 1 });  // Proyectos destacados

// Índice de texto para búsqueda full-text
projectSchema.index({
  title: 'text',
  description: 'text',
  technologies: 'text',
});

// ============================================
// VIRTUALS
// ============================================
// Campos calculados que NO se almacenan en la BD

// Obtiene la imagen principal del proyecto
projectSchema.virtual('primaryImage').get(function () {
  const primary = this.images.find((img) => img.isPrimary);
  return primary || this.images[0] || null;
});

// Cuenta de tecnologías
projectSchema.virtual('techCount').get(function () {
  return this.technologies.length;
});

// ============================================
// MIDDLEWARE
// ============================================

// Pre-save: Genera el slug automáticamente desde el título
projectSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,      // Minúsculas
      strict: true,     // Solo caracteres seguros para URL
      locale: 'es',     // Soporte para caracteres españoles
    });
  }
  next();
});

// Pre-save: Genera shortDescription si no se proporcionó
projectSchema.pre('save', function (next) {
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.substring(0, 150) + '...';
  }
  next();
});

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================

// Obtiene proyectos publicados con filtros
projectSchema.statics.findPublished = function (filters = {}) {
  return this.find({ ...filters, status: 'published' })
    .sort({ sortOrder: 1, projectDate: -1 })
    .select('-__v');
};

// Obtiene proyectos destacados
projectSchema.statics.findFeatured = function () {
  return this.find({ status: 'published', isFeatured: true })
    .sort({ sortOrder: 1 })
    .select('-__v');
};

module.exports = mongoose.model('Project', projectSchema);
