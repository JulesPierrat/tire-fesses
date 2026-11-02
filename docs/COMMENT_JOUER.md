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

Un nœud entouré de pointillés n'est pas encore relié au réseau. Tant qu'il ne
l'est pas, personne n'y va.

### Les liens

- **Une remontée** monte d'un nœud vers un nœud plus haut, en ligne droite.
- **Une piste** descend d'un nœud vers un nœud plus bas, en suivant le tracé
  que vous dessinez. Sa couleur vient de sa pente la plus forte : verte, bleue,
  rouge ou noire.

Il y a trois remontées :

| | Téléski (tire-fesses) | Télésiège | Télécabine |
|---|---|---|---|
| Débit | faible | moyen | fort |
| Longueur | courte | moyenne | longue |
| Prix | bas | moyen | élevé |
| Entretien la nuit | faible | moyen | élevé |
| Particularité | les skieurs restent au sol : il lui faut une pente dégagée, sans forêt ni rochers | s'arrête quand le vent souffle fort | marche par tous les temps et redescend les skieurs qui n'ont pas le niveau de la piste |

## Le jour : faire circuler les skieurs

Le jour, le temps passe. Vous regardez les flux et vous corrigez.

**Les skieurs.** Le matin, des skieurs arrivent dans chaque station ; leur
nombre dépend de la popularité. Chacun a un **niveau** et une **envie** :

- un débutant ne descend que les vertes, un skieur confirmé va jusqu'aux
  rouges, un expert descend tout ;
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

Pendant le jour, vous pouvez mettre en pause, accélérer, fermer ou rouvrir une
piste ou une remontée, et régler le débit d'une remontée.

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
- **Les avalanches.** Après une chute de neige, les pentes raides ont un
  risque d'avalanche de 1 à 5, hachuré en orange sur la carte. Vous pouvez
  déclencher l'avalanche vous-même (ça coûte), fermer les pistes concernées,
  ou prendre le risque : une avalanche ferme la piste plusieurs jours.
- **La météo.** Chaque nuit annonce le temps du lendemain : neige, soleil ou
  vent.

Au matin, la facture de la nuit tombe : dameuses, entretien, déclenchements
et frais des lieux.

## Construire

| Pour… | Faites… | Prix |
|---|---|---|
| Tracer une piste | glisser d'un nœud jusqu'à un nœud plus bas | selon la longueur et les arbres à abattre |
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
