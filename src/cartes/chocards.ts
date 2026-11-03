/* Les Chocards : une station, une montagne, la carte de base. Le domaine d'essai de la planche,
   sans ses pistes ni ses remontées, et sans la station du Val (elle servira aux Deux Vallées). */

import type { Carte } from '../logique/carte';

export const CHOCARDS: Carte = {
  id: 'chocards',
  nom: 'Les Chocards',
  largeur: 720,
  hauteur: 450,
  altitudeDuBas: 1550,
  relief: {
    haut: 1,
    bas: 0.05,
    bosses: [
      { u: 0.63, v: 0.04, h: 0.42, lu: 0.018, lv: 0.05 },  // le sommet des Chocards
      { u: 0.2, v: 0.1, h: 0.22, lu: 0.012, lv: 0.035 },   // l'épaule à gauche
      { u: 0.9, v: 0.14, h: 0.16, lu: 0.01, lv: 0.03 },    // la pointe à droite
    ],
    combes: [{ u: 0.42, h: 0.12, l: 0.006 }],
    bruits: [
      { h: 0.06, f: 5, du: 3.1, dv: 1.7 },
      { h: 0.015, f: 22, du: 0, dv: 0 },
    ],
    replat: { debut: 0.82, fin: 0.94, h: 0.07 },
  },
  route: { y: 437, epaisseur: 4 },
  noeuds: [
    { id: 'station', type: 'station', nom: 'Station des Chocards', x: 330, y: 408 },
    { id: 'sommet', type: 'sommet', nom: 'Sommet des Chocards', x: 453, y: 46 },
    { id: 'vue', type: 'vue', nom: 'Point de vue', x: 294, y: 147 },
  ],
  emplacements: [
    { id: 'e1', x: 495, y: 228 },
    { id: 'e2', x: 225, y: 288 },
    { id: 'e3', x: 150, y: 357 },
    { id: 'e4', x: 588, y: 297 },
  ],
};
