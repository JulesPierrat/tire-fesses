/* Le domaine : un graphe de nœuds reliés par des pistes qui descendent et des remontées qui montent. */

import type { Carte } from './carte';
import { croisement, distance, longueur, plusProche, simplifier, spline, type Point } from './geometrie';
import { HAUTEUR_DESSIN, LIEUX, NOMS, plateforme, REMONTEES, type TypeLieu, type TypeNoeud, type TypeRemontee } from './noeuds';
import { classe, penteMax, remonteeMax, type CouleurPiste } from './pente';
import { DENIVELE_REMONTEE_MIN, LONGUEUR_REMONTEE_MAX, MPX, REMONTEE_PISTE_MAX } from './reglages';
import type { Relief } from './relief';

export interface Noeud {
  id: string;
  type: TypeNoeud;
  nom: string;
  /** L'ancre du dessin : le pixel du bas, au milieu. */
  x: number;
  y: number;
  /** L'emplacement où ce lieu a été ouvert. */
  emplacement?: string;
}

/** Un tronçon : d'un nœud au suivant, sans intersection entre les deux. */
export interface Piste {
  id: string;
  de: string;
  a: string;
  /** Un point tous les demi-pixels environ, du départ à l'arrivée. */
  chemin: Point[];
  pente: number;
  couleur: CouleurPiste;
}

export interface Remontee {
  id: string;
  type: TypeRemontee;
  bas: string;
  haut: string;
}

export type Resultat<T> = { ok: true; valeur: T } | { ok: false; raison: string };
const echec = (raison: string): { ok: false; raison: string } => ({ ok: false, raison });

/** Une étude de remontée entre deux nœuds, avant d'en choisir le type. */
export interface EtudeRemontee {
  bas: string;
  haut: string;
  /** La longueur du câble, en mètres. */
  longueur: number;
  denivele: number;
  possibles: Record<TypeRemontee, boolean>;
}

/** Ce que donne un tracé en cours : son chemin, sa couleur, et ce qui ne va pas. */
export interface Apercu {
  chemin: Point[];
  pente: number;
  couleur: CouleurPiste;
  /** De combien de mètres le tracé remonte au plus. */
  remontee: number;
  trop: boolean;
}

/** Là où une piste part ou arrive : un nœud, ou un point d'une autre piste. */
type Ancre = { noeud: Noeud } | { piste: Piste; point: Point };

const ECART_TRACE = 6;      // px entre deux points gardés d'un tracé à la main
const PRES = 12;            // px : plus près d'un nœud ou d'un bout, on s'y accroche

export class Domaine {
  readonly noeuds = new Map<string, Noeud>();
  readonly pistes = new Map<string, Piste>();
  readonly remontees = new Map<string, Remontee>();
  /** Augmente à chaque changement : le dessin sait quand se refaire. */
  version = 0;
  private prochain = 1;
  private relies?: Set<string>;

  constructor(readonly carte: Carte, readonly relief: Relief) {
    for (const n of carte.noeuds) this.noeuds.set(n.id, { ...n });
  }

  // ---------- regarder ----------

  /** Le point où les liens s'accrochent : le centre de la plateforme. */
  accroche(n: Noeud): Point {
    return [n.x, n.y - plateforme(n.type).dy];
  }

  altitude(n: Noeud): number {
    return Math.round(this.relief.altitude(this.accroche(n)));
  }

  /** Le nœud touché en p : sa plateforme, agrandie de `marge`, ou son dessin. */
  noeudSous(p: Point, marge = 0): Noeud | undefined {
    let meilleur: Noeud | undefined, d = Infinity;
    for (const n of this.noeuds.values()) {
      const dn = this.distanceNoeud(n.type, n.x, n.y, p, marge);
      if (dn < d) { d = dn; meilleur = n; }
    }
    return meilleur;
  }

  /** L'emplacement libre touché en p. */
  emplacementSous(p: Point, marge = 0): { id: string; x: number; y: number } | undefined {
    const pris = new Set([...this.noeuds.values()].map(n => n.emplacement));
    return this.carte.emplacements.find(e => !pris.has(e.id) && this.distanceNoeud('emplacement', e.x, e.y, p, marge) < Infinity);
  }

  /** La piste qui passe sous p, et le point du chemin le plus proche. */
  pisteSous(p: Point, marge = 0): { piste: Piste; index: number } | undefined {
    let meilleur: { piste: Piste; index: number } | undefined, d = 6 + marge;
    for (const piste of this.pistes.values()) {
      const q = plusProche(piste.chemin, p);
      if (q.distance <= d) { d = q.distance; meilleur = { piste, index: q.index }; }
    }
    return meilleur;
  }

