/**
 * ═══════════════════════════════════════════════════════════════
 * 04-patterns/02-event-driven-app.js — App completa event-driven
 * ═══════════════════════════════════════════════════════════════
 * 
 * Todo lo aprendido junto: una mini aplicación de gestión de
 * usuarios que usa eventos para TODA la comunicación interna.
 * 
 * Este patrón es exactamente como se construyen aplicaciones
 * reales con Node.js (Express, Nest.js, etc.).
 * 
 * Ejecutar: node 04-patterns/02-event-driven-app.js
 */

const EventEmitter = require('events');

console.log('═══════════════════════════════════════');
console.log('  App event-driven completa');
console.log('═══════════════════════════════════════\n');

// ═══════════════════════════════════════════════════
// CAPA 1: Event Bus (canal de comunicación central)
// ═══════════════════════════════════════════════════

class AppEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(30);
    this.history = [];  // Historial de eventos para debug
  }

  // Sobreescribimos emit para registrar TODOS los eventos
  emit(event, ...args) {
    this.history.push({
      event,
      timestamp: new Date().toISOString(),
      args: args.map(a => typeof a === 'object' ? { ...a } : a)
    });
    return super.emit(event, ...args);
  }

  getHistory() {
    return this.history;
  }
}

const bus = new AppEventBus();

// ═══════════════════════════════════════════════════
// CAPA 2: Servicios (cada uno escucha y emite eventos)
// ═══════════════════════════════════════════════════

// ── UserService: gestiona usuarios ──
class UserService {
  constructor(eventBus) {
    this.bus = eventBus;
    this.users = new Map();
    this.nextId = 1;
  }

  register(name, email) {
    // Validación
    if (!name || !email) {
      this.bus.emit('user:error', { action: 'register', reason: 'Datos incompletos' });
      return null;
    }

    // Comprobar duplicado
    for (const user of this.users.values()) {
      if (user.email === email) {
        this.bus.emit('user:error', { action: 'register', reason: `Email ${email} ya existe` });
        return null;
      }
    }

    const user = {
      id: this.nextId++,
      name,
      email,
      createdAt: new Date().toISOString(),
      active: true
    };

    this.users.set(user.id, user);
    this.bus.emit('user:registered', user);
    return user;
  }

  deactivate(id) {
    const user = this.users.get(id);
    if (!user) {
      this.bus.emit('user:error', { action: 'deactivate', reason: `User ${id} no encontrado` });
      return;
    }
    user.active = false;
    this.bus.emit('user:deactivated', user);
  }

  getAll() {
    return [...this.users.values()];
  }
}

// ── NotificationService: envía notificaciones ──
class NotificationService {
  constructor(eventBus) {
    this.bus = eventBus;
    this.sent = [];

    // Escucha eventos y reacciona
    this.bus.on('user:registered', (user) => {
      this.send(user.email, 'welcome', `¡Bienvenido ${user.name}!`);
    });

    this.bus.on('user:deactivated', (user) => {
      this.send(user.email, 'farewell', `Lamentamos verte ir, ${user.name}`);
      this.send('admin@app.com', 'alert', `Usuario ${user.name} desactivado`);
    });
  }

  send(to, type, message) {
    const notification = { to, type, message, sentAt: new Date().toISOString() };
    this.sent.push(notification);
    this.bus.emit('notification:sent', notification);
  }
}

// ── AuditService: registra todas las acciones ──
class AuditService {
  constructor(eventBus) {
    this.bus = eventBus;
    this.logs = [];

    // Escucha MÚLTIPLES eventos
    this.bus.on('user:registered', (user) => {
      this.log('USER_REGISTER', `${user.name} (${user.email})`);
    });

    this.bus.on('user:deactivated', (user) => {
      this.log('USER_DEACTIVATE', `${user.name} (ID: ${user.id})`);
    });

    this.bus.on('user:error', ({ action, reason }) => {
      this.log('USER_ERROR', `${action}: ${reason}`);
    });

    this.bus.on('notification:sent', ({ to, type }) => {
      this.log('NOTIFICATION', `${type} → ${to}`);
    });
  }

