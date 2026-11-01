export const ENHANCED_PROMPT = `
### 🏹 PROMPT OPTIMISÉ POUR DÉVELOPPER UN JEU ARCHERO 2 (ROGUELIKE TOP-DOWN ACTION)

Tu es un développeur expert de jeux vidéo spécialisé dans les moteurs Web/React/Canvas et le game design de Rogue-lite d'action (comme Archero 2, Brotato et Vampire Survivors). 

Développe un jeu de tir et d'action top-down dynamique en 60 FPS s'inspirant fidèlement des mécaniques d'Archero 2, comprenant :

1. 🎮 **MÉCANIQUE FONDAMENTALE DE COMBAT ("STUTTER-STEP") :**
   - **Déplacement :** Contrôle fluide au Joystick virtuel (tactile/souris) et au clavier (ZQSD / WASD / Flèches).
   - **Tir automatique à l'arrêt ("Move or Shoot") :** Dès que le joueur s'arrête de bouger, le personnage pivote instantanément vers l'ennemi le plus proche ou prioritaire dans sa portée et décoche des salves de flèches avec cadence de tir cadencée. Bouger interrompt le tir pour esquiver les projectiles ennemis.
   - **Trajectoires & Feedback :** Flèches vives avec traînées lumineuses, étincelles d'impact, tremblement d'écran (screen shake) léger sur coup critique et chiffres de dégâts flottants colorés.

2. 👾 **BESTIAIRE D'ENNEMIS & PATTERNS D'ATTAQUE (SALLE RECTANGULAIRE) :**
   - **Squelettes Guerriers (Corps-à-corps) :** Poursuivent le joueur avec une vitesse variable et infligent des dégâts de contact avec effet de recul.
   - **Gobelins Archers (Distance) :** Maintiennent une distance de sécurité, arment leur arc (indicateur visuel de visée rouge) et tirent des flèches rectilignes esquivables.
   - **Chauves-souris Pourpres (Volantes/Erratiques) :** Déplacements en zig-zags rapides traversant les petits obstacles.
   - **Nécromancien / Mage Démon :** Lance des orbes magiques sombres téléguidées ou fait apparaître des vagues de sbires.
   - **Boss de Palier (Titan Golem / Dragon de Feu) :** Boss colossal doté d'une barre de vie segmentée, d'ondes de choc de frappe au sol, et de spirales de projectiles ("bullet-hell").

3. 🔮 **SYSTÈME DE PROGRESSION ROGUELIKE & ORBES D'XP :**
   - **Loot d'Orbes d'XP :** Chaque monstre vaincu libère des gemmes/orbes énergétiques scintillantes qui restent au sol.
   - **Magnétisme :** Lorsque le joueur s'en approche, les orbes s'accélèrent vers lui de manière fluide avec une courbe d'accélération attractive.
   - **Jauge d'XP Supérieure (Archero HUD) :** Une jauge en haut de l'écran se remplit progressivement avec le nombre d'orbes requis pour le niveau suivant (valeur exponentielle n * 1.4).
   - **Événement "Spin & Draft 3 Capacités" :** Lorsque la jauge est pleine, le jeu se met en pause avec un effet visuel de roulette/cartes dorées. Le joueur choisit 1 capacité parmi 3 cartes aléatoires tirées selon des probabilités de rareté (Commun, Rare, Épique, Légendaire).

4. ⚡ **ARBRE DE COMPÉTENCES & SYNERGIES PROCÉDURALES (COMPÉTENCES ARCHERO 2) :**
   - *Flèche frontale +1*, *Flèches diagonales*, *Flèches latérales*, *Flèche arrière*.
   - *Tir multiple (Multishot)* : Salve double successive.
   - *Rebond mural (Bouncing Wall)* : Les flèches ricocheront sur les murs de la salle rectangulaire.
   - *Ricochet d'ennemis* : Les flèches bondissent entre monstres groupés.
   - *Tir perforant (Piercing)* : Traverse les ennemis.
   - *Effets élémentaires cumulables* : Brûlure (DPS feu continu), Gel (ralentissement 40%), Éclair (arc électrique), Poison (dégâts durables).
   - *Soif de sang* : Récupération de points de vie par élimination.
   - *Familier volant* : Compagnon autonome attaquant les ennemis.

5. 💎 **SYSTÈMES DE JAUGE DE VIE & HUD :**
   - Barre de PV flottante au-dessus du héros et des monstres avec jauges bicolores, plus affichage numérique précis.
   - Indicateur de salle/vague en cours (ex: "Salle 4/10"), compteur de victimes, score de combo.
   - Écran de fin de run dynamique (Victoire / Défaite) avec récapitulatif complet des statistiques et des compétences sélectionnées.

6. 👥 **ROSTER DE 12 HÉROS & BLUSTERS PERSONNALISABLES :**
   - **Atreus** (Éclaireur polyvalent, premier tir instantané), **Valkyrie** (Sniper perforant, critiques mortels), **Phœnix** (Pyromancien, tirs de feu), **Thorval** (Juggernaut 1500 PV, bouclier d'égide), **Nyx** (Assassine rapide, venin virulent), **Zephyr** (Mage foudre, arcs de chaîne), **Sylvanas** (Rôdeuse polaire, gel et ralentissement), **Balthazar** (Canonnier titan, recul lourd), **Aria** (Invocatrice esprit, familier autonome), **Drakar** (Berserker vampire, soif de sang), **Cyborg-X** (Automate rafale, tir multiple), **Ignis** (Commando magma, sillage brûlant).

7. ⚔️ **SYSTÈME DE DIFFICULTÉ ÉVOLUTIF & ENNEMIS ÉLITES :**
   - **Mode Aventurier (Normal - 10 Salles) :** Progression équilibrée, Boss Golem (Salle 5) et Titan Démon (Salle 10).
   - **Mode Champion (Héroïque - 15 Salles) :** +40% PV & dégâts monstres, ennemis Élites (Berserk, Cuirassé, Speed) dès la salle 3, Boss Golem, Dragon et Nécromancien. Multiplicateur score 1.6x.
   - **Mode Cauchemar (Enfer - 20 Salles) :** +90% PV monstres, +25% vitesse, tirs frénétiques, vagues d'Élites à chaque salle, 4 Boss titanesques culminant avec l'Avatar du Néant (Salle 20). Multiplicateur score 2.5x.
`.trim();

