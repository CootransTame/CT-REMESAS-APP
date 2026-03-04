
export enum AppStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  ERROR = 'error',
  SUCCESS = 'success'
}

/** Datos del usuario autenticado tal como los devuelve el nuevo backend (ApiClientes) */
export interface UserData {
  id: number;
  username: string;
  name: string;
  description: string;
  CATA_APLI_Codigo: number;
  /** > 0 si el usuario es cliente; 0 si es empleado/admin */
  TERC_Codigo_Cliente: number;
  TERC_Codigo_Empleado: number;
  TERC_Codigo_Conductor: number;
  TERC_Codigo_Proveedor: number;
  TERC_Codigo_Transportador: number;
  /** null = usar tarifario base (1000007) */
  Tarifario: number | null;
  OFIC_Codigo: number;
}

export interface UserSession {
  token: string;
  expiresAt: number; // timestamp in ms
  username: string;
  user: UserData;
}

export enum PaymentMethod {
  CREDIT = 'Crédito',
  CASH = 'Contado',
  COD = 'Contraentrega'
}

export enum ShipmentStatus {
  RECOGIDA = 'recogida',
  OFICINA_ORIGEN = 'oficina origen',
  DESPACHADA = 'despachada',
  OFICINA_INTERMEDIA = 'oficina intermedia',
  OFICINA_DESTINO = 'oficina destino',
  CUMPLIDA = 'cumplida',
  INTENTO_FALLIDO = 'intento fallido'
}

export interface ThirdParty {
  idType: string;
  idNumber: string;
  firstName: string;
  lastName: string;
  city: string;
  municipality: string;
  department: string;
  address: string;
  neighborhood?: string;
  zone?: string;
  postalCode: string;
  phone: string;
  email: string;
  lat?: number;
  lng?: number;
  costCenter?: string;
  serviceLine?: string;
}

export interface Shipment {
  id: string; // Guía
  createdAt: string;
  client: string;
  route: string;
  sender: ThirdParty;
  receiver: ThirdParty;
  currentOffice: string;
  originOffice: string;
  status: ShipmentStatus;
  dianStatus: 'emitido' | 'no emitido';
  payrollNumber?: string;
  values: {
    freight: number;
    insurance: number;
    total: number;
  };
  paymentMethod: PaymentMethod;
  product: string;
  units: number;
  weight: number;
  dimensions: {
    length: number;
    height: number;
    width: number;
  };
  commercialValue: number;
  description: string;
  evidences: string[]; // base64 or URLs
}

export interface TimelineEvent {
  date: string;
  status: string;
  dianStatus: string;
  office: string;
}

/** Remesa tal como la devuelve el endpoint /api/empleado/guias/listado */
export interface RemesaListada {
  Remesa: number;
  NumeroDocumento: number;
  Fecha: string;
  DocumentoCliente?: string;
  Unidades: number;
  Peso: number;
  TotalFlete: number;
  ValorComercial: number;
  OficinaCodigo: number;
  NombreRemitente: string;
  NombreDestinatario: string;
  CiudadRemitente: string;
  CiudadDestinatario: string;
  EstadoActual: string | null;
  FechaEstado: string | null;
}
