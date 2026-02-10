
import React, { useState } from 'react';
import { ThirdParty, PaymentMethod } from '../types';
import { 
  ChevronLeft, ChevronRight, Save, Search, PenTool as SignatureIcon, 
  Printer, QrCode, Mail, MessageCircle, CheckCircle, Home,
  Zap, Clock, Repeat, AlertCircle, Box, User, Truck, MapPin, ChevronDown as ChevronDownIcon,
  Loader2
} from 'lucide-react';
import SignaturePad from './SignaturePad';

interface WizardProps {
  onComplete: (data: any) => void;
  onCancel: () => void;
}

const COLOMBIAN_CITIES = [
  "Bogotá D.C.", "Medellín", "Cali", "Barranquilla", "Cartagena", 
  "Bucaramanga", "Pereira", "Santa Marta", "Ibagué", "Pasto", 
  "Manizales", "Neiva", "Villavicencio", "Armenia", "Montería"
];

const ID_TYPES = ["CC", "NIT", "CE", "TI"];

const PRODUCT_TYPES = ["Producto genérico", "Esmaltes", "Pinturas", "Aceites", "Tinner", "Paquetería", "Documentos", "Carga Seca"];
const RATE_TYPES = ["Kilo", "Valor fijo", "Valor metro cúbico"];

