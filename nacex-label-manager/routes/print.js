/**
 * Print Routes - Equivalente a AdminNacexLogistaPrintController
 */
const express = require('express');
const router = express.Router();
const Constantes = require('../config/constantes');
const db = require('../config/database');

// Página principal - Redirigir a /print
router.get('/', (req, res) => {
    res.redirect('/print');
});

// Vista de gestión de etiquetas (equivalente a print.php)
router.get('/print', (req, res) => {
    const config = db.getConfig();
    const viewData = Constantes.getViewData({
        agencies: [config.nacex_agcli || '0001/001'],
        departments: [config.nacex_departamentos || '0']
    });

    res.render('print', {
        title: 'Gestor de Etiquetas Nacex',
        vars: viewData,
        config: config,
        now: new Date()
    });
});

// Vista de expediciones
router.get('/expeditions', (req, res) => {
    const expeditions = db.getExpeditions();
    res.render('expeditions', {
        title: 'Expediciones',
        expeditions: expeditions
    });
});

module.exports = router;
