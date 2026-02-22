// ============================================
// src/middleware/upload.js
// ============================================
// Middleware de subida de archivos con Multer
//
// CONCEPTO CLAVE - Multer
// Multer es un middleware para manejar multipart/form-data,
// que es el encoding que usan los formularios HTML para subir archivos.
// Sin Multer, Express no puede procesar archivos en las peticiones.
//
// Multer añade:
//   req.file  → archivo individual (upload.single)
//   req.files → múltiples archivos (upload.array / upload.fields)

const multer = require('multer');
const path = require('path');
const { ApiError } = require('./errorHandler');

// ============================================
// Configuración del Storage
// ============================================
// diskStorage nos da control sobre el nombre y destino del archivo
const storage = multer.diskStorage({
  // Dónde guardar los archivos
  destination: (req, file, cb) => {
    // cb = callback(error, destino)
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  // Cómo nombrar los archivos
  filename: (req, file, cb) => {
    // Generamos un nombre único: campo-timestamp-random.extension
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname); // .jpg, .png, etc.
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// ============================================
// Filtro de archivos
// ============================================
// Solo permitimos imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Aceptar archivo
  } else {
    cb(
      new ApiError(
        `Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten: ${allowedTypes.join(', ')}`,
        400
      ),
      false // Rechazar archivo
    );
  }
};

// ============================================
// Instancia de Multer configurada
// ============================================
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
});

// ============================================
// Exportamos middlewares pre-configurados
// ============================================
module.exports = {
  // Para subir una sola imagen (avatar, logo de empresa)
  // Uso en ruta: router.post('/avatar', uploadSingle, controller)
  uploadSingle: upload.single('image'),

  // Para subir múltiples imágenes (galería de proyecto)
  // Uso en ruta: router.post('/gallery', uploadMultiple, controller)
  uploadMultiple: upload.array('images', 10), // Máximo 10 imágenes

  // La instancia de multer por si necesitamos configuración custom
  upload,
};
