// ============================================
// src/controllers/authController.js
// ============================================
// Controller de Autenticación
//
// CONCEPTO CLAVE - Controller
// Un controller es una función que maneja una petición HTTP específica.
// Recibe la request, ejecuta la lógica de negocio y envía la response.
//
// Patrón: Thin Controller
// Los controllers deben ser "delgados" - delegan la lógica pesada
// a los modelos, servicios o utils. Solo coordinan el flujo.

const { User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { asyncHandler } = require('../utils/helpers');

// ============================================
// POST /api/auth/register
// ============================================
// Registra un nuevo usuario
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Verificamos si ya existe un usuario con ese email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError('Ya existe un usuario con ese email', 409);
  }

  // Creamos el usuario (el password se hashea en el pre-save hook)
  const user = await User.create({ name, email, password });

  // Generamos el token JWT
  const token = user.generateToken();

  // Respondemos con el usuario y el token
  // NOTA: No incluimos el password porque tiene select: false
  res.status(201).json({
    success: true,
    message: 'Usuario registrado correctamente',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

// ============================================
// POST /api/auth/login
// ============================================
// Inicia sesión y devuelve un JWT token
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Buscamos el usuario E incluimos el password (select: false por defecto)
  // .select('+password') fuerza la inclusión del campo
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new ApiError('Credenciales incorrectas', 401);
  }

  // Comparamos la contraseña
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    // IMPORTANTE: Mismo mensaje genérico para email y password incorrectos
    // Esto evita que un atacante pueda enumerar emails válidos
    throw new ApiError('Credenciales incorrectas', 401);
  }

  const token = user.generateToken();

  res.json({
    success: true,
    message: 'Login exitoso',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    },
  });
});

// ============================================
// GET /api/auth/me
// ============================================
// Obtiene el perfil del usuario autenticado
// Requiere: middleware protect (JWT válido)
const getMe = asyncHandler(async (req, res) => {
  // req.user ya viene del middleware auth.protect
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        createdAt: req.user.createdAt,
      },
    },
  });
});

// ============================================
// PUT /api/auth/me
// ============================================
// Actualiza el perfil del usuario autenticado
const updateMe = asyncHandler(async (req, res) => {
  // Solo permitimos actualizar ciertos campos
  const allowedFields = ['name', 'email'];
  const updates = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // { new: true } retorna el documento DESPUÉS de la actualización
  // { runValidators: true } ejecuta las validaciones del schema
  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: 'Perfil actualizado',
    data: { user },
  });
});

// ============================================
// PUT /api/auth/password
// ============================================
// Cambia la contraseña del usuario autenticado
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ApiError('Se requieren la contraseña actual y la nueva', 400);
  }

  // Obtenemos el usuario con el password
  const user = await User.findById(req.user._id).select('+password');

  // Verificamos la contraseña actual
  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) {
    throw new ApiError('La contraseña actual es incorrecta', 401);
  }

  // Actualizamos (el pre-save hook hashea la nueva contraseña)
  user.password = newPassword;
  await user.save();

  // Generamos un nuevo token
  const token = user.generateToken();

  res.json({
    success: true,
    message: 'Contraseña actualizada',
    data: { token },
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  updatePassword,
};
