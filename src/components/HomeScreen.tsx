import React, { useState } from 'react';
import { CHARACTERS, Character } from '../data/characters';
import { GAME_ASSETS, GameAsset } from '../data/assets';
import { DifficultyMode } from '../types/game';
import { TopDownHeroPreview } from './TopDownHeroPreview';
import { 
  Play, Sparkles, Heart, Zap, Crosshair, 
  BookOpen, Package, ChevronRight, Check,
  ShieldAlert, Lock, Coins, PlusCircle, Unlock
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface HomeScreenProps {
  selectedCharacter: Character;
  onSelectCharacter: (char: Character) => void;
  selectedBlaster: GameAsset;
  onSelectBlaster: (blaster: GameAsset) => void;
  difficulty: DifficultyMode;
  onSelectDifficulty: (mode: DifficultyMode) => void;
  coins: number;
  unlockedCharacterIds: string[];
  onUnlockCharacter: (char: Character) => void;
  onAddDemoCoins: (amount: number) => void;
  onOpenCoinShop?: () => void;
  onStartGame: () => void;
  onOpenAssets: () => void;
  onOpenPrd: () => void;
}

type CharacterFilter = 'all' | 'assault' | 'magic' | 'tank' | 'special';

export const HomeScreen: React.FC<HomeScreenProps> = ({
  selectedCharacter,
  onSelectCharacter,
  selectedBlaster,
  onSelectBlaster,
  difficulty,
  onSelectDifficulty,
  coins,
  unlockedCharacterIds,
  onUnlockCharacter,
  onAddDemoCoins,
  onOpenCoinShop,
  onStartGame,
  onOpenAssets,
  onOpenPrd,
}) => {
  const [showWeaponDrawer, setShowWeaponDrawer] = useState(false);
  const [filter, setFilter] = useState<CharacterFilter>('all');

  // Available blasters
  const blasters = GAME_ASSETS.filter((a) => a.category === 'blaster');

  // Filter characters
  const filteredCharacters = CHARACTERS.filter((c) => {
    if (filter === 'all') return true;
    if (filter === 'assault') return ['atreus', 'valkyrie', 'ignis'].includes(c.id);
    if (filter === 'magic') return ['phoenix', 'zephyr', 'sylvanas', 'aria'].includes(c.id);
    if (filter === 'tank') return ['thorval', 'balthazar'].includes(c.id);
    if (filter === 'special') return ['nyx', 'drakar', 'cyborg_x'].includes(c.id);
    return true;
  });

  const isSelectedUnlocked = unlockedCharacterIds.includes(selectedCharacter.id);
  const canAffordSelected = coins >= selectedCharacter.unlockCost;

  const handlePickCharacter = (char: Character) => {
    soundManager.playClick();
    onSelectCharacter(char);
    // Also equip their default weapon if player hasn't custom picked
    const defaultWep = blasters.find((b) => b.id === char.defaultWeaponId);
    if (defaultWep) {
      onSelectBlaster(defaultWep);
    }
  };

  const handleUnlockCurrent = () => {
    if (!canAffordSelected) return;
    onUnlockCharacter(selectedCharacter);
  };

  const handleStart = () => {
    if (!isSelectedUnlocked) return;
    soundManager.playLevelUp();
    onStartGame();
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-y-auto select-none relative">
      {/* Background ambient lighting based on chosen hero */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[360px] rounded-full blur-[130px] pointer-events-none opacity-25"
        style={{ backgroundColor: selectedCharacter.avatarColor }}
      />

      {/* Main Hero Container */}
      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 relative z-10">
        {/* Title Header with Coin Balance */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="text-center sm:text-left space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-linear-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-[11px] tracking-widest uppercase shadow-md shadow-amber-500/10">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span>ARCHERO 2 • ROGUE COMBAT ARENA</span>
              <Sparkles className="w-3 h-3" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">
              CHOISISSEZ VOTRE HÉROS &amp; ARME
            </h1>
            <p className="text-xs text-slate-400">
              Gagnez des pièces d'or à chaque combat pour débloquer les 12 héros uniques !
            </p>
          </div>

          {/* Gold Coin Purse & Quick Demo Bonus Button */}
          <div className="flex items-center gap-2.5 bg-slate-900/90 border border-amber-500/40 p-2 sm:p-2.5 rounded-2xl shadow-xl shadow-amber-500/10 backdrop-blur-md">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-linear-to-r from-amber-500/20 via-amber-400/30 to-yellow-500/20 border border-amber-400/50">
              <span className="text-xl">🪙</span>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Trésor d'Or</span>
                <span className="font-mono font-black text-lg text-amber-400 leading-none">{coins}</span>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playCoin();
                if (onOpenCoinShop) {
                  onOpenCoinShop();
                } else {
                  onAddDemoCoins(500);
                }
              }}
              title="Obtenir 500 Pièces d'Or (Regarder une pub ou Payer 2,00 €)"
              className="px-3 py-2 rounded-xl bg-linear-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/50 text-amber-300 hover:text-amber-100 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md shadow-amber-500/10"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+500 🪙</span>
              <span className="text-[10px] text-amber-200/80 font-normal hidden sm:inline">(Pub / 2€)</span>
            </button>
          </div>
        </div>

        {/* Difficulty Mode Selector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Difficulté &amp; Récompenses de Victoire</span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Chaque victoire en arène offre un jackpot de pièces d'or !
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Normal */}
            <button
              onClick={() => {
                soundManager.playClick();
                onSelectDifficulty('normal');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                difficulty === 'normal'
                  ? 'bg-emerald-950/40 border-emerald-400 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-emerald-300">Aventurier (Normal)</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  15 Salles
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Progression équilibrée. Boss Golem &amp; Titans.
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono mt-1">
                <span className="text-emerald-400">Score : 1.0x</span>
                <span className="text-amber-400 font-bold">Victoire : +30 🪙</span>
              </div>
            </button>

            {/* Heroic */}
            <button
              onClick={() => {
                soundManager.playClick();
                onSelectDifficulty('heroic');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                difficulty === 'heroic'
                  ? 'bg-amber-950/40 border-amber-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-amber-300">Champion (Héroïque)</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  25 Salles
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                +45% PV monstres, monstres Élites dès la salle 3.
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono mt-1">
                <span className="text-amber-400">Score : 1.6x</span>
                <span className="text-amber-300 font-bold">Victoire : +50 🪙</span>
              </div>
            </button>

            {/* Hell */}
            <button
              onClick={() => {
                soundManager.playClick();
                onSelectDifficulty('hell');
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                difficulty === 'hell'
                  ? 'bg-rose-950/40 border-rose-500 shadow-md shadow-rose-500/20 ring-1 ring-rose-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm text-rose-300">Cauchemar (Enfer)</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  35 Salles
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                +90% PV monstres, frénésie d'Élites &amp; Boss titanesques.
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono mt-1">
                <span className="text-rose-400">Score : 2.5x</span>
                <span className="text-amber-300 font-bold">Victoire : +70 🪙</span>
              </div>
            </button>
          </div>
        </div>

        {/* 1. Character Roster with Category Filters and Lock Status */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Sélection du Combattant ({unlockedCharacterIds.length}/{CHARACTERS.length} Débloqués) :
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'all' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous (12)
              </button>
              <button
                onClick={() => setFilter('assault')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'assault' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Assaut &amp; Snipers
              </button>
              <button
                onClick={() => setFilter('magic')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'magic' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Élémentaires
              </button>
              <button
                onClick={() => setFilter('tank')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'tank' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tanks &amp; Lourds
              </button>
              <button
                onClick={() => setFilter('special')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  filter === 'special' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Spéciaux
              </button>
            </div>
          </div>

          {/* Character Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
            {filteredCharacters.map((char) => {
              const isSelected = char.id === selectedCharacter.id;
              const isUnlocked = unlockedCharacterIds.includes(char.id);
              return (
                <button
                  key={char.id}
                  onClick={() => handlePickCharacter(char)}
                  className={`relative rounded-2xl p-3 flex flex-col items-center gap-2 transition-all duration-200 cursor-pointer border-2 text-left group overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/20 scale-102 ring-2 ring-amber-400/40'
                      : isUnlocked
                      ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                      : 'bg-slate-950/70 border-slate-800/80 opacity-85 hover:opacity-100 hover:border-amber-500/40'
                  }`}
                >
                  {/* Selected tick or Lock Icon */}
                  {isSelected ? (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
                      <Check className="w-2.5 h-2.5 stroke-3" />
                    </div>
                  ) : !isUnlocked ? (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-slate-950/90 border border-amber-500/40 text-amber-400 flex items-center gap-1 text-[9px] font-mono font-bold shadow-md">
                      <Lock className="w-2.5 h-2.5" />
                      <span>{char.unlockCost} 🪙</span>
                    </div>
                  ) : null}

                  {/* Character Avatar Icon Circle */}
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 relative transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: char.avatarColor + '20',
                      borderColor: isSelected ? char.accentColor : isUnlocked ? '#334155' : '#1e293b',
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-black text-white text-sm shadow-md"
                      style={{ backgroundColor: char.avatarColor }}
                    >
                      {char.name[0]}
                    </div>
                  </div>

                  <div className="text-center w-full">
                    <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 truncate">
                      {char.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 block font-medium truncate">
                      {char.classType}
                    </span>
                    <span className="text-[9px] font-mono text-amber-400/90 block mt-0.5 truncate">
                      {isUnlocked ? `${char.baseHp} PV • ${char.baseDamage} DMG` : `À débloquer (${char.unlockCost} 🪙)`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Selected Character Details & Top-Down 3D Viewport Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Left Column: Character Profile & Lore */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-sm"
                  style={{ backgroundColor: selectedCharacter.accentColor }}
                >
                  {selectedCharacter.classType}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {selectedCharacter.title}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2">
                <span>{selectedCharacter.name}</span>
                {!isSelectedUnlocked && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                    Verrouillé
                  </span>
                )}
              </h2>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {selectedCharacter.description}
              </p>
            </div>

            {/* Innate Passive Ability Card */}
            <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl space-y-1.5 shadow-inner">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Passif Inné : {selectedCharacter.passiveName}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedCharacter.passiveDesc}
              </p>
            </div>

            {/* Character Base Stats Bars */}
            <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Statistiques de Combat
              </div>

              {/* HP */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <Heart className="w-3.5 h-3.5" /> Points de Vie (PV)
                  </span>
                  <span className="font-mono text-white">{selectedCharacter.baseHp}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{ width: `${(selectedCharacter.baseHp / 1500) * 100}%` }}
                  />
                </div>
              </div>

              {/* Damage */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Crosshair className="w-3.5 h-3.5" /> Dégâts par Tir
                  </span>
                  <span className="font-mono text-white">
                    {Math.round(selectedCharacter.baseDamage * (selectedBlaster.stats?.damageMod || 1))}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(selectedCharacter.baseDamage / 150) * 100}%` }}
                  />
                </div>
              </div>

              {/* Speed & Attack Rate */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
                <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Vitesse :</span>
                  <span className="font-bold text-emerald-400">{selectedCharacter.baseSpeed} px/s</span>
                </div>
                <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Cadence :</span>
                  <span className="font-bold text-cyan-400">{selectedCharacter.attackSpeed} tirs/s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column: Top-Down Animated Hero Viewport */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-950/40 border border-slate-800/60">
            <TopDownHeroPreview
              character={selectedCharacter}
              blaster={selectedBlaster}
            />
          </div>

          {/* Right Column: Equipped Blaster Weapon & Action CTA */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
            {/* Weapon Showcase Card */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col items-center gap-3 shadow-xl relative">
              <div className="w-24 h-24 rounded-2xl bg-linear-to-b from-slate-900 to-slate-950 border-2 border-amber-400/50 flex items-center justify-center p-2 shadow-lg shadow-amber-500/10 shrink-0 relative group">
                <img
                  src={selectedBlaster.url}
                  alt={selectedBlaster.name}
                  className="max-w-full max-h-full object-contain filter drop-shadow-xl transition-transform group-hover:scale-110"
                />
                <span className="absolute bottom-1 left-1 right-1 text-center text-[8px] uppercase font-bold tracking-wider px-1 py-0.5 rounded bg-slate-900/90 text-amber-300 border border-slate-700">
                  Arme Équipée
                </span>
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-white">
                  {selectedBlaster.nameFr}
                </h3>
                <p className="text-[11px] text-slate-300 leading-tight">
                  {selectedBlaster.descriptionFr}
                </p>

                {/* Modifiers Pill */}
                <div className="flex flex-wrap gap-1.5 pt-1 justify-center text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800">
                    DMG: x{selectedBlaster.stats?.damageMod || 1.0}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                    Cadence: x{selectedBlaster.stats?.fireRateMod || 1.0}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Blaster Selector Strip */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>Changer d'Arme ({blasters.length}) :</span>
                <button
                  onClick={() => setShowWeaponDrawer(!showWeaponDrawer)}
                  className="text-amber-400 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <span>{showWeaponDrawer ? 'Réduire' : 'Voir tout'}</span>
                  <ChevronRight className={`w-3 h-3 transition-transform ${showWeaponDrawer ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Blasters mini grid */}
              <div className={`grid grid-cols-4 gap-1.5 ${showWeaponDrawer ? 'max-h-36 overflow-y-auto p-1' : ''}`}>
                {(showWeaponDrawer ? blasters : blasters.slice(0, 4)).map((blaster) => {
                  const isEquipped = blaster.id === selectedBlaster.id;
                  return (
                    <button
                      key={blaster.id}
                      onClick={() => {
                        soundManager.playClick();
                        onSelectBlaster(blaster);
                      }}
                      title={`${blaster.nameFr} - ${blaster.descriptionFr}`}
                      className={`relative rounded-xl p-1.5 flex flex-col items-center justify-center transition-all cursor-pointer border ${
                        isEquipped
                          ? 'bg-slate-800 border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <img
                        src={blaster.url}
                        alt={blaster.name}
                        className="w-8 h-8 object-contain filter drop-shadow-sm"
                        loading="lazy"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Big Launch Play Button OR Unlock Hero Button */}
            <div className="pt-2">
              {isSelectedUnlocked ? (
                <button
                  onClick={handleStart}
                  className="w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm sm:text-base tracking-wider uppercase shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2.5 cursor-pointer transition-all active:scale-98 animate-pulse hover:animate-none"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>
                    COMBATTRE AVEC {selectedCharacter.name.toUpperCase()}
                  </span>
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleUnlockCurrent}
                    disabled={!canAffordSelected}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm sm:text-base tracking-wider uppercase shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-98 ${
                      canAffordSelected
                        ? 'bg-linear-to-r from-emerald-500 via-emerald-400 to-amber-400 text-slate-950 hover:brightness-110 shadow-emerald-500/30 ring-2 ring-emerald-300/40'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700 cursor-not-allowed opacity-75'
                    }`}
                  >
                    <Unlock className="w-5 h-5" />
                    <span>
                      {canAffordSelected
                        ? `DÉBLOQUER (${selectedCharacter.unlockCost} 🪙)`
                        : `PIÈCES INSUFFISANTES (${selectedCharacter.unlockCost} 🪙)`}
                    </span>
                  </button>
                  {!canAffordSelected && onOpenCoinShop && (
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onOpenCoinShop();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Obtenir +500 🪙 (Regarder une pub ou 2,00 €)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Bottom Links & Secondary Hub Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAssets();
            }}
            className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center gap-3 cursor-pointer transition-all hover:bg-slate-900 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Répertoire Assets (40)</div>
              <div className="text-[11px] text-slate-400">Explorer les blasters, fléchettes et caisses</div>
            </div>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenPrd();
            }}
            className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center gap-3 cursor-pointer transition-all hover:bg-slate-900 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Document PRD Complet</div>
              <div className="text-[11px] text-slate-400">Architecture, mécaniques et équilibrage</div>
            </div>
          </button>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Économie de Victoire</div>
              <div className="text-[11px] text-slate-400">Gagnez des pièces d'or sur les monstres et boss</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
