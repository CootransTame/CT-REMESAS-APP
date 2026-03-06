import { RemesaListada, RemesaDetalle, Shipment, ShipmentStatus, PaymentMethod, UserSession } from '../types';
import { API_CONFIG } from '../constants';

/** Convierte un string de estado del backend al enum ShipmentStatus */
function mapEstado(estado: string | null): ShipmentStatus {
  if (!estado) return ShipmentStatus.OFICINA_ORIGEN;
  const upper = estado.toUpperCase().trim();
  const match = Object.values(ShipmentStatus).find(v => v === upper);
  return match ?? ShipmentStatus.OFICINA_ORIGEN;
}

/** Convierte RemesaListada al tipo Shipment para mostrar en la vista de tarjeta */
export function remesaToShipment(r: RemesaListada): Shipment {
  const parts = r.NombreRemitente?.split(' ') ?? ['', ''];
  const senderFirst = parts[0] ?? '';
  const senderLast = parts.slice(1).join(' ') ?? '';

  const rparts = r.NombreDestinatario?.split(' ') ?? ['', ''];
  const receiverFirst = rparts[0] ?? '';
  const receiverLast = rparts.slice(1).join(' ') ?? '';

  return {
    id: String(r.NumeroDocumento),
    createdAt: r.Fecha,
    client: r.NombreDestinatario,
    route: `${r.CiudadRemitente} - ${r.CiudadDestinatario}`,
    sender: {
      firstName: senderFirst,
      lastName: senderLast,
      city: r.CiudadRemitente,
      address: '', phone: '', email: '',
      idType: 'CC', idNumber: '', postalCode: '',
      municipality: '', department: '',
    },
    receiver: {
      firstName: receiverFirst,
      lastName: receiverLast,
      city: r.CiudadDestinatario,
      address: '', phone: '', email: '',
      idType: 'CC', idNumber: '', postalCode: '',
      municipality: '', department: '',
    },
    currentOffice: '',
    originOffice: '',
    status: mapEstado(r.EstadoActual),
    dianStatus: 'no emitido',
    values: { freight: r.TotalFlete ?? 0, insurance: 0, total: r.TotalFlete ?? 0 },
    paymentMethod: PaymentMethod.CASH,
    product: 'Paquetería',
    units: r.Unidades ?? 0,
    weight: r.Peso ?? 0,
    dimensions: { length: 0, height: 0, width: 0 },
    commercialValue: r.ValorComercial ?? 0,
    description: '',
    evidences: [],
  };
}

/* ── Parámetros y respuesta del endpoint paginado ── */

export interface FetchShipmentsParams {
  session: UserSession;
  pagina?: number;
  porPagina?: number;
  busqueda?: string;
  fechaInicio?: string;
  fechaFin?: string;
  oficCodigo?: number;
  estado?: string;
}

export interface PaginatedResponse {
  data: RemesaListada[];
  total: number;
  pagina: number;
  porPagina: number;
  totalPaginas: number;
}

/**
 * Obtiene el listado paginado de remesas.
 * Sin parámetros extra trae las 10 más recientes.
 */
export async function fetchRemesas(params: FetchShipmentsParams): Promise<PaginatedResponse> {
  const { session, pagina = 1, porPagina = 10, busqueda, fechaInicio, fechaFin, oficCodigo, estado } = params;

  const isEmployee = session.user.TERC_Codigo_Empleado > 0;
  const endpoint = isEmployee
    ? API_CONFIG.ENDPOINTS.GUIAS_LISTADO_EMPLEADO
    : API_CONFIG.ENDPOINTS.GUIAS_LISTADO_CLIENTE;

  const url = `${API_CONFIG.BASE_URL}${endpoint}`;

  const body: Record<string, unknown> = { pagina, porPagina };
  if (busqueda) body.busqueda = busqueda;
  if (fechaInicio) body.fechaInicio = fechaInicio;
  if (fechaFin) body.fechaFin = fechaFin;
  if (oficCodigo) body.oficCodigo = oficCodigo;
  if (estado) body.estado = estado;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.message ?? `Error ${resp.status} al consultar remesas`);
  }

  const json = await resp.json();
  return {
    data: json.data ?? [],
    total: json.total ?? 0,
    pagina: json.pagina ?? pagina,
    porPagina: json.porPagina ?? porPagina,
    totalPaginas: json.totalPaginas ?? 0,
  };
}

/**
 * Obtiene el detalle completo de una remesa por su número de documento.
 * Incluye: remitente/destinatario, financiero, peso, unidades y estados/tracking.
 */
export async function fetchDetalleRemesa(session: UserSession, numeroDocumento: number): Promise<RemesaDetalle> {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GUIAS_DETALLE_EMPLEADO}`;

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.token}`,
    },
    body: JSON.stringify({ numeroDocumento }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err?.message ?? `Error ${resp.status} al consultar detalle de remesa`);
  }

  const json = await resp.json();

  if (!json.success || !json.data) {
    throw new Error(json.message ?? 'Respuesta inesperada del servidor');
  }

  return json.data as RemesaDetalle;
}