export const PRD_MARKDOWN = `# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## PROJET : ARCHERO 2 - ROGUE ARCHER ARENA

---

### 1. INFORMATIONS GÉNÉRALES DU PRODUIT
- **Nom du Produit :** Archero 2 - Rogue Archer Arena
- **Genre :** Top-Down Action Roguelike / Twin-Stick Shoot'em Up sans visée manuelle
- **Plateforme cible :** Web Desktop & Mobile Responsive (HTML5 Canvas 60fps)
- **Modèle de jeu :** Sessions courtes et intenses avec 12 héros uniques, armurerie de 40 assets de blasters/munitions, et 3 modes de difficulté évolutive (Normal, Héroïque, Enfer).

---

### 2. VISION ET OBJECTIFS DU JEU
#### 2.1. Vision
Offrir une expérience de combat ultra-nerveuse et gratifiante dans une salle d'arène fermée, répliquant la dynamique culte d'Archero : **le dilemme perpétuel entre mouvement (pour esquiver) et immobilité (pour canarder)**. Le joueur choisit son héros parmi 12 combattants spécialisés, équipe son blaster favori, et affronte une escalade continue de monstres et d'élites avec des montées en niveau régulières.

#### 2.2. Piliers de Design (Design Pillars)
1. **Fluidité & "Game Feel" Immédiat :** Zéro friction. Prise en main instantanée au joystick tactile ou au clavier. Rendu fluide à 60 images par seconde avec feedbacks percutants (flash blanc, chiffres de dégâts, tremblement d'écran).
2. **Mécanique Stutter-Step :** Bouger pour survivre, s'arrêter pour anéantir. L'auto-lock intelligent permet au joueur de se concentrer sur son positionnement tactique.
3. **Satisfaction Roguelike & Synergies :** Chaque run est unique grâce au générateur aléatoire pondéré de cartes de compétences (Rebond mural + Ricochet + Flèches Diagonales + Feu + Foudre + Soif de Sang).
4. **Escalade Procédurale de Menace :** 3 modes de difficulté (Normal 10 salles, Héroïque 15 salles, Enfer 20 salles) et monstres Élites dotés d'auras et d'affixes spéciaux.

---

### 3. BOUCLE DE GAMEPLAY (CORE LOOP)
\`\`\`
[ Entrée dans la Salle ]
          │
          ▼
[ Esquive des assauts & Tir automatique à l'arrêt ]
          │
          ▼
[ Élimination des monstres & Apparition d'Orbes d'XP ]
          │
          ▼
[ Collecte des Orbes ───► Remplissage de la Jauge d'XP ]
          │                           │
          │                   [ Jauge Pleine ! ]
          │                           │
          │                           ▼
          │               [ Spin / Tirage de 3 Compétences ]
          │                           │
          │                           ▼
          │               [ Choix d'un Perk & Synergie ]
          │                           │
          ▼                           ▼
[ Nettoyage de la Salle ───► Portail vers Salle Suivante ]
          │
    (Salle 5 & 10)
          │
          ▼
  [ Combat de Boss Épique ]
\`\`\`

---

### 4. SPÉCIFICATIONS DES MÉCANIQUES DE COMBAT

#### 4.1. Déplacement & Contrôles
- **Joystick Flottant Virtuel :** S'active n'importe où sur l'écran tactile ou par clic gauche souris pour piloter le personnage à 360°.
- **Clavier physique :** Prise en charge des touches ZQSD / WASD / Touches Fléchées.
- **Vitesse de déplacement :** Base de 220 px/s, modulable via les modificateurs de perks.

#### 4.2. Système de Tir à l'Arrêt ("Stutter-Step")
- **Détection de l'arrêt :** Dès que le vecteur vitesse du joueur passe à 0 (ou inférieur à un seuil d'inertie), le délai de premier tir s'enclenche immédiatement.
- **Ciblage Automatique Prioritaire :**
  1. Ennemi le plus proche dans la ligne de vue.
  2. En cas d'égalité, cible l'ennemi ayant le moins de PV restants.
  3. L'archer pivote instantanément vers la cible sans bloquer les inputs.
- **Cadence de Tir :** 1.8 flèche/seconde de base, augmentable avec la stat *Attack Speed*.

#### 4.3. Système de Points de Vie (PV) & Dégâts
- **Joueur :** 1000 PV de base. Barre de vie flottante sous le personnage + jauge haute avec cœur et compteur numérique exact.
- **Invulnérabilité temporaire (I-Frames) :** 0.35s d'immunité après avoir subi un coup pour éviter les one-shots consécutifs.
- **Calcul des Dégâts :**
  $$\\text{Dégât Final} = (\\text{Dégât de Base} \\times \\text{Multiplicateur d'Attaque}) \\times (\\text{Critique ? } \\text{CritMultiplier} : 1)$$

---

### 5. PROGRESSION ROGUELIKE & GESTION DES ORBES

#### 5.1. Orbes d'Expérience (XP Gems)
- À la mort de chaque monstre, 1 à 4 orbes d'XP bleues/turquoises émergent avec une légère vélocité aléatoire d'explosion.
- **Rayon d'attraction magnétique :** 110 pixels autour du joueur. Dès qu'un orbe entre dans ce rayon, il accélère vers le joueur avec une physique d'interpellation exponentielle.
- **Courbe de Niveau :**
  $$\\text{XP Requis}(Niveau) = 100 \\times (1.35)^{Niveau - 1}$$

#### 5.2. Interface de Tirage "Spin & Draft 3 Compétences"
- Lorsque la barre d'orbes atteint 100%, le temps s'arrête (pause de simulation).
- Une animation élégante de roulement (Slot Spin) présente 3 cartes tirées aléatoirement dans le pool disponible.
- Chaque carte indique :
  - Nom officiel & Catégorie (Attaque, Projectile, Élémentaire, Utilitaire, Défense).
  - Badge de Rareté coloré (Gris: Commun, Bleu: Rare, Violet: Épique, Doré: Légendaire).
  - Icône stylisée et description claire de l'impact chiffré.
  - Clic ou raccourci clavier (1, 2, 3) pour valider le perk.

---

### 6. CATALOGUE DES COMPÉTENCES (TREE & SYNERGIES)

| ID Compétence | Nom Français | Rareté | Effet en Jeu | Synergie Remarquable |
| :--- | :--- | :--- | :--- | :--- |
| \`front_arrow\` | Flèche Frontale +1 | Épique | +1 flèche projetée vers l'avant | Dégâts bruts doublés sur cibles isolées |
| \`multishot\` | Tir Multiple Rafale | Légendaire | Déclenche une 2ème salve immédiate | Démultiplie les procs de poison et de feu |
| \`diagonal_arrows\` | Flèches Diagonales | Rare | +2 flèches en cône à 45° | Dévastateur au corps-à-corps ("Shotgun") |
| \`side_arrows\` | Flèches Latérales | Commun | +2 flèches à 90° gauche et droite | Utile dans les salles encerclées |
| \`rear_arrow\` | Flèche Arrière | Commun | +1 flèche à 180° derrière | Protection continue lors des kiting |
| \`bouncing_wall\` | Rebond Mural | Épique | Les flèches ricochent sur les murs | Remplit l'écran de flèches avec Diagonales |
| \`ricochet\` | Ricochet Ennemis | Légendaire | Les flèches sautent entre ennemis | Nettoyage instantané des vagues denses |
| \`piercing\` | Tir Perforant | Rare | Les flèches traversent les monstres | Synergie absolue avec Rebond Mural |
| \`blaze\` | Flamme Ardente | Rare | Brûlure élémentaire (DPS continu) | Efficace contre les boss à gros PV |
| \`frost\` | Froid Polaire | Rare | Ralentit la vitesse ennemie de 40% | Permet un kiting ultra-sécurisé |
| \`bolt\` | Éclair Foudroyant | Épique | Arc électrique sur les cibles proches | Propage les dégâts critiques en chaîne |
| \`bloodthirst\` | Soif de Sang | Épique | Soigne 4% des PV max par kill | Survie infinie dans les salles denses |
| \`spirit_familiar\` | Familier Esprit | Épique | Esprit loyal auto-attaquant | DPS passif permanent même en mouvement |
| \`shield_guard\` | Bouclier d'Égide | Épique | Barrière périodique anti-dégâts | Annule les erreurs de placement |

---

### 7. BESTIAIRE ET INTELLIGENCE ARTIFICIELLE

#### 7.1. Squelette d'Infanterie (Corps-à-corps)
- **Comportement :** Se déplace en ligne directe vers le joueur. Accélère légèrement quand il est à moins de 150px.
- **Attaque :** Coup de contact infligeant 120 dégâts.

#### 7.2. Gobelin Archer (Distance)
- **Comportement :** Maintient une distance optimale de 300px. Recule si le joueur approche trop.
- **Attaque :** Reste immobile pendant 0.7s (alerte visuelle avec ligne de visée), puis tire une flèche rectiligne à vitesse moyenne.

#### 7.3. Chauve-souris Pourpre (Volante & Rapide)
- **Comportement :** Mouvements sinusoïdaux rapides. Déclenche des ruées soudaines (dash).

#### 7.4. Nécromancien Maudit (Invocateur & Caster)
- **Comportement :** Reste en retrait, lance des orbes magiques téléguidées et invoque des mini-squelettes d'appui.

#### 7.5. Boss Golem de Pierre (Palier Vague 5 & 10)
- **Points de Vie :** 8 000 à 18 000 PV avec barre de vie titanesque en haut de l'écran.
- **Pattern 1 - Frappe tellurique :** Marque une zone rouge circulaire au sol qui explose après 1.2s en créant une onde de choc.
- **Pattern 2 - Éruption radiale (Bullet Hell) :** Projette 16 orbes de feu à 360° forçant le joueur à se faufiler entre les projectiles.
- **Pattern 3 - Charge frénétique :** S'élance à vive allure vers la position du joueur.

---

### 8. SPÉCIFICATIONS TECHNIQUES & ARCHITECTURE LOGICIELLE
- **Frontend Framework :** React 19 + TypeScript + Tailwind CSS v4.
- **Moteur Graphique :** HTML5 Canvas 2D avec boucle \`requestAnimationFrame\` cadencée à 60 FPS, interpolations temporelles delta-time.
- **Gestionnaire Audio :** Synthétiseur Web Audio API procédural (aucun fichier MP3/WAV externe requis, zéro latence, 100% autonome).
- **Gestion de l'État :** Architecture fonctionnelle pure avec machine à états propre (Menu, En Jeu, Draft de Compétences, Pause, Victoire, Défaite).

---

### 9. CRITÈRES D'ACCEPTATION (DEFINITION OF DONE)
- [x] Contrôle tactile (Joystick) et clavier (ZQSD/Flèches) opérationnels sans lag.
- [x] L'archer tire automatiquement dès l'arrêt et stoppe dès qu'il avance.
- [x] Les monstres lâchent des orbes magnétiques à leur mort.
- [x] La jauge d'XP supérieure déclenche l'écran de draft de 3 cartes à chaque niveau.
- [x] Les compétences sélectionnées s'appliquent en temps réel (ex: flèches multiples, rebonds, effets élémentaires).
- [x] Les PV du joueur et des ennemis diminuent et se mettent à jour avec animations et chiffres flottants.
- [x] Possibilité de basculer instantanément entre le jeu jouable et la documentation PRD / Prompt.
`;
