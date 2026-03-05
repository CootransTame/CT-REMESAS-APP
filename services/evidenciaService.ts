import { UserSession } from '../types';
import { API_CONFIG } from '../constants';
import { Capacitor } from '@capacitor/core';

const base = () => API_CONFIG.BASE_URL;

export interface Evidencia {
  Codigo: number;
  Tipo_Documento: string;
  URL_Archivo: string;
  Nombre_Storage: string;
  Fecha_Crea: string;
  NombreUsuario: string | null;
  Observaciones?: string;
  urlFirmada?: string | null;
}

/** Convierte un dataURL (canvas.toDataURL) a Blob binario real */
function dataURLtoBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const raw = atob(parts[1]);
  const u8 = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) u8[i] = raw.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

/** Sube una firma (dataURL base64) como imagen PNG al backend */
export async function subirFirmaRemitente(
  session: UserSession,
  numeroGuia: number,
  dataUrl: string,
): Promise<{ codigo: number; urlArchivo: string }> {
  const blob = dataURLtoBlob(dataUrl);
  const file = new File([blob], `firma-remitente-${numeroGuia}.png`, { type: blob.type });

  const form = new FormData();
  form.append('imagen', file);
  form.append('numeroGuia', String(numeroGuia));
  form.append('tipoDocumento', 'firma-remitente');
  form.append('emprCodigo', '1');
  form.append('plataforma', 'remesas-app');

  const fetchOpts: RequestInit = {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.token}` },
    body: form,
  };
  if (!Capacitor.isNativePlatform()) {
    fetchOpts.credentials = 'omit';
    fetchOpts.mode = 'cors';
  }

  const res = await fetch(`${base()}/remesas/evidencias/upload`, fetchOpts);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Error subiendo firma' }));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return { codigo: json.data.codigo, urlArchivo: json.data.urlArchivo };
}

/** Consulta las evidencias de una guía, opcionalmente filtrada por tipo */
export async function consultarEvidencias(
  session: UserSession,
  numeroGuia: number,
  tipoDocumento?: string,
): Promise<Evidencia[]> {
  const params = new URLSearchParams();
  if (tipoDocumento) params.set('tipoDocumento', tipoDocumento);
  params.set('signed', '1');

  const res = await fetch(
    `${base()}/remesas/evidencias/${numeroGuia}?${params}`,
    { headers: { Authorization: `Bearer ${session.token}`, Accept: 'application/json' } },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Error consultando evidencias' }));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.data || [];
}
