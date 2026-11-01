import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Skill } from '../types/game';
import { Trophy, Skull, RotateCcw, Award, Clock, Zap, Home } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface GameOverModalProps {
  isVictory: boolean;
  score: number;
  roomsCleared: number;
  maxRooms: number;
  enemiesKilled: number;
  gameTime: number;
  chosenSkills: { skill: Skill; count: number }[];
  coinsEarned?: number;
  totalCoins?: number;
  onRestart: () => void;
  onViewPrd: () => void;
  onGoHome?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  score,
  roomsCleared,
  maxRooms,
  enemiesKilled,
  gameTime,
  chosenSkills,
  coinsEarned = 0,
  totalCoins = 0,
  onRestart,
  onViewPrd,
  onGoHome,
}) => {
  useEffect(() => {
    if (isVictory) {
      soundManager.playLevelUp();
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } else {
      soundManager.playPlayerHurt();
    }
  }, [isVictory]);

  const minutes = Math.floor(gameTime / 60);
  const seconds = Math.floor(gameTime % 60);
  const formattedTime = `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-slate-900 border-2 rounded-2xl shadow-2xl p-6 flex flex-col items-center text-center overflow-hidden relative border-slate-700">
        {/* Glow Header */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-lg ${
            isVictory
              ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-400/60 shadow-amber-500/30'
              : 'bg-rose-500/20 text-rose-400 border-2 border-rose-400/60 shadow-rose-500/30'
          }`}
        >
          {isVictory ? <Trophy className="w-10 h-10 animate-bounce" /> : <Skull className="w-10 h-10" />}
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
          {isVictory ? 'VICTOIRE ÉPIQUE !' : 'FIN DE PARTIE'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-4">
          {isVictory
            ? 'Vous avez triomphé de toutes les salles et vaincu le Boss Suprême !'
            : 'Votre archer a succombé aux tirs ennemis dans les donjons.'}
        </p>

        {/* Gold Coin Reward Banner */}
        <div className="w-full bg-linear-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border border-amber-400/50 p-3 rounded-2xl flex items-center justify-between mb-2 shadow-lg shadow-amber-500/10">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🪙</span>
            <div className="text-left">
              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                {isVictory ? 'Butin de Victoire & Jackpot !' : 'Pièces Récoltées'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">Total en banque : {totalCoins} 🪙</div>
            </div>
          </div>
          <div className="font-mono font-black text-xl text-amber-400">
            +{coinsEarned} 🪙
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full my-3 text-left">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Score Total</div>
              <div className="text-sm font-black text-white font-mono">{score.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Salles Franchies</div>
              <div className="text-sm font-black text-white font-mono">{roomsCleared} / {maxRooms}</div>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <Skull className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Monstres Vaincus</div>
              <div className="text-sm font-black text-white font-mono">{enemiesKilled}</div>
            </div>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
            <Clock className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Temps de Survie</div>
              <div className="text-sm font-black text-white font-mono">{formattedTime}</div>
            </div>
          </div>
        </div>

        {/* Skills built during this run */}
        <div className="w-full text-left mb-6">
          <div className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Build de Compétences ({chosenSkills.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
            {chosenSkills.length === 0 ? (
              <span className="text-xs text-slate-500 italic">Aucune capacité sélectionnée</span>
            ) : (
              chosenSkills.map(({ skill, count }) => (
                <span
                  key={skill.id}
                  className="px-2 py-1 rounded-md bg-slate-800 text-amber-300 text-[11px] font-semibold border border-slate-700 flex items-center gap-1"
                >
                  {skill.nameFr}
                  {count > 1 && <span className="text-white bg-slate-700 px-1 rounded text-[9px]">x{count}</span>}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full">
          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Rejouer</span>
          </button>

          {onGoHome && (
            <button
              onClick={() => {
                soundManager.playClick();
                onGoHome();
              }}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Changer de Héros</span>
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playClick();
              onViewPrd();
            }}
            className="py-3 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-medium text-xs border border-slate-800 flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            <span>PRD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
