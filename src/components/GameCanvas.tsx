import React, { useRef, useEffect, useCallback } from 'react';
import { 
  PlayerStats, Enemy, Projectile, ExpOrb, Particle, DamageFloater, 
  HealthDrop, CoinDrop, Obstacle, Skill, DifficultyMode 
} from '../types/game';
import { GameAsset } from '../data/assets';
import { Character } from '../data/characters';
import { soundManager } from '../audio/soundManager';
import { getRandomDraftSkills } from '../data/skills';
import { drawTopDownHero } from '../utils/topDownHeroRenderer';
import { drawEnemyWithSkin } from '../utils/enemySkinRenderer';

// Circle vs AABB collision resolution helper
function resolveCircleRectCollision(
  circle: { x: number; y: number; radius: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  const nearestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const nearestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  const deltaX = circle.x - nearestX;
  const deltaY = circle.y - nearestY;
  const distSq = deltaX * deltaX + deltaY * deltaY;

  if (distSq < circle.radius * circle.radius) {
    const dist = Math.sqrt(distSq);
    if (dist > 0.0001) {
      const overlap = circle.radius - dist;
      circle.x += (deltaX / dist) * overlap;
      circle.y += (deltaY / dist) * overlap;
    } else {
      const leftDist = circle.x - rect.x;
      const rightDist = rect.x + rect.width - circle.x;
      const topDist = circle.y - rect.y;
      const bottomDist = rect.y + rect.height - circle.y;
      const minDist = Math.min(leftDist, rightDist, topDist, bottomDist);
      if (minDist === leftDist) circle.x = rect.x - circle.radius;
      else if (minDist === rightDist) circle.x = rect.x + rect.width + circle.radius;
      else if (minDist === topDist) circle.y = rect.y - circle.radius;
      else circle.y = rect.y + rect.height + circle.radius;
    }
    return true;
  }
  return false;
}

// Circle vs AABB overlap check for projectiles
function checkCircleRectOverlap(
  circle: { x: number; y: number; radius: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  const nearestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const nearestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy < circle.radius * circle.radius;
}

interface GameCanvasProps {
  playerStats: PlayerStats;
  setPlayerStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  moveVector: { x: number; y: number; active: boolean };
  onLevelUp: (options: Skill[], newLevel: number) => void;
  onGameOver: (victory: boolean) => void;
  isPaused: boolean;
  room: number;
  setRoom: React.Dispatch<React.SetStateAction<number>>;
  maxRooms: number;
  difficulty?: DifficultyMode;
  currentExp: number;
  setCurrentExp: React.Dispatch<React.SetStateAction<number>>;
  expToNextLevel: number;
  setExpToNextLevel: React.Dispatch<React.SetStateAction<number>>;
  playerLevel: number;
  setPlayerLevel: React.Dispatch<React.SetStateAction<number>>;
  enemiesKilled: number;
  setEnemiesKilled: React.Dispatch<React.SetStateAction<number>>;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  gameTime: number;
  setGameTime: React.Dispatch<React.SetStateAction<number>>;
  setBossHp: (boss: { current: number; max: number; name: string } | null) => void;
  activeBlaster: GameAsset;
  selectedCharacter: Character;
  onEarnCoins?: (amount: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  playerStats,
  setPlayerStats,
  moveVector,
  onLevelUp,
  onGameOver,
  isPaused,
  room,
  setRoom,
  maxRooms,
  difficulty = 'normal',
  currentExp,
  setCurrentExp,
  expToNextLevel,
  setExpToNextLevel,
  playerLevel,
  setPlayerLevel,
  setEnemiesKilled,
  score,
  setScore,
  setGameTime,
  setBossHp,
  activeBlaster,
  selectedCharacter,
  onEarnCoins,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Asset image cache
  const imagesRef = useRef<{ [key: string]: HTMLImageElement }>({});

  useEffect(() => {
    // Preload crate images and active blaster
    const crateUrls = [
      { key: 'crate_small', src: '/Assets/crate-small_d6822f33.png' },
      { key: 'bullet_foam', src: '/Assets/bullet-foam-thick_aab1352c.png' },
    ];
    crateUrls.forEach(({ key, src }) => {
      const img = new Image();
      img.src = src;
      imagesRef.current[key] = img;
    });
  }, []);

  useEffect(() => {
    if (activeBlaster?.url) {
      const img = new Image();
      img.src = activeBlaster.url;
      imagesRef.current['blaster'] = img;
    }
  }, [activeBlaster]);

  // Keyboard state for desktop
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Core internal game simulation state stored in refs for 60fps loop
  const playerRef = useRef({
    x: 840,
    y: 1000,
    radius: 18,
    angle: 0,
    walkFrame: 0,
    shootCooldown: 0,
    invincibleTimer: 0,
    isMoving: false,
    shieldTimer: 0,
  });

  // 2X Map Arena Dimensions (1600x1100)
  const arenaBounds = useRef({
    x: 40,
    y: 40,
    width: 1600,
    height: 1100,
  });

  // Dynamic Camera tracking viewport
  const cameraRef = useRef({
    x: 390,
    y: 700,
  });

  const enemiesRef = useRef<Enemy[]>([]);
  const projectilesRef = useRef<Projectile[]>([]);
  const expOrbsRef = useRef<ExpOrb[]>([]);
  const coinDropsRef = useRef<CoinDrop[]>([]);
  const healthDropsRef = useRef<HealthDrop[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatersRef = useRef<DamageFloater[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const familiarRef = useRef({ angle: 0, shootCooldown: 0 });
  const portalRef = useRef<{ x: number; y: number; active: boolean; radius: number }>({
    x: 840,
    y: 100,
    active: false,
    radius: 32,
  });

  // Track room generation
  const roomEnemiesTotal = useRef(0);
  const roomGenerated = useRef(-1);

  // Sync keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Spawn room obstacles & enemies
  const generateRoom = useCallback((currentRoom: number) => {
    const bounds = arenaBounds.current;
    enemiesRef.current = [];
    projectilesRef.current = [];
    healthDropsRef.current = [];
    coinDropsRef.current = [];
    portalRef.current.active = false;
    portalRef.current.x = bounds.x + bounds.width / 2;
    portalRef.current.y = bounds.y + 65;

    // Reset player position to bottom-center of the large 2x arena
    playerRef.current.x = bounds.x + bounds.width / 2;
    playerRef.current.y = bounds.y + bounds.height - 95;

    // Center camera initially around player
    if (canvasRef.current) {
      cameraRef.current.x = playerRef.current.x - canvasRef.current.width / 2;
      cameraRef.current.y = playerRef.current.y - canvasRef.current.height / 2;
    }

    // Procedural generation of Walls, Water pools, and Crates
    const obstacles: Obstacle[] = [];
    const layout = currentRoom % 4;

    if (layout === 0) {
      // Layout 0: Grand Central Water Lake & 4 Heavy Stone Wall Bastions
      obstacles.push({
        x: bounds.x + bounds.width / 2 - 140,
        y: bounds.y + bounds.height / 2 - 90,
        width: 280,
        height: 180,
        type: 'water',
      });
      // 4 Stone fortress walls (blocks movement and blocks all projectiles!)
      obstacles.push({
        x: bounds.x + 280,
        y: bounds.y + 260,
        width: 200,
        height: 44,
        type: 'wall',
      });
      obstacles.push({
        x: bounds.x + bounds.width - 480,
        y: bounds.y + 260,
        width: 200,
        height: 44,
        type: 'wall',
      });
      obstacles.push({
        x: bounds.x + 280,
        y: bounds.y + bounds.height - 304,
        width: 200,
        height: 44,
        type: 'wall',
      });
      obstacles.push({
        x: bounds.x + bounds.width - 480,
        y: bounds.y + bounds.height - 304,
        width: 200,
        height: 44,
        type: 'wall',
      });
    } else if (layout === 1) {
      // Layout 1: River Crossing with Left and Right Canals
      obstacles.push({
        x: bounds.x + 80,
        y: bounds.y + bounds.height / 2 - 60,
        width: 500,
        height: 120,
        type: 'water',
      });
      obstacles.push({
        x: bounds.x + bounds.width - 580,
        y: bounds.y + bounds.height / 2 - 60,
        width: 500,
        height: 120,
        type: 'water',
      });
      // Stone Rampart Walls flanking the passage
      obstacles.push({
        x: bounds.x + 420,
        y: bounds.y + 200,
        width: 44,
        height: 220,
        type: 'wall',
      });
      obstacles.push({
        x: bounds.x + bounds.width - 464,
        y: bounds.y + 200,
        width: 44,
        height: 220,
        type: 'wall',
      });
      obstacles.push({
        x: bounds.x + 420,
        y: bounds.y + bounds.height - 420,
        width: 44,
        height: 220,
        type: 'wall',
      });
      obstacles.push({
        x: bounds.x + bounds.width - 464,
        y: bounds.y + bounds.height - 420,
        width: 44,
        height: 220,
        type: 'wall',
      });
    } else if (layout === 2) {
      // Layout 2: Ancient Labyrinth Ruins & Twin Water Oases
      obstacles.push({
        x: bounds.x + 200,
        y: bounds.y + bounds.height / 2 - 80,
        width: 240,
        height: 160,
        type: 'water',
      });
      obstacles.push({
        x: bounds.x + bounds.width - 440,
        y: bounds.y + bounds.height / 2 - 80,
        width: 240,
        height: 160,
        type: 'water',
      });
      // L-shaped stone ruins
      obstacles.push({
        x: bounds.x + bounds.width / 2 - 200,
        y: bounds.y + 250,
        width: 400,
        height: 44,
        type: 'wall',
      });
      obstacles.push({
        x: bounds.x + bounds.width / 2 - 200,
        y: bounds.y + bounds.height - 294,
        width: 400,
        height: 44,
        type: 'wall',
      });
      obstacles.push({
        x: bounds.x + 220,
        y: bounds.y + 250,
        width: 44,
        height: 160,
        type: 'wall',
      });
      obstacles.push({
        x: bounds.x + bounds.width - 264,
        y: bounds.y + bounds.height - 410,
        width: 44,
        height: 160,
        type: 'wall',
      });
    } else {
      // Layout 3: Colosseum Pillars & Perimeter Water Trenches
      obstacles.push({
        x: bounds.x + 100,
        y: bounds.y + 180,
        width: 130,
        height: 380,
        type: 'water',
      });
      obstacles.push({
        x: bounds.x + bounds.width - 230,
        y: bounds.y + 180,
        width: 130,
        height: 380,
        type: 'water',
      });
      // 4 Monumental Column Pillars
      obstacles.push({
        x: bounds.x + 400,
        y: bounds.y + 280,
        width: 70,
        height: 70,
        type: 'wall',
      });
      obstacles.push({
        x: bounds.x + bounds.width - 470,
        y: bounds.y + 280,
        width: 70,
        height: 70,
        type: 'wall',
      });
      obstacles.push({
        x: bounds.x + 400,
        y: bounds.y + bounds.height - 350,
        width: 70,
        height: 70,
        type: 'wall',
      });
      obstacles.push({
        x: bounds.x + bounds.width - 470,
        y: bounds.y + bounds.height - 350,
        width: 70,
        height: 70,
        type: 'wall',
      });
    }

    // Crates in tactical corners with destructible wood
    obstacles.push({
      x: bounds.x + 150,
      y: bounds.y + 120,
      width: 44,
      height: 44,
      type: 'crate',
      destructible: true,
      hp: 3,
    });
    obstacles.push({
      x: bounds.x + bounds.width - 194,
      y: bounds.y + 120,
      width: 44,
      height: 44,
      type: 'crate',
      destructible: true,
      hp: 3,
    });
    obstacles.push({
      x: bounds.x + 150,
      y: bounds.y + bounds.height - 164,
      width: 44,
      height: 44,
      type: 'crate',
      destructible: true,
      hp: 3,
    });
    obstacles.push({
      x: bounds.x + bounds.width - 194,
      y: bounds.y + bounds.height - 164,
      width: 44,
      height: 44,
      type: 'crate',
      destructible: true,
      hp: 3,
    });

    obstaclesRef.current = obstacles;

    // Difficulty and Room Scaling
    const diffMult = difficulty === 'hell' ? 1.9 : difficulty === 'heroic' ? 1.4 : 1.0;
    const dmgMult = difficulty === 'hell' ? 1.55 : difficulty === 'heroic' ? 1.25 : 1.0;
    const speedMult = difficulty === 'hell' ? 1.22 : difficulty === 'heroic' ? 1.1 : 1.0;
    const eliteChance = difficulty === 'hell' ? 0.45 : difficulty === 'heroic' ? 0.28 : 0.14;

    const isBossRoom = currentRoom % 5 === 0 || currentRoom === maxRooms;
    const newEnemies: Enemy[] = [];

    if (isBossRoom) {
      // Determine boss name and profile across the 35 rooms!
      let bossName = 'Golem Ancien des Abîmes';
      let bossColor = '#eab308';
      let baseBossHp = 7000;
      let bossDmg = 160;

      if (currentRoom === 10) {
        bossName = 'Titan Démon Flamboyant';
        bossColor = '#ef4444';
        baseBossHp = 14500;
        bossDmg = 210;
      } else if (currentRoom === 15) {
        bossName = 'Seigneur Nécromancien Maudit';
        bossColor = '#a855f7';
        baseBossHp = 22000;
        bossDmg = 250;
      } else if (currentRoom === 20) {
        bossName = 'Avatar Primordial du Néant';
        bossColor = '#6366f1';
        baseBossHp = 32000;
        bossDmg = 310;
      } else if (currentRoom === 25) {
        bossName = 'Colosse de Feu Ardent';
        bossColor = '#f97316';
        baseBossHp = 44000;
        bossDmg = 370;
      } else if (currentRoom === 30) {
        bossName = 'Archidémon des Ombres';
        bossColor = '#ec4899';
        baseBossHp = 58000;
        bossDmg = 430;
      } else if (currentRoom >= 35) {
        bossName = 'Seigneur Titan de l\'Apocalypse';
        bossColor = '#dc2626';
        baseBossHp = 75000;
        bossDmg = 500;
      }

      const scaledBossHp = Math.round(baseBossHp * diffMult);
      newEnemies.push({
        id: `boss_${Date.now()}`,
        name: bossName,
        type: 'boss_golem',
        isBoss: true,
        x: bounds.x + bounds.width / 2,
        y: bounds.y + 240,
        radius: 48,
        hp: scaledBossHp,
        maxHp: scaledBossHp,
        speed: Math.round(75 * speedMult),
        damage: Math.round(bossDmg * dmgMult),
        color: bossColor,
        attackCooldown: 2.2,
        currentCooldown: 1.0,
        state: 'idle',
        stateTimer: 0,
        burnDuration: 0,
        poisonDuration: 0,
        freezeDuration: 0,
        experienceValue: 400 * (difficulty === 'hell' ? 2 : 1),
        specialAttackTimer: 0,
      });

      // Add minion guards
      const guardCount = difficulty === 'hell' ? 4 : 2;
      for (let i = 0; i < guardCount; i++) {
        const guardHp = Math.round((420 + currentRoom * 60) * diffMult);
        newEnemies.push({
          id: `guard_${i}_${Date.now()}`,
          name: 'Garde Squelette',
          type: 'melee_skeleton',
          x: bounds.x + 250 + i * 280,
          y: bounds.y + 360,
          radius: 17,
          hp: guardHp,
          maxHp: guardHp,
          speed: Math.round(120 * speedMult),
          damage: Math.round(75 * dmgMult),
          color: '#cbd5e1',
          attackCooldown: 1.0,
          currentCooldown: 0,
          state: 'idle',
          stateTimer: 0,
          burnDuration: 0,
          poisonDuration: 0,
          freezeDuration: 0,
          experienceValue: 35,
        });
      }
    } else {
      // Standard room enemy composition with progressive scaling & Elites
      const baseCount = 4 + Math.floor(currentRoom * 1.5 * (difficulty === 'hell' ? 1.3 : difficulty === 'heroic' ? 1.15 : 1.0));
      const count = Math.min(18, baseCount);

      for (let i = 0; i < count; i++) {
        const randType = Math.random();
        const spawnX = bounds.x + 60 + Math.random() * (bounds.width - 120);
        const spawnY = bounds.y + 60 + Math.random() * (bounds.height * 0.55);

        // Check if Elite
        const isElite = currentRoom >= 3 && Math.random() < eliteChance;
        const eliteModifier = isElite
          ? (['berserk', 'armored', 'vampiric', 'speed'][Math.floor(Math.random() * 4)] as 'berserk' | 'armored' | 'vampiric' | 'speed')
          : undefined;

        let hpMod = 1.0;
        let dmgMod = 1.0;
        let spdMod = 1.0;
        let cdMod = 1.0;

        if (eliteModifier === 'armored') hpMod = 2.0;
        if (eliteModifier === 'berserk') { dmgMod = 1.45; cdMod = 0.75; }
        if (eliteModifier === 'speed') spdMod = 1.38;
        if (eliteModifier === 'vampiric') hpMod = 1.4;

        if (randType < 0.45) {
          // Melee Skeleton
          const baseHp = Math.round((280 + currentRoom * 50) * diffMult * hpMod);
          newEnemies.push({
            id: `skel_${i}_${Date.now()}`,
            name: isElite ? `Élite Squelette (${eliteModifier?.toUpperCase()})` : 'Squelette Guerrier',
            type: 'melee_skeleton',
            isElite,
            eliteModifier,
            x: spawnX,
            y: spawnY,
            radius: isElite ? 19 : 16,
            hp: baseHp,
            maxHp: baseHp,
            speed: Math.round((110 + currentRoom * 3) * speedMult * spdMod),
            damage: Math.round((65 + currentRoom * 7) * dmgMult * dmgMod),
            color: isElite ? '#f59e0b' : '#e2e8f0',
            attackCooldown: 1.0 * cdMod,
            currentCooldown: 0,
            state: 'idle',
            stateTimer: 0,
            burnDuration: 0,
            poisonDuration: 0,
            freezeDuration: 0,
            experienceValue: isElite ? 75 : 25,
          });
        } else if (randType < 0.8) {
          // Ranged Goblin Archer
          const baseHp = Math.round((220 + currentRoom * 42) * diffMult * hpMod);
          newEnemies.push({
            id: `gobl_${i}_${Date.now()}`,
            name: isElite ? `Élite Archer (${eliteModifier?.toUpperCase()})` : 'Gobelin Archer',
            type: 'ranged_goblin',
            isElite,
            eliteModifier,
            x: spawnX,
            y: spawnY,
            radius: isElite ? 20 : 17,
            hp: baseHp,
            maxHp: baseHp,
            speed: Math.round(95 * speedMult * spdMod),
            damage: Math.round((55 + currentRoom * 6) * dmgMult * dmgMod),
            color: isElite ? '#10b981' : '#22c55e',
            attackCooldown: 2.2 * cdMod,
            currentCooldown: 0.5 + Math.random() * 1.5,
            state: 'idle',
            stateTimer: 0,
            burnDuration: 0,
            poisonDuration: 0,
            freezeDuration: 0,
            experienceValue: isElite ? 85 : 30,
          });
        } else {
          // Crimson Bat
          const baseHp = Math.round((180 + currentRoom * 36) * diffMult * hpMod);
          newEnemies.push({
            id: `bat_${i}_${Date.now()}`,
            name: isElite ? `Élite Chauve-souris (${eliteModifier?.toUpperCase()})` : 'Chauve-souris Pourpre',
            type: 'crimson_bat',
            isElite,
            eliteModifier,
            x: spawnX,
            y: spawnY,
            radius: isElite ? 17 : 14,
            hp: baseHp,
            maxHp: baseHp,
            speed: Math.round(155 * speedMult * spdMod),
            damage: Math.round((45 + currentRoom * 5) * dmgMult * dmgMod),
            color: isElite ? '#e11d48' : '#f43f5e',
            attackCooldown: 0.8 * cdMod,
            currentCooldown: 0,
            state: 'idle',
            stateTimer: 0,
            burnDuration: 0,
            poisonDuration: 0,
            freezeDuration: 0,
            experienceValue: isElite ? 65 : 22,
          });
        }
      }
    }

    enemiesRef.current = newEnemies;
    roomEnemiesTotal.current = newEnemies.length;
    roomGenerated.current = currentRoom;
  }, []);

  // Initialize room if not already generated
  useEffect(() => {
    if (roomGenerated.current !== room) {
      generateRoom(room);
    }
  }, [room, generateRoom]);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1); // clamp delta time
      lastTime = currentTime;

      if (!isPaused) {
        setGameTime((prev) => prev + dt);

        // -------------------------------------------------------------
        // 1. PLAYER INPUT & MOVEMENT UPDATE
        // -------------------------------------------------------------
        let moveX = 0;
        let moveY = 0;

        // Check Keyboard inputs (WASD / ZQSD / Arrows)
        if (keysPressed.current['w'] || keysPressed.current['z'] || keysPressed.current['arrowup']) {
          moveY -= 1;
        }
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
          moveY += 1;
        }
        if (keysPressed.current['a'] || keysPressed.current['q'] || keysPressed.current['arrowleft']) {
          moveX -= 1;
        }
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
          moveX += 1;
        }

        // Check Virtual Joystick inputs
        if (moveVector.active) {
          moveX = moveVector.x;
          moveY = moveVector.y;
        }

        const inputLength = Math.hypot(moveX, moveY);
        const isMoving = inputLength > 0.1;
        playerRef.current.isMoving = isMoving;

        const bounds = arenaBounds.current;

        if (isMoving) {
          const normX = moveX / (inputLength > 1 ? inputLength : 1);
          const normY = moveY / (inputLength > 1 ? inputLength : 1);
          const speed = playerStats.speed;

          playerRef.current.x += normX * speed * dt;
          playerRef.current.y += normY * speed * dt;
          playerRef.current.walkFrame += dt * 10;

          // Face movement direction while running
          playerRef.current.angle = Math.atan2(normY, normX);
        }

        // Collide player against obstacles (Water, Walls, intact Crates)
        // "nous ne pouvons ni traverser l eau ni passer par les murs"
        obstaclesRef.current.forEach((obs) => {
          if (obs.type === 'crate' && (obs.hp ?? 1) <= 0) return;
          resolveCircleRectCollision(playerRef.current, obs);
        });

        // Clamp player inside rectangular arena bounds
        const pRadius = playerRef.current.radius;
        playerRef.current.x = Math.max(bounds.x + pRadius, Math.min(bounds.x + bounds.width - pRadius, playerRef.current.x));
        playerRef.current.y = Math.max(bounds.y + pRadius, Math.min(bounds.y + bounds.height - pRadius, playerRef.current.y));

        // Smooth camera following player centered in the 2x large arena
        const targetCamX = playerRef.current.x - canvas.width / 2;
        const targetCamY = playerRef.current.y - canvas.height / 2;
        const minCamX = bounds.x - 20;
        const maxCamX = bounds.x + bounds.width + 20 - canvas.width;
        const minCamY = bounds.y - 20;
        const maxCamY = bounds.y + bounds.height + 20 - canvas.height;
        const desiredCamX = Math.max(minCamX, Math.min(maxCamX, targetCamX));
        const desiredCamY = Math.max(minCamY, Math.min(maxCamY, targetCamY));
        cameraRef.current.x += (desiredCamX - cameraRef.current.x) * Math.min(1, dt * 8);
        cameraRef.current.y += (desiredCamY - cameraRef.current.y) * Math.min(1, dt * 8);

        // Player invincibility timer
        if (playerRef.current.invincibleTimer > 0) {
          playerRef.current.invincibleTimer -= dt;
        }

        // Periodic shield timer (Aegis Shield perk)
        if (playerStats.shieldActive) {
          playerRef.current.shieldTimer += dt;
        }

        // -------------------------------------------------------------
        // 2. STUTTER-STEP AUTO-TARGETING & SHOOTING
        // -------------------------------------------------------------
        // In Archero, you ONLY fire when completely stopped!
        if (playerRef.current.shootCooldown > 0) {
          playerRef.current.shootCooldown -= dt;
        }

        // Find closest live enemy within attack range
        let closestEnemy: Enemy | null = null;
        let minDistance = playerStats.attackRange;

        for (const enemy of enemiesRef.current) {
          if (enemy.hp <= 0) continue;
          const dist = Math.hypot(enemy.x - playerRef.current.x, enemy.y - playerRef.current.y);
          if (dist < minDistance) {
            minDistance = dist;
            closestEnemy = enemy;
          }
        }

        // If stopped and target available, face and shoot!
        if (!isMoving && closestEnemy) {
          const targetAngle = Math.atan2(
            closestEnemy.y - playerRef.current.y,
            closestEnemy.x - playerRef.current.x
          );
          playerRef.current.angle = targetAngle;

          if (playerRef.current.shootCooldown <= 0) {
            // Fire arrows based on current perks!
            const fireVolley = () => {
              soundManager.playShoot();

              const anglesToFire: number[] = [];

              // Front arrows
              for (let i = 0; i < playerStats.projectileCount; i++) {
                const spread = (i - (playerStats.projectileCount - 1) / 2) * 0.12;
                anglesToFire.push(targetAngle + spread);
              }

              // Diagonal arrows (+/- 45 degrees)
              if (playerStats.diagonalArrows > 0) {
                anglesToFire.push(targetAngle - 0.65);
                anglesToFire.push(targetAngle + 0.65);
              }

              // Side arrows (+/- 90 degrees)
              if (playerStats.sideArrows > 0) {
                anglesToFire.push(targetAngle - Math.PI / 2);
                anglesToFire.push(targetAngle + Math.PI / 2);
              }

              // Rear arrow (180 degrees)
              if (playerStats.rearArrows > 0) {
                anglesToFire.push(targetAngle + Math.PI);
              }

              // Instantiate projectiles
              anglesToFire.forEach((angle) => {
                const blasterCrit = activeBlaster?.stats?.critMod || 0;
                const isCrit = Math.random() < (playerStats.critChance + blasterCrit);
                const weaponDmgMod = activeBlaster?.stats?.damageMod || 1.0;
                const finalDamage = Math.round(
                  playerStats.baseDamage * weaponDmgMod * (isCrit ? playerStats.critMultiplier : 1)
                );

                projectilesRef.current.push({
                  id: `arrow_${Math.random()}`,
                  x: playerRef.current.x + Math.cos(angle) * 20,
                  y: playerRef.current.y + Math.sin(angle) * 20,
                  vx: Math.cos(angle) * playerStats.projectileSpeed,
                  vy: Math.sin(angle) * playerStats.projectileSpeed,
                  radius: playerStats.baseDamage > 130 ? 7 : 5,
                  damage: finalDamage,
                  isCrit,
                  source: 'player',
                  color: isCrit ? '#f59e0b' : '#38bdf8',
                  duration: 2.2,
                  pierceRemaining: playerStats.piercing ? playerStats.piercingCount : 0,
                  bouncesRemaining: playerStats.bouncingWall ? 2 : 0,
                  ricochetsRemaining: playerStats.ricochet ? playerStats.ricochetBounces : 0,
                  elemental: {
                    fire: playerStats.fireEffect || selectedCharacter?.innatePerks?.fire,
                    ice: playerStats.iceEffect || selectedCharacter?.innatePerks?.ice,
                    poison: playerStats.poisonEffect || selectedCharacter?.innatePerks?.poison,
                    lightning: playerStats.lightningEffect,
                  },
                });
              });
            };

            // Initial volley
            fireVolley();

            // Multishot: fires secondary volley 120ms later!
            if (playerStats.multishot) {
              setTimeout(() => {
                if (enemiesRef.current.some((e) => e.hp > 0)) {
                  fireVolley();
                }
              }, 120);
            }

            // Reset cooldown based on attack speed and weapon modifier
            const weaponRateMod = activeBlaster?.stats?.fireRateMod || 1.0;
            playerRef.current.shootCooldown = 1 / (playerStats.attackSpeed * weaponRateMod);
          }
        }

        // -------------------------------------------------------------
        // 3. FAMILIAR COMPANION (Orbiting spirit pet)
        // -------------------------------------------------------------
        if (playerStats.hasFamiliar) {
          familiarRef.current.angle += dt * 3;
          familiarRef.current.shootCooldown -= dt;

          const famX = playerRef.current.x + Math.cos(familiarRef.current.angle) * 44;
          const famY = playerRef.current.y + Math.sin(familiarRef.current.angle) * 44;

          if (familiarRef.current.shootCooldown <= 0 && closestEnemy) {
            const famAngle = Math.atan2(closestEnemy.y - famY, closestEnemy.x - famX);
            projectilesRef.current.push({
              id: `fam_orb_${Math.random()}`,
              x: famX,
              y: famY,
              vx: Math.cos(famAngle) * 380,
              vy: Math.sin(famAngle) * 380,
              radius: 4,
              damage: Math.round(playerStats.baseDamage * 0.55),
              isCrit: false,
              source: 'familiar',
              color: '#a855f7',
              duration: 2.0,
              pierceRemaining: 0,
              bouncesRemaining: 0,
              ricochetsRemaining: 0,
            });
            familiarRef.current.shootCooldown = 0.9;
          }
        }

        // -------------------------------------------------------------
        // 4. PROJECTILE SIMULATION & COLLISIONS
        // -------------------------------------------------------------
        for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
          const proj = projectilesRef.current[i];
          proj.x += proj.vx * dt;
          proj.y += proj.vy * dt;
          proj.duration -= dt;

          // Wall collision for bouncing wall perk
          let bounced = false;
          if (proj.source === 'player' && proj.bouncesRemaining > 0) {
            if (proj.x - proj.radius < bounds.x) {
              proj.x = bounds.x + proj.radius;
              proj.vx = -proj.vx;
              proj.bouncesRemaining--;
              bounced = true;
            } else if (proj.x + proj.radius > bounds.x + bounds.width) {
              proj.x = bounds.x + bounds.width - proj.radius;
              proj.vx = -proj.vx;
              proj.bouncesRemaining--;
              bounced = true;
            }
            if (proj.y - proj.radius < bounds.y) {
              proj.y = bounds.y + proj.radius;
              proj.vy = -proj.vy;
              proj.bouncesRemaining--;
              bounced = true;
            } else if (proj.y + proj.radius > bounds.y + bounds.height) {
              proj.y = bounds.y + bounds.height - proj.radius;
              proj.vy = -proj.vy;
              proj.bouncesRemaining--;
              bounced = true;
            }
          }

          if (bounced) {
            // Spawn tiny bounce sparks
            for (let s = 0; s < 3; s++) {
              particlesRef.current.push({
                id: `bounce_${Math.random()}`,
                x: proj.x,
                y: proj.y,
                vx: (Math.random() - 0.5) * 80,
                vy: (Math.random() - 0.5) * 80,
                radius: 2,
                color: '#fef08a',
                alpha: 1,
                decay: 3.5,
              });
            }
          }

          // Check if projectile is out of arena bounds (if no bounces left)
          const isOutOfBounds =
            proj.x < bounds.x ||
            proj.x > bounds.x + bounds.width ||
            proj.y < bounds.y ||
            proj.y > bounds.y + bounds.height;

          if (proj.duration <= 0 || (isOutOfBounds && proj.bouncesRemaining <= 0)) {
            projectilesRef.current.splice(i, 1);
            continue;
          }

          // Obstacle collision: walls block all projectiles ("ni tirer et passer par les murs")
          let projectileHitObstacle = false;
          for (let oIdx = obstaclesRef.current.length - 1; oIdx >= 0; oIdx--) {
            const obs = obstaclesRef.current[oIdx];
            const isWall = obs.type === 'wall';
            const isCrate = obs.type === 'crate' && (obs.hp ?? 1) > 0;
            if (!isWall && !isCrate) continue;

            if (checkCircleRectOverlap(proj, obs)) {
              if (isWall) {
                // If player has bouncing wall perk and bounces remain, reflect off wall
                if (proj.source === 'player' && proj.bouncesRemaining > 0) {
                  const left = Math.abs(proj.x - obs.x);
                  const right = Math.abs(proj.x - (obs.x + obs.width));
                  const top = Math.abs(proj.y - obs.y);
                  const bottom = Math.abs(proj.y - (obs.y + obs.height));
                  const minSide = Math.min(left, right, top, bottom);
                  if (minSide === left || minSide === right) {
                    proj.vx = -proj.vx;
                  } else {
                    proj.vy = -proj.vy;
                  }
                  proj.bouncesRemaining--;
                  for (let s = 0; s < 4; s++) {
                    particlesRef.current.push({
                      id: `wbounce_${Math.random()}`,
                      x: proj.x,
                      y: proj.y,
                      vx: (Math.random() - 0.5) * 120,
                      vy: (Math.random() - 0.5) * 120,
                      radius: 2,
                      color: '#facc15',
                      alpha: 1,
                      decay: 4.0,
                    });
                  }
                  break;
                } else {
                  // Walls block and spark out projectiles completely
                  projectileHitObstacle = true;
                  for (let s = 0; s < 5; s++) {
                    particlesRef.current.push({
                      id: `wspark_${Math.random()}`,
                      x: proj.x,
                      y: proj.y,
                      vx: (Math.random() - 0.5) * 90,
                      vy: (Math.random() - 0.5) * 90,
                      radius: 2,
                      color: '#94a3b8',
                      alpha: 1,
                      decay: 4.5,
                    });
                  }
                  break;
                }
              } else if (isCrate) {
                projectileHitObstacle = true;
                obs.hp = (obs.hp ?? 3) - 1;
                for (let s = 0; s < 5; s++) {
                  particlesRef.current.push({
                    id: `cratespl_${Math.random()}`,
                    x: proj.x,
                    y: proj.y,
                    vx: (Math.random() - 0.5) * 90,
                    vy: (Math.random() - 0.5) * 90,
                    radius: 2.5,
                    color: '#b45309',
                    alpha: 1,
                    decay: 4.0,
                  });
                }
                if (obs.hp <= 0) {
                  soundManager.playEnemyKilled();
                  if (Math.random() < 0.5) {
                    coinDropsRef.current.push({
                      id: `crate_coin_${Math.random()}`,
                      x: obs.x + obs.width / 2,
                      y: obs.y + obs.height / 2,
                      value: 5,
                      vx: (Math.random() - 0.5) * 50,
                      vy: (Math.random() - 0.5) * 50,
                      rotation: 0,
                      duration: 25,
                    });
                  }
                }
                break;
              }
            }
          }

          if (projectileHitObstacle) {
            projectilesRef.current.splice(i, 1);
            continue;
          }

          // Check Player Arrow hit vs Enemies
          if (proj.source === 'player' || proj.source === 'familiar') {
            let hitEnemy = false;
            for (const enemy of enemiesRef.current) {
              if (enemy.hp <= 0) continue;
              const dist = Math.hypot(enemy.x - proj.x, enemy.y - proj.y);
              if (dist < enemy.radius + proj.radius) {
                hitEnemy = true;
                enemy.hp -= proj.damage;
                soundManager.playHit(proj.isCrit);

                // Floater
                floatersRef.current.push({
                  id: `float_${Math.random()}`,
                  x: enemy.x + (Math.random() - 0.5) * 20,
                  y: enemy.y - enemy.radius - 8,
                  text: `${proj.damage}${proj.isCrit ? '!' : ''}`,
                  color: proj.isCrit ? '#f59e0b' : '#ffffff',
                  fontSize: proj.isCrit ? 18 : 13,
                  alpha: 1,
                  life: 0.65,
                });

                // Apply Elemental debuffs
                if (proj.elemental?.fire) enemy.burnDuration = 3.5;
                if (proj.elemental?.ice) enemy.freezeDuration = 3.0;
                if (proj.elemental?.poison) enemy.poisonDuration = 4.0;

                // Lightning chain effect
                if (proj.elemental?.lightning) {
                  for (const other of enemiesRef.current) {
                    if (other !== enemy && other.hp > 0) {
                      const d2 = Math.hypot(other.x - enemy.x, other.y - enemy.y);
                      if (d2 < 170) {
                        const zapDmg = Math.round(proj.damage * 0.45);
                        other.hp -= zapDmg;
                        floatersRef.current.push({
                          id: `zap_${Math.random()}`,
                          x: other.x,
                          y: other.y - other.radius,
                          text: `⚡${zapDmg}`,
                          color: '#38bdf8',
                          fontSize: 12,
                          alpha: 1,
                          life: 0.55,
                        });
                        // Spark trail between enemies
                        for (let z = 0; z < 5; z++) {
                          particlesRef.current.push({
                            id: `spark_${Math.random()}`,
                            x: enemy.x + (other.x - enemy.x) * (z / 5),
                            y: enemy.y + (other.y - enemy.y) * (z / 5),
                            vx: (Math.random() - 0.5) * 50,
                            vy: (Math.random() - 0.5) * 50,
                            radius: 2,
                            color: '#67e8f9',
                            alpha: 1,
                            decay: 3.5,
                          });
                        }
                      }
                    }
                  }
                }

                // Ricochet: deflect towards another nearby live enemy!
                if (proj.ricochetsRemaining > 0) {
                  let nextTarget: Enemy | null = null;
                  let closestDist = 220;
                  for (const nextEnemy of enemiesRef.current) {
                    if (nextEnemy !== enemy && nextEnemy.hp > 0) {
                      const d = Math.hypot(nextEnemy.x - enemy.x, nextEnemy.y - enemy.y);
                      if (d < closestDist) {
                        closestDist = d;
                        nextTarget = nextEnemy;
                      }
                    }
                  }
                  if (nextTarget) {
                    const ricAngle = Math.atan2(nextTarget.y - proj.y, nextTarget.x - proj.x);
                    proj.vx = Math.cos(ricAngle) * playerStats.projectileSpeed;
                    proj.vy = Math.sin(ricAngle) * playerStats.projectileSpeed;
                    proj.ricochetsRemaining--;
                    hitEnemy = false; // keep projectile flying towards ricochet target!
                  }
                }

                // Hit particles
                for (let p = 0; p < 6; p++) {
                  particlesRef.current.push({
                    id: `hit_${Math.random()}`,
                    x: proj.x,
                    y: proj.y,
                    vx: (Math.random() - 0.5) * 120,
                    vy: (Math.random() - 0.5) * 120,
                    radius: 2.5,
                    color: proj.color,
                    alpha: 1,
                    decay: 4.0,
                  });
                }

                // Check death
                if (enemy.hp <= 0) {
                  soundManager.playEnemyKilled();
                  setEnemiesKilled((prev) => prev + 1);
                  setScore((prev) => prev + enemy.experienceValue * 15);

                  // Bloodthirst heal
                  if (playerStats.vampirismPercent > 0) {
                    const heal = Math.round(playerStats.maxHp * (playerStats.vampirismPercent / 100));
                    setPlayerStats((prev) => ({
                      ...prev,
                      hp: Math.min(prev.maxHp, prev.hp + heal),
                    }));
                    floatersRef.current.push({
                      id: `heal_${Math.random()}`,
                      x: playerRef.current.x,
                      y: playerRef.current.y - 25,
                      text: `+${heal} PV`,
                      color: '#10b981',
                      fontSize: 14,
                      alpha: 1,
                      life: 0.8,
                    });
                  }

                  // Spawn XP orbs
                  const orbCount = enemy.isBoss ? 15 : 2 + Math.floor(Math.random() * 2);
                  for (let o = 0; o < orbCount; o++) {
                    const scatterAngle = Math.random() * Math.PI * 2;
                    const scatterSpeed = 30 + Math.random() * 60;
                    expOrbsRef.current.push({
                      id: `orb_${Math.random()}`,
                      x: enemy.x,
                      y: enemy.y,
                      value: Math.ceil(enemy.experienceValue / orbCount),
                      vx: Math.cos(scatterAngle) * scatterSpeed,
                      vy: Math.sin(scatterAngle) * scatterSpeed,
                      color: '#06b6d4',
                    });
                  }

                  // Spawn shiny Gold Coins!
                  const coinCount = enemy.isBoss ? 10 : enemy.isElite ? 4 : (Math.random() < 0.65 ? 1 : 2);
                  for (let c = 0; c < coinCount; c++) {
                    const cAngle = Math.random() * Math.PI * 2;
                    const cSpeed = 35 + Math.random() * 65;
                    coinDropsRef.current.push({
                      id: `coin_${Math.random()}`,
                      x: enemy.x,
                      y: enemy.y,
                      value: enemy.isBoss ? 25 : enemy.isElite ? 15 : 8,
                      vx: Math.cos(cAngle) * cSpeed,
                      vy: Math.sin(cAngle) * cSpeed,
                      rotation: Math.random() * Math.PI * 2,
                      duration: 35,
                    });
                  }

                  // 15% chance to drop health heart
                  if (Math.random() < 0.16) {
                    healthDropsRef.current.push({
                      id: `heart_${Math.random()}`,
                      x: enemy.x,
                      y: enemy.y,
                      healAmount: 180,
                      duration: 18,
                    });
                  }
                }

                // Handle piercing
                if (proj.pierceRemaining > 0) {
                  proj.pierceRemaining--;
                } else if (!proj.ricochetsRemaining) {
                  projectilesRef.current.splice(i, 1);
                  break;
                }
              }
            }
          }

          // Check Enemy Projectile hit vs Player
          if (proj.source === 'enemy') {
            const dist = Math.hypot(playerRef.current.x - proj.x, playerRef.current.y - proj.y);
            if (dist < playerRef.current.radius + proj.radius) {
              projectilesRef.current.splice(i, 1);

              // Invincible or Shield Check
              if (playerRef.current.invincibleTimer <= 0) {
                if (playerStats.shieldActive && playerRef.current.shieldTimer > 8.0) {
                  // Shield absorbs the blow!
                  playerRef.current.shieldTimer = 0;
                  soundManager.playHit(false);
                  floatersRef.current.push({
                    id: `shield_block_${Math.random()}`,
                    x: playerRef.current.x,
                    y: playerRef.current.y - 25,
                    text: 'BOUCLIER BLOQUÉ !',
                    color: '#fbbf24',
                    fontSize: 13,
                    alpha: 1,
                    life: 0.8,
                  });
                } else {
                  // Take damage
                  soundManager.playPlayerHurt();
                  setPlayerStats((prev) => {
                    const newHp = Math.max(0, prev.hp - proj.damage);
                    if (newHp <= 0) {
                      onGameOver(false);
                    }
                    return { ...prev, hp: newHp };
                  });
                  playerRef.current.invincibleTimer = 0.4;

                  floatersRef.current.push({
                    id: `phurt_${Math.random()}`,
                    x: playerRef.current.x,
                    y: playerRef.current.y - 20,
                    text: `-${proj.damage}`,
                    color: '#ef4444',
                    fontSize: 16,
                    alpha: 1,
                    life: 0.75,
                  });
                }
              }
            }
          }
        }

        // -------------------------------------------------------------
        // 5. ENEMY AI & BEHAVIORS
        // -------------------------------------------------------------
        let currentBoss: Enemy | null = null;

        for (const enemy of enemiesRef.current) {
          if (enemy.hp <= 0) continue;

          if (enemy.isBoss) {
            currentBoss = enemy;
          }

          // Handle Elemental ticks
          if (enemy.burnDuration > 0) {
            enemy.burnDuration -= dt;
            if (Math.random() < 0.15) {
              const burnDmg = 14;
              enemy.hp -= burnDmg;
              floatersRef.current.push({
                id: `burn_${Math.random()}`,
                x: enemy.x,
                y: enemy.y - 10,
                text: `${burnDmg}`,
                color: '#f97316',
                fontSize: 11,
                alpha: 0.9,
                life: 0.45,
              });
            }
          }

          if (enemy.poisonDuration > 0) {
            enemy.poisonDuration -= dt;
            if (Math.random() < 0.12) {
              const poisDmg = 12;
              enemy.hp -= poisDmg;
              floatersRef.current.push({
                id: `pois_${Math.random()}`,
                x: enemy.x,
                y: enemy.y - 12,
                text: `${poisDmg}`,
                color: '#a855f7',
                fontSize: 11,
                alpha: 0.9,
                life: 0.45,
              });
            }
          }

          const isChilled = enemy.freezeDuration > 0;
          if (isChilled) {
            enemy.freezeDuration -= dt;
          }

          const currentSpeed = isChilled ? enemy.speed * 0.6 : enemy.speed;

          const dx = playerRef.current.x - enemy.x;
          const dy = playerRef.current.y - enemy.y;
          const distToPlayer = Math.hypot(dx, dy);

          // Melee Skeleton: march directly towards the player
          if (enemy.type === 'melee_skeleton') {
            if (distToPlayer > enemy.radius + playerRef.current.radius) {
              enemy.x += (dx / distToPlayer) * currentSpeed * dt;
              enemy.y += (dy / distToPlayer) * currentSpeed * dt;
            } else {
              // Contact damage
              enemy.currentCooldown -= dt;
              if (enemy.currentCooldown <= 0 && playerRef.current.invincibleTimer <= 0) {
                soundManager.playPlayerHurt();
                setPlayerStats((prev) => {
                  const newHp = Math.max(0, prev.hp - enemy.damage);
                  if (newHp <= 0) onGameOver(false);
                  return { ...prev, hp: newHp };
                });
                playerRef.current.invincibleTimer = 0.4;
                enemy.currentCooldown = enemy.attackCooldown;
              }
            }
          }

          // Ranged Goblin: maintain distance, aim, shoot red arrows
          else if (enemy.type === 'ranged_goblin') {
            enemy.currentCooldown -= dt;

            // Kite away if player is too close
            if (distToPlayer < 200) {
              enemy.x -= (dx / distToPlayer) * currentSpeed * dt;
              enemy.y -= (dy / distToPlayer) * currentSpeed * dt;
            } else if (distToPlayer > 360) {
              enemy.x += (dx / distToPlayer) * currentSpeed * dt;
              enemy.y += (dy / distToPlayer) * currentSpeed * dt;
            }

            // Shoot arrow when cooldown finishes
            if (enemy.currentCooldown <= 0) {
              const arrowAngle = Math.atan2(dy, dx);
              projectilesRef.current.push({
                id: `enm_arrow_${Math.random()}`,
                x: enemy.x + Math.cos(arrowAngle) * 20,
                y: enemy.y + Math.sin(arrowAngle) * 20,
                vx: Math.cos(arrowAngle) * 260,
                vy: Math.sin(arrowAngle) * 260,
                radius: 4,
                damage: enemy.damage,
                isCrit: false,
                source: 'enemy',
                color: '#ef4444',
                duration: 3.5,
                pierceRemaining: 0,
                bouncesRemaining: 0,
                ricochetsRemaining: 0,
              });
              enemy.currentCooldown = enemy.attackCooldown + Math.random() * 0.5;
            }
          }

          // Crimson Bat: swift erratic swooping
          else if (enemy.type === 'crimson_bat') {
            enemy.stateTimer += dt * 4;
            const wobbleX = Math.cos(enemy.stateTimer) * 50;
            const wobbleY = Math.sin(enemy.stateTimer) * 50;

            enemy.x += ((dx + wobbleX) / distToPlayer) * currentSpeed * dt;
            enemy.y += ((dy + wobbleY) / distToPlayer) * currentSpeed * dt;

            if (distToPlayer < enemy.radius + playerRef.current.radius) {
              enemy.currentCooldown -= dt;
              if (enemy.currentCooldown <= 0 && playerRef.current.invincibleTimer <= 0) {
                soundManager.playPlayerHurt();
                setPlayerStats((prev) => {
                  const newHp = Math.max(0, prev.hp - enemy.damage);
                  if (newHp <= 0) onGameOver(false);
                  return { ...prev, hp: newHp };
                });
                playerRef.current.invincibleTimer = 0.35;
                enemy.currentCooldown = enemy.attackCooldown;
              }
            }
          }

          // Boss Golem: 3 phases (Radial bullet hell, Slam, Charge)
          else if (enemy.type === 'boss_golem') {
            enemy.stateTimer += dt;
            enemy.currentCooldown -= dt;

            // Slowly advance toward player
            if (distToPlayer > 180) {
              enemy.x += (dx / distToPlayer) * currentSpeed * dt;
              enemy.y += (dy / distToPlayer) * currentSpeed * dt;
            }

            if (enemy.currentCooldown <= 0) {
              soundManager.playBossSlam();
              // Radial bullet burst (12 orbs around boss)
              const count = 12;
              for (let b = 0; b < count; b++) {
                const bAngle = (b / count) * Math.PI * 2 + (enemy.stateTimer % 1);
                projectilesRef.current.push({
                  id: `boss_orb_${Math.random()}`,
                  x: enemy.x,
                  y: enemy.y,
                  vx: Math.cos(bAngle) * 210,
                  vy: Math.sin(bAngle) * 210,
                  radius: 7,
                  damage: enemy.damage,
                  isCrit: false,
                  source: 'enemy',
                  color: '#fb923c',
                  duration: 4.0,
                  pierceRemaining: 0,
                  bouncesRemaining: 0,
                  ricochetsRemaining: 0,
                });
              }
              enemy.currentCooldown = enemy.attackCooldown;
            }

            // Contact damage with boss
            if (distToPlayer < enemy.radius + playerRef.current.radius) {
              if (playerRef.current.invincibleTimer <= 0) {
                soundManager.playPlayerHurt();
                setPlayerStats((prev) => {
                  const newHp = Math.max(0, prev.hp - enemy.damage * 0.8);
                  if (newHp <= 0) onGameOver(false);
                  return { ...prev, hp: newHp };
                });
                playerRef.current.invincibleTimer = 0.4;
              }
            }
          }

          // Collide enemy against obstacles (walls block all, water blocks ground enemies)
          obstaclesRef.current.forEach((obs) => {
            if (obs.type === 'crate' && (obs.hp ?? 1) <= 0) return;
            if (obs.type === 'water' && enemy.type === 'crimson_bat') return; // Bats fly over water!
            resolveCircleRectCollision(enemy, obs);
          });

          // Clamp inside arena bounds
          enemy.x = Math.max(bounds.x + enemy.radius, Math.min(bounds.x + bounds.width - enemy.radius, enemy.x));
          enemy.y = Math.max(bounds.y + enemy.radius, Math.min(bounds.y + bounds.height - enemy.radius, enemy.y));
        }

        // Update Boss HP in UI
        if (currentBoss) {
          setBossHp({
            current: Math.max(0, currentBoss.hp),
            max: currentBoss.maxHp,
            name: currentBoss.name,
          });
        } else {
          setBossHp(null);
        }

        // Check if all enemies in the room are dead
        const liveEnemiesCount = enemiesRef.current.filter((e) => e.hp > 0).length;
        if (liveEnemiesCount === 0 && roomEnemiesTotal.current > 0) {
          portalRef.current.active = true;
        }

        // -------------------------------------------------------------
        // 6. HEALTH HEARTS PICKUP
        // -------------------------------------------------------------
        for (let h = healthDropsRef.current.length - 1; h >= 0; h--) {
          const heart = healthDropsRef.current[h];
          heart.duration -= dt;
          if (heart.duration <= 0) {
            healthDropsRef.current.splice(h, 1);
            continue;
          }
          const dHeart = Math.hypot(playerRef.current.x - heart.x, playerRef.current.y - heart.y);
          if (dHeart < playerRef.current.radius + 18) {
            healthDropsRef.current.splice(h, 1);
            soundManager.playClick();
            setPlayerStats((prev) => ({
              ...prev,
              hp: Math.min(prev.maxHp, prev.hp + heart.healAmount),
            }));
            floatersRef.current.push({
              id: `heart_heal_${Math.random()}`,
              x: playerRef.current.x,
              y: playerRef.current.y - 20,
              text: `+${heart.healAmount} PV`,
              color: '#10b981',
              fontSize: 14,
              alpha: 1,
              life: 0.8,
            });
          }
        }

        // -------------------------------------------------------------
        // 7. ORBS COLLECTION & ARCHERO 2 XP MAGNETISM
        // -------------------------------------------------------------
        for (let o = expOrbsRef.current.length - 1; o >= 0; o--) {
          const orb = expOrbsRef.current[o];
          // Decay initial scatter speed
          orb.x += orb.vx * dt;
          orb.y += orb.vy * dt;
          orb.vx *= 0.88;
          orb.vy *= 0.88;

          const distToPlayer = Math.hypot(playerRef.current.x - orb.x, playerRef.current.y - orb.y);
          const magnetRadius = 140; // Magnetism threshold

          if (distToPlayer < magnetRadius) {
            // Accelerate towards player
            const magnetSpeed = 420;
            const dirX = (playerRef.current.x - orb.x) / distToPlayer;
            const dirY = (playerRef.current.y - orb.y) / distToPlayer;
            orb.x += dirX * magnetSpeed * dt;
            orb.y += dirY * magnetSpeed * dt;
          }

          // Collected by player
          if (distToPlayer < playerRef.current.radius + 12) {
            expOrbsRef.current.splice(o, 1);
            soundManager.playGemPickup(playerLevel);

            // Add XP and check Level-up threshold
            setCurrentExp((prevExp) => {
              const updated = prevExp + orb.value;
              if (updated >= expToNextLevel) {
                // Trigger 3-card Roguelike Draft Spin!
                const leftover = updated - expToNextLevel;
                const nextRequired = Math.round(expToNextLevel * 1.35);
                setExpToNextLevel(nextRequired);
                setPlayerLevel((lvl) => {
                  const newLvl = lvl + 1;
                  const draftCards = getRandomDraftSkills(3);
                  onLevelUp(draftCards, newLvl);
                  return newLvl;
                });
                return leftover;
              }
              return updated;
            });
          }
        }

        // -------------------------------------------------------------
        // 7B. GOLD COIN COLLECTION & MAGNETISM
        // -------------------------------------------------------------
        for (let c = coinDropsRef.current.length - 1; c >= 0; c--) {
          const coin = coinDropsRef.current[c];
          coin.x += coin.vx * dt;
          coin.y += coin.vy * dt;
          coin.vx *= 0.88;
          coin.vy *= 0.88;
          coin.rotation += dt * 5;
          coin.duration -= dt;
          if (coin.duration <= 0) {
            coinDropsRef.current.splice(c, 1);
            continue;
          }

          const distToPlayer = Math.hypot(playerRef.current.x - coin.x, playerRef.current.y - coin.y);
          const magnetRadius = 160;

          if (distToPlayer < magnetRadius) {
            const magnetSpeed = 460;
            const dirX = (playerRef.current.x - coin.x) / distToPlayer;
            const dirY = (playerRef.current.y - coin.y) / distToPlayer;
            coin.x += dirX * magnetSpeed * dt;
            coin.y += dirY * magnetSpeed * dt;
          }

          if (distToPlayer < playerRef.current.radius + 14) {
            coinDropsRef.current.splice(c, 1);
            soundManager.playCoin();
            if (onEarnCoins) {
              onEarnCoins(coin.value);
            }
            floatersRef.current.push({
              id: `coin_float_${Math.random()}`,
              x: playerRef.current.x + (Math.random() - 0.5) * 16,
              y: playerRef.current.y - 20,
              text: `+${coin.value} 🪙`,
              color: '#facc15',
              fontSize: 13,
              alpha: 1,
              life: 0.65,
            });
          }
        }

        // -------------------------------------------------------------
        // 8. PORTAL CHECK (Next Room Advancement)
        // -------------------------------------------------------------
        if (portalRef.current.active) {
          const dPortal = Math.hypot(
            playerRef.current.x - portalRef.current.x,
            playerRef.current.y - portalRef.current.y
          );
          if (dPortal < portalRef.current.radius + playerRef.current.radius - 8) {
            // Room clear coin bonus
            if (onEarnCoins) {
              onEarnCoins(20);
            }
            // Victory if room max completed!
            if (room >= maxRooms) {
              onGameOver(true);
            } else {
              soundManager.playLevelUp();
              setRoom((r) => r + 1);
            }
          }
        }

        // -------------------------------------------------------------
        // 9. PARTICLES & FLOATERS UPDATE
        // -------------------------------------------------------------
        for (let p = particlesRef.current.length - 1; p >= 0; p--) {
          const part = particlesRef.current[p];
          part.x += part.vx * dt;
          part.y += part.vy * dt;
          part.alpha -= part.decay * dt;
          if (part.alpha <= 0) {
            particlesRef.current.splice(p, 1);
          }
        }

        for (let f = floatersRef.current.length - 1; f >= 0; f--) {
          const fl = floatersRef.current[f];
          fl.y -= 35 * dt;
          fl.life -= dt;
          fl.alpha = Math.max(0, fl.life / 0.65);
          if (fl.life <= 0) {
            floatersRef.current.splice(f, 1);
          }
        }
      }

      // ===============================================================
      // RENDERING (HTML5 Canvas 2D)
      // ===============================================================
      const width = canvas.width;
      const height = canvas.height;
      const bounds = arenaBounds.current;

      // Dark dungeon background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw 2X Rectangular Arena Floor with Dynamic Camera Viewport
      ctx.save();
      ctx.translate(-Math.round(cameraRef.current.x), -Math.round(cameraRef.current.y));

      ctx.fillStyle = '#111827';
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

      // Floor grid tiles
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const tileSize = 50;
      for (let gx = bounds.x; gx <= bounds.x + bounds.width; gx += tileSize) {
        ctx.beginPath();
        ctx.moveTo(gx, bounds.y);
        ctx.lineTo(gx, bounds.y + bounds.height);
        ctx.stroke();
      }
      for (let gy = bounds.y; gy <= bounds.y + bounds.height; gy += tileSize) {
        ctx.beginPath();
        ctx.moveTo(bounds.x, gy);
        ctx.lineTo(bounds.x + bounds.width, gy);
        ctx.stroke();
      }

      // Arena Outer Wall Borders with massive stone brick style
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 10;
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 3;
      ctx.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10);

      // 2. Torches along the perimeter walls
      const torches = [
        { x: bounds.x + 30, y: bounds.y + 30 },
        { x: bounds.x + bounds.width / 2, y: bounds.y + 30 },
        { x: bounds.x + bounds.width - 30, y: bounds.y + 30 },
        { x: bounds.x + 30, y: bounds.y + bounds.height / 2 },
        { x: bounds.x + bounds.width - 30, y: bounds.y + bounds.height / 2 },
        { x: bounds.x + 30, y: bounds.y + bounds.height - 30 },
        { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height - 30 },
        { x: bounds.x + bounds.width - 30, y: bounds.y + bounds.height - 30 },
      ];
      torches.forEach((torch) => {
        const glowRadius = 65 + Math.sin(currentTime * 0.007 + torch.x) * 8;
        const grad = ctx.createRadialGradient(torch.x, torch.y, 4, torch.x, torch.y, glowRadius);
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
        grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(torch.x, torch.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#78350f';
        ctx.fillRect(torch.x - 3, torch.y - 3, 6, 14);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(torch.x, torch.y - 4, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Obstacles: WATER POOLS & STONE WALLS & CRATES
      // "qu'il y a des murs et de l eau nous ne pouvons ni traverser l eau ni tirer et passer par le murs"
      const crateImg = imagesRef.current['crate_small'];

      obstaclesRef.current.forEach((obs) => {
        if (obs.type === 'water') {
          // --- WATER POOL RENDERING ---
          ctx.save();
          // Deep water pool base
          const waterGrad = ctx.createLinearGradient(obs.x, obs.y, obs.x, obs.y + obs.height);
          waterGrad.addColorStop(0, '#0369a1');
          waterGrad.addColorStop(0.5, '#0284c7');
          waterGrad.addColorStop(1, '#075985');
          ctx.fillStyle = waterGrad;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

          // Shoreline rim (stones and wet sand)
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

          // Animated flowing sine ripples & caustics
          ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
          ctx.lineWidth = 1.5;
          const rippleCount = Math.max(2, Math.floor(obs.height / 28));
          for (let r = 1; r < rippleCount; r++) {
            const ry = obs.y + (obs.height / rippleCount) * r;
            const waveOffset = Math.sin(currentTime * 0.003 + r * 1.5) * 6;
            ctx.beginPath();
            ctx.moveTo(obs.x + 8, ry + waveOffset);
            ctx.bezierCurveTo(
              obs.x + obs.width * 0.35, ry - waveOffset,
              obs.x + obs.width * 0.65, ry + waveOffset,
              obs.x + obs.width - 8, ry - waveOffset
            );
            ctx.stroke();
          }

          // Water icon label
          ctx.fillStyle = 'rgba(186, 230, 253, 0.55)';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('EAU NATURELLE', obs.x + obs.width / 2, obs.y + obs.height / 2 + 3);
          ctx.restore();

        } else if (obs.type === 'wall') {
          // --- STONE WALL RENDERING ---
          ctx.save();
          // Drop shadow cast towards bottom
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fillRect(obs.x + 4, obs.y + obs.height, obs.width, 10);

          // Front darker face
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

          // 3D beveled top stone cap
          ctx.fillStyle = '#475569';
          ctx.fillRect(obs.x, obs.y, obs.width, Math.min(obs.height, 14));

          // Outer masonry stone border
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

          // Mortar brick incisions
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1.5;
          const brickW = 35;
          for (let bx = obs.x + brickW; bx < obs.x + obs.width; bx += brickW) {
            ctx.beginPath();
            ctx.moveTo(bx, obs.y);
            ctx.lineTo(bx, obs.y + obs.height);
            ctx.stroke();
          }

          // Top highlight
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(obs.x + 1, obs.y + 1);
          ctx.lineTo(obs.x + obs.width - 1, obs.y + 1);
          ctx.stroke();
          ctx.restore();

        } else {
          // --- CRATE RENDERING ---
          if ((obs.hp ?? 1) > 0) {
            if (crateImg && crateImg.complete && crateImg.naturalWidth > 0) {
              ctx.drawImage(crateImg, obs.x - 2, obs.y - 2, obs.width + 4, obs.height + 4);
            } else {
              ctx.fillStyle = '#78350f';
              ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
              ctx.strokeStyle = '#92400e';
              ctx.lineWidth = 2;
              ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
              ctx.fillStyle = '#451a03';
              ctx.fillRect(obs.x + 4, obs.y + 4, obs.width - 8, obs.height - 8);
            }
          }
        }
      });

      // 4. Portal (Exit to next room when cleared)
      if (portalRef.current.active) {
        const port = portalRef.current;
        const pulse = Math.sin(currentTime * 0.006) * 4;
        const portGrad = ctx.createRadialGradient(port.x, port.y, 5, port.x, port.y, port.radius + pulse);
        portGrad.addColorStop(0, '#fef08a');
        portGrad.addColorStop(0.5, '#f59e0b');
        portGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

        ctx.fillStyle = portGrad;
        ctx.beginPath();
        ctx.arc(port.x, port.y, port.radius + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(port.x, port.y, port.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PORTAIL', port.x, port.y - port.radius - 8);
      }

      // 5. Health Drops (Hearts)
      healthDropsRef.current.forEach((heart) => {
        ctx.save();
        ctx.translate(heart.x, heart.y);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(-4, -2, 6, 0, Math.PI * 2);
        ctx.arc(4, -2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-9, 0);
        ctx.lineTo(0, 9);
        ctx.lineTo(9, 0);
        ctx.fill();
        ctx.restore();
      });

      // 6. XP Orbs (Gems)
      expOrbsRef.current.forEach((orb) => {
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#a5f3fc';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 6B. Gold Coins Rendering (Spinning 3D Gold Coins)
      coinDropsRef.current.forEach((coin) => {
        ctx.save();
        ctx.translate(coin.x, coin.y);

        // Ground drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(0, 5, 5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3D spinning coin using scaleX
        const spin = Math.cos(coin.rotation);
        ctx.scale(spin, 1);

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner star emblem
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-1, -3, 2, 6);
        ctx.fillRect(-3, -1, 6, 2);

        ctx.restore();
      });

      // 7. Familiar Spirit (Companion)
      if (playerStats.hasFamiliar) {
        const famX = playerRef.current.x + Math.cos(familiarRef.current.angle) * 44;
        const famY = playerRef.current.y + Math.sin(familiarRef.current.angle) * 44;

        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(famX, famY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#f3e8ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(famX - 2, famY - 1, 2, 0, Math.PI * 2);
        ctx.arc(famX + 2, famY - 1, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 8. Enemies Rendering with Themed Top-Down Monster Skins
      enemiesRef.current.forEach((enemy) => {
        drawEnemyWithSkin({
          ctx,
          enemy,
          time: currentTime,
          playerX: playerRef.current.x,
          playerY: playerRef.current.y,
        });
      });

      // 9. Player Rendering (Top-Down Animated Hero Model)
      const p = playerRef.current;
      ctx.save();

      // Invincibility flashing
      if (p.invincibleTimer > 0 && Math.floor(currentTime / 50) % 2 === 0) {
        ctx.globalAlpha = 0.5;
      }

      // Aegis Shield aura
      if (playerStats.shieldActive && p.shieldTimer > 8.0) {
        ctx.save();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Draw authentic top-down hero model
      const blasterImg = imagesRef.current['blaster'];
      drawTopDownHero({
        ctx,
        x: p.x,
        y: p.y,
        angle: p.angle,
        walkCycle: p.walkFrame,
        character: selectedCharacter,
        blasterImg,
        time: currentTime,
        isMoving: p.isMoving,
        isFiring: p.shootCooldown > 0.05,
        scale: 1.15,
      });

      // Floating Overhead Player HP Bar
      const playerHpPercent = Math.max(0, playerStats.hp / playerStats.maxHp);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(p.x - 22, p.y - p.radius - 14, 44, 5);
      ctx.fillStyle = playerHpPercent > 0.4 ? '#10b981' : '#ef4444';
      ctx.fillRect(p.x - 22, p.y - p.radius - 14, 44 * playerHpPercent, 5);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x - 22, p.y - p.radius - 14, 44, 5);

      ctx.restore();

      // 10. Projectiles Rendering
      projectilesRef.current.forEach((proj) => {
        ctx.save();
        ctx.translate(proj.x, proj.y);
        const pAngle = Math.atan2(proj.vy, proj.vx);
        ctx.rotate(pAngle);

        if (proj.source === 'player') {
          // Arrow shaft
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-10, 0);
          ctx.lineTo(8, 0);
          ctx.stroke();

          // Arrow head (colored according to element or crit)
          ctx.fillStyle = proj.color;
          ctx.beginPath();
          ctx.moveTo(11, 0);
          ctx.lineTo(4, -4);
          ctx.lineTo(4, 4);
          ctx.closePath();
          ctx.fill();

          // Arrow feathers (fletching)
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-10, -3);
          ctx.lineTo(-7, 0);
          ctx.lineTo(-10, 3);
          ctx.stroke();
        } else {
          // Enemy projectile (glowing red / orange orb)
          ctx.fillStyle = proj.color;
          ctx.beginPath();
          ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.restore();
      });

      // 11. Particles Rendering
      particlesRef.current.forEach((part) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, part.alpha);
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 12. Floating Damage Numbers
      floatersRef.current.forEach((fl) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, fl.alpha);
        ctx.fillStyle = fl.color;
        ctx.font = `bold ${fl.fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText(fl.text, fl.x, fl.y);
        ctx.restore();
      });

      ctx.restore();

      // 13. SCREEN-SPACE HUD MINIMAP (For the 2X Large Arena)
      ctx.save();
      const mapW = 140;
      const mapH = 96;
      const mapX = width - mapW - 14;
      const mapY = 14;

      // Minimap card background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.84)';
      ctx.beginPath();
      ctx.roundRect(mapX, mapY, mapW, mapH, 10);
      ctx.fill();

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Title & Room label
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`SALLE ${room}/${maxRooms}`, mapX + 8, mapY + 12);

      // Map inner arena box
      const innerX = mapX + 6;
      const innerY = mapY + 16;
      const innerW = mapW - 12;
      const innerH = mapH - 22;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(innerX, innerY, innerW, innerH);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(innerX, innerY, innerW, innerH);

      const scaleX = innerW / bounds.width;
      const scaleY = innerH / bounds.height;

      // Draw obstacles on minimap
      obstaclesRef.current.forEach((obs) => {
        const ox = innerX + (obs.x - bounds.x) * scaleX;
        const oy = innerY + (obs.y - bounds.y) * scaleY;
        const ow = Math.max(2, obs.width * scaleX);
        const oh = Math.max(2, obs.height * scaleY);

        if (obs.type === 'water') {
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(ox, oy, ow, oh);
        } else if (obs.type === 'wall') {
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(ox, oy, ow, oh);
        }
      });

      // Draw Portal if active
      if (portalRef.current.active) {
        const px = innerX + (portalRef.current.x - bounds.x) * scaleX;
        const py = innerY + (portalRef.current.y - bounds.y) * scaleY;
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Enemies on minimap
      enemiesRef.current.forEach((en) => {
        if (en.hp <= 0) return;
        const ex = innerX + (en.x - bounds.x) * scaleX;
        const ey = innerY + (en.y - bounds.y) * scaleY;
        if (en.isBoss) {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Camera Viewport bounding box
      const camBoxX = innerX + (cameraRef.current.x - bounds.x) * scaleX;
      const camBoxY = innerY + (cameraRef.current.y - bounds.y) * scaleY;
      const camBoxW = width * scaleX;
      const camBoxH = height * scaleY;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.strokeRect(camBoxX, camBoxY, camBoxW, camBoxH);

      // Draw Player Dot
      const plx = innerX + (playerRef.current.x - bounds.x) * scaleX;
      const ply = innerY + (playerRef.current.y - bounds.y) * scaleY;
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(plx, ply, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing green radar ring
      const ringR = 4 + (Math.sin(currentTime * 0.008) + 1) * 2;
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(plx, ply, ringR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    isPaused,
    moveVector,
    playerStats,
    setPlayerStats,
    setScore,
    setEnemiesKilled,
    setGameTime,
    setBossHp,
    setCurrentExp,
    expToNextLevel,
    setExpToNextLevel,
    playerLevel,
    setPlayerLevel,
    onLevelUp,
    onGameOver,
    room,
    maxRooms,
    setRoom,
    activeBlaster,
    selectedCharacter,
  ]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
      <canvas
        ref={canvasRef}
        width={900}
        height={620}
        className="w-full h-full max-w-[960px] max-h-[660px] object-contain shadow-2xl rounded-xl border border-slate-800"
      />
    </div>
  );
};
