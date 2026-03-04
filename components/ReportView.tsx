
import React from 'react';
import { RemesaDetalle } from '../types';
import { X, Printer, Share2, Barcode } from 'lucide-react';

interface ReportViewProps {
  detalle: RemesaDetalle;
  onClose: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ detalle, onClose }) => {
  const fmt = (n: number | null | undefined) => (n ?? 0).toLocaleString('es-CO');
  const fmtMoney = (n: number | null | undefined) => `$${fmt(n)}`;

  const fechaFormateada = new Date(detalle.Fecha).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  /* ─── Impresión en ventana nueva (compatible con térmicas POS) ─── */
  const handlePrint = () => {
    const comisionHtml = detalle.Comision > 0 ? `<tr><td>Comisión:</td><td style="text-align:right">${fmtMoney(detalle.Comision)}</td></tr>` : '';
    const reexpHtml = detalle.Reexpedicion > 0 ? `<tr><td>Reexpedición:</td><td style="text-align:right">${fmtMoney(detalle.Reexpedicion)}</td></tr>` : '';

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Guía ${detalle.NumeroDocumento}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 80mm; font-family: 'Arial Black', 'Arial', sans-serif; font-size: 13px; font-weight: 700; color: #000; background: #fff; padding: 2mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .center { text-align: center; }
  .sep { border-top: 2px dashed #000; margin: 6px 0; }
  .sep-bold { border-top: 3px solid #000; margin: 6px 0; }
  .section-title { font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; background: #000; color: #fff; padding: 4px 6px; margin-top: 6px; }
  .row { display: flex; justify-content: space-between; padding: 2px 0; font-weight: 700; }
  .field { margin-bottom: 4px; }
  .field .fl { font-size: 9px; font-weight: 900; color: #000; text-transform: uppercase; text-decoration: underline; }
  .field .fv { font-size: 13px; font-weight: 900; }
  .big-num { font-size: 28px; font-weight: 900; text-align: center; }
  .big-label { font-size: 10px; font-weight: 900; text-align: center; text-transform: uppercase; }
  table.valores { width: 100%; border-collapse: collapse; font-size: 13px; font-weight: 700; }
  table.valores td { padding: 3px 0; }
  table.valores .total { font-size: 15px; font-weight: 900; border-top: 3px solid #000; padding-top: 6px; }
  .firma-box { min-height: 50px; border-bottom: 2px solid #000; margin: 8px 0 2px; }
  .cols2 { display: flex; gap: 4px; }
  .cols2 > div { flex: 1; text-align: center; border: 2px solid #000; padding: 6px; }
  .footer { font-size: 9px; font-weight: 700; text-align: center; margin-top: 6px; }
  .pago-box { flex: 1; border: 2px solid #000; padding: 5px; text-align: center; }
  .pago-label { font-size: 9px; font-weight: 900; text-transform: uppercase; }
  .pago-value { font-size: 14px; font-weight: 900; }
</style>
</head><body>

<!-- ENCABEZADO -->
<div class="center" style="margin-bottom:6px">
  <div style="font-size:26px;font-weight:900;letter-spacing:-1px">CT</div>
  <div style="font-size:20px;font-weight:900;letter-spacing:-1px">COOTRANSTAME</div>
  <div style="font-size:12px;font-weight:900;text-decoration:underline">PAQUETERÍA</div>
  <div style="font-size:9px;font-weight:700;margin-top:3px">Lic. Min Transporte 00307 30/10/2002</div>
  <div style="font-size:9px;font-weight:700">AVC 17 134A-10 FONTIBÓN / BOGOTA</div>
  <div style="font-size:9px;font-weight:700">PBX: (1)201 8634</div>
  <div style="font-size:9px;font-weight:700;font-style:italic">Oficina Ppal: Calle 13 cra 14 esq / Tame-Arauca</div>
</div>

<div class="sep-bold"></div>

<!-- CÓDIGO DE BARRAS -->
<div class="center" style="margin:6px 0">
  <canvas id="barcode" style="width:100%;height:50px"></canvas>
  <div style="font-size:14px;font-weight:900;letter-spacing:4px;margin-top:2px">${detalle.NumeroDocumento}</div>
</div>

<div class="sep-bold"></div>

<!-- IDENTIFICADORES -->
<div class="row"><span style="font-weight:900;font-size:16px">GUÍA No.</span><span style="font-weight:900;font-size:16px">${detalle.NumeroDocumento}</span></div>
<div class="row"><span>Fecha</span><span>${fechaFormateada}</span></div>
<div class="row"><span>Oficina Origen</span><span>${detalle.OficinaOrigen || '—'}</span></div>
<div class="row"><span style="font-size:10px">NIT TRANSPORTADOR</span><span style="font-size:10px">892099421-1</span></div>

<div class="sep-bold"></div>

<!-- REMITENTE -->
<div class="section-title">REMITENTE</div>
<div class="field"><div class="fl">Razón Social / Nombre</div><div class="fv">${detalle.NombreRemitente || '—'}</div></div>
<div style="display:flex;gap:8px">
  <div class="field" style="flex:1"><div class="fl">NIT / C.C.</div><div class="fv">${detalle.DocRemitente || '—'}</div></div>
  <div class="field" style="flex:1"><div class="fl">Teléfono</div><div class="fv">${detalle.TelefonoRemitente || detalle.CelularRemitente || '—'}</div></div>
</div>
<div class="field"><div class="fl">Dirección</div><div class="fv">${detalle.DireccionRemitente || ''}${detalle.BarrioRemitente ? ', ' + detalle.BarrioRemitente : ''}</div></div>
<div class="field"><div class="fl">Ciudad</div><div class="fv">${detalle.CiudadRemitente || '—'}</div></div>
${detalle.EmailRemitente ? `<div class="field"><div class="fl">Correo</div><div class="fv">${detalle.EmailRemitente}</div></div>` : ''}

<div class="sep-bold"></div>

<!-- DESTINATARIO -->
<div class="section-title">DESTINATARIO</div>
<div class="field"><div class="fl">Razón Social / Nombre</div><div class="fv">${detalle.NombreDestinatario || '—'}</div></div>
<div style="display:flex;gap:8px">
  <div class="field" style="flex:1"><div class="fl">NIT / C.C.</div><div class="fv">${detalle.DocDestinatario || '—'}</div></div>
  <div class="field" style="flex:1"><div class="fl">Celular</div><div class="fv">${detalle.TelefonoDestinatario || detalle.CelularDestinatario || '—'}</div></div>
</div>
<div class="field"><div class="fl">Dirección</div><div class="fv">${detalle.DireccionDestinatario || ''}${detalle.BarrioDestinatario ? ', ' + detalle.BarrioDestinatario : ''}</div></div>
<div class="field"><div class="fl">Ciudad</div><div class="fv">${detalle.CiudadDestinatario || '—'}</div></div>
${detalle.EmailDestinatario ? `<div class="field"><div class="fl">Correo</div><div class="fv">${detalle.EmailDestinatario}</div></div>` : ''}

<div class="sep-bold"></div>

<!-- CARACTERÍSTICAS DE CARGA -->
<div class="section-title">CARGA</div>
<div class="cols2">
  <div><div class="big-num">${detalle.Unidades}</div><div class="big-label">Unidades</div></div>
  <div><div class="big-num">${detalle.Peso}</div><div class="big-label">Peso / Kg</div></div>
</div>

<div class="sep-bold"></div>

<!-- VALORES -->
<div class="section-title">VALORES</div>
<table class="valores">
  <tr><td>Flete Pactado:</td><td style="text-align:right">${fmtMoney(detalle.Flete)}</td></tr>
  <tr><td>Seguro:</td><td style="text-align:right">${fmtMoney(detalle.Seguro)}</td></tr>
  ${comisionHtml}
  ${reexpHtml}
  <tr style="border-top:2px dashed #000"><td style="font-weight:900">Total Flete:</td><td style="text-align:right;font-weight:900">${fmtMoney(detalle.TotalFlete)}</td></tr>
  <tr><td>Valor Comercial:</td><td style="text-align:right">${fmtMoney(detalle.ValorComercial)}</td></tr>
  <tr class="total"><td>TOTAL REMITENTE:</td><td style="text-align:right">${fmtMoney(detalle.TotalFlete)}</td></tr>
</table>

<div style="display:flex;gap:4px;margin-top:6px">
  <div class="pago-box">
    <div class="pago-label">Forma de Pago</div>
    <div class="pago-value">${detalle.FormaPago || '—'}</div>
  </div>
  <div class="pago-box">
    <div class="pago-label">Doc. Cliente</div>
    <div class="pago-value">${detalle.DocumentoCliente || '—'}</div>
  </div>
</div>

<div class="sep-bold"></div>

<!-- RUTA -->
<div class="section-title">RUTA</div>
<div class="center" style="font-size:18px;font-weight:900;padding:6px 0">${detalle.CiudadRemitente || ''} — ${detalle.CiudadDestinatario || ''}</div>
<div class="field"><div class="fl">Producto</div><div class="fv">PAQUETERÍA</div></div>
<div class="field"><div class="fl">Observaciones</div><div class="fv">${detalle.Observaciones || 'Sin observaciones'}</div></div>

<div class="sep-bold"></div>

<!-- FIRMAS -->
<div style="font-size:11px;font-weight:900;margin-top:6px">Remitente:</div>
<div class="firma-box"></div>
<div style="font-size:11px;font-weight:700">C.C. _______________________</div>

<div style="font-size:11px;font-weight:900;margin-top:8px">Recibí Conforme:</div>
<div class="firma-box"></div>
<div style="font-size:11px;font-weight:700">C.C. _______________________</div>

<div class="sep"></div>

<!-- FECHA RECIBIDO -->
<div style="font-size:11px;font-weight:900;text-decoration:underline;margin-top:6px">Fecha y Hora de Recibido</div>
<div style="display:flex;gap:10px;margin-top:4px;font-size:11px;font-weight:700">
  <span>DD ___ MM ___ AA ___</span>
  <span>HH ___ MM ___</span>
</div>

<div class="sep"></div>
<div class="footer">CERTIFICADO SuperTransporte ISO 9001</div>
<div class="footer">www.cootranstame.com</div>

<script>
// Code 128B barcode generator
(function(){
  var PATTERNS = [
    '11011001100','11001101100','11001100110','10010011000','10010001100',
    '10001001100','10011001000','10011000100','10001100100','11001001000',
    '11001000100','11000100100','10110011100','10011011100','10011001110',
    '10111001100','10011101100','10011100110','11001110010','11001011100',
    '11001001110','11011100100','11001110100','11100101100','11100100110',
    '11101100100','11100110100','11100110010','11011011000','11011000110',
    '11000110110','10100011000','10001011000','10001000110','10110001000',
    '10001101000','10001100010','11010001000','11000101000','11000100010',
    '10110111000','10110001110','10001101110','10111011000','10111000110',
    '10001110110','11101110110','11010001110','11000101110','11011101000',
    '11011100010','11011101110','11101011000','11101000110','11100010110',
    '11101101000','11101100010','11100011010','11101111010','11001000010',
    '11110001010','10100110000','10100001100','10010110000','10010000110',
    '10000101100','10000100110','10110010000','10110000100','10011010000',
    '10011000010','10000110100','10000110010','11000010010','11001010000',
    '11110111010','11000010100','10001111010','10100111100','10010111100',
    '10010011110','10111100100','10011110100','10011110010','11110100100',
    '11110010100','11110010010','11011011110','11011110110','11110110110',
    '10101111000','10100011110','10001011110','10111101000','10111100010',
    '10001111010','11110101000','11110100010','10111011110','10111101110',
    '11101011110','11110101110','11010000100','11010010000','11010011100',
    '1100011101011'
  ];
  var code = '${detalle.NumeroDocumento}'.toString();
  var encoded = [PATTERNS[104]]; // Start Code B
  var checksum = 104;
  for(var i=0;i<code.length;i++){
    var val = code.charCodeAt(i) - 32;
    encoded.push(PATTERNS[val]);
    checksum += val * (i+1);
  }
  encoded.push(PATTERNS[checksum % 103]);
  encoded.push(PATTERNS[106]); // Stop
  var bits = encoded.join('');
  var canvas = document.getElementById('barcode');
  var ctx = canvas.getContext('2d');
  var scale = 2;
  canvas.width = bits.length * scale;
  canvas.height = 80;
  canvas.style.width = '100%';
  canvas.style.height = '50px';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  for(var j=0;j<bits.length;j++){
    if(bits[j]==='1'){
      ctx.fillStyle='#000';
      ctx.fillRect(j*scale,0,scale,canvas.height);
    }
  }
})();
window.onload=function(){setTimeout(function(){window.print();window.onafterprint=function(){window.close();}},100);}
<\/script>
</body></html>`;

    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="bg-gray-100 border-b-2 border-black p-2">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
    </div>
  );

  const LabelValue = ({ label, value, bold = false }: { label: string, value: any, bold?: boolean }) => (
    <div className="flex flex-col mb-2">
      <span className="text-[8px] font-bold text-gray-500 uppercase leading-none mb-1">{label}</span>
      <span className={`text-[11px] ${bold ? 'font-black' : 'font-medium'} text-black leading-tight break-words`}>
        {value || '—'}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-in slide-in-from-bottom duration-300 print-report-root">
      {/* Mobile Sticky UI Header */}
      <div className="bg-white p-4 flex items-center justify-between border-b sticky top-0 z-30 no-print">
        <button onClick={onClose} className="p-2 text-gray-600 active:scale-90 transition-transform">
          <X size={24} />
        </button>
        <div className="text-center">
          <h2 className="font-black text-blue-900 uppercase tracking-tighter text-sm">Guía de Paquetería</h2>
          <p className="text-[9px] text-gray-400 font-bold">REPORTE OFICIAL</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Main Scrollable Report Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 print-content">
        <div className="max-w-md mx-auto bg-white border-2 border-black shadow-2xl font-mono text-black mb-20 overflow-hidden">
          
          {/* 1. Header: Carrier Branding */}
          <div className="p-4 border-b-2 border-black text-center relative bg-white">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white border-2 border-black">
                <span className="font-black text-lg">CT</span>
              </div>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-1">COOTRANSTAME</h1>
            <p className="text-[10px] font-black underline mb-2">PAQUETERÍA</p>
            <p className="text-[8px] font-bold leading-tight mb-2">Lic. Min Transporte 00307 30/10/2002</p>
            
            <div className="space-y-1 text-[8px] font-medium border-t border-black/10 pt-2">
              <p>AVC 17 134A-10 FONTIBÓN / BOGOTA</p>
              <p>PBX: (1)201 8634 / (1)2018634</p>
              <p className="italic">Oficina Principal Calle 13 carrera 14 esquina / Tame - Arauca</p>
            </div>

            <div className="mt-3 flex flex-wrap justify-center gap-2 border-t border-black/10 pt-2">
              <span className="text-[7px] font-bold text-blue-600">www.cootranstame.com/normativa</span>
              <span className="text-[7px] font-bold text-blue-600">www.cootranstame.com/nuevo-pqrs</span>
            </div>
          </div>

          {/* 2. Document Identifiers */}
          <div className="p-4 border-b-2 border-black flex flex-col items-center bg-gray-50/50">
            <div className="w-full flex justify-center opacity-80 mb-3">
              <Barcode size={64} strokeWidth={1} />
            </div>
            <div className="text-center w-full space-y-1">
              <div className="flex justify-between items-center text-sm font-black border-b border-black/10 pb-1">
                <span>GUÍA No.</span>
                <span>{detalle.NumeroDocumento}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold py-1">
                <span>Fecha</span>
                <span>{fechaFormateada}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold py-1">
                <span>Oficina Origen</span>
                <span>{detalle.OficinaOrigen}</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-black text-gray-500 pt-1">
                <span>NIT TRANSPORTADOR</span>
                <span>892099421-1</span>
              </div>
            </div>
          </div>

          {/* 3. Sender Block */}
          <SectionTitle title="Remitente" />
          <div className="p-4 border-b-2 border-black grid grid-cols-1 gap-1">
            <LabelValue label="Razón Social / Nombre" value={detalle.NombreRemitente} bold />
            <div className="grid grid-cols-2 gap-2">
              <LabelValue label="NIT / C.C." value={detalle.DocRemitente} />
              <LabelValue label="Teléfono" value={detalle.TelefonoRemitente || detalle.CelularRemitente} />
            </div>
            <LabelValue label="Dirección" value={`${detalle.DireccionRemitente}${detalle.BarrioRemitente ? `, ${detalle.BarrioRemitente}` : ''}`} />
            <LabelValue label="Ciudad" value={detalle.CiudadRemitente} />
            {detalle.EmailRemitente && (
              <LabelValue label="Correo Electrónico" value={detalle.EmailRemitente} />
            )}
          </div>

          {/* 4. Recipient Block */}
          <SectionTitle title="Destinatario" />
          <div className="p-4 border-b-2 border-black grid grid-cols-1 gap-1">
            <LabelValue label="Razón Social / Nombre" value={detalle.NombreDestinatario} bold />
            <div className="grid grid-cols-2 gap-2">
              <LabelValue label="NIT / C.C." value={detalle.DocDestinatario} />
              <LabelValue label="Celular" value={detalle.TelefonoDestinatario || detalle.CelularDestinatario} />
            </div>
            <LabelValue label="Dirección" value={`${detalle.DireccionDestinatario}${detalle.BarrioDestinatario ? `, ${detalle.BarrioDestinatario}` : ''}`} />
            <LabelValue label="Ciudad" value={detalle.CiudadDestinatario} />
            {detalle.EmailDestinatario && (
              <LabelValue label="Correo Electrónico" value={detalle.EmailDestinatario} />
            )}
          </div>

          {/* 5. Physical Measures */}
          <SectionTitle title="Características de Carga" />
          <div className="grid grid-cols-2 border-b-2 border-black">
            <div className="p-4 border-r-2 border-black flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black leading-none">{detalle.Unidades}</span>
              <span className="text-[8px] font-bold uppercase mt-1">Unidades</span>
            </div>
            <div className="p-4 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black leading-none">{detalle.Peso}</span>
              <span className="text-[8px] font-bold uppercase mt-1">Peso / Kg</span>
            </div>
          </div>

          {/* 6. Pricing Breakdown */}
          <SectionTitle title="Valores de Envío" />
          <div className="p-4 border-b-2 border-black space-y-2 bg-white">
            <div className="flex justify-between text-[11px] font-bold">
              <span>Flete Pactado:</span>
              <span>{fmtMoney(detalle.Flete)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span>Seguro:</span>
              <span>{fmtMoney(detalle.Seguro)}</span>
            </div>
            {detalle.Comision > 0 && (
              <div className="flex justify-between text-[11px] font-bold">
                <span>Comisión:</span>
                <span>{fmtMoney(detalle.Comision)}</span>
              </div>
            )}
            {detalle.Reexpedicion > 0 && (
              <div className="flex justify-between text-[11px] font-bold">
                <span>Reexpedición:</span>
                <span>{fmtMoney(detalle.Reexpedicion)}</span>
              </div>
            )}
            <div className="flex justify-between text-[11px] font-bold border-b border-black/10 pb-1">
              <span>Total Flete:</span>
              <span>{fmtMoney(detalle.TotalFlete)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-gray-500">
              <span>Valor Comercial:</span>
              <span>{fmtMoney(detalle.ValorComercial)}</span>
            </div>
            <div className="flex justify-between text-[13px] font-black pt-2 border-t border-black">
              <span>TOTAL REMITENTE:</span>
              <span>{fmtMoney(detalle.TotalFlete)}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-gray-50 border border-black rounded flex flex-col items-center justify-center">
                <span className="text-[8px] font-black uppercase text-gray-400 mb-1">Forma de Pago</span>
                <span className="text-sm font-black">{detalle.FormaPago || '—'}</span>
              </div>
              <div className="p-3 bg-gray-50 border border-black rounded flex flex-col items-center justify-center">
                <span className="text-[8px] font-black uppercase text-gray-400 mb-1">Doc. Cliente</span>
                <span className="text-sm font-black">{detalle.DocumentoCliente || '—'}</span>
              </div>
            </div>
          </div>

          {/* 7. Route & Additional Details */}
          <SectionTitle title="Logística y Ruta" />
          <div className="p-4 border-b-2 border-black space-y-4">
            <div className="text-center bg-gray-50 p-2 border border-black/10">
              <p className="text-[10px] font-black underline mb-1 uppercase tracking-wider">{detalle.FormaPago}</p>
              <p className="text-xl font-black uppercase tracking-tighter">{detalle.CiudadRemitente} – {detalle.CiudadDestinatario}</p>
            </div>
            
            <div className="space-y-2">
              <LabelValue label="Producto" value="PAQUETERÍA" bold />
              <LabelValue label="Observaciones" value={detalle.Observaciones || 'Sin observaciones'} />
              <div className="pt-2 border-t border-black/10 flex justify-between items-center">
                 <span className="text-[9px] font-black">PRUEBA DE ENTREGA:</span>
                 <span className="text-[9px] font-bold">Física [X] Electrónica [ ]</span>
              </div>
            </div>
          </div>

          {/* 8. Delivery Attempts Table */}
          <SectionTitle title="Intentos de Entrega" />
          <div className="border-b-2 border-black overflow-hidden">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-gray-100 text-[8px] font-black uppercase border-b border-black">
                  <th className="p-1 border-r border-black">Fecha</th>
                  <th className="p-1 border-r border-black">Hora</th>
                  <th className="p-1">Cod Causa</th>
                </tr>
              </thead>
              <tbody className="text-[10px] font-bold">
                <tr className="border-b border-black/10 h-8">
                  <td className="border-r border-black/10 p-1">___/___/___</td>
                  <td className="border-r border-black/10 p-1">___:___</td>
                  <td className="p-1 italic text-[8px] text-gray-300">N/A</td>
                </tr>
                <tr className="h-8">
                  <td className="border-r border-black/10 p-1">___/___/___</td>
                  <td className="border-r border-black/10 p-1">___:___</td>
                  <td className="p-1 italic text-[8px] text-gray-300">N/A</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 9. Signatures Block */}
          <div className="grid grid-cols-1 border-b-2 border-black">
            <div className="p-6 border-b border-black min-h-[120px] flex flex-col justify-between">
              <p className="text-[9px] font-black uppercase">Remitente:</p>
              <div className="w-full h-12 flex items-center justify-center opacity-10">
                <span className="text-[10px] italic">[Espacio para firma manuscrita]</span>
              </div>
              <div className="border-t border-black pt-1">
                <span className="text-[10px] font-bold">C.C. _______________________</span>
              </div>
            </div>
            <div className="p-6 min-h-[120px] flex flex-col justify-between bg-gray-50/30">
              <p className="text-[9px] font-black uppercase">Recibí Conforme:</p>
              <div className="w-full h-12 flex items-center justify-center opacity-10">
                <span className="text-[10px] italic">[Espacio para firma destinatario]</span>
              </div>
              <div className="border-t border-black pt-1">
                <span className="text-[10px] font-bold">C.C. _______________________</span>
              </div>
            </div>
          </div>

          {/* 10. Receipt Data & Date */}
          <div className="p-4 border-b-2 border-black bg-white">
            <p className="text-[9px] font-black underline uppercase mb-3">Fecha y Hora de Recibido</p>
            <div className="grid grid-cols-2 gap-8">
               <div className="flex flex-col items-center">
                 <div className="flex gap-4 text-[10px] font-black mb-1">
                   <span>DD</span>
                   <span>MM</span>
                   <span>AA</span>
                 </div>
                 <div className="w-full h-px bg-black/20" />
               </div>
               <div className="flex flex-col items-center">
                 <div className="flex gap-4 text-[10px] font-black mb-1">
                   <span>HH</span>
                   <span>MM</span>
                 </div>
                 <div className="w-full h-px bg-black/20" />
               </div>
            </div>
          </div>

          {/* 11. Final Audit Footer */}
          <div className="p-4 bg-gray-50 space-y-3">
            <div className="pt-4 flex justify-between items-center border-t border-black/5">
              <p className="text-[7px] font-black text-gray-300">CERTIFICADO SuperTransporte ISO 9001</p>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black rotate-[-90deg] origin-center opacity-30 tracking-widest text-gray-500">SuperTransporte</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Floating Actions */}
      <div className="p-6 bg-white border-t border-gray-100 flex flex-row gap-3 no-print rounded-t-[40px] shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
        <button 
          className="flex-1 py-5 bg-white text-blue-900 border-2 border-blue-50 rounded-[20px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Reporte Guía ${detalle.NumeroDocumento}`,
                text: `Detalles de la guía de envío ${detalle.NumeroDocumento}`,
                url: window.location.href,
              }).catch(() => {});
            }
          }}
        >
          <Share2 size={20} /> Compartir
        </button>
        <button 
          onClick={handlePrint}
          className="flex-1 py-5 bg-blue-900 text-white rounded-[24px] font-black shadow-2xl shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
        >
          <Printer size={20} /> Imprimir Guía
        </button>
      </div>
    </div>
  );
};

export default ReportView;
