// ============================================
// src/routes/index.js
// ============================================
// Registro centralizado de rutas
//
// Tener un archivo index para las rutas permite:
// 1. Ver todas las rutas de la API de un vistazo
// 2. Añadir prefijos de forma centralizada
// 3. Aplicar middleware global a grupos de rutas

const express = require('express');
const router = express.Router();

// Importamos las rutas
const authRoutes = require('./authRoutes');
const projectRoutes = require('./projectRoutes');
const skillRoutes = require('./skillRoutes');
const experienceRoutes = require('./experienceRoutes');

// ============================================
// Ruta de health check
// ============================================
// Útil para monitorización y load balancers
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Portfolio API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ============================================
// Montaje de rutas
// ============================================
// Cada grupo de rutas se monta con su prefijo

router.use('/auth', authRoutes);           // /api/auth/*
router.use('/projects', projectRoutes);    // /api/projects/*
router.use('/skills', skillRoutes);        // /api/skills/*
router.use('/experience', experienceRoutes); // /api/experience/*

module.exports = router;
