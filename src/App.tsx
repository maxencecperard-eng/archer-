import React, { useState, useCallback } from 'react';
import { PlayerStats, Skill, DifficultyMode } from './types/game';
import { GameCanvas } from './components/GameCanvas';
import { VirtualJoystick } from './components/VirtualJoystick';
import { GameHUD } from './components/GameHUD';
import { SkillDraftModal } from './components/SkillDraftModal';
import { GameOverModal } from './components/GameOverModal';
import { PRDViewer } from './components/PRDViewer';
import { AssetGallery } from './components/AssetGallery';
import { HomeScreen } from './components/HomeScreen';
import { CoinShopModal } from './components/CoinShopModal';
import { GAME_ASSETS, GameAsset } from './data/assets';
import { CHARACTERS, Character } from './data/characters';
import { soundManager } from './audio/soundManager';
import { Gamepad2, FileText, Sparkles, Volume2, VolumeX, ShieldAlert, Package, Home } from 'lucide-react';

const getStatsFromCharacter = (char: Character): PlayerStats => ({
  maxHp: char.baseHp,
  hp: char.baseHp,
  speed: char.baseSpeed,
  baseDamage: char.baseDamage,
  attackSpeed: char.attackSpeed,
  attackRange: 480,
  critChance: char.critChance,
  critMultiplier: char.critMultiplier,
  defense: 0,
  projectileSpeed: 460,
  projectileCount: 1,
  diagonalArrows: 0,
  sideArrows: 0,
  rearArrows: 0,
  bouncingWall: false,
  ricochet: false,
  ricochetBounces: 0,
  piercing: !!char.innatePerks?.piercing,
  piercingCount: char.innatePerks?.piercing ? 2 : 0,
  poisonEffect: !!char.innatePerks?.poison,
  fireEffect: !!char.innatePerks?.fire,
  iceEffect: !!char.innatePerks?.ice,
  lightningEffect: !!char.innatePerks?.lightning,
  vampirismPercent: char.innatePerks?.bloodthirst || 0,
  shieldActive: !!char.innatePerks?.shield,
  shieldDuration: 0,
  hasFamiliar: !!char.innatePerks?.familiar,
  multishot: !!char.innatePerks?.multishot,
});

