# Comment jouer à Tire-Fesses

Tire-Fesses est un jeu de nœuds, de flux et d'organisation. Vous dirigez un
domaine skiable : vous reliez ses stations et ses lieux par des remontées et
des pistes, puis vous faites circuler les skieurs. Le jour, ils skient et
l'argent rentre. La nuit, le domaine se repose et il faut payer pour le
préparer.

Le jeu se joue seul, dans le navigateur. La partie est enregistrée dans le
navigateur : on la reprend où on l'a laissée.

## Le but

Chaque carte est un domaine, et une partie sur cette carte dure une saison,
de décembre à avril. À la fin de la saison vient le bilan : la popularité du
domaine et l'état de la caisse donnent une à trois étoiles. Une étoile suffit
pour ouvrir la carte suivante, plus étendue, avec plus de stations à relier.

La saison s'arrête plus tôt si la caisse reste dans le rouge trois nuits de
suite : le domaine fait faillite.

## La carte : des nœuds et des liens

### Les nœuds

Tout ce qui compte sur la carte est un **nœud**, posé sur sa plateforme de
neige damée.

- **Les stations** sont les villages au pied des pistes. Les skieurs y
  arrivent le matin et doivent y rentrer le soir. Une carte en compte une ou
  plusieurs ; chacune est un seul nœud, quelle que soit sa taille.
- **Les lieux naturels** (sommets, points de vue) sont sur la carte dès le
  départ. Ils attirent les skieurs mais ne rapportent rien directement : ils
  font la popularité.
- **Les lieux à construire** (restaurant d'altitude, café, luge, raquettes,
  snowpark, chiens de traîneau, parapente, patinoire) se posent sur les
  emplacements prévus. Ils rapportent de l'argent le jour et coûtent un peu
  chaque nuit.

- **Les intersections** naissent là où une piste en croise ou en rejoint une
  autre. Ce sont des nœuds de passage : on n'y va pas, on y change de piste.

Un nœud entouré de pointillés n'est pas encore relié au réseau. Tant qu'il ne
l'est pas, personne n'y va.

### Les liens

- **Une remontée** monte d'un nœud vers un nœud plus haut, en ligne droite.
- **Une piste** descend d'un nœud vers un nœud plus bas, en suivant le tracé
  que vous dessinez.

Il y a trois remontées :

| | Téléski (tire-fesses) | Télésiège | Télécabine |
|---|---|---|---|
| Débit | faible | moyen | fort |
| Longueur | courte | moyenne | longue |
| Prix | bas | moyen | élevé |
| Entretien la nuit | faible | moyen | élevé |

### La couleur d'une piste

Seule la pente compte. Une piste est coupée en **tronçons** par les
intersections : un tronçon va d'un nœud ou d'une intersection au suivant, sans
croisement entre les deux. Chaque tronçon a une seule couleur sur toute sa
longueur, celle de son passage le plus raide :

| Pente la plus forte du tronçon | Couleur |
|---|---|
| moins de 25 % | verte |
| de 25 à 40 % | bleue |
| de 40 à 60 % | rouge |
| 60 % et plus | noire |

Un seul passage raide suffit donc à rendre tout un tronçon rouge ou noir. Pour
garder une descente facile, il faut la faire passer à côté, ou créer une
intersection avant le passage raide pour offrir un autre chemin.

## Le jour : faire circuler les skieurs

Le jour, le temps passe. Vous regardez les flux et vous corrigez.

**Les skieurs.** Le matin, des skieurs arrivent dans chaque station ; leur
nombre dépend de la popularité. Chacun a un **niveau** et une **envie** :

- un débutant ne descend que les tronçons verts, un skieur confirmé va
  jusqu'aux rouges, un expert descend tout ;
- l'envie est un lieu à rejoindre : un sommet, un point de vue, un restaurant,
  une activité.

Chaque skieur cherche seul son chemin : des remontées pour monter, des pistes
à son niveau pour descendre. Le soir, il rentre à une station.

**Ce qui rend un skieur content :** rejoindre son envie, peu attendre, des
pistes damées et pas trop chargées. Un cœur monte alors au-dessus du lieu.

**Ce qui le fâche :**

- un **bouchon** : la file au pied d'une remontée qui ne suit pas ;
- une piste bondée ;
- aucun chemin à son niveau vers son envie : il rentre déçu ;
- une remontée en panne.

**La satisfaction** du jour fait monter ou baisser la **popularité**, qui
bouge lentement, d'un jour sur l'autre. Plus le domaine est populaire, plus il
vient de skieurs le lendemain.

**L'argent du jour** vient des forfaits vendus le matin, un par skieur, et de
ce que les skieurs dépensent dans les lieux : repas, cafés, activités.

Pendant le jour, vous pouvez mettre en pause, accélérer, fermer ou rouvrir un
tronçon ou une remontée.

## La nuit : préparer le domaine

La nuit, le temps s'arrête. Elle se joue au calme : vous construisez et vous
préparez le lendemain.

- **Construire.** C'est le moment de tracer des pistes, de poser des
  remontées et d'ouvrir des lieux.
- **Damer.** Une piste qui n'est pas damée sera bosselée le lendemain :
  moins agréable, et les débutants l'évitent. Vous avez un nombre limité de
  dameuses : à vous de choisir les pistes.
- **Entretenir.** Chaque remontée s'use avec les passages. Une remontée usée
  risque de tomber en panne en plein jour. Une révision coûte, une panne coûte
  plus.
- **Les avalanches.** Les pentes de 60 % et plus sont hachurées en orange :
  elles peuvent partir. Chaque nuit, vous pouvez y déclencher l'avalanche
  vous-même (ça coûte), fermer les tronçons qui les traversent, ou prendre le
  risque : une avalanche ferme le tronçon plusieurs jours.

Au matin, la facture de la nuit tombe : dameuses, entretien, déclenchements
et frais des lieux.

## Construire

| Pour… | Faites… | Prix |
|---|---|---|
| Tracer une piste | glisser d'un nœud jusqu'à un nœud plus bas ; une intersection se crée là où elle croise une autre piste | selon la longueur |
| Poser une remontée | toucher le nœud du bas, puis celui du haut, puis choisir le type | selon la longueur et le type |
| Ouvrir un lieu | choisir le lieu, puis un emplacement libre | selon le lieu |
| Démolir | choisir le lien ou le lieu, puis « Démolir » | rend une partie du prix |

## Une saison, des cartes

Une saison compte une vingtaine de journées. De temps en temps, un nouveau
lieu ou une nouvelle station apparaît, entouré de pointillés : à vous de le
relier.

Les cartes s'enchaînent :

1. **Les Chocards** : une station, une montagne, la carte de base.
2. **Les Deux Vallées** : deux stations à relier par-dessus un col.
3. **Le Grand Domaine** : plusieurs stations sur une carte qui défile.

## Les commandes

| Geste | À la souris | Au doigt |
|---|---|---|
| Tracer une piste | cliquer et glisser | glisser |
| Poser une remontée | cliquer, cliquer | toucher, toucher |
| Voir un nœud ou un lien | survoler | appui long |
| Déplacer la carte | glisser avec le clic droit, ou les flèches | glisser à deux doigts |
| Zoomer | molette | pincer |
| Pause, accélérer | espace, touche + | boutons de l'écran |
