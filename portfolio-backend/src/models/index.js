// ============================================
// src/models/index.js
// ============================================
// Barrel file: Exporta todos los modelos desde un punto central
// Uso: const { User, Project, Skill, Experience } = require('./models');

module.exports = {
  User: require('./User'),
  Project: require('./Project'),
  Skill: require('./Skill'),
  Experience: require('./Experience'),
};