export default function App() {
  // Navigation mode ('home' is the default welcome screen with character selection!)
  const [viewMode, setViewMode] = useState<'home' | 'game' | 'assets' | 'prd'>('home');
  const [selectedCharacter, setSelectedCharacter] = useState<Character>(CHARACTERS[0]);
  const [activeBlaster, setActiveBlaster] = useState<GameAsset>(GAME_ASSETS[0]);
  const [difficulty, setDifficulty] = useState<DifficultyMode>('normal');

  // Coin & Character Unlock Economy with LocalStorage persistence
  const [coins, setCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('archero_gold_coins');
      return saved ? parseInt(saved, 10) : 350; // Starter gift of 350 coins
    } catch {
      return 350;
    }
  });

  const [unlockedCharacterIds, setUnlockedCharacterIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('archero_unlocked_characters');
      return saved ? JSON.parse(saved) : ['atreus', 'valkyrie'];
    } catch {
      return ['atreus', 'valkyrie'];
    }
  });

  const [runCoins, setRunCoins] = useState<number>(0);

  // Game state
  const [playerStats, setPlayerStats] = useState<PlayerStats>(getStatsFromCharacter(CHARACTERS[0]));
  const [moveVector, setMoveVector] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  const [currentExp, setCurrentExp] = useState(0);
  const [expToNextLevel, setExpToNextLevel] = useState(100);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [room, setRoom] = useState(1);
  const maxRooms = difficulty === 'hell' ? 35 : difficulty === 'heroic' ? 25 : 15;
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);

  const [isCoinShopOpen, setIsCoinShopOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [bossHp, setBossHp] = useState<{ current: number; max: number; name: string } | null>(null);

  // Skill Drafting State
  const [draftOptions, setDraftOptions] = useState<Skill[]>([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const [chosenSkills, setChosenSkills] = useState<{ skill: Skill; count: number }[]>([]);

  // Game Over State
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);

  // Coin economy handlers
  const handleEarnCoins = useCallback((amount: number) => {
    setRunCoins((prev) => prev + amount);
    setCoins((prev) => {
      const next = prev + amount;
      try {
        localStorage.setItem('archero_gold_coins', String(next));
      } catch {
        // storage fallback
      }
      return next;
    });
  }, []);

  const handleUnlockCharacter = useCallback((char: Character) => {
    if (coins < char.unlockCost) return;

    soundManager.playUnlock();
    const nextCoins = coins - char.unlockCost;
    const nextUnlocked = [...unlockedCharacterIds, char.id];

    setCoins(nextCoins);
    setUnlockedCharacterIds(nextUnlocked);
    setSelectedCharacter(char);
    setPlayerStats(getStatsFromCharacter(char));

    try {
      localStorage.setItem('archero_gold_coins', String(nextCoins));
      localStorage.setItem('archero_unlocked_characters', JSON.stringify(nextUnlocked));
    } catch {
      // storage fallback
    }
  }, [coins, unlockedCharacterIds]);

  const handleAddDemoCoins = useCallback((amount: number) => {
    setCoins((prev) => {
      const next = prev + amount;
      try {
        localStorage.setItem('archero_gold_coins', String(next));
      } catch {
        // storage fallback
      }
      return next;
    });
  }, []);

  // Trigger level up modal
  const handleLevelUp = useCallback((options: Skill[], newLevel: number) => {
    setDraftOptions(options);
    setIsDrafting(true);
  }, []);

  // Player selects a skill card from the 3 choices
  const handleSelectSkill = useCallback((skill: Skill) => {
    setPlayerStats((prev) => {
      const clone = { ...prev };
      skill.effect(clone);
      return clone;
    });

    setChosenSkills((prev) => {
      const existing = prev.find((item) => item.skill.id === skill.id);
      if (existing) {
        return prev.map((item) =>
          item.skill.id === skill.id ? { ...item, count: item.count + 1 } : item
        );
      }
      return [...prev, { skill, count: 1 }];
    });

    setIsDrafting(false);
    setDraftOptions([]);
  }, []);

  // End game with Victory Jackpot! (Easy: 30, Medium: 50, Hell: 70)
  const handleGameOver = useCallback((victory: boolean) => {
    if (victory) {
      const victoryJackpot = difficulty === 'hell' ? 70 : difficulty === 'heroic' ? 50 : 30;
      setRunCoins((prev) => prev + victoryJackpot);
      setCoins((prev) => {
        const next = prev + victoryJackpot;
        try {
          localStorage.setItem('archero_gold_coins', String(next));
        } catch {
          // fallback
        }
        return next;
      });
    }
    setIsVictory(victory);
    setIsGameOver(true);
  }, [difficulty]);

  // Restart clean run
  const handleRestart = useCallback(() => {
    setPlayerStats(getStatsFromCharacter(selectedCharacter));
    setCurrentExp(0);
    setExpToNextLevel(100);
    setPlayerLevel(1);
    setRoom(1);
    setEnemiesKilled(0);
    setScore(0);
    setGameTime(0);
    setRunCoins(0);
    setChosenSkills([]);
    setIsDrafting(false);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPaused(false);
    setBossHp(null);
  }, [selectedCharacter]);

  // Start fresh game from Home Screen
  const handleStartGame = useCallback(() => {
    setPlayerStats(getStatsFromCharacter(selectedCharacter));
    setCurrentExp(0);
    setExpToNextLevel(100);
    setPlayerLevel(1);
    setRoom(1);
    setEnemiesKilled(0);
    setScore(0);
    setGameTime(0);
    setRunCoins(0);
    setChosenSkills([]);
    setIsDrafting(false);
    setIsGameOver(false);
    setIsVictory(false);
    setIsPaused(false);
    setBossHp(null);
    setViewMode('game');
  }, [selectedCharacter]);

  const toggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const togglePause = () => {
    setIsPaused((p) => !p);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Header Mode Bar */}
      <header className="h-12 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
            🏹
          </div>
          <span className="font-black text-sm tracking-wide text-white hidden sm:inline">
            ARCHERO 2 <span className="text-amber-400 font-normal">| Rogue Arena</span>
          </span>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              soundManager.playClick();
              setViewMode('home');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'home'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-102'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Accueil &amp; Héros</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setViewMode('game');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'game'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-102'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Combat Arène</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setViewMode('assets');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'assets'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-102'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Assets (40)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setViewMode('prd');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'prd'
                ? 'bg-amber-500 text-slate-950 shadow-xs scale-102'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PRD &amp; Prompt</span>
          </button>
        </div>

        {/* Quick controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            title={isMuted ? 'Activer le son' : 'Couper le son'}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main View Container */}
      <main className="flex-1 relative overflow-hidden flex items-center justify-center">
        {viewMode === 'home' ? (
          /* Accueil avec sélection des héros et des armes */
          <HomeScreen
            selectedCharacter={selectedCharacter}
            onSelectCharacter={(char) => {
              setSelectedCharacter(char);
              setPlayerStats(getStatsFromCharacter(char));
            }}
            selectedBlaster={activeBlaster}
            onSelectBlaster={setActiveBlaster}
            difficulty={difficulty}
            onSelectDifficulty={setDifficulty}
            coins={coins}
            unlockedCharacterIds={unlockedCharacterIds}
            onUnlockCharacter={handleUnlockCharacter}
            onAddDemoCoins={handleAddDemoCoins}
            onOpenCoinShop={() => setIsCoinShopOpen(true)}
            onStartGame={handleStartGame}
            onOpenAssets={() => setViewMode('assets')}
            onOpenPrd={() => setViewMode('prd')}
          />
        ) : viewMode === 'game' ? (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {/* 60FPS Game Canvas */}
            <GameCanvas
              playerStats={playerStats}
              setPlayerStats={setPlayerStats}
              moveVector={moveVector}
              onLevelUp={handleLevelUp}
              onGameOver={handleGameOver}
              isPaused={isPaused || isDrafting || isGameOver}
              room={room}
              setRoom={setRoom}
              maxRooms={maxRooms}
              difficulty={difficulty}
              currentExp={currentExp}
              setCurrentExp={setCurrentExp}
              expToNextLevel={expToNextLevel}
              setExpToNextLevel={setExpToNextLevel}
              playerLevel={playerLevel}
              setPlayerLevel={setPlayerLevel}
              enemiesKilled={enemiesKilled}
              setEnemiesKilled={setEnemiesKilled}
              score={score}
              setScore={setScore}
              gameTime={gameTime}
              setGameTime={setGameTime}
              setBossHp={setBossHp}
              activeBlaster={activeBlaster}
              selectedCharacter={selectedCharacter}
              onEarnCoins={handleEarnCoins}
            />

            {/* In-Game Heads Up Display (HUD) */}
            <GameHUD
              playerStats={playerStats}
              currentExp={currentExp}
              expToNextLevel={expToNextLevel}
              playerLevel={playerLevel}
              room={room}
              maxRooms={maxRooms}
              difficulty={difficulty}
              enemiesKilled={enemiesKilled}
              score={score}
              chosenSkills={chosenSkills}
              isPaused={isPaused}
              onTogglePause={togglePause}
              isMuted={isMuted}
              onToggleMute={toggleMute}
              bossHp={bossHp}
              onGoHome={() => setViewMode('home')}
              runCoins={runCoins}
            />

            {/* Virtual Joystick for touch / mouse drags */}
            <VirtualJoystick
              onMove={setMoveVector}
              disabled={isPaused || isDrafting || isGameOver}
            />

            {/* 3-Card Roguelike Skill Draft Spin Modal */}
            {isDrafting && (
              <SkillDraftModal
                options={draftOptions}
                onSelectSkill={handleSelectSkill}
                level={playerLevel}
              />
            )}

            {/* Game Over / Victory Modal */}
            {isGameOver && (
              <GameOverModal
                isVictory={isVictory}
                score={score}
                roomsCleared={room - (isVictory ? 0 : 1)}
                maxRooms={maxRooms}
                enemiesKilled={enemiesKilled}
                gameTime={gameTime}
                chosenSkills={chosenSkills}
                coinsEarned={runCoins}
                totalCoins={coins}
                onRestart={handleRestart}
                onViewPrd={() => setViewMode('prd')}
                onGoHome={() => setViewMode('home')}
              />
            )}
          </div>
        ) : viewMode === 'assets' ? (
          /* Assets Gallery & Armory */
          <AssetGallery
            activeBlasterId={activeBlaster.id}
            onSelectBlaster={(blaster) => {
              setActiveBlaster(blaster);
            }}
            onBackToGame={() => setViewMode('game')}
          />
        ) : (
          /* PRD & Enhanced Prompt Viewer */
          <PRDViewer onBackToGame={() => setViewMode('game')} />
        )}
      </main>

      {/* Recharge +500 Pièces Modal (Pub ou 2,00 €) */}
      <CoinShopModal
        isOpen={isCoinShopOpen}
        onClose={() => setIsCoinShopOpen(false)}
        onGrantCoins={handleAddDemoCoins}
        currentCoins={coins}
      />
    </div>
  );
}
