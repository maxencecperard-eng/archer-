import { Skill } from '../types/game';

export const ALL_SKILLS: Skill[] = [
  {
    id: 'front_arrow',
    name: 'Front Arrow +1',
    nameFr: 'Flèche Frontale +1',
    category: 'projectile',
    rarity: 'epic',
    description: 'Fires an additional arrow in front of you.',
    descriptionFr: 'Tire une flèche supplémentaire vers l\'avant.',
    icon: 'ArrowUp',
    effect: (p) => {
      p.projectileCount += 1;
    },
  },
  {
    id: 'multishot',
    name: 'Multishot',
    nameFr: 'Tir Multiple en Rafale',
    category: 'projectile',
    rarity: 'legendary',
    description: 'Fires a rapid secondary volley of all your arrows.',
    descriptionFr: 'Déclenche une deuxième salve immédiate de toutes vos flèches.',
    icon: 'Layers',
    effect: (p) => {
      p.multishot = true;
    },
  },
  {
    id: 'diagonal_arrows',
    name: 'Diagonal Arrows',
    nameFr: 'Flèches Diagonales',
    category: 'projectile',
    rarity: 'rare',
    description: 'Fires 2 additional arrows at forward angles.',
    descriptionFr: 'Projette 2 flèches supplémentaires en angle diagonal.',
    icon: 'Split',
    effect: (p) => {
      p.diagonalArrows += 2;
    },
  },
  {
    id: 'side_arrows',
    name: 'Side Arrows',
    nameFr: 'Flèches Latérales',
    category: 'projectile',
    rarity: 'common',
    description: 'Fires 2 arrows to your left and right.',
    descriptionFr: 'Projette 2 flèches perpendiculaires sur vos flancs.',
    icon: 'ArrowLeftRight',
    effect: (p) => {
      p.sideArrows += 2;
    },
  },
  {
    id: 'rear_arrow',
    name: 'Rear Arrow',
    nameFr: 'Flèche Arrière',
    category: 'projectile',
    rarity: 'common',
    description: 'Fires an arrow directly behind you.',
    descriptionFr: 'Projette une flèche directement dans votre dos.',
    icon: 'ArrowDown',
    effect: (p) => {
      p.rearArrows += 1;
    },
  },
  {
    id: 'ricochet',
    name: 'Ricochet',
    nameFr: 'Ricochet d\'Ennemis',
    category: 'projectile',
    rarity: 'legendary',
    description: 'Arrows bounce from one enemy to another nearby.',
    descriptionFr: 'Les flèches bondissent d\'un monstre à un autre à l\'impact.',
    icon: 'CornerUpRight',
    effect: (p) => {
      p.ricochet = true;
      p.ricochetBounces += 2;
    },
  },
  {
    id: 'bouncing_wall',
    name: 'Bouncing Wall',
    nameFr: 'Rebond Mural',
    category: 'projectile',
    rarity: 'epic',
    description: 'Arrows bounce off the rectangular arena walls.',
    descriptionFr: 'Vos flèches ricochent énergiquement contre les murs de l\'arène.',
    icon: 'Repeat',
    effect: (p) => {
      p.bouncingWall = true;
    },
  },
  {
    id: 'piercing',
    name: 'Piercing Shot',
    nameFr: 'Tir Perforant',
    category: 'projectile',
    rarity: 'rare',
    description: 'Arrows pierce through monsters, hitting multiple enemies in a line.',
    descriptionFr: 'Vos flèches traversent les corps des monstres alignés.',
    icon: 'ChevronsRight',
    effect: (p) => {
      p.piercing = true;
      p.piercingCount += 2;
    },
  },
  {
    id: 'blaze',
    name: 'Blaze Strike',
    nameFr: 'Flamme Ardente',
    category: 'elemental',
    rarity: 'rare',
    description: 'Arrows ignite targets dealing intense fire damage over time.',
    descriptionFr: 'Enflamme les cibles en infligeant des dégâts de feu continus.',
    icon: 'Flame',
    effect: (p) => {
      p.fireEffect = true;
    },
  },
  {
    id: 'frost',
    name: 'Frost Strike',
    nameFr: 'Froid Polaire',
    category: 'elemental',
    rarity: 'rare',
    description: 'Arrows chill monsters, slowing movement speed by 40%.',
    descriptionFr: 'Ralentit drastiquement la vitesse de déplacement des ennemis.',
    icon: 'Snowflake',
    effect: (p) => {
      p.iceEffect = true;
    },
  },
  {
    id: 'bolt',
    name: 'Bolt Strike',
    nameFr: 'Éclair Foudroyant',
    category: 'elemental',
    rarity: 'epic',
    description: 'Critical or on-hit shockwaves jump between packed foes.',
    descriptionFr: 'Déclenche un arc électrique foudroyant entre monstres proches.',
    icon: 'Zap',
    effect: (p) => {
      p.lightningEffect = true;
    },
  },
  {
    id: 'poison',
    name: 'Poison Touch',
    nameFr: 'Venin Toxique',
    category: 'elemental',
    rarity: 'common',
    description: 'Infects monsters with toxic venom lasting until death.',
    descriptionFr: 'Empoisonne la cible jusqu\'à son trépas avec dégâts constants.',
    icon: 'Biohazard',
    effect: (p) => {
      p.poisonEffect = true;
    },
  },
  {
    id: 'bloodthirst',
    name: 'Bloodthirst',
    nameFr: 'Soif de Sang',
    category: 'utility',
    rarity: 'epic',
    description: 'Restores 4% of Max HP whenever you slay any monster.',
    descriptionFr: 'Restaure 4% de vos points de vie à chaque ennemi abattu.',
    icon: 'HeartPulse',
    effect: (p) => {
      p.vampirismPercent += 4;
    },
  },
  {
    id: 'attack_boost',
    name: 'Attack Boost Major',
    nameFr: 'Bonus d\'Attaque Majeur',
    category: 'attack',
    rarity: 'common',
    description: 'Increases raw arrow damage by +30%.',
    descriptionFr: 'Augmente la puissance de frappe de toutes vos flèches de +30%.',
    icon: 'Sword',
    effect: (p) => {
      p.baseDamage = Math.round(p.baseDamage * 1.3);
    },
  },
  {
    id: 'attack_speed',
    name: 'Attack Speed Boost',
    nameFr: 'Cadence Furieuse',
    category: 'attack',
    rarity: 'rare',
    description: 'Increases arrow release rate by +25%.',
    descriptionFr: 'Augmente la vitesse de tir de vos salves d\'archer de +25%.',
    icon: 'Gauge',
    effect: (p) => {
      p.attackSpeed = Number((p.attackSpeed * 1.25).toFixed(2));
    },
  },
  {
    id: 'crit_master',
    name: 'Crit Master',
    nameFr: 'Maître Critique',
    category: 'attack',
    rarity: 'rare',
    description: 'Increases Crit Chance by +20% and Crit Damage by +50%.',
    descriptionFr: '+20% de chances de coup critique et +50% de dégâts critiques.',
    icon: 'Target',
    effect: (p) => {
      p.critChance = Math.min(1, p.critChance + 0.2);
      p.critMultiplier += 0.5;
    },
  },
  {
    id: 'giant',
    name: 'Giant Form',
    nameFr: 'Forme de Colosse',
    category: 'attack',
    rarity: 'epic',
    description: 'Increases body size, arrow size, and grants +40% damage.',
    descriptionFr: 'Grossit vos flèches géantes et confère +40% de dégâts massifs.',
    icon: 'Maximize2',
    effect: (p) => {
      p.baseDamage = Math.round(p.baseDamage * 1.4);
    },
  },
  {
    id: 'spirit_familiar',
    name: 'Spirit Familiar',
    nameFr: 'Familier Esprit Ardent',
    category: 'utility',
    rarity: 'epic',
    description: 'Summons a hovering spirit that shoots auto-targeting magical orbs.',
    descriptionFr: 'Invoque un familier flottant tirant automatiquement sur les cibles.',
    icon: 'Ghost',
    effect: (p) => {
      p.hasFamiliar = true;
    },
  },
  {
    id: 'shield_guard',
    name: 'Aegis Shield',
    nameFr: 'Bouclier d\'Égide',
    category: 'defense',
    rarity: 'epic',
    description: 'Grants an energy barrier that absorbs incoming monster hits periodically.',
    descriptionFr: 'Octroie un bouclier divin annulant périodiquement les dégâts reçus.',
    icon: 'ShieldCheck',
    effect: (p) => {
      p.shieldActive = true;
    },
  },
  {
    id: 'max_hp_boost',
    name: 'Max HP Boost',
    nameFr: 'Colosse Vital (+PV)',
    category: 'defense',
    rarity: 'common',
    description: 'Increases maximum HP by +35% and immediately restores health.',
    descriptionFr: 'Augmente vos PV maximums de +35% et soigne immédiatement.',
    icon: 'HeartHandshake',
    effect: (p) => {
      const added = Math.round(p.maxHp * 0.35);
      p.maxHp += added;
      p.hp = Math.min(p.maxHp, p.hp + added);
    },
  },
];

export function getRandomDraftSkills(count = 3, existingSkills: { id: string }[] = []): Skill[] {
  // Filter skills that shouldn't be duplicated too many times or keep a healthy random distribution
  const pool = [...ALL_SKILLS];
  const shuffled = pool.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
