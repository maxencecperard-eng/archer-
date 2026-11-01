import React, { useState, useRef, useEffect, useCallback } from 'react';

interface VirtualJoystickProps {
  onMove: (vector: { x: number; y: number; active: boolean }) => void;
  disabled?: boolean;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onMove, disabled = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const baseRadius = 55;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    setTouchPos({ x: startX, y: startY });
    setKnobPos({ x: 0, y: 0 });
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !touchPos || disabled) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const dx = currentX - touchPos.x;
    const dy = currentY - touchPos.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) {
      setKnobPos({ x: 0, y: 0 });
      onMove({ x: 0, y: 0, active: false });
      return;
    }

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(distance, baseRadius);

    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    setKnobPos({ x: kx, y: ky });

    // Normalized vector from 0 to 1
    const normalizedLength = clampedDist / baseRadius;
    onMove({
      x: (Math.cos(angle) * normalizedLength),
      y: (Math.sin(angle) * normalizedLength),
      active: normalizedLength > 0.15,
    });
  }, [isDragging, touchPos, disabled, onMove, baseRadius]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDragging(false);
    setTouchPos(null);
    setKnobPos({ x: 0, y: 0 });
    onMove({ x: 0, y: 0, active: false });
  }, [isDragging, onMove]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setTouchPos(null);
        setKnobPos({ x: 0, y: 0 });
        onMove({ x: 0, y: 0, active: false });
      }
    };
    window.addEventListener('pointerup', handleGlobalMouseUp);
    return () => window.removeEventListener('pointerup', handleGlobalMouseUp);
  }, [isDragging, onMove]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="absolute inset-0 touch-none select-none z-10 pointer-events-auto"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* Visual Joystick base when touching */}
      {touchPos && (
        <div
          className="absolute rounded-full pointer-events-none transition-opacity duration-150 flex items-center justify-center border-2 border-amber-400/50 bg-black/40 backdrop-blur-xs shadow-lg shadow-amber-500/10"
          style={{
            left: `${touchPos.x}px`,
            top: `${touchPos.y}px`,
            width: `${baseRadius * 2}px`,
            height: `${baseRadius * 2}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {/* Outer ring pulsing */}
          <div className="absolute inset-0 rounded-full border border-amber-300/30 animate-ping opacity-25" />
          {/* Thumb knob */}
          <div
            className="w-12 h-12 rounded-full bg-linear-to-b from-amber-300 to-amber-600 shadow-md border-2 border-white/70 flex items-center justify-center text-slate-900"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <div className="w-4 h-4 rounded-full bg-white/60 shadow-xs" />
          </div>
        </div>
      )}

      {/* Subtle guide on desktop/mobile when idle */}
      {!touchPos && (
        <div className="absolute bottom-6 left-6 pointer-events-none hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 text-xs text-slate-300 shadow-lg">
          <span className="font-semibold text-amber-400">Contrôles :</span>
          <span>Glisser la souris / Toucher l'écran OU touches</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-600 font-mono text-[11px]">ZQSD</span>
          <span>/</span>
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-600 font-mono text-[11px]">Flèches</span>
        </div>
      )}
    </div>
  );
};
