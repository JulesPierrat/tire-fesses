/* Le relief d'une carte : une hauteur et une pente par pixel du jeu. */

import type { Carte } from './carte';
import { bruit } from './hasard';
import type { Point } from './geometrie';
import { HM, MPX } from './reglages';

export class Relief {
  readonly largeur: number;
  readonly hauteur: number;
  /** La hauteur de chaque pixel, en unités (une unité = HM mètres). */
  readonly h: Float32Array;
  /** La pente de chaque pixel : 0,25 pour 25 %. */
  readonly pente: Float32Array;
  readonly altitudeDuBas: number;

  constructor(carte: Carte) {
    const { largeur: W, hauteur: H, relief: d } = carte;
    this.largeur = W;
    this.hauteur = H;
    this.altitudeDuBas = carte.altitudeDuBas;
    this.h = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const u = x / W, v = y / H;
      let e = d.haut - v * (d.haut - d.bas);
      for (const b of d.bosses) e += b.h * Math.exp(-((u - b.u) ** 2 / b.lu + (v - b.v) ** 2 / b.lv));
      for (const c of d.combes) e -= c.h * Math.exp(-((u - c.u) ** 2) / c.l) * (1 - v);
      for (const n of d.bruits) e += n.h * bruit(u * n.f + n.du, v * n.f + n.dv);
      if (v > d.replat.debut) {
        const k = Math.min(1, (v - d.replat.debut) / (d.replat.fin - d.replat.debut));
        e = e * (1 - k) + d.replat.h * k;
      }
      this.h[y * W + x] = e;
    }

    this.pente = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const gx = this.h[y * W + Math.min(W - 1, x + 1)] - this.h[y * W + Math.max(0, x - 1)];
      const gy = this.h[Math.min(H - 1, y + 1) * W + x] - this.h[Math.max(0, y - 1) * W + x];
      this.pente[y * W + x] = Math.hypot(gx, gy) / 2 * HM / MPX;
    }
  }

  /** La hauteur au pixel le plus proche, en unités. */
  hauteurEn(p: Point): number {
    const x = Math.max(0, Math.min(this.largeur - 1, Math.round(p[0])));
    const y = Math.max(0, Math.min(this.hauteur - 1, Math.round(p[1])));
    return this.h[y * this.largeur + x];
  }

  /** L'altitude en mètres. */
  altitude(p: Point): number {
    return this.altitudeDuBas + this.hauteurEn(p) * HM;
  }
}
