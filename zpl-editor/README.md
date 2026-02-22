# ZPL Label Editor

Editor de etiquetas ZPL con preview en vivo, inspirado en [Labelary Viewer](https://labelary.com/viewer.html).

## Características

- **Editor ZPL** con syntax highlighting (CodeMirror + modo ZPL personalizado)
- **Preview en vivo** via Labelary API (PNG, PDF)
- **9 plantillas predefinidas**: Nacex 840, 841, Shop, Internacional, Devolución, Shipping, QR, Warehouse, Blank
- **Linter ZPL** con detección de errores (^XA/^XZ, ^FD sin ^FS, posiciones fuera de rango)
- **Referencia ZPL** contextual (35+ comandos documentados)
- **Descargas**: ZPL, PNG, PDF
- **Configuración**: Densidad (6/8/12/24 dpmm), Calidad, Tamaño de etiqueta, Unidades (inches/cm/mm)
- **Auto-redibujado** al escribir (configurable)
- **Rotar** etiqueta
- **Permalink** (compartir código ZPL via URL)
- **Abrir archivos** .zpl/.txt/.prn
- **Persistencia** en localStorage
- **Paneles redimensionables**
- **Atajos**: Ctrl+Enter (render), Ctrl+S (descargar), Ctrl+Z/Y (undo/redo)
- **Multi-label**: Navegación entre etiquetas cuando el ZPL genera múltiples
- **Tema oscuro** (Dracula)

## Instalación

```bash
npm install
npm start
# → http://localhost:3000
```

## Estructura

```
zpl-editor/
├── server.js              # Express server
├── config/
│   ├── templates.js       # 9 plantillas ZPL predefinidas
│   └── zpl-commands.js    # 35+ comandos ZPL documentados
├── views/
│   └── editor.ejs         # Vista principal
├── public/
│   ├── css/editor.css     # Estilos (tema Catppuccin)
│   └── js/
│       ├── zpl-mode.js    # Syntax highlighting ZPL para CodeMirror
│       └── editor.js      # Lógica principal del editor
└── package.json
```

## Plantillas Nacex incluidas

| Plantilla | Descripción |
|-----------|-------------|
| Nacex 840 | Etiqueta estándar con datos completos |
| Nacex 841 | Etiqueta extra (bultos adicionales) |
| NacexShop | Entrega en punto de recogida |
| Internacional | Con datos aduaneros |
| Devolución | Etiqueta de retorno |

## API utilizada

El rendering se realiza directamente desde el navegador contra la API pública de Labelary:

```
POST https://api.labelary.com/v1/printers/{dpmm}/labels/{width}x{height}/{index}/
Body: ZPL code
Accept: image/png | application/pdf
```

No se requiere proxy ni API key para uso básico.

## Dependencias

- `express` - Servidor HTTP
- `ejs` - Templates
- CDN: CodeMirror 5, Material Icons, Toastify
