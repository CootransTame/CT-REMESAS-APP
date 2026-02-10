
import React, { useRef, useEffect, useState, useCallback } from 'react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
  title: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel, title }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

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
    if (canvas.width !== rect.width * ratio || canvas.height !== rect.height * ratio) {
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      ctx.scale(ratio, ratio);
      
      // Resetear estilos después de cambiar dimensiones (el canvas se limpia al redimensionar)
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3;
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

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    // Asegurar que el canvas esté inicializado antes de empezar
    initCanvas();
    
    setIsDrawing(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    // Evitar scroll mientras se firma
    if ('touches' in e) {
      e.preventDefault();
    }

    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Re-inicializar estilos ya que clearRect a veces puede resetear el estado en algunos navegadores
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3;
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
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
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
