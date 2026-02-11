
import { UserSession } from '../types';
import { API_CONFIG } from '../constants';
import { Capacitor } from '@capacitor/core';

const SESSION_KEY = 'remesa_field_session';

// Helper para hacer peticiones que funcione en móvil
async function httpPost(url: string, data: any) {
  // En plataformas nativas, asegurarse que fetch usa la configuración correcta
  const fetchOptions: RequestInit = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
  
  // En web, necesitamos credentials para CORS
  if (!Capacitor.isNativePlatform()) {
    fetchOptions.credentials = 'omit';
    fetchOptions.mode = 'cors';
  }
  
  console.log('Platform:', Capacitor.getPlatform());
  console.log('Native platform:', Capacitor.isNativePlatform());
  console.log('Fetch options:', fetchOptions);
  
  return fetch(url, fetchOptions);
}

const SESSION_KEY_OLD = 'remesa_field_session';

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

interface ErrorResponse {
  statusCode: number;
  message: string;
}

export const authService = {
  login: async (username: string, password: string): Promise<UserSession> => {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`;
      console.log('=== LOGIN REQUEST ===');
      console.log('URL:', url);
      console.log('Username:', username);
      console.log('Timestamp:', new Date().toISOString());
      
      const response = await httpPost(url, { username, password });
      
      console.log('Response received');
      console.log('Status:', response.status);
      console.log('OK:', response.ok);
      console.log('StatusText:', response.statusText);

      // Manejar respuestas de error
      if (response.status !== 200 && response.status !== 201) {
        let errorData: ErrorResponse;
        try {
          errorData = await response.json();
        } catch {
          errorData = { 
            statusCode: response.status, 
            message: 'Error desconocido' 
          };
        }

        switch (response.status) {
          case 400:
            throw new Error('Solicitud inválida. Verifica los datos ingresados.');
          case 401:
            throw new Error('Credenciales inválidas. Usuario o contraseña incorrectos.');
          case 404:
            throw new Error('Servicio no encontrado. Contacta con soporte.');
          case 500:
            throw new Error('Error interno del servidor. Intenta más tarde.');
          default:
            throw new Error(errorData.message || 'Error al autenticar. Intenta nuevamente.');
        }
      }

      // Respuesta exitosa (200/201)
      const data: LoginResponse = await response.json();
      
      const session: UserSession = {
        token: data.accessToken,
        expiresAt: Date.now() + (data.expiresIn * 1000),
        username: username
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (error) {
      console.error('=== ERROR COMPLETO ===');
      console.error('Error:', error);
      console.error('Type:', typeof error);
      console.error('Name:', (error as any)?.name);
      console.error('Message:', (error as any)?.message);
      console.error('Stack:', (error as any)?.stack);
      
      // Manejar errores de red
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const detailedMessage = `Error de red: ${error.message}. URL: ${API_CONFIG.BASE_URL}. Verifica que el servidor esté accesible.`;
        console.error(detailedMessage);
        throw new Error('No se pudo conectar al servidor. Verifica tu conexión a internet y que el servidor esté disponible.');
      }
      
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('No se pudo conectar al servidor. El servidor puede estar inaccesible o hay un problema de red.');
      }
      
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getSession: (): UserSession | null => {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    const session: UserSession = JSON.parse(data);
    
    // Verificar expiración
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  },

  isExpired: (session: UserSession): boolean => {
    return Date.now() > session.expiresAt;
  }
};
