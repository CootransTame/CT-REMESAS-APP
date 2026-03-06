
import React, { useRef, useEffect, useCallback } from 'react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  title: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel, title }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  // Función para inicializar o redimensionar el canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Obtener dimensiones reales del contenedor
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    // Solo actualizar si las dimensiones han cambiado o son 0
    const w = Math.round(rect.width * ratio);
    const h = Math.round(rect.height * ratio);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      ctx.scale(ratio, ratio);
      
      // Resetear estilos después de cambiar dimensiones (el canvas se limpia al redimensionar)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#000000';
    }
  }, []);

  useEffect(() => {
    // Intentar inicializar inmediatamente
    initCanvas();
    
    // Pequeño retardo para asegurar que el layout haya terminado (especialmente en modales con transiciones)
    const timeoutId = setTimeout(initCanvas, 100);
    
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', initCanvas);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', initCanvas);
    };
  }, [initCanvas]);

  // Registrar touch listeners nativos con { passive: false } para evitar que el navegador
  // cancele los eventos touch después del primer punto (problema en Android WebView).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getPos = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = true;
      const { x, y } = getPos(e);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDrawingRef.current) return;
      const { x, y } = getPos(e);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      isDrawingRef.current = false;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [initCanvas]);

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent) => {
    isDrawingRef.current = true;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawingRef.current) return;

    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const endDrawing = () => {
    isDrawingRef.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Re-inicializar estilos ya que clearRect a veces puede resetear el estado en algunos navegadores
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#000000';
    }
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      // Verificar si el canvas tiene contenido (opcional, pero buena práctica)
      onSave(canvas.toDataURL());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="text-white text-center mb-6 pt-8">
        <h2 className="text-2xl font-black uppercase tracking-tight">{title}</h2>
        <p className="text-xs font-bold opacity-60 uppercase tracking-widest mt-1">Realice la firma dentro del área blanca</p>
      </div>
      
      <div className="flex-1 bg-white rounded-[40px] overflow-hidden relative shadow-2xl border-4 border-white/20">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8 mb-8 no-print">
        <button 
          onClick={onCancel} 
          className="bg-white/10 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
        >
          Cancelar
        </button>
        <button 
          onClick={clear} 
          className="bg-white/10 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
        >
          Limpiar
        </button>
        <button 
          onClick={save} 
          className="bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
        >
          Guardar
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
