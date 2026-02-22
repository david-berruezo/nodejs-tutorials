/**
 * Plantillas ZPL predefinidas
 */
module.exports = [
    {
        id: 'nacex-840',
        name: '🏷️ Nacex Etiqueta 840',
        category: 'nacex',
        width: 4, height: 6, dpmm: 8,
        zpl: `^XA

^FX === NACEX ETIQUETA 840 ===

^FX -- Header con logo NACEX --
^CF0,50
^FO30,30^FDNACEX^FS
^CF0,20
^FO230,35^FDe-Commerce^FS
^FO30,80^GB750,3,3^FS

^FX -- Info abonado y fecha --
^CFA,20
^FO30,100^FDAbonado: 0001/001^FS
^FO400,100^FDFecha: 22/02/2026^FS
^FO30,130^FDServicio: NACEX 19:00H (04)^FS
^FO400,130^FDRef: pedido_1042^FS
^FO30,160^GB750,3,3^FS

^FX -- Destinatario --
^CF0,35
^FO30,180^FDDestinatario:^FS
^CF0,30
^FO30,225^FDJuan Garcia Lopez^FS
^CFA,24
^FO30,265^FDCalle Gran Via, 45 3o B^FS
^FO30,295^FD28013 Madrid^FS
^FO30,325^FDEspana^FS
^FO30,360^FDTel: +34 612345678^FS
^FO30,385^FDEmail: juan@email.com^FS
^FO30,415^GB750,3,3^FS

^FX -- Detalles envio --
^CFA,22
^FO30,435^FDBultos: 1^FS
^FO200,435^FDPortes: O-Origen^FS
^FO450,435^FDEnvase: PAQ^FS
^FO30,465^FDPeso: 2.5 kg^FS
^FO200,465^FDSeguro: No^FS

^FX -- Ruta --
^FO30,500^GB750,3,3^FS
^FO30,515^GB120,80,120^FS
^FR
^CF0,50
^FO45,530^FDR015^FS
^FR
^CF0,28
^FO170,525^FDZona: NACIONAL^FS
^FO170,560^FDAgencia destino: 0028^FS

^FX -- Observaciones --
^FO30,610^GB750,3,3^FS
^CFA,20
^FO30,625^FDObs: Entregar en horario de manana^FS

^FX -- Codigo de barras --
^FO30,665^GB750,3,3^FS
^BY3,2,150
^FO120,690^BC^FD840000112345679^FS

^FX -- Footer --
^FO30,880^GB750,3,3^FS
^CFA,18
^FO30,895^FDExp: 840000112345679^FS
^FO300,895^FDPedido: #1042^FS
^FO550,895^FDAg: 0001/001^FS

^XZ`
    },
    {
        id: 'nacex-841',
        name: '🏷️ Nacex Etiqueta 841 (Extra)',
        category: 'nacex',
        width: 4, height: 6, dpmm: 8,
        zpl: `^XA

^FX === NACEX ETIQUETA 841 (EXTRA) ===

^FX -- Header --
^CF0,50
^FO30,30^FDNACEX^FS
^CF0,20
^FO230,35^FD841 - EXTRA^FS
^FO600,30^GB170,50,3^FS
^CF0,28
^FO620,40^FDEXTRA^FS
^FO30,80^GB750,3,3^FS

^FX -- Datos expedicion --
^CFA,22
^FO30,100^FDExp. Original: 840000112345679^FS
^FO30,130^FDExp. Extra: 841000112345680^FS
^FO30,160^FDFecha: 22/02/2026^FS
^FO400,160^FDServicio: 04^FS

^FO30,190^GB750,3,3^FS

^FX -- Destinatario --
^CF0,30
^FO30,210^FDJuan Garcia Lopez^FS
^CFA,24
^FO30,250^FDCalle Gran Via, 45 3o B^FS
^FO30,280^FD28013 Madrid - Espana^FS
^FO30,310^FDTel: +34 612345678^FS

^FX -- Barcode --
^FO30,350^GB750,3,3^FS
^BY3,2,180
^FO120,380^BC^FD841000112345680^FS

^FX -- Footer --
^FO30,600^GB750,3,3^FS
^CFA,18
^FO30,615^FDBulto 1 de 1 | Ref: pedido_1042^FS

^XZ`
    },
    {
        id: 'nacex-shop',
        name: '🏪 Nacex Shop Label',
        category: 'nacex',
        width: 4, height: 6, dpmm: 8,
        zpl: `^XA

^FX === NACEX SHOP ===

^FX -- Header --
^CF0,45
^FO30,30^FDNACEX^FS
^FO220,30^GB3,45,3^FS
^CF0,30
^FO240,38^FDSHOP^FS
^FO30,80^GB750,3,3^FS

^FX -- Punto de entrega --
^CF0,24
^FO30,100^FDPunto de entrega NacexShop:^FS
^FO30,130^GB750,120,3^FS
^CF0,30
^FO50,145^FDPUNTOPACK Madrid Centro^FS
^CFA,22
^FO50,180^FDCalle Atocha, 12^FS
^FO50,210^FD28012 Madrid^FS

^FX -- Destinatario --
^CF0,24
^FO30,270^FDDestinatario:^FS
^CF0,28
^FO30,300^FDMaria Rodriguez^FS
^CFA,22
^FO30,335^FDTel: +34 698765432^FS
^FO30,360^FDemail: maria@email.com^FS

^FX -- Barcode --
^FO30,400^GB750,3,3^FS
^BY3,2,150
^FO120,420^BC^FD840003112378905^FS

^FX -- Footer --
^FO30,610^GB750,3,3^FS
^CFA,18
^FO30,625^FDServicio: NacexShop eCOMM (31)^FS
^FO30,650^FDRef: pedido_1050 | Ag: 0001/001^FS

^XZ`
    },
    {
        id: 'nacex-int',
        name: '🌍 Nacex Internacional',
        category: 'nacex',
        width: 4, height: 8, dpmm: 8,
        zpl: `^XA

^FX === NACEX INTERNACIONAL ===

^FX -- Header --
^CF0,45
^FO30,30^FDNACEX^FS
^CF0,25
^FO230,35^FDINTERNACIONAL^FS
^FO30,80^GB750,3,3^FS

^FX -- Remitente --
^CFA,20
^FO30,95^FDRemitente:^FS
^CF0,24
^FO30,120^FDTienda Online SL^FS
^CFA,20
^FO30,150^FDPoligono Industrial, Nave 5^FS
^FO30,175^FD08820 El Prat de Llobregat^FS
^FO30,200^FDEspana (ES)^FS

^FO30,230^GB750,3,3^FS

^FX -- Destinatario --
^CFA,20
^FO30,245^FDDestinatario:^FS
^CF0,28
^FO30,275^FDPierre Dupont^FS
^CFA,22
^FO30,310^FD15 Rue de Rivoli^FS
^FO30,340^FD75004 Paris^FS
^FO30,370^FDFrance (FR)^FS
^FO30,400^FDTel: +33 612345678^FS

^FO30,430^GB750,3,3^FS

^FX -- Datos aduaneros --
^CF0,24
^FO30,445^FDDatos Aduaneros^FS
^CFA,20
^FO30,475^FDContenido: Ropa textil^FS
^FO30,500^FDValor declarado: 85.00 EUR^FS
^FO30,525^FDPeso: 1.2 kg^FS
^FO400,475^FDEnvase: PAQ^FS
^FO400,500^FDHS Code: 6109.10^FS

^FO30,555^GB750,3,3^FS

^FX -- Barcode --
^BY3,2,150
^FO120,575^BC^FD840000512345671^FS

^FX -- Footer --
^FO30,770^GB750,3,3^FS
^CFA,18
^FO30,785^FDServ: NCX INT EUROPA (A) | Ref: pedido_1060^FS

^XZ`
    },
    {
        id: 'shipping-basic',
        name: '📦 Shipping Label Basic',
        category: 'generic',
        width: 4, height: 6, dpmm: 8,
        zpl: `^XA
^FX Top section with company name and address
^CF0,60
^FO50,50^GB100,100,100^FS
^FO75,75^FR^GB100,100,100^FS
^FO93,93^GB40,40,40^FS
^FO220,50^FDIntershipping, Inc.^FS
^CF0,30
^FO220,115^FD1000 Shipping Lane^FS
^FO220,155^FDShelbyville TN 38102^FS
^FO220,195^FDUnited States (USA)^FS
^FO50,250^GB700,3,3^FS

^FX Second section with recipient address
^CFA,30
^FO50,300^FDJohn Doe^FS
^FO50,340^FD100 Main Street^FS
^FO50,380^FDSpringfield TN 39021^FS
^FO50,420^FDUnited States (USA)^FS
^CFA,15
^FO600,300^GB150,150,3^FS
^FO638,340^FDPermit^FS
^FO638,390^FD123456^FS
^FO50,500^GB700,3,3^FS

^FX Third section with bar code
^BY5,2,270
^FO100,550^BC^FD12345678^FS

^FX Fourth section (the two boxes on the bottom)
^FO50,900^GB700,250,3^FS
^FO400,900^GB3,250,3^FS
^CF0,40
^FO100,960^FDCtr. X34B-1^FS
^FO100,1010^FDREF1 F00B47^FS
^FO100,1060^FDREF2 BL4H8^FS
^CF0,190
^FO470,955^FDCA^FS
^XZ`
    },
    {
        id: 'qr-label',
        name: '📱 QR Code Label',
        category: 'generic',
        width: 4, height: 3, dpmm: 8,
        zpl: `^XA

^FX QR Code Label

^CF0,40
^FO30,30^FDProduct Info^FS
^FO30,80^GB750,3,3^FS

^FO50,100^BQN,2,8^FDQA,https://www.nacex.com/seguimientoDetalle.do?codExp=840000112345679^FS

^CFA,24
^FO330,120^FDScan para tracking^FS
^FO330,155^FDExp: 840000112345679^FS
^FO330,185^FDFecha: 22/02/2026^FS
^FO330,215^FDServicio: NACEX 19:00H^FS

^XZ`
    },
    {
        id: 'warehouse',
        name: '🏭 Warehouse Label',
        category: 'generic',
        width: 4, height: 2, dpmm: 8,
        zpl: `^XA

^FX Warehouse location label
^CF0,60
^FO30,20^FDA-12-03^FS

^FO30,90^GB750,3,3^FS

^BY2,2,80
^FO30,110^BC^FDSKU-4890123^FS

^CFA,24
^FO500,110^FDQty: 150^FS
^FO500,145^FDBin: A-12-03^FS

^XZ`
    },
    {
        id: 'return-label',
        name: '↩️ Return Label',
        category: 'nacex',
        width: 4, height: 4, dpmm: 8,
        zpl: `^XA

^FX === ETIQUETA DE DEVOLUCION ===

^FO30,30^GB750,60,60^FS
^FR
^CF0,40
^FO250,38^FDDEVOLUCION^FS
^FR

^FO30,110^GB750,3,3^FS

^CFA,24
^FO30,130^FDRemitente (cliente):^FS
^CF0,26
^FO30,160^FDJuan Garcia Lopez^FS
^CFA,22
^FO30,195^FDCalle Gran Via, 45^FS
^FO30,225^FD28013 Madrid^FS

^FO30,260^GB750,3,3^FS

^CFA,24
^FO30,280^FDDestino (almacen):^FS
^CF0,26
^FO30,310^FDTienda Online SL^FS
^CFA,22
^FO30,345^FDPoligono Industrial, Nave 5^FS
^FO30,375^FD08820 El Prat de Llobregat^FS

^FO30,410^GB750,3,3^FS

^BY3,2,100
^FO150,430^BC^FDRET840000112345679^FS

^CFA,18
^FO30,560^FDRef devolucion: DEV-2026-001542^FS

^XZ`
    },
    {
        id: 'blank',
        name: '📝 Blank Label',
        category: 'generic',
        width: 4, height: 6, dpmm: 8,
        zpl: `^XA
^FX Your ZPL code here
^CF0,40
^FO50,50^FDHello World^FS
^XZ`
    }
];
