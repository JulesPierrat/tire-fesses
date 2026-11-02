# Choix techniques de Tire-Fesses

Ce document dit comment le jeu est fabriqué. Il complète la
[charte graphique](CHARTE.md) (l'apparence) et
[« Comment jouer »](COMMENT_JOUER.md) (les règles). Les choix ont été pris le
2 novembre 2026, avant la première ligne de code.

## Les choix

| | Choix | Pourquoi |
|---|---|---|
| Moteur | **Aucun** : on dessine nous-mêmes dans une toile (`<canvas>`) du navigateur | Le jeu est surtout de la logique (un graphe, des flux) sur une petite image de 720 × 450. Le code de la planche se reprend tel quel, et passer du jour à la nuit revient à changer de palette. Le jeu reste léger. |
| Langage | **TypeScript** | Du JavaScript qui vérifie les erreurs avant de lancer le jeu, utile dès que le graphe et les skieurs grossissent. |
| Outils | **Vite** (serveur local, fabrication), **Vitest** (tests de la logique), **Playwright** (tests dans un vrai navigateur, captures) | Simples, rapides, faits pour le web. |
| Machine | **Tout tourne dans Docker**, avec l'image `mcr.microsoft.com/playwright:v1.58.2-noble` (Node 24) | Pas de node sur la machine de développement ; une seule image pour tout. |
| Mise en ligne | **GitHub Pages**, à chaque fusion sur `main` ; **itch.io** plus tard, quand une carte sera jouable | Gratuit, le dépôt est déjà public, rien à faire à la main. |
| Téléphone | **Couché seulement** ; tenu debout, il affiche « Tournez votre téléphone pour jouer. » | Debout, une case ne ferait que 8 points : trop petit pour le doigt. |
| Sauvegarde | **Dans le navigateur** (`localStorage`) | Pas de serveur, pas de compte. |
| Police | **Pixelify Sans livrée avec le jeu** (paquet `@fontsource/pixelify-sans`) | Le jeu marche hors ligne et sur itch.io, sans appel à Google Fonts. |

## La logique d'un côté, le dessin de l'autre

Le code est rangé en quatre parties, dans `src/` :

| Dossier | Ce qu'il contient | A le droit de dessiner ? |
|---|---|---|
| `logique/` | le graphe, les pentes, les skieurs, l'argent, la saison | non |
| `dessin/` | les palettes, les dessins (cartes de lettres), le rendu de la carte | oui |
| `interface/` | l'écran, les gestes (souris et doigt), les boutons, le bandeau | oui |
| `cartes/` | les données de chaque carte | non |

La **logique** ne touche ni à la page ni à la toile. On peut donc la tester
seule, sans navigateur : « un débutant ne prend que des vertes », « ce tronçon
est rouge », « la file dépasse dix skieurs ».

Les noms du code sont en français, comme dans la planche (`piste`, `remontee`,
`skieur`, `pente`), sans accents.

### Les réglages au même endroit

Tous les chiffres du jeu sont dans un seul fichier, `src/logique/reglages.ts` :
les seuils de couleur, les avalanches, les prix, la durée d'une saison, les
trois nuits avant la faillite. Pour équilibrer le jeu, on ne change que ce
fichier.

Les premiers réglages viennent de la planche :

| Réglage | Valeur |
|---|---|
| Mètres par pixel (`MPX`) | 6 |
| Mètres par unité de hauteur (`HM`) | 650 |
| Fenêtre de mesure de la pente | 24 px, soit 144 m |
| Seuils de couleur (`SEUILS`) | 25 %, 40 %, 60 % |
| Avalanches | 60 % et plus |
| Jours par saison | 20 |
| Nuits dans le rouge avant la faillite | 3 |

## Le temps

- La logique avance par **pas fixes : 10 pas par seconde** de jeu.
  L'écran, lui, se redessine à chaque image du navigateur (60 par seconde),
  sans rien changer à la logique.
- **Accélérer**, c'est faire plus de pas par seconde. **La pause**, c'est n'en
  faire aucun. La nuit, la logique ne fait pas de pas : le temps est arrêté.
- **Tout le hasard part d'une graine**, avec le même générateur que la planche
  (`mulberry32`). La même graine et les mêmes actions donnent la même partie.
  Un bug se rejoue donc à l'identique, et un test peut simuler une journée
  entière.

## L'écran

- La carte se dessine dans un **tableau de pixels de 720 × 450**, une case du
  tableau par pixel du jeu, comme dans la planche.
- **L'agrandissement est un nombre entier, compté en vrais pixels de
  l'écran** (les points CSS multipliés par `devicePixelRatio`). C'est le plus
  grand entier qui fait tenir 720 × 450 dans la fenêtre, et au moins 1.
  Exemples : ×2 dans une fenêtre sur un écran de 1 920 × 1 080, ×3 sur un
  MacBook Air (écran Retina, deux vrais pixels par point), ×2 sur un téléphone
  couché.
- **La toile couvre toute la fenêtre et compte en vrais pixels.** Le jeu y
  recopie la carte agrandie, sans lissage, à une position entière. Poser la
  toile elle-même en CSS ne suffit pas : sur un téléphone à 2,625 vrais pixels
  par point, son bord tomberait entre deux pixels et la première colonne serait
  floue. La taille exacte vient de `devicePixelContentBoxSize` quand le
  navigateur la donne et qu'elle colle à `devicePixelRatio` (les écrans
  simulés la donnent fausse), sinon du calcul.
