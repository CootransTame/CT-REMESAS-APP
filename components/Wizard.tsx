import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UserSession } from '../types';
import {
  ChevronLeft, ChevronRight, CheckCircle, Home, AlertCircle, Box, User,
  Truck, Search, Loader2, ChevronDown as ChevronDownIcon, Plus,
  PenTool as SignatureIcon
} from 'lucide-react';
import SignaturePad from './SignaturePad';
import {
  CiudadItem, FormaPagoItem, ProductoItem, TerceroBuscado, TarifaInfo,
  fetchCiudades, fetchCiudadesTarifario, fetchFormasPago, fetchProductos, buscarTercero,
  fetchTarifas, crearTercero, crearRemesa, CrearRemesaResponse
} from '../services/wizardService';
import { subirFirmaRemitente } from '../services/evidenciaService';

interface WizardProps {
  session: UserSession;
  onComplete: (data: CrearRemesaResponse) => void;
  onCancel: () => void;
}

interface PersonData {
  tercCodigo: number | null;
  identificacion: string;
  tipoDocumentoCodigo: number | null;
  tipoDocumento: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  razonSocial: string;
  direccion: string;
  barrio: string;
  telefono: string;
  celular: string;
  email: string;
  ciudadCodigo: number | null;
  ciudadNombre: string;
  ciudadDane: string;
  esCliente: boolean;
  encontrado: boolean;
}

const emptyPerson = (): PersonData => ({
  tercCodigo: null, identificacion: '', tipoDocumentoCodigo: null, tipoDocumento: '', nombre: '', apellido1: '', apellido2: '',
  razonSocial: '', direccion: '', barrio: '', telefono: '', celular: '', email: '',
  ciudadCodigo: null, ciudadNombre: '', ciudadDane: '', esCliente: false, encontrado: false,
});

const InputField = ({ label, value, onChange, placeholder, type = 'text', disabled = false, numeric = false }: {
  label: string; value: string | number; onChange: (v: string) => void; placeholder?: string;
  type?: string; disabled?: boolean; numeric?: boolean;
}) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
    <input type={type} placeholder={placeholder} disabled={disabled}
      className={`w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-medium transition-colors ${disabled ? 'bg-gray-50 text-gray-500' : 'bg-white'}`}
      value={value || ''} onChange={e => { const val = numeric ? e.target.value.replace(/[^0-9]/g, '') : e.target.value; onChange(val); }} />
  </div>
);

