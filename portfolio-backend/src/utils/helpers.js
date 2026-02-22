// ============================================
// src/utils/helpers.js
// ============================================
// Funciones de utilidad reutilizables
//
// CONCEPTO CLAVE - Principio DRY (Don't Repeat Yourself)
// Extraemos lógica común en funciones helper para evitar duplicación

const fs = require('fs');
const path = require('path');

/**
 * Construye un objeto de paginación para queries de Mongoose
 *
 * @param {Object} query - Query params (page, limit, sort)
 * @returns {Object} { skip, limit, sort, page }
 *
 * Ejemplo de uso en controller:
 *   const pagination = buildPagination(req.query);
 *   const results = await Model.find()
 *     .sort(pagination.sort)
 *     .skip(pagination.skip)
 *     .limit(pagination.limit);
 */
const buildPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Convierte "-createdAt" a { createdAt: -1 } para Mongoose
  let sort = {};
  if (query.sort) {
    const sortFields = query.sort.split(',');
    sortFields.forEach((field) => {
      if (field.startsWith('-')) {
        sort[field.substring(1)] = -1; // Descendente
      } else {
        sort[field] = 1; // Ascendente
      }
    });
  } else {
    sort = { createdAt: -1 }; // Default: más reciente primero
  }

  return { skip, limit, sort, page };
};

/**
 * Genera la respuesta de paginación con metadata
 *
 * @param {Array} data - Resultados
 * @param {Number} total - Total de documentos
 * @param {Number} page - Página actual
 * @param {Number} limit - Elementos por página
 * @returns {Object} Respuesta formateada
 */
const paginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    count: data.length,
    pagination: {
      page,
      limit,
      totalPages,
      totalResults: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    data,
  };
};

/**
 * Elimina un archivo del sistema de archivos
 * Útil cuando se actualiza o elimina una imagen
 *
 * @param {String} filePath - Ruta del archivo
 */
const deleteFile = (filePath) => {
  try {
    const fullPath = path.resolve(filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
  } catch (error) {
    console.error(`Error eliminando archivo ${filePath}:`, error.message);
  }
  return false;
};

/**
 * Wrapper para controllers async
 * Captura errores automáticamente y los pasa a next()
 *
 * Sin esto, necesitaríamos try/catch en CADA controller:
 *   const getProjects = async (req, res, next) => {
 *     try { ... } catch(err) { next(err); }
 *   };
 *
 * Con asyncHandler:
 *   const getProjects = asyncHandler(async (req, res) => { ... });
 *
 * PATRÓN: Higher-Order Function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  buildPagination,
  paginatedResponse,
  deleteFile,
  asyncHandler,
};
