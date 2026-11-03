/* Le domaine dessiné sur son terrain : pistes, remontées, nœuds et sapins, puis ce qui bouge. */

import type { Domaine, Noeud, Remontee } from '../logique/domaine';
import { distanceSegment, type Point } from '../logique/geometrie';
import { plateforme, type TypeNoeud, type TypeRemontee } from '../logique/noeuds';
import { COULEURS_PISTE, type CouleurPiste } from '../logique/pente';
import { PIXELS, type Phase, type Pixels } from './palette';
import { HAUTEUR, LARGEUR, ligne, poser } from './pixels';
import { dessins, poserDessin, type Dessin, type NomDessin } from './sprites';
import type { Terrain } from './terrain';

/** Ce qu'il faut montrer en plus du domaine : la phase, l'heure, ce qui est choisi, le tracé en cours. */
export interface Vue {
  phase: Phase;
  /** En secondes. */
  temps: number;
  noeudChoisi?: string;
  emplacementChoisi?: string;
  pisteChoisie?: string;
  remonteeChoisie?: string;
  trace?: { chemin: readonly Point[]; couleur: CouleurPiste; trop: boolean };
}

const DESSIN_LIEU: Partial<Record<TypeNoeud, NomDessin>> = {
  sommet: 'sommet', vue: 'vue', restaurant: 'restaurant', cafe: 'cafe', luge: 'luge', raquettes: 'raquettes',
  snowpark: 'snowpark', chiens: 'chiens', parapente: 'parapente', patinoire: 'patinoire',
};

const LIGNE: Record<TypeRemontee, { pylone: NomDessin; poteau: number; brins: number[]; espace: number }> = {
  teleski: { pylone: 'pyloneTeleski', poteau: 17, brins: [0], espace: 20 },
  telesiege: { pylone: 'pyloneTelesiege', poteau: 23, brins: [6, -6], espace: 19 },
  telecabine: { pylone: 'pyloneTelecabine', poteau: 29, brins: [6, -6], espace: 27 },
};
const VITESSE = 6; // px par seconde, le long du câble

interface Ligne {
  r: Remontee;
  a: Point;
  b: Point;
  pylones: Point[];
  /** Le câble : du départ, par le haut de chaque pylône, jusqu'à l'arrivée ; t va de 0 à 1. */
  cable: { t: number; x: number; y: number }[];
  vehicules: number;
  vitesse: number;
}

export class Rendu {
  private readonly fixe = new Uint32Array(LARGEUR * HAUTEUR);
  private readonly loin = new Float32Array(LARGEUR * HAUTEUR);
  private readonly teinte = new Int8Array(LARGEUR * HAUTEUR);
  private lignes: Ligne[] = [];
  private cle = '';

  constructor(private readonly domaine: Domaine, private readonly terrain: Terrain) {}

  dessiner(px: Uint32Array, vue: Vue): void {
    const cle = `${vue.phase}:${this.domaine.version}`;
    if (cle !== this.cle) {
      this.preparer(vue.phase);
      this.cle = cle;
    }
    px.set(this.fixe);
    this.dessinerMobile(px, vue);
  }

  // ---------- ce qui ne bouge pas : refait seulement quand le domaine ou la phase change ----------

