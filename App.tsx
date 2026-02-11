
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppStatus, UserSession, Shipment, ShipmentStatus } from './types';
import { authService } from './services/authService';
import { MOCK_SHIPMENTS, COLORS, API_CONFIG } from './constants';
import ShipmentCard from './components/ShipmentCard';
import Wizard from './components/Wizard';
import DetailView from './components/DetailView';
import ProfileView from './components/ProfileView';
import { 
  Plus, Search, LogOut, Filter, ChevronDown, 
  Package, Truck, User, ArrowLeft, AlertTriangle, Settings,
  SortAsc, Clock, Eye, EyeOff, Loader2
} from 'lucide-react';

type SortOption = 'recent' | 'alphabetical';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(authService.getSession());
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [shipments, setShipments] = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = useCallback(() => {
    authService.logout();
    setSession(null);
    setUsername('');
    setPassword('');
    setError('');
    setStatus(AppStatus.IDLE);
    setIsWizardOpen(false);
    setSelectedShipment(null);
    setShowLogoutConfirm(false);
    setShowProfileDropdown(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (session && authService.isExpired(session)) {
        handleLogout();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [session, handleLogout]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    
    setStatus(AppStatus.LOADING);
    setError('');
    try {
      const newSession = await authService.login(username, password);
      setSession(newSession);
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message);
      setStatus(AppStatus.ERROR);
    }
  };

  // Validación: Nombre de usuario presente AND Contraseña presente AND no cargando
  const isLoginDisabled = !username.trim() || !password.trim() || status === AppStatus.LOADING;

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir alfanuméricos y caracteres especiales, máximo 12 caracteres
    const val = e.target.value;
    if (val.length <= 12) {
      setPassword(val);
    }
  };

  const filteredShipments = [...shipments]
    .filter(s => 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sender.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return a.client.localeCompare(b.client);
      }
    });

  if (!session) {
    return (
      <div className="min-h-screen bg-white flex flex-col justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]">
        <div className="max-w-md w-full mx-auto bg-white p-10 rounded-[40px] shadow-2xl border border-gray-50 flex flex-col items-center min-h-[500px] justify-center transition-all duration-500">
          
          {status === AppStatus.LOADING ? (
            <div className="flex flex-col items-center animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-blue-800 rounded-[35px] flex items-center justify-center mb-8 shadow-2xl shadow-blue-200">
                <Loader2 size={48} className="text-white animate-spin" />
              </div>
              <h2 className="text-2xl font-black text-blue-900 mb-2">Autenticando</h2>
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] animate-pulse">Validando credenciales...</p>
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-2">Seguridad Corporativa CT</p>
              </div>
            </div>
          ) : (
            <div className="w-full animate-in fade-in duration-500">
              <div className="flex flex-col items-center mb-8">
                <div className="mb-3">
                  <img src="/logo.png" alt="Cootranstame Carga" className="w-32 h-32 object-contain" />
                </div>
                <h1 className="text-4xl font-extrabold text-[#1a365d] tracking-tight mb-1">CT Remesas</h1>
                <p className="text-sm text-gray-500 font-medium">Logística inteligente en campo</p>
              </div>

              <form onSubmit={handleLogin} className="w-full space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Usuario Corporativo</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={12}
                      className="w-full p-5 border border-gray-100 rounded-2xl bg-[#f8fafc] focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all pl-14 text-gray-700 font-medium" 
                      placeholder="Ingresar usuario"
                      required
                    />
                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Contraseña</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={handlePasswordChange}
                      className="w-full p-5 border border-gray-100 rounded-2xl bg-[#f8fafc] focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all pl-14 pr-14 text-gray-700 font-medium tracking-[0.5em]" 
                      placeholder="••••••"
                      required
                    />
                    <Package className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors outline-none"
                    >
                      {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-500 text-sm font-bold text-center p-4 rounded-2xl border border-red-100 animate-in fade-in zoom-in duration-200">
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoginDisabled}
                  className={`w-full font-bold py-5 rounded-2xl shadow-xl transition-all active:scale-[0.97] text-lg ${
                    isLoginDisabled 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-[#1e40af] hover:bg-[#1e3a8a] text-white shadow-blue-100'
                  }`}
                >
                  Iniciar Sesión
                </button>
              </form>

              <p className="mt-6 text-center text-[11px] text-gray-400 font-semibold tracking-wide px-4">
                Acceso restringido para personal autorizado.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col no-print pb-24">
      <header className="bg-blue-800 text-white p-4 pt-6 sticky top-0 z-30 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1e40af] rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-sm overflow-hidden">
              <Truck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl leading-tight">CT Remesas</h1>
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">{session.username}</p>
            </div>
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md active:bg-white/20 transition-all border border-white/10 shadow-lg"
            >
              <User size={24} />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-blue-50 py-3 z-[100] animate-in slide-in-from-top-2 fade-in duration-200">
                <div className="px-5 py-3 border-b border-gray-50 mb-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mi Cuenta</p>
                  <p className="text-sm font-bold text-blue-900 truncate">{session.username}</p>
                </div>
                <button 
                  onClick={() => {
                    setIsProfileOpen(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-blue-50 text-gray-600 font-semibold transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <span className="text-sm">Perfil</span>
                </button>
                <button 
                  onClick={() => {
                    setShowLogoutConfirm(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full px-5 py-3 text-left flex items-center gap-3 hover:bg-red-50 text-red-500 font-semibold transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-red-500 flex items-center justify-center">
                    <LogOut size={18} />
                  </div>
                  <span className="text-sm">Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Buscar guía o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 text-white placeholder:text-blue-200 p-4 pl-12 rounded-2xl outline-none focus:bg-white/20 transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200" size={20} />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-4 rounded-2xl border transition-all ${showFilters ? 'bg-yellow-400 border-yellow-400 text-blue-900' : 'bg-white/10 border-white/20 text-blue-200'}`}
          >
            <Filter size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {showFilters && (
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-blue-50 space-y-4 animate-in slide-in-from-top duration-300">
            <h3 className="font-extrabold text-blue-900 flex items-center gap-2">
              <Filter size={18} /> Filtros Avanzados
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Desde</label>
                <input type="date" className="w-full p-3 border rounded-xl text-xs bg-gray-50" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Hasta</label>
                <input type="date" className="w-full p-3 border rounded-xl text-xs bg-gray-50" />
              </div>
            </div>
            <select className="w-full p-3 border rounded-xl text-sm bg-gray-50 pr-12">
              <option>Todos los Estados</option>
              {Object.values(ShipmentStatus).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
            <button 
              onClick={() => setShowFilters(false)}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md active:scale-95 transition-transform"
            >
              Aplicar Filtros
            </button>
          </div>
        )}

        <div className="flex justify-between items-center mb-2">
          <h2 className="font-extrabold text-gray-400 uppercase text-[10px] tracking-widest">Listado de Remesas ({filteredShipments.length})</h2>
          
          <div className="relative" ref={sortMenuRef}>
            <button 
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 pl-4 pr-5 py-1.5 rounded-full shadow-sm hover:bg-blue-100 transition-colors"
            >
              ORDEN: {sortBy === 'recent' ? 'RECIENTES' : 'ALFABÉTICO'} <ChevronDown size={12} />
            </button>

            {showSortMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-50 py-2 z-20 animate-in slide-in-from-top-1 fade-in duration-200">
                <button 
                  onClick={() => { setSortBy('recent'); setShowSortMenu(false); }}
                  className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors ${sortBy === 'recent' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-gray-600 font-semibold hover:bg-gray-50'}`}
                >
                  <Clock size={16} />
                  <span className="text-xs">Más Reciente</span>
                </button>
                <button 
                  onClick={() => { setSortBy('alphabetical'); setShowSortMenu(false); }}
                  className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors ${sortBy === 'alphabetical' ? 'text-blue-600 bg-blue-50 font-bold' : 'text-gray-600 font-semibold hover:bg-gray-50'}`}
                >
                  <SortAsc size={16} />
                  <span className="text-xs">Orden Alfabético</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredShipments.map(shipment => (
            <ShipmentCard 
              key={shipment.id} 
              shipment={shipment} 
              onClick={() => setSelectedShipment(shipment)}
            />
          ))}
          {filteredShipments.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-gray-300" size={40} />
              </div>
              <p className="text-gray-500 font-bold">No se encontraron remesas</p>
              <p className="text-xs text-gray-400">Pruebe ajustando sus criterios de búsqueda</p>
            </div>
          )}
        </div>
      </main>

      <button 
        onClick={() => setIsWizardOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-yellow-400 text-blue-900 rounded-3xl shadow-2xl flex items-center justify-center active:scale-90 transition-all z-40 ring-4 ring-white"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-6 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white w-full max-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-red-100/50">
                <LogOut size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Cerrar Sesión</h3>
              <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                ¿Estás seguro que deseas salir? <br/>Tendrás que ingresar tus credenciales nuevamente.
              </p>
              
              <div className="w-full space-y-3">
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-black shadow-xl shadow-red-100 active:scale-95 transition-all text-lg"
                >
                  Confirmar Salida
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isWizardOpen && (
        <Wizard 
          onCancel={() => setIsWizardOpen(false)}
          onComplete={(data) => {
            console.log('Shipment created:', data);
            setIsWizardOpen(false);
          }}
        />
      )}

      {selectedShipment && (
        <DetailView 
          shipment={selectedShipment}
          onClose={() => setSelectedShipment(null)}
          onStatusChange={(newStatus) => {
            setShipments(prev => prev.map(s => s.id === selectedShipment.id ? { ...s, status: newStatus } : s));
          }}
        />
      )}

      {isProfileOpen && (
        <ProfileView 
          session={session}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
