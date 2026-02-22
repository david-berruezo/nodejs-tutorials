// ============================================
// src/seed.js
// ============================================
// Script para poblar la base de datos con datos de ejemplo
//
// Uso:
//   node src/seed.js          → Inserta datos de ejemplo
//   node src/seed.js --delete → Elimina todos los datos
//
// CONCEPTO CLAVE - Seeders
// Los seeders son scripts que insertan datos de prueba en la BD.
// Son esenciales para:
// - Desarrollo (no tener que crear datos manualmente)
// - Testing (estado inicial conocido)
// - Demos y presentaciones

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');
const { User, Project, Skill, Experience } = require('./models');

// ============================================
// Datos de ejemplo
// ============================================

const userData = {
  name: 'David Berruezo',
  email: 'admin@portfolio.com',
  password: 'password123',
  role: 'admin',
};

const projectsData = [
  {
    title: 'E-Commerce Platform con WooCommerce',
    description:
      'Desarrollo de una plataforma de comercio electrónico completa con integración de pasarelas de pago, gestión de inventario y panel de administración personalizado.',
    technologies: ['WordPress', 'WooCommerce', 'PHP', 'MySQL', 'JavaScript'],
    status: 'published',
    category: 'ecommerce',
    isFeatured: true,
    sortOrder: 1,
    liveUrl: 'https://example-ecommerce.com',
    githubUrl: 'https://github.com/david-berruezo/ecommerce-project',
    projectDate: new Date('2024-06-15'),
  },
  {
    title: 'Plugin Nacex Logística para WooCommerce',
    description:
      'Plugin de WordPress/WooCommerce para integración con el servicio de envíos Nacex. Incluye cálculo de tarifas en tiempo real, generación de etiquetas y tracking de envíos.',
    technologies: ['PHP', 'WordPress', 'WooCommerce', 'REST API', 'PHPUnit'],
    status: 'published',
    category: 'plugin',
    isFeatured: true,
    sortOrder: 2,
    githubUrl: 'https://github.com/david-berruezo/nacexlogista',
    projectDate: new Date('2024-01-10'),
  },
  {
    title: 'API REST de Reservas Turísticas',
    description:
      'Backend API para sistema de reservas turísticas con gestión de disponibilidad, precios dinámicos y notificaciones automáticas.',
    technologies: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Socket.io'],
    status: 'published',
    category: 'api',
    isFeatured: false,
    sortOrder: 3,
    projectDate: new Date('2023-09-20'),
  },
  {
    title: 'Dashboard de Analítica Web',
    description:
      'Panel de control interactivo para visualización de métricas web con gráficos en tiempo real y exportación de reportes.',
    technologies: ['React', 'TypeScript', 'Chart.js', 'Node.js', 'PostgreSQL'],
    status: 'draft',
    category: 'web',
    isFeatured: false,
    sortOrder: 4,
    projectDate: new Date('2024-11-01'),
  },
];

const skillsData = [
  // Frontend
  { name: 'HTML5', category: 'frontend', proficiency: 95, sortOrder: 1 },
  { name: 'CSS3 / SASS', category: 'frontend', proficiency: 90, sortOrder: 2 },
  { name: 'JavaScript', category: 'frontend', proficiency: 85, sortOrder: 3 },
  { name: 'React', category: 'frontend', proficiency: 70, sortOrder: 4 },
  { name: 'TypeScript', category: 'frontend', proficiency: 65, sortOrder: 5 },
  // Backend
  { name: 'PHP', category: 'backend', proficiency: 95, sortOrder: 1 },
  { name: 'Node.js', category: 'backend', proficiency: 70, sortOrder: 2 },
  { name: 'Express.js', category: 'backend', proficiency: 65, sortOrder: 3 },
  { name: 'WordPress / WooCommerce', category: 'backend', proficiency: 95, sortOrder: 4 },
  { name: 'PrestaShop', category: 'backend', proficiency: 80, sortOrder: 5 },
  // Database
  { name: 'MySQL', category: 'database', proficiency: 90, sortOrder: 1 },
  { name: 'MongoDB', category: 'database', proficiency: 65, sortOrder: 2 },
  { name: 'Redis', category: 'database', proficiency: 50, sortOrder: 3 },
  // Tools
  { name: 'Git', category: 'tools', proficiency: 85, sortOrder: 1 },
  { name: 'Docker', category: 'tools', proficiency: 60, sortOrder: 2 },
  { name: 'PHPUnit', category: 'tools', proficiency: 75, sortOrder: 3 },
  { name: 'Jest', category: 'tools', proficiency: 55, sortOrder: 4 },
];

