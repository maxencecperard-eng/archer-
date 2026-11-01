import { Enemy } from '../types/game';

interface EnemyRenderOptions {
  ctx: CanvasRenderingContext2D;
  enemy: Enemy;
  time: number;
  playerX: number;
  playerY: number;
}

export function drawEnemyWithSkin({
  ctx,
  enemy,
  time,
  playerX,
  playerY,
}: EnemyRenderOptions) {
  if (enemy.hp <= 0) return;

  const angleToPlayer = Math.atan2(playerY - enemy.y, playerX - enemy.x);
  const breath = Math.sin(time * 0.006 + enemy.x) * 1.5;

  ctx.save();
  ctx.translate(enemy.x, enemy.y);

  // 1. Elite Glowing Runic Aura under feet
  if (enemy.isElite) {
    const auraColor =
      enemy.eliteModifier === 'berserk'
        ? '#ef4444'
        : enemy.eliteModifier === 'armored'
        ? '#38bdf8'
        : enemy.eliteModifier === 'speed'
        ? '#facc15'
        : '#c084fc';

    ctx.save();
    ctx.strokeStyle = auraColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + 8, (time * 0.003) % (Math.PI * 2), (time * 0.003) % (Math.PI * 2) + Math.PI * 2);
    ctx.stroke();

    // Secondary pulsing aura ring
    const pulseRad = enemy.radius + 5 + Math.sin(time * 0.008) * 3;
    ctx.strokeStyle = auraColor + '60';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, pulseRad, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Elite crown badge
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    const modifierText =
      enemy.eliteModifier === 'berserk'
        ? '★ BERSERK'
        : enemy.eliteModifier === 'armored'
        ? '★ BLINDÉ'
        : enemy.eliteModifier === 'speed'
        ? '★ VÉLOCE'
        : '★ VAMPIRIQUE';
    ctx.fillText(modifierText, 0, -enemy.radius - 14);
  }

  // 2. Soft Ground Drop Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.ellipse(0, enemy.radius * 0.7, enemy.radius * 0.9, enemy.radius * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Render Distinct Monster Skin by Type
  switch (enemy.type) {
    case 'melee_skeleton':
      drawSkeletonWarrior(ctx, enemy, time, angleToPlayer);
      break;

    case 'ranged_goblin':
      drawGoblinArcher(ctx, enemy, time, angleToPlayer);
      break;

    case 'crimson_bat':
      drawCrimsonBat(ctx, enemy, time, angleToPlayer);
      break;

    case 'necromancer':
      drawNecromancer(ctx, enemy, time, angleToPlayer);
      break;

    case 'boss_golem':
      drawTitanGolem(ctx, enemy, time, angleToPlayer);
      break;

    default:
      drawDefaultMonster(ctx, enemy);
      break;
  }

  // 4. Status Effect Auras (Freeze, Poison, Burn)
  if (enemy.freezeDuration > 0) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
    // Ice crystals
    ctx.fillStyle = '#e0f2fe';
    for (let c = 0; c < 4; c++) {
      const a = (c * Math.PI) / 2;
      ctx.fillRect(Math.cos(a) * enemy.radius - 2, Math.sin(a) * enemy.radius - 2, 4, 4);
    }
  }

  if (enemy.poisonDuration > 0) {
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (enemy.burnDuration > 0) {
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius + 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 5. Overhead Enemy HP Bar
  const hpWidth = enemy.isBoss ? 74 : enemy.isElite ? 44 : 32;
  const hpHeight = enemy.isElite ? 5 : 4;
  const hpPercent = Math.max(0, enemy.hp / enemy.maxHp);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-hpWidth / 2, -enemy.radius - 9, hpWidth, hpHeight);

  ctx.fillStyle = enemy.isBoss
    ? '#f59e0b'
    : enemy.isElite
    ? '#f97316'
    : hpPercent > 0.4
    ? '#ef4444'
    : '#b91c1c';
  ctx.fillRect(-hpWidth / 2, -enemy.radius - 9, hpWidth * hpPercent, hpHeight);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(-hpWidth / 2, -enemy.radius - 9, hpWidth, hpHeight);

  ctx.restore();
}

/**
 * 1. Melee Skeleton: Bony skull with red eye sockets, iron armor, notched blade & wooden shield
 */
