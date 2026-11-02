/* Les dessins de la planche : une lettre = une couleur, l'ancre est le pixel du bas, au milieu. */

import { generateur } from '../logique/hasard';
import { PIXELS, type Couleur, type Phase } from './palette';
import { poser } from './pixels';

const LETTRES: Record<string, Couleur> = {
  s: 'neige-0', S: 'neige-1', n: 'neige-2', N: 'neige-3', e: 'neige-damee',
  a: 'sapin-0', b: 'sapin-1', c: 'sapin-2', t: 'tronc',
  r: 'toit', w: 'bois-0', W: 'bois-1', d: 'encre', k: 'cable', l: 'lumiere', f: 'peau', p: 'encre',
  g: 'roche-0', G: 'roche-1', x: 'roche-2',
  y: 'jaune-remontee', o: 'orange-balise', v: 'violet', m: 'framboise', B: 'ciel-1', I: 'ciel-2',
  h: 'orange-balise', j: 'jaune-remontee',
};

const grille = (w: number, h: number) => Array.from({ length: h }, () => Array<string>(w).fill('.'));
const enLignes = (g: string[][]) => g.map(r => r.join(''));

function composer(w: number, h: number, parts: [string[], number, number][]): string[][] {
  const g = grille(w, h);
  for (const [lignes, x, y] of parts) lignes.forEach((r, j) => [...r].forEach((ch, i) => {
    if (ch !== '.' && g[y + j] && x + i >= 0 && x + i < w) g[y + j][x + i] = ch;
  }));
  return g;
}

function maison(w: number, toit: number, mur: number, o: { auvent?: boolean; fenetres?: number[][]; porteL?: number; porteH?: number } = {}): string[] {
  const g = grille(w, toit + 1 + (o.auvent ? 1 : 0) + mur), mid = (w - 1) / 2;
  for (let r = 0; r < toit; r++) {
    const demi = (r + 1) / toit * (mid + 0.5);
    for (let c = 0; c < w; c++) if (Math.abs(c - mid) <= demi - 0.5) g[r][c] = c > mid + demi * 0.3 ? 'S' : 's';
  }
  let y = toit;
  g[y].fill('r'); y++;
  if (o.auvent) { for (let c = 1; c < w - 1; c++) g[y][c] = c % 2 ? 'o' : 's'; y++; }
  const pl = o.porteL || 3, ph = o.porteH || 4, p0 = Math.round(mid - (pl - 1) / 2);
  for (let r = 0; r < mur; r++, y++) for (let c = 1; c < w - 1; c++) {
    let ch = r === mur - 1 || c === w - 2 ? 'W' : 'w';
    for (const [fx, fy, fl = 2, fh = 2] of o.fenetres || []) if (c >= fx && c < fx + fl && r >= fy && r < fy + fh) ch = 'l';
    if (c >= p0 && c < p0 + pl && r >= mur - ph) ch = 'd';
    g[y][c] = ch;
  }
  return enLignes(g);
}

function immeuble(w: number, etages: number, bois: boolean): string[] {
  const R = generateur(bois ? 9 : 5), F = bois ? 'w' : 'g', Om = bois ? 'W' : 'G', Bo = bois ? 'W' : 'x';
  const lignes = ['s'.repeat(w), 'S'.repeat(w - 1) + 'n', Om.repeat(w - 1) + Bo];
  for (let f = 0; f < etages; f++) {
    let fen = '';
    for (let c = 0; c < w; c++) fen += c === w - 1 ? Bo : c === w - 2 ? Om : (c % 3 === 0 ? F : (R() < 0.55 ? 'l' : 'd'));
    lignes.push(fen, fen, F.repeat(w - 2) + Om + Bo);
  }
  const mid = (w - 1) / 2, porte = [...F.repeat(w - 2) + Om + Bo].map((ch, c) => Math.abs(c - mid) <= 1 ? 'd' : ch).join('');
  lignes.push(porte, porte, Om.repeat(w - 1) + Bo);
  return lignes;
}

function treillis(w: number, h: number): string[] {
  const mid = (w - 1) / 2, lignes = ['k'.repeat(w), 'kk' + '.'.repeat(w - 4) + 'kk'];
  for (let r = 2; r < h; r++) {
    const hw = Math.round(1 + (r - 2) / (h - 3) * (mid - 1.5));
    let s = '';
    for (let c = 0; c < w; c++) {
      const d = Math.abs(c - mid);
      s += (d === hw || (r % 4 === 0 && d < hw) || (r % 4 === 2 && d === Math.round(hw / 2))) ? 'k' : '.';
    }
    lignes.push(s);
  }
  return lignes;
}

const patinoire = (() => {
  const R = generateur(3), lignes: string[] = [];
  for (let y = 0; y < 16; y++) {
    let r = '';
    for (let x = 0; x < 27; x++) {
      const bord = y === 0 || y === 15 || x === 0 || x === 26, coin = (y === 0 || y === 15) && (x === 0 || x === 26);
      r += coin ? '.' : bord ? 'W' : (R() < 0.06 ? 's' : 'I');
    }
    lignes.push(r);
  }
  return lignes;
})();
const CHIEN = ['.g.....', 'ggg...G', 'gGGGGGG', '.GGGGG.', '.G.G.G.'];
const TRAINEAU = ['...hhh..', '...fff..', '..jjjjj.', '..jjjjjW', '.jjjjj.W', '..ppp..W', '..p.p..W', 'WWWWWWWW', 'k......k'];
const attelage = (() => {
  const g = composer(32, 9, [[CHIEN, 0, 4], [CHIEN, 8, 4], [CHIEN, 16, 4], [TRAINEAU, 24, 0]]);
  for (let x = 7; x < 24; x++) if (g[6][x] === '.') g[6][x] = 'k';
  return enLignes(g);
})();