  /** La remontée qui passe sous p. */
  remonteeSous(p: Point, marge = 0): Remontee | undefined {
    for (const r of this.remontees.values()) {
      const a = this.accroche(this.noeuds.get(r.bas)!), b = this.accroche(this.noeuds.get(r.haut)!);
      const vx = b[0] - a[0], vy = b[1] - a[1], t = ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / (vx * vx + vy * vy);
      if (t < 0.1 || t > 0.9) continue;
      if (Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vy * t) <= 5 + marge) return r;
    }
    return undefined;
  }

  /** Les liens d'un nœud. */
  liens(id: string): { entrantes: Piste[]; sortantes: Piste[]; remontees: Remontee[] } {
    const pistes = [...this.pistes.values()], remontees = [...this.remontees.values()];
    return {
      entrantes: pistes.filter(p => p.a === id),
      sortantes: pistes.filter(p => p.de === id),
      remontees: remontees.filter(r => r.bas === id || r.haut === id),
    };
  }

  /** Un nœud est relié s'il tient, par des pistes ou des remontées, à la première station. */
  estRelie(id: string): boolean {
    if (!this.relies) {
      const voisins = new Map<string, string[]>();
      const lier = (a: string, b: string) => {
        voisins.set(a, [...(voisins.get(a) ?? []), b]);
        voisins.set(b, [...(voisins.get(b) ?? []), a]);
      };
      for (const p of this.pistes.values()) lier(p.de, p.a);
      for (const r of this.remontees.values()) lier(r.bas, r.haut);
      const depart = this.carte.noeuds.find(n => n.type === 'station')!.id;
      const vus = new Set([depart]), file = [depart];
      while (file.length) for (const v of voisins.get(file.shift()!) ?? []) if (!vus.has(v)) { vus.add(v); file.push(v); }
      this.relies = vus;
    }
    return this.relies.has(id);
  }

  /** La longueur d'une piste, en mètres. */
  longueurPiste(p: Piste): number {
    return longueur(p.chemin) * MPX;
  }

  // ---------- tracer une piste ----------

  /** Le chemin d'un tracé en cours, sa couleur, et s'il remonte trop. */
  apercu(points: readonly Point[], marge = 0): Apercu | undefined {
    const dep = this.ancre(points[0], marge);
    if (!dep || points.length < 2) return undefined;
    const fin = points[points.length - 1], arr = this.ancre(fin, marge);
    const pa = this.pointAncre(dep), pb = arr && !this.memeAncre(dep, arr) ? this.pointAncre(arr) : fin;
    const milieu = simplifier(points.slice(1, -1), ECART_TRACE).filter(p => distance(p, pa) > 8 && distance(p, pb) > 8);
    const chemin = spline([pa, ...milieu, pb], 0.5);
    const pente = penteMax(this.relief, chemin), remontee = remonteeMax(this.relief, chemin);
    return { chemin, pente, couleur: classe(pente), remontee, trop: remontee > REMONTEE_PISTE_MAX };
  }

  /**
   * Trace une piste le long de `points`, d'un nœud ou d'une piste jusqu'à un nœud ou une piste.
   * Une intersection naît là où elle part d'une piste, en rejoint une ou en croise une : le tracé
   * est alors coupé en tronçons, chacun de la couleur de son passage le plus raide.
   */
  tracerPiste(points: readonly Point[], marge = 0): Resultat<Piste[]> {
    const dep = points.length >= 2 ? this.ancre(points[0], marge) : undefined;
    if (!dep) return echec('Une piste part d’un nœud ou d’une autre piste.');
    const arr = this.ancre(points[points.length - 1], marge);
    if (!arr) return echec('Une piste finit sur un nœud ou sur une autre piste.');
    if (this.memeAncre(dep, arr)) return echec('Une piste relie deux nœuds différents.');
    const vue = this.apercu(points, marge)!, chemin = vue.chemin;
    if (longueur(chemin) < 12) return echec('Glissez plus loin pour tracer une piste.');
    if (vue.trop) return echec(`Ce tracé remonte de ${Math.round(vue.remontee)}\u00a0m\u00a0: une piste ne remonte jamais de plus de ${REMONTEE_PISTE_MAX}\u00a0m.`);

    // Les coupures le long du tracé : les nœuds qu'il traverse et les pistes qu'il croise.
    type Coupure = { i: number; noeud?: Noeud; point?: Point };
    const debut = this.pointAncre(dep), bout = this.pointAncre(arr);
    const loinDesBouts = (q: Point) => distance(q, debut) > PRES && distance(q, bout) > PRES;
    const milieu: Coupure[] = [];
    for (const n of this.noeuds.values()) {
      if (('noeud' in dep && dep.noeud === n) || ('noeud' in arr && arr.noeud === n)) continue;
      const c = this.accroche(n), { rx, ry } = plateforme(n.type);
      let meilleur = -1, d = Infinity;
      chemin.forEach((q, i) => {
        const dq = ((q[0] - c[0]) / rx) ** 2 + ((q[1] - c[1]) / ry) ** 2;
        if (dq <= 1 && dq < d) { d = dq; meilleur = i; }
      });
      if (meilleur >= 0) milieu.push({ i: meilleur, noeud: n });
    }
    for (const piste of this.pistes.values()) {
      for (const x of croisements(chemin, piste.chemin)) {
        const pres = [...this.noeuds.values()].some(n => distance(this.accroche(n), x.point) < PRES);
        if (!pres && loinDesBouts(x.point)) milieu.push({ i: x.i, point: x.point });
      }
    }
    milieu.sort((a, b) => a.i - b.i);
    const coupures: Coupure[] = [{ i: 0, ...this.coupureAncre(dep) }];
    for (const c of milieu) {
      const prec = coupures[coupures.length - 1];
      if (c.i - prec.i < 2 * PRES || chemin.length - 1 - c.i < 2 * PRES) {
        if (c.noeud && !prec.noeud && prec.i !== 0) coupures[coupures.length - 1] = c; // un nœud l'emporte sur un croisement
        continue;
      }
      coupures.push(c);
    }
    coupures.push({ i: chemin.length - 1, ...this.coupureAncre(arr) });

    // Chaque coupure devient un nœud : celui traversé, ou une intersection au point de la piste coupée.
    const ids = coupures.map(c => c.noeud ? c.noeud.id : this.couperPiste(c.point!));
    const tronçons: Piste[] = [];
    for (let k = 0; k + 1 < coupures.length; k++) {
      if (ids[k] === ids[k + 1]) continue;
      const morceau = chemin.slice(coupures[k].i, coupures[k + 1].i + 1);
      morceau[0] = this.accroche(this.noeuds.get(ids[k])!);
      morceau[morceau.length - 1] = this.accroche(this.noeuds.get(ids[k + 1])!);
      tronçons.push(this.ajouterPiste(ids[k], ids[k + 1], morceau));
    }
    this.changer();
    return { ok: true, valeur: tronçons };
  }

  // ---------- poser une remontée ----------

  /** Étudie une remontée entre deux nœuds, dans un sens ou dans l'autre : elle monte toujours. */
  etudierRemontee(a: string, b: string): Resultat<EtudeRemontee> {
    if (a === b) return echec('Touchez un autre nœud pour l’autre bout de la remontée.');
    let bas = this.noeuds.get(a)!, haut = this.noeuds.get(b)!;
    if (this.altitude(bas) > this.altitude(haut)) [bas, haut] = [haut, bas];
    const denivele = this.altitude(haut) - this.altitude(bas);
    if (denivele < DENIVELE_REMONTEE_MIN) return echec('Ces deux nœuds sont presque à la même hauteur\u00a0: une remontée doit monter.');
    const l = Math.round(Math.hypot(distance(this.accroche(bas), this.accroche(haut)) * MPX, denivele));
    const possibles = Object.fromEntries(REMONTEES.map(t => [t, l <= LONGUEUR_REMONTEE_MAX[t]])) as Record<TypeRemontee, boolean>;
    return { ok: true, valeur: { bas: bas.id, haut: haut.id, longueur: l, denivele, possibles } };
  }

  poserRemontee(a: string, b: string, type: TypeRemontee): Resultat<Remontee> {
    const etude = this.etudierRemontee(a, b);
    if (!etude.ok) return etude;
    const { bas, haut, longueur: l } = etude.valeur;
    if (!etude.valeur.possibles[type]) return echec(`Trop long pour un ${NOMS[type].toLowerCase()}\u00a0: ${km(l)}, pour ${km(LONGUEUR_REMONTEE_MAX[type])} au plus.`);
    const r: Remontee = { id: this.nouvelId('r'), type, bas, haut };
    this.remontees.set(r.id, r);
    this.changer();
    return { ok: true, valeur: r };
  }

  // ---------- ouvrir un lieu ----------

  ouvrirLieu(emplacement: string, type: TypeLieu): Resultat<Noeud> {
    const e = this.carte.emplacements.find(x => x.id === emplacement);
    if (!e) return echec('Cet emplacement n’existe pas.');
    if ([...this.noeuds.values()].some(n => n.emplacement === emplacement)) return echec('Cet emplacement est déjà pris.');
    if (!LIEUX.includes(type)) return echec('Ce lieu n’existe pas.');
    const n: Noeud = { id: this.nouvelId('l'), type, nom: NOMS[type], x: e.x, y: e.y, emplacement };
    this.noeuds.set(n.id, n);
    this.changer();
    return { ok: true, valeur: n };
  }

  // ---------- démolir ----------

  demolirPiste(id: string): void {
    const p = this.pistes.get(id);
    if (!p) return;
    this.pistes.delete(id);
    this.ranger(p.de);
    this.ranger(p.a);
    this.changer();
  }

  demolirRemontee(id: string): void {
    const r = this.remontees.get(id);
    if (!r) return;
    this.remontees.delete(id);
    this.ranger(r.bas);
    this.ranger(r.haut);
    this.changer();
  }

  /** Démolit un lieu ouvert, avec ses pistes et ses remontées. */
  demolirLieu(id: string): void {
    const n = this.noeuds.get(id);
    if (!n || !n.emplacement) return;
    const { entrantes, sortantes, remontees } = this.liens(id);
    for (const p of [...entrantes, ...sortantes]) this.demolirPiste(p.id);
    for (const r of remontees) this.demolirRemontee(r.id);
    this.noeuds.delete(id);
    this.changer();
  }

  // ---------- sauvegarder ----------

  versSauvegarde(): Sauvegarde {
    const r2 = (v: number) => Math.round(v * 100) / 100;
    return {
      version: 1,
      carte: this.carte.id,
      prochain: this.prochain,
      noeuds: [...this.noeuds.values()].filter(n => n.type === 'intersection' || n.emplacement)
        .map(({ id, type, x, y, emplacement }) => ({ id, type, x: r2(x), y: r2(y), emplacement })),
      pistes: [...this.pistes.values()].map(p => ({ id: p.id, de: p.de, a: p.a, chemin: p.chemin.flatMap(q => [r2(q[0]), r2(q[1])]) })),
      remontees: [...this.remontees.values()].map(r => ({ ...r })),
    };
  }

  /** Reprend une partie enregistrée. Lève une erreur si elle ne se lit plus. */
  static depuisSauvegarde(carte: Carte, relief: Relief, s: Sauvegarde): Domaine {
    if (s?.version !== 1 || s.carte !== carte.id) throw new Error('sauvegarde d’une autre version ou d’une autre carte');
    const d = new Domaine(carte, relief);
    for (const n of s.noeuds) {
      if (n.type !== 'intersection' && !LIEUX.includes(n.type as TypeLieu)) throw new Error(`nœud inconnu : ${n.type}`);
      d.noeuds.set(n.id, { id: n.id, type: n.type, nom: NOMS[n.type], x: n.x, y: n.y, ...(n.emplacement ? { emplacement: n.emplacement } : {}) });
    }
    const existe = (id: string) => { if (!d.noeuds.has(id)) throw new Error(`nœud absent : ${id}`); return id; };
    for (const p of s.pistes) {
      const chemin: Point[] = [];
      for (let k = 0; k + 1 < p.chemin.length; k += 2) chemin.push([p.chemin[k], p.chemin[k + 1]]);
      if (chemin.length < 2) throw new Error(`piste vide : ${p.id}`);
      d.pistes.set(p.id, d.piste(p.id, existe(p.de), existe(p.a), chemin));
    }
    for (const r of s.remontees) {
      if (!REMONTEES.includes(r.type)) throw new Error(`remontée inconnue : ${r.type}`);
      d.remontees.set(r.id, { id: r.id, type: r.type, bas: existe(r.bas), haut: existe(r.haut) });
    }
    d.prochain = s.prochain;
    return d;
  }

  // ---------- en coulisses ----------

  private changer(): void {
    this.version++;
    this.relies = undefined;
  }

  private nouvelId(prefixe: string): string {
    return `${prefixe}${this.prochain++}`;
  }

  private distanceNoeud(type: TypeNoeud | 'emplacement', x: number, y: number, p: Point, marge: number): number {
    const { rx, ry, dy } = plateforme(type), cy = y - dy;
    const dans = ((p[0] - x) / (rx + marge)) ** 2 + ((p[1] - cy) / (ry + marge)) ** 2;
    if (dans <= 1) return dans;
    const sur = Math.abs(p[0] - x) <= rx * 0.7 + marge && p[1] <= cy && p[1] >= y - HAUTEUR_DESSIN[type] - marge;
    return sur ? 1 : Infinity;
  }

  private ancre(p: Point, marge: number): Ancre | undefined {
    const noeud = this.noeudSous(p, marge);
    if (noeud) return { noeud };
    const s = this.pisteSous(p, marge);
    return s ? { piste: s.piste, point: s.piste.chemin[s.index] } : undefined;
  }

  private pointAncre(a: Ancre): Point {
    return 'noeud' in a ? this.accroche(a.noeud) : a.point;
  }

  private coupureAncre(a: Ancre): { noeud?: Noeud; point?: Point } {
    return 'noeud' in a ? { noeud: a.noeud } : { point: a.point };
  }

  private memeAncre(a: Ancre, b: Ancre): boolean {
    return 'noeud' in a && 'noeud' in b ? a.noeud === b.noeud : distance(this.pointAncre(a), this.pointAncre(b)) < PRES;
  }

  /** Coupe la piste qui passe en p par une intersection, ou donne le bout de piste tout proche. */
  private couperPiste(p: Point): string {
    let cible: Piste | undefined, index = 0, d = Infinity;
    for (const piste of this.pistes.values()) {
      const q = plusProche(piste.chemin, p);
      if (q.distance < d) { d = q.distance; cible = piste; index = q.index; }
    }
    const piste = cible!, de = this.noeuds.get(piste.de)!, a = this.noeuds.get(piste.a)!;
    if (distance(this.accroche(de), p) < PRES) return de.id;
    if (distance(this.accroche(a), p) < PRES) return a.id;
    const x: Noeud = { id: this.nouvelId('i'), type: 'intersection', nom: NOMS.intersection, x: p[0], y: p[1] };
    this.noeuds.set(x.id, x);
    this.pistes.delete(piste.id);
    this.ajouterPiste(piste.de, x.id, [...piste.chemin.slice(0, index), p]);
    this.ajouterPiste(x.id, piste.a, [p, ...piste.chemin.slice(index + 1)]);
    return x.id;
  }

  private piste(id: string, de: string, a: string, chemin: Point[]): Piste {
    const pente = penteMax(this.relief, chemin);
    return { id, de, a, chemin, pente, couleur: classe(pente) };
  }

  private ajouterPiste(de: string, a: string, chemin: Point[]): Piste {
    const p = this.piste(this.nouvelId('p'), de, a, chemin);
    this.pistes.set(p.id, p);
    return p;
  }

  /**
   * Après une démolition : une intersection sans lien disparaît ; une intersection où une seule
   * piste arrive et une seule repart redevient un simple point de passage, et ses deux tronçons
   * n'en font plus qu'un.
   */
  private ranger(id: string): void {
    const n = this.noeuds.get(id);
    if (!n || n.type !== 'intersection') return;
    const { entrantes, sortantes, remontees } = this.liens(id);
    if (!entrantes.length && !sortantes.length && !remontees.length) this.noeuds.delete(id);
    else if (entrantes.length === 1 && sortantes.length === 1 && !remontees.length) {
      const [e] = entrantes, [s] = sortantes;
      if (e.de === s.a) return;
      this.pistes.delete(e.id);
      this.pistes.delete(s.id);
      this.noeuds.delete(id);
      this.ajouterPiste(e.de, s.a, [...e.chemin, ...s.chemin.slice(1)]);
    }
  }
}

