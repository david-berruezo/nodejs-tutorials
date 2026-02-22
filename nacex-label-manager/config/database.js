/**
 * Database - Almacenamiento JSON simulado
 * Equivalente a las tablas WordPress (wp_posts, wp_wc_orders, nacex_*)
 */
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data');

class Database {
    constructor() {
        if (!fs.existsSync(DB_PATH)) {
            fs.mkdirSync(DB_PATH, { recursive: true });
        }
        this.initData();
    }

    initData() {
        const ordersFile = path.join(DB_PATH, 'orders.json');
        const expeditionsFile = path.join(DB_PATH, 'expeditions.json');
        const configFile = path.join(DB_PATH, 'config.json');

        if (!fs.existsSync(ordersFile)) {
            fs.writeFileSync(ordersFile, JSON.stringify(this.generateSampleOrders(), null, 2));
        }
        if (!fs.existsSync(expeditionsFile)) {
            fs.writeFileSync(expeditionsFile, JSON.stringify([], null, 2));
        }
        if (!fs.existsSync(configFile)) {
            fs.writeFileSync(configFile, JSON.stringify(this.getDefaultConfig(), null, 2));
        }
    }

    getDefaultConfig() {
        return {
            nacex_agcli: '0001/001',
            nacex_departamentos: '0',
            nacex_tip_ser: '08',
            nacex_tip_env: '2',
            nacex_tip_cob: 'O',
            nacex_tip_preal: 'E',
            nacex_mod_preal: 'S',
            nacex_ret: 'NO',
            nacex_bultos: '1',
            nacex_auto_communication: '1',
            nacex_stdser_carriers: '{"01":"01","02":"02","04":"04","08":"08","09":"09"}',
            nacex_nxsser_carriers: '{"31":"31","37":"37"}',
            nacex_intser_carriers: '{"A":"A","B":"B"}',
            fecha_cron_expediciones: new Date().toISOString()
        };
    }

