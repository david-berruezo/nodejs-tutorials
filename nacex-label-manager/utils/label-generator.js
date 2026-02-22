/**
 * LabelGenerator - Equivalente a Expedition.php generateLabel()
 * Genera etiquetas para expediciones Nacex
 */
const BarcodeGenerator = require('./barcode');
const Constantes = require('../config/constantes');

class LabelGenerator {

    /**
     * Genera una etiqueta completa para un pedido
     * @param {object} order - Datos del pedido
     * @param {object} formData - Datos del formulario
     * @param {object} config - Configuración
     * @returns {Promise<object>} - Datos de la etiqueta generada
     */
    static async generateLabel(order, formData, config = {}) {
        const startTime = Date.now();

        // 1. Obtener datos del pedido
        const orderData = this.getOrderDetails(order);

        // 2. Generar código de expedición
        const agencia = formData.agencia || config.nacex_agcli || '0001/001';
        const numExp = Date.now().toString().slice(-7);
        const expeditionCode = BarcodeGenerator.generateExpeditionCode(
            agencia.split('/')[0] || '0001',
            numExp
        );

        // 3. Generar barcode
        const barcodeImage = await BarcodeGenerator.generateNacexBarcode(expeditionCode);
        const barcodeCode128 = await BarcodeGenerator.generateCode128(expeditionCode);

        // 4. Determinar ruta y color
        const routeData = this.getRouteData(order);

        // 5. Mapear expedición
        const expedition = this.mapExpedition(order, formData, expeditionCode, routeData);

        // 6. Generar HTML de la etiqueta
        const labelHtml = this.renderLabel(expedition, barcodeImage, routeData);

        const elapsed = Date.now() - startTime;

        return {
            success: true,
            order_id: order.id,
            cod_exp: expeditionCode,
            barcode: expeditionCode,
            barcode_image: barcodeImage,
            barcode_code128: barcodeCode128,
            route: routeData.route,
            color: routeData.color,
            label_html: labelHtml,
            expedition: expedition,
            elapsed_ms: elapsed
        };
    }

    /**
     * Genera múltiples etiquetas
     */
    static async generateLabels(orders, formData, config = {}) {
        const results = [];
        const errors = [];
        const startTime = Date.now();

        for (const order of orders) {
            try {
                const result = await this.generateLabel(order, formData, config);
                results.push(result);
            } catch (err) {
                errors.push({
                    order_id: order.id,
                    error: err.message
                });
            }
        }

        return {
            success: true,
            total: orders.length,
            generated: results.length,
            errors: errors.length,
            results,
            errorDetails: errors,
            elapsed_ms: Date.now() - startTime
        };
    }

    /**
     * Obtiene detalles del pedido
     */
    static getOrderDetails(order) {
        return {
            id: order.id,
            customer: order.customer,
            email: order.email,
            phone: order.phone || '',
            address: order.address || '',
            city: order.city || '',
            postcode: order.postcode || '',
            country: order.country || 'ES',
            total: order.total,
            payment: order.payment_method,
            service_code: order.service_code,
            service_type: order.service_type,
            bultos: order.bultos || 1
        };
    }

