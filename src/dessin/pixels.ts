/* Le tableau de pixels de la carte : une case du tableau par pixel du jeu. */

import { HAUTEUR, LARGEUR } from '../logique/reglages';

export { CASE, HAUTEUR, LARGEUR } from '../logique/reglages';

/** Pose un pixel, s'il tombe sur la carte. */
export function poser(px: Uint32Array, x: number, y: number, couleur: number): void {
  if (x >= 0 && y >= 0 && x < LARGEUR && y < HAUTEUR) px[y * LARGEUR + x] = couleur;
}

/** Remplit un rectangle, en coupant ce qui sort de la carte. */
export function rectangle(px: Uint32Array, x: number, y: number, l: number, h: number, couleur: number): void {
  const x0 = Math.max(0, x), x1 = Math.min(LARGEUR, x + l);
  const y0 = Math.max(0, y), y1 = Math.min(HAUTEUR, y + h);
  for (let j = y0; j < y1; j++) px.fill(couleur, j * LARGEUR + x0, j * LARGEUR + x1);
}

/** Une ligne d'un pixel d'épaisseur (Bresenham). */
export function ligne(px: Uint32Array, x0: number, y0: number, x1: number, y1: number, couleur: number): void {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    poser(px, x0, y0, couleur);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}

/** La trame de Bayer 4 × 4, de −0,5 à 0,5 : mêle deux teintes sans dégradé. */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => v / 16 - 0.5);
export const bayer = (x: number, y: number): number => BAYER[(y & 3) * 4 + (x & 3)];
