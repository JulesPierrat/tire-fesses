import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import './style.css';

import { NOMS, PALETTES, PIXELS, type Phase } from './dessin/palette';
import { HAUTEUR, LARGEUR } from './dessin/pixels';
import { dessinerSquelette } from './dessin/squelette';
import { suivreEcran, type Cadre } from './interface/ecran';

const toile = document.querySelector<HTMLCanvasElement>('#ecran')!;
const surCarte = document.querySelector<HTMLElement>('#interface')!;
const agrandi = document.querySelector<HTMLElement>('#agrandi')!;
const boutons = [...document.querySelectorAll<HTMLButtonElement>('[data-phase]')];

// La carte en pixels du jeu, 720 × 450, puis recopiée agrandie sur l'écran.
const carte = document.createElement('canvas');
carte.width = LARGEUR;
carte.height = HAUTEUR;
const ctxCarte = carte.getContext('2d')!;
const image = ctxCarte.createImageData(LARGEUR, HAUTEUR);
const pixels = new Uint32Array(image.data.buffer);
const ctx = toile.getContext('2d')!;

let phase: Phase = 'jour';
let cadre: Cadre | undefined;

function afficher(): void {
  if (!cadre) return;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = PALETTES[phase].encre;
  ctx.fillRect(0, 0, toile.width, toile.height);
  ctx.drawImage(carte, cadre.x, cadre.y, cadre.largeur, cadre.hauteur);
}

function passerA(p: Phase): void {
  phase = p;
  // L'interface prend les couleurs de la phase, comme la carte.
  for (const nom of NOMS) document.documentElement.style.setProperty(`--${nom}`, PALETTES[phase][nom]);
  for (const b of boutons) b.setAttribute('aria-pressed', String(b.dataset.phase === phase));
  dessinerSquelette(pixels, PIXELS[phase]);
  ctxCarte.putImageData(image, 0, 0);
  afficher();
}

for (const b of boutons) b.addEventListener('click', () => passerA(b.dataset.phase as Phase));
suivreEcran(toile, surCarte, c => {
  cadre = c;
  agrandi.textContent = `×${c.echelle}`;
  afficher();
});
passerA('jour');
