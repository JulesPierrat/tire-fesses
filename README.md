# Tire-Fesses

Un jeu web en pixel art de nœuds, de flux et d'organisation : on relie les
stations et les lieux d'un domaine skiable par des remontées qui montent et des
pistes qui descendent. Le jour, on fait circuler les skieurs sans bouchons pour
gagner en popularité et remplir la caisse. La nuit, on paie l'entretien, les
dameuses et la sécurité contre les avalanches.

Jouable dans le navigateur, seul, sur plusieurs cartes de plus en plus
étendues.

![Le domaine d'essai de la charte graphique, de jour](docs/charte/banc-jour.png)

## Où en est le projet

Le jeu se construit par étapes ([`docs/TECHNIQUE.md`](docs/TECHNIQUE.md)). Sur
les Chocards, on trace déjà des pistes qui prennent leur couleur, on pose des
remontées et on ouvre des lieux ; les skieurs arrivent à l'étape 2.

Pour y jouer sur sa machine, avec Docker : `./outils lancer`, puis
http://localhost:5173.

- [x] Le nom
- [x] La charte graphique : [`docs/CHARTE.md`](docs/CHARTE.md)
- [x] La doc « Comment jouer » : [`docs/COMMENT_JOUER.md`](docs/COMMENT_JOUER.md)
- [x] Les choix techniques : [`docs/TECHNIQUE.md`](docs/TECHNIQUE.md)
- [x] Étape 0 : le squelette
- [x] Étape 1 : les Chocards, sans skieurs
- [ ] Étape 2 : les skieurs
- [ ] Étape 3 : l'argent et la nuit
- [ ] Étape 4 : les Deux Vallées et le Grand Domaine

## Licence

Code et documents sous licence [MIT](LICENSE). La police Pixelify Sans est
sous licence SIL Open Font License.
