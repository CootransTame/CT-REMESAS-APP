import { UserSession } from '../types';
import { API_CONFIG } from '../constants';

/* ── Tipos ──────────────────────────────────────────────────────────────── */

export interface CiudadItem {
  Codigo_Dane: string;
  Codigo: number;
  Nombre: string;
}

export interface FormaPagoItem {
  Codigo: number;
  forma_pago: string;
}

export interface ProductoItem {
  Codigo: number;
  Nombre: string;
  Descripcion: string | null;
}

export interface TerceroBuscado {
  Codigo: number;
  Identificacion: string;
  DigitoChequeo: string | null;
  TipoDocumentoCodigo: number | null;
  TipoDocumento: string;
  RazonSocial: string | null;
  Nombre: string | null;
  Apellido1: string | null;
  Apellido2: string | null;
  NombreCompleto: string;
  Direccion: string | null;
  Barrio: string | null;
  Telefonos: string | null;
  Celulares: string | null;
  Email: string | null;
  CodigoCiudad: number | null;
  CiudadNombre: string | null;
  CiudadDane: string | null;
  EsCliente: number; // 1 = es cliente (tiene tarifario), 0 = no
}

export interface SedeItem {
  Codigo_Sitio: number | null;
  Nombre_Sitio: string;
  CIUD_Codigo: number;
  Codigo_Dane: string | null;
  Direccion: string | null;
  Telefono: string | null;
  Barrio: string | null;
}

export interface FormaPagoTarifa {
  Codigo: number;
  Nombre: string;
  /** Tarifa fija mínima (para peso <= peso mínimo, TATC=201) */
  ValorFleteBase: number;
  /** Tarifa por kilo (TATC=200) */
  ValorFletePorKilo: number;
  /** Porcentaje de seguro sobre valor comercial, específico por ruta */
  PorcentajeSeguro: number;
}

export interface TarifaInfo {
  etcvNumero: number;
  nombreTarifario: string;
  porcentajeManejo: number;
  minimoManejo: number;
  porcentajeSeguro: number;
  minimoSeguro: number;
  formasPago: FormaPagoTarifa[];
}

export interface CrearRemesaResponse {
  success: boolean;
  message: string;
  data: {
    numeroRemesa: number;
    clienteNumero: number;
    Seguro: number;
    Flete: number;
    Valor_Total: number;
    urlGuia: string | null;
    urlRotulos: string | null;
  };
}

export interface TerceroCreado {
  Codigo: number;
  Identificacion: string;
  NombreCompleto: string;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

async function authGet(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return res.json();
}

async function authPost(url: string, token: string, data: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return res.json();
}

const base = () => API_CONFIG.BASE_URL;

/* ── API calls ──────────────────────────────────────────────────────────── */

/** Obtener todas las ciudades */
export async function fetchCiudades(session: UserSession): Promise<CiudadItem[]> {
  const json = await authGet(`${base()}${API_CONFIG.ENDPOINTS.CIUDADES}`, session.token);
  return json.data;
}

/** Obtener formas de pago del catálogo general */
export async function fetchFormasPago(session: UserSession): Promise<FormaPagoItem[]> {
  const json = await authGet(`${base()}${API_CONFIG.ENDPOINTS.FORMAS_PAGO}`, session.token);
  return json.data;
}

/** Obtener productos transportados */
export async function fetchProductos(session: UserSession): Promise<ProductoItem[]> {
  const json = await authGet(`${base()}${API_CONFIG.ENDPOINTS.PRODUCTOS}`, session.token);
  return json.data;
}

/** Buscar tercero por número de documento */
export async function buscarTercero(session: UserSession, identificacion: string): Promise<TerceroBuscado[]> {
  const json = await authGet(
    `${base()}${API_CONFIG.ENDPOINTS.TERCEROS_BUSCAR}?identificacion=${encodeURIComponent(identificacion)}`,
    session.token,
  );
  return json.data;
}

/** Obtener sedes de un tercero */
export async function fetchSedes(session: UserSession, codigoTercero: number): Promise<SedeItem[]> {
  const json = await authGet(
    `${base()}${API_CONFIG.ENDPOINTS.TERCEROS_SEDES}/${codigoTercero}/sedes`,
    session.token,
  );
  return json.data;
}

/** Obtener formas de pago autorizadas para un cliente específico */
export async function fetchFormasPagoCliente(session: UserSession, codigoCliente: number): Promise<FormaPagoItem[]> {
  const json = await authGet(
    `${base()}${API_CONFIG.ENDPOINTS.TERCEROS_SEDES}/clientes/${codigoCliente}/formas-pago`,
    session.token,
  );
  return json.data;
}

/** Obtener ciudades disponibles según el tarifario del cliente.
 *  Sin ciudadOrigen → devuelve ciudades de ORIGEN del tarifario.
 *  Con ciudadOrigen → devuelve ciudades de DESTINO para esa ruta. */
export async function fetchCiudadesTarifario(
  session: UserSession,
  codigoCliente: number | null,
  ciudadOrigen?: number,
): Promise<{ etcvNumero: number; ciudades: CiudadItem[] }> {
  const params = new URLSearchParams();
  if (codigoCliente) params.set('codigoCliente', String(codigoCliente));
  if (ciudadOrigen)  params.set('ciudadOrigen',  String(ciudadOrigen));
  const json = await authGet(`${base()}/terceros/tarifario/ciudades?${params}`, session.token);
  return json.data;
}

/** Obtener tarifa según ciudades de origen/destino y opcionalmente un cliente */
export async function fetchTarifas(
  session: UserSession,
  ciudadOrigen: number,
  ciudadDestino: number,
  codigoCliente?: number,
): Promise<TarifaInfo> {
  let url = `${base()}${API_CONFIG.ENDPOINTS.TERCEROS_TARIFAS}?ciudadOrigen=${ciudadOrigen}&ciudadDestino=${ciudadDestino}`;
  if (codigoCliente) url += `&codigoCliente=${codigoCliente}`;
  const json = await authGet(url, session.token);
  return json.data;
}

/** Crear un tercero nuevo */
export async function crearTercero(
  session: UserSession,
  data: {
    cataTiidCodigo?: number;
    numeroIdentificacion: string;
    nombre: string;
    apellido1: string;
    apellido2?: string;
    ciudCodigo: number;
    direccion?: string;
    telefonos?: string;
    celulares?: string;
    emails?: string;
  },
): Promise<TerceroCreado> {
  const json = await authPost(`${base()}${API_CONFIG.ENDPOINTS.TERCEROS_CREAR}`, session.token, data);
  return json.data;
}

/** Crear remesa — llama POST /api/crear/remesa */
export async function crearRemesa(
  session: UserSession,
  data: {
    tercCodigoRemitente: number;
    tercCodigoDestinatario: number;
    codigoSedeRemitente?: number | null;
    ciudCodigoRemitenteManualDane?: string | null;
    barrioRemitenteManual?: string | null;
    direccionRemitenteManual?: string | null;
    codigoSedeDestinatario?: number | null;
    ciudCodigoDestinatarioManualDane?: string | null;
    barrioDestinatarioManual?: string | null;
    direccionDestinatarioManual?: string | null;
    pesoCliente: number;
    cantidadCliente: number;
    formaPagoCodigo: number;
    valorComercialCliente: number;
    documentoCliente?: string;
    observaciones?: string;
    cataFpveCodigo?: number;
  },
): Promise<CrearRemesaResponse> {
  return authPost(`${base()}${API_CONFIG.ENDPOINTS.CREAR_REMESA}`, session.token, data);
}