const Wizard: React.FC<WizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('servicio');
  const [formData, setFormData] = useState({
    config: {
      deliveryType: 'Normal' as 'Normal' | 'Urgente',
      isInternalDistribution: false
    },
    sender: {
      clientName: '', 
      clientDocument: '', 
      firstName: '',
      lastName: '',
      idType: 'CC',
      idNumber: '',
      address: '',
      city: '',
      phone: '',
      email: '',
      municipality: '',
      department: '',
      postalCode: ''
    },
    receiver: {
      firstName: '',
      lastName: '',
      idType: 'CC',
      idNumber: '',
      city: '',
      address: '',
      neighborhood: '',
      phone: '',
      email: '',
      isPickupAtOffice: false,
      municipality: '',
      department: '',
      postalCode: ''
    },
    details: {
      paymentMethod: PaymentMethod.CASH,
      product: 'Producto genérico',
      rateType: 'Kilo',
      weight: 0,
      units: 0,
      commercialValue: 0,
      description: '',
      dimensions: { length: 0, height: 0, width: 0 }
    },
    pricing: {
      suggestedFlete: 0,
      fletePactado: 0,
      valorSeguro: 0,
      total: 0,
      signature: ''
    }
  });
  const [showSignature, setShowSignature] = useState(false);

  const steps = ['Tipo de Envío', 'Remitente', 'Destinatario', 'Detalles', 'Valor de la remesa', 'Resumen'];

  const isStepValid = () => {
    if (step === 1) return true;
    if (step === 2) {
      const { clientName, clientDocument, idType, idNumber, firstName, lastName, address, city, phone, email } = formData.sender;
      return (
        clientName.trim() !== '' && 
        clientDocument.trim() !== '' && 
        idType !== '' && 
        idNumber.trim() !== '' && 
        firstName.trim() !== '' && 
        lastName.trim() !== '' && 
        address.trim() !== '' && 
        city !== '' && 
        phone.trim() !== '' && 
        email.trim() !== ''
      );
    }
    if (step === 3) {
      const { firstName, lastName, idType, idNumber, city, address, phone, email } = formData.receiver;
      return (
        firstName.trim() !== '' && 
        lastName.trim() !== '' && 
        idType !== '' && 
        idNumber.trim() !== '' && 
        city !== '' && 
        address.trim() !== '' && 
        phone.trim() !== '' && 
        email.trim() !== ''
      );
    }
    if (step === 4) {
      const { product, weight, units, commercialValue, rateType } = formData.details;
      return product !== '' && weight > 0 && units > 0 && commercialValue > 0 && rateType !== '';
    }
    if (step === 5) {
      const minFleteAllowed = formData.pricing.suggestedFlete * 0.8;
      const isFleteInvalid = formData.pricing.fletePactado < minFleteAllowed;
      return formData.pricing.signature !== '' && !isFleteInvalid;
    }
    return true;
  };

  const next = () => {
    if (step === 4) {
      const { weight, units, commercialValue } = formData.details;
      const basePrice = 12000;
      const calcFlete = Math.round(basePrice + (weight * 3500) + (units * 1500));
      const calcSeguro = Math.round(commercialValue * 0.10);
      const calcTotal = calcFlete + calcSeguro;

      setFormData(prev => ({ 
        ...prev, 
        pricing: { 
          ...prev.pricing, 
          suggestedFlete: calcFlete,
          fletePactado: calcFlete,
          valorSeguro: calcSeguro,
          total: calcTotal 
        } 
      }));
    }
    setStep(prev => prev + 1);
  };

  const back = () => setStep(prev => prev - 1);

  const handleSenderChange = (field: string, value: string) => {
    if (['clientDocument', 'idNumber', 'phone'].includes(field)) {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, sender: { ...prev.sender, [field]: numericValue } }));
      return;
    }
    setFormData(prev => ({ ...prev, sender: { ...prev.sender, [field]: value } }));
  };

  const handleReceiverChange = (field: string, value: any) => {
    if (['idNumber', 'phone'].includes(field)) {
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({ ...prev, receiver: { ...prev.receiver, [field]: numericValue } }));
      return;
    }
    setFormData(prev => ({ ...prev, receiver: { ...prev.receiver, [field]: value } }));
  };

  const handleFleteChange = (val: number) => {
    const newTotal = val + formData.pricing.valorSeguro;
    setFormData(prev => ({ 
      ...prev, 
      pricing: { 
        ...prev.pricing, 
        fletePactado: val,
        total: newTotal
      } 
    }));
  };

  const handleSubmit = () => {
    setIsFinalizing(true);
    setTimeout(() => {
      setIsFinalizing(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const SummaryItem = ({ label, value, fullWidth = false }: { label: string, value: string | number, fullWidth?: boolean }) => (
    <div className={`${fullWidth ? 'col-span-2' : 'col-span-1'} space-y-0.5`}>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-gray-800 break-words">{value || '---'}</p>
    </div>
  );

  // Fix: Added optional chaining to children in the type definition to resolve TypeScript errors where children weren't correctly inferred in JSX.
  const AccordionSection = ({ id, title, icon: Icon, children }: { id: string, title: string, icon: any, children?: React.ReactNode }) => (
    <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm transition-all">
      <button 
        onClick={() => toggleSection(id)}
        className={`w-full pl-7 pr-12 py-5 flex items-center justify-between transition-colors ${expandedSection === id ? 'bg-blue-50/50' : 'bg-white'}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${expandedSection === id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
            <Icon size={20} />
          </div>
          <span className={`font-black text-sm uppercase tracking-tight ${expandedSection === id ? 'text-blue-900' : 'text-gray-500'}`}>{title}</span>
        </div>
        <ChevronDownIcon size={20} className={`text-gray-300 transition-transform duration-300 ${expandedSection === id ? 'rotate-180' : ''}`} />
      </button>
      {expandedSection === id && (
        <div className="px-7 pb-6 pt-0 grid grid-cols-2 gap-y-4 gap-x-2 animate-in slide-in-from-top-1 duration-200">
          <div className="col-span-2 h-px bg-gray-50 mb-1" />
          {children}
        </div>
      )}
    </div>
  );

  if (isFinalizing) {
    return (
      <div className="fixed inset-0 bg-[#f8fafc] z-[70] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-blue-600 rounded-[35px] flex items-center justify-center shadow-2xl shadow-blue-100 animate-pulse">
            <Loader2 size={48} className="text-white animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-blue-900 mb-2">Procesando Envío</h2>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest animate-pulse">Sincronizando con base de datos...</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-[#f8fafc] z-[60] flex flex-col animate-in fade-in duration-500">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
          <div className="mb-8 relative">
            <div className="w-24 h-24 bg-green-500 rounded-[35px] flex items-center justify-center shadow-2xl shadow-green-100 animate-bounce">
              <CheckCircle size={48} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-blue-900 mb-2">¡Envío Exitoso!</h2>
          <p className="text-gray-500 font-medium mb-10 max-w-xs">La remesa ha sido creada correctamente en el sistema corporativo.</p>
          <div className="w-full max-sm space-y-4 mb-10">
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-6 bg-white border border-blue-50 rounded-[30px] shadow-lg active:scale-95 transition-all text-blue-600 font-bold">
                <Printer size={32} className="mb-2" />
                <span className="text-[10px] uppercase tracking-widest">Imprimir Remesa</span>
              </button>
              <button className="flex flex-col items-center justify-center p-6 bg-white border border-blue-50 rounded-[30px] shadow-lg active:scale-95 transition-all text-blue-600 font-bold">
                <QrCode size={32} className="mb-2" />
                <span className="text-[10px] uppercase tracking-widest">Imprimir Rótulo</span>
              </button>
            </div>
          </div>
          <button onClick={() => onComplete(formData)} className="w-full max-w-sm bg-blue-900 text-white py-5 rounded-[24px] font-black shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 transition-all text-lg mb-8">
            <Home size={24} /> Volver al Home
          </button>
        </div>
      </div>
    );
  }

  const stepValid = isStepValid();

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="space-y-2 text-center">
              <h3 className="font-black text-2xl text-blue-900">Tipo de Envío</h3>
              <p className="text-sm text-gray-500 font-medium">Configure la prioridad y tipo de servicio</p>
            </div>
            
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Prioridad de Entrega</p>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData(prev => ({ ...prev, config: { ...prev.config, deliveryType: 'Normal' } }))} 
                  className={`flex flex-col items-center p-6 rounded-[32px] border-2 transition-all active:scale-95 ${formData.config.deliveryType === 'Normal' ? 'bg-blue-50 border-blue-600 shadow-lg shadow-blue-100' : 'bg-white border-gray-100'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${formData.config.deliveryType === 'Normal' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Clock size={24} />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${formData.config.deliveryType === 'Normal' ? 'text-blue-900' : 'text-gray-400'}`}>Normal</span>
                </button>
                <button 
                  onClick={() => setFormData(prev => ({ ...prev, config: { ...prev.config, deliveryType: 'Urgente' } }))} 
                  className={`flex flex-col items-center p-6 rounded-[32px] border-2 transition-all active:scale-95 ${formData.config.deliveryType === 'Urgente' ? 'bg-amber-50 border-amber-500 shadow-lg shadow-amber-100' : 'bg-white border-gray-100'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${formData.config.deliveryType === 'Urgente' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Zap size={24} />
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${formData.config.deliveryType === 'Urgente' ? 'text-amber-900' : 'text-gray-400'}`}>Urgente</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-100/50 flex items-center justify-between transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.config.isInternalDistribution ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-gray-100 text-gray-400'}`}>
                  <Repeat size={24} />
                </div>
                <div>
                  <p className="font-black text-gray-900 leading-tight">Remesa de distribución interna</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Operación corporativa</p>
                </div>
              </div>
              
              <button 
                onClick={() => setFormData(prev => ({ ...prev, config: { ...prev.config, isInternalDistribution: !prev.config.isInternalDistribution } }))}
                className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 ${formData.config.isInternalDistribution ? 'bg-indigo-600' : 'bg-gray-200'}`}
              >
                <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md transform ${formData.config.isInternalDistribution ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="font-black text-xl text-blue-900">Datos del Remitente</h3>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" placeholder="Cliente *" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.sender.clientName} onChange={e => handleSenderChange('clientName', e.target.value)} />
              <input type="tel" placeholder="Documento Cliente *" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.sender.clientDocument} onChange={e => handleSenderChange('clientDocument', e.target.value)} />
              <div className="h-px bg-gray-100 my-2" />
              <input type="text" placeholder="Nombre *" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.sender.firstName} onChange={e => handleSenderChange('firstName', e.target.value)} />
              <input type="text" placeholder="Apellido *" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.sender.lastName} onChange={e => handleSenderChange('lastName', e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <select className="p-4 border rounded-2xl outline-none bg-white pr-12" value={formData.sender.idType} onChange={e => handleSenderChange('idType', e.target.value)}>
                  {ID_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <input type="tel" placeholder="ID *" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.sender.idNumber} onChange={e => handleSenderChange('idNumber', e.target.value)} />
              </div>
              <select className="p-4 border rounded-2xl bg-white pr-12" value={formData.sender.city} onChange={e => handleSenderChange('city', e.target.value)}>
                <option value="" disabled>Seleccionar Ciudad *</option>
                {COLOMBIAN_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
              <input type="text" placeholder="Dirección *" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.sender.address} onChange={e => handleSenderChange('address', e.target.value)} />
              <input type="tel" placeholder="Teléfono *" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.sender.phone} onChange={e => handleSenderChange('phone', e.target.value)} />
              <input type="email" placeholder="Email *" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.sender.email} onChange={e => handleSenderChange('email', e.target.value)} />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="font-black text-xl text-blue-900">Datos del Destinatario</h3>
            <div className="grid grid-cols-1 gap-4">
              <input type="text" placeholder="Nombre *" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.receiver.firstName} onChange={e => handleReceiverChange('firstName', e.target.value)} />
              <input type="text" placeholder="Apellido *" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.receiver.lastName} onChange={e => handleReceiverChange('lastName', e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                <select className="p-4 border rounded-2xl bg-white pr-12" value={formData.receiver.idType} onChange={e => handleReceiverChange('idType', e.target.value)}>
                  {ID_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <input type="tel" placeholder="ID *" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.receiver.idNumber} onChange={e => handleReceiverChange('idNumber', e.target.value)} />
              </div>
              <select className="p-4 border rounded-2xl bg-white pr-12" value={formData.receiver.city} onChange={e => handleReceiverChange('city', e.target.value)}>
                <option value="" disabled>Seleccionar Ciudad *</option>
                {COLOMBIAN_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
              <input type="text" placeholder="Dirección *" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.receiver.address} onChange={e => handleReceiverChange('address', e.target.value)} />
              <input type="tel" placeholder="Teléfono *" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.receiver.phone} onChange={e => handleReceiverChange('phone', e.target.value)} />
              <input type="email" placeholder="Email *" className="p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.receiver.email} onChange={e => handleReceiverChange('email', e.target.value)} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-5 animate-in fade-in duration-300">
            <h3 className="font-bold text-xl text-blue-900">Detalles de la Mercancía</h3>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Producto *</label>
              <select className="w-full p-4 border rounded-2xl bg-white font-medium outline-none focus:ring-2 focus:ring-blue-100 pr-12" value={formData.details.product} onChange={e => setFormData(prev => ({ ...prev, details: { ...prev.details, product: e.target.value } }))}>
                {PRODUCT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción de Mercancía</label>
              <textarea placeholder="Ej. 6 bultos de pintura, etc." className="w-full p-4 border rounded-2xl h-24 outline-none resize-none font-medium focus:ring-2 focus:ring-blue-100" value={formData.details.description} onChange={e => setFormData(prev => ({ ...prev, details: { ...prev.details, description: e.target.value } }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Peso (Kg) *</label>
                <input type="number" className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.details.weight || ''} onChange={e => setFormData(prev => ({ ...prev, details: { ...prev.details, weight: Number(e.target.value) } }))} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unidades *</label>
                <input type="number" className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" value={formData.details.units || ''} onChange={e => setFormData(prev => ({ ...prev, details: { ...prev.details, units: Number(e.target.value) } }))} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tarifa *</label>
              <select className="w-full p-4 border rounded-2xl bg-white outline-none focus:ring-2 focus:ring-blue-100 pr-12" value={formData.details.rateType} onChange={e => setFormData(prev => ({ ...prev, details: { ...prev.details, rateType: e.target.value } }))}>
                {RATE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor Comercial ($) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                <input 
                  type="number" 
                  className="w-full p-4 pl-10 border rounded-2xl outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-medium focus:ring-2 focus:ring-blue-100" 
                  value={formData.details.commercialValue || ''} 
                  onChange={e => setFormData(prev => ({ ...prev, details: { ...prev.details, commercialValue: Number(e.target.value) } }))} 
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Forma de Pago *</label>
              <select className="w-full p-4 border rounded-2xl bg-white outline-none focus:ring-2 focus:ring-blue-100 pr-12" value={formData.details.paymentMethod} onChange={e => setFormData(prev => ({ ...prev, details: { ...prev.details, paymentMethod: e.target.value as PaymentMethod } }))}>
                <option value={PaymentMethod.CASH}>Contado</option>
                <option value={PaymentMethod.CREDIT}>Crédito</option>
              </select>
            </div>
          </div>
        );
      case 5:
        const minAllowed = formData.pricing.suggestedFlete * 0.8;
        const invalidFlete = formData.pricing.fletePactado < minAllowed;
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="font-black text-xl text-blue-900 text-center">Valor de la remesa</h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Flete pactado (Editable) *</label>
                <div className="relative">
                  <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl ${invalidFlete ? 'text-red-600' : 'text-blue-900'}`}>$</span>
                  <input 
                    type="number" 
                    value={formData.pricing.fletePactado} 
                    onChange={(e) => handleFleteChange(Number(e.target.value))} 
                    className={`w-full p-5 pl-10 border-2 rounded-[24px] text-2xl font-black outline-none transition-all ${invalidFlete ? 'border-red-500 text-red-600 bg-red-50 focus:ring-red-100' : 'border-blue-50 text-blue-900 focus:ring-blue-100 bg-white'}`} 
                  />
                </div>
                {invalidFlete ? (
                  <div className="flex items-center gap-1.5 mt-1 ml-1 text-red-600">
                    <AlertCircle size={14} />
                    <p className="text-[10px] font-black uppercase tracking-tight">El flete no puede ser menor a ${Math.round(minAllowed).toLocaleString()} (Máx 20% desc.)</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 font-bold italic ml-1">* Descuento máx: 20% | Aumento: Sin límite</p>
                )}
              </div>
              <div className="bg-white p-5 rounded-[24px] border border-gray-100 flex justify-between items-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor seguro (10%)</p>
                <p className="text-xl font-black text-gray-700">${formData.pricing.valorSeguro.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 text-center">
                <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">Total a cobrar</p>
                <p className="text-5xl font-black text-blue-900 tracking-tighter">${formData.pricing.total.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Firma del Remitente *</label>
              <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                {!formData.pricing.signature ? (
                  <button onClick={() => setShowSignature(true)} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-[24px] flex flex-col items-center justify-center gap-3 text-gray-400 bg-gray-50 active:bg-blue-50 transition-colors">
                    <SignatureIcon size={40} />
                    <span className="font-extrabold text-xs uppercase">Capturar Firma</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-full h-40 bg-gray-50 rounded-[24px] overflow-hidden mb-4 border border-gray-100 flex items-center justify-center">
                      <img src={formData.pricing.signature} alt="Firma" className="max-h-full" />
                    </div>
                    <button onClick={() => setShowSignature(true)} className="text-blue-600 text-[10px] font-black uppercase border-b-2 border-blue-100">Modificar Firma</button>
                  </div>
                )}
              </div>
            </div>
            {showSignature && <SignaturePad title="Firma de Validación" onSave={(data) => { setFormData(prev => ({ ...prev, pricing: { ...prev.pricing, signature: data } })); setShowSignature(false); }} onCancel={() => setShowSignature(false)} />}
          </div>
        );
      case 6:
        return (
          <div className="space-y-5 animate-in fade-in duration-300 pb-20">
            <div className="text-center space-y-2 mb-6">
              <h3 className="font-black text-2xl text-blue-900">Resumen de Envío</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Confirme la información antes de guardar</p>
            </div>

            <div className="space-y-3">
              <AccordionSection id="servicio" title="Configuración de Servicio" icon={Clock}>
                <SummaryItem label="Prioridad" value={formData.config.deliveryType} />
                <SummaryItem label="Tipo Operación" value={formData.config.isInternalDistribution ? 'Distribución Interna' : 'Cliente Externo'} />
              </AccordionSection>

              <AccordionSection id="remitente" title="Datos del Remitente" icon={User}>
                <SummaryItem label="Cliente Principal" value={formData.sender.clientName} fullWidth />
                <SummaryItem label="Nombre" value={`${formData.sender.firstName} ${formData.sender.lastName}`} />
                <SummaryItem label="Identificación" value={`${formData.sender.idType} ${formData.sender.idNumber}`} />
                <SummaryItem label="Ciudad" value={formData.sender.city} />
                <SummaryItem label="Teléfono" value={formData.sender.phone} />
              </AccordionSection>

              <AccordionSection id="destinatario" title="Datos del Destinatario" icon={Truck}>
                <SummaryItem label="Nombre" value={`${formData.receiver.firstName} ${formData.receiver.lastName}`} fullWidth />
                <SummaryItem label="Ciudad Destino" value={formData.receiver.city} />
                <SummaryItem label="Dirección" value={formData.receiver.address} />
                <SummaryItem label="Teléfono" value={formData.receiver.phone} />
                <SummaryItem label="Email" value={formData.receiver.email} />
              </AccordionSection>

              <AccordionSection id="mercancia" title="Detalles de Mercancía" icon={Box}>
                <SummaryItem label="Producto" value={formData.details.product} />
                <SummaryItem label="Peso / Unid" value={`${formData.details.weight} Kg / ${formData.details.units} Un`} />
                <SummaryItem label="V. Comercial" value={`$${formData.details.commercialValue.toLocaleString()}`} />
                <SummaryItem label="Pago" value={formData.details.paymentMethod} />
                <SummaryItem label="Descripción" value={formData.details.description} fullWidth />
              </AccordionSection>
            </div>

            <div className="bg-blue-900 p-6 rounded-[32px] text-white shadow-xl shadow-blue-200 mt-4 border border-blue-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Total a Pagar</p>
                <p className="text-3xl font-black tracking-tighter">${formData.pricing.total.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <CheckCircle size={24} className="text-white" />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-50 flex flex-col overflow-hidden">
      <div className="bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button onClick={step === 1 ? onCancel : back} className="p-3 hover:bg-gray-50 rounded-2xl transition-colors">
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-0.5">PASO {step} DE {steps.length}</p>
          <h2 className="font-bold text-blue-900 text-lg">{steps[step-1]}</h2>
        </div>
        <div className="w-12" />
      </div>
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="max-w-md mx-auto">{renderStep()}</div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t flex gap-4 no-print shadow-lg rounded-t-[40px]">
        {step < steps.length ? (
          <button onClick={next} disabled={!stepValid} className={`flex-1 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${stepValid ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            Continuar <ChevronRight size={20} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!stepValid} className={`flex-1 py-5 rounded-[24px] font-black flex items-center justify-center gap-2 transition-all ${stepValid ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            Finalizar y Guardar
          </button>
        )}
      </div>
    </div>
  );
};

export default Wizard;
