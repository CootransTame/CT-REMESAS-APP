
import React from 'react';
import { Shipment } from '../types';
import { X, Printer, Share2, Barcode, ExternalLink, Info } from 'lucide-react';

interface ReportViewProps {
  shipment: Shipment;
  onClose: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ shipment, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const SectionTitle = ({ title, verticalLabel }: { title: string, verticalLabel?: string }) => (
    <div className="bg-gray-100 border-b-2 border-black p-2 flex items-center justify-between">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
      {verticalLabel && <span className="text-[8px] font-bold opacity-30 uppercase">{verticalLabel}</span>}
    </div>
  );

  const LabelValue = ({ label, value, bold = false }: { label: string, value: any, bold?: boolean }) => (
    <div className="flex flex-col mb-2">
      <span className="text-[8px] font-bold text-gray-500 uppercase leading-none mb-1">{label}</span>
      <span className={`text-[11px] ${bold ? 'font-black' : 'font-medium'} text-black leading-tight break-words`}>
        {value || 'N/A'}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col no-print animate-in slide-in-from-bottom duration-300">
      {/* Mobile Sticky UI Header */}
      <div className="bg-white p-4 flex items-center justify-between border-b sticky top-0 z-30 no-print">
        <button onClick={onClose} className="p-2 text-gray-600 active:scale-90 transition-transform">
          <X size={24} />
        </button>
        <div className="text-center">
          <h2 className="font-black text-blue-900 uppercase tracking-tighter text-sm">Guía de Paquetería</h2>
          <p className="text-[9px] text-gray-400 font-bold">REPORTE OFICIAL</p>
        </div>
        <div className="w-10" /> {/* Espaciador para mantener centrado */}
      </div>

      {/* Main Scrollable Report Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
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
                <span>{shipment.id.split('-')[1] || shipment.id}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold py-1">
                <span>Factura No.</span>
                <span>{shipment.payrollNumber || '---'}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold py-1">
                <span>PreImpreso No.</span>
                <span>BT594464</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-black text-gray-500 pt-1">
                <span>NIT TRANSPORTADOR</span>
                <span>892099421-1</span>
              </div>
            </div>
          </div>

          {/* 3. Sender Block */}
          <SectionTitle title="Remitente" verticalLabel="REMITENTE" />
          <div className="p-4 border-b-2 border-black grid grid-cols-1 gap-1">
            <LabelValue label="Razón Social / Nombre" value={`${shipment.sender.firstName} ${shipment.sender.lastName}`} bold />
            <div className="grid grid-cols-2 gap-2">
              <LabelValue label="NIT / C.C." value={shipment.sender.idNumber} />
              <LabelValue label="Teléfono" value={shipment.sender.phone} />
            </div>
            <LabelValue label="Dirección" value={shipment.sender.address} />
            <LabelValue label="Ciudad / C.P." value={`${shipment.sender.city} - ${shipment.sender.postalCode}`} />
            <LabelValue label="Correo Electrónico" value={shipment.sender.email} />
          </div>

          {/* 4. Recipient Block */}
          <SectionTitle title="Destinatario" verticalLabel="DESTINATARIO" />
          <div className="p-4 border-b-2 border-black grid grid-cols-1 gap-1">
            <LabelValue label="Razón Social / Nombre" value={`${shipment.receiver.firstName} ${shipment.receiver.lastName}`} bold />
            <div className="grid grid-cols-2 gap-2">
              <LabelValue label="NIT / C.C." value={shipment.receiver.idNumber} />
              <LabelValue label="Celular" value={shipment.receiver.phone} />
            </div>
            <LabelValue label="Dirección" value={shipment.receiver.address} />
            <LabelValue label="Lugar / Barrio" value={shipment.receiver.neighborhood || 'Sector Centro'} />
            <LabelValue label="Ciudad" value={shipment.receiver.city} />
          </div>

          {/* 5. Physical Measures */}
          <SectionTitle title="Características de Carga" />
          <div className="grid grid-cols-3 border-b-2 border-black">
            <div className="p-4 border-r-2 border-black flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black leading-none">{shipment.units}</span>
              <span className="text-[8px] font-bold uppercase mt-1">Unidades</span>
            </div>
            <div className="p-4 border-r-2 border-black flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black leading-none">{shipment.weight}</span>
              <span className="text-[8px] font-bold uppercase mt-1">Peso/Kg</span>
            </div>
            <div className="p-2 flex flex-col items-center justify-center text-center">
              <p className="text-[7px] font-black uppercase mb-1">Verificado</p>
              <div className="flex gap-2 text-[8px] font-bold">
                <span>Si [ ]</span>
                <span>No [ ]</span>
              </div>
            </div>
          </div>

          {/* 6. Pricing Breakdown */}
          <SectionTitle title="Valores de Envío" />
          <div className="p-4 border-b-2 border-black space-y-2 bg-white">
            <div className="flex justify-between text-[11px] font-bold">
              <span>Flete:</span>
              <span>${shipment.values.freight.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold">
              <span>Seguro:</span>
              <span>${shipment.values.insurance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold border-b border-black/10 pb-1">
              <span>Total Flete:</span>
              <span>${shipment.values.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-gray-500">
              <span>V. Producto:</span>
              <span>${shipment.commercialValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[13px] font-black pt-2 border-t border-black">
              <span>TOTAL REMITENTE:</span>
              <span>${shipment.values.total.toLocaleString()}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-gray-50 border border-black rounded flex flex-col items-center justify-center">
                <span className="text-[8px] font-black uppercase text-gray-400 mb-1">Cobro en Destino</span>
                <span className="text-xl font-black">$0</span>
              </div>
              <div className="p-2 border border-black rounded flex flex-col items-center justify-center">
                <span className="text-[8px] font-black uppercase text-gray-400 mb-1">Producto al cobro</span>
                <div className="flex gap-2 text-[10px] font-bold">
                  <span>Si [ ]</span>
                  <span className="text-blue-600">No [X]</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Route & Additional Details */}
          <SectionTitle title="Logística y Ruta" verticalLabel="CUMPLIDO" />
          <div className="p-4 border-b-2 border-black space-y-4">
            <div className="text-center bg-gray-50 p-2 border border-black/10">
              <p className="text-[10px] font-black underline mb-1 uppercase tracking-wider">{shipment.paymentMethod}</p>
              <p className="text-xl font-black uppercase tracking-tighter">{shipment.route.replace(' - ', '–')}</p>
            </div>
            
            <div className="space-y-2">
              <LabelValue label="Producto" value={shipment.product} bold />
              <LabelValue label="Observaciones" value={shipment.description || "6 BULTOS // SVC"} />
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
            <div className="flex justify-between items-start">
               <div className="space-y-1">
                 <p className="text-[8px] font-black text-gray-400 uppercase leading-none">Elaboro:</p>
                 <p className="text-[9px] font-bold text-gray-700 uppercase">DAYRA VALENTINA LIZCANO MONCADA</p>
               </div>
               <div className="text-right">
                 <p className="text-[8px] font-black text-gray-400 uppercase leading-none">CUFE:</p>
                 <p className="text-[9px] font-bold text-gray-300 italic">No generado</p>
               </div>
            </div>
            
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
                title: `Reporte Guía ${shipment.id}`,
                text: `Detalles de la guía de envío ${shipment.id}`,
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
