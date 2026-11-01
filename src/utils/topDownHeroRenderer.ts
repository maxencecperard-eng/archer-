import { Character } from '../data/characters';

interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  angle: number;
  walkCycle: number;
  character: Character;
  blasterImg?: HTMLImageElement | null;
  time: number;
  isMoving?: boolean;
  isFiring?: boolean;
  scale?: number;
}

export function drawTopDownHero({
  ctx,
  x,
  y,
  angle,
  walkCycle,
  character,
  blasterImg,
  time,
  isMoving = false,
  isFiring = false,
  scale = 1.0,
}: RenderOptions) {
  const vis = character.visuals;
  const breath = Math.sin(time * 0.005) * 1.5;
  const walkOffset = isMoving ? Math.sin(walkCycle * 8) * 4 : 0;
  const walkStride = isMoving ? Math.cos(walkCycle * 8) * 6 : 0;

  ctx.save();
  ctx.translate(x, y + (isMoving ? Math.abs(walkOffset) * 0.5 : breath));
  ctx.scale(scale, scale);

  // 1. Soft Elliptical Ground Drop Shadow
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.beginPath();
  const shadowW = 20 + (isMoving ? 0 : breath * 0.5);
  const shadowH = 10;
  ctx.ellipse(0, 16, shadowW, shadowH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Elemental Aura under/around feet
  drawElementalAura(ctx, vis.auraType, time);

  // 3. Dual Boots (Walking Animation)
  ctx.save();
  ctx.fillStyle = '#1e293b';
  // Left boot
  ctx.beginPath();
  ctx.ellipse(-7, 14 + walkStride, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Right boot
  ctx.beginPath();
  ctx.ellipse(7, 14 - walkStride, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  // 4. Flowing Cape (Billowing in the wind)
  if (vis.capeColor) {
    ctx.save();
    const windWave = Math.sin(time * 0.007) * 4;
    ctx.fillStyle = vis.capeColor;
    ctx.beginPath();
    ctx.moveTo(-9, -2);
    ctx.quadraticCurveTo(-14 + windWave, 16, -6 + windWave, 22);
    ctx.quadraticCurveTo(0, 24 + Math.abs(windWave), 6 + windWave, 22);
    ctx.quadraticCurveTo(14 + windWave, 16, 9, -2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // 5. Torso & Armor Tunic
  ctx.save();
  // Main torso rounded body
  ctx.fillStyle = character.tunicColor;
  ctx.beginPath();
  ctx.ellipse(0, 4, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Chestplate / Harness
  ctx.fillStyle = character.accentColor;
  ctx.beginPath();
  ctx.ellipse(0, 3, 7, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Leather belt & gold buckle
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-10, 8, 20, 3);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-3, 7.5, 6, 4);
  ctx.restore();

  // 6. Left & Right Shoulder Pauldrons (Armor Pads)
  ctx.save();
  ctx.fillStyle = vis.shoulderPadColor;
  // Left pauldron
  ctx.beginPath();
  ctx.arc(-13, 1, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = character.accentColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Right pauldron
  ctx.beginPath();
  ctx.arc(13, 1, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = character.accentColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // 7. Head & Headgear / Hair / Visor (Looking Top-Down / Forward)
  ctx.save();
  // Base head skin
  ctx.fillStyle = vis.skinTone;
  ctx.beginPath();
  ctx.arc(0, -5, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Eyes facing towards angle slightly
  const eyeDx = Math.cos(angle) * 2;
  const eyeDy = Math.sin(angle) * 1.5;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-3.5 + eyeDx, -5 + eyeDy, 2.5, 2, 0, 0, Math.PI * 2);
  ctx.ellipse(3.5 + eyeDx, -5 + eyeDy, 2.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = vis.eyeColor;
  ctx.beginPath();
  ctx.arc(-3.5 + eyeDx * 1.3, -5 + eyeDy * 1.3, 1.4, 0, Math.PI * 2);
  ctx.arc(3.5 + eyeDx * 1.3, -5 + eyeDy * 1.3, 1.4, 0, Math.PI * 2);
  ctx.fill();

  // Specific Headgear / Hair according to style
  drawHeadgear(ctx, vis, character, time);
  ctx.restore();

  // 8. Arms and Equipped Blaster Weapon (Rotated towards aim angle)
  ctx.save();
  const recoilOffset = isFiring ? -3 : 0;
  ctx.rotate(angle);
  ctx.translate(recoilOffset, 0);

  // Left hand holding weapon grip
  ctx.fillStyle = vis.skinTone;
  ctx.beginPath();
  ctx.arc(4, -8, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Right hand holding weapon handle
  ctx.beginPath();
  ctx.arc(8, 6, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Draw blaster asset or procedural blaster
  if (blasterImg && blasterImg.complete && blasterImg.naturalWidth > 0) {
    ctx.drawImage(blasterImg, 4, -14, 28, 28);
  } else {
    // Procedural sci-fi blaster
    ctx.fillStyle = character.accentColor;
    ctx.fillRect(8, -4, 18, 8);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(10, -2, 18, 4);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(26, -3, 3, 6);
  }

  // Muzzle flash when firing
  if (isFiring) {
    const flashGrad = ctx.createRadialGradient(32, 0, 1, 32, 0, 14);
    flashGrad.addColorStop(0, '#ffffff');
    flashGrad.addColorStop(0.4, '#fde047');
    flashGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
    ctx.fillStyle = flashGrad;
    ctx.beginPath();
    ctx.arc(32, 0, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  ctx.restore();
}

function drawHeadgear(
  ctx: CanvasRenderingContext2D,
  vis: Character['visuals'],
  char: Character,
  time: number
) {
  switch (vis.hairStyle) {
    case 'hunter_hood': {
      // Archer hood covering back and sides
      ctx.fillStyle = char.tunicColor;
      ctx.beginPath();
      ctx.arc(0, -7, 11, Math.PI * 0.75, Math.PI * 2.25);
      ctx.lineTo(0, -17);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = char.accentColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Hood peak
      ctx.fillStyle = char.accentColor;
      ctx.beginPath();
      ctx.moveTo(-3, -15);
      ctx.lineTo(0, -19);
      ctx.lineTo(3, -15);
      ctx.fill();
      break;
    }

    case 'sniper_helm': {
      // Sleek assassin visor helmet
      ctx.fillStyle = '#3b0764';
      ctx.beginPath();
      ctx.arc(0, -6, 11, 0, Math.PI * 2);
      ctx.fill();
      // Glowing visor horizontal strip
      ctx.fillStyle = vis.eyeColor;
      ctx.fillRect(-7, -7, 14, 3.5);
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 1;
      ctx.strokeRect(-7, -7, 14, 3.5);
      break;
    }

    case 'flame_crest': {
      // Fiery spikes that flicker
      ctx.fillStyle = '#ea580c';
      const f1 = Math.sin(time * 0.01) * 2;
      const f2 = Math.cos(time * 0.012) * 2;
      ctx.beginPath();
      ctx.moveTo(-8, -9);
      ctx.lineTo(-4, -18 + f1);
      ctx.lineTo(0, -10);
      ctx.lineTo(4, -20 + f2);
      ctx.lineTo(8, -9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(-3, -10);
      ctx.lineTo(0, -16 + f1);
      ctx.lineTo(3, -10);
      ctx.fill();
      break;
    }

    case 'viking_helm': {
      // Iron helm with horns
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(0, -7, 10.5, Math.PI, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      // Brow band
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-9, -8, 18, 3.5);
      // Dual horns
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(-8, -8);
      ctx.quadraticCurveTo(-15, -12, -14, -18);
      ctx.quadraticCurveTo(-10, -12, -6, -10);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(8, -8);
      ctx.quadraticCurveTo(15, -12, 14, -18);
      ctx.quadraticCurveTo(10, -12, 6, -10);
      ctx.fill();
      break;
    }

    case 'shadow_mask': {
      // Ninja shadow mask & fluttering headband
      ctx.fillStyle = '#1e1b4b';
      ctx.beginPath();
      ctx.arc(0, -6, 11, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
      // Headband tails fluttering
      const flutter = Math.sin(time * 0.008) * 3;
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(8, -6);
      ctx.quadraticCurveTo(16, -4 + flutter, 22, -10 + flutter);
      ctx.stroke();
      break;
    }

    case 'storm_crown': {
      // Lightning crown
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.moveTo(-9, -7);
      ctx.lineTo(-7, -15);
      ctx.lineTo(-3, -9);
      ctx.lineTo(0, -18);
      ctx.lineTo(3, -9);
      ctx.lineTo(7, -15);
      ctx.lineTo(9, -7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -12, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'frost_circlet': {
      // Ice crystal circlet
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(0, -7, 10.5, Math.PI * 0.9, Math.PI * 2.1);
      ctx.fill();
      // Diamond ice crystals
      ctx.fillStyle = '#e0f2fe';
      [-5, 0, 5].forEach((cx) => {
        ctx.beginPath();
        ctx.moveTo(cx, -16);
        ctx.lineTo(cx + 2.5, -11);
        ctx.lineTo(cx, -6);
        ctx.lineTo(cx - 2.5, -11);
        ctx.closePath();
        ctx.fill();
      });
      break;
    }

    case 'heavy_beret': {
      // Commando beret tilted to right
      ctx.fillStyle = '#9f1239';
      ctx.beginPath();
      ctx.ellipse(3, -11, 10, 5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Gold emblem
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(-2, -9, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'mystic_veil': {
      // Glowing astral veil and halo
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, -16, 12, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(0, -7, 10, Math.PI, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'demon_horns': {
      // Crimson demon horns
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(-6, -7);
      ctx.quadraticCurveTo(-14, -14, -13, -21);
      ctx.quadraticCurveTo(-7, -16, -3, -10);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(6, -7);
      ctx.quadraticCurveTo(14, -14, 13, -21);
      ctx.quadraticCurveTo(7, -16, 3, -10);
      ctx.fill();
      break;
    }

    case 'cyber_optic': {
      // High-tech cyber skull plate
      ctx.fillStyle = '#0f766e';
      ctx.fillRect(-8, -14, 16, 6);
      ctx.fillStyle = '#2dd4bf';
      ctx.fillRect(-7, -10, 14, 2);
      // Single glowing cyber eye scanner
      const scanX = Math.sin(time * 0.008) * 4;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(scanX, -9, 1.8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'magma_horns': {
      // Molten magma spikes
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(-7, -7);
      ctx.lineTo(-12, -18);
      ctx.lineTo(-4, -10);
      ctx.lineTo(0, -20);
      ctx.lineTo(4, -10);
      ctx.lineTo(12, -18);
      ctx.lineTo(7, -7);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;
    }
  }
}

function drawElementalAura(
  ctx: CanvasRenderingContext2D,
  aura: Character['visuals']['auraType'],
  time: number
) {
  const count = 5;
  for (let i = 0; i < count; i++) {
    const orbAngle = time * 0.003 + (i * Math.PI * 2) / count;
    const orbRadius = 24 + Math.sin(time * 0.005 + i) * 3;
    const ox = Math.cos(orbAngle) * orbRadius;
    const oy = Math.sin(orbAngle) * (orbRadius * 0.6) + 6;

    let color = 'rgba(16, 185, 129, 0.4)';
    let size = 3;

    switch (aura) {
      case 'fire':
      case 'lava':
        color = i % 2 === 0 ? 'rgba(249, 115, 22, 0.7)' : 'rgba(251, 191, 36, 0.6)';
        size = 3.5;
        break;
      case 'frost':
        color = 'rgba(56, 189, 248, 0.65)';
        size = 3;
        break;
      case 'lightning':
        color = 'rgba(250, 204, 21, 0.8)';
        size = 3;
        break;
      case 'poison':
        color = 'rgba(168, 85, 247, 0.65)';
        size = 3.2;
        break;
      case 'blood':
        color = 'rgba(239, 68, 68, 0.7)';
        size = 3.5;
        break;
      case 'neon':
        color = 'rgba(45, 212, 191, 0.7)';
        size = 2.8;
        break;
      case 'astral':
        color = 'rgba(244, 114, 182, 0.75)';
        size = 3.2;
        break;
      case 'void':
        color = 'rgba(139, 92, 246, 0.7)';
        size = 3.2;
        break;
      case 'shield':
        color = 'rgba(6, 182, 212, 0.6)';
        size = 3.5;
        break;
      default:
        color = 'rgba(52, 211, 153, 0.5)';
        size = 2.5;
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(ox, oy, size, 0, Math.PI * 2);
    ctx.fill();
  }
}