const Wizard: React.FC<WizardProps> = ({ session, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const steps = ['Remitente', 'Destinatario', 'Mercancia', 'Valores', 'Resumen'];

  const [ciudades, setCiudades] = useState<CiudadItem[]>([]);
  const [ciudadesOrigen, setCiudadesOrigen] = useState<CiudadItem[]>([]);
  const [ciudadesDestino, setCiudadesDestino] = useState<CiudadItem[]>([]);
  const [formasPago, setFormasPago] = useState<FormaPagoItem[]>([]);
  const [productos, setProductos] = useState<ProductoItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  const [remitente, setRemitente] = useState<PersonData>(emptyPerson());
  const [destinatario, setDestinatario] = useState<PersonData>(emptyPerson());
  const [formaPagoCodigo, setFormaPagoCodigo] = useState<number>(4902);
  const [productoCodigo, setProductoCodigo] = useState<number>(1);
  const [peso, setPeso] = useState<number>(0);
  const [unidades, setUnidades] = useState<number>(0);
  const [valorComercial, setValorComercial] = useState<number>(0);
  const [descripcion, setDescripcion] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const [tarifaInfo, setTarifaInfo] = useState<TarifaInfo | null>(null);
  const [fleteSugerido, setFleteSugerido] = useState(0);
  const [fletePactado, setFletePactado] = useState(0);
  const [valorSeguro, setValorSeguro] = useState(0);
  const [total, setTotal] = useState(0);
  const [loadingTarifa, setLoadingTarifa] = useState(false);

  const [firma, setFirma] = useState('');
  const [showSignature, setShowSignature] = useState(false);

  const [searchingRemitente, setSearchingRemitente] = useState(false);
  const [searchingDestinatario, setSearchingDestinatario] = useState(false);
  const [remitenteNotFound, setRemitenteNotFound] = useState(false);
  const [destinatarioNotFound, setDestinatarioNotFound] = useState(false);

  const [filterCiudadRem, setFilterCiudadRem] = useState('');
  const [filterCiudadDest, setFilterCiudadDest] = useState('');
  const [ciudadRemWarning, setCiudadRemWarning] = useState('');
  const [ciudadDestWarning, setCiudadDestWarning] = useState('');
  const [showCiudadRemDrop, setShowCiudadRemDrop] = useState(false);
  const [showCiudadDestDrop, setShowCiudadDestDrop] = useState(false);
  const ciudadRemRef = useRef<HTMLDivElement>(null);
  const ciudadDestRef = useRef<HTMLDivElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [resultData, setResultData] = useState<CrearRemesaResponse | null>(null);

  const [expandedSection, setExpandedSection] = useState<string | null>('remitente');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, f, p] = await Promise.all([
          fetchCiudades(session),
          fetchFormasPago(session),
          fetchProductos(session),
        ]);
        if (cancelled) return;
        setCiudades(c);
        setCiudadesOrigen(c);
        setCiudadesDestino(c);
        setFormasPago(f);
        setProductos(p);
        if (f.length > 0) setFormaPagoCodigo(f.find(x => x.Codigo === 4902)?.Codigo ?? f[0].Codigo);
        if (p.length > 0) setProductoCodigo(p[0].Codigo);
      } catch (err) {
        console.error('Error cargando catalogos:', err);
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [session]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ciudadRemRef.current && !ciudadRemRef.current.contains(e.target as Node)) setShowCiudadRemDrop(false);
      if (ciudadDestRef.current && !ciudadDestRef.current.contains(e.target as Node)) setShowCiudadDestDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchTercero = useCallback(async (tipo: 'remitente' | 'destinatario') => {
    const person = tipo === 'remitente' ? remitente : destinatario;
    const setLoading = tipo === 'remitente' ? setSearchingRemitente : setSearchingDestinatario;
    const setNotFound = tipo === 'remitente' ? setRemitenteNotFound : setDestinatarioNotFound;
    const setPerson = tipo === 'remitente' ? setRemitente : setDestinatario;
    if (!person.identificacion.trim()) return;
    setLoading(true);
    setNotFound(false);
    try {
      const results = await buscarTercero(session, person.identificacion.trim());
      if (results.length > 0) {
        const t = results[0];
        setPerson({
          tercCodigo: t.Codigo,
          identificacion: t.Identificacion,
          tipoDocumentoCodigo: t.TipoDocumentoCodigo ?? null,
          tipoDocumento: t.TipoDocumento ?? '',
          nombre: t.Nombre ?? '',
          apellido1: t.Apellido1 ?? '',
          apellido2: t.Apellido2 ?? '',
          razonSocial: t.RazonSocial ?? '',
          direccion: t.Direccion ?? '',
          barrio: t.Barrio ?? '',
          telefono: t.Telefonos ?? '',
          celular: t.Celulares ?? '',
          email: t.Email ?? '',
          ciudadCodigo: t.CodigoCiudad,
          ciudadNombre: t.CiudadNombre ?? '',
          ciudadDane: t.CiudadDane ?? '',
          esCliente: t.EsCliente === 1,
          encontrado: true,
        });
        if (tipo === 'remitente') {
          const clienteCodigo = t.EsCliente === 1 ? t.Codigo : null;
          // Cargar ciudades de origen y verificar si la ciudad registrada está disponible
          fetchCiudadesTarifario(session, clienteCodigo)
            .then(res => {
              setCiudadesOrigen(res.ciudades);
              if (t.CodigoCiudad && res.ciudades.length > 0) {
                const disponible = res.ciudades.some(c => c.Codigo === t.CodigoCiudad);
                if (!disponible) {
                  setRemitente(prev => ({ ...prev, ciudadCodigo: null, ciudadNombre: '', ciudadDane: '' }));
                  setFilterCiudadRem('');
                  setCiudadRemWarning(`"${t.CiudadNombre}" no está habilitada en el tarifario de este cliente. Selecciona una ciudad disponible.`);
                  return;
                }
              }
              setFilterCiudadRem(t.CiudadNombre ?? '');
              setCiudadRemWarning('');
              // Pre-cargar destinos si la ciudad origen es válida
              if (t.CodigoCiudad) {
                fetchCiudadesTarifario(session, clienteCodigo, t.CodigoCiudad)
                  .then(res2 => setCiudadesDestino(res2.ciudades))
                  .catch(console.error);
              }
            })
            .catch(console.error);
        } else {
          // Destinatario: verificar contra ciudadesDestino actuales
          if (t.CodigoCiudad && ciudadesDestino.length > 0) {
            const disponible = ciudadesDestino.some(c => c.Codigo === t.CodigoCiudad);
            if (!disponible) {
              setDestinatario(prev => ({ ...prev, ciudadCodigo: null, ciudadNombre: '', ciudadDane: '' }));
              setFilterCiudadDest('');
              setCiudadDestWarning(`"${t.CiudadNombre}" no está dentro de las rutas disponibles para este tarifario. Selecciona una ciudad habilitada.`);
            } else {
              setFilterCiudadDest(t.CiudadNombre ?? '');
              setCiudadDestWarning('');
            }
          } else {
            setFilterCiudadDest(t.CiudadNombre ?? '');
            setCiudadDestWarning('');
          }
        }
      } else {
        setNotFound(true);
        setPerson(prev => ({ ...emptyPerson(), identificacion: prev.identificacion }));
        if (tipo === 'remitente') {
          // No-cliente → cargar ciudades del tarifario base
          fetchCiudadesTarifario(session, null)
            .then(res => { setCiudadesOrigen(res.ciudades); setCiudadesDestino(res.ciudades); })
            .catch(console.error);
        }
      }
    } catch (err) {
      console.error('Error buscando tercero:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [session, remitente, destinatario, ciudadesDestino]);

  const handleCrearTercero = useCallback(async (tipo: 'remitente' | 'destinatario') => {
    const person = tipo === 'remitente' ? remitente : destinatario;
    const setPerson = tipo === 'remitente' ? setRemitente : setDestinatario;
    const setNotFound = tipo === 'remitente' ? setRemitenteNotFound : setDestinatarioNotFound;
    const esNit = person.tipoDocumentoCodigo === 102;
    if (!person.identificacion || !(esNit ? person.razonSocial : person.nombre) || !person.ciudadCodigo) return;
    try {
      const created = await crearTercero(session, {
        cataTintCodigo: esNit ? 502 : 501,
        cataTiidCodigo: person.tipoDocumentoCodigo ?? 101,
        numeroIdentificacion: person.identificacion,
        razonSocial: esNit ? person.razonSocial : undefined,
        nombre: esNit ? undefined : person.nombre,
        apellido1: esNit ? undefined : person.apellido1,
        apellido2: esNit ? undefined : person.apellido2,
        ciudCodigo: person.ciudadCodigo,
        direccion: person.direccion || undefined,
        telefonos: person.telefono || undefined,
        celulares: person.celular || undefined,
        emails: person.email || undefined,
      });
      setPerson(prev => ({ ...prev, tercCodigo: created.Codigo, encontrado: true }));
      setNotFound(false);
    } catch (err: any) {
      alert(err.message || 'Error al crear tercero');
    }
  }, [session, remitente, destinatario]);

  // Recalcula flete/seguro usando la fórmula real del tarifario:
  // flete = max(peso * valorPorKilo, valorBase)  — misma lógica que sp_Crear_Remesa_Api_Cliente
  // seguro = max(valorComercial * porcentajeSeguro/100, minimoSeguro)
  useEffect(() => {
    if (!tarifaInfo || valorComercial <= 0 || peso <= 0) return;
    const fp = tarifaInfo.formasPago.find(f => f.Codigo === formaPagoCodigo) ?? tarifaInfo.formasPago[0];
    if (!fp) return;
    const flete = fp.ValorFletePorKilo > 0
      ? Math.max(Math.round(peso * fp.ValorFletePorKilo), fp.ValorFleteBase)
      : fp.ValorFleteBase;
    // Igual que SP: si valorComercial < minimoSeguro, se usa minimoSeguro como base de calculo
    const baseSeguro = valorComercial <= tarifaInfo.minimoSeguro ? tarifaInfo.minimoSeguro : valorComercial;
    const seguro = Math.round(baseSeguro * fp.PorcentajeSeguro / 100);
    setFleteSugerido(flete);
    setFletePactado(flete);
    setValorSeguro(seguro);
    setTotal(flete + seguro);
  }, [valorComercial, tarifaInfo, peso, formaPagoCodigo]);

  const calcularTarifa = useCallback(async () => {
    if (!remitente.ciudadCodigo || !destinatario.ciudadCodigo) return;
    if (tarifaInfo) return; // ya fue precargado
    setLoadingTarifa(true);
    try {
      const clienteCode = remitente.esCliente ? remitente.tercCodigo ?? undefined : undefined;
      const info = await fetchTarifas(session, remitente.ciudadCodigo, destinatario.ciudadCodigo, clienteCode);
      setTarifaInfo(info);
      if (info.formasPago.length > 0) {
        setFormaPagoCodigo(prev => info.formasPago.some(f => f.Codigo === prev) ? prev : info.formasPago[0].Codigo);
      }
      // El useEffect se encarga del recalculo al cambiar tarifaInfo
    } catch (err) {
      console.error('Error obteniendo tarifas:', err);
    } finally {
      setLoadingTarifa(false);
    }
  }, [session, remitente, destinatario, tarifaInfo]);

  const isStepValid = (): boolean => {
    switch (step) {
      case 1: return !!(remitente.tercCodigo && remitente.identificacion && remitente.ciudadCodigo && remitente.direccion);
      case 2: return !!(destinatario.tercCodigo && destinatario.identificacion && destinatario.ciudadCodigo && destinatario.direccion);
      case 3: return peso > 0 && unidades > 0 && valorComercial > 0;
      case 4: {
        const minAllowed = fleteSugerido * 0.8;
        const invalidFlete = fleteSugerido > 0 && fletePactado < minAllowed;
        return fletePactado > 0 && firma !== '' && !invalidFlete;
      }
      case 5: return true;
      default: return true;
    }
  };

  const next = async () => {
    if (step === 3 && !tarifaInfo) await calcularTarifa();
    setStep(s => s + 1);
  };

  const back = () => setStep(s => s - 1);

  const handleFleteChange = (val: number) => {
    setFletePactado(val);
    setTotal(val + valorSeguro);
  };

  const handleSubmit = async () => {
    if (!remitente.tercCodigo || !destinatario.tercCodigo) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await crearRemesa(session, {
        tercCodigoRemitente: remitente.tercCodigo,
        tercCodigoDestinatario: destinatario.tercCodigo,
        ciudCodigoRemitenteManualDane: remitente.ciudadDane || undefined,
        direccionRemitenteManual: remitente.direccion || undefined,
        barrioRemitenteManual: remitente.barrio || undefined,
        ciudCodigoDestinatarioManualDane: destinatario.ciudadDane || undefined,
        direccionDestinatarioManual: destinatario.direccion || undefined,
        barrioDestinatarioManual: destinatario.barrio || undefined,
        pesoCliente: peso,
        cantidadCliente: unidades,
        formaPagoCodigo,
        cataFpveCodigo: formaPagoCodigo,  // mismo código para CATA_FOPR y CATA_FPVE en el SP
        valorComercialCliente: valorComercial,
        documentoCliente: remitente.identificacion,
        observaciones: observaciones || undefined,
      });
      // Subir firma del remitente si fue capturada
      if (firma && res.data.numeroRemesa) {
        try {
          await subirFirmaRemitente(session, res.data.numeroRemesa, firma);
        } catch (_) { /* no bloquear si falla la firma */ }
      }
      setResultData(res);
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Error al crear la remesa');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCiudadesRem = filterCiudadRem.length === 0
    ? ciudadesOrigen.slice(0, 80)
    : ciudadesOrigen.filter(c => c.Nombre.toLowerCase().includes(filterCiudadRem.toLowerCase())).slice(0, 80);
  const filteredCiudadesDest = filterCiudadDest.length === 0
    ? ciudadesDestino.slice(0, 80)
    : ciudadesDestino.filter(c => c.Nombre.toLowerCase().includes(filterCiudadDest.toLowerCase())).slice(0, 80);

  const selectCiudad = (tipo: 'remitente' | 'destinatario', c: CiudadItem) => {
    const setPerson = tipo === 'remitente' ? setRemitente : setDestinatario;
    setPerson(prev => ({ ...prev, ciudadCodigo: c.Codigo, ciudadNombre: c.Nombre, ciudadDane: c.Codigo_Dane }));
    if (tipo === 'remitente') {
      setFilterCiudadRem(c.Nombre); setShowCiudadRemDrop(false);
      setCiudadRemWarning('');
      // Cargar ciudades de destino disponibles para este origen + tarifario
      const clienteCodigo = remitente.esCliente ? remitente.tercCodigo : null;
      fetchCiudadesTarifario(session, clienteCodigo, c.Codigo)
        .then(res => { setCiudadesDestino(res.ciudades); setCiudadDestWarning(''); })
        .catch(console.error);
    } else {
      setCiudadDestWarning('');
      setFilterCiudadDest(c.Nombre);
      setShowCiudadDestDrop(false);
      // Prefetch tarifa en background cuando se elige ciudad destino
      if (remitente.ciudadCodigo) {
        const clienteCode = remitente.esCliente ? remitente.tercCodigo ?? undefined : undefined;
        setLoadingTarifa(true);
        setTarifaInfo(null);
        fetchTarifas(session, remitente.ciudadCodigo, c.Codigo, clienteCode)
          .then(info => {
            setTarifaInfo(info);
            if (info.formasPago.length > 0) {
              setFormaPagoCodigo(prev => info.formasPago.some(f => f.Codigo === prev) ? prev : info.formasPago[0].Codigo);
            }
          })
          .catch(console.error)
          .finally(() => setLoadingTarifa(false));
      }
    }
  };

  const toggleSection = (s: string) => setExpandedSection(prev => prev === s ? null : s);

  const SummaryItem = ({ label, value, fullWidth = false }: { label: string; value: string | number; fullWidth?: boolean }) => (
    <div className={`${fullWidth ? 'col-span-2' : 'col-span-1'} space-y-0.5`}>
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-gray-800 break-words">{value || '---'}</p>
    </div>
  );

  const AccordionSection = ({ id, title, icon: Icon, children }: { id: string; title: string; icon: any; children?: React.ReactNode }) => (
    <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm transition-all">
      <button onClick={() => toggleSection(id)}
        className={`w-full pl-7 pr-12 py-5 flex items-center justify-between transition-colors ${expandedSection === id ? 'bg-blue-50/50' : 'bg-white'}`}>
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



  if (catalogLoading) {
    return (
      <div className="fixed inset-0 bg-[#f8fafc] z-[70] flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-blue-600 rounded-[35px] flex items-center justify-center shadow-2xl shadow-blue-100 animate-pulse mb-8">
          <Loader2 size={48} className="text-white animate-spin" />
        </div>
        <h2 className="text-2xl font-black text-blue-900 mb-2">Preparando formulario</h2>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest animate-pulse">Cargando catalogos...</p>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="fixed inset-0 bg-[#f8fafc] z-[70] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-blue-600 rounded-[35px] flex items-center justify-center shadow-2xl shadow-blue-100 animate-pulse">
            <Loader2 size={48} className="text-white animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-blue-900 mb-2">Procesando Envio</h2>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest animate-pulse">Creando remesa en el sistema...</p>
      </div>
    );
  }

  if (submitted && resultData) {
    return (
      <div className="fixed inset-0 bg-[#f8fafc] z-[60] flex flex-col animate-in fade-in duration-500">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
          <div className="mb-8 relative">
            <div className="w-24 h-24 bg-green-500 rounded-[35px] flex items-center justify-center shadow-2xl shadow-green-100 animate-bounce">
              <CheckCircle size={48} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-blue-900 mb-2">Envio Exitoso!</h2>
          <p className="text-gray-500 font-medium mb-4 max-w-xs">{resultData.message}</p>
          <div className="bg-white rounded-[24px] border border-gray-100 p-6 w-full max-w-sm mb-8 shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Numero de Remesa</p>
            <p className="text-4xl font-black text-blue-900 tracking-tight">{resultData.data.numeroRemesa}</p>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase">Flete</p>
                <p className="text-sm font-bold text-gray-800">${resultData.data.Flete?.toLocaleString('es-CO')}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase">Seguro</p>
                <p className="text-sm font-bold text-gray-800">${resultData.data.Seguro?.toLocaleString('es-CO')}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase">Total</p>
                <p className="text-sm font-bold text-green-600">${resultData.data.Valor_Total?.toLocaleString('es-CO')}</p>
              </div>
            </div>
          </div>
          <button onClick={() => onComplete(resultData)} className="w-full max-w-sm bg-blue-900 text-white py-5 rounded-[24px] font-black shadow-xl shadow-blue-100 flex items-center justify-center gap-3 active:scale-95 transition-all text-lg mb-8">
            <Home size={24} /> Volver al Home
          </button>
        </div>
      </div>
    );
  }

  const renderPersonStep = (tipo: 'remitente' | 'destinatario') => {
    const person = tipo === 'remitente' ? remitente : destinatario;
    const setPerson = tipo === 'remitente' ? setRemitente : setDestinatario;
    const searching = tipo === 'remitente' ? searchingRemitente : searchingDestinatario;
    const notFound = tipo === 'remitente' ? remitenteNotFound : destinatarioNotFound;
    const filterCiudad = tipo === 'remitente' ? filterCiudadRem : filterCiudadDest;
    const setFilterCiudad = tipo === 'remitente' ? setFilterCiudadRem : setFilterCiudadDest;
    const showDrop = tipo === 'remitente' ? showCiudadRemDrop : showCiudadDestDrop;
    const setShowDrop = tipo === 'remitente' ? setShowCiudadRemDrop : setShowCiudadDestDrop;
    const refDrop = tipo === 'remitente' ? ciudadRemRef : ciudadDestRef;
    const filtered = tipo === 'remitente' ? filteredCiudadesRem : filteredCiudadesDest;
    const title = tipo === 'remitente' ? 'Datos del Remitente' : 'Datos del Destinatario';

    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <h3 className="font-black text-xl text-blue-900">{title}</h3>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Numero de Documento *</label>
          <div className="flex gap-2">
            <input type="text" placeholder="Ej. 1234567890"
              className="flex-1 p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-medium"
              value={person.identificacion}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setPerson(prev => ({ ...emptyPerson(), identificacion: val }));
                if (tipo === 'remitente') setRemitenteNotFound(false);
                else setDestinatarioNotFound(false);
              }}
              onKeyDown={e => { if (e.key === 'Enter') handleSearchTercero(tipo); }}
            />
            <button onClick={() => handleSearchTercero(tipo)}
              disabled={searching || !person.identificacion.trim()}
              className="px-5 bg-blue-600 text-white rounded-2xl flex items-center justify-center active:scale-95 transition-all disabled:bg-gray-200 disabled:text-gray-400">
              {searching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            </button>
          </div>
        </div>

        {person.encontrado && (
          <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-2xl flex-wrap">
            <CheckCircle size={16} className="text-green-600 shrink-0" />
            <span className="text-sm font-bold text-green-800">
              {person.tipoDocumento && <span className="text-[9px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-black uppercase mr-2">{person.tipoDocumento}</span>}
              {person.razonSocial || `${person.nombre} ${person.apellido1}`}
              {person.esCliente && <span className="ml-2 text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-black uppercase">Cliente</span>}
            </span>
          </div>
        )}

        {notFound && (
          <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-amber-600" />
              <span className="text-sm font-bold text-amber-800">No encontrado - complete los datos para crear</span>
            </div>
          </div>
        )}

        {(person.encontrado || notFound) && (
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Documento *</label>
              {person.encontrado ? (
                <div className="w-full p-4 border rounded-2xl bg-gray-50 text-gray-700 font-bold text-sm">
                  {person.tipoDocumento || '---'}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {[{c:101,n:'CC'},{c:102,n:'NIT'},{c:103,n:'CE'},{c:104,n:'PASAPORTE'},{c:105,n:'PEP'},{c:106,n:'TI'}].map(t => (
                    <button key={t.c} onClick={() => setPerson(prev => ({ ...prev, tipoDocumentoCodigo: t.c }))}
                      className={`px-4 py-2.5 rounded-2xl text-sm font-bold border-2 transition-all active:scale-95 ${(person.tipoDocumentoCodigo ?? 101) === t.c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-100'}`}>
                      {t.n}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {(person.tipoDocumentoCodigo ?? 101) === 102 ? (
              <InputField label="Razón Social *" value={person.razonSocial} disabled={person.encontrado}
                onChange={v => setPerson(prev => ({ ...prev, razonSocial: v }))} placeholder="Razón Social" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Nombre *" value={person.nombre} disabled={person.encontrado}
                  onChange={v => setPerson(prev => ({ ...prev, nombre: v }))} placeholder="Nombre" />
                <InputField label="Apellido *" value={person.apellido1} disabled={person.encontrado}
                  onChange={v => setPerson(prev => ({ ...prev, apellido1: v }))} placeholder="Apellido" />
              </div>
            )}

            <div className="space-y-1 relative" ref={refDrop}>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ciudad *</label>
              <input type="text" placeholder="Buscar ciudad..."
                className={`w-full p-4 border rounded-2xl outline-none focus:ring-2 font-medium transition-colors bg-white ${
                  (tipo === 'remitente' ? ciudadRemWarning : ciudadDestWarning)
                    ? 'border-amber-400 focus:ring-amber-100'
                    : 'focus:ring-blue-100'
                }`}
                value={filterCiudad}
                onChange={e => { setFilterCiudad(e.target.value); setShowDrop(true); setPerson(prev => ({ ...prev, ciudadCodigo: null, ciudadNombre: '', ciudadDane: '' })); }}
                onFocus={() => setShowDrop(true)}
              />
              {(tipo === 'remitente' ? ciudadRemWarning : ciudadDestWarning) && (
                <p className="text-xs font-semibold text-amber-600 flex items-center gap-1 mt-1 ml-1">
                  ⚠️ {tipo === 'remitente' ? ciudadRemWarning : ciudadDestWarning}
                </p>
              )}
              {showDrop && filtered.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                  {filtered.map(c => (
                    <button key={c.Codigo}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 text-sm font-medium border-b border-gray-50 last:border-0 transition-colors"
                      onClick={() => selectCiudad(tipo, c)}>
                      {c.Nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <InputField label="Direccion" value={person.direccion}
              onChange={v => setPerson(prev => ({ ...prev, direccion: v }))} placeholder="Direccion" />
            <InputField label="Barrio" value={person.barrio}
              onChange={v => setPerson(prev => ({ ...prev, barrio: v }))} placeholder="Barrio" />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Telefono" value={person.telefono} numeric
                onChange={v => setPerson(prev => ({ ...prev, telefono: v }))} placeholder="Telefono" />
              <InputField label="Celular" value={person.celular} numeric
                onChange={v => setPerson(prev => ({ ...prev, celular: v }))} placeholder="Celular" />
            </div>
            <InputField label="Email" value={person.email} type="email"
              onChange={v => setPerson(prev => ({ ...prev, email: v }))} placeholder="correo@email.com" />

            {notFound && !person.tercCodigo && ((person.tipoDocumentoCodigo === 102 ? person.razonSocial : person.nombre)) && person.ciudadCodigo && (
              <button onClick={() => handleCrearTercero(tipo)}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                <Plus size={18} /> Crear {tipo === 'remitente' ? 'Remitente' : 'Destinatario'} en el Sistema
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1: return renderPersonStep('remitente');
      case 2: return renderPersonStep('destinatario');
      case 3:
        return (
          <div className="space-y-5 animate-in fade-in duration-300">
            <h3 className="font-black text-xl text-blue-900">Detalles de la Mercancia</h3>

            {/* Producto: siempre Genérico — hardcodeado en el SP como PRTR_Codigo=1 */}

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripcion de Mercancia</label>
              <textarea placeholder="Ej. 6 bultos de pintura, etc."
                className="w-full p-4 border rounded-2xl h-24 outline-none resize-none font-medium focus:ring-2 focus:ring-blue-100"
                value={descripcion} onChange={e => setDescripcion(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Peso (Kg) *</label>
                <input type="number" className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                  value={peso || ''} onChange={e => setPeso(Number(e.target.value))} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unidades *</label>
                <input type="number" className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-medium"
                  value={unidades || ''} onChange={e => setUnidades(Number(e.target.value))} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Valor Comercial ($) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                <input type="number"
                  className="w-full p-4 pl-10 border rounded-2xl outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-medium focus:ring-2 focus:ring-blue-100"
                  value={valorComercial || ''} onChange={e => setValorComercial(Number(e.target.value))} />
              </div>
            </div>

            {/* Forma de Pago — pills desde tarifario */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Forma de Pago *</label>
                {loadingTarifa && <Loader2 size={14} className="text-blue-400 animate-spin" />}
                {tarifaInfo && <span className="text-[9px] font-bold text-blue-400 uppercase">{tarifaInfo.nombreTarifario}</span>}
              </div>
              {tarifaInfo ? (
                <div className="flex flex-wrap gap-2">
                  {tarifaInfo.formasPago.map(f => (
                    <button key={f.Codigo} onClick={() => setFormaPagoCodigo(f.Codigo)}
                      className={`px-5 py-3 rounded-2xl text-sm font-bold border-2 transition-all active:scale-95 ${formaPagoCodigo === f.Codigo ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-gray-600 border-gray-100'}`}>
                      {f.Nombre}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl">
                  <p className="text-xs text-gray-400 font-bold">{loadingTarifa ? 'Calculando tarifas...' : 'Seleccione ciudad destino para ver formas de pago'}</p>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Observaciones</label>
              <textarea placeholder="Observaciones adicionales..."
                className="w-full p-4 border rounded-2xl h-20 outline-none resize-none font-medium focus:ring-2 focus:ring-blue-100"
                value={observaciones} onChange={e => setObservaciones(e.target.value)} />
            </div>
          </div>
        );
      case 4: {
        const minAllowed = fleteSugerido * 0.8;
        const invalidFlete = fleteSugerido > 0 && fletePactado < minAllowed;
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="font-black text-xl text-blue-900 text-center">Valor de la Remesa</h3>
            {loadingTarifa ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
                <p className="text-sm text-gray-500 font-bold">Consultando tarifas...</p>
              </div>
            ) : (
              <div className="space-y-5">
                {!tarifaInfo && !loadingTarifa && (
                  <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-600" />
                    <span className="text-sm font-bold text-amber-800">No se encontro tarifa para esta ruta. Ingrese el flete manualmente.</span>
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Flete Estimado *</label>
                    {tarifaInfo && <span className="text-[9px] text-blue-400 font-bold uppercase">calculado por el sistema</span>}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl text-blue-900">$</span>
                    {tarifaInfo ? (
                      <div className="w-full p-5 pl-10 border-2 border-blue-50 rounded-[24px] text-2xl font-black text-blue-900 bg-blue-50/30">
                        {fletePactado.toLocaleString('es-CO')}
                      </div>
                    ) : (
                      <input type="number" value={fletePactado} onChange={e => handleFleteChange(Number(e.target.value))}
                        className={`w-full p-5 pl-10 border-2 rounded-[24px] text-2xl font-black outline-none transition-all ${invalidFlete ? 'border-red-500 text-red-600 bg-red-50' : 'border-blue-50 text-blue-900 bg-white focus:ring-blue-100'}`} />
                    )}
                  </div>
                  {!tarifaInfo && invalidFlete && (
                    <div className="flex items-center gap-1.5 mt-1 ml-1 text-red-600">
                      <AlertCircle size={14} />
                      <p className="text-[10px] font-black uppercase tracking-tight">El flete no puede ser menor a ${Math.round(minAllowed).toLocaleString('es-CO')} (Max 20% desc.)</p>
                    </div>
                  )}
                </div>
                <div className="bg-white p-5 rounded-[24px] border border-gray-100 flex justify-between items-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor Seguro</p>
                  <p className="text-xl font-black text-gray-700">${valorSeguro.toLocaleString('es-CO')}</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100 text-center">
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mb-1">Total a Cobrar</p>
                  <p className="text-5xl font-black text-blue-900 tracking-tighter">${total.toLocaleString('es-CO')}</p>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Firma del Remitente *</label>
              <div className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm">
                {!firma ? (
                  <button onClick={() => setShowSignature(true)} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-[24px] flex flex-col items-center justify-center gap-3 text-gray-400 bg-gray-50 active:bg-blue-50 transition-colors">
                    <SignatureIcon size={40} />
                    <span className="font-extrabold text-xs uppercase">Capturar Firma</span>
                  </button>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-full h-40 bg-gray-50 rounded-[24px] overflow-hidden mb-4 border border-gray-100 flex items-center justify-center">
                      <img src={firma} alt="Firma" className="max-h-full" />
                    </div>
                    <button onClick={() => setShowSignature(true)} className="text-blue-600 text-[10px] font-black uppercase border-b-2 border-blue-100">Modificar Firma</button>
                  </div>
                )}
              </div>
            </div>
            {showSignature && (
              <SignaturePad title="Firma de Validacion"
                onSave={(data) => { setFirma(data); setShowSignature(false); }}
                onCancel={() => setShowSignature(false)} />
            )}
          </div>
        );
      }
      case 5:
        return (
          <div className="space-y-5 animate-in fade-in duration-300 pb-20">
            <div className="text-center space-y-2 mb-6">
              <h3 className="font-black text-2xl text-blue-900">Resumen de Envio</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Confirme la informacion antes de guardar</p>
            </div>
            <div className="space-y-3">
              <AccordionSection id="remitente" title="Datos del Remitente" icon={User}>
                <SummaryItem label="Documento" value={remitente.identificacion} />
                <SummaryItem label="Nombre" value={remitente.razonSocial || `${remitente.nombre} ${remitente.apellido1}`} />
                <SummaryItem label="Ciudad" value={remitente.ciudadNombre} />
                <SummaryItem label="Direccion" value={remitente.direccion} />
                <SummaryItem label="Telefono" value={remitente.telefono || remitente.celular} />
                <SummaryItem label="Email" value={remitente.email} />
              </AccordionSection>
              <AccordionSection id="destinatario" title="Datos del Destinatario" icon={Truck}>
                <SummaryItem label="Documento" value={destinatario.identificacion} />
                <SummaryItem label="Nombre" value={destinatario.razonSocial || `${destinatario.nombre} ${destinatario.apellido1}`} fullWidth />
                <SummaryItem label="Ciudad Destino" value={destinatario.ciudadNombre} />
                <SummaryItem label="Direccion" value={destinatario.direccion} />
                <SummaryItem label="Telefono" value={destinatario.telefono || destinatario.celular} />
                <SummaryItem label="Email" value={destinatario.email} />
              </AccordionSection>
              <AccordionSection id="mercancia" title="Detalles de Mercancia" icon={Box}>
                <SummaryItem label="Producto" value={productos.find(p => p.Codigo === productoCodigo)?.Nombre ?? ''} />
                <SummaryItem label="Peso / Unid" value={`${peso} Kg / ${unidades} Un`} />
                <SummaryItem label="V. Comercial" value={`$${valorComercial.toLocaleString('es-CO')}`} />
                <SummaryItem label="Forma de Pago" value={tarifaInfo?.formasPago.find(f => f.Codigo === formaPagoCodigo)?.Nombre ?? formasPago.find(f => f.Codigo === formaPagoCodigo)?.forma_pago ?? ''} />
                {descripcion && <SummaryItem label="Descripcion" value={descripcion} fullWidth />}
                {observaciones && <SummaryItem label="Observaciones" value={observaciones} fullWidth />}
              </AccordionSection>
            </div>
            <div className="bg-blue-900 p-6 rounded-[32px] text-white shadow-xl shadow-blue-200 mt-4 border border-blue-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Total a Pagar</p>
                <p className="text-3xl font-black tracking-tighter">${total.toLocaleString('es-CO')}</p>
              </div>
              <div className="text-right text-[10px] font-bold opacity-60 uppercase tracking-widest space-y-1">
                <p>Flete: ${fletePactado.toLocaleString('es-CO')}</p>
                <p>Seguro: ${valorSeguro.toLocaleString('es-CO')}</p>
              </div>
            </div>
            {submitError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600" />
                <span className="text-sm font-bold text-red-800">{submitError}</span>
              </div>
            )}
          </div>
        );
      default: return null;
    }
  };

  const stepValid = isStepValid();

  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-50 flex flex-col overflow-hidden">
      <div className="bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button onClick={step === 1 ? onCancel : back} className="p-3 hover:bg-gray-50 rounded-2xl transition-colors">
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.2em] mb-0.5">PASO {step} DE {totalSteps}</p>
          <h2 className="font-bold text-blue-900 text-lg">{steps[step - 1]}</h2>
        </div>
        <div className="w-12" />
      </div>
      <div className="h-1 bg-gray-100">
        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
      </div>
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        <div className="max-w-md mx-auto">{renderStep()}</div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t flex gap-4 no-print shadow-lg rounded-t-[40px]">
        {step < totalSteps ? (
          <button onClick={next} disabled={!stepValid}
            className={`flex-1 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${stepValid ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            Continuar <ChevronRight size={20} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!stepValid || submitting}
            className={`flex-1 py-5 rounded-[24px] font-black flex items-center justify-center gap-2 transition-all ${stepValid ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            Finalizar y Guardar
          </button>
        )}
      </div>
    </div>
  );
};

export default Wizard;