const experienceData = [
  {
    company: 'AUBAY',
    position: 'Software Engineer / Fullstack Developer',
    description:
      'Desarrollo de soluciones web fullstack para clientes enterprise.',
    highlights: [
      'Desarrollo de plugins WordPress/WooCommerce',
      'Integración con APIs de logística y envíos',
      'Implementación de testing automatizado',
    ],
    technologies: ['PHP', 'WordPress', 'JavaScript', 'MySQL', 'Git'],
    location: 'Barcelona, España',
    employmentType: 'full-time',
    startDate: new Date('2023-01-01'),
    isCurrent: true,
    sortOrder: 1,
  },
  {
    company: 'Avantio',
    position: 'Web Developer',
    description:
      'Desarrollo de sistemas de reservas turísticas y gestión de propiedades vacacionales.',
    highlights: [
      'Desarrollo de sistema de reservas en tiempo real',
      'Integración con múltiples channel managers',
      'Optimización de rendimiento de consultas SQL',
    ],
    technologies: ['PHP', 'MySQL', 'JavaScript', 'REST API'],
    location: 'Barcelona, España',
    employmentType: 'full-time',
    startDate: new Date('2020-06-01'),
    endDate: new Date('2022-12-31'),
    isCurrent: false,
    sortOrder: 2,
  },
  {
    company: 'eCommerce Barcelona',
    position: 'WordPress Developer',
    description:
      'Desarrollo y mantenimiento de tiendas online con WordPress y WooCommerce.',
    highlights: [
      'Creación de plugins personalizados',
      'Optimización de tiendas WooCommerce',
      'Integración de pasarelas de pago',
    ],
    technologies: ['WordPress', 'WooCommerce', 'PHP', 'MySQL', 'CSS'],
    location: 'Barcelona, España',
    employmentType: 'full-time',
    startDate: new Date('2018-03-01'),
    endDate: new Date('2020-05-31'),
    isCurrent: false,
    sortOrder: 3,
  },
];

// ============================================
// Funciones del Seeder
// ============================================

const seedDB = async () => {
  try {
    await connectDB();

    // Limpiamos la BD
    console.log('🗑️  Limpiando base de datos...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await Skill.deleteMany({});
    await Experience.deleteMany({});

    // Creamos el usuario admin
    console.log('👤 Creando usuario admin...');
    const user = await User.create(userData);

    // Creamos los proyectos (con referencia al usuario)
    console.log('📁 Creando proyectos...');
    const projectsWithUser = projectsData.map((p) => ({
      ...p,
      createdBy: user._id,
    }));
    await Project.create(projectsWithUser);

    // Creamos las skills
    console.log('🛠️  Creando skills...');
    const skillsWithUser = skillsData.map((s) => ({
      ...s,
      createdBy: user._id,
    }));
    await Skill.create(skillsWithUser);

    // Creamos la experiencia
    console.log('💼 Creando experiencia laboral...');
    const experienceWithUser = experienceData.map((e) => ({
      ...e,
      createdBy: user._id,
    }));
    await Experience.create(experienceWithUser);

    console.log('');
    console.log('✅ Base de datos poblada correctamente!');
    console.log('');
    console.log('📋 Resumen:');
    console.log(`   👤 Usuarios:    1`);
    console.log(`   📁 Proyectos:   ${projectsData.length}`);
    console.log(`   🛠️  Skills:      ${skillsData.length}`);
    console.log(`   💼 Experiencia: ${experienceData.length}`);
    console.log('');
    console.log('🔑 Credenciales de acceso:');
    console.log(`   Email:    ${userData.email}`);
    console.log(`   Password: ${userData.password}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el seeder:', error.message);
    process.exit(1);
  }
};

const deleteAll = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Project.deleteMany({});
    await Skill.deleteMany({});
    await Experience.deleteMany({});

    console.log('🗑️  Todos los datos han sido eliminados');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error eliminando datos:', error.message);
    process.exit(1);
  }
};

// ============================================
// Ejecución
// ============================================

if (process.argv[2] === '--delete') {
  deleteAll();
} else {
  seedDB();
}