- Un test dans le navigateur le vérifie sur une capture : chaque pixel du jeu
  fait exactement e × e vrais pixels, sur ordinateur, sur Retina et sur
  téléphone.
- Le reste de la fenêtre est rempli à la couleur `encre` de la phase.
- **L'interface** (bandeau, boutons, bulles) est en HTML, posée par-dessus la
  carte, à la taille de l'écran : 24 px pour les titres, 16 px pour le texte,
  comme le dit la charte. Elle n'est pas agrandie avec la carte.
- **Les cartes plus grandes** que l'écran défilent sous une fenêtre de
  720 × 450. Le zoom change lui aussi d'un nombre entier.

## Les couleurs et les dessins

- Les palettes n'existent qu'une fois : `assets/palette/grand-beau.hex` et
  `assets/palette/grand-beau-nuit.hex`. Le jeu lit ces fichiers à la
  fabrication. Les noms des couleurs (`neige-0`, `piste-rouge`…) sont dans
  `src/dessin/palette.ts`, dans le même ordre. Un test vérifie qu'il y a bien
  32 couleurs de chaque côté, et qu'elles sont celles du tableau de la charte.
- Les dessins sont des **cartes de lettres**, comme dans la planche : une
  lettre = une couleur. Chaque dessin est préparé une fois avec la palette du
  jour, une fois avec celle de la nuit.

## Les cartes

Une carte est un fichier de données dans `src/cartes/` : son relief, ses nœuds
fixes (stations, sommets, points de vue) et ses emplacements à construire. Le
format exact sera fixé à l'étape 1, avec les Chocards.

## La sauvegarde

Une partie est enregistrée en JSON dans le `localStorage` du navigateur, une
entrée par carte, avec un numéro de version. Si une ancienne sauvegarde ne se
lit plus, le jeu le dit et propose de recommencer la carte.

## Les commandes

Tout passe par le script `./outils`, qui lance Docker :

| Commande | Ce qu'elle fait |
|---|---|
| `./outils installer` | installe les dépendances (`npm ci`) |
| `./outils lancer` | lance le jeu en local sur http://localhost:5173, qui se recharge à chaque changement |
| `./outils verifier` | vérifie les types et lance les tests de la logique |
| `./outils navigateur` | fabrique le jeu et le teste dans un vrai navigateur, sur ordinateur et sur téléphone |
| `./outils fabriquer` | fabrique la version à mettre en ligne, dans `dist/` |

## Mise en ligne et vérifications automatiques

- Sur chaque pull request, GitHub vérifie les types, lance tous les tests et
  fabrique le jeu. Une PR qui ne passe pas ne se fusionne pas.
- Sur `main`, il fait la même chose puis met le jeu en ligne sur
  https://julespierrat.github.io/tire-fesses/.
- Les chemins du jeu sont relatifs (`./`). Le même dossier `dist/` marchera
  donc tel quel sur itch.io.

## L'ordre de travail

Chaque étape est une pull request avec des captures. On ne fusionne qu'après
validation.

0. **Le squelette** : les outils, les tests, la mise en ligne, et une page
   vide aux bonnes couleurs, qui passe du jour à la nuit.
1. **Les Chocards, sans skieurs** : le relief, la station, les lieux. On trace
   une piste et elle prend sa couleur, on pose une remontée, on passe du jour à
   la nuit.
2. **Les skieurs** : ils arrivent, font la queue, montent, descendent et vont
   vers leur envie.
3. **L'argent et la nuit** : les forfaits, la facture, les dameuses, les
   avalanches, la saison et les étoiles.
4. **Les autres cartes** : les Deux Vallées, puis le Grand Domaine.
