/**
 * Nacex Label Manager - Frontend JavaScript
 * Equivalente a los archivos JS del plugin WordPress
 */

$(document).ready(function() {

    // ═══════════════════════════════════════════════════════════════
    // VARIABLES GLOBALES
    // ═══════════════════════════════════════════════════════════════
    let ordersTable = null;
    let selectedOrders = [];
    let currentZoom = 100;

    // ═══════════════════════════════════════════════════════════════
    // INICIALIZAR DATATABLE
    // ═══════════════════════════════════════════════════════════════
    ordersTable = $('#ordersTable').DataTable({
        ajax: {
            url: '/api/orders',
            dataSrc: function(json) {
                return json.data || [];
            }
        },
        columns: [
            {
                data: null,
                orderable: false,
                render: function(data) {
                    return `<input type="checkbox" class="order-check" data-id="${data.id}">`;
                },
                width: '30px'
            },
            {
                data: 'id',
                render: function(data) {
                    return `<a href="#" class="preview-order" data-id="${data}" style="color:#0070C0;font-weight:600;">#${data}</a>`;
                }
            },
            {
                data: 'status',
                render: function(data) {
                    const labels = {
                        'processing': 'Procesando',
                        'completed': 'Completado',
                        'on-hold': 'En espera',
                        'pending': 'Pendiente',
                        'cancelled': 'Cancelado',
                        'refunded': 'Reembolsado'
                    };
                    return `<span class="status-badge status-${data}">${labels[data] || data}</span>`;
                }
            },
            { data: 'service_name' },
            {
                data: 'service_type',
                render: function(data) {
                    const labels = { 'nacex': 'Standard', 'nacexshop': 'NacexShop', 'nacexint': 'Internacional' };
                    return labels[data] || data;
                }
            },
            { data: 'country' },
            {
                data: 'total',
                render: function(data) { return parseFloat(data).toFixed(2) + ' €'; }
            },
            {
                data: 'payment_method',
                render: function(data) {
                    const labels = objeto_print.paymentMethods || {};
                    return labels[data] || data;
                }
            },
            { data: 'date_formatted' },
            { data: 'customer' },
            { data: 'email' },
            {
                data: 'expedition',
                render: function(data) {
                    if (!data) return '<span style="color:#999;">Sin exp.</span>';
                    const colors = { '0': '#FFC000', '1': '#0070C0', '2': '#FF5000', '3': '#00B050', '4': '#FF0000', '5': '#999' };
                    return `<span class="exp-status">
                        <span class="exp-dot" style="background:${colors[data.status] || '#999'}"></span>
                        ${data.status_desc}
                    </span>`;
                }
            }
        ],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
        },
        order: [[8, 'desc']],
        pageLength: 25,
        responsive: true,
        dom: 'lrtip'
    });

    // ═══════════════════════════════════════════════════════════════
    // CHECK ALL / SELECCIÓN
    // ═══════════════════════════════════════════════════════════════
    $('#checkAll').on('change', function() {
        const checked = this.checked;
        $('.order-check:visible').prop('checked', checked);
        updateSelectedOrders();
    });

    $(document).on('change', '.order-check', function() {
        updateSelectedOrders();
    });

    function updateSelectedOrders() {
        selectedOrders = [];
        $('.order-check:checked').each(function() {
            selectedOrders.push(parseInt($(this).data('id')));
        });

        // Mostrar/ocultar botones según selección
        if (selectedOrders.length > 0) {
            // Comprobar si hay expediciones
            let hasExpedition = false;
            let allHaveExpedition = true;
            
            ordersTable.rows().every(function() {
                const data = this.data();
                if (selectedOrders.includes(data.id)) {
                    if (data.expedition) hasExpedition = true;
                    else allHaveExpedition = false;
                }
            });

            $('#btnGenLabel').toggle(!allHaveExpedition);
            $('#btnRepeatLabel').toggle(hasExpedition);
            $('#btnExtraLabel').toggle(hasExpedition);
        } else {
            $('#btnGenLabel').show();
            $('#btnRepeatLabel, #btnExtraLabel').hide();
        }

        console.log(`📋 Pedidos seleccionados: ${selectedOrders.length}`, selectedOrders);
    }

    // ═══════════════════════════════════════════════════════════════
    // FILTROS
    // ═══════════════════════════════════════════════════════════════

    // Filtros rápidos de fecha
    $('.today, .yesterday, .week, .month').on('click', function() {
        $('.today, .yesterday, .week, .month').removeClass('active');
        $(this).addClass('active');

        const filter = $(this).data('filter');
        const today = new Date();
        let from, to;

        switch(filter) {
            case 'today':
                from = to = today.toISOString().split('T')[0];
                break;
            case 'yesterday':
                const y = new Date(today);
                y.setDate(y.getDate() - 1);
                from = to = y.toISOString().split('T')[0];
                break;
            case 'week':
                const w = new Date(today);
                w.setDate(w.getDate() - 7);
                from = w.toISOString().split('T')[0];
                to = today.toISOString().split('T')[0];
                break;
            case 'month':
                const m = new Date(today);
                m.setMonth(m.getMonth() - 1);
                from = m.toISOString().split('T')[0];
                to = today.toISOString().split('T')[0];
                break;
        }

        reloadOrders({ dateFrom: from, dateTo: to });
    });

    // Filtros de select
    $('#filterService, #filterCarrier, #filterPayment, #filterStatus').on('change', function() {
        reloadOrders();
    });

    // Búsqueda por cliente/ID
    let searchTimeout;
    $('#searchCustomer, #searchID').on('keyup', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => reloadOrders(), 300);
    });

    // Filtros de expedición
    $('#filterConExp, #filterSinExp').on('change', function() {
        // Aplicar filtro client-side sobre la tabla
        ordersTable.draw();
    });

    // Custom filtering para expediciones
    $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
        if (settings.nTable.id !== 'ordersTable') return true;
        
        const conExp = $('#filterConExp').is(':checked');
        const sinExp = $('#filterSinExp').is(':checked');
        
        if (!conExp && !sinExp) return true;
        
        const rowData = ordersTable.row(dataIndex).data();
        if (conExp && !sinExp) return !!rowData.expedition;
        if (sinExp && !conExp) return !rowData.expedition;
        return true;
    });

    // Limpiar filtros
    $('#clearFilters').on('click', function() {
        $('#filterService, #filterCarrier, #filterPayment').val('-');
        $('#filterStatus').val('0');
        $('#searchCustomer, #searchID').val('');
        $('#filterConExp, #filterSinExp, #filter840, #filter841').prop('checked', false);
        $('#filterExpStatus').val('-');
        $('.today, .yesterday, .week, .month').removeClass('active');
        reloadOrders();
    });

    function reloadOrders(extraFilters = {}) {
        const filters = {
            service_type: $('#filterService').val(),
            payment: $('#filterPayment').val(),
            status: $('#filterStatus').val() === '0' ? undefined : $('#filterStatus').val(),
            search: $('#searchCustomer').val() || $('#searchID').val(),
            ...extraFilters
        };

        const queryStr = Object.entries(filters)
            .filter(([_, v]) => v && v !== '-')
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join('&');

        ordersTable.ajax.url(`/api/orders?${queryStr}`).load();
    }

    // DatePickers
    flatpickr('#rangeMin', {
        locale: 'es', dateFormat: 'Y-m-d',
        onChange: function() { reloadOrders({ dateFrom: $('#rangeMin').val(), dateTo: $('#rangeMax').val() }); }
    });
    flatpickr('#rangeMax', {
        locale: 'es', dateFormat: 'Y-m-d',
        onChange: function() { reloadOrders({ dateFrom: $('#rangeMin').val(), dateTo: $('#rangeMax').val() }); }
    });
    flatpickr('#nacex_fec', { locale: 'es', dateFormat: 'd/m/Y', defaultDate: 'today' });

    // ═══════════════════════════════════════════════════════════════
    // PREVIEW DE PEDIDO
    // ═══════════════════════════════════════════════════════════════
    $(document).on('click', '.preview-order', function(e) {
        e.preventDefault();
        const id = $(this).data('id');
        showOrderPreview(id);
    });

    async function showOrderPreview(id) {
        try {
            const resp = await fetch(`/api/preview/${id}`);
            const json = await resp.json();
            if (!json.success) throw new Error(json.error);

            const order = json.data.order;
            const exp = json.data.expedition;

            let html = `
                <div class="preview-row"><div class="preview-label">ID Pedido</div><div class="preview-value">#${order.id}</div></div>
                <div class="preview-row"><div class="preview-label">Cliente</div><div class="preview-value">${order.customer}</div></div>
                <div class="preview-row"><div class="preview-label">Email</div><div class="preview-value">${order.email}</div></div>
                <div class="preview-row"><div class="preview-label">Teléfono</div><div class="preview-value">${order.phone || '-'}</div></div>
                <div class="preview-row"><div class="preview-label">Dirección</div><div class="preview-value">${order.address}, ${order.postcode} ${order.city}</div></div>
                <div class="preview-row"><div class="preview-label">País</div><div class="preview-value">${order.country}</div></div>
                <div class="preview-row"><div class="preview-label">Total</div><div class="preview-value">${order.total} €</div></div>
                <div class="preview-row"><div class="preview-label">Servicio</div><div class="preview-value">${order.service_name}</div></div>
                <div class="preview-row"><div class="preview-label">Estado</div><div class="preview-value"><span class="status-badge status-${order.status}">${order.status}</span></div></div>
            `;

            if (exp) {
                // Pedir barcode
                const bcResp = await fetch(`/api/barcode/${exp.barcode}`);
                const bcJson = await bcResp.json();

                html += `
                    <hr style="margin:15px 0;">
                    <h4 style="color:#FF5000;margin:10px 0;">Expedición</h4>
                    <div class="preview-row"><div class="preview-label">Código</div><div class="preview-value">${exp.cod_exp}</div></div>
                    <div class="preview-row"><div class="preview-label">Estado</div><div class="preview-value">${exp.status_desc}</div></div>
                    <div class="preview-row"><div class="preview-label">Ruta</div><div class="preview-value">
                        <span style="display:inline-block;width:12px;height:12px;background:${exp.color};border-radius:2px;margin-right:4px;"></span>${exp.route}
                    </div></div>
                    <div class="preview-barcode">
                        ${bcJson.success ? `<img src="${bcJson.image}" alt="Barcode">` : `<code>${exp.barcode}</code>`}
                    </div>
                `;
            }

            $('#previewOrderId').text('#' + order.id);
            $('#previewBody').html(html);
            $('#orderPreviewOverlay').show();
        } catch (err) {
            showToast('Error cargando pedido: ' + err.message, 'error');
        }
    }

    $('#closePreview, #orderPreviewOverlay').on('click', function(e) {
        if (e.target === this) $('#orderPreviewOverlay').hide();
    });

    // ═══════════════════════════════════════════════════════════════
    // GENERAR ETIQUETAS
    // ═══════════════════════════════════════════════════════════════
    $('#btnGenLabel').on('click', function() {
        if (selectedOrders.length === 0) {
            showToast('Debes seleccionar al menos un pedido', 'warning');
            return;
        }
        $('#genDialog').show();
    });

    $('#dialogCancel').on('click', function() { $('#genDialog').hide(); });

    $('#dialogConfirm').on('click', async function() {
        $('#genDialog').hide();
        await generateLabels(1);
    });

    $('#btnRepeatLabel').on('click', async function() {
        if (selectedOrders.length === 0) return;
        await generateLabels(2);
    });

    $('#btnExtraLabel').on('click', async function() {
        if (selectedOrders.length === 0) return;
        await generateLabels(3);
    });

    async function generateLabels(method) {
        showLoading(true);
        updateLoading(1, 3, 'Preparando datos...');

        try {
            // Recoger datos del formulario
            const formData = {
                agencia: $('#agencia').val(),
                departamento: $('#departamento').val(),
                servicio: $('#servicio').val(),
                nacex_fec: $('#nacex_fec').val(),
                nacex_bultos: $('#nacex_bultos').val(),
                portes: $('input[name="portes"]:checked').val(),
                envase: $('input[name="envase"]:checked').val(),
                retorno: $('input[name="retorno"]:checked').val(),
                seguro: $('#seguro').val(),
                nacex_imp_seg: $('#nacex_imp_seg').val(),
                tip_pre: $('input[name="tip_pre"]:checked').val(),
                preal: $('input[name="preal"]:checked').val(),
                mod_preal: $('input[name="mod_preal"]:checked').val(),
                mod_preal_dest: $('#mod_preal_dest').val(),
                mod_preal_mess: $('#mod_preal_mess').val(),
                reem: $('input[name="reem"]:checked').val(),
                reembolso: $('input[name="reembolso"]:checked').val(),
                imp_ree: $('#imp_ree').val(),
                obs1: $('#obs1').val(),
                obs2: $('#obs2').val(),
                con: $('#con').val(),
                val_dec: $('#val_dec').val(),
                ins_adi1: $('#ins_adi1').val(),
                ins_adi2: $('#ins_adi2').val(),
                method: method
            };

            updateLoading(2, 3, `Generando ${selectedOrders.length} etiqueta(s)...`);

            const resp = await fetch('/api/gen-label', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderIds: selectedOrders, formData: formData })
            });

            const json = await resp.json();
            
            updateLoading(3, 3, 'Renderizando etiquetas...');

            if (json.success) {
                // Mostrar etiquetas generadas
                let labelsHtml = '';
                json.results.forEach(r => {
                    labelsHtml += r.label_html;
                });

                $('#labelContent').html(labelsHtml);

                // Mostrar resumen
                showResumen(json);

                // Recargar tabla
                ordersTable.ajax.reload(null, false);

                showToast(`✅ ${json.generated} etiqueta(s) generada(s) en ${json.elapsed_ms}ms`, 'success');
            } else {
                showToast('Error: ' + json.error, 'error');
                showError(json.error);
            }
        } catch (err) {
            console.error('Error generando etiquetas:', err);
            showToast('Error: ' + err.message, 'error');
            showError(err.message);
        } finally {
            showLoading(false);
        }
    }

    function showResumen(data) {
        if (data.generated > 0) {
            let html = `<p>✅ Generadas: ${data.generated} de ${data.total} | ⏱ ${data.elapsed_ms}ms</p>`;
            data.results.forEach(r => {
                html += `<p>Pedido #${r.order_id} → <strong>${r.cod_exp}</strong> | Ruta: <span style="color:${r.color}">${r.route}</span></p>`;
            });
            $('#resumenGeneradas').html(html);
            $('#resumenExpediciones').show();
        }

        if (data.errors > 0) {
            let html = '';
            data.errorDetails.forEach(e => {
                html += `<p>❌ Pedido #${e.order_id}: ${e.error}</p>`;
            });
            $('#resumenErroneas').html(html);
            $('#resumenErrores').show();
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // MODAL DE IMPRESIÓN
    // ═══════════════════════════════════════════════════════════════
    $('#btnPrintTable').on('click', function() {
        const content = $('#labelContent').html();
        if (!content || content.trim() === '') {
            showToast('No hay etiquetas para imprimir', 'warning');
            return;
        }
        $('#previewContent').html(content);
        $('#printModalOverlay').show();
    });

    $('#closePrintDialog').on('click', function() { $('#printModalOverlay').hide(); });

    $('#handlePrint').on('click', function() {
        const printerType = $('#printerType').val();
        if (printerType === 'LASER') {
            window.print();
        } else {
            showToast(`Impresión ${printerType} enviada`, 'success');
        }
        $('#printModalOverlay').hide();
    });

    // Zoom
    $('#zoomIn').on('click', function() { adjustZoom(10); });
    $('#zoomOut').on('click', function() { adjustZoom(-10); });

    function adjustZoom(delta) {
        currentZoom = Math.max(50, Math.min(200, currentZoom + delta));
        $('.preview-page').css('transform', `scale(${currentZoom / 100})`);
        $('#zoomLevel').text(currentZoom + '%');
    }

    // ═══════════════════════════════════════════════════════════════
    // FORMULARIO - LÓGICA DE CAMPOS
    // ═══════════════════════════════════════════════════════════════

    // Mostrar/ocultar campos internacionales según servicio
    $('#servicio').on('change', function() {
        const type = $(this).find(':selected').data('type');
        if (type === 'nacexint') {
            $('.campo-internacional').show();
        } else {
            $('.campo-internacional').hide();
        }
    });

    // Mostrar/ocultar instrucciones adicionales
    $('input[name="ins_adi_quest"]').on('change', function() {
        if ($(this).val() === '1') {
            $('.insAdi').show();
        } else {
            $('.insAdi').hide();
        }
    });

    // Limpiar formulario
    $('#clearForm').on('click', function() {
        $('#serviceForm')[0].reset();
        $('.campo-internacional, .insAdi').hide();
        showToast('Formulario limpiado', 'info');
    });

    // ═══════════════════════════════════════════════════════════════
    // UTILIDADES
    // ═══════════════════════════════════════════════════════════════

    function showLoading(show) {
        if (show) {
            $('#loadingOverlay, #loadingModal').show();
            $('#loadingBar').css('width', '0%');
        } else {
            setTimeout(() => {
                $('#loadingOverlay, #loadingModal').hide();
            }, 500);
        }
    }

    function updateLoading(step, total, desc) {
        $('#loadingStep').text(`Paso ${step} de ${total}`);
        $('#loadingDesc').text(desc);
        $('#loadingBar').css('width', `${(step / total) * 100}%`);
    }

    function showError(msg) {
        $('#errorMsg').html(`<h3>Error</h3><p>${msg}</p>`).show();
        setTimeout(() => $('#errorMsg').fadeOut(), 5000);
    }

    function showToast(msg, type = 'info') {
        const colors = {
            success: '#00B050', error: '#FF0000',
            warning: '#FFC000', info: '#0070C0'
        };

        if (typeof Toastify !== 'undefined') {
            Toastify({
                text: msg,
                duration: 3000,
                gravity: 'top',
                position: 'right',
                style: { background: colors[type] || colors.info },
                close: true
            }).showToast();
        } else {
            console.log(`[${type.toUpperCase()}] ${msg}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════════════════
    console.log('🚀 Nacex Label Manager inicializado');
    console.log('📋 Servicios disponibles:', Object.keys(objeto_print.services).length);
});
