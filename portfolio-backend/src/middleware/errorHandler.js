// ============================================
// src/middleware/errorHandler.js
// ============================================
// Middleware de manejo centralizado de errores
//
// CONCEPTO CLAVE - Error Handling Middleware
// En Express, un middleware con 4 parámetros (err, req, res, next)
// se reconoce automáticamente como un error handler.
// Se ejecuta cuando cualquier middleware o controller llama a next(error)
// o cuando se lanza una excepción no capturada.

/**
 * Clase personalizada para errores de la API
 * Extiende Error nativo para añadir statusCode
 *
 * Uso en controllers:
 *   throw new ApiError('No encontrado', 404);
 *   // o
 *   next(new ApiError('No encontrado', 404));
 */
class ApiError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Diferencia errores esperados de bugs

    // Captura el stack trace excluyendo el constructor
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware de manejo de errores
 * DEBE ser el ÚLTIMO middleware registrado en Express
 */
const errorHandler = (err, req, res, next) => {
  // Clonamos el error para no mutar el original
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log del error en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // ============================================
  // Manejo de errores específicos de MongoDB/Mongoose
  // ============================================

  // Error de ID inválido (CastError)
  // Ejemplo: GET /api/projects/123invalid
  if (err.name === 'CastError') {
    error = new ApiError(`Recurso no encontrado con id: ${err.value}`, 400);
  }

  // Error de campo duplicado (código 11000)
  // Ejemplo: POST /api/auth/register con email que ya existe
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(
      `Ya existe un registro con ese ${field}: '${err.keyValue[field]}'`,
      409 // 409 Conflict
    );
  }

  // Error de validación de Mongoose
  // Ejemplo: POST /api/projects con campos faltantes o inválidos
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(`Error de validación: ${messages.join('. ')}`, 400);
  }

  // ============================================
  // Respuesta al cliente
  // ============================================

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    // Solo mostramos el stack trace en desarrollo
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = { ApiError, errorHandler };
