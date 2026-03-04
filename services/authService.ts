
import { UserData, UserSession } from '../types';
import { API_CONFIG } from '../constants';
import { Capacitor } from '@capacitor/core';

const SESSION_KEY = 'remesa_field_session';

// ── Contratos del nuevo backend (ApiClientes) ─────────────────────────────────

/** Respuesta exitosa de POST /api/auth/login */
interface ApiLoginSuccess {
  success: true;
  message: string;
  token: string;
  user: UserData;
}

/** Respuesta de error del backend */
interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// ── Helper HTTP ───────────────────────────────────────────────────────────────

/** Realiza un POST compatible con web (proxy Vite) y app nativa (Capacitor) */
async function httpPost(url: string, data: unknown): Promise<Response> {
  const fetchOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  };

  if (!Capacitor.isNativePlatform()) {
    fetchOptions.credentials = 'omit';
    fetchOptions.mode = 'cors';
  }

  return fetch(url, fetchOptions);
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const authService = {

  login: async (username: string, password: string): Promise<UserSession> => {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`;

    let response: Response;
    try {
      response = await httpPost(url, { username, password });
    } catch {
      throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet.');
    }

    // El backend devuelve 200 en éxito, 400/401/500 en error
    if (!response.ok) {
      let body: ApiError = { success: false, message: 'Error desconocido' };
      try { body = await response.json(); } catch { /* ignore */ }

      switch (response.status) {
        case 400:
          throw new Error(body.message || 'Solicitud inválida. Verifica los datos ingresados.');
        case 401:
          throw new Error('Credenciales inválidas. Usuario o contraseña incorrectos.');
        case 403:
          throw new Error('Token inválido o expirado. Inicia sesión nuevamente.');
        case 500:
          throw new Error(body.message || 'Error interno del servidor. Intenta más tarde.');
        default:
          throw new Error(body.message || 'Error al autenticar. Intenta nuevamente.');
      }
    }

    const data: ApiLoginSuccess = await response.json();

    if (!data.success || !data.token) {
      throw new Error(data.message || 'Respuesta inesperada del servidor.');
    }

    // El token JWT tiene vigencia de 24 horas según la documentación
    const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

    const session: UserSession = {
      token:     data.token,
      expiresAt: Date.now() + TOKEN_TTL_MS,
      username:  data.user.username,
      user:      data.user,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession: (): UserSession | null => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session: UserSession = JSON.parse(raw);

    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  },

  isExpired: (session: UserSession): boolean => {
    return Date.now() > session.expiresAt;
  },

  /** Devuelve true si el usuario autenticado es un cliente (no empleado) */
  isClient: (session: UserSession): boolean => {
    return session.user.TERC_Codigo_Cliente > 0;
  },

  /** Devuelve el tarifario del usuario, o el tarifario base si no tiene asignado */
  getTarifario: (session: UserSession): number => {
    return session.user.Tarifario ?? 1000007;
  },
};