function drawSkeletonWarrior(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  time: number,
  aimAngle: number
) {
  const r = enemy.radius;
  const step = Math.sin(time * 0.008) * 3;

  // Bony feet
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.ellipse(-5, r * 0.6 + step, 3, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(5, r * 0.6 - step, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Torso Ribcage & Iron Breastplate
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(0, 2, r * 0.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Ribs
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.2;
  [-2, 1, 4].forEach((ry) => {
    ctx.beginPath();
    ctx.moveTo(-5, ry);
    ctx.lineTo(5, ry);
    ctx.stroke();
  });

  // Skull Head
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.arc(0, -r * 0.35, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Sunken eye sockets with red flame pinpricks
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-3, -r * 0.35, 2, 0, Math.PI * 2);
  ctx.arc(3, -r * 0.35, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(-3, -r * 0.35, 1, 0, Math.PI * 2);
  ctx.arc(3, -r * 0.35, 1, 0, Math.PI * 2);
  ctx.fill();

  // Horned Iron Helmet
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(0, -r * 0.45, r * 0.55, Math.PI, Math.PI * 2);
  ctx.fill();

  // Weapons attached to hands
  ctx.save();
  ctx.rotate(aimAngle);

  // Right Hand: Iron Cleaver Sword
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(r * 0.5, -4);
  ctx.lineTo(r + 10, -5);
  ctx.lineTo(r + 12, -2);
  ctx.lineTo(r * 0.5, -2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Left Hand: Wooden Shield with Iron Rim
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(r * 0.4, 8, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(r * 0.4 - 1.5, 8 - 1.5, 3, 3);

  ctx.restore();
}

/**
 * 2. Ranged Goblin: Pointed ears, leather rogue hood, aimed recurve bow/crossbow
 */
function drawGoblinArcher(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  time: number,
  aimAngle: number
) {
  const r = enemy.radius;

  // Green Goblin Torso & Leather Tunic
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(0, 2, r * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Leather Vest
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(0, 3, r * 0.5, 0, Math.PI * 2);
  ctx.fill();

  // Quiver on back with arrows
  ctx.save();
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-r * 0.8, -r * 0.3, 5, 12);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(-r * 0.8 + 1, -r * 0.3 - 4, 3, 4);
  ctx.restore();

  // Goblin Head
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(0, -r * 0.3, r * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Big Pointed Goblin Ears
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.moveTo(-r * 0.4, -r * 0.3);
  ctx.lineTo(-r * 0.95, -r * 0.6);
  ctx.lineTo(-r * 0.3, -r * 0.1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(r * 0.4, -r * 0.3);
  ctx.lineTo(r * 0.95, -r * 0.6);
  ctx.lineTo(r * 0.3, -r * 0.1);
  ctx.fill();

  // Rogue Cowl / Hood
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.arc(0, -r * 0.4, r * 0.55, Math.PI * 0.8, Math.PI * 2.2);
  ctx.fill();

  // Glowing Yellow Mischievous Eyes
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(-3, -r * 0.3, 2, 0, Math.PI * 2);
  ctx.arc(3, -r * 0.3, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-2.5, -r * 0.3, 1, 0, Math.PI * 2);
  ctx.arc(3.5, -r * 0.3, 1, 0, Math.PI * 2);
  ctx.fill();

  // Aimed Crossbow / Blaster in hands
  ctx.save();
  ctx.rotate(aimAngle);
  ctx.fillStyle = '#92400e';
  ctx.fillRect(4, -3, 15, 6);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(8, -1.5, 12, 3);
  // Crossbow bow arms
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(14, -8);
  ctx.lineTo(17, 0);
  ctx.lineTo(14, 8);
  ctx.stroke();
  ctx.restore();
}

/**
 * 3. Crimson Bat: Flapping wings, fangs, fanged snout
 */
function drawCrimsonBat(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  time: number,
  aimAngle: number
) {
  const r = enemy.radius;
  const flap = Math.sin(time * 0.018) * 8;

  // Bat Body
  ctx.fillStyle = '#881337';
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.65, r * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4c0519';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Dual Flapping Wings
  ctx.fillStyle = '#9f1239';
  // Left wing
  ctx.beginPath();
  ctx.moveTo(-r * 0.3, -2);
  ctx.quadraticCurveTo(-r * 1.2, -r * 0.8 + flap, -r * 1.8, flap);
  ctx.quadraticCurveTo(-r * 1.2, r * 0.6 + flap, -r * 0.3, 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4c0519';
  ctx.stroke();

  // Right wing
  ctx.beginPath();
  ctx.moveTo(r * 0.3, -2);
  ctx.quadraticCurveTo(r * 1.2, -r * 0.8 + flap, r * 1.8, flap);
  ctx.quadraticCurveTo(r * 1.2, r * 0.6 + flap, r * 0.3, 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4c0519';
  ctx.stroke();

  // Bat Ears
  ctx.fillStyle = '#be123c';
  ctx.beginPath();
  ctx.moveTo(-5, -r * 0.6);
  ctx.lineTo(-8, -r * 1.2);
  ctx.lineTo(-2, -r * 0.7);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(5, -r * 0.6);
  ctx.lineTo(8, -r * 1.2);
  ctx.lineTo(2, -r * 0.7);
  ctx.fill();

  // Glowing red eyes & fangs
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(-3, -r * 0.3, 1.8, 0, Math.PI * 2);
  ctx.arc(3, -r * 0.3, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // White fangs
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(-2.5, 0);
  ctx.lineTo(-1.5, 3);
  ctx.lineTo(-0.5, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0.5, 0);
  ctx.lineTo(1.5, 3);
  ctx.lineTo(2.5, 0);
  ctx.fill();
}

/**
 * 4. Necromancer: Levitating purple robes, floating dark skull staff, soul-fire
 */
function drawNecromancer(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  time: number,
  aimAngle: number
) {
  const r = enemy.radius;
  const hover = Math.sin(time * 0.005) * 3;

  ctx.save();
  ctx.translate(0, hover);

  // Levitating tattered robe (Flowing tentacles/tail at bottom)
  ctx.fillStyle = '#3b0764';
  ctx.beginPath();
  ctx.moveTo(-r * 0.7, -r * 0.2);
  ctx.lineTo(-r * 0.8, r * 0.8);
  ctx.quadraticCurveTo(0, r * 1.1 + Math.sin(time * 0.008) * 3, r * 0.8, r * 0.8);
  ctx.lineTo(r * 0.7, -r * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#581c87';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Deep shadow hood void
  ctx.fillStyle = '#090514';
  ctx.beginPath();
  ctx.arc(0, -r * 0.35, r * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Hood outer cowl
  ctx.strokeStyle = '#7e22ce';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, -r * 0.35, r * 0.55, Math.PI * 0.7, Math.PI * 2.3);
  ctx.stroke();

  // Glowing Magenta Occult Eyes
  ctx.fillStyle = '#d946ef';
  ctx.beginPath();
  ctx.arc(-3, -r * 0.35, 2, 0, Math.PI * 2);
  ctx.arc(3, -r * 0.35, 2, 0, Math.PI * 2);
  ctx.fill();

  // Floating Occult Skull / Soul Staff Orbiting
  const staffAngle = time * 0.003;
  const sx = Math.cos(staffAngle) * (r + 8);
  const sy = Math.sin(staffAngle) * (r * 0.6);

  // Dark orb on staff
  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f0abfc';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Soul-fire spark
  ctx.fillStyle = '#fdf4ff';
  ctx.beginPath();
  ctx.arc(sx, sy, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * 5. Titan Golem: Massive craggy stone armor, glowing lava core, spiked fists
 */
function drawTitanGolem(
  ctx: CanvasRenderingContext2D,
  enemy: Enemy,
  time: number,
  aimAngle: number
) {
  const r = enemy.radius;
  const rumble = Math.sin(time * 0.007) * 1.5;

  // Heavy craggy stone torso
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Molten Magma Veins running across plates
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-r * 0.6, -r * 0.4);
  ctx.lineTo(-r * 0.2, 0);
  ctx.lineTo(-r * 0.4, r * 0.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(r * 0.6, -r * 0.3);
  ctx.lineTo(r * 0.2, 0);
  ctx.lineTo(r * 0.5, r * 0.6);
  ctx.stroke();

  // Glowing Core in Center of Chest
  const corePulse = 6 + Math.sin(time * 0.009) * 2;
  const coreGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, corePulse);
  coreGrad.addColorStop(0, '#ffffff');
  coreGrad.addColorStop(0.4, '#fde047');
  coreGrad.addColorStop(1, '#ea580c');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, corePulse, 0, Math.PI * 2);
  ctx.fill();

  // Giant Spiked Stone Fists
  ctx.save();
  ctx.rotate(aimAngle);

  // Left Fist
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(r * 0.7, -r * 0.65 + rumble, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Right Fist
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(r * 0.7, r * 0.65 - rumble, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

function drawDefaultMonster(ctx: CanvasRenderingContext2D, enemy: Enemy) {
  ctx.fillStyle = enemy.color;
  ctx.beginPath();
  ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.stroke();
}
