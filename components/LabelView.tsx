
import React from 'react';
import { Shipment } from '../types';
import { X, Printer, Share2, Barcode, QrCode } from 'lucide-react';

interface LabelViewProps {
  shipment: Shipment;
  onClose: () => void;
}

const LabelView: React.FC<LabelViewProps> = ({ shipment, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  // Extraer origen y destino de la ruta (ej: "Medellín - Bogotá")
  const routeParts = shipment.route.split(' - ');
  const origin = routeParts[0] || 'ORIGEN';
  const destination = routeParts[1] || 'DESTINO';

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col no-print animate-in slide-in-from-bottom duration-300 overflow-hidden">
      {/* Mobile UI Header */}
      <div className="bg-white p-4 flex items-center justify-between border-b sticky top-0 z-30 no-print">
        <button onClick={onClose} className="p-2 text-gray-600 active:scale-90 transition-transform">
          <X size={24} />
        </button>
        <div className="text-center">
          <h2 className="font-black text-blue-900 uppercase tracking-tighter text-sm">Vista de Rótulo</h2>
          <p className="text-[9px] text-gray-400 font-bold">ETIQUETA TÉRMICA</p>
        </div>
        <div className="w-10" /> {/* Espaciador para mantener el título centrado al quitar la impresora */}
      </div>

      {/* Main Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100 flex items-start justify-center">
        {/* The Label (Sticker) */}
        <div className="w-full max-w-[400px] aspect-square bg-white border-2 border-black shadow-2xl font-sans text-black relative flex flex-col p-4 print:m-0 print:border-0 print:shadow-none print:w-[100mm] print:h-[100mm]">
          
          {/* 1. Header Row */}
          <div className="flex justify-between items-start border-b border-black pb-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-blue-900">
                <div className="w-4 h-4 bg-blue-900 rounded-sm flex items-center justify-center text-[8px] text-white font-black">CT</div>
                <span className="text-[10px] font-black italic tracking-tighter">COOTRANSTAME</span>
              </div>
              <span className="text-[6px] font-bold text-gray-500 italic">¡En transporte tu mejor elección!</span>
            </div>
            
            <div className="text-center flex-1">
              <h1 className="text-sm font-black uppercase tracking-widest">PAQUETERÍA</h1>
            </div>

            <div className="border border-black p-1 text-[6px] font-bold flex flex-col leading-tight bg-gray-50">
              <span>Versión: 02</span>
              <span>24/04/2024</span>
              <span>CT-F-OP-099</span>
            </div>
          </div>

          {/* 2. Barcode Section */}
          <div className="flex flex-col items-center py-2 opacity-80">
            <Barcode size={48} strokeWidth={1.5} />
          </div>

          {/* 3. Guide ID */}
          <div className="text-center py-1">
            <h2 className="text-2xl font-black uppercase tracking-tight">Guía: {shipment.id.split('-')[1] || shipment.id}</h2>
          </div>

          {/* 4. Empty Labels / Info */}
          <div className="flex flex-col gap-1 py-2 text-[10px] font-black">
            <p>PreGuia:</p>
            <p>Cliente: <span className="font-medium text-gray-400">{shipment.client}</span></p>
          </div>

          {/* 5. BIG ROUTE TEXT */}
          <div className="flex-1 flex flex-col items-center justify-center text-center py-2">
            <h3 className="text-5xl font-black uppercase leading-none tracking-tighter">{origin}</h3>
            <h3 className="text-5xl font-black uppercase leading-none tracking-tighter mt-1">{destination}</h3>
          </div>

          {/* 6. Footer Row: Conteo & QR */}
          <div className="flex justify-between items-end pt-4">
            <div className="text-5xl font-black tracking-widest">
              1 / {shipment.units}
            </div>
            <div className="bg-white border-2 border-black p-1">
              <QrCode size={64} strokeWidth={1.5} />
            </div>
          </div>

          {/* 7. Side Mark */}
          <div className="absolute right-1 top-1/2 -rotate-90 origin-right flex items-center gap-1 opacity-20 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600">SuperTransporte</span>
          </div>

        </div>
      </div>

      {/* Action Bar */}
      <div className="p-6 bg-white border-t border-gray-100 flex flex-row gap-3 no-print rounded-t-[40px] shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
        <button 
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Rótulo ${shipment.id}`,
                text: `Etiqueta de envío ${shipment.id} para ${shipment.receiver.firstName}`,
                url: window.location.href,
              }).catch(() => {});
            }
          }}
          className="flex-1 py-5 bg-white text-blue-900 border-2 border-blue-50 rounded-[20px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
        >
          <Share2 size={20} /> Compartir
        </button>
        <button 
          onClick={handlePrint}
          className="flex-1 py-5 bg-blue-900 text-white rounded-[24px] font-black shadow-2xl shadow-blue-200 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm md:text-lg"
        >
          <Printer size={20} /> Imprimir Rótulo
        </button>
      </div>
    </div>
  );
};

export default LabelView;