/** Une partie enregistrée, en JSON. */
export interface Sauvegarde {
  version: 1;
  carte: string;
  prochain: number;
  noeuds: { id: string; type: TypeNoeud; x: number; y: number; emplacement?: string }[];
  pistes: { id: string; de: string; a: string; chemin: number[] }[];
  remontees: Remontee[];
}

/** Les points où deux chemins se croisent, avec leur place sur le premier. */
function croisements(a: readonly Point[], b: readonly Point[]): { i: number; point: Point }[] {
  const PAS = 4, sortie: { i: number; point: Point }[] = [];
  const boite = (c: readonly Point[]) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of c) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return { x0, y0, x1, y1 };
  };
  const ba = boite(a), bb = boite(b);
  if (ba.x1 < bb.x0 || bb.x1 < ba.x0 || ba.y1 < bb.y0 || bb.y1 < ba.y0) return sortie;
  for (let i = 0; i < a.length - 1; i += PAS) {
    const a0 = a[i], a1 = a[Math.min(i + PAS, a.length - 1)];
    for (let j = 0; j < b.length - 1; j += PAS) {
      const x = croisement(a0, a1, b[j], b[Math.min(j + PAS, b.length - 1)]);
      if (x) sortie.push({ i, point: x });
    }
  }
  return sortie;
}

/** Une longueur en mètres, lisible : « 850 m », « 1,4 km ». */
export function km(metres: number): string {
  return metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`;
}
