// ============================================
// src/models/Experience.js
// ============================================
// Modelo de Experiencia Laboral
//
// CONCEPTOS CLAVE:
// - Validación personalizada con validate
// - Campos opcionales vs requeridos
// - Getter para formateo de datos

const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, 'El nombre de la empresa es obligatorio'],
      trim: true,
      maxlength: [200, 'El nombre no puede superar 200 caracteres'],
    },
    position: {
      type: String,
      required: [true, 'El puesto es obligatorio'],
      trim: true,
      maxlength: [200, 'El puesto no puede superar 200 caracteres'],
    },
    description: {
      type: String,
      maxlength: [2000, 'La descripción no puede superar 2000 caracteres'],
    },
    // Array de logros/responsabilidades
    highlights: [
      {
        type: String,
        trim: true,
      },
    ],
    // Tecnologías usadas en este trabajo
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    location: {
      type: String,
      trim: true,
    },
    companyUrl: {
      type: String,
      default: null,
    },
    companyLogo: {
      type: String,
      default: null,
    },
    startDate: {
      type: Date,
      required: [true, 'La fecha de inicio es obligatoria'],
    },
    endDate: {
      type: Date,
      default: null, // null = trabajo actual
    },
    // Campo calculado que indica si es el trabajo actual
    isCurrent: {
      type: Boolean,
      default: false,
    },
    // Tipo de empleo
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'freelance', 'contract', 'internship'],
      default: 'full-time',
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
// VALIDACIÓN PERSONALIZADA
// ============================================

// Validamos que endDate sea posterior a startDate
experienceSchema.pre('validate', function (next) {
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    this.invalidate(
      'endDate',
      'La fecha de fin debe ser posterior a la fecha de inicio'
    );
  }
  // Si isCurrent es true, limpiamos endDate
  if (this.isCurrent) {
    this.endDate = null;
  }
  next();
});

// ============================================
// VIRTUALS
// ============================================

// Calcula la duración del empleo en meses
experienceSchema.virtual('durationMonths').get(function () {
  const end = this.endDate || new Date();
  const start = this.startDate;
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  return Math.max(months, 1); // Mínimo 1 mes
});

// Duración formateada "2 años, 3 meses"
experienceSchema.virtual('durationFormatted').get(function () {
  const totalMonths = this.durationMonths;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const parts = [];
  if (years > 0) parts.push(`${years} año${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} mes${months > 1 ? 'es' : ''}`);
  return parts.join(', ') || '1 mes';
});

// Índices
experienceSchema.index({ startDate: -1 });
experienceSchema.index({ isVisible: 1, sortOrder: 1 });

module.exports = mongoose.model('Experience', experienceSchema);
