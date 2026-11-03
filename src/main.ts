import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/700.css';
import './style.css';

import { CHOCARDS } from './cartes/chocards';
import { NOMS, PALETTES, type Phase } from './dessin/palette';
import { HAUTEUR, LARGEUR } from './dessin/pixels';
import { Rendu } from './dessin/rendu';
import { ERREURS_DE_DESSIN } from './dessin/sprites';
import { Terrain } from './dessin/terrain';
import { Domaine, type Sauvegarde } from './logique/domaine';
import { Relief } from './logique/relief';
import { suivreEcran, versJeu, type Cadre } from './interface/ecran';
import { Jeu } from './interface/jeu';
import { Panneau } from './interface/panneau';

if (ERREURS_DE_DESSIN.length) console.error(`Dessins mal formés : ${ERREURS_DE_DESSIN.join(', ')}`);

const CLE = `tire-fesses/${CHOCARDS.id}`;
const toile = document.querySelector<HTMLCanvasElement>('#ecran')!;

const relief = new Relief(CHOCARDS);
const terrain = new Terrain(CHOCARDS, relief);

// La partie enregistrée, si elle se lit encore.
let domaine = new Domaine(CHOCARDS, relief), perdue = false;
try {
  const texte = localStorage.getItem(CLE);
  if (texte) domaine = Domaine.depuisSauvegarde(CHOCARDS, relief, JSON.parse(texte) as Sauvegarde);
} catch {
  perdue = true;
  try { localStorage.removeItem(CLE); } catch { /* stockage fermé : tant pis */ }
}

const enregistrer = () => {
  try { localStorage.setItem(CLE, JSON.stringify(domaine.versSauvegarde())); } catch { /* stockage fermé ou plein */ }
};

// La carte en pixels du jeu, 720 × 450, puis recopiée agrandie sur l'écran.
const carte = document.createElement('canvas');
carte.width = LARGEUR;
carte.height = HAUTEUR;
const ctxCarte = carte.getContext('2d')!;
const image = ctxCarte.createImageData(LARGEUR, HAUTEUR);
const pixels = new Uint32Array(image.data.buffer);
const ctx = toile.getContext('2d')!;
const rendu = new Rendu(domaine, terrain);
let cadre: Cadre | undefined, aRefaire = true;

const panneau = new Panneau(document.querySelector('#panneau')!, p => passerA(p), () => {
  try { localStorage.removeItem(CLE); } catch { /* rien à effacer */ }
  location.reload();
});
const jeu = new Jeu(domaine, panneau, enregistrer, () => { aRefaire = true; });
if (perdue) panneau.montrer({ titre: 'Partie perdue', texte: 'La partie enregistrée ne se lit plus\u00a0: la carte recommence.' });

function passerA(p: Phase): void {
  // L'interface prend les couleurs de la phase, comme la carte.
  for (const nom of NOMS) document.documentElement.style.setProperty(`--${nom}`, PALETTES[p][nom]);
  jeu.passerA(p);
}

function afficher(temps: number): void {
  if (!cadre) return;
  rendu.dessiner(pixels, jeu.vue(temps));
  ctxCarte.putImageData(image, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = PALETTES[jeu.phase].encre;
  ctx.fillRect(0, 0, toile.width, toile.height);
  ctx.drawImage(carte, cadre.x, cadre.y, cadre.largeur, cadre.hauteur);
}

// Ce qui bouge avance à 12 images par seconde, comme le veut la charte ; un geste redessine tout de suite.
let derniere = -1;
function boucle(ms: number): void {
  const temps = ms / 1000, n = Math.floor(temps * 12);
  if (aRefaire || n !== derniere) { afficher(temps); aRefaire = false; derniere = n; }
  requestAnimationFrame(boucle);
}

// Les gestes, en pixels du jeu.
const ici = (e: PointerEvent) => versJeu(toile, cadre!, e.clientX, e.clientY);
toile.addEventListener('pointerdown', e => {
  if (!cadre || !e.isPrimary || e.button > 0) return;
  toile.setPointerCapture(e.pointerId);
  jeu.appuyer(e.pointerId, ici(e), e.pointerType !== 'mouse');
});
toile.addEventListener('pointermove', e => { if (cadre) jeu.bouger(e.pointerId, ici(e), e.pointerType === 'mouse'); });
toile.addEventListener('pointerup', e => { if (cadre) jeu.lacher(e.pointerId, ici(e)); });
toile.addEventListener('pointercancel', e => jeu.abandonner(e.pointerId));
document.addEventListener('keydown', e => { if (e.key === 'Escape') jeu.annuler(); });

suivreEcran(toile, c => { cadre = c; aRefaire = true; });
passerA('jour');
requestAnimationFrame(boucle);