  private preparer(phase: Phase): void {
    const c = PIXELS[phase], D = dessins(phase), b = this.fixe, d = this.domaine, t = this.terrain;
    b.set(t.fond(phase));

    // Les pistes : 10 px de neige damée bordés de 2 px de leur couleur.
    this.loin.fill(99);
    this.teinte.fill(-1);
    for (const p of d.pistes.values()) this.tamponner(p.chemin, 8, COULEURS_PISTE.indexOf(p.couleur));
    const damee = (i: number) => t.ombre[i] <= 1 ? c['neige-damee'] : [c['neige-0'], c['neige-1'], c['neige-2']][t.ombre[i] - 1];
    const bords = COULEURS_PISTE.map(k => c[`piste-${k}`]);
    for (let i = 0; i < b.length; i++) {
      if (this.loin[i] <= 4.8) b[i] = damee(i);
      else if (this.loin[i] <= 6.6) b[i] = bords[this.teinte[i]];
    }

    this.lignes = [...d.remontees.values()].map(r => this.ligneDe(r));
    // Sous un téléski, une trace damée.
    for (const l of this.lignes) if (l.r.type === 'teleski') {
      const x0 = Math.floor(Math.min(l.a[0], l.b[0]) - 3), x1 = Math.ceil(Math.max(l.a[0], l.b[0]) + 3);
      const y0 = Math.floor(Math.min(l.a[1], l.b[1]) - 3), y1 = Math.ceil(Math.max(l.a[1], l.b[1]) + 3);
      for (let y = Math.max(0, y0); y <= Math.min(HAUTEUR - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(LARGEUR - 1, x1); x++)
        if (distanceSegment([x, y], l.a, l.b) < 2.4) b[y * LARGEUR + x] = damee(y * LARGEUR + x);
    }

    // Les plateformes, puis tout ce qui a de la hauteur, du haut vers le bas de la carte.
    const libres = d.carte.emplacements.filter(e => ![...d.noeuds.values()].some(n => n.emplacement === e.id));
    for (const n of d.noeuds.values()) this.plateforme(b, c, n.type, n.x, n.y);
    for (const e of libres) this.plateforme(b, c, 'emplacement', e.x, e.y);

    const debout: { y: number; ombre?: () => void; poser: () => void }[] = [];
    const ombreEtroite = (x: number, y: number) => () => {
      for (let dx = 1; dx <= 4; dx++) poser(b, x + dx, y, c[dx < 3 ? 'neige-3' : 'neige-2']);
      poser(b, x + 2, y - 1, c['neige-2']);
      poser(b, x + 3, y - 1, c['neige-2']);
    };
    const ombreLarge = (s: Dessin, x: number, y: number) => () => {
      for (let dx = -(s.l >> 1) + 3; dx <= (s.l >> 1) + 3; dx++) { poser(b, x + dx, y + 1, c['neige-2']); poser(b, x + dx, y + 2, c['neige-2']); }
    };
    const ouverts = [...d.noeuds.values()].map(n => ({ x: n.x, y: n.y, type: n.type as TypeNoeud | 'emplacement' }));
    const presDUnNoeud = (x: number, y: number) => [...ouverts, ...libres.map(e => ({ ...e, type: 'emplacement' as const }))].some(n => {
      const { rx, ry, dy } = plateforme(n.type);
      return ((x - n.x) / (rx + 14)) ** 2 + ((y - n.y + dy) / (ry + 14 * 0.8 + 16)) ** 2 <= 1;
    });
    for (const s of t.sapins) {
      if (this.loin[s.y * LARGEUR + s.x] < 13 || presDUnNoeud(s.x, s.y)) continue;
      if (this.lignes.some(l => distanceSegment([s.x, s.y], l.a, l.b) < 13)) continue;
      const dessin = D[s.petit ? 'petitSapin' : 'sapin'];
      debout.push({ y: s.y, ombre: ombreEtroite(s.x, s.y), poser: () => poserDessin(b, dessin, s.x, s.y) });
    }
    for (const n of d.noeuds.values()) debout.push({ y: n.y, poser: () => this.noeud(b, c, D, n) });
    for (const e of libres) debout.push({
      y: e.y, poser: () => {
        for (const dx of [-12, 12]) for (let dy = 0; dy < 5; dy++) poser(b, e.x + dx, e.y - 3 - dy, dy === 4 ? c.encre : c['bois-1']);
      },
    });
    for (const l of this.lignes) {
      const p = D[LIGNE[l.r.type].pylone];
      for (const [x, y] of l.pylones) debout.push({ y, ombre: p.l <= 5 ? ombreEtroite(x, y) : ombreLarge(p, x, y), poser: () => poserDessin(b, p, x, y) });
      for (const [x, y] of [l.a, l.b]) debout.push({ y, ombre: ombreLarge(D.gare, x, y), poser: () => poserDessin(b, D.gare, x, y) });
    }
    debout.sort((u, v) => u.y - v.y);
    for (const s of debout) s.ombre?.();
    for (const s of debout) s.poser();

    for (const l of this.lignes) this.cables(b, l, c.cable);
  }

  /** Marque, pour chaque pixel proche du chemin, sa distance au chemin et la couleur de la piste. */
  private tamponner(chemin: readonly Point[], r: number, teinte: number): void {
    for (let k = 0; k < chemin.length; k += 2) {
      const [sx, sy] = chemin[k];
      for (let y = Math.max(0, Math.floor(sy - r)); y <= Math.min(HAUTEUR - 1, Math.ceil(sy + r)); y++)
        for (let x = Math.max(0, Math.floor(sx - r)); x <= Math.min(LARGEUR - 1, Math.ceil(sx + r)); x++) {
          const dd = Math.hypot(x - sx, y - sy), i = y * LARGEUR + x;
          if (dd < this.loin[i]) { this.loin[i] = dd; this.teinte[i] = teinte; }
        }
    }
  }

  private plateforme(b: Uint32Array, c: Pixels, type: TypeNoeud | 'emplacement', x: number, y: number): void {
    const { rx, ry, dy } = plateforme(type), cy = y - dy;
    const dedans = (px: number, py: number) => ((px - x) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1;
    for (let py = Math.floor(cy - ry); py <= Math.ceil(cy + ry); py++) for (let px = Math.floor(x - rx); px <= Math.ceil(x + rx); px++) {
      if (!dedans(px, py)) continue;
      const bord = !dedans(px + 1, py) || !dedans(px - 1, py) || !dedans(px, py + 1) || !dedans(px, py - 1);
      const ombre = py >= cy || px > x + rx * 0.6;
      poser(b, px, py, !bord ? c['neige-damee'] : type === 'intersection' ? c.encre : ombre ? c['neige-3'] : c['neige-0']);
    }
  }

  private noeud(b: Uint32Array, c: Pixels, D: Record<NomDessin, Dessin>, n: Noeud): void {
    const { x, y } = n;
    if (n.type === 'station') {
      poserDessin(b, D.immeubleBeton, x - 11, y - 10);
      poserDessin(b, D.immeubleBois, x + 10, y - 8);
      poserDessin(b, D.chalet, x - 21, y - 1);
      poserDessin(b, D.chalet, x + 22, y - 1);
      poserDessin(b, D.chalet, x, y + 3);
    } else if (n.type === 'intersection') {
      // Un poteau, et une plaque par piste qui en part, à sa couleur.
      const px = Math.round(x) + 9, py = Math.round(y) + 1;
      for (let yy = py - 18; yy <= py; yy++) { poser(b, px, yy, c['bois-0']); poser(b, px + 1, yy, c['bois-1']); }
      this.domaine.liens(n.id).sortantes.slice(0, 3).forEach((p, k) => {
        const col = c[`piste-${p.couleur}`], gauche = k % 2 === 1, y0 = py - 17 + k * 6;
        for (let dy = 0; dy < 4; dy++) for (let dx = 0; dx < 8; dx++) poser(b, gauche ? px - 8 + dx : px + 2 + dx, y0 + dy, col);
        poser(b, gauche ? px - 9 : px + 10, y0 + 1, col);
        poser(b, gauche ? px - 9 : px + 10, y0 + 2, col);
      });
    } else {
      if (n.type === 'raquettes') for (let k = 0; k < 7; k++) poser(b, x + 7 + k * 3, y + 4 - (k % 2), c['neige-3']);
      poserDessin(b, D[DESSIN_LIEU[n.type]!], x, y);
    }
  }

  private ligneDe(r: Remontee): Ligne {
    const bas = this.domaine.noeuds.get(r.bas)!, haut = this.domaine.noeuds.get(r.haut)!;
    const a = this.bord(bas, haut), b = this.bord(haut, bas), g = LIGNE[r.type];
    const long = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(long / 36));
    const pylones: Point[] = [];
    for (let k = 1; k < n; k++) pylones.push([Math.round(a[0] + (b[0] - a[0]) * k / n), Math.round(a[1] + (b[1] - a[1]) * k / n)]);
    const cable = [
      { t: 0, x: a[0], y: a[1] - 7 },
      ...pylones.map(([x, y], k) => ({ t: (k + 1) / n, x, y: y - g.poteau })),
      { t: 1, x: b[0], y: b[1] - 7 },
    ];
    return { r, a, b, pylones, cable, vehicules: Math.max(3, Math.round(long / g.espace)), vitesse: VITESSE / long };
  }

  /** Le point du bord de la plateforme de n, du côté de l'autre nœud : la gare s'y pose. */
  private bord(n: Noeud, vers: Noeud): Point {
    const [cx, cy] = this.domaine.accroche(n), [tx, ty] = this.domaine.accroche(vers), { rx, ry } = plateforme(n.type);
    const dx = tx - cx, dy = ty - cy, l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l;
    const r = 1 / Math.sqrt((ux / rx) ** 2 + (uy / ry) ** 2);
    return [Math.round(cx + ux * (r + 3)), Math.round(cy + uy * (r + 3))];
  }

  private cables(b: Uint32Array, l: Ligne, couleur: number): void {
    for (const off of LIGNE[l.r.type].brins) for (let k = 0; k + 1 < l.cable.length; k++)
      ligne(b, l.cable[k].x + off, l.cable[k].y, l.cable[k + 1].x + off, l.cable[k + 1].y, couleur);
  }

  // ---------- ce qui bouge ----------

  private dessinerMobile(px: Uint32Array, vue: Vue): void {
    const c = PIXELS[vue.phase], jour = vue.phase === 'jour', d = this.domaine;
    const clignote = Math.floor(vue.temps * 3) % 2 === 0;

    // Les véhicules : ils tournent le jour, ils attendent la nuit.
    for (const l of this.lignes) for (const off of LIGNE[l.r.type].brins) {
      const descend = off < 0;
      for (let k = 0; k < l.vehicules; k++) {
        const ph = ((jour ? vue.temps * l.vitesse : 0) + k / l.vehicules) % 1, t = descend ? 1 - ph : ph;
        if (t < 0.05 || t > 0.95) continue;
        const [cx, cy] = surCable(l, t);
        if (l.r.type === 'teleski') {
          const gx = Math.round(l.a[0] + (l.b[0] - l.a[0]) * t), gy = Math.round(l.a[1] + (l.b[1] - l.a[1]) * t);
          ligne(px, cx, cy + 1, gx, gy - 6, c.cable);
        } else if (l.r.type === 'telesiege') siege(px, c, cx + off, cy);
        else cabine(px, c, cx + off, cy);
      }
    }

    // Les nœuds pas encore reliés : des pointillés qui tournent.
    for (const n of d.noeuds.values()) if (!d.estRelie(n.id)) {
      const { rx, ry, dy } = plateforme(n.type);
      anneau(px, jour ? c.encre : c.lumiere, n.x, n.y - dy, rx + 5, ry + 4, vue.temps, true);
    }

    if (vue.noeudChoisi) {
      const n = d.noeuds.get(vue.noeudChoisi);
      if (n) { const { rx, ry, dy } = plateforme(n.type); anneau(px, c['jaune-remontee'], n.x, n.y - dy, rx + 5, ry + 4, 0, false); }
    }
    if (vue.emplacementChoisi) {
      const e = d.carte.emplacements.find(x => x.id === vue.emplacementChoisi);
      if (e) { const { rx, ry, dy } = plateforme('emplacement'); anneau(px, c.lumiere, e.x, e.y - dy, rx + 5, ry + 4, 0, false); }
    }
    if (vue.pisteChoisie && clignote) {
      const p = d.pistes.get(vue.pisteChoisie);
      if (p) for (let k = 0; k < p.chemin.length; k += 2) trait(px, p.chemin[k], 1, c.lumiere);
    }
    if (vue.remonteeChoisie && clignote) {
      const l = this.lignes.find(x => x.r.id === vue.remonteeChoisie);
      if (l) this.cables(px, l, c.lumiere);
    }
    if (vue.trace) {
      const col = vue.trace.trop ? c['orange-balise'] : c[`piste-${vue.trace.couleur}`];
      for (let k = 0; k < vue.trace.chemin.length; k += 2) trait(px, vue.trace.chemin[k], 1.5, col);
    }
  }
}

function surCable(l: Ligne, t: number): Point {
  const p = l.cable;
  for (let k = 0; k + 1 < p.length; k++) {
    const a = p[k], b = p[k + 1];
    if (t <= b.t) { const u = (t - a.t) / ((b.t - a.t) || 1); return [Math.round(a.x + (b.x - a.x) * u), Math.round(a.y + (b.y - a.y) * u)]; }
  }
  const z = p[p.length - 1];
  return [z.x, z.y];
}

function siege(px: Uint32Array, c: Pixels, x: number, y: number): void {
  for (let i = 1; i <= 3; i++) poser(px, x, y + i, c.cable);
  for (let dx = -3; dx <= 3; dx++) { poser(px, x + dx, y + 4, c.encre); poser(px, x + dx, y + 8, c.encre); }
}

function cabine(px: Uint32Array, c: Pixels, x: number, y: number): void {
  for (let i = 1; i <= 3; i++) poser(px, x, y + i, c.encre);
  for (let yy = 4; yy <= 12; yy++) for (let dx = -3; dx <= 3; dx++) {
    if ((yy === 4 || yy === 12) && Math.abs(dx) === 3) continue;
    const vitre = Math.abs(dx) <= 2 && yy >= 6 && yy <= 8;
    poser(px, x + dx, y + yy, vitre ? (dx === 0 ? c['jaune-remontee'] : c['ciel-1']) : c['jaune-remontee']);
  }
}

/** Un anneau autour d'une plateforme : en pointillés qui tournent, ou plein. */
function anneau(px: Uint32Array, col: number, cx: number, cy: number, rx: number, ry: number, temps: number, pointilles: boolean): void {
  const n = Math.round(2 * Math.PI * Math.max(rx, ry)), decale = Math.floor(temps * 10);
  for (let k = 0; k < n; k++) {
    if (pointilles && (k + decale) % 6 >= 3) continue;
    const a = k / n * 2 * Math.PI;
    poser(px, Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), col);
  }
}

/** Un disque plein de rayon r. */
function trait(px: Uint32Array, [sx, sy]: Point, r: number, col: number): void {
  for (let y = Math.floor(sy - r); y <= Math.ceil(sy + r); y++) for (let x = Math.floor(sx - r); x <= Math.ceil(sx + r); x++)
    if ((x - sx) ** 2 + (y - sy) ** 2 <= r * r) poser(px, x, y, col);
}
