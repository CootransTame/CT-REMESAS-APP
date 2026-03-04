
import React from 'react';
import { ShipmentStatus, PaymentMethod } from './types';

// Configuración del API
// Desarrollo : https://api-clientes-dev.cootranstame.net  (proxy Vite en /api)
// Producción : https://api-clientes-prod.cootranstame.net (VITE_API_BASE_URL en .env.production)
export const API_CONFIG = {
  BASE_URL: (import.meta.env.VITE_API_BASE_URL as string) || '/api',
  ENDPOINTS: {
    LOGIN:                 '/auth/login',
    ME:                    '/auth/me',
    GUIAS_LISTADO_EMPLEADO: '/empleado/guias/listado',
    GUIAS_DETALLE_EMPLEADO: '/empleado/guias/detalle',
    GUIAS_LISTADO_CLIENTE:  '/clientes/guias/listado',
  }
};

export const COLORS = {
  primary: '#1E40AF', // Blue-800
  secondary: '#FACC15', // Yellow-400
  accent: '#EF4444', // Red-500
};

export const FAIL_REASONS = [
  'No hay nadie en la dirección del destinatario',
  'Dirección incorrecta',
  'No hay persona mayor de edad para recibir',
  'No pagan contraentrega'
];

export const MOCK_SHIPMENTS: any[] = [
  {
    id: 'CT-782910',
    createdAt: '2025-01-15T10:30:00Z',
    client: 'Almacenes Éxito S.A.',
    route: 'Medellín - Bogotá',
    sender: { firstName: 'Juan', lastName: 'Pérez', address: 'Calle 10 # 43-22', city: 'Medellín', phone: '3001234567', email: 'juan@mail.com', postalCode: '05001', idNumber: '12345678', idType: 'CC' },
    receiver: { firstName: 'Marta', lastName: 'Gómez', address: 'Carrera 15 # 72-10', city: 'Bogotá', phone: '3117654321', email: 'marta@mail.com', postalCode: '11011', idNumber: '87654321', idType: 'CC' },
    currentOffice: 'Bogotá Principal',
    originOffice: 'Medellín Sur',
    status: ShipmentStatus.DESPACHADA,
    dianStatus: 'emitido',
    values: { freight: 120000, insurance: 5000, total: 125000 },
    paymentMethod: PaymentMethod.CREDIT,
    product: 'Paquetería',
    units: 2,
    weight: 15,
    dimensions: { length: 40, height: 40, width: 40 },
    commercialValue: 500000,
    description: 'Ropa y calzado',
    evidences: []
  },
  {
    id: 'CT-782911',
    createdAt: '2025-04-10T08:15:00Z',
    client: 'Homecenter',
    route: 'Cali - Medellín',
    sender: { firstName: 'Sonia', lastName: 'Rodríguez', address: 'Av 6 # 10-05', city: 'Cali', phone: '3209876543', email: 'sonia@mail.com', postalCode: '76001', idNumber: '55667788', idType: 'CC' },
    receiver: { firstName: 'Luis', lastName: 'Vega', address: 'Transversal 39 # 10-20', city: 'Medellín', phone: '3151122334', email: 'luis@mail.com', postalCode: '05002', idNumber: '99887766', idType: 'CC' },
    currentOffice: 'Cali Norte',
    originOffice: 'Cali Norte',
    status: ShipmentStatus.RECOGIDA,
    dianStatus: 'no emitido',
    values: { freight: 85000, insurance: 2000, total: 87000 },
    paymentMethod: PaymentMethod.CASH,
    product: 'Herramientas',
    units: 1,
    weight: 8,
    dimensions: { length: 30, height: 20, width: 20 },
    commercialValue: 200000,
    description: 'Taladro percutor',
    evidences: []
  },
  {
    id: 'CT-782912',
    createdAt: '2025-07-22T14:20:00Z',
    client: 'Distribuciones Ara',
    route: 'Pereira - Armenia',
    sender: { firstName: 'Carlos', lastName: 'Restrepo', address: 'Cl 15 # 4-12', city: 'Pereira', phone: '3004445566', email: 'carlos@mail.com', idNumber: '112233', idType: 'CC', postalCode: '66001' },
    receiver: { firstName: 'Elena', lastName: 'Blanco', address: 'Av Bolivar # 12-45', city: 'Armenia', phone: '310998877', email: 'elena@mail.com', idNumber: '445566', idType: 'CC', postalCode: '63001' },
    currentOffice: 'Pereira Central',
    originOffice: 'Pereira Central',
    status: ShipmentStatus.OFICINA_ORIGEN,
    dianStatus: 'emitido',
    values: { freight: 45000, insurance: 1000, total: 46000 },
    paymentMethod: PaymentMethod.CASH,
    product: 'Alimentos',
    units: 5,
    weight: 25,
    dimensions: { length: 50, height: 30, width: 30 },
    commercialValue: 150000,
    description: 'Productos no perecederos',
    evidences: []
  },
  {
    id: 'CT-782913',
    createdAt: '2025-10-05T09:00:00Z',
    client: 'Sodimac Corona',
    route: 'Bogotá - Ibagué',
    sender: { firstName: 'Pedro', lastName: 'Infante', address: 'Calle 80 # 100', city: 'Bogotá', phone: '321665544', email: 'pedro@mail.com', idNumber: '778899', idType: 'CC', postalCode: '11011' },
    receiver: { firstName: 'Ana', lastName: 'Maria', address: 'Cl 10 # 5-02', city: 'Ibagué', phone: '312332211', email: 'ana@mail.com', idNumber: '223344', idType: 'CC', postalCode: '73001' },
    currentOffice: 'Centro Logístico Girardot',
    originOffice: 'Bogotá Occidente',
    status: ShipmentStatus.OFICINA_INTERMEDIA,
    dianStatus: 'emitido',
    values: { freight: 98000, insurance: 4000, total: 102000 },
    paymentMethod: PaymentMethod.CREDIT,
    product: 'Materiales Construcción',
    units: 10,
    weight: 120,
    dimensions: { length: 120, height: 80, width: 80 },
    commercialValue: 2500000,
    description: 'Bultos de cemento',
    evidences: []
  },
  {
    id: 'CT-782914',
    createdAt: '2026-01-12T11:45:00Z',
    client: 'Tecnología Global',
    route: 'Medellín - Cali',
    sender: { firstName: 'Mario', lastName: 'Bros', address: 'Cra 43 # 10', city: 'Medellín', phone: '3007778899', email: 'mario@mail.com', idNumber: '101010', idType: 'CC', postalCode: '05001' },
    receiver: { firstName: 'Luigi', lastName: 'Verde', address: 'Av 5 # 10-20', city: 'Cali', phone: '315665544', email: 'luigi@mail.com', idNumber: '202020', idType: 'CC', postalCode: '76001' },
    currentOffice: 'Cali Principal',
    originOffice: 'Medellín Norte',
    status: ShipmentStatus.OFICINA_DESTINO,
    dianStatus: 'emitido',
    values: { freight: 65000, insurance: 15000, total: 80000 },
    paymentMethod: PaymentMethod.CASH,
    product: 'Tecnología',
    units: 1,
    weight: 2,
    dimensions: { length: 30, height: 10, width: 25 },
    commercialValue: 3000000,
    description: 'Laptop gamer',
    evidences: []
  },
  {
    id: 'CT-782915',
    createdAt: '2026-02-02T16:30:00Z',
    client: 'Boutique Elegance',
    route: 'Barranquilla - Cartagena',
    sender: { firstName: 'Camila', lastName: 'Luna', address: 'Cl 72 # 50', city: 'Barranquilla', phone: '301223344', email: 'camila@mail.com', idNumber: '334455', idType: 'CC', postalCode: '08001' },
    receiver: { firstName: 'Sofía', lastName: 'Sol', address: 'Centro Amurallado', city: 'Cartagena', phone: '318998877', email: 'sofia@mail.com', idNumber: '667788', idType: 'CC', postalCode: '13001' },
    currentOffice: 'Cartagena Centro',
    originOffice: 'Barranquilla Norte',
    status: ShipmentStatus.CUMPLIDA,
    dianStatus: 'emitido',
    values: { freight: 35000, insurance: 2000, total: 37000 },
    paymentMethod: PaymentMethod.CREDIT,
    product: 'Moda',
    units: 3,
    weight: 4,
    dimensions: { length: 40, height: 20, width: 30 },
    commercialValue: 850000,
    description: 'Vestidos de gala',
    evidences: []
  },
  {
    id: 'CT-782916',
    createdAt: '2026-02-14T07:10:00Z',
    client: 'Ferretería El Martillo',
    route: 'Bucaramanga - Cúcuta',
    sender: { firstName: 'Ricardo', lastName: 'Jorge', address: 'Cra 27 # 45', city: 'Bucaramanga', phone: '300112233', email: 'ricardo@mail.com', idNumber: '889900', idType: 'CC', postalCode: '68001' },
    receiver: { firstName: 'Felipe', lastName: 'Daza', address: 'Av 0 # 10', city: 'Cúcuta', phone: '314554433', email: 'felipe@mail.com', idNumber: '110022', idType: 'CC', postalCode: '54001' },
    currentOffice: 'Cúcuta Reparto',
    originOffice: 'Bucaramanga Centro',
    status: ShipmentStatus.INTENTO_FALLIDO,
    dianStatus: 'emitido',
    values: { freight: 55000, insurance: 3000, total: 58000 },
    paymentMethod: PaymentMethod.COD,
    product: 'Construcción',
    units: 2,
    weight: 30,
    dimensions: { length: 100, height: 20, width: 20 },
    commercialValue: 600000,
    description: 'Tubos PVC',
    evidences: []
  }
];
