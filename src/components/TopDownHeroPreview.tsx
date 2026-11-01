import React, { useRef, useEffect, useState } from 'react';
import { Character } from '../data/characters';
import { GameAsset } from '../data/assets';
import { drawTopDownHero } from '../utils/topDownHeroRenderer';
import { RotateCw, Sparkles, Crosshair } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface TopDownHeroPreviewProps {
  character: Character;
  blaster: GameAsset;
}

export const TopDownHeroPreview: React.FC<TopDownHeroPreviewProps> = ({
  character,
  blaster,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const blasterImgRef = useRef<HTMLImageElement | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isFiringTest, setIsFiringTest] = useState(false);
  const manualAngleRef = useRef<number>(0);
  const isPointerDownRef = useRef<boolean>(false);

  // Load blaster image for preview
  useEffect(() => {
    if (blaster?.url) {
      const img = new Image();
      img.src = blaster.url;
      blasterImgRef.current = img;
    }
  }, [blaster]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    manualAngleRef.current = Math.atan2(py - cy, px - cx);
    if (autoRotate) {
      setAutoRotate(false);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = true;
    handlePointerMove(e);
    triggerTestShot();
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  const triggerTestShot = () => {
    soundManager.playShoot();
    setIsFiringTest(true);
    setTimeout(() => {
      setIsFiringTest(false);
    }, 120);
  };

  useEffect(() => {
    let animId: number;
    let startTime = performance.now();

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const now = performance.now();
      const elapsed = now - startTime;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2 + 10;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Ornate Heroic Pedestal / Runic Circle
      ctx.save();
      ctx.translate(centerX, centerY + 30);

      // Radial base ambient glow
      const glowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 95);
      glowGrad.addColorStop(0, character.avatarColor + '40');
      glowGrad.addColorStop(0.7, character.avatarColor + '10');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 95, 45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer runic stone ring
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, 80, 36, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Golden illuminated inner ring
      ctx.strokeStyle = character.accentColor;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.ellipse(0, 0, 68, 30, (elapsed * 0.0006) % (Math.PI * 2), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4 Cardinal runic gems
      const gemAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
      gemAngles.forEach((a) => {
        const gx = Math.cos(a + elapsed * 0.0004) * 68;
        const gy = Math.sin(a + elapsed * 0.0004) * 30;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(gx, gy, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      // 2. Determine Aim Angle
      let aimAngle = manualAngleRef.current;
      if (autoRotate) {
        // Slow gentle 360° rotation
        aimAngle = (elapsed * 0.0012) % (Math.PI * 2);
      }

      // 3. Render Top-Down Animated Hero Model
      drawTopDownHero({
        ctx,
        x: centerX,
        y: centerY - 10,
        angle: aimAngle,
        walkCycle: elapsed * 0.003,
        character,
        blasterImg: blasterImgRef.current,
        time: elapsed,
        isMoving: false,
        isFiring: isFiringTest,
        scale: 2.1,
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [character, autoRotate, isFiringTest]);

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* Top-Down 3D Interactive Canvas Stage */}
      <div className="relative group cursor-crosshair">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          className="rounded-3xl bg-linear-to-b from-slate-900/90 to-slate-950 border-2 border-slate-800 group-hover:border-amber-400/60 shadow-2xl transition-colors touch-none"
        />

        {/* View mode indicators */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-amber-400 flex items-center gap-1.5 backdrop-blur-xs">
          <Sparkles className="w-3 h-3 animate-spin" />
          <span>VUE DU HAUT (TOP-DOWN)</span>
        </div>

        {/* Interactive Aim Helper Tag */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-slate-800 text-[9px] font-bold text-slate-400 flex items-center gap-1 pointer-events-none whitespace-nowrap shadow-md">
          <Crosshair className="w-2.5 h-2.5 text-amber-400" />
          <span>Touchez ou survolez pour orienter</span>
        </div>
      </div>

      {/* Control bar under preview */}
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => {
            soundManager.playClick();
            setAutoRotate((prev) => !prev);
          }}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
            autoRotate
              ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 shadow-xs'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} />
          <span>{autoRotate ? 'Rotation 360° active' : 'Rotation arrêtée'}</span>
        </button>

        <button
          onClick={triggerTestShot}
          className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 text-emerald-400 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/30 flex items-center gap-1 transition-all cursor-pointer active:scale-95"
        >
          <span>Tester le tir 💥</span>
        </button>
      </div>
    </div>
  );
};
