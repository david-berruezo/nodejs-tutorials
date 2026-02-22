/**
 * ZPL Label Editor - Main JS
 * Connects CodeMirror editor with Labelary API for live preview
 */

(function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════
    let editor = null;
    let redrawTimer = null;
    let currentRotation = 0;
    let currentLabelIndex = 0;
    let totalLabelCount = 1;

    const STORAGE_KEY = 'zpl_editor_last_label';
    const SETTINGS_KEY = 'zpl_editor_settings';

    // ═══════════════════════════════════════════════════════════════
    // INIT CODEMIRROR
    // ═══════════════════════════════════════════════════════════════
    const defaultZpl = TEMPLATES.find(t => t.id === 'nacex-840')?.zpl || '^XA\n^FDHello World^FS\n^XZ';

    // Restore last label if enabled
    let initialZpl = defaultZpl;
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && document.getElementById('settingRemember')?.checked !== false) {
            initialZpl = saved;
        }
    } catch(e) {}

    // Restore settings
    try {
        const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
        if (settings.dpmm) document.getElementById('settingDpmm').value = settings.dpmm;
        if (settings.width) document.getElementById('settingWidth').value = settings.width;
        if (settings.height) document.getElementById('settingHeight').value = settings.height;
        if (settings.units) document.getElementById('settingUnits').value = settings.units;
        if (settings.quality) document.getElementById('settingQuality').value = settings.quality;
    } catch(e) {}

    editor = CodeMirror.fromTextArea(document.getElementById('zplEditor'), {
        mode: 'zpl',
        theme: 'dracula',
        lineNumbers: true,
        matchBrackets: true,
        autoCloseBrackets: true,
        styleActiveLine: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        lineWrapping: false,
        tabSize: 2,
        indentWithTabs: false,
        extraKeys: {
            'Ctrl-Enter': function() { renderLabel(); },
            'Cmd-Enter': function() { renderLabel(); },
            'Ctrl-S': function(cm) { downloadZpl(); return false; },
            'Cmd-S': function(cm) { downloadZpl(); return false; }
        }
    });

    editor.setValue(initialZpl);
    editor.setSize('100%', '100%');

    // ═══════════════════════════════════════════════════════════════
    // CURSOR & CHAR COUNT
    // ═══════════════════════════════════════════════════════════════
    editor.on('cursorActivity', function() {
        const pos = editor.getCursor();
        document.getElementById('cursorPos').textContent = `Ln ${pos.line + 1}, Col ${pos.ch + 1}`;

        // Context help: detect ZPL command at cursor
        const line = editor.getLine(pos.line);
        updateContextHelp(line, pos.ch);
    });

    editor.on('change', function() {
        const val = editor.getValue();
        document.getElementById('charCount').textContent = `${val.length} chars`;

        // Save
        try {
            if (document.getElementById('settingRemember').checked) {
                localStorage.setItem(STORAGE_KEY, val);
            }
        } catch(e) {}

        // Auto redraw
        if (document.getElementById('settingAutoRedraw').checked) {
            clearTimeout(redrawTimer);
            redrawTimer = setTimeout(renderLabel, 1000);
        }

        // Lint
        lintZpl(val);
    });

    // ═══════════════════════════════════════════════════════════════
    // RENDER VIA LABELARY API
    // ═══════════════════════════════════════════════════════════════
    async function renderLabel() {
        const zpl = editor.getValue().trim();
        if (!zpl) return;

        const dpmm = document.getElementById('settingDpmm').value;
        const quality = document.getElementById('settingQuality').value;
        let width = parseFloat(document.getElementById('settingWidth').value);
        let height = parseFloat(document.getElementById('settingHeight').value);
        const units = document.getElementById('settingUnits').value;

        // Convert to inches for API
        if (units === 'cm') { width /= 2.54; height /= 2.54; }
        else if (units === 'mm') { width /= 25.4; height /= 25.4; }

        const url = `/api/render?dpmm=${dpmm}&size=${width}x${height}&index=${currentLabelIndex}`;

        showLoading(true);
        hideError();

        try {
            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    'Accept': 'image/png',
                    'X-Quality': quality,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ zpl: zpl })
            });

            if (!resp.ok) {
                const errText = await resp.text();
                throw new Error(`HTTP ${resp.status}: ${errText}`);
            }

            // Read total labels count from header
            const totalCount = resp.headers.get('X-Total-Count');
            if (totalCount) {
                totalLabelCount = parseInt(totalCount);
                document.getElementById('totalLabels').textContent = totalLabelCount;
                document.getElementById('currentLabel').textContent = currentLabelIndex + 1;
                document.getElementById('btnPrevLabel').disabled = currentLabelIndex <= 0;
                document.getElementById('btnNextLabel').disabled = currentLabelIndex >= totalLabelCount - 1;
            }

            const blob = await resp.blob();
            const imgUrl = URL.createObjectURL(blob);

            const img = document.getElementById('previewImage');
            img.onload = function() {
                img.style.display = 'block';
                img.style.transform = `rotate(${currentRotation}deg)`;
                document.getElementById('previewPlaceholder').style.display = 'none';
            };
            img.src = imgUrl;

        } catch (err) {
            console.error('Labelary error:', err);
            showError(`Error renderizando: ${err.message}`);
        } finally {
            showLoading(false);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // TOOLBAR ACTIONS
    // ═══════════════════════════════════════════════════════════════
    document.getElementById('btnRedraw').addEventListener('click', renderLabel);

    document.getElementById('btnRotate').addEventListener('click', function() {
        currentRotation = (currentRotation + 90) % 360;
        const img = document.getElementById('previewImage');
        if (img.src) img.style.transform = `rotate(${currentRotation}deg)`;
    });

    // Open file
    document.getElementById('btnOpenFile').addEventListener('click', function() {
        document.getElementById('fileInput').click();
    });
    document.getElementById('fileInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            editor.setValue(ev.target.result);
            toast('Archivo cargado: ' + file.name, 'success');
        };
        reader.readAsText(file);
    });

    // Undo / Redo
    document.getElementById('btnUndo').addEventListener('click', () => editor.undo());
    document.getElementById('btnRedo').addEventListener('click', () => editor.redo());

    // Download ZPL
    document.getElementById('btnDlZpl').addEventListener('click', downloadZpl);
    function downloadZpl() {
        download(editor.getValue(), 'label.zpl', 'text/plain');
        toast('ZPL descargado', 'success');
    }

    // Download PNG
    document.getElementById('btnDlPng').addEventListener('click', async function() {
        const img = document.getElementById('previewImage');
        if (!img.src || img.style.display === 'none') {
            toast('Primero renderiza la etiqueta', 'warning');
            return;
        }
        try {
            const resp = await fetchLabel('image/png');
            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'label.png'; a.click();
            URL.revokeObjectURL(url);
            toast('PNG descargado', 'success');
        } catch(e) { toast('Error: ' + e.message, 'error'); }
    });

    // Download PDF
    document.getElementById('btnDlPdf').addEventListener('click', async function() {
        try {
            const resp = await fetchLabel('application/pdf');
            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'label.pdf'; a.click();
            URL.revokeObjectURL(url);
            toast('PDF descargado', 'success');
        } catch(e) { toast('Error: ' + e.message, 'error'); }
    });

    // Permalink
    document.getElementById('btnPermalink').addEventListener('click', function() {
        const zpl = editor.getValue();
        const encoded = encodeURIComponent(zpl);
        const url = window.location.origin + '?zpl=' + encoded;
        navigator.clipboard.writeText(url).then(() => {
            toast('Permalink copiado al portapapeles', 'success');
        }).catch(() => {
            prompt('Copia este enlace:', url);
        });
    });

    async function fetchLabel(accept) {
        const dpmm = document.getElementById('settingDpmm').value;
        const quality = document.getElementById('settingQuality').value;
        let width = parseFloat(document.getElementById('settingWidth').value);
        let height = parseFloat(document.getElementById('settingHeight').value);
        const units = document.getElementById('settingUnits').value;
        if (units === 'cm') { width /= 2.54; height /= 2.54; }
        else if (units === 'mm') { width /= 25.4; height /= 25.4; }
        
        const url = accept === 'application/pdf'
            ? `/api/render?dpmm=${dpmm}&size=${width}x${height}`
            : `/api/render?dpmm=${dpmm}&size=${width}x${height}&index=${currentLabelIndex}`;

        return fetch(url, {
            method: 'POST',
            headers: { 'Accept': accept, 'X-Quality': quality, 'Content-Type': 'application/json' },
            body: JSON.stringify({ zpl: editor.getValue() })
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // TEMPLATES
    // ═══════════════════════════════════════════════════════════════
    const templateMenu = document.getElementById('templateMenu');
    document.getElementById('btnTemplates').addEventListener('click', function(e) {
        e.stopPropagation();
        templateMenu.classList.toggle('show');
    });
    document.addEventListener('click', () => templateMenu.classList.remove('show'));

    document.querySelectorAll('[data-template]').forEach(el => {
        el.addEventListener('click', function() {
            const id = this.dataset.template;
            const tpl = TEMPLATES.find(t => t.id === id);
            if (tpl) {
                editor.setValue(tpl.zpl);
                document.getElementById('settingWidth').value = tpl.width;
                document.getElementById('settingHeight').value = tpl.height;
                document.getElementById('settingDpmm').value = tpl.dpmm;
                document.getElementById('settingUnits').value = 'inches';
                currentLabelIndex = 0;
                currentRotation = 0;
                toast(`Plantilla cargada: ${tpl.name}`, 'success');
                setTimeout(renderLabel, 200);
            }
            templateMenu.classList.remove('show');
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // LABEL NAVIGATION
    // ═══════════════════════════════════════════════════════════════
    document.getElementById('btnPrevLabel').addEventListener('click', function() {
        if (currentLabelIndex > 0) { currentLabelIndex--; renderLabel(); }
    });
    document.getElementById('btnNextLabel').addEventListener('click', function() {
        if (currentLabelIndex < totalLabelCount - 1) { currentLabelIndex++; renderLabel(); }
    });

    // ═══════════════════════════════════════════════════════════════
    // SETTINGS PERSISTENCE
    // ═══════════════════════════════════════════════════════════════
    ['settingDpmm', 'settingWidth', 'settingHeight', 'settingUnits', 'settingQuality'].forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            saveSettings();
            if (document.getElementById('settingAutoRedraw').checked) {
                clearTimeout(redrawTimer);
                redrawTimer = setTimeout(renderLabel, 300);
            }
        });
    });

    function saveSettings() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify({
                dpmm: document.getElementById('settingDpmm').value,
                width: document.getElementById('settingWidth').value,
                height: document.getElementById('settingHeight').value,
                units: document.getElementById('settingUnits').value,
                quality: document.getElementById('settingQuality').value
            }));
        } catch(e) {}
    }

    // ═══════════════════════════════════════════════════════════════
    // PANEL TABS
    // ═══════════════════════════════════════════════════════════════
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const panelId = this.dataset.panel;
            ['settingsPanel', 'helpPanel', 'linterPanel'].forEach(id => {
                document.getElementById(id).style.display = id === panelId ? 'block' : 'none';
            });
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // CONTEXT HELP
    // ═══════════════════════════════════════════════════════════════
    function updateContextHelp(line, ch) {
        // Find the ZPL command at cursor position
        const cmdMatch = line.match(/\^[A-Z][A-Z0-9]?|~[A-Z][A-Z0-9]?/g);
        if (!cmdMatch) return;

        // Find the closest command before cursor
        let closest = null;
        let idx = 0;
        for (const m of cmdMatch) {
            const pos = line.indexOf(m, idx);
            if (pos <= ch) closest = m;
            idx = pos + m.length;
        }

        if (closest) {
            // Highlight matching command in help panel
            document.querySelectorAll('.help-cmd').forEach(el => {
                if (el.dataset.cmd === closest) {
                    el.classList.add('active');
                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    el.classList.remove('active');
                }
            });
        }
    }

    // Help search
    document.getElementById('helpSearch').addEventListener('input', function() {
        const q = this.value.toLowerCase();
        document.querySelectorAll('.help-cmd').forEach(el => {
            const text = el.textContent.toLowerCase();
            el.style.display = text.includes(q) ? '' : 'none';
        });
    });

    // ═══════════════════════════════════════════════════════════════
    // ZPL LINTER
    // ═══════════════════════════════════════════════════════════════
    function lintZpl(code) {
        const warnings = [];
        const lines = code.split('\n');

        let hasXA = false, hasXZ = false;
        lines.forEach((line, i) => {
            if (line.includes('^XA')) hasXA = true;
            if (line.includes('^XZ')) hasXZ = true;

            // Check ^FD without ^FS
            if (line.includes('^FD') && !line.includes('^FS') && !lines[i+1]?.includes('^FS')) {
                warnings.push({ line: i + 1, msg: `^FD sin ^FS correspondiente`, type: 'warn' });
            }

            // Check ^FO format
            const foMatch = line.match(/\^FO(\d+),(\d+)/);
            if (foMatch) {
                const x = parseInt(foMatch[1]), y = parseInt(foMatch[2]);
                if (x > 2000 || y > 5000) {
                    warnings.push({ line: i + 1, msg: `Posición ^FO(${x},${y}) podría estar fuera de la etiqueta`, type: 'info' });
                }
            }

            // Unmatched ^GB
            if (line.includes('^GB') && !line.includes('^FS')) {
                warnings.push({ line: i + 1, msg: `^GB sin ^FS`, type: 'warn' });
            }
        });

        if (!hasXA) warnings.unshift({ line: 1, msg: 'Falta ^XA (inicio de etiqueta)', type: 'error' });
        if (!hasXZ) warnings.push({ line: lines.length, msg: 'Falta ^XZ (fin de etiqueta)', type: 'error' });

        // Update UI
        const linterContent = document.getElementById('linterContent');
        const linterCount = document.getElementById('linterCount');
        linterCount.textContent = warnings.length;
        linterCount.className = 'badge' + (warnings.length > 0 ? ' badge-warn' : '');

        if (warnings.length === 0) {
            linterContent.innerHTML = '<p class="linter-ok">✅ Sin advertencias</p>';
        } else {
            linterContent.innerHTML = warnings.map(w => 
                `<div class="lint-item lint-${w.type}" data-line="${w.line}">
                    <span class="lint-line">Ln ${w.line}</span>
                    <span class="lint-msg">${w.msg}</span>
                </div>`
            ).join('');

            // Click to go to line
            linterContent.querySelectorAll('.lint-item').forEach(el => {
                el.addEventListener('click', function() {
                    const ln = parseInt(this.dataset.line) - 1;
                    editor.setCursor(ln, 0);
                    editor.focus();
                });
            });
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // RESIZABLE PANELS
    // ═══════════════════════════════════════════════════════════════
    const resizer = document.getElementById('resizer');
    let isResizing = false;

    resizer.addEventListener('mousedown', function(e) {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        const container = document.querySelector('.main-layout');
        const rect = container.getBoundingClientRect();
        const pct = ((e.clientX - rect.left) / rect.width) * 100;
        const clamped = Math.max(25, Math.min(75, pct));
        document.getElementById('panelEditor').style.width = clamped + '%';
        document.getElementById('panelPreview').style.width = (100 - clamped - 0.3) + '%';
        editor.refresh();
    });

    document.addEventListener('mouseup', function() {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    });

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════
    function showLoading(show) {
        document.getElementById('previewLoading').style.display = show ? 'flex' : 'none';
    }

    function showError(msg) {
        const el = document.getElementById('previewError');
        el.textContent = msg;
        el.style.display = 'block';
        document.getElementById('previewImage').style.display = 'none';
    }

    function hideError() {
        document.getElementById('previewError').style.display = 'none';
    }

    function download(content, filename, type) {
        const blob = new Blob([content], { type: type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    }

    function toast(msg, type) {
        const colors = { success: '#00B050', error: '#F44336', warning: '#FF9800', info: '#2196F3' };
        Toastify({
            text: msg, duration: 2500, gravity: 'top', position: 'right',
            style: { background: colors[type] || colors.info }, close: true
        }).showToast();
    }

    // ═══════════════════════════════════════════════════════════════
    // PERMALINK LOAD
    // ═══════════════════════════════════════════════════════════════
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('zpl')) {
        editor.setValue(decodeURIComponent(urlParams.get('zpl')));
        setTimeout(renderLabel, 300);
    }

    // ═══════════════════════════════════════════════════════════════
    // KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════════════════════
    document.addEventListener('keydown', function(e) {
        // Ctrl+Enter to render
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            renderLabel();
        }
    });

    // Initial lint
    lintZpl(editor.getValue());
    
    // Initial render
    setTimeout(renderLabel, 500);

    console.log('🏷️ ZPL Label Editor ready');

})();
