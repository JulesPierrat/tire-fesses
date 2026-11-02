/* L'image de l'étape 0 : la neige, la grille des cases et les 32 couleurs de la phase. */

import { NOMS, type Pixels } from './palette';
import { CASE, HAUTEUR, LARGEUR, rectangle } from './pixels';

export function dessinerSquelette(px: Uint32Array, c: Pixels): void {
  px.fill(c['neige-1']);

  // Un point d'ombre à chaque coin de case.
  for (let y = 0; y < HAUTEUR; y += CASE)
    for (let x = 0; x < LARGEUR; x += CASE) px[y * LARGEUR + x] = c['neige-2'];

  // La palette, une couleur par case, 8 × 4 cases au milieu de la carte.
  const x0 = 11 * CASE, y0 = 7 * CASE, l = 8 * CASE, h = 4 * CASE;
  rectangle(px, x0 + 2, y0 + 2, l, h, c['neige-3']);
  rectangle(px, x0 - 1, y0 - 1, l + 2, h + 2, c['encre']);
  NOMS.forEach((nom, i) => rectangle(px, x0 + (i % 8) * CASE, y0 + Math.floor(i / 8) * CASE, CASE, CASE, c[nom]));
}
