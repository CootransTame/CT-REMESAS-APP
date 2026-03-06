
import React, { useState, useEffect } from 'react';
import { RemesaDetalle, EstadoRemesa, ShipmentStatus, UserSession } from '../types';
import { 
  X, Printer, Clock, Image, AlertCircle, CheckCircle2, Check,
  Trash2, QrCode, Camera, Upload, ShieldCheck, 
  CreditCard, User, Info, MapPin, Phone, Mail, Fingerprint,
  Package, Loader2, Truck, PenTool
} from 'lucide-react';
import { FAIL_REASONS } from '../constants';
import { fetchDetalleRemesa } from '../services/shipmentService';
import { subirFirmaRemitente, consultarEvidencias, Evidencia } from '../services/evidenciaService';
import SignaturePad from './SignaturePad';
import ReportView from './ReportView';
import LabelView from './LabelView';

/** Quita sufijo 'Z' de fechas del servidor para evitar doble resta UTC-5 */
const parseDateCO = (d: string) => new Date(typeof d === 'string' ? d.replace(/Z$/i, '') : d);

interface DetailViewProps {
  /** Numero de documento de la remesa a mostrar */
  numeroDocumento: number;
  /** Sesión del usuario autenticado */
  session: UserSession;
  onClose: () => void;
  onStatusChange: (status: ShipmentStatus) => void;
}

