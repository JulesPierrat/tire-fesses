/* Les pictogrammes de l'interface : une pastille de 11 × 11, coins coupés, bordée d'encre,
   remplie de la couleur de sa famille. Repris de la planche. */

import { PALETTES, type Couleur, type Phase } from './palette';

const FAMILLES: Record<string, { fond: Couleur; trait: Couleur }> = {
  rem: { fond: 'jaune-remontee', trait: 'encre' },
  sta: { fond: 'encre', trait: 'neige-0' },
  res: { fond: 'bois-0', trait: 'neige-0' },
  nat: { fond: 'cyan', trait: 'encre' },
  act: { fond: 'violet', trait: 'neige-0' },
};

const PICTOS = {
  teleski: { f: 'rem', l: ['.......kk', '.....kk..', '...kk....', '.kk.k....', 'k...k....', '....k....', '...kkk...', '..kkkkk..', '...kkk...'] },
  telesiege: { f: 'rem', l: ['kkkkkkkkk', '....k....', '....k....', '.kkkk....', '.k.......', '.k.......', '.kkkkkk..', '......k..', '.....kk..'] },
  telecabine: { f: 'rem', l: ['kkkkkkkkk', '....k....', '..kkkkk..', '.kkkkkkk.', '.k..k..k.', '.k..k..k.', '.kkkkkkk.', '.kkkkkkk.', '.........'] },
  station: { f: 'sta', l: ['kkkk.....', 'k..k.....', 'kkkk.....', 'k..k..k..', 'kkkk.kkk.', 'k..kkkkkk', 'kkkk.k.k.', 'k..k.k.k.', 'kkkkkkkkk'] },
  restaurant: { f: 'res', l: ['.k.k.k..k', '.k.k.k.kk', '.k.k.k.kk', '.kkkkk.kk', '..kkk..kk', '...k...kk', '...k....k', '...k....k', '...k....k'] },
  cafe: { f: 'res', l: ['.k..k....', '..k..k...', '.k..k....', '.........', 'kkkkkkk..', 'k.....kkk', 'k.....k.k', 'k.....kkk', '.kkkkk...'] },
  sommet: { f: 'nat', l: ['....kkk..', '....kk...', '....k....', '...kkk...', '..kkkkk..', '..k.k.kk.', '.kkkkkkk.', 'kkkkkkkkk', '.........'] },
  vue: { f: 'nat', l: ['.kk...kk.', '.kk...kk.', 'kkkkkkkkk', 'kkkk.kkkk', 'kkk...kkk', 'k..k.k..k', 'k..k.k..k', 'kkkk.kkkk', '.........'] },
  luge: { f: 'act', l: ['.........', '.........', '.........', '.kkkkkkk.', '.kkkkkkk.', '..k...k..', '..k...k.k', 'kkkkkkkk.', '.........'] },
  raquettes: { f: 'act', l: ['..kkkkk..', '.k.k.k.k.', '.kkkkkkk.', '.k.k.k.k.', '.kkkkkkk.', '..k.k.k..', '...kkk...', '....k....', '....k....'] },
  snowpark: { f: 'act', l: ['......k..', '.....kkk.', '......k..', '.........', '......k..', '....kkk..', '..kkkkk..', 'kkkkkkk..', 'kkkkkkk..'] },
  chiens: { f: 'act', l: ['.........', '......k.k', 'k.....kkk', '.k...kkkk', '..kkkkkk.', '..kkkkkk.', '..k..k.k.', '..k..k.k.', '.........'] },
  parapente: { f: 'act', l: ['..kkkkk..', '.kkkkkkk.', 'kk.....kk', 'k.k...k.k', '...k.k...', '....k....', '...kkk...', '....k....', '...k.k...'] },
  patinoire: { f: 'act', l: ['..kk.....', '..kk.....', '..kkk....', '..kkkkk..', '..kkkkkk.', '.kkkkkkk.', '..k...k..', 'kkkkkkkkk', '.........'] },
};
export type NomPicto = keyof typeof PICTOS;

/** Peint un pictogramme dans une toile de 11 × 11, aux couleurs de la phase. */
export function peindrePicto(toile: HTMLCanvasElement, nom: NomPicto, phase: Phase): void {
  const p = PICTOS[nom], f = FAMILLES[p.f], c = PALETTES[phase];
  toile.width = 11;
  toile.height = 11;
  const ctx = toile.getContext('2d')!;
  ctx.clearRect(0, 0, 11, 11);
  for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) {
    const bx = x === 0 || x === 10, by = y === 0 || y === 10;
    if (bx && by) continue;
    const dedans = !bx && !by && p.l[y - 1][x - 1] === 'k';
    ctx.fillStyle = bx || by ? c.encre : dedans ? c[f.trait] : c[f.fond];
    ctx.fillRect(x, y, 1, 1);
  }
}
