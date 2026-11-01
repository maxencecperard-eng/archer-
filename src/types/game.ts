export type SkillRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type SkillCategory = 'attack' | 'projectile' | 'defense' | 'utility' | 'elemental';

export interface Skill {
  id: string;
  name: string;
  nameFr: string;
  category: SkillCategory;
  rarity: SkillRarity;
  description: string;
  descriptionFr: string;
  icon: string; // Lucide icon name or emoji representation
  maxStacks?: number;
  effect: (player: PlayerStats) => void;
}

export interface PlayerStats {
  maxHp: number;
  hp: number;
  speed: number;
  baseDamage: number;
  attackSpeed: number; // Attacks per second
  attackRange: number;
  critChance: number; // 0 to 1
  critMultiplier: number; // 1.5 default
  defense: number;
  projectileSpeed: number;
  projectileCount: number; // Total front arrows
  diagonalArrows: number;
  sideArrows: number;
  rearArrows: number;
  bouncingWall: boolean;
  ricochet: boolean;
  ricochetBounces: number;
  piercing: boolean;
  piercingCount: number;
  poisonEffect: boolean;
  fireEffect: boolean;
  iceEffect: boolean;
  lightningEffect: boolean;
  vampirismPercent: number; // Life steal on kill
  shieldActive: boolean;
  shieldDuration: number;
  hasFamiliar: boolean;
  multishot: boolean; // Fires an additional volley in sequence
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
}

export type DifficultyMode = 'normal' | 'heroic' | 'hell';

export type EnemyType = 'melee_skeleton' | 'ranged_goblin' | 'crimson_bat' | 'necromancer' | 'boss_golem';

export interface Enemy extends Entity {
  type: EnemyType;
  name: string;
  speed: number;
  damage: number;
  color: string;
  attackCooldown: number;
  currentCooldown: number;
  state: 'idle' | 'charging' | 'attacking' | 'frozen' | 'stunned';
  stateTimer: number;
  burnDuration: number;
  poisonDuration: number;
  freezeDuration: number;
  experienceValue: number;
  isBoss?: boolean;
  isElite?: boolean;
  eliteModifier?: 'berserk' | 'armored' | 'vampiric' | 'speed';
  specialAttackTimer?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isCrit: boolean;
  source: 'player' | 'enemy' | 'familiar';
  color: string;
  duration: number; // Lifetime in seconds
  pierceRemaining: number;
  bouncesRemaining: number;
  ricochetsRemaining: number;
  hasBouncedWall?: boolean;
  elemental?: {
    fire?: boolean;
    ice?: boolean;
    poison?: boolean;
    lightning?: boolean;
  };
}

export interface ExpOrb {
  id: string;
  x: number;
  y: number;
  value: number;
  vx: number;
  vy: number;
  color: string;
  collected?: boolean;
}

export interface HealthDrop {
  id: string;
  x: number;
  y: number;
  healAmount: number;
  duration: number;
}

export interface CoinDrop {
  id: string;
  x: number;
  y: number;
  value: number;
  vx: number;
  vy: number;
  rotation: number;
  duration: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface DamageFloater {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  alpha: number;
  life: number;
}

export interface Familiar {
  x: number;
  y: number;
  angle: number;
  cooldown: number;
}

export type ObstacleType = 'crate' | 'wall' | 'water';

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: ObstacleType;
  destructible?: boolean;
  hp?: number;
}

export interface GameState {
  score: number;
  room: number;
  maxRooms: number;
  enemiesKilled: number;
  playerLevel: number;
  currentExp: number;
  expToNextLevel: number;
  isDraftingSkill: boolean;
  isGameOver: boolean;
  isVictory: boolean;
  isPaused: boolean;
  gameTime: number;
  draftOptions: Skill[];
  chosenSkills: { skill: Skill; count: number }[];
}