    generateSampleOrders() {
        const names = [
            'María García López', 'Carlos Rodríguez Fernández', 'Ana Martínez Sánchez',
            'José Luis Pérez Gómez', 'Laura Hernández Díaz', 'Miguel Ángel Torres Ruiz',
            'Carmen Romero Moreno', 'Francisco Jiménez Muñoz', 'Isabel Álvarez Navarro',
            'David López Domínguez', 'Elena Santos Gil', 'Alejandro Vidal Castro',
            'Sofía Blanco Molina', 'Pablo Guerrero Ortega', 'Lucía Delgado Rubio',
            'Javier Morales Medina', 'Marta Suárez Iglesias', 'Daniel Crespo Garrido',
            'Raquel Herrera Cortés', 'Sergio Caballero Nieto'
        ];

        const emails = names.map(n => 
            n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
             .replace(/\s+/g, '.') + '@email.com'
        );

        const cities = [
            'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Bilbao',
            'Málaga', 'Alicante', 'Murcia', 'Valladolid', 'Vigo', 'Gijón',
            'Córdoba', 'Granada', 'Oviedo', 'Pamplona', 'San Sebastián', 'Salamanca',
            'Burgos', 'Santander'
        ];

        const countries = ['ES', 'ES', 'ES', 'ES', 'ES', 'ES', 'ES', 'ES', 'PT', 'ES',
            'ES', 'ES', 'ES', 'ES', 'ES', 'FR', 'ES', 'ES', 'ES', 'DE'];

        const statuses = ['processing', 'completed', 'on-hold', 'pending', 'processing', 'completed'];
        const services = ['01', '02', '04', '08', '09', '31', '37', 'A'];
        const serviceNames = {
            '01': 'NACEX 10:00H', '02': 'NACEX 12:00H', '04': 'NACEX 19:00H',
            '08': 'NACEX ECOMMERCE', '09': 'NACEX PLUS', '31': 'NACEX SHOP eCOMM',
            '37': 'NACEX SHOP LOCKER', 'A': 'NCX INT EUROPA'
        };
        const payments = ['cod', 'paypal', 'stripe', 'redsys', 'bacs'];

        const orders = [];
        const now = new Date();

        for (let i = 1; i <= 50; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date(now);
            date.setDate(date.getDate() - daysAgo);

            const serviceCode = services[Math.floor(Math.random() * services.length)];
            const nameIdx = Math.floor(Math.random() * names.length);
            const hasExpedition = Math.random() > 0.5;
            const expeditionStatus = hasExpedition ? 
                ['0', '1', '2', '3', '4'][Math.floor(Math.random() * 5)] : null;

            orders.push({
                id: 1000 + i,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                service_code: serviceCode,
                service_name: serviceNames[serviceCode] || serviceCode,
                service_type: serviceCode.match(/^[A-Z]$/) ? 'nacexint' : 
                    (parseInt(serviceCode) >= 30 ? 'nacexshop' : 'nacex'),
                country: countries[nameIdx] || 'ES',
                total: (Math.random() * 200 + 10).toFixed(2),
                payment_method: payments[Math.floor(Math.random() * payments.length)],
                date: date.toISOString().split('T')[0],
                date_formatted: date.toLocaleDateString('es-ES'),
                customer: names[nameIdx],
                email: emails[nameIdx],
                phone: `+34 6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
                address: `Calle ${['Mayor', 'Gran Vía', 'Alcalá', 'Diagonal', 'Paseo de Gracia'][Math.floor(Math.random() * 5)]}, ${Math.floor(Math.random() * 100) + 1}`,
                city: cities[nameIdx] || 'Madrid',
                postcode: `${Math.floor(Math.random() * 50000 + 1000).toString().padStart(5, '0')}`,
                expedition: hasExpedition ? {
                    cod_exp: `EXP${(1000 + i).toString().padStart(6, '0')}`,
                    barcode: `840${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`,
                    status: expeditionStatus,
                    status_desc: ['Pendiente', 'En tránsito', 'En reparto', 'Entregado', 'Incidencia'][parseInt(expeditionStatus)],
                    route: `R${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`,
                    color: ['#FF5000', '#00B050', '#0070C0', '#FFC000'][Math.floor(Math.random() * 4)],
                    fecha: date.toISOString().split('T')[0]
                } : null,
                bultos: Math.floor(Math.random() * 3) + 1
            });
        }

        return orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // ═══════════ CRUD Operaciones ═══════════

    getOrders(filters = {}) {
        const data = JSON.parse(fs.readFileSync(path.join(DB_PATH, 'orders.json'), 'utf8'));
        let filtered = [...data];

        if (filters.status && filters.status !== '-') {
            filtered = filtered.filter(o => o.status === filters.status);
        }
        if (filters.service_type && filters.service_type !== '-') {
            filtered = filtered.filter(o => o.service_type === filters.service_type);
        }
        if (filters.payment && filters.payment !== '-') {
            filtered = filtered.filter(o => o.payment_method === filters.payment);
        }
        if (filters.search) {
            const s = filters.search.toLowerCase();
            filtered = filtered.filter(o =>
                o.customer.toLowerCase().includes(s) ||
                o.email.toLowerCase().includes(s) ||
                o.id.toString().includes(s)
            );
        }
        if (filters.dateFrom) {
            filtered = filtered.filter(o => o.date >= filters.dateFrom);
        }
        if (filters.dateTo) {
            filtered = filtered.filter(o => o.date <= filters.dateTo);
        }

        return filtered;
    }

    getOrder(id) {
        const data = JSON.parse(fs.readFileSync(path.join(DB_PATH, 'orders.json'), 'utf8'));
        return data.find(o => o.id === parseInt(id));
    }

    getExpeditions() {
        return JSON.parse(fs.readFileSync(path.join(DB_PATH, 'expeditions.json'), 'utf8'));
    }

    saveExpedition(expedition) {
        const expeditions = this.getExpeditions();
        expeditions.push(expedition);
        fs.writeFileSync(path.join(DB_PATH, 'expeditions.json'), JSON.stringify(expeditions, null, 2));
        
        // Actualizar pedido con expedición
        const orders = JSON.parse(fs.readFileSync(path.join(DB_PATH, 'orders.json'), 'utf8'));
        const idx = orders.findIndex(o => o.id === expedition.order_id);
        if (idx !== -1) {
            orders[idx].expedition = {
                cod_exp: expedition.cod_exp,
                barcode: expedition.barcode,
                status: '0',
                status_desc: 'Pendiente',
                route: expedition.route || '',
                color: expedition.color || '#FF5000',
                fecha: new Date().toISOString().split('T')[0]
            };
            fs.writeFileSync(path.join(DB_PATH, 'orders.json'), JSON.stringify(orders, null, 2));
        }

        return expedition;
    }

    getConfig() {
        return JSON.parse(fs.readFileSync(path.join(DB_PATH, 'config.json'), 'utf8'));
    }

    saveConfig(config) {
        const current = this.getConfig();
        const merged = { ...current, ...config };
        fs.writeFileSync(path.join(DB_PATH, 'config.json'), JSON.stringify(merged, null, 2));
        return merged;
    }
}

module.exports = new Database();
