/* Le tableau de pixels de la carte : une case du tableau par pixel du jeu. */

export const LARGEUR = 720;
export const HAUTEUR = 450;
/** Une case de la grille, en pixels du jeu. */
export const CASE = 24;

/** Remplit un rectangle, en coupant ce qui sort de la carte. */
export function rectangle(px: Uint32Array, x: number, y: number, l: number, h: number, couleur: number): void {
  const x0 = Math.max(0, x), x1 = Math.min(LARGEUR, x + l);
  const y0 = Math.max(0, y), y1 = Math.min(HAUTEUR, y + h);
  for (let j = y0; j < y1; j++) px.fill(couleur, j * LARGEUR + x0, j * LARGEUR + x1);
}
