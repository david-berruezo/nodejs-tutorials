// ============================================
// src/models/Skill.js
// ============================================
// Modelo de Skill (Habilidad técnica)

const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre del skill es obligatorio'],
      trim: true,
      maxlength: [100, 'El nombre no puede superar 100 caracteres'],
    },
    // Categoría del skill
    category: {
      type: String,
      enum: [
        'frontend',
        'backend',
        'database',
        'devops',
        'tools',
        'languages',
        'frameworks',
        'other',
      ],
      required: [true, 'La categoría es obligatoria'],
    },
    // Nivel de dominio (1-100)
    proficiency: {
      type: Number,
      min: [1, 'El nivel mínimo es 1'],
      max: [100, 'El nivel máximo es 100'],
      default: 50,
    },
    // Icono (nombre de la clase CSS o URL del icono)
    icon: {
      type: String,
      default: null,
    },
    // Orden de aparición
    sortOrder: {
      type: Number,
      default: 0,
    },
    // Visible en el portfolio público
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
  }
);

// Índices
skillSchema.index({ category: 1, sortOrder: 1 });
skillSchema.index({ isVisible: 1 });

// Método estático para obtener skills agrupados por categoría
skillSchema.statics.findGroupedByCategory = async function () {
  // Aggregation Pipeline de MongoDB
  // Es como hacer un GROUP BY en SQL pero más potente
  return this.aggregate([
    { $match: { isVisible: true } },                  // WHERE isVisible = true
    { $sort: { sortOrder: 1 } },                       // ORDER BY sortOrder
    {
      $group: {                                        // GROUP BY category
        _id: '$category',
        skills: {
          $push: {                                     // Acumula en array
            name: '$name',
            proficiency: '$proficiency',
            icon: '$icon',
          },
        },
        count: { $sum: 1 },                            // COUNT(*)
      },
    },
    { $sort: { _id: 1 } },                            // Ordena las categorías
  ]);
};

module.exports = mongoose.model('Skill', skillSchema);
