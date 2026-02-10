
import React, { useState } from 'react';
import { Shipment, ShipmentStatus } from '../types';
import { 
  X, Printer, Clock, Image, AlertCircle, CheckCircle2, 
  Trash2, QrCode, FileText, Camera, Upload, ShieldCheck, 
  CreditCard, User, Info, MapPin, Phone, Mail, Fingerprint
} from 'lucide-react';
import { FAIL_REASONS } from '../constants';
import SignaturePad from './SignaturePad';
import ReportView from './ReportView';
import LabelView from './LabelView';

interface DetailViewProps {
  shipment: Shipment;
  onClose: () => void;
  onStatusChange: (status: ShipmentStatus) => void;
}

const DetailView: React.FC<DetailViewProps> = ({ shipment, onClose, onStatusChange }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'actions' | 'tracking'>('info');
  const [showSignature, setShowSignature] = useState(false);
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showLabel, setShowLabel] = useState(false);

  const canAnular = () => {
    const diff = Date.now() - new Date(shipment.createdAt).getTime();
    return diff <= 20 * 60 * 1000;
  };

  const isDespachada = shipment.status === ShipmentStatus.DESPACHADA;

  const handlePrintReport = () => {
    setShowReport(true);
  };

  const handlePrintLabel = () => {
    setShowLabel(true);
  };

  const renderInfo = () => (
    <div className="space-y-4 pb-10">
      {/* Sección Legal y Servicio */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-start gap-3 border-b border-gray-50 pb-3">
          <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-700">Lic. Min. Transporte N.º 00307 del 30/10/2002</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Tipo de Servicio</p>
            <p className="text-sm font-bold text-blue-900">{shipment.product.toUpperCase()}</p>
            <p className="text-[10px] text-gray-400 italic">Mercancía convencional</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">N.º Factura</p>
            <p className="text-sm font-bold text-gray-900">{shipment.payrollNumber || 'FACT-772910'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Estado Actual</p>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${shipment.status === ShipmentStatus.CUMPLIDA ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
              {shipment.status}
            </span>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Estado DIAN</p>
            <p className={`text-xs font-black uppercase ${shipment.dianStatus === 'emitido' ? 'text-green-600' : 'text-red-500'}`}>
              {shipment.dianStatus}
            </p>
          </div>
        </div>
      </div>

      {/* Datos del Remitente Completo */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
          <User size={14} /> Datos del Remitente
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Nombre Completo</p>
              <p className="text-sm font-bold">{shipment.sender.firstName} {shipment.sender.lastName}</p>
            </div>
            <div className="w-1/3">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Identificación</p>
              <p className="text-xs font-medium text-gray-600">{shipment.sender.idType} {shipment.sender.idNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl">
            <MapPin size={14} className="text-blue-500" />
            <span className="font-medium">{shipment.sender.address}, {shipment.sender.city}</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl">
              <Phone size={14} className="text-green-500" />
              <span className="font-medium">{shipment.sender.phone}</span>
            </div>
            <div className="flex-1 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl">
              <Mail size={14} className="text-orange-500" />
              <span className="font-medium truncate">{shipment.sender.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Datos del Destinatario Completo */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
          <Fingerprint size={14} /> Datos del Destinatario
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Nombre Completo</p>
              <p className="text-sm font-bold">{shipment.receiver.firstName} {shipment.receiver.lastName}</p>
            </div>
            <div className="w-1/3">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Identificación</p>
              <p className="text-xs font-medium text-gray-600">{shipment.receiver.idType} {shipment.receiver.idNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl">
            <MapPin size={14} className="text-blue-500" />
            <span className="font-medium">{shipment.receiver.address}, {shipment.receiver.city}</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl">
              <Phone size={14} className="text-green-500" />
              <span className="font-medium">{shipment.receiver.phone}</span>
            </div>
            <div className="flex-1 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl">
              <Mail size={14} className="text-orange-500" />
              <span className="font-medium truncate">{shipment.receiver.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desglose Financiero */}
      <div className="bg-[#f8fafc] p-6 rounded-[40px] border border-blue-50 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard size={18} className="text-blue-600" />
          <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Resumen de Cobro</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Flete de Transporte</span>
            <span className="font-bold text-gray-900">${shipment.values.freight.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Valor del Seguro</span>
            <span className="font-bold text-gray-900">${shipment.values.insurance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-blue-100">
            <div>
              <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest block">Valor del Producto (Total)</span>
              <span className="text-xs text-gray-400 font-medium italic">Sumatoria Seguro + Flete</span>
            </div>
            <span className="font-black text-2xl text-blue-900">${shipment.values.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Método de Pago</p>
              <p className="text-sm font-bold text-gray-800">{shipment.paymentMethod}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Valor Comercial</p>
            <p className="text-sm font-bold text-blue-600">${shipment.commercialValue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Campo de Observaciones */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
          <Info size={14} /> Observaciones / Descripción
        </h3>
        <div className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-600 leading-relaxed font-medium">
          {shipment.description || 'Sin observaciones adicionales para esta remesa.'}
        </div>
      </div>
    </div>
  );

  const renderActions = () => (
    <div className="grid grid-cols-2 gap-3 pb-6">
      <button 
        onClick={handlePrintReport}
        className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border hover:bg-gray-50 active:bg-blue-50 transition-colors"
      >
        <Printer className="text-blue-600 mb-2" size={28} />
        <span className="text-xs font-bold text-gray-700">Reporte</span>
      </button>

      <button 
        onClick={handlePrintLabel}
        className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border hover:bg-gray-50 active:bg-blue-50 transition-colors"
      >
        <QrCode className="text-blue-600 mb-2" size={28} />
        <span className="text-xs font-bold text-gray-700">Rótulo</span>
      </button>

      <button 
        onClick={() => setShowEvidenceModal(true)}
        className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border hover:bg-gray-50 active:bg-blue-50 transition-colors"
      >
        <Image className="text-blue-600 mb-2" size={28} />
        <span className="text-xs font-bold text-gray-700">Evidencias</span>
      </button>

      <button 
        disabled={!isDespachada}
        onClick={() => setShowSignature(true)}
        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-colors ${
          isDespachada ? 'bg-white hover:bg-gray-50 active:bg-green-50' : 'bg-gray-50 opacity-50 cursor-not-allowed'
        }`}
      >
        <CheckCircle2 className={`${isDespachada ? 'text-green-600' : 'text-gray-400'} mb-2`} size={28} />
        <span className="text-xs font-bold text-gray-700">Cumplido</span>
      </button>

      <button 
        disabled={!isDespachada}
        onClick={() => setShowFailedModal(true)}
        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-colors ${
          isDespachada ? 'bg-white hover:bg-gray-50 active:bg-red-50' : 'bg-gray-50 opacity-50 cursor-not-allowed'
        }`}
      >
        <AlertCircle className={`${isDespachada ? 'text-orange-500' : 'text-gray-400'} mb-2`} size={28} />
        <span className="text-xs font-bold text-gray-700">Intento Fallido</span>
      </button>

      <button 
        disabled={!canAnular()}
        onClick={() => setShowAnularModal(true)}
        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-colors ${
          canAnular() ? 'bg-white hover:bg-gray-50 active:bg-red-50' : 'bg-gray-50 opacity-50 cursor-not-allowed'
        }`}
      >
        <Trash2 className={`${canAnular() ? 'text-red-500' : 'text-gray-400'} mb-2`} size={28} />
        <span className="text-xs font-bold text-gray-700">Anular</span>
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-50 z-40 flex flex-col no-print">
      <div className="bg-white p-4 flex items-center justify-between border-b sticky top-0 z-20">
        <button onClick={onClose} className="p-2"><X size={24} /></button>
        <h2 className="font-bold text-lg text-blue-900">{shipment.id}</h2>
        <div className="w-8" />
      </div>

      <div className="flex bg-white border-b sticky top-[60px] z-10">
        <button 
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'info' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}
        >
          Información
        </button>
        <button 
          onClick={() => setActiveTab('actions')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'actions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}
        >
          Operaciones
        </button>
        <button 
          onClick={() => setActiveTab('tracking')}
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'tracking' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400'}`}
        >
          Estados
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'info' && renderInfo()}
        {activeTab === 'actions' && renderActions()}
        {activeTab === 'tracking' && (
          <div className="space-y-4 pb-20">
            <div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
              <div className="relative">
                <div className="absolute -left-[26px] top-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white shadow-sm" />
                <p className="text-xs text-gray-400 font-bold">{new Date().toLocaleString()}</p>
                <p className="font-bold text-gray-700">Estado: {shipment.status.toUpperCase()}</p>
                <p className="text-sm text-gray-500">Oficina: {shipment.currentOffice}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[26px] top-1 w-4 h-4 bg-blue-400 rounded-full border-4 border-white shadow-sm" />
                <p className="text-xs text-gray-400 font-bold">{new Date(shipment.createdAt).toLocaleString()}</p>
                <p className="font-bold text-gray-700">CREACIÓN DE GUÍA</p>
                <p className="text-sm text-gray-500">Origen: {shipment.originOffice}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Signature Modal */}
      {showSignature && (
        <SignaturePad 
          title="Firma de Cumplimiento"
          onSave={(data) => {
            onStatusChange(ShipmentStatus.CUMPLIDA);
            setShowSignature(false);
            onClose();
          }}
          onCancel={() => setShowSignature(false)}
        />
      )}

      {/* Anular Modal */}
      {showAnularModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900">Anular Remesa</h3>
              <p className="text-sm text-gray-500 font-medium text-center mt-2">¿Estás seguro? Esta acción no se puede deshacer.</p>
            </div>
            
            <textarea 
              className="w-full p-4 border border-gray-100 rounded-2xl mb-6 h-32 focus:ring-2 focus:ring-red-100 outline-none bg-gray-50 text-sm font-medium" 
              placeholder="Escribe el motivo de la anulación aquí..." 
            />
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  alert('Remesa anulada exitosamente');
                  setShowAnularModal(false);
                  onClose();
                }} 
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-100 active:scale-95 transition-all text-lg"
              >
                Confirmar Anulación
              </button>
              <button onClick={() => setShowAnularModal(false)} className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold">Regresar</button>
            </div>
          </div>
        </div>
      )}

      {/* Failed Attempt Modal */}
      {showFailedModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white w-full max-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-black text-blue-900 mb-6 flex items-center gap-2">
              <AlertCircle className="text-orange-500" /> Intento Fallido
            </h3>
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-4">Seleccione la causal:</p>
            <div className="space-y-3 mb-8">
              {FAIL_REASONS.map((reason, i) => (
                <button 
                  key={i} 
                  onClick={() => {
                    onStatusChange(ShipmentStatus.INTENTO_FALLIDO);
                    setShowFailedModal(false);
                    onClose();
                  }}
                  className="w-full p-4 text-left border border-gray-100 rounded-2xl hover:bg-blue-50 active:bg-blue-100 font-bold text-xs text-gray-700 transition-all flex items-center justify-between"
                >
                  {reason}
                  <Clock size={14} className="text-gray-300" />
                </button>
              ))}
            </div>
            <button onClick={() => setShowFailedModal(false)} className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold">Cancelar</button>
          </div>
        </div>
      )}

      {/* Evidence Modal */}
      {showEvidenceModal && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-2xl font-black text-blue-900">Evidencias</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Soporte fotográfico de entrega</p>
            </div>
            <button onClick={() => setShowEvidenceModal(false)} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500">
              <X size={24}/>
            </button>
          </div>
          
          <div className="flex-1 grid grid-cols-2 gap-4 auto-rows-min overflow-y-auto pr-1">
            <label className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-[32px] border-2 border-dashed border-blue-200 cursor-pointer active:scale-95 transition-transform text-center group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                <Camera className="text-blue-600" size={32} />
              </div>
              <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Cámara</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" />
            </label>
            <label className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 cursor-pointer active:scale-95 transition-transform text-center group">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-gray-100 group-hover:scale-110 transition-transform">
                <Upload className="text-gray-500" size={32} />
              </div>
              <span className="text-xs font-black text-gray-700 uppercase tracking-widest">Galería</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>

            {shipment.evidences.map((ev, i) => (
              <div key={i} className="aspect-square bg-white p-2 rounded-[32px] shadow-md border border-gray-50 relative group">
                <img src={ev} alt="Evidencia" className="w-full h-full object-cover rounded-[24px]" />
                <button className="absolute top-4 right-4 bg-white shadow-xl p-2 rounded-xl text-red-500 active:scale-90 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={16}/>
                </button>
              </div>
            ))}
          </div>

          <button onClick={() => setShowEvidenceModal(false)} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-blue-100 mt-6 active:scale-95 transition-all">
            Guardar Evidencias
          </button>
        </div>
      )}

      {/* Report View Modal */}
      {showReport && (
        <ReportView 
          shipment={shipment} 
          onClose={() => setShowReport(false)} 
        />
      )}

      {/* Label View Modal */}
      {showLabel && (
        <LabelView 
          shipment={shipment} 
          onClose={() => setShowLabel(false)} 
        />
      )}
    </div>
  );
};

export default DetailView;