const DetailView: React.FC<DetailViewProps> = ({ numeroDocumento, session, onClose, onStatusChange }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'actions' | 'tracking'>('info');
  const [showSignature, setShowSignature] = useState(false);
  const [showAnularModal, setShowAnularModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [showFirmaRemitente, setShowFirmaRemitente] = useState(false);
  const [firmaRemitente, setFirmaRemitente] = useState<Evidencia | null>(null);
  const [firmando, setFirmando] = useState(false);

  const [detalle, setDetalle] = useState<RemesaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchDetalleRemesa(session, numeroDocumento)
      .then((data) => {
        if (!cancelled) setDetalle(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Error al cargar detalle');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Cargar firma del remitente si ya existe
    consultarEvidencias(session, numeroDocumento, 'firma-remitente')
      .then((evs) => {
        if (!cancelled && evs.length > 0) setFirmaRemitente(evs[0]);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [session, numeroDocumento]);

  const handleGuardarFirma = async (dataUrl: string) => {
    if (!detalle) return;
    setFirmando(true);
    try {
      await subirFirmaRemitente(session, detalle.NumeroDocumento, dataUrl);
      // Recargar la firma guardada
      const evs = await consultarEvidencias(session, detalle.NumeroDocumento, 'firma-remitente');
      if (evs.length > 0) setFirmaRemitente(evs[0]);
    } catch (err: any) {
      alert(err.message || 'Error al guardar la firma');
    } finally {
      setFirmando(false);
      setShowFirmaRemitente(false);
    }
  };

  const canAnular = () => {
    if (!detalle) return false;
    const diff = Date.now() - parseDateCO(detalle.Fecha).getTime();
    return diff <= 20 * 60 * 1000;
  };

  const estadoActual = detalle?.Estados?.length
    ? detalle.Estados[detalle.Estados.length - 1].Estado
    : null;

  const isDespachada = estadoActual?.toUpperCase().includes('DESPACHADA') ||
    estadoActual?.toUpperCase().includes('REPARTO') || false;

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-40 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-gray-500">Cargando detalle…</p>
        </div>
      </div>
    );
  }

  /* ─── Error ─── */
  if (error || !detalle) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-40 flex flex-col">
        <div className="bg-white p-4 flex items-center justify-between border-b">
          <button onClick={onClose} className="p-2"><X size={24} /></button>
          <h2 className="font-bold text-lg text-blue-900">{numeroDocumento}</h2>
          <div className="w-8" />
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-sm">
            <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
            <p className="font-bold text-red-700 mb-1">Error al cargar</p>
            <p className="text-sm text-red-500">{error || 'Remesa no encontrada'}</p>
            <button onClick={onClose} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Helpers ─── */
  const fmt = (n: number | null | undefined) => (n ?? 0).toLocaleString('es-CO');
  const fmtMoney = (n: number | null | undefined) => `$${fmt(n)}`;

  /* ═══════════════════════════ TAB: INFORMACIÓN ═══════════════════════════ */
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
            <p className="text-sm font-bold text-blue-900">PAQUETERÍA</p>
            <p className="text-[10px] text-gray-400 italic">Mercancía convencional</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">N.º Documento</p>
            <p className="text-sm font-bold text-gray-900">{detalle.NumeroDocumento}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Estado Actual</p>
            {estadoActual ? (
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                estadoActual.toUpperCase().includes('ENTREGADA') || estadoActual.toUpperCase().includes('CUMPLIDA')
                  ? 'bg-green-50 text-green-700 border-green-100'
                  : 'bg-blue-50 text-blue-700 border-blue-100'
              }`}>
                {estadoActual}
              </span>
            ) : (
              <span className="text-xs text-gray-400">—</span>
            )}
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Fecha</p>
            <p className="text-xs font-bold text-gray-700">
              {parseDateCO(detalle.Fecha).toLocaleDateString('es-CO')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Oficina Origen</p>
            <p className="text-xs font-bold text-gray-700">{detalle.OficinaOrigen}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Ruta</p>
            <p className="text-xs font-bold text-gray-700">{detalle.CiudadRemitente} → {detalle.CiudadDestinatario}</p>
          </div>
        </div>
      </div>

      {/* Peso, Unidades, Peso Volumétrico */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Package size={16} className="text-blue-600" />
          <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest">Carga</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-2xl text-center">
            <p className="text-[10px] text-blue-500 font-black uppercase">Unidades</p>
            <p className="text-xl font-black text-blue-900">{detalle.Unidades}</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-2xl text-center">
            <p className="text-[10px] text-blue-500 font-black uppercase">Peso (Kg)</p>
            <p className="text-xl font-black text-blue-900">{detalle.Peso}</p>
          </div>
        </div>
      </div>

      {/* Datos del Remitente */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
          <User size={14} /> Datos del Remitente
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Nombre / Razón Social</p>
              <p className="text-sm font-bold">{detalle.NombreRemitente}</p>
            </div>
            <div className="w-1/3">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Identificación</p>
              <p className="text-xs font-medium text-gray-600">{detalle.DocRemitente}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl">
            <MapPin size={14} className="text-blue-500 shrink-0" />
            <span className="font-medium">
              {detalle.DireccionRemitente}
              {detalle.BarrioRemitente ? `, ${detalle.BarrioRemitente}` : ''}
              {' - '}{detalle.CiudadRemitente}
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl">
              <Phone size={14} className="text-green-500 shrink-0" />
              <span className="font-medium">{detalle.TelefonoRemitente || detalle.CelularRemitente || '—'}</span>
            </div>
            <div className="flex-1 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl min-w-0">
              <Mail size={14} className="text-orange-500 shrink-0" />
              <span className="font-medium truncate">{detalle.EmailRemitente || '—'}</span>
            </div>
          </div>

          {/* Firma del Remitente */}
          {firmaRemitente ? (
            <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
              <span className="text-xs font-bold text-green-700">Firmado</span>
              <span className="text-[9px] text-green-500 ml-auto">
                {parseDateCO(firmaRemitente.Fecha_Crea).toLocaleString('es-CO')}
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowFirmaRemitente(true)}
              className="mt-2 w-full flex items-center justify-center gap-2 py-3 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl text-blue-700 font-bold text-xs active:scale-95 transition-transform"
            >
              <PenTool size={16} /> Firmar como Remitente
            </button>
          )}
        </div>
      </div>

      {/* Datos del Destinatario */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
          <Fingerprint size={14} /> Datos del Destinatario
        </h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Nombre / Razón Social</p>
              <p className="text-sm font-bold">{detalle.NombreDestinatario}</p>
            </div>
            <div className="w-1/3">
              <p className="text-[10px] text-gray-400 font-bold uppercase">Identificación</p>
              <p className="text-xs font-medium text-gray-600">{detalle.DocDestinatario}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl">
            <MapPin size={14} className="text-blue-500 shrink-0" />
            <span className="font-medium">
              {detalle.DireccionDestinatario}
              {detalle.BarrioDestinatario ? `, ${detalle.BarrioDestinatario}` : ''}
              {' - '}{detalle.CiudadDestinatario}
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl">
              <Phone size={14} className="text-green-500 shrink-0" />
              <span className="font-medium">{detalle.TelefonoDestinatario || detalle.CelularDestinatario || '—'}</span>
            </div>
            <div className="flex-1 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-2xl min-w-0">
              <Mail size={14} className="text-orange-500 shrink-0" />
              <span className="font-medium truncate">{detalle.EmailDestinatario || '—'}</span>
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
            <span className="text-gray-500 font-medium">Flete Pactado</span>
            <span className="font-bold text-gray-900">{fmtMoney(detalle.Flete)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Seguro</span>
            <span className="font-bold text-gray-900">{fmtMoney(detalle.Seguro)}</span>
          </div>
          {detalle.Comision > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Comisión</span>
              <span className="font-bold text-gray-900">{fmtMoney(detalle.Comision)}</span>
            </div>
          )}
          {detalle.Reexpedicion > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Reexpedición</span>
              <span className="font-bold text-gray-900">{fmtMoney(detalle.Reexpedicion)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 border-t border-blue-100">
            <div>
              <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest block">Total Flete</span>
              <span className="text-xs text-gray-400 font-medium italic">Flete + Seguro + Comisión + Reexpedición</span>
            </div>
            <span className="font-black text-2xl text-blue-900">{fmtMoney(detalle.TotalFlete)}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Forma de Pago</p>
              <p className="text-sm font-bold text-gray-800">{detalle.FormaPago || '—'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Valor Comercial</p>
            <p className="text-sm font-bold text-blue-600">{fmtMoney(detalle.ValorComercial)}</p>
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
          <Info size={14} /> Observaciones
        </h3>
        <div className="bg-gray-50 p-4 rounded-2xl text-sm text-gray-600 leading-relaxed font-medium">
          {detalle.Observaciones || 'Sin observaciones adicionales para esta remesa.'}
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════ TAB: OPERACIONES ═══════════════════════════ */
  const renderActions = () => (
    <div className="grid grid-cols-2 gap-3 pb-6">
      <button
        onClick={() => setShowReport(true)}
        className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border hover:bg-gray-50 active:bg-blue-50 transition-colors"
      >
        <Printer className="text-blue-600 mb-2" size={28} />
        <span className="text-xs font-bold text-gray-700">Reporte</span>
      </button>

      <button
        onClick={() => setShowLabel(true)}
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
        onClick={() => setShowFirmaRemitente(true)}
        className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-colors relative ${
          firmaRemitente ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-gray-50 active:bg-blue-50'
        }`}
      >
        {firmaRemitente && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 size={12} className="text-white" />
          </div>
        )}
        <PenTool className={`${firmaRemitente ? 'text-green-600' : 'text-blue-600'} mb-2`} size={28} />
        <span className="text-xs font-bold text-gray-700">{firmaRemitente ? 'Firmado' : 'Firma Rem.'}</span>
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

  /* ═══════════════════════════ TAB: ESTADOS / TRACKING ═══════════════════════════ */
  const renderTracking = () => {
    const estados = detalle.Estados ?? [];

    if (estados.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Truck size={48} className="mb-3" />
          <p className="font-bold">Sin estados registrados</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 pb-20">
        {/* Timeline visual */}
        <div className="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
          {estados.map((e: EstadoRemesa, i: number) => {
            const isLast = i === estados.length - 1;
            const isEntregada = e.Estado?.toUpperCase().includes('ENTREGADA') || e.Estado?.toUpperCase().includes('CUMPLIDA');
            const dotColor = isLast
              ? (isEntregada ? 'bg-green-500' : 'bg-blue-600')
              : 'bg-blue-300';

            return (
              <div key={i} className="relative">
                <div className={`absolute -left-[26px] top-1 w-4 h-4 ${dotColor} rounded-full border-4 border-white shadow-sm`} />
                <p className="text-xs text-gray-400 font-bold">
                  {parseDateCO(e.FechaRegistro).toLocaleString('es-CO')}
                </p>
                <p className="font-bold text-gray-700">{e.Estado}</p>
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                  {e.Oficina && <p>📍 Oficina: <span className="font-medium">{e.Oficina}</span></p>}
                  {e.Planilla && <p>📋 Planilla: <span className="font-medium">{e.Planilla}</span></p>}
                  {e.Placa && <p>🚚 Placa: <span className="font-medium">{e.Placa}</span></p>}
                  {e.Conductor && <p>👤 Conductor: <span className="font-medium">{e.Conductor}</span></p>}
                  {e.Usuario && <p>🖥️ Usuario: <span className="font-medium">{e.Usuario}</span></p>}
                </div>
              </div>
            );
          })}
        </div>


      </div>
    );
  };

  /* ─── Shipment-like object for ReportView/LabelView compatibility ─── */
  const shipmentCompat = {
    id: String(detalle.NumeroDocumento),
    createdAt: detalle.Fecha,
    client: detalle.NombreDestinatario,
    route: `${detalle.CiudadRemitente} - ${detalle.CiudadDestinatario}`,
    sender: {
      firstName: detalle.NombreRemitente, lastName: '',
      city: detalle.CiudadRemitente, address: detalle.DireccionRemitente,
      phone: detalle.TelefonoRemitente || '', email: detalle.EmailRemitente || '',
      idType: '', idNumber: detalle.DocRemitente, postalCode: '',
      municipality: '', department: '', neighborhood: detalle.BarrioRemitente,
    },
    receiver: {
      firstName: detalle.NombreDestinatario, lastName: '',
      city: detalle.CiudadDestinatario, address: detalle.DireccionDestinatario,
      phone: detalle.TelefonoDestinatario || '', email: detalle.EmailDestinatario || '',
      idType: '', idNumber: detalle.DocDestinatario, postalCode: '',
      municipality: '', department: '', neighborhood: detalle.BarrioDestinatario,
    },
    currentOffice: detalle.OficinaOrigen,
    originOffice: detalle.OficinaOrigen,
    status: ShipmentStatus.OFICINA_ORIGEN,
    dianStatus: 'no emitido' as const,
    values: { freight: detalle.Flete, insurance: detalle.Seguro, total: detalle.TotalFlete },
    paymentMethod: detalle.FormaPago as any,
    product: 'Paquetería',
    units: detalle.Unidades,
    weight: detalle.Peso,
    dimensions: { length: 0, height: 0, width: 0 },
    commercialValue: detalle.ValorComercial,
    description: detalle.Observaciones || '',
    evidences: [] as string[],
  };

  /* ═══════════════════════════ RENDER ═══════════════════════════ */
  return (
    <>
    <div className="fixed inset-0 bg-gray-50 z-40 flex flex-col no-print">
      <div className="bg-white p-4 flex items-center justify-between border-b sticky top-0 z-20">
        <button onClick={onClose} className="p-2"><X size={24} /></button>
        <h2 className="font-bold text-lg text-blue-900">{detalle.NumeroDocumento}</h2>
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
        {activeTab === 'tracking' && renderTracking()}
      </div>

      {/* Firma Remitente */}
      {showFirmaRemitente && (
        <SignaturePad
          title="Firma del Remitente"
          onSave={handleGuardarFirma}
          onCancel={() => setShowFirmaRemitente(false)}
        />
      )}

      {/* Indicador de carga mientras se sube la firma */}
      {firmando && (
        <div className="fixed inset-0 z-[110] bg-black/70 flex items-center justify-center">
          <div className="bg-white p-8 rounded-3xl flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-sm font-bold text-gray-700">Guardando firma…</p>
          </div>
        </div>
      )}

      {/* Signature Modal (Cumplido) */}
      {showSignature && (
        <SignaturePad
          title="Firma de Cumplimiento"
          onSave={() => {
            onStatusChange(ShipmentStatus.ENTREGADA_CUMPLIDA);
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
                    onStatusChange(ShipmentStatus.DEVUELTA_OFICINA_DESTINO);
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
          </div>

          <button onClick={() => setShowEvidenceModal(false)} className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-blue-100 mt-6 active:scale-95 transition-all">
            Guardar Evidencias
          </button>
        </div>
      )}

    </div>

    {/* Fuera del no-print para que sean visibles al imprimir */}
    {showReport && (
      <ReportView
        detalle={detalle}
        firmaRemitente={firmaRemitente}
        onClose={() => setShowReport(false)}
      />
    )}

    {showLabel && (
      <LabelView
        shipment={shipmentCompat as any}
        onClose={() => setShowLabel(false)}
      />
    )}
    </>
  );
};

export default DetailView;
