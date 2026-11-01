import React from 'react';
import { PlayerStats, Skill, DifficultyMode } from '../types/game';
import { Heart, Volume2, VolumeX, Pause, Play, Sparkles, Shield, Skull, Zap, Home, ShieldAlert } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface GameHUDProps {
  playerStats: PlayerStats;
  currentExp: number;
  expToNextLevel: number;
  playerLevel: number;
  room: number;
  maxRooms: number;
  difficulty?: DifficultyMode;
  enemiesKilled: number;
  score: number;
  chosenSkills: { skill: Skill; count: number }[];
  isPaused: boolean;
  onTogglePause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  bossHp?: { current: number; max: number; name: string } | null;
  onGoHome?: () => void;
  runCoins?: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  playerStats,
  currentExp,
  expToNextLevel,
  playerLevel,
  room,
  maxRooms,
  difficulty = 'normal',
  enemiesKilled,
  score,
  chosenSkills,
  isPaused,
  onTogglePause,
  isMuted,
  onToggleMute,
  bossHp,
  onGoHome,
  runCoins = 0,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (playerStats.hp / playerStats.maxHp) * 100));
  const expPercent = Math.max(0, Math.min(100, (currentExp / expToNextLevel) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-4 select-none">
      {/* Top Header Section */}
      <div className="w-full flex flex-col gap-2">
        {/* Top XP Bar (Archero 2 Signature Bar with Orbs Tracker) */}
        <div className="w-full max-w-2xl mx-auto flex items-center gap-2 sm:gap-3 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 shadow-xl pointer-events-auto">
          {/* Level Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nv. {playerLevel}</span>
          </div>

          {/* Progress bar container */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center text-[11px] text-amber-200/90 font-medium mb-1">
              <span className="flex items-center gap-1 font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-sm" />
                Orbes d'expérience
              </span>
              <span className="font-mono font-bold text-amber-300">
                {Math.floor(currentExp)} / {expToNextLevel} orbes
              </span>
            </div>

            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-700/80 shadow-inner relative">
              <div
                className="h-full rounded-full bg-linear-to-r from-cyan-400 via-amber-400 to-amber-300 transition-all duration-300 shadow-sm relative overflow-hidden"
                style={{ width: `${expPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar: HP + Room Indicator + Score + Controls */}
        <div className="w-full flex items-center justify-between gap-2 max-w-4xl mx-auto">
          {/* Player HP Counter */}
          <div className="flex items-center gap-2.5 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-rose-900/40 shadow-lg pointer-events-auto">
            <div className="relative flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" />
              {playerStats.shieldActive && (
                <Shield className="w-3.5 h-3.5 text-amber-400 absolute -top-1 -right-1" />
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white font-mono tracking-tight">
                  {Math.max(0, Math.round(playerStats.hp))}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  / {playerStats.maxHp} PV
                </span>
              </div>
              {/* HP Bar */}
              <div className="w-24 sm:w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    hpPercent > 50
                      ? 'bg-emerald-500'
                      : hpPercent > 25
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Room / Stage Counter & Threat Level */}
          <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs shadow-lg">
            <span className="text-slate-400 font-medium">Salle :</span>
            <span className="font-black text-amber-400 text-sm font-mono">
              {room} <span className="text-slate-500 font-normal">/ {maxRooms}</span>
            </span>

            {/* Threat Level Badge */}
            <div className={`hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${
              room <= 3
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : room <= 7
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : room <= 11
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                : room <= 15
                ? 'bg-red-500/15 text-red-400 border-red-500/40 animate-pulse'
                : 'bg-purple-500/20 text-purple-300 border-purple-500/50 animate-pulse'
            }`}>
              <ShieldAlert className="w-3 h-3" />
              <span>
                {room <= 3 ? 'Faible' : room <= 7 ? 'Modérée' : room <= 11 ? 'Élevée' : room <= 15 ? 'Critique' : 'Cauchemar'}
              </span>
            </div>

            {/* Difficulty Badge */}
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
              difficulty === 'hell'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : difficulty === 'heroic'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {difficulty}
            </span>
          </div>

          {/* Enemies, Score & Gold Coins */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs shadow-lg">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Skull className="w-3.5 h-3.5 text-red-400" />
              <span className="font-mono font-bold">{enemiesKilled}</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-amber-300 font-mono font-bold">
              <span>{score.toLocaleString()} pts</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center gap-1 text-amber-400 font-mono font-black">
              <span>🪙</span>
              <span>{runCoins}</span>
            </div>
          </div>

          {/* Quick Action Buttons (Home + Sound + Pause) */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {onGoHome && (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onGoHome();
                }}
                title="Retour à l'Accueil & Choix du Héros"
                className="h-8 px-2.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-400 transition-all shadow-md cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-bold">Héros</span>
              </button>
            )}
            <button
              onClick={() => {
                soundManager.playClick();
                onToggleMute();
              }}
              title={isMuted ? 'Activer le son' : 'Couper le son'}
              className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onTogglePause();
              }}
              title={isPaused ? 'Reprendre' : 'Pause'}
              className="w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-all shadow-md cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Boss HP Bar (if boss is present in room) */}
        {bossHp && (
          <div className="w-full max-w-xl mx-auto bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-xl border-2 border-rose-600/80 shadow-2xl shadow-rose-900/30 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex justify-between items-center text-xs font-bold text-rose-300 mb-1">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-rose-400 font-black">
                <Skull className="w-4 h-4 text-rose-500 animate-pulse" />
                {bossHp.name}
              </span>
              <span className="font-mono">
                {Math.max(0, Math.round(bossHp.current))} / {bossHp.max} PV
              </span>
            </div>
            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-rose-950">
              <div
                className="h-full rounded-full bg-linear-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-200"
                style={{ width: `${Math.max(0, Math.min(100, (bossHp.current / bossHp.max) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tray: Active Skills acquired during the run */}
      <div className="w-full flex items-end justify-between pointer-events-none">
        {/* Acquired Skills Badges */}
        <div className="flex flex-wrap items-center gap-1.5 max-w-md bg-slate-950/70 backdrop-blur-xs p-2 rounded-xl border border-slate-800/60 shadow-lg pointer-events-auto">
          {chosenSkills.length === 0 ? (
            <span className="text-[11px] text-slate-500 italic px-1">
              Aucune compétence acquise pour le moment...
            </span>
          ) : (
            chosenSkills.map(({ skill, count }) => (
              <div
                key={skill.id}
                title={`${skill.nameFr} (${skill.name}) - ${skill.descriptionFr}`}
                className="relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 border border-amber-400/50 shadow-xs group cursor-pointer hover:scale-110 transition-transform"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                {count > 1 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {count}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Stutter-step action helper tip */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400">
          <span className="font-bold text-amber-400">Règle d'or :</span>
          <span>Arrêtez-vous pour tirer automatiquement !</span>
        </div>
      </div>
    </div>
  );
};
