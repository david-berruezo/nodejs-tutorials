/**
 * Constantes - Equivalente a Constantes.php
 * Contiene todas las estructuras de datos y constantes del sistema Nacex
 */

const Constantes = {

    // URLs
    url: 'https://www.nacex.es/',
    tracking: 'https://www.nacex.com/seguimientoDetalle.do?',
    url_carrier: 'https://www.nacex.com/seguimientoDetalle.do?',
    ref_pers: 'pedido_',
    serv_sep: ' - ',

    // ═══════════════════════════════════════════════════════════════
    // SERVICIOS ESTÁNDAR
    // ═══════════════════════════════════════════════════════════════
    servicios: {
        '01': {
            code: '01', id: '01',
            nombre: 'NACEX 10:00H o ISLAS AZORES Y MADEIRA',
            nombre_etiqueta: 'NACEX 10:00H',
            tipo: 'nacex',
            zona: ['NCX - España y Portugal Peninsular', 'NCX - Baleares', 'NCX - Islas Portugal', 'NCX - Ceuta y Melilla', 'NCX - Gibraltar'],
            delivery_limit: '10:00',
            validaciones: {
                packaging: { valid_values: ['0', '1', '2'], default_value: ['2'] },
                portes: { valid_values: ['O', 'D', 'T'], default_value: ['O'] },
                reembolso: { valid_values: ['N', 'O', 'D'], default_value: ['N'] },
                prealerta: { valid_values: ['N', 'S', 'E'], default_value: ['E'] },
                retorno: { valid_values: ['S', 'N'], default_value: ['N'] }
            }
        },
        '02': {
            code: '02', id: '02',
            nombre: 'NACEX 12:00H',
            nombre_etiqueta: 'NACEX 12:00H',
            tipo: 'nacex',
            zona: ['NCX - España y Portugal Peninsular', 'NCX - Baleares'],
            delivery_limit: '12:00',
            validaciones: {
                packaging: { valid_values: ['0', '1', '2'], default_value: ['2'] },
                portes: { valid_values: ['O', 'D', 'T'], default_value: ['O'] },
                reembolso: { valid_values: ['N', 'O', 'D'], default_value: ['N'] },
                prealerta: { valid_values: ['N', 'S', 'E'], default_value: ['E'] },
                retorno: { valid_values: ['S', 'N'], default_value: ['N'] }
            }
        },
        '04': {
            code: '04', id: '04',
            nombre: 'NACEX 19:00H',
            nombre_etiqueta: 'NACEX 19:00H',
            tipo: 'nacex',
            zona: ['NCX - España y Portugal Peninsular', 'NCX - Baleares'],
            delivery_limit: '19:00',
            validaciones: {
                packaging: { valid_values: ['0', '1', '2'], default_value: ['2'] },
                portes: { valid_values: ['O', 'D', 'T'], default_value: ['O'] },
                reembolso: { valid_values: ['N', 'O', 'D'], default_value: ['N'] },
                prealerta: { valid_values: ['N', 'S', 'E'], default_value: ['E'] },
                retorno: { valid_values: ['S', 'N'], default_value: ['N'] }
            }
        },
        '08': {
            code: '08', id: '08',
            nombre: 'NACEX ECOMMERCE',
            nombre_etiqueta: 'NACEX ECOMMERCE',
            tipo: 'nacex',
            zona: ['NCX - España y Portugal Peninsular', 'NCX - Baleares'],
            delivery_limit: '19:00',
            validaciones: {
                packaging: { valid_values: ['0', '1', '2'], default_value: ['2'] },
                portes: { valid_values: ['O', 'D', 'T'], default_value: ['O'] },
                reembolso: { valid_values: ['N', 'O', 'D'], default_value: ['N'] },
                prealerta: { valid_values: ['N', 'S', 'E'], default_value: ['E'] },
                retorno: { valid_values: ['S', 'N'], default_value: ['N'] }
            }
        },
        '09': {
            code: '09', id: '09',
            nombre: 'NACEX PLUS',
            nombre_etiqueta: 'NACEX PLUS',
            tipo: 'nacex',
            zona: ['NCX - España y Portugal Peninsular'],
            delivery_limit: '14:00',
            validaciones: {
                packaging: { valid_values: ['0', '1', '2'], default_value: ['2'] },
                portes: { valid_values: ['O', 'D', 'T'], default_value: ['O'] },
                reembolso: { valid_values: ['N', 'O', 'D'], default_value: ['N'] },
                prealerta: { valid_values: ['N', 'S', 'E'], default_value: ['E'] },
                retorno: { valid_values: ['S', 'N'], default_value: ['N'] }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // SERVICIOS NACEXSHOP
    // ═══════════════════════════════════════════════════════════════
    serviciosShop: {
        '31': {
            code: '31', id: '31',
            nombre: 'NACEX SHOP e-COMMERCE',
            nombre_etiqueta: 'NACEX SHOP eCOMM',
            tipo: 'nacexshop',
            zona: ['NCX - España Peninsular'],
            delivery_limit: '19:00',
            validaciones: {
                packaging: { valid_values: ['0', '1', '2'], default_value: ['2'] },
                portes: { valid_values: ['O'], default_value: ['O'] },
                reembolso: { valid_values: ['N'], default_value: ['N'] },
                prealerta: { valid_values: ['N', 'S', 'E'], default_value: ['E'] },
                retorno: { valid_values: ['N'], default_value: ['N'] }
            }
        },
        '37': {
            code: '37', id: '37',
            nombre: 'NACEX SHOP LOCKER',
            nombre_etiqueta: 'NACEX SHOP LOCKER',
            tipo: 'nacexshop',
            zona: ['NCX - España Peninsular'],
            delivery_limit: '19:00',
            validaciones: {
                packaging: { valid_values: ['0', '1', '2'], default_value: ['2'] },
                portes: { valid_values: ['O'], default_value: ['O'] },
                reembolso: { valid_values: ['N'], default_value: ['N'] },
                prealerta: { valid_values: ['N', 'S', 'E'], default_value: ['E'] },
                retorno: { valid_values: ['N'], default_value: ['N'] }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // SERVICIOS INTERNACIONALES
    // ═══════════════════════════════════════════════════════════════
    serviciosInt: {
        'A': {
            code: 'A', id: 'A',
            nombre: 'NACEX INTERNACIONAL EUROPA',
            nombre_etiqueta: 'NCX INT EUROPA',
            tipo: 'nacexint',
            zona: ['Europa'],
            validaciones: {
                packaging: { valid_values: ['0', '1', '2', 'M', 'D'], default_value: ['2'] },
                portes: { valid_values: ['O', 'D', 'T'], default_value: ['O'] },
                reembolso: { valid_values: ['N'], default_value: ['N'] },
                prealerta: { valid_values: ['N', 'S', 'E'], default_value: ['E'] },
                retorno: { valid_values: ['N'], default_value: ['N'] }
            }
        },
        'B': {
            code: 'B', id: 'B',
            nombre: 'NACEX INTERNACIONAL WORLD',
            nombre_etiqueta: 'NCX INT WORLD',
            tipo: 'nacexint',
            zona: ['Mundial'],
            validaciones: {
                packaging: { valid_values: ['0', '1', '2', 'M', 'D'], default_value: ['2'] },
                portes: { valid_values: ['O', 'D', 'T'], default_value: ['O'] },
                reembolso: { valid_values: ['N'], default_value: ['N'] },
                prealerta: { valid_values: ['N', 'S', 'E'], default_value: ['E'] },
                retorno: { valid_values: ['N'], default_value: ['N'] }
            }
        }
    },

    // ═══════════════════════════════════════════════════════════════
    // ENVASES
    // ═══════════════════════════════════════════════════════════════
    envases: {
        '0': 'DOCS',
        '1': 'BAG',
        '2': 'PAQ'
    },

    envasesInt: {
        'M': 'MUESTRA',
        'D': 'DOCUMENTO'
    },

    // ═══════════════════════════════════════════════════════════════
    // PORTES
    // ═══════════════════════════════════════════════════════════════
    portes: {
        'O': 'O - Origen',
        'D': 'D - Destino',
        'T': 'T - Tercera'
    },

    // ═══════════════════════════════════════════════════════════════
    // REEMBOLSO
    // ═══════════════════════════════════════════════════════════════
    reembolso: {
        'O': 'O - Origen',
        'D': 'D - Destino'
    },

    reembolsoCompleto: {
        'N': 'No',
        'O': 'O - Origen',
        'D': 'D - Destino',
        'A': 'A - Adelanto'
    },

    // ═══════════════════════════════════════════════════════════════
    // PREALERTA
    // ═══════════════════════════════════════════════════════════════
    prealerta: {
        'S': 'S - SMS',
        'E': 'E - Email'
    },

    prealertaMod: {
        'S': 'S - Standard',
        'R': 'R - Reparto'
    },

    // ═══════════════════════════════════════════════════════════════
    // SEGUROS
    // ═══════════════════════════════════════════════════════════════
    seguros: {
        'N': { nombre: 'Sin seguro', codigo: 'N' },
        'S': { nombre: 'Seguro estándar', codigo: 'S' },
        'P': { nombre: 'Seguro premium', codigo: 'P' }
    },

    // ═══════════════════════════════════════════════════════════════
    // ESTADOS DE EXPEDICIONES
    // ═══════════════════════════════════════════════════════════════
    estadosExpediciones: [
        { codigo: '0', descripcion: 'Pendiente' },
        { codigo: '1', descripcion: 'En tránsito' },
        { codigo: '2', descripcion: 'En reparto' },
        { codigo: '3', descripcion: 'Entregado' },
        { codigo: '4', descripcion: 'Incidencia' },
        { codigo: '5', descripcion: 'Anulado' },
        { codigo: '6', descripcion: 'Devuelto' }
    ],

    // ═══════════════════════════════════════════════════════════════
    // ESTADOS DE PEDIDOS (WooCommerce equivalente)
    // ═══════════════════════════════════════════════════════════════
    orderStatuses: {
        'pending': 'Pendiente de pago',
        'processing': 'Procesando',
        'on-hold': 'En espera',
        'completed': 'Completado',
        'cancelled': 'Cancelado',
        'refunded': 'Reembolsado',
        'failed': 'Fallido'
    },

    // ═══════════════════════════════════════════════════════════════
    // MÉTODOS DE PAGO
    // ═══════════════════════════════════════════════════════════════
    paymentMethods: {
        'cod': 'Contra reembolso',
        'bacs': 'Transferencia bancaria',
        'cheque': 'Pago por cheque',
        'paypal': 'PayPal',
        'stripe': 'Tarjeta de crédito (Stripe)',
        'redsys': 'Redsys (TPV Virtual)'
    },

    // ═══════════════════════════════════════════════════════════════
    // DEFAULTS
    // ═══════════════════════════════════════════════════════════════
    defaults: {
        portes: 'O',
        envase: '2',
        prealerta: 'E',
        reembolso: 'O',
        bultos: '1',
        servicio: '08'
    },

    /**
     * Devuelve todos los servicios combinados para el formulario
     */
    getAllServices() {
        const all = {};
        for (const [cod, s] of Object.entries(this.servicios)) {
            all[cod] = { ...s, id: cod };
        }
        for (const [cod, s] of Object.entries(this.serviciosShop)) {
            all[cod] = { ...s, id: cod };
        }
        for (const [cod, s] of Object.entries(this.serviciosInt)) {
            all[cod] = { ...s, id: cod };
        }
        return all;
    },

    /**
     * Devuelve los datos necesarios para la vista print (equivalente a $vars en print.php)
     */
    getViewData(config = {}) {
        return {
            services: this.getAllServices(),
            agency: config.agencies || ['0001/001'],
            department: config.departments || ['0'],
            portes: this.portes,
            portes_defecto: this.defaults.portes,
            envases: this.envases,
            envasesInt: this.envasesInt,
            envase_defecto: this.defaults.envase,
            bultos_defecto: this.defaults.bultos,
            reembolso: this.reembolso,
            reembolso_defecto: this.defaults.reembolso,
            prealerta: this.prealerta,
            prealerta_defecto: this.defaults.prealerta,
            prealertaMod: this.prealertaMod,
            seguros: this.seguros,
            statuses: this.orderStatuses,
            paymentMethods: this.paymentMethods,
            estadosExpediciones: this.estadosExpediciones,
        };
    }
};

module.exports = Constantes;