    /**
     * Obtiene datos de ruta (simulado - equivalente a Webservice::getRoute)
     */
    static getRouteData(order) {
        const routes = ['R001', 'R002', 'R003', 'R010', 'R015', 'R020', 'R025', 'R050'];
        const colors = ['#FF5000', '#00B050', '#0070C0', '#FFC000', '#7030A0', '#FF0000'];
        
        return {
            route: routes[Math.floor(Math.random() * routes.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            zona: order.country === 'ES' ? 'NACIONAL' : 'INTERNACIONAL'
        };
    }

    /**
     * Mapea los datos de expedición (equivalente a mapearExpedicion en Expedition.php)
     */
    static mapExpedition(order, formData, expeditionCode, routeData) {
        const now = new Date();
        const serviceCode = formData.servicio || order.service_code;
        
        // Buscar servicio
        let serviceName = '';
        const allServices = { ...Constantes.servicios, ...Constantes.serviciosShop, ...Constantes.serviciosInt };
        if (allServices[serviceCode]) {
            serviceName = allServices[serviceCode].nombre_etiqueta || allServices[serviceCode].nombre;
        }

        return {
            order_id: order.id,
            cod_exp: expeditionCode,
            barcode: expeditionCode,
            barcode2: expeditionCode.replace('840', '841'),
            
            // Cliente
            customer: order.customer,
            email: order.email,
            phone: order.phone || '',
            address: order.address || '',
            city: order.city || '',
            postcode: order.postcode || '',
            country: order.country || 'ES',

            // Servicio
            service_code: serviceCode,
            service_name: serviceName,
            service_type: formData.service_type || order.service_type,

            // Expedición
            agencia: formData.agencia || '0001/001',
            departamento: formData.departamento || '0',
            fecha: formData.nacex_fec || now.toLocaleDateString('es-ES'),
            bultos: parseInt(formData.nacex_bultos) || order.bultos || 1,
            portes: formData.portes || 'O',
            envase: formData.envase || '2',
            retorno: formData.retorno || 'NO',
            
            // Seguro
            seguro: formData.seguro || 'N',
            imp_seg: formData.nacex_imp_seg || '',

            // Prealerta
            tip_pre: formData.tip_pre || 'NO',
            preal: formData.preal || 'E',
            mod_preal: formData.mod_preal || 'S',
            mod_preal_dest: formData.mod_preal_dest || '',
            mod_preal_mess: formData.mod_preal_mess || '',

            // Reembolso
            reem: formData.reem || '0',
            reembolso: formData.reembolso || 'O',
            imp_ree: formData.imp_ree || order.total,

            // Observaciones
            obs1: formData.obs1 || '',
            obs2: formData.obs2 || '',

            // Internacional
            contenido: formData.con || '',
            valor_declarado: formData.val_dec || '',

            // Instrucciones adicionales
            ins_adi1: formData.ins_adi1 || '',
            ins_adi2: formData.ins_adi2 || '',

            // Ruta
            route: routeData.route,
            color: routeData.color,
            zona: routeData.zona,

            // Meta
            status: '0',
            status_desc: 'Pendiente',
            created_at: now.toISOString(),
            ref_cli: `pedido_${order.id}`
        };
    }

    /**
     * Renderiza la etiqueta en HTML
     */
    static renderLabel(expedition, barcodeImage, routeData) {
        return `
        <div class="nacex-label" style="width:400px; border:2px solid #000; padding:10px; font-family:Arial,sans-serif; font-size:12px; page-break-after:always; background:#fff;">
            
            <!-- Header -->
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #000; padding-bottom:8px; margin-bottom:8px;">
                <div style="font-size:18px; font-weight:bold; color:#FF5000;">NACEX</div>
                <div style="text-align:right;">
                    <div style="font-size:10px;">Fecha: ${expedition.fecha}</div>
                    <div style="font-size:10px;">Ref: ${expedition.ref_cli}</div>
                </div>
            </div>

            <!-- Servicio + Ruta -->
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <div style="background:#f0f0f0; padding:4px 8px; border-radius:3px; font-weight:bold;">
                    ${expedition.service_name}
                </div>
                <div style="display:flex; align-items:center; gap:5px;">
                    <span style="display:inline-block; width:20px; height:20px; background:${routeData.color}; border-radius:3px;"></span>
                    <span style="font-weight:bold;">${routeData.route}</span>
                </div>
            </div>

            <!-- Destinatario -->
            <div style="border:1px solid #ccc; padding:8px; margin-bottom:8px; border-radius:3px;">
                <div style="font-weight:bold; font-size:13px; margin-bottom:4px;">${expedition.customer}</div>
                <div>${expedition.address}</div>
                <div>${expedition.postcode} ${expedition.city}</div>
                <div>${expedition.country}</div>
                <div style="margin-top:4px; font-size:11px;">📞 ${expedition.phone}</div>
                <div style="font-size:11px;">✉ ${expedition.email}</div>
            </div>

            <!-- Detalles -->
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:11px;">
                <div><strong>Bultos:</strong> ${expedition.bultos}</div>
                <div><strong>Portes:</strong> ${expedition.portes}</div>
                <div><strong>Envase:</strong> ${expedition.envase}</div>
                ${expedition.reem === '1' ? `<div><strong>Reemb:</strong> ${expedition.imp_ree}€</div>` : ''}
            </div>

            <!-- Observaciones -->
            ${expedition.obs1 ? `<div style="font-size:11px; color:#666; margin-bottom:4px;">📝 ${expedition.obs1}</div>` : ''}
            ${expedition.obs2 ? `<div style="font-size:11px; color:#666; margin-bottom:8px;">📝 ${expedition.obs2}</div>` : ''}

            <!-- Barcode -->
            <div style="text-align:center; padding:10px 0; border-top:1px solid #ccc;">
                ${barcodeImage ? `<img src="${barcodeImage}" alt="Barcode ${expedition.cod_exp}" style="max-width:100%; height:auto;" />` : 
                `<div style="font-family:monospace; font-size:16px; letter-spacing:2px;">${expedition.cod_exp}</div>`}
            </div>

            <!-- Footer -->
            <div style="display:flex; justify-content:space-between; font-size:10px; color:#666; border-top:1px solid #ccc; padding-top:4px;">
                <div>Exp: ${expedition.cod_exp}</div>
                <div>Pedido: #${expedition.order_id}</div>
                <div>Ag: ${expedition.agencia}</div>
            </div>
        </div>`;
    }
}

module.exports = LabelGenerator;
