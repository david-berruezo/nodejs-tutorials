/**
 * Nacex Label Manager - Node.js Native
 * Equivalente a print.php del plugin WordPress
 * 
 * @author Nacex
 * @license GPL-2.0-or-later
 */

const express = require('express');
const path = require('path');
const printRoutes = require('./routes/print');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/', printRoutes);
app.use('/api', apiRoutes);

// Inicio
app.listen(PORT, () => {
    console.log(`\n🚀 Nacex Label Manager corriendo en http://localhost:${PORT}`);
    console.log(`📋 Gestor de etiquetas: http://localhost:${PORT}/print`);
    console.log(`📊 API: http://localhost:${PORT}/api\n`);
});

module.exports = app;
