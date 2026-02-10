
import { UserSession } from '../types';
import { API_CONFIG } from '../constants';

const SESSION_KEY = 'remesa_field_session';

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
      console.log('Intentando login con:', { username, url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}` });
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      console.log('Respuesta recibida:', response.status, response.statusText);

      // Manejar respuestas de error
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json().catch(() => ({ 
          statusCode: response.status, 
          message: 'Error desconocido' 
        }));

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
        expiresAt: Date.now() + (data.expiresIn * 1000), // Convertir segundos a ms
        username: username
      };
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return session;
    } catch (error) {
      console.error('Error en login:', error);
      // Manejar errores de red o fetch
      if (error instanceof TypeError) {
        throw new Error('Error de conexión. Verifica tu red e intenta nuevamente.');
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
