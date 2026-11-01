# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# ARCHERO 2 - ROGUE ARCHER ARENA

---

## 1. RÉSUMÉ EXÉCUTIF & VISION PRODUIT

### 1.1. Informations Générales
- **Nom du Produit :** Archero 2 - Rogue Archer Arena
- **Genre :** Action Roguelite Top-Down / Auto-Shooter Twin-Stick
- **Plateformes Cibles :** Web Desktop & Mobile (iOS / Android Web Responsive)
- **Framerate Cible :** 60 FPS constant (HTML5 Canvas 2D / WebGL)
- **Durée Moyenne d'une Session :** 6 à 10 minutes par run

### 1.2. Vision Produit
Offrir une expérience de combat ultra-nerveuse, lisible et gratifiante dans une arène de donjon fermée. Le jeu repose sur la boucle de tension signature d'Archero : **l'arbitrage permanent entre le déplacement (nécessaire à l'esquive des tirs ennemis) et l'immobilité (nécessaire au déclenchement des tirs de l'archer)**.

Chaque run met au défi le joueur de progresser à travers 10 salles générées procéduralement, de collecter les orbes d'expérience au péril de ses points de vie, et de bâtir des synergies dévastatrices à chaque tirage de compétences.

### 1.3. Piliers Fondamentaux de Game Design (Core Pillars)
1. **Game Feel "Zéro Latence" :** Réactivité instantanée des inputs (tactile ou clavier), arrêts francs sans glissement excessif, feedbacks d'impact percutants (flash blanc, chiffres de dégâts flottants, tremblement d'écran sur coup critique).
2. **Mécanique Stutter-Step :** Bouger pour survivre, s'arrêter pour anéantir. L'auto-lock intelligent élimine la friction de la visée manuelle pour focaliser l'attention du joueur sur l'esquive spatiale.
3. **Synergies Roguelike Émergentes :** Découverte de combinaisons spectaculaires de compétences (ex: *Flèches Diagonales + Rebond Mural + Ricochet + Brûlure*).
4. **Lisibilité Visuelle Maximale :** Contraste net entre les projectiles alliés (cyan, or) et ennemis (rouge vif, orange magma), avec télégraphie visuelle des attaques lourdes.

---

## 2. PROMPT DE RÉFÉRENCE (OPTIMIZED SPEC PROMPT)

> Ce prompt a été calibré pour encapsuler l'intégralité du brief fonctionnel sous une forme directement exploitable par des moteurs d'ingénierie logicielle ou des modèles de génération de code :

\`\`\`markdown
Tu es un Game Designer et Lead Developer expert en jeux d'action Roguelite (type Archero 2, Brotato). 
Développe une application de jeu de tir et d'action top-down en 60 FPS s'inspirant fidèlement d'Archero 2, comprenant :

1. MÉCANIQUE FONDAMENTALE DE COMBAT ("STUTTER-STEP") :
   - Contrôles hybrides : Joystick virtuel flottant (tactile/souris) et clavier (ZQSD / WASD / Touches directionnelles).
   - Règle d'or "Move or Shoot" : Dès que le joueur s'arrête de courir, l'archer pivote instantanément vers la cible la plus proche et décoche des salves de flèches cadencées. Tout déplacement annule l'attaque pour esquiver les projectiles ennemis.
   - Feedback sensoriel : Traînées de flèches, étincelles d'impact, recul léger, tremblement d'écran sur coup critique et chiffres de dégâts flottants colorés.

2. ARÈNE FERMÉE & BESTIAIRE PROCÉDURAL :
   - Salle rectangulaire fermée avec obstacles destructibles (pots/caisses lâchant des cœurs de soin).
   - Monstres de corps-à-corps (Squelettes) : Poursuite directe et dégâts de contact.
   - Monstres à distance (Gobelins Archers) : Maintien de distance de sécurité, faisceau de visée rouge télégraphié, tir de flèches esquivables.
   - Monstres volants rapides (Chauves-souris) : Déplacements sinusoïdaux et ruées soudaines.
   - Boss de Palier (Titan Golem / Dragon) : Barre de PV de boss, ondes de choc telluriques, spirales de projectiles ("bullet-hell") et charges.

3. ORBES D'EXPÉRIENCE & SYSTÈME D'EXP PROCÉDURAL :
   - À chaque élimination, des orbes d'XP luminescents jaillissent au sol.
   - Magnétisme fluide : Dès que le joueur s'approche à moins de 140px, les orbes accélèrent vers lui.
   - Jauge d'XP supérieure (Archero HUD) : Affiche en temps réel le nombre d'orbes actuels vs le nombre requis pour le palier suivant (formule exponentielle).

4. ÉVÉNEMENT "SPIN & DRAFT DE 3 CAPACITÉS" :
   - Dès que la jauge d'XP est pleine, le temps se met en pause avec un effet de roulement (spin slot).
   - Le joueur choisit 1 capacité parmi 3 cartes aléatoires tirées selon des raretés pondérées (Commun, Rare, Épique, Légendaire).
   - Pool de compétences Archero 2 : Flèche frontale +1, Tir multiple (Multishot), Flèches diagonales/latérales/arrières, Rebond mural (Bouncing Wall), Ricochet entre ennemis, Tir perforant (Piercing), Effets élémentaires cumulatifs (Flamme, Glace, Foudre, Poison), Soif de sang (Vampirisme), Familier volant d'appui, Bouclier d'Égide.

5. SYSTÈME DE SANTÉ & HUD ÉPURÉ :
   - Barre de PV flottante au-dessus de l'archer et jauge supérieure avec décompte numérique exact (ex: 850 / 1000 PV).
   - Indicateur de progression de salle (ex: "Salle 3/10"), compteur d'ennemis vaincus, score et portail de téléportation doré s'activant une fois la salle nettoyée.
\`\`\`

---

## 3. BOUCLE DE GAMEPLAY (CORE GAMEPLAY LOOP)

### 3.1. Diagramme de Flux
\`\`\`
  ┌─────────────────────────────────────────────────────────────┐
  │                 1. ENTRÉE DANS LA SALLE N                  │
  │     (Spawn joueur au bas de la salle, monstres en haut)     │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │              2. COMBAT EN TEMPS RÉEL (STUTTER-STEP)         │
  │   - Déplacement continu pour esquiver tirs & corps-à-corps │
  │   - Arrêt bref pour auto-lock et salve de flèches           │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │               3. DROP ET COLLECTE D'ORBES D'XP              │
  │   - Monstres éliminés lâchent 2 à 15 orbes luminescents     │
  │   - Attraction magnétique dès proximité (< 140 px)          │
  │   - Jauge d'XP supérieure se remplit en direct              │
  └──────────────────────────────┬──────────────────────────────┘
                                 │
               ┌─────────────────┴─────────────────┐
               │ Jauge d'orbes pleine ?           │
               ├─────────────────┬─────────────────┤
             [OUI]             [NON]               │
               │                 │                 │
               ▼                 │                 ▼
  ┌─────────────────────────┐    │   ┌─────────────────────────┐
  │ 4. SPIN & DRAFT ROGUELIKE│   │   │ Poursuite du combat     │
  │ - Pause du jeu          │    │   │ jusqu'au dernier monstre│
  │ - Tirage de 3 cartes    │    │   └────────────┬────────────┘
  │ - Choix d'une capacité  │    │                │
  └────────────┬────────────┘    │                │
               │                 │                │
               └─────────────────┼────────────────┘
                                 │
                                 ▼
  ┌─────────────────────────────────────────────────────────────┐
  │                5. NETTOYAGE & PORTAIL DORÉ                  │
  │    - Ouverture du portail de sortie au mur nord             │
  │    - Franchissement du portail ──► Salle N+1                │
  │    - Si Salle 10 complétée ──► Écran de Victoire Épique     │
  └─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 4. SPÉCIFICATIONS DES MÉCANIQUES DE COMBAT

### 4.1. Schéma de Contrôles Hybrides
- **Joystick Virtuel Flottant (Touch & Drag) :**
  - S'initialise à l'endroit précis du contact (touchstart / pointerdown).
  - Rayon maximal du manche : 55 pixels.
  - Calcul de vecteur normalisé $(\vec{u}_x, \vec{u}_y)$ avec zone morte de 15% pour éviter les micro-saccades.
- **Clavier Physique (Desktop) :**
  - Prise en charge combinée de `ZQSD`, `WASD` et des touches `Flèches`.
  - Normalisation diagonale : division par $\sqrt{2}$ pour empêcher le déplacement à $141\%$ de la vitesse en diagonale.
- **Vitesse de déplacement joueur :** 220 px/s de base.

### 4.2. Mécanique de Tir à l'Arrêt ("Stutter-Step")
- **Détection d'état :** Si la vitesse du joueur est nulle ($\|\vec{v}\| \le 0.1$), le joueur entre en état `Attacking`.
- **Ciblage Automatique :**
  1. Rayon de détection : 480 px.
  2. Priorité 1 : Ennemi vivant le plus proche spatialement.
  3. Priorité 2 : En cas d'équidistance, ennemi avec le pourcentage de PV le plus bas.
- **Orientation :** L'archer pivote instantanément vers l'angle $\theta = \text{atan2}(y_{cible} - y_{joueur}, x_{cible} - x_{joueur})$.
- **Cadence de Tir :** $1.8 \text{ tir/sec}$ de base ($t_{recharge} \approx 0.55\text{s}$), modifiée par le perk *Cadence Furieuse*.

### 4.3. Système de Points de Vie (PV) & Dégâts
- **PV Max Initial :** 1 000 PV.
- **Invulnérabilité temporaire (I-Frames) :** 0.40s de clignotement après chaque coup reçu pour éviter les one-shots consécutifs.
- **Calcul des Dégâts Infligés :**
  $$\text{Dégât Final} = \text{Round}\left(\text{BaseDamage} \times \text{DamageMultipliers} \times (\text{IsCrit} \ ? \ \text{CritMultiplier} : 1.0)\right)$$
- **Taux de Critique Initial :** 15% de chances, multiplicateur de $1.75\times$.

---

## 5. SYSTÈME D'EXPÉRIENCE & ÉVÉNEMENT "SPIN / DRAFT"

### 5.1. Orbes d'Expérience (XP Orbs)
- À l'élimination d'une unité, 2 à 4 orbes (15 pour un Boss) sont éjectés avec une impulsion radiale aléatoire ($30\text{ à }90\text{ px/s}$).
- **Physique Magnétique :**
  - Rayon d'aspiration : 140 px.
  - Formule d'accélération d'aspiration : $\vec{v}_{orb} = \vec{u}_{vers\_joueur} \times 420\text{ px/s}$.
- **Formule de progression de niveau :**
  $$\text{Orbes Requis}(Niveau) = 100 \times (1.35)^{Niveau - 1}$$

### 5.2. Événement "Spin & Draft 3 Capacités"
Dès que la jauge d'orbes atteint le seuil requis :
1. Le moteur de jeu se met en pause immédiate.
2. Déclenchement d'une animation sonore et visuelle de roulement (spin) révélant 3 cartes.
3. Tirage pondéré selon la table de probabilités :
   - **Commun :** 50%
   - **Rare :** 30%
   - **Épique :** 15%
   - **Légendaire :** 5%
4. Le joueur valide son choix par clic ou appui sur les touches `[1]`, `[2]`, `[3]`.
5. Application instantanée de l'effet sur les stats du joueur et reprise de la partie.

---

## 6. CATALOGUE DES COMPÉTENCES & MATRICE DE SYNERGIES

| ID Perk | Nom FR | Rareté | Catégorie | Effet Technique | Synergie Clé |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `front_arrow` | Flèche Frontale +1 | Épique | Projectile | `projectileCount += 1` | Dégâts doublés sur cible unique |
| `multishot` | Tir Multiple Rafale | Légendaire | Projectile | Déclenche 1 salve consécutive | Démultiplie tous les procs élémentaires |
| `diagonal_arrows` | Flèches Diagonales | Rare | Projectile | +2 flèches à $\pm 37^\circ$ | Dévastateur au contact ("Shotgun") |
| `side_arrows` | Flèches Latérales | Commun | Projectile | +2 flèches à $\pm 90^\circ$ | Efficace lors d'encerclRow |
| `rear_arrow` | Flèche Arrière | Commun | Projectile | +1 flèche à $180^\circ$ | Permet de kiter en marche arrière |
| `bouncing_wall` | Rebond Mural | Épique | Projectile | Rebondit 2 fois sur les murs | Saturation de la pièce avec Diagonales |
| `ricochet` | Ricochet d'Ennemis | Légendaire | Projectile | Rebondit vers 2 monstres proches | Nettoyage instantané des vagues denses |
| `piercing` | Tir Perforant | Rare | Projectile | Traverse jusqu'à 2 monstres | Synergie absolue avec Rebond Mural |
| `blaze` | Flamme Ardente | Rare | Élémentaire | Applique 3.5s de brûlure continue | DPS constant sur les Boss |
| `frost` | Froid Polaire | Rare | Élémentaire | Ralentit la vitesse ennemie de 40% | Kiting et esquive facilités |
| `bolt` | Éclair Foudroyant | Épique | Élémentaire | Arc électrique en chaîne (170px) | Dispersion de dégâts instantanée |
| `poison` | Venin Toxique | Commun | Élémentaire | Poison permanent jusqu'à la mort | Dégâts résiduels garantis |
| `bloodthirst` | Soif de Sang | Épique | Utilitaire | Soigne 4% des PV max par élimination | Survie quasi-infinie en arène |
| `spirit_familiar` | Familier Esprit | Épique | Utilitaire | Invoque un familier qui auto-tire | Dégâts passifs continus en mouvement |
| `shield_guard` | Bouclier d'Égide | Épique | Défense | Bloque 1 coup toutes les 8 secondes | Annule les erreurs d'esquive |
| `max_hp_boost` | Vitalité Suprême | Commun | Défense | +35% de PV max et soin immédiat | Tanking des attaques de boss |
| `attack_boost` | Bonus d'Attaque | Commun | Attaque | +30% de dégâts bruts | Multiplicateur global |
| `attack_speed` | Cadence Furieuse | Rare | Attaque | +25% de vitesse de tir | Réduit la durée du stutter-step |
| `crit_master` | Maître Critique | Rare | Attaque | +20% taux crit, +50% multiplicateur | Bursts de dégâts majeurs |
| `giant` | Forme de Colosse | Épique | Attaque | +40% dégâts, projectiles plus larges | Hitbox de projectiles augmentée |

---

## 7. BESTIAIRE & INTELLIGENCE ARTIFICIELLE DES MONSTRES

### 7.1. Squelette Guerrier (Corps-à-Corps)
- **Vitesse :** 110 à 150 px/s (progresse avec les salles).
- **IA :** Poursuit sans détour la position du joueur.
- **Attaque :** Inflige 65 à 120 dégâts au contact toutes les secondes.

### 7.2. Gobelin Archer (Distance)
- **Vitesse :** 95 px/s.
- **IA :** Maintient une distance de sécurité idéale entre 200px et 360px. Fuit si le joueur approche.
- **Attaque :** Marque un temps d'arrêt, télégraphie son tir avec visée axiale, puis décoche une flèche rouge rectiligne (260 px/s).

### 7.3. Chauve-Souris Pourpre (Volante & Rapide)
- **Vitesse :** 155 px/s.
- **IA :** Déplacement sinusoïdal oscillant avec accélérations soudaines.

### 7.4. Boss Golem Ancien / Titan Démon (Salles 5 et 10)
- **Points de Vie :** 7 500 PV (Salle 5) à 15 000 PV (Salle 10).
- **Patterns de combat :**
  1. *Éruption Radiale (Bullet Hell) :* Décharge 12 à 16 orbes de feu à 360° forçant le joueur à trouver les angles d'esquive.
  2. *Frappe Tellurique (Ground Slam) :* Onde de choc avec rumble sonore au sol.
  3. *Charge Titanesque :* Rapprochement soutenu vers le joueur.

---

## 8. SPÉCIFICATIONS TECHNIQUES & ARCHITECTURE LOGICIELLE

### 8.1. Stack Technique
- **Framework :** React 19 + TypeScript + Vite.
- **Styling :** Tailwind CSS v4.
- **Moteur de Simulation :** HTML5 Canvas 2D avec boucle `requestAnimationFrame` et delta-time clamping ($\Delta t \le 0.1\text{s}$) pour un rendu 60 FPS ultra-stable.
- **Synthétiseur Audio :** Module Web Audio API pur (zéro fichier audio externe téléchargé, zéro temps de chargement, synthèse en temps réel des fréquences, clics, chimes et explosions).

### 8.2. Découpage Modulaire du Code
- `/src/types/game.ts` : Typages TypeScript stricts pour entités, projectiles, compétences et états.
- `/src/audio/soundManager.ts` : Moteur audio procédural (tirs, impacts critiques, orbes XP, fanfares).
- `/src/data/skills.ts` : Définition des compétences, raretés, pondérations et modificateurs de stats.
- `/src/components/GameCanvas.tsx` : Moteur de rendu Canvas 2D, boucle de physique, collisions et IA.
- `/src/components/VirtualJoystick.tsx` : Contrôleur tactile 360° fluide.
- `/src/components/GameHUD.tsx` : Affichage de la jauge d'orbes, des PV et des indicateurs de salle.
- `/src/components/SkillDraftModal.tsx` : Interface modale du tirage à 3 cartes avec raccourcis clavier.
- `/src/components/GameOverModal.tsx` : Écran récapitulatif de fin de partie avec statistiques complètes.
- `/src/components/PRDViewer.tsx` : Visualiseur interactif du PRD et du prompt dans l'application.

---

## 9. ROSTER DES 12 HÉROS & SYSTÈMES D'ARMES SCI-FI

| Héros | Titre & Classe | Arme par Défaut | PV Base | DMG | Passif Inné Signature |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Atreus** | L'Archer Éclaireur | Blaster-A | 1000 | 95 | *Pas de l'Ombre* : +15% Vitesse de course & premier tir instantané |
| **Valkyrie** | La Tireuse Spectre (Sniper) | Blaster-B | 850 | 125 | *Visée Fatale* : +35% Crit, +75% Dégâts Crit & Flèches Perforantes |
| **Phœnix** | L'Artilleur des Flammes | Blaster-D | 1100 | 115 | *Fournaise Perpétuelle* : Projectiles enflammés avec DPS continu |
| **Thorval** | Le Colosse d'Acier (Tank) | Blaster-R | 1500 | 130 | *Bastion d'Égide* : 1500 PV & Bouclier périodique absorbant 1 coup |
| **Nyx** | L'Assassine Venimeuse | Blaster-E | 900 | 85 | *Venin Neurotoxique* : +35% Cadence de tir & Poison virulent |
| **Zephyr** | L'Électromancien | Blaster-C | 920 | 105 | *Arc Électrique* : Choc foudroyant sautant entre les ennemis proches |
| **Sylvanas** | La Gardienne Boréale | Blaster-N | 960 | 100 | *Frimas Polaire* : Gèle et ralentit la vitesse ennemie de 40% |
| **Balthazar** | Le Maître Artificier | Blaster-F | 1200 | 145 | *Calibre Titan* : +45% Dégâts bruts & fort recul sur impact |
| **Aria** | La Voix des Âmes (Invocatrice) | Blaster-G | 950 | 90 | *Lien Spirituel* : Commence avec un Familier Esprit autonome |
| **Drakar** | Le Maraudeur Sanguinaire | Blaster-H | 1050 | 110 | *Pacte de Sang* : Soif de sang régénérant 4% des PV max par kill |
| **Cyborg-X** | Le Prototype Oméga | Blaster-Q | 1000 | 85 | *Tir en Salve Rafale* : Tir Multiple (Multishot) inné permanent |
| **Ignis** | L'Éclaireur de Magma | Blaster-K | 980 | 100 | *Sillage Brûlant* : +20% Vitesse de course & flèches incendiaires |

---

## 10. SYSTÈME DE NIVEAUX PROGRESSIFS & ÉCHELLES DE DIFFICULTÉ

### 10.1. Trois Modes de Difficulté Sélectables
1. **Aventurier (Normal) : 10 Salles**
   - Multiplicateur Score : **1.0x**
   - Équilibrage standard pour appréhender les synergies et le stutter-step.
   - Boss : Golem Ancien (Salle 5), Titan Démon (Salle 10).
2. **Champion (Héroïque) : 15 Salles**
   - Multiplicateur Score : **1.6x**
   - Escalade : +40% PV & dégâts monstres, ennemis Élites dès la Salle 3.
   - Boss : Golem Ancien (Salle 5), Titan Démon (Salle 10), Seigneur Nécromancien (Salle 15).
3. **Cauchemar (Enfer) : 20 Salles**
   - Multiplicateur Score : **2.5x**
   - Escalade : +90% PV, +25% vitesse monstre, tir rapide des ennemis, jusqu'à 50% de monstres Élites.
   - Boss : Golem (Salle 5), Titan Démon (Salle 10), Nécromancien (Salle 15), Avatar du Néant (Salle 20).

### 10.2. Monstres Élites & Affixes Aléatoires
Dès la Salle 3, certains monstres apparaissent avec une aura pulsante colorée et un affixe redoutable :
- **Berserk (Aura Rouge)** : +45% de dégâts, cadence d'attaque accélérée de 30%.
- **Cuirassé (Aura Bleutée/Grise)** : +100% de PV, résistance accrue.
- **Vampirique / Toxique (Aura Violette)** : Poison résiduel sur impact et régénération.
- **Speed (Aura Jaune)** : +40% de vitesse de poursuite.
- *Récompense* : Vaincre un Élite octroie le triple d'orbes d'XP et une chance accrue de cœurs de soin.

---

## 11. CRITÈRES D'ACCEPTATION (DEFINITION OF DONE)

- [x] L'archer se contrôle sans friction au tactile (joystick) et au clavier (ZQSD / Flèches).
- [x] L'archer tire automatiquement à l'arrêt et cesse instantanément dès qu'un déplacement reprend.
- [x] 12 héros jouables avec profils de stats et passifs innés uniques.
- [x] Sélecteur de difficulté (Normal 10 salles, Héroïque 15 salles, Enfer 20 salles) avec ajustement de la menace.
- [x] Ennemis Élites avec auras distinctes et affixes de combat.
- [x] Les monstres abattus libèrent des orbes d'XP qui sont attirés magnétiquement vers le joueur.
- [x] La jauge d'XP supérieure augmente en direct et déclenche la modale de tirage de 3 compétences.
- [x] Les compétences acquises se cumulent correctement (rebonds, multishot, éléments, soif de sang, familier).
- [x] Les barres de PV du joueur et des ennemis diminuent et affichent les chiffres de dégâts flottants.
- [x] Le portail doré de changement de salle s'ouvre dès que tous les monstres sont vaincus.
- [x] Boss massifs échelonnés (Salles 5, 10, 15, 20) avec jauges de boss dédiées.
- [x] Le fichier PRD complet est disponible et téléchargeable au format `.md` dans `/Instructions/PRD.md`.

