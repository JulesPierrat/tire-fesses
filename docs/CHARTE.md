# Charte graphique de Tire-Fesses

Ce document fixe l'apparence du jeu avant la première ligne de code. Tout ce
qui sera dessiné ensuite doit pouvoir se poser sur le domaine d'essai
ci-dessous sans détonner.

La planche de référence est [`charte/planche.html`](charte/planche.html) :
ouverte dans un navigateur, elle montre le domaine d'essai animé, de jour et de
nuit, chaque dessin à la loupe, les deux palettes et la police. Les images de
ce document en sont des captures.

![Le domaine d'essai, de jour](charte/banc-jour.png)

![Le même domaine, de nuit](charte/banc-nuit.png)

Le décor de la planche est généré pour juger l'ensemble. Les dessins
définitifs viendront ensuite, dans ces règles.

## Les choix

| | Choix | Pourquoi |
|---|---|---|
| Point de vue | **Vue de dessus** | Tracer une piste à la souris ou au doigt est simple et précis, tout le domaine se voit d'un coup, et chaque objet n'a qu'un dessin. |
| Résolution | **Case de 24 × 24**, carte de base de 720 × 450 px, agrandie d'un nombre entier de pixels | Assez de pixels pour qu'un skieur ait un masque, un chalet des fenêtres et une porte, un sapin de la neige sur chaque étage de branches. |
| Palette | **Grand beau** le jour, sa **jumelle de nuit** la nuit | Les quatre couleurs de piste ressortent sur la neige ; la nuit garde les mêmes dessins. |
| Police | **Pixelify Sans** | Une police pixel avec de vraies minuscules et tous les accents, lisible même en phrases. |

## Un jeu de nœuds et de flux

Un domaine skiable est un graphe. Le dessin doit le rendre lisible au premier
regard.

- **Un nœud, un point.** Une station est un seul nœud, quelle que soit sa
  taille. Un lieu aussi. Chaque nœud est posé sur une **plateforme** de neige
  damée, une ellipse claire au bord ombré en bas à droite : c'est là qu'on
  accroche les liens.
- **Deux sortes de liens.** Les remontées montent d'un nœud à un autre ; les
  pistes descendent, en couleur de difficulté. Rien ne se pose au milieu de
  nulle part.
- **Les intersections.** Là où des pistes se séparent ou se rejoignent, il y a
  une intersection : un petit rond damé cerclé d'encre et un poteau dont les
  plaques ont la couleur des pistes qui en partent. C'est un nœud comme les
  autres, sans rien à visiter.
- **Un tronçon, une couleur.** Une piste va d'un nœud ou d'une intersection au
  suivant, sans croisement entre les deux. Elle a une seule couleur sur toute
  sa longueur : celle de son passage le plus raide (voir *Les pistes*).
- **Plusieurs stations.** Un domaine peut relier plusieurs stations. Un nœud
  entouré de **pointillés** qui tournent n'est pas encore relié au réseau.
- **Des cartes qui grandissent.** La carte de base tient sur un écran (30 × 19
  cases). Les suivantes sont plus étendues, défilent, et comptent plus de
  stations à relier.

## Les nœuds

![Les nœuds sur leur plateforme, chacun avec son pictogramme](charte/noeuds.png)

Sur la carte, chaque nœud est dessiné sur sa plateforme. Dans l'interface
(légende, bulles, menus), il est représenté par son **pictogramme** : une
pastille de 11 × 11, coins coupés, bordée d'encre, remplie de la couleur de sa
famille, symbole en encre ou en blanc selon le contraste.

| Nœud | Famille | Sur la carte | Taille (px) |
|---|---|---|---|
| Station | Station | Un immeuble en béton, un immeuble en bois et trois chalets serrés, fenêtres allumées | 56 × 42 |
| Intersection | — | Un rond damé cerclé d'encre et un poteau à plaques aux couleurs des pistes qui en partent | 21 × 19 |
| Restaurant d'altitude | Restauration | Un grand chalet et sa terrasse à parasols | 25 × 19 |
| Café | Restauration | Une buvette fumante à l'auvent rayé | 13 × 15 |
| Sommet | Nature | Une croix sur les rochers | 17 × 13 |
| Point de vue | Nature | Une longue-vue sur un ponton de bois | 13 × 12 |
| Luge | Activités | Une luge et son passager | 17 × 10 |
| Snowpark | Activités | Un tremplin et une barre de slide | 25 × 10 |
| Parapente | Activités | Une manche à air ; le jour, des voiles survolent le domaine avec leur ombre | 11 × 18 |
| Chiens de traîneau | Activités | Un attelage de trois chiens et son musher | 32 × 9 |
| Patinoire | Activités | Une patinoire bordée de bois | 27 × 16 |
| Raquettes | Activités | Un panneau et des traces dans la neige | 11 × 11 |

Plateformes : 80 × 26 pour une station, 38 × 14 pour un lieu, 20 × 10 pour une
intersection.

## Les remontées

![Planches du téléski, du télésiège et de la télécabine](charte/remontees.png)

Une remontée part d'un nœud et arrive à un autre. Sa machinerie est une petite
**gare grise** (11 × 9) collée à la plateforme, de part et d'autre. Le pylône
suffit à reconnaître le type, même quand aucun véhicule ne passe.

| | Téléski (tire-fesses) | Télésiège | Télécabine |
|---|---|---|---|
| Pylône | 5 × 18, petite traverse | 13 × 24, large traverse | 13 × 30, en treillis |
| Câbles | un | deux : montée et descente | deux : montée et descente |
| Véhicule | perche, skieur debout au sol | siège deux places couleur encre, 7 × 6 | cabine jaune à fenêtre, 7 × 9 |
| Au sol | une trace damée sous la ligne | rien | rien |

## Le jour et la nuit

Le jeu se joue en deux phases, et le dessin les distingue sans rien redessiner.

- **Le jour**, on regarde les flux : les skieurs descendent les pistes et
  montent les remontées, une file se forme au pied d'une remontée trop
  chargée, des cœurs montent au-dessus des lieux qui plaisent. L'interface
  affiche la satisfaction, la popularité et la caisse.
- **La nuit**, on regarde les coûts : les remontées s'arrêtent, les dameuses
  passent phares allumés, les pentes les plus raides (60 % et plus) sont
  hachurées d'orange pour le risque d'avalanche, une remontée à réviser porte la pastille d'entretien. L'interface
  affiche les dameuses, le risque, l'entretien et la caisse.

La nuit ne change pas les dessins, elle change la palette : **chaque couleur a
sa jumelle de nuit**, au même rang. Seuls la lumière des fenêtres, les phares
et l'orange des alertes gardent leur éclat.

### Les signaux

| Signal | Phase | Dessin |
|---|---|---|
| Bouchon | jour | file de skieurs au pied de la remontée ; pastille orange qui clignote au-delà de dix |
| Skieur content | jour | cœur framboise de 7 × 6 qui monte au-dessus d'un nœud |
| Risque d'avalanche | nuit | hachures orange sur les pentes de 60 % et plus ; pastille orange qui clignote |
| Entretien | nuit | pastille orange à clé, qui clignote près de la remontée |
| Dameuse | nuit | engin de 13 × 9, phares en cône tramé devant lui |
| Pas encore relié | toujours | pointillés qui tournent autour de la plateforme |
| Emplacement libre | toujours | plateforme vide entre deux piquets de bois |
| Tracé en cours | toujours | trait de 3 px à la couleur que prendra la piste ; orange s'il remonte de plus de 10 m |
| Choisi | toujours | anneau plein jaune autour du nœud d'où part une remontée, couleur lumière autour d'un emplacement ; la piste ou le câble choisi clignote en lumière |

## La palette

32 couleurs le jour, leurs 32 jumelles la nuit. Une couleur absente de cette
liste n'entre pas dans le jeu.

| Identifiant | Nom | Jour | Nuit |
|---|---|---|---|
| `neige-0` | Neige au soleil | `#ffffff` | `#a7b0e0` |
| `neige-1` | Neige | `#e4eef7` | `#8790cc` |
| `neige-2` | Neige à l'ombre | `#bcd1e5` | `#6870b2` |
| `neige-3` | Ombre profonde | `#8ea9c6` | `#4d5494` |
| `neige-damee` | Neige damée | `#f3f8fc` | `#b6bee8` |
| `roche-0` | Roche claire | `#a7a3ad` | `#635f82` |
| `roche-1` | Roche | `#706b78` | `#48446a` |
| `roche-2` | Roche sombre | `#464150` | `#302d4c` |
| `sapin-0` | Sapin clair | `#4f9c62` | `#2f5566` |
| `sapin-1` | Sapin | `#2f714b` | `#21404f` |
| `sapin-2` | Sapin sombre | `#1d4a37` | `#162c3a` |
| `tronc` | Tronc | `#5b3a2b` | `#2b2236` |
| `bois-0` | Bois · restauration | `#b8683d` | `#6a4a62` |
| `bois-1` | Bois sombre | `#7d4128` | `#4a3249` |
| `toit` | Toit | `#c94a32` | `#7a3f5c` |
| `ciel-0` | Ciel haut | `#4fa3e3` | `#0b0e2e` |
| `ciel-1` | Ciel · vitres | `#86c4f0` | `#1a1f52` |
| `ciel-2` | Ciel · glace | `#c9e7fb` | `#2c3480` |
| `encre` | Encre · station | `#1c2440` | `#0a0c22` |
| `cable` | Câble | `#30364f` | `#161a40` |
| `piste-verte` | Piste verte | `#23a052` | `#34b37a` |
| `piste-bleue` | Piste bleue | `#2a67d4` | `#5a86ee` |
| `piste-rouge` | Piste rouge | `#dc3a2a` | `#f05a66` |
| `piste-noire` | Piste noire | `#1a1a24` | `#0d0d1c` |
| `peau` | Peau | `#f2c5a0` | `#d4a593` |
| `orange-balise` | Orange balise · alertes | `#ff8a1f` | `#ff9a3c` |
| `jaune-remontee` | Jaune · remontées | `#ffd23f` | `#f2cf55` |
| `framboise` | Framboise · contentement | `#e83f6f` | `#d0527e` |
| `cyan` | Cyan · nature | `#1fb5cc` | `#36a9c0` |
| `violet` | Violet · activités | `#8b5cf6` | `#8466e0` |
| `lumiere` | Lumière | `#ffd77a` | `#ffd36e` |
| `route` | Route | `#6e7383` | `#363a6a` |

Les mêmes couleurs, dans le même ordre, en fichiers : `grand-beau` et
`grand-beau-nuit` dans [`assets/palette/`](../assets/palette/), en `.gpl`
(Aseprite, GIMP), `.hex` (Lospec) et `.png` (8 × 4 cases de 16 px).

### Les couleurs qui veulent dire quelque chose

| Couleur | Sens | Où |
|---|---|---|
| `piste-verte`, `piste-bleue`, `piste-rouge`, `piste-noire` | Difficulté | Les pistes, **et rien d'autre** |
| `orange-balise` | Alerte | Bouchon, avalanche, entretien |
| `framboise` | Contentement | Les cœurs des skieurs contents |
| `jaune-remontee` | Remontées | Pastilles des remontées, cabines |
| `encre` | Station | Pastille de la station |
| `bois-0` | Restauration | Pastilles du restaurant et du café |
| `cyan` | Nature | Pastilles des sommets et des points de vue |
| `violet` | Activités | Pastilles des activités |

## La police

Pixelify Sans, sous licence SIL Open Font License : elle sera livrée avec le
jeu. L'interface s'affiche à la taille de l'écran ; elle n'est pas agrandie
avec la carte.

| | |
|---|---|
| Titres | 24 px, gras (700) |
| Texte | 16 px, normal (400) |
| Tailles | ces deux-là seulement |
| Chiffres | alignés en colonne (`tabular-nums`) |
| Casse | casse de phrase ; tout en capitales seulement pour le logo |

## Les tailles

Une case fait 24 × 24 pixels. L'écran agrandit toujours par un nombre entier
de pixels de l'écran par pixel du jeu, jamais avec du lissage : ×2 sur un
écran de 1 920 px, ×3 sur un écran Retina de la même largeur. L'ancre de chaque dessin est son pixel du
bas, au milieu : c'est le point où l'objet touche la neige.

| Dessin | Taille (px) |
|---|---|
| Skieur (bonnet, masque, bâtons) | 7 × 10 |
| Sapins | 11 × 16 et 7 × 11, mêlés |
| Chalet | 15 × 14 |
| Immeuble béton / bois | 13 × 30 / 13 × 21 |
| Gare de remontée | 11 × 9 |
| Dameuse | 13 × 9 |
| Parapente en vol | 19 × 13 |
| Cœur | 9 × 8 |
| Pictogramme | 11 × 11 |
| Pictogramme de piste | 7 × 7 |

Les nœuds et les pylônes sont dans leurs tableaux plus haut.

## Les pistes

Les couleurs suivent la norme française : verte (très facile), bleue
(facile), rouge (difficile), noire (très difficile). Un tronçon de piste est
une bande de neige damée de 10 px bordée de 2 px de sa couleur. Pour les
joueurs daltoniens, chaque couleur a aussi son pictogramme de 7 × 7 : rond
(verte), carré (bleue), triangle (rouge), losange (noire).

La couleur d'un tronçon n'est pas choisie : elle vient de son passage le plus
raide, mesuré sur une fenêtre glissante de 144 m, et vaut pour tout le
tronçon, jusqu'à la prochaine intersection.

| Pente la plus forte du tronçon | Couleur |
|---|---|
| moins de 25 % | verte |
| de 25 à 40 % | bleue |
| de 40 à 60 % | rouge |
| 60 % et plus | noire |

Sur la carte d'essai, à 6 m par pixel : le couloir sous le sommet (65 %) est
noir, la descente du sommet au point de vue (59 %) rouge, quatre tronçons
bleus et quatre verts.

## Les règles de dessin

- **La lumière** vient du haut à gauche. Les ombres tombent en bas à droite,
  sur les versants comme au pied des objets.
- **Les contours** : pas de trait noir autour des objets. Chaque objet est
  bordé par la plus sombre de ses propres teintes. Seuls les pictogrammes et
  les cadres de l'interface ont un bord d'encre.
- **La neige** : quatre teintes, du plein soleil à l'ombre, mêlées par une
  trame de points (matrice de Bayer 4 × 4) plutôt que par un dégradé. Des
  courbes de niveau régulières, une sur quatre plus marquée, disent le relief.
- **Le mouvement** : 4 à 6 images par animation, 8 à 12 images par seconde.
  Un objet avance d'un pixel entier, jamais d'un demi.
- **L'interface** : cadres et boutons dessinés en pixels, dans les couleurs de
  la phase, ombre portée pleine de 2 px.
- **Les noms** : stations, pistes, remontées et lieux portent des noms de
  montagne (les Chocards, Combe du Loup, Télécabine du Plateau).

## Reste à faire

- Le logo et l'icône du jeu.
- Les dessins définitifs, dans ces règles, à partir des palettes en fichiers.
