// ============================================
// src/models/User.js
// ============================================
// Modelo de Usuario para autenticación
//
// CONCEPTOS CLAVE:
// - Schema: Define la estructura del documento en MongoDB
// - pre('save'): Middleware que se ejecuta ANTES de guardar (hook)
// - methods: Métodos de instancia (se llaman sobre un documento)
// - statics: Métodos estáticos (se llaman sobre el modelo)

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,             // Elimina espacios al inicio/final
      maxlength: [100, 'El nombre no puede superar 100 caracteres'],
    },
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,           // Índice único en MongoDB
      lowercase: true,        // Convierte a minúsculas automáticamente
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor introduce un email válido',
      ],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false, // Por defecto NO se incluye en las queries
    },
    role: {
      type: String,
      enum: ['admin', 'editor'],
      default: 'admin',
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    // Opciones del Schema
    timestamps: true, // Añade createdAt y updatedAt automáticamente
    toJSON: { virtuals: true },   // Incluye virtuals al convertir a JSON
    toObject: { virtuals: true },
  }
);

// ============================================
// MIDDLEWARE (Hooks)
// ============================================

// Pre-save: Hashea la contraseña antes de guardar
// IMPORTANTE: Esto se ejecuta CADA VEZ que se guarda el documento
// Solo hasheamos si el campo password ha sido modificado
userSchema.pre('save', async function (next) {
  // 'this' se refiere al documento que se está guardando
  if (!this.isModified('password')) return next();

  // Generamos un salt (cadena aleatoria) con factor 12
  // Mayor factor = más seguro pero más lento
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ============================================
// MÉTODOS DE INSTANCIA
// ============================================

// Compara la contraseña en texto plano con el hash almacenado
userSchema.methods.comparePassword = async function (candidatePassword) {
  // Necesitamos hacer select('+password') en la query para tener acceso
  return await bcrypt.compare(candidatePassword, this.password);
};

// Genera un JWT token para este usuario
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      id: this._id,      // Payload: datos que incluimos en el token
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN, // Cuándo expira el token
    }
  );
};

module.exports = mongoose.model('User', userSchema);
