// ============================================
// src/middleware/auth.js
// ============================================
// Middleware de autenticación JWT
//
// CONCEPTO CLAVE - ¿Qué es un Middleware?
// Un middleware es una función que se ejecuta ENTRE la petición
// del cliente y la respuesta del servidor. Piensa en ello como
// un "guardia de seguridad" que intercepta las peticiones.
//
// Flujo: Request → Middleware → Controller → Response
//
// En Express, un middleware tiene la firma: (req, res, next)
// - req: objeto de la petición
// - res: objeto de la respuesta
// - next: función para pasar al siguiente middleware/controller

const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware: Protege rutas requiriendo un token JWT válido
 *
 * El token se espera en el header Authorization:
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extraemos el token del header Authorization
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
      // "Bearer eyJhbGciOi..." → "eyJhbGciOi..."
      token = authHeader.split(' ')[1];
    }

    // 2. Si no hay token, rechazamos la petición
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado. Token no proporcionado.',
      });
    }

    // 3. Verificamos y decodificamos el token
    // jwt.verify lanza una excepción si el token es inválido o ha expirado
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Buscamos el usuario en la BD
    // Esto asegura que el usuario sigue existiendo
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'El usuario asociado a este token ya no existe.',
      });
    }

    // 5. Adjuntamos el usuario al objeto request
    // Así los controllers pueden acceder a req.user
    req.user = user;

    // 6. Pasamos al siguiente middleware o controller
    next();
  } catch (error) {
    // Token inválido o expirado
    const message =
      error.name === 'TokenExpiredError'
        ? 'Token expirado. Por favor, inicia sesión de nuevo.'
        : 'Token inválido.';

    return res.status(401).json({
      success: false,
      message,
    });
  }
};

/**
 * Middleware Factory: Restringe acceso por roles
 *
 * Uso: authorize('admin', 'editor')
 *
 * PATRÓN: Higher-Order Function
 * Una función que retorna otra función (el middleware real)
 * Esto nos permite pasar parámetros al middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `El rol '${req.user.role}' no tiene permiso para esta acción.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