const DESSINS = {
  sapin: ['.....s.....', '....sas....', '....sab....', '...saabb...', '...aabbc...', '..ssaabbc..', '..saabbbc..', '..aaabbcc..', '.ssaaabbcc.', '.saaabbbcc.', '.aaabbbbcc.', 'ssaaabbbccc', 'saaabbbbccc', 'aaaabbbcccc', '.....t.....', '.....t.....'],
  petitSapin: ['...s...', '..sab..', '..abb..', '.ssabc.', '.aabbc.', 'ssaabcc', '.aabbbc', 'saabbbc', 'aaabbcc', '...t...', '...t...'],
  chalet: maison(15, 6, 7, { fenetres: [[2, 1], [11, 1]], porteH: 4 }),
  immeubleBeton: immeuble(13, 8, false),
  immeubleBois: immeuble(13, 5, true),
  restaurant: [...maison(25, 8, 8, { fenetres: [[2, 1], [6, 1], [16, 1], [20, 1]], porteH: 4 }), 'ooo.....ooo...ooo.....ooo', '.k.......k.....k.......k.'],
  cafe: ['....g..g.....', '.....g..g....', '....g..g.....', ...maison(13, 5, 5, { auvent: true, fenetres: [[2, 1, 3, 2], [8, 1, 3, 2]], porteH: 3 })],
  sommet: ['........d........', '.......ddd.......', '........d........', '........d........', '........d........', '.......gdg.......', '......ggGGg......', '.....sggGGGx.....', '....ssgGGGGxx....', '...ssggGGGGxxx...', '..ssgggGGGGxxxx..', '.sssggGGGGGxxxxx.', 'ssgggGGGGGxxxxxxx'],
  vue: ['...kkkkkkk...', '..kBBkkkBBk..', '..kBBkkkBBk..', '...kkkkkkk...', '......k......', '......k......', '......k......', '.....kkk.....', 'wwwwwwwwwwwww', 'WwwwwwwwwwwwW', 'W.W.......W.W', 'W.W.......W.W'],
  luge: ['...hhh...........', '..hhhhh..........', '...fff...........', '..jjjjj..........', '.jjjjjjj.........', '.jjjjjjjppp......', 'wwwwwwwwwwwwwww..', 'WWWWWWWWWWWWWWW..', '.k.....k.....k.k.', 'kkkkkkkkkkkkkkkk.'],
  snowpark: ['...................ss....', '..................sSSn...', '.................sSSSn...', '................sSSSSnN..', '...............sSSSSSnN..', 'kkkkkkkkkkk...sSSSSSSnN..', 'k.........k..sSSSSSSSnN..', 'k.........k..nnnnnnnnnN..', 'k.........k..............', 'kk.......kk..............'],
  parapente: ['kooossoo...', 'kooossoo...', 'k.oossoo...', 'k..sso.....', ...Array<string>(13).fill('k..........'), 'kk.........'],
  chiens: attelage,
  patinoire,
  raquettes: ['.vvvvvvvvv.', '.vsssvsssv.', '.vsssvsssv.', '.vvsvvvsvv.', '.vvvvvvvvv.', '.....W.....', '.....W.....', '.....W.....', '.....W.....', '.....W.....', '.....W.....'],
  gare: ['.nnnnnnnnn.', 'nsssssssSSn', 'GGGGGGGGGGx', 'GgggggggGGx', 'GgkkkkkggGx', 'GgkdddkggGx', 'GgkkkkkggGx', 'GgggggggGGx', 'xxxxxxxxxxx'],
  pyloneTeleski: ['kkkk.', 'k.k..', ...Array<string>(15).fill('..k..'), '.kkk.'],
  pyloneTelesiege: ['k'.repeat(13), 'kk.........kk', ...Array<string>(20).fill('.....kd......'), '....kkdd.....', '...kkkddd....'],
  pyloneTelecabine: treillis(13, 30),
};
export type NomDessin = keyof typeof DESSINS;

/** Un dessin prêt à poser : pour chaque pixel, son décalage depuis l'ancre et sa couleur. */
export interface Dessin { px: number[]; l: number; h: number }

function preparer(lignes: string[], phase: Phase): Dessin {
  const h = lignes.length, l = lignes[0].length, px: number[] = [];
  for (let r = 0; r < h; r++) for (let c = 0; c < l; c++) {
    const nom = LETTRES[lignes[r][c]];
    if (nom) px.push(c - (l >> 1), r - (h - 1), PIXELS[phase][nom]);
  }
  return { px, l, h };
}

const prets: Partial<Record<Phase, Record<NomDessin, Dessin>>> = {};

/** Les dessins dans les couleurs de la phase, préparés une seule fois. */
export function dessins(phase: Phase): Record<NomDessin, Dessin> {
  return prets[phase] ??= Object.fromEntries(
    Object.entries(DESSINS).map(([nom, lignes]) => [nom, preparer(lignes, phase)]),
  ) as Record<NomDessin, Dessin>;
}

/** Pose un dessin, son ancre en (x, y). */
export function poserDessin(px: Uint32Array, d: Dessin, x: number, y: number): void {
  for (let k = 0; k < d.px.length; k += 3) poser(px, x + d.px[k], y + d.px[k + 1], d.px[k + 2]);
}

export const ERREURS_DE_DESSIN = Object.entries(DESSINS)
  .filter(([, lignes]) => lignes.some(r => r.length !== lignes[0].length)).map(([nom]) => nom);
