/**
 * ZPL Label Editor - Node.js
 * Editor de etiquetas ZPL con preview en vivo (tipo Labelary)
 */
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Plantillas ZPL
const templates = require('./config/templates');

// Rutas
app.get('/', (req, res) => {
    res.render('editor', {
        title: 'ZPL Label Editor',
        templates: templates,
        zplCommands: require('./config/zpl-commands')
    });
});

// API: Obtener plantilla
app.get('/api/template/:id', (req, res) => {
    const tpl = templates.find(t => t.id === req.params.id);
    if (!tpl) return res.status(404).json({ error: 'Template not found' });
    res.json(tpl);
});

// API: Listar plantillas
app.get('/api/templates', (req, res) => {
    res.json(templates);
});

// ═══════════════════════════════════════════════════════════
// PROXY: Labelary API (evita CORS)
// POST /api/render?dpmm=8&size=4x6&index=0
// ═══════════════════════════════════════════════════════════
app.post('/api/render', async (req, res) => {
    try {
        const { dpmm = 8, size = '4x6', index } = req.query;
        const zpl = req.body?.zpl || '';
        const accept = req.headers['accept'] || 'image/png';
        const quality = req.headers['x-quality'] || 'Grayscale';

        let url = `https://api.labelary.com/v1/printers/${dpmm}dpmm/labels/${size}/${index !== undefined && index !== '' ? index + '/' : ''}`;

        console.log(`[Labelary] POST ${url} (${zpl.length} chars, accept: ${accept})`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': accept,
                'X-Quality': quality,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: zpl
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[Labelary] Error ${response.status}: ${errText}`);
            return res.status(response.status).send(errText);
        }

        const totalCount = response.headers.get('x-total-count');
        if (totalCount) res.set('X-Total-Count', totalCount);

        const ct = response.headers.get('content-type');
        if (ct) res.set('Content-Type', ct);

        const buffer = Buffer.from(await response.arrayBuffer());
        res.send(buffer);

    } catch (err) {
        console.error('Labelary proxy error:', err.message);
        res.status(502).json({ error: 'Labelary API error: ' + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🏷️  ZPL Label Editor → http://localhost:${PORT}\n`);
});
