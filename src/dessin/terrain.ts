/* Le terrain vu de dessus : la neige ombrée par le relief, les courbes de niveau, les rochers,
   la route du village et les sapins. Repris de la planche ; ne bouge pas pendant la partie. */

import type { Carte } from '../logique/carte';
import { bruit, generateur } from '../logique/hasard';
import { PENTE_AVALANCHE } from '../logique/reglages';
import type { Relief } from '../logique/relief';
import { PIXELS, type Phase } from './palette';
import { bayer } from './pixels';

const NIVEAUX = 18; // courbes de niveau sur toute la hauteur ; une sur quatre plus marquée

/** Ce qu'il y a sous chaque pixel. */
const NEIGE = 0, ROCHER = 1, ROUTE = 2;

export interface Sapin { x: number; y: number; petit: boolean }

export class Terrain {
  readonly largeur: number;
  readonly hauteur: number;
  /** L'ombre de chaque pixel, de 0 (plein soleil) à 3 (ombre profonde). */
  readonly ombre: Uint8Array;
  /** Les pentes qui peuvent partir en avalanche : hachurées la nuit. */
  readonly avalanche: Uint8Array;
  readonly sapins: Sapin[] = [];
  private readonly sol: Uint8Array;
  private readonly courbe: Uint8Array;
  private readonly fonds: Partial<Record<Phase, Uint32Array>> = {};

  constructor(carte: Carte, relief: Relief) {
    const W = (this.largeur = relief.largeur), H = (this.hauteur = relief.hauteur), h = relief.h;
    const lumiere = new Float32Array(W * H), raideur = new Float32Array(W * H);
    let somme = 0, somme2 = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const dx = (h[y * W + Math.min(W - 1, x + 1)] - h[y * W + Math.max(0, x - 1)]) * 120;
      const dy = (h[Math.min(H - 1, y + 1) * W + x] - h[Math.max(0, y - 1) * W + x]) * 120;
      // La lumière vient du haut à gauche.
      const l = (0.55 * dx + 0.55 * dy + 0.63) / Math.hypot(dx, dy, 1);
      lumiere[i] = l;
      raideur[i] = Math.hypot(dx, dy);
      somme += l;
      somme2 += l * l;
    }
    const moyenne = somme / (W * H), ecart = Math.sqrt(Math.max(1e-6, somme2 / (W * H) - moyenne * moyenne));
    const hautes = [...raideur.filter((_, i) => h[i] > 0.72)].sort((a, b) => a - b);
    const seuilRocher = hautes[Math.floor(hautes.length * 0.8)] || 1;

    this.ombre = new Uint8Array(W * H);
    this.sol = new Uint8Array(W * H);
    this.courbe = new Uint8Array(W * H);
    this.avalanche = new Uint8Array(W * H);
    const { y: ry, epaisseur } = carte.route;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const v = 0.5 + (lumiere[i] - moyenne) / ecart * 0.2 + bayer(x, y) * 0.16;
      this.ombre[i] = v > 0.56 ? 0 : v > 0.42 ? 1 : v > 0.28 ? 2 : 3;
      if (y >= ry && y < ry + epaisseur) { this.sol[i] = ROUTE; continue; }
      const e = h[i], n = bruit(x / 27, y / 27);
      if (relief.pente[i] >= PENTE_AVALANCHE && e > 0.55) this.avalanche[i] = 1;
      if ((e > 0.7 && raideur[i] > seuilRocher * (1 - n * 0.4)) || (e > 0.66 && n > 0.5)) { this.sol[i] = ROCHER; continue; }
      const a = Math.floor(e * NIVEAUX), ad = Math.floor(h[y * W + Math.min(W - 1, x + 1)] * NIVEAUX), ab = Math.floor(h[Math.min(H - 1, y + 1) * W + x] * NIVEAUX);
      if (a !== ad || a !== ab) this.courbe[i] = Math.max(a, ad, ab) % 4 === 0 ? 2 : 1;
    }

    // Les sapins poussent en bas de la montagne, par bosquets ; jamais sur les rochers ni la route.
    const R = generateur(11);
    for (let gy = 3; gy < H - 8; gy += 6) for (let gx = 0; gx < W; gx += 6) {
      const x = Math.min(W - 1, Math.round(gx + R() * 6)), y = Math.min(H - 1, Math.round(gy + R() * 6)), i = y * W + x;
      const densite = (0.46 - h[i]) * 3 + bruit(x / 72 + 7, y / 72 + 3) * 1.3 - (y > 375 ? 0.5 : 0);
      if (densite < R() * 0.9 + 0.15) continue;
      if (this.sol[i] !== NEIGE || y > ry - 7) continue;
      this.sapins.push({ x, y, petit: R() >= 0.5 });
    }
  }

  /** Le fond de la carte dans les couleurs de la phase ; la nuit, les pentes à avalanche sont hachurées. */
  fond(phase: Phase): Uint32Array {
    const deja = this.fonds[phase];
    if (deja) return deja;
    const c = PIXELS[phase], W = this.largeur, b = new Uint32Array(W * this.hauteur);
    const neige = [c['neige-0'], c['neige-1'], c['neige-2'], c['neige-3']], roche = [c['roche-0'], c['roche-0'], c['roche-0'], c['roche-1']];
    for (let i = 0; i < b.length; i++) {
      const o = this.ombre[i];
      b[i] = this.sol[i] === ROCHER ? roche[o] : this.sol[i] === ROUTE ? c.route : neige[Math.min(3, o + this.courbe[i])];
      if (phase === 'nuit' && this.avalanche[i] && ((i % W) + Math.floor(i / W)) % 6 === 0) b[i] = c['orange-balise'];
    }
    return (this.fonds[phase] = b);
  }
}
