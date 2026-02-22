# 🏷️ Nacex Label Manager - Node.js

Gestor de etiquetas Nacex implementado en **Node.js nativo** (Express), equivalente al sistema PHP del plugin WordPress `nacexlogista`.

## 📁 Estructura del Proyecto

```
nacex-label-manager/
├── server.js                    # Servidor Express (entrada principal)
├── config/
│   ├── constantes.js            # ≡ Constantes.php (servicios, envases, portes...)
│   └── database.js              # ≡ BDWordpress.php (almacenamiento JSON)
├── routes/
│   ├── print.js                 # ≡ AdminNacexLogistaPrintController (rutas web)
│   └── api.js                   # ≡ AjaxRequestManager.php (API REST/AJAX)
├── utils/
│   ├── barcode.js               # ≡ BarcodeHandler.php (Code128, I2of5, ZPL, TPCL)
│   └── label-generator.js       # ≡ Expedition.php generateLabel()
├── views/
│   ├── print.ejs                # ≡ print.php (formulario completo)
│   └── expeditions.ejs          # Vista de expediciones
├── public/
│   ├── css/style.css            # Estilos (equivalente a los inline de print.php)
│   └── js/print.js              # JS cliente (DataTables, filtros, AJAX)
├── data/                        # Base de datos JSON (auto-generada)
│   ├── orders.json              # 50 pedidos de ejemplo
│   ├── expeditions.json         # Expediciones generadas
│   └── config.json              # Configuración
└── package.json
```

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start

# O en modo desarrollo (auto-reload)
npm run dev
```

Acceder a: **http://localhost:3000/print**

## 📋 Equivalencias PHP → Node.js

| PHP (WordPress Plugin)          | Node.js                      |
|---------------------------------|------------------------------|
| `print.php`                     | `views/print.ejs`            |
| `Constantes.php`                | `config/constantes.js`       |
| `Expedition.php`                | `utils/label-generator.js`   |
| `BarcodeHandler.php`            | `utils/barcode.js`           |
| `AdminNacexLogistaPrintController` | `routes/print.js`         |
| `AjaxRequestManager.php`       | `routes/api.js`              |
| `BDWordpress.php`               | `config/database.js`         |
| `DataExpedition.php`            | Integrado en `label-generator.js` |
| `Webservice.php`                | Simulado en `label-generator.js`  |

## 🔌 API Endpoints

| Método | Endpoint                | Equivalente PHP                    |
|--------|-------------------------|------------------------------------|
| GET    | `/api/orders`           | `nacex_get_filtered_orders`        |
| GET    | `/api/orders/:id`       | `get_order_expeditions`            |
| POST   | `/api/gen-label`        | `gen_label` (método 1)             |
| POST   | `/api/repeat-label`     | `gen_label` (método 2)             |
| GET    | `/api/preview/:id`      | `get_preview`                      |
| GET    | `/api/barcode/:code`    | Barcode PNG en base64              |
| GET    | `/api/barcode-raw/:code`| ZPL/TPCL para impresoras térmicas  |
| GET    | `/api/expeditions`      | `get_expeditions`                  |
| POST   | `/api/cancel-expedition`| `cancel_expedition`                |
| GET    | `/api/config`           | `devolverConfig`                   |
| GET    | `/api/constants`        | Constantes para frontend           |

## 🏷️ Barcodes Soportados

- **Code128** - Estándar
- **Interleaved 2 of 5** - Etiquetas Nacex (840)
- **ZPL** - Impresoras Zebra
- **TPCL** - Impresoras TSC

## 📝 Formulario

El formulario replica todos los campos de `print.php`:
- Abonado / Departamento / Servicio
- Fecha / Bultos / Tipo de servicio
- Portes (O/D/T) / Envase (DOCS/BAG/PAQ/MUESTRA/DOCUMENTO)
- Retorno / Seguro / Prealerta (SMS/Email)
- Modo prealerta / Reembolso
- Observaciones / Campos internacionales
- Instrucciones adicionales

## 🎯 Funcionalidades

- ✅ DataTables con paginación server-side
- ✅ Filtros por fecha, servicio, tipo, pago, estado, cliente
- ✅ Generación de etiquetas con barcode
- ✅ Repetir etiqueta / Etiqueta extra
- ✅ Preview de pedido con barcode
- ✅ Modal de impresión con zoom
- ✅ Soporte impresoras térmicas (ZPL/TPCL)
- ✅ 50 pedidos de ejemplo auto-generados
- ✅ Toasts de notificación
- ✅ Responsive design

## 📦 Dependencias

- `express` - Servidor HTTP (equivalente a PHP nativo)
- `ejs` - Motor de plantillas (equivalente a PHP templates)
- `bwip-js` - Generación de barcodes (equivalente a BarcodeHandler)
