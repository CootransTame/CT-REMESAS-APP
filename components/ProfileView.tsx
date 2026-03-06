
import React, { useState, useEffect } from 'react';
import { UserSession } from '../types';
import { ChevronLeft, User, Phone, Briefcase, ShieldCheck, Mail, Loader2 } from 'lucide-react';
import { fetchPerfilEmpleado, PerfilEmpleado } from '../services/profileService';

interface ProfileViewProps {
  session: UserSession;
  onClose: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ session, onClose }) => {
  const [perfil, setPerfil] = useState<PerfilEmpleado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPerfilEmpleado(session)
      .then(p => setPerfil(p))
      .catch(err => setError(err.message || 'Error al cargar perfil'))
      .finally(() => setLoading(false));
  }, [session]);

  // Nombre a mostrar en el encabezado
  const nombreCompleto = perfil
    ? [perfil.razonSocial || perfil.nombre, perfil.apellido1, perfil.apellido2].filter(Boolean).join(' ')
    : session.user.name || session.username;

  const Field = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex items-center gap-5 p-5 bg-white rounded-3xl border border-gray-50 shadow-sm">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Icon size={24} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
          <p className="text-base font-bold text-blue-900 truncate">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-white p-6 pt-10 border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button onClick={onClose} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center active:scale-90 transition-all text-gray-800">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-xl font-black text-blue-900">Perfil de Usuario</h2>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-12">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 bg-blue-700 rounded-[45px] flex items-center justify-center shadow-2xl shadow-blue-200 border-4 border-white">
              <User size={64} className="text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg text-blue-900">
              <ShieldCheck size={20} />
            </div>
          </div>
          <h3 className="mt-6 text-2xl font-black text-blue-900 text-center">{nombreCompleto}</h3>
          <p className="text-sm font-bold text-blue-400 uppercase tracking-[0.2em]">{session.username}</p>
        </div>

        {/* Loading / Error / Data */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={36} className="animate-spin text-blue-400" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-sm font-semibold py-8">{error}</div>
        ) : (
          <div className="space-y-4 max-w-md mx-auto">
            {perfil?.nombre && (
              <Field icon={User} label="Nombre" value={[perfil.nombre, perfil.apellido1, perfil.apellido2].filter(Boolean).join(' ') || perfil.razonSocial} />
            )}
            {perfil?.razonSocial && !perfil?.nombre && (
              <Field icon={User} label="Razón Social" value={perfil.razonSocial} />
            )}
            <Field icon={IdentificationCard} label="Identificación" value={perfil?.identificacion} />
            <Field icon={Phone} label="Teléfono" value={perfil?.celulares || perfil?.telefonos} />
            <Field icon={Mail} label="Correo" value={perfil?.email} />
            <Field icon={Briefcase} label="Oficina Asignada" value={perfil?.oficinaNombre} />
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center pt-8">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Versión de App 1.0.0</p>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">CT REMESAS © 2025</p>
        </div>
      </div>
    </div>
  );
};

// Helper SVG Icon component
const IdentificationCard = ({ size, className }: { size?: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect width="18" height="14" x="3" y="5" rx="2" />
    <path d="M7 9h2" />
    <path d="M7 12h2" />
    <path d="M7 15h2" />
    <path d="M12 9h5" />
    <path d="M12 12h5" />
    <path d="M12 15h5" />
  </svg>
);

export default ProfileView;
