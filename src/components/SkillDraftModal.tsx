import React, { useEffect, useState } from 'react';
import { Skill, SkillRarity } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { 
  ArrowUp, Layers, Split, ArrowLeftRight, ArrowDown, CornerUpRight, 
  Repeat, ChevronsRight, Flame, Snowflake, Zap, Biohazard, 
  HeartPulse, Sword, Gauge, Target, Maximize2, Ghost, ShieldCheck, HeartHandshake, Sparkles
} from 'lucide-react';

interface SkillDraftModalProps {
  options: Skill[];
  onSelectSkill: (skill: Skill) => void;
  level: number;
}

const RARITY_COLORS: Record<SkillRarity, {
  border: string;
  badge: string;
  glow: string;
  label: string;
}> = {
  common: {
    border: 'border-slate-500/50 hover:border-slate-400',
    badge: 'bg-slate-700/80 text-slate-300 border-slate-500/50',
    glow: 'hover:shadow-slate-500/20',
    label: 'Commun',
  },
  rare: {
    border: 'border-sky-500/60 hover:border-sky-400',
    badge: 'bg-sky-950/80 text-sky-300 border-sky-500/50',
    glow: 'hover:shadow-sky-500/25',
    label: 'Rare',
  },
  epic: {
    border: 'border-purple-500/70 hover:border-purple-400',
    badge: 'bg-purple-950/80 text-purple-300 border-purple-500/50',
    glow: 'hover:shadow-purple-500/30',
    label: 'Épique',
  },
  legendary: {
    border: 'border-amber-400/80 hover:border-amber-300',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-400/50',
    glow: 'hover:shadow-amber-400/40',
    label: 'Légendaire',
  },
};

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  ArrowUp,
  Layers,
  Split,
  ArrowLeftRight,
  ArrowDown,
  CornerUpRight,
  Repeat,
  ChevronsRight,
  Flame,
  Snowflake,
  Zap,
  Biohazard,
  HeartPulse,
  Sword,
  Gauge,
  Target,
  Maximize2,
  Ghost,
  ShieldCheck,
  HeartHandshake,
};

export const SkillDraftModal: React.FC<SkillDraftModalProps> = ({ options, onSelectSkill, level }) => {
  const [spinning, setSpinning] = useState(true);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    soundManager.playLevelUp();
    // Simulate Archero 2's slot spin rolling reveal
    const timer = setTimeout(() => {
      setSpinning(false);
      setRevealed(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut support: 1, 2, 3
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (spinning) return;
      if (e.key === '1' && options[0]) {
        soundManager.playClick();
        onSelectSkill(options[0]);
      } else if (e.key === '2' && options[1]) {
        soundManager.playClick();
        onSelectSkill(options[1]);
      } else if (e.key === '3' && options[2]) {
        soundManager.playClick();
        onSelectSkill(options[2]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spinning, options, onSelectSkill]);

  const handlePick = (skill: Skill) => {
    soundManager.playClick();
    onSelectSkill(skill);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="max-w-4xl w-full flex flex-col items-center">
        {/* Archero 2 Header Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-sm tracking-wider uppercase shadow-lg shadow-amber-500/10 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>Niveau Supérieur {level} !</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide drop-shadow-md">
            Choisissez une Capacité
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Chaque compétence modifie vos tirs et crée de puissantes synergies
          </p>
        </div>

        {/* 3 Skill Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-3xl">
          {options.map((skill, index) => {
            const rarity = RARITY_COLORS[skill.rarity] || RARITY_COLORS.common;
            const IconComponent = ICON_MAP[skill.icon] || Sparkles;

            return (
              <button
                key={skill.id}
                onClick={() => handlePick(skill)}
                disabled={spinning}
                className={`group relative text-left rounded-2xl bg-slate-900/90 border-2 ${rarity.border} p-5 flex flex-col items-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl ${rarity.glow} hover:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer overflow-hidden ${
                  spinning ? 'opacity-50 blur-xs scale-95' : 'opacity-100 blur-none'
                }`}
              >
                {/* Background glow on card */}
                <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent pointer-events-none" />

                {/* Number Hotkey Indicator */}
                <div className="absolute top-3 left-3 w-6 h-6 rounded-md bg-slate-800/90 border border-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center justify-center group-hover:bg-amber-400 group-hover:text-slate-900 transition-colors">
                  {index + 1}
                </div>

                {/* Rarity Pill Badge */}
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wider uppercase mb-3 ${rarity.badge}`}>
                  {rarity.label}
                </span>

                {/* Skill Icon */}
                <div className="w-16 h-16 rounded-2xl bg-linear-to-b from-slate-800 to-slate-950 border border-slate-700/80 flex items-center justify-center my-2 shadow-inner group-hover:border-amber-400/60 group-hover:shadow-amber-500/20 transition-all">
                  <IconComponent className="w-8 h-8 text-amber-300 group-hover:scale-110 transition-transform" />
                </div>

                {/* Title */}
                <h3 className="font-bold text-base sm:text-lg text-white text-center mt-2 group-hover:text-amber-300 transition-colors">
                  {skill.nameFr}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {skill.name}
                </span>

                {/* Description */}
                <p className="text-xs text-slate-300 text-center mt-3 leading-relaxed">
                  {skill.descriptionFr}
                </p>

                {/* Select button affordance */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex justify-center">
                  <span className="text-xs font-semibold text-amber-400 group-hover:underline flex items-center gap-1">
                    Sélectionner →
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="mt-6 text-slate-400 text-xs flex items-center gap-3">
          <span>💡 Appuyez sur [1], [2] ou [3] pour choisir rapidement</span>
        </div>
      </div>
    </div>
  );
};
