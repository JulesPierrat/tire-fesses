/* L'écran : la carte agrandie d'un nombre entier, compté en vrais pixels de l'écran. */

import { HAUTEUR, LARGEUR } from '../dessin/pixels';

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

/**
 * La toile couvre toute la fenêtre et compte en vrais pixels : c'est nous qui posons la
 * carte agrandie sur un pixel entier. Placer la toile elle-même en CSS ne suffit pas :
 * avec 2,625 vrais pixels par point, son bord tomberait entre deux pixels.
 *
 * Appelle `quandCadre` à chaque changement de taille ou d'écran, une fois la toile
 * redimensionnée : il faut alors la redessiner.
 */
export function suivreEcran(toile: HTMLCanvasElement, surCarte: HTMLElement, quandCadre: (c: Cadre) => void): void {
  const poser = (largeurVraie: number, hauteurVraie: number) => {
    toile.width = largeurVraie;
    toile.height = hauteurVraie;
    const c = cadrer(largeurVraie, hauteurVraie);
    const vrais = largeurVraie / toile.clientWidth;
    surCarte.style.left = `${c.x / vrais}px`;
    surCarte.style.top = `${c.y / vrais}px`;
    surCarte.style.width = `${c.largeur / vrais}px`;
    surCarte.style.height = `${c.hauteur / vrais}px`;
    quandCadre(c);
  };

  new ResizeObserver(([entree]) => {
    const dpr = window.devicePixelRatio || 1;
    const l = Math.round(entree!.contentRect.width * dpr), h = Math.round(entree!.contentRect.height * dpr);
    // La taille exacte en vrais pixels, quand le navigateur la donne (pas Safari). Les écrans
    // simulés (outils de développement, Playwright) la donnent sans devicePixelRatio : on ne
    // la croit que si elle tombe à un pixel près de notre calcul.
    const vraie = entree!.devicePixelContentBoxSize?.[0];
    const juste = vraie && Math.abs(vraie.inlineSize - l) <= 1 && Math.abs(vraie.blockSize - h) <= 1;
    poser(juste ? vraie.inlineSize : l, juste ? vraie.blockSize : h);
  }).observe(toile, { box: 'device-pixel-content-box' });
}
