/**
 * API Routes - Equivalente a las peticiones AJAX del plugin
 * Maneja: pedidos, etiquetas, expediciones, configuración
 */
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const LabelGenerator = require('../utils/label-generator');
const BarcodeGenerator = require('../utils/barcode');
const Constantes = require('../config/constantes');

// ═══════════════════════════════════════════════════════════════
// PEDIDOS (equivalente a nacex_get_filtered_orders)
// ═══════════════════════════════════════════════════════════════

router.get('/orders', (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            service_type: req.query.service_type,
            payment: req.query.payment,
            search: req.query.search,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo
        };

        const orders = db.getOrders(filters);

        // DataTables server-side format
        if (req.query.draw) {
            const draw = parseInt(req.query.draw);
            const start = parseInt(req.query.start) || 0;
            const length = parseInt(req.query.length) || 25;
            const paginated = orders.slice(start, start + length);

            return res.json({
                draw: draw,
                recordsTotal: orders.length,
                recordsFiltered: orders.length,
                data: paginated
            });
        }

        res.json({ success: true, data: orders, total: orders.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/orders/:id', (req, res) => {
    try {
        const order = db.getOrder(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
        }
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// GENERAR ETIQUETA (equivalente a gen_label)
// ═══════════════════════════════════════════════════════════════

router.post('/gen-label', async (req, res) => {
    try {
        const { orderIds, formData } = req.body;

        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({ success: false, error: 'Debes seleccionar al menos un pedido' });
        }

        const config = db.getConfig();
        const orders = orderIds.map(id => db.getOrder(id)).filter(Boolean);

        if (orders.length === 0) {
            return res.status(404).json({ success: false, error: 'No se encontraron pedidos' });
        }

        const result = await LabelGenerator.generateLabels(orders, formData || {}, config);

        // Guardar expediciones en BD
        for (const r of result.results) {
            db.saveExpedition(r.expedition);
        }

        res.json(result);
    } catch (err) {
        console.error('Error generando etiquetas:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// REPETIR ETIQUETA (equivalente a gen_label método 2)
// ═══════════════════════════════════════════════════════════════

router.post('/repeat-label', async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = db.getOrder(orderId);

        if (!order || !order.expedition) {
            return res.status(400).json({ success: false, error: 'El pedido no tiene expedición' });
        }

        // Regenerar barcode con datos existentes
        const barcodeImage = await BarcodeGenerator.generateNacexBarcode(order.expedition.barcode);

        res.json({
            success: true,
            label_html: LabelGenerator.renderLabel(
                { ...order.expedition, ...order, ref_cli: `pedido_${order.id}` },
                barcodeImage,
                { route: order.expedition.route, color: order.expedition.color, zona: 'NACIONAL' }
            ),
            barcode_image: barcodeImage
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// GENERAR BARCODE (endpoint independiente)
// ═══════════════════════════════════════════════════════════════

router.get('/barcode/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const type = req.query.type || 'code128';
        const image = await BarcodeGenerator.generateBarcodePng(code, type);

        if (!image) {
            return res.status(500).json({ success: false, error: 'Error generando barcode' });
        }

        res.json({ success: true, image: image, code: code, type: type });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// BARCODE ZPL/TPCL (para impresoras térmicas)
// ═══════════════════════════════════════════════════════════════

router.get('/barcode-raw/:code', (req, res) => {
    try {
        const { code } = req.params;
        const printerType = req.query.printer || 'ZPL';
        const raw = BarcodeGenerator.getBarcodeForPrinter(code, printerType);

        res.type('text/plain').send(raw);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// PREVIEW PEDIDO (equivalente a get_preview)
// ═══════════════════════════════════════════════════════════════

router.get('/preview/:id', (req, res) => {
    try {
        const order = db.getOrder(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
        }

        res.json({
            success: true,
            data: {
                order: order,
                expedition: order.expedition || null,
                hasExpedition: !!order.expedition,
                canRepeat: order.expedition && order.expedition.status !== '5',
                canCancel: order.expedition && order.expedition.status !== '5' && order.expedition.status !== '3'
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// EXPEDICIONES (equivalente a get_expeditions)
// ═══════════════════════════════════════════════════════════════

router.get('/expeditions', (req, res) => {
    try {
        const expeditions = db.getExpeditions();
        res.json({ success: true, data: expeditions, total: expeditions.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// CANCELAR EXPEDICIÓN (equivalente a cancel_expedition)
// ═══════════════════════════════════════════════════════════════

router.post('/cancel-expedition', (req, res) => {
    try {
        const { orderId } = req.body;
        // En producción, se llamaría al webservice de Nacex
        res.json({ success: true, message: `Expedición del pedido ${orderId} cancelada` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN (equivalente a devolverConfig)
// ═══════════════════════════════════════════════════════════════

router.get('/config', (req, res) => {
    try {
        const config = db.getConfig();
        res.json({ success: true, data: config });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/config', (req, res) => {
    try {
        const config = db.saveConfig(req.body);
        res.json({ success: true, data: config });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// CONSTANTES (útil para el frontend)
// ═══════════════════════════════════════════════════════════════

router.get('/constants', (req, res) => {
    res.json({
        services: Constantes.getAllServices(),
        envases: Constantes.envases,
        envasesInt: Constantes.envasesInt,
        portes: Constantes.portes,
        reembolso: Constantes.reembolso,
        prealerta: Constantes.prealerta,
        prealertaMod: Constantes.prealertaMod,
        seguros: Constantes.seguros,
        statuses: Constantes.orderStatuses,
        estadosExpediciones: Constantes.estadosExpediciones
    });
});

module.exports = router;
