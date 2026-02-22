// ============================================
// src/config/database.js
// ============================================
// Configuración de conexión a MongoDB con Mongoose
// Mongoose es un ODM (Object Document Mapper) que nos permite
// definir esquemas y modelos para interactuar con MongoDB
// de forma más estructurada (similar a un ORM como Eloquent en Laravel)

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`   Base de datos: ${conn.connection.name}`);

    // Eventos de conexión útiles para debugging
    mongoose.connection.on('error', (err) => {
      console.error(`❌ Error de MongoDB: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB desconectado');
    });

  } catch (error) {
    console.error(`❌ Error conectando a MongoDB: ${error.message}`);
    process.exit(1); // Salimos si no hay conexión a BD
  }
};

module.exports = connectDB;
