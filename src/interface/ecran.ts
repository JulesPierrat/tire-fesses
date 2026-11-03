/* L'écran : la carte agrandie d'un nombre entier, compté en vrais pixels de l'écran. */

import type { Point } from '../logique/geometrie';
import { HAUTEUR, LARGEUR } from '../logique/reglages';

/** Le plus grand agrandissement entier qui fait tenir la carte dans la fenêtre, et au moins 1. */
export function echelle(largeurVraie: number, hauteurVraie: number): number {
  return Math.max(1, Math.min(Math.floor(largeurVraie / LARGEUR), Math.floor(hauteurVraie / HAUTEUR)));
}

export interface Cadre {
  echelle: number;
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
}

/** Où poser la carte, en vrais pixels : agrandie, centrée, sur un pixel entier. */
export function cadrer(largeurVraie: number, hauteurVraie: number): Cadre {
  const e = echelle(largeurVraie, hauteurVraie);
  const largeur = LARGEUR * e, hauteur = HAUTEUR * e;
  return {
    echelle: e,
    x: Math.floor((largeurVraie - largeur) / 2),
    y: Math.floor((hauteurVraie - hauteur) / 2),
    largeur,
    hauteur,
  };
}

/** Le pixel du jeu sous un point de la page (en points CSS, comme les événements du pointeur). */
export function versJeu(toile: HTMLCanvasElement, c: Cadre, clientX: number, clientY: number): Point {
  const r = toile.getBoundingClientRect(), vrais = toile.width / r.width;
  return [((clientX - r.left) * vrais - c.x) / c.echelle, ((clientY - r.top) * vrais - c.y) / c.echelle];
}

/**
 * La toile couvre toute la fenêtre et compte en vrais pixels : c'est nous qui posons la
 * carte agrandie sur un pixel entier. Placer la toile elle-même en CSS ne suffit pas :
 * avec 2,625 vrais pixels par point, son bord tomberait entre deux pixels.
 *
 * Appelle `quandCadre` à chaque changement de taille ou d'écran, une fois la toile
 * redimensionnée : il faut alors la redessiner.
 */
export function suivreEcran(toile: HTMLCanvasElement, quandCadre: (c: Cadre) => void): void {
  new ResizeObserver(([entree]) => {
    const dpr = window.devicePixelRatio || 1;
    const l = Math.round(entree.contentRect.width * dpr), h = Math.round(entree.contentRect.height * dpr);
    // La taille exacte en vrais pixels, quand le navigateur la donne (pas Safari). Les écrans
    // simulés (outils de développement, Playwright) la donnent sans devicePixelRatio : on ne
    // la croit que si elle tombe à un pixel près de notre calcul.
    const vraie = entree.devicePixelContentBoxSize?.[0];
    const juste = vraie && Math.abs(vraie.inlineSize - l) <= 1 && Math.abs(vraie.blockSize - h) <= 1;
    toile.width = juste ? vraie.inlineSize : l;
    toile.height = juste ? vraie.blockSize : h;
    const c = cadrer(toile.width, toile.height);
    // Pour les tests : où la carte est posée, en vrais pixels.
    Object.assign(toile.dataset, { echelle: c.echelle, x: c.x, y: c.y });
    quandCadre(c);
  }).observe(toile, { box: 'device-pixel-content-box' });
}
