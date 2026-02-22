/**
 * BarcodeGenerator - Equivalente a BarcodeHandler.php
 * Genera códigos de barras en diferentes formatos
 */
const bwipjs = require('bwip-js');

class BarcodeGenerator {

    /**
     * Genera un código de barras como imagen PNG en base64
     * @param {string} data - Datos del código de barras
     * @param {string} type - Tipo: code128, interleaved2of5, ean13, etc.
     * @param {object} options - Opciones adicionales
     * @returns {Promise<string>} - Imagen en base64
     */
    static async generateBarcodePng(data, type = 'code128', options = {}) {
        try {
            const defaults = {
                bcid: type,
                text: data,
                scale: options.scale || 3,
                height: options.height || 10,
                includetext: options.includeText !== false,
                textxalign: 'center',
                textsize: options.textSize || 10,
                paddingwidth: options.padding || 2,
                paddingheight: options.padding || 2,
            };
            if (options.width) defaults.width = options.width;

            const png = await bwipjs.toBuffer(defaults);
            return `data:image/png;base64,${png.toString('base64')}`;
        } catch (err) {
            console.error('Error generando barcode:', err.message);
            return null;
        }
    }

    /**
     * Genera barcode tipo Nacex (interleaved 2 of 5) - etiqueta 840
     */
    static async generateNacexBarcode(expeditionCode) {
        return this.generateBarcodePng(expeditionCode, 'interleaved2of5', {
            height: 15,
            scale: 3,
            includeText: true,
            textSize: 12
        });
    }

    /**
     * Genera barcode tipo Code128 - estándar
     */
    static async generateCode128(data) {
        return this.generateBarcodePng(data, 'code128', {
            height: 12,
            scale: 3,
            includeText: true
        });
    }

    /**
     * Genera el código de expedición Nacex
     * Formato: 840XXXXXXXXXXX (13 dígitos)
     */
    static generateExpeditionCode(agencia, numExpedicion) {
        const ag = agencia.toString().padStart(4, '0');
        const num = numExpedicion.toString().padStart(7, '0');
        const base = `840${ag}${num}`;
        // Dígito de control
        const checkDigit = this.calculateCheckDigit(base);
        return `${base}${checkDigit}`;
    }

    /**
     * Calcula dígito de control módulo 10
     */
    static calculateCheckDigit(code) {
        let sum = 0;
        for (let i = code.length - 1; i >= 0; i--) {
            let digit = parseInt(code[i]);
            if ((code.length - i) % 2 === 1) {
                digit *= 3;
            }
            sum += digit;
        }
        return (10 - (sum % 10)) % 10;
    }

    /**
     * Genera ZPL para impresoras térmicas Zebra
     */
    static getZPLBarcode(data) {
        return [
            '^XA',
            '^FO50,50',
            `^BY3`,
            `^B2N,100,Y,N,N`,
            `^FD${data}^FS`,
            '^XZ'
        ].join('\n');
    }

    /**
     * Genera TPCL para impresoras térmicas TSC
     */
    static getTPCLBarcode(data) {
        return [
            'SIZE 100 mm, 80 mm',
            'GAP 3 mm, 0 mm',
            'CLS',
            `BARCODE 50,50,"128",100,1,0,2,2,"${data}"`,
            'PRINT 1',
            'END'
        ].join('\n');
    }

    /**
     * Genera datos para diferentes tipos de impresora
     */
    static getBarcodeForPrinter(data, printerType) {
        switch (printerType.toUpperCase()) {
            case 'ZPL': return this.getZPLBarcode(data);
            case 'TPCL': return this.getTPCLBarcode(data);
            case 'LASER': return data; // Laser usa imagen directa
            default: return data;
        }
    }
}

module.exports = BarcodeGenerator;
