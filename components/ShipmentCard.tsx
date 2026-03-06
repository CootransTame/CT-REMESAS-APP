
import React from 'react';
import { Shipment, ShipmentStatus } from '../types';
import { MapPin, Box, ChevronRight, Truck } from 'lucide-react';

/** Quita sufijo 'Z' de fechas del servidor para evitar doble resta UTC-5 */
const parseDateCO = (d: string) => new Date(typeof d === 'string' ? d.replace(/Z$/i, '') : d);

interface ShipmentCardProps {
  shipment: Shipment;
  onClick: () => void;
}

const getStatusColor = (status: ShipmentStatus) => {
  switch (status) {
    case ShipmentStatus.RECOGIDA: 
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case ShipmentStatus.OFICINA_ORIGEN: 
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case ShipmentStatus.TRANSITO: 
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case ShipmentStatus.RECIBIDA_OFICINA_INTERMEDIA: 
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case ShipmentStatus.RECIBIDA_OFICINA_DESTINO: 
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    case ShipmentStatus.REPARTO_OFICINA_DESTINO: 
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case ShipmentStatus.ENTREGADA_CUMPLIDA: 
      return 'bg-green-100 text-green-800 border-green-200';
    case ShipmentStatus.DEVUELTA_OFICINA_DESTINO: 
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default: 
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:bg-gray-50 transition-colors cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-blue-900 group-hover:text-blue-700 transition-colors">{shipment.id}</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{parseDateCO(shipment.createdAt).toLocaleDateString('es-CO')} • {parseDateCO(shipment.createdAt).toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'})}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase border ${getStatusColor(shipment.status)}`}>
          {shipment.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={16} className="text-blue-500 shrink-0" />
          <span className="truncate font-medium text-gray-700">{shipment.route}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Box size={16} className="text-blue-500 shrink-0" />
          <span className="text-gray-500 truncate text-xs">{shipment.product} • {shipment.units} un • {shipment.weight} kg</span>
        </div>
      </div>

      <div className="flex justify-between items-end pt-2 border-t border-gray-50">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase text-gray-400 font-black tracking-widest">Remitente</span>
          <span className="text-xs font-bold text-gray-800 truncate max-w-[150px]">
            {shipment.sender.firstName} {shipment.sender.lastName}
          </span>
        </div>
        <div className="flex items-center text-blue-600 font-bold text-xs gap-1 group-hover:gap-2 transition-all">
          Ver Detalles <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};

export default ShipmentCard;
