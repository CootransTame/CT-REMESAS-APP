import { UserSession } from '../types';
import { API_CONFIG } from '../constants';

export interface PerfilEmpleado {
  identificacion: string | null;
  nombre: string | null;
  apellido1: string | null;
  apellido2: string | null;
  razonSocial: string | null;
  telefonos: string | null;
  celulares: string | null;
  email: string | null;
  oficinaNombre: string | null;
}

export async function fetchPerfilEmpleado(session: UserSession): Promise<PerfilEmpleado> {
  const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EMPLEADO_PERFIL}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${session.token}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Error de red' }));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.data as PerfilEmpleado;
}
