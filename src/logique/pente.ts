/* La couleur d'un tronçon de piste : celle de son passage le plus raide. */

import { distance, type Point } from './geometrie';
import type { Relief } from './relief';
import { FENETRE_PENTE, HM, MPX, SEUILS } from './reglages';

export const COULEURS_PISTE = ['verte', 'bleue', 'rouge', 'noire'] as const;
export type CouleurPiste = (typeof COULEURS_PISTE)[number];

export function classe(pente: number): CouleurPiste {
  return pente < SEUILS[0] ? 'verte' : pente < SEUILS[1] ? 'bleue' : pente < SEUILS[2] ? 'rouge' : 'noire';
}

/**
 * La pente la plus forte d'un chemin tracé tous les demi-pixels, mesurée sur une fenêtre
 * glissante de 24 px (144 m). Un chemin plus court se mesure d'un bout à l'autre.
 */
export function penteMax(relief: Relief, chemin: readonly Point[]): number {
  const n = FENETRE_PENTE * 2;
  const mesure = (a: Point, b: Point) => {
    const d = distance(a, b) * MPX;
    return d > 0 ? Math.abs(relief.hauteurEn(a) - relief.hauteurEn(b)) * HM / d : 0;
  };
  if (chemin.length <= n) return chemin.length > 1 ? mesure(chemin[0], chemin[chemin.length - 1]) : 0;
  let m = 0;
  for (let k = 0; k + n < chemin.length; k += 2) m = Math.max(m, mesure(chemin[k], chemin[k + n]));
  return m;
}

/** De combien de mètres le chemin remonte au plus, depuis le point le plus bas déjà passé. */
export function remonteeMax(relief: Relief, chemin: readonly Point[]): number {
  let bas = Infinity, m = 0;
  for (const p of chemin) {
    const a = relief.altitude(p);
    bas = Math.min(bas, a);
    m = Math.max(m, a - bas);
  }
  return m;
}