  log(action, detail) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      detail
    };
    this.logs.push(entry);
    this.bus.emit('audit:logged', entry);
  }

  getReport() {
    return this.logs;
  }
}

// ── StatsService: métricas en tiempo real ──
class StatsService {
  constructor(eventBus) {
    this.bus = eventBus;
    this.stats = {
      registrations: 0,
      deactivations: 0,
      notifications: 0,
      errors: 0
    };

    this.bus.on('user:registered', () => this.stats.registrations++);
    this.bus.on('user:deactivated', () => this.stats.deactivations++);
    this.bus.on('notification:sent', () => this.stats.notifications++);
    this.bus.on('user:error', () => this.stats.errors++);
  }

  getStats() {
    return { ...this.stats };
  }
}

// ═══════════════════════════════════════════════════
// CAPA 3: Inicialización (conectamos todo)
// ═══════════════════════════════════════════════════

// Creamos las instancias de los servicios
// Cada servicio se "suscribe" a los eventos que le interesan
const userService = new UserService(bus);
const notificationService = new NotificationService(bus);
const auditService = new AuditService(bus);
const statsService = new StatsService(bus);

// ── Consola: muestra eventos en tiempo real ──
bus.on('audit:logged', (entry) => {
  const time = entry.timestamp.split('T')[1].split('.')[0];
  console.log(`   [${time}] ${entry.action.padEnd(18)} ${entry.detail}`);
});

// ═══════════════════════════════════════════════════
// CAPA 4: Ejecución (simulamos uso de la app)
// ═══════════════════════════════════════════════════

console.log('📡 Eventos en tiempo real:\n');

// Registrar usuarios
userService.register('David', 'david@email.com');
userService.register('Ana', 'ana@email.com');
userService.register('Carlos', 'carlos@email.com');

// Intentar duplicado
userService.register('David 2', 'david@email.com');

// Intentar sin datos
userService.register('', '');

// Desactivar usuario
userService.deactivate(2);

// ─────────────────────────────────────────────────
// Mostrar resumen
// ─────────────────────────────────────────────────

setTimeout(() => {
  const stats = statsService.getStats();
  const audit = auditService.getReport();

  console.log('\n═══════════════════════════════════════');
  console.log('  RESUMEN DE LA APP');
  console.log('═══════════════════════════════════════\n');

  console.log('   📊 Estadísticas:');
  console.log(`      Registros:      ${stats.registrations}`);
  console.log(`      Desactivaciones: ${stats.deactivations}`);
  console.log(`      Notificaciones: ${stats.notifications}`);
  console.log(`      Errores:        ${stats.errors}`);

  console.log(`\n   📝 Audit log: ${audit.length} entradas`);
  console.log(`   📡 Event bus: ${bus.getHistory().length} eventos emitidos en total`);

  console.log('\n   👥 Usuarios:');
  userService.getAll().forEach(u => {
    const status = u.active ? '🟢' : '🔴';
    console.log(`      ${status} ${u.name} (${u.email})`);
  });

  console.log('\n   ARQUITECTURA:');
  console.log('   ┌──────────────┐      ┌────────────────────┐');
  console.log('   │ UserService   │──┐   │  NotificationServ. │');
  console.log('   └──────────────┘  │   └────────────────────┘');
  console.log('                     │           ▲');
  console.log('            emit ────▼───────────┤ on');
  console.log('                  ┌──────────┐   │');
  console.log('                  │ EventBus │───┤');
  console.log('                  └──────────┘   │');
  console.log('            emit ────▲───────────┤ on');
  console.log('                     │           ▼');
  console.log('   ┌──────────────┐  │   ┌────────────────────┐');
  console.log('   │ AuditService  │──┘   │  StatsService      │');
  console.log('   └──────────────┘      └────────────────────┘');
  console.log('\n   Ningún servicio conoce a los demás.');
  console.log('   Solo conocen al EventBus.');
  console.log('   Puedes añadir o quitar servicios sin tocar nada.\n');

  console.log('═══════════════════════════════════════');
  console.log('  FIN — Tutorial de Events completo');
  console.log('═══════════════════════════════════════\n');
}, 100);
