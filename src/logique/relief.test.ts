import { describe, expect, it } from 'vitest';
import { CHOCARDS } from '../cartes/chocards';
import { spline, type Point } from './geometrie';
import { classe, penteMax, remonteeMax } from './pente';
import { Relief } from './relief';

const relief = new Relief(CHOCARDS);

// Les nœuds et les dix tronçons du domaine d'essai de la planche (docs/charte/planche.html),
// à la hauteur de leur plateforme.
const NOEUDS: Record<string, Point> = {
  s1: [330, 404], resto: [495, 226], cafe: [225, 286], som: [453, 44], vue: [294, 145],
  luge: [150, 355], park: [588, 295], j1: [540, 120], j2: [430, 345],
};
const TRONCONS: [string, string, Point[]][] = [
  ['som', 'j1', [[484, 78], [510, 108]]],
  ['j1', 'park', [[585, 170], [600, 240]]],
  ['j1', 'resto', [[525, 170]]],
  ['resto', 'j2', [[500, 280], [470, 320]]],
  ['park', 'j2', [[540, 340], [480, 350]]],
  ['j2', 's1', [[390, 380], [360, 400]]],
  ['som', 'vue', [[405, 66], [360, 93], [321, 123]]],
  ['vue', 'cafe', [[267, 192], [243, 240]]],
  ['cafe', 'luge', [[192, 315]]],
  ['luge', 's1', [[192, 387], [258, 405]]],
];
const chemin = ([de, a, via]: (typeof TRONCONS)[number]) => spline([NOEUDS[de], ...via, NOEUDS[a]], 0.5);

describe('le relief des Chocards', () => {
  it('est celui de la planche : ses dix tronçons ont les couleurs de la charte', () => {
    const pentes = TRONCONS.map(t => penteMax(relief, chemin(t)));
    const couleurs = pentes.map(classe);
    expect(couleurs.filter(c => c === 'noire')).toHaveLength(1);
    expect(couleurs.filter(c => c === 'rouge')).toHaveLength(1);
    expect(couleurs.filter(c => c === 'bleue')).toHaveLength(4);
    expect(couleurs.filter(c => c === 'verte')).toHaveLength(4);
    // « le couloir sous le sommet (65 %) est noir, la descente du sommet au point de vue (59 %) rouge »
    expect(Math.round(pentes[0] * 100)).toBe(65);
    expect(Math.round(pentes[6] * 100)).toBe(59);
  });

  it('monte d’environ 800 m de la station au sommet', () => {
    const station = relief.altitude(NOEUDS.s1), sommet = relief.altitude(NOEUDS.som);
    expect(station).toBeGreaterThan(1580);
    expect(station).toBeLessThan(1650);
    expect(sommet - station).toBeGreaterThan(700);
    expect(sommet - station).toBeLessThan(900);
  });

  it('a des pistes qui descendent : aucun tronçon de la planche ne remonte de plus de 10 m', () => {
    for (const t of TRONCONS) expect(remonteeMax(relief, chemin(t))).toBeLessThanOrEqual(10);
  });
});

describe('classe', () => {
  it('coupe aux seuils de la charte', () => {
    expect(classe(0.2499)).toBe('verte');
    expect(classe(0.25)).toBe('bleue');
    expect(classe(0.3999)).toBe('bleue');
    expect(classe(0.40)).toBe('rouge');
    expect(classe(0.5999)).toBe('rouge');
    expect(classe(0.60)).toBe('noire');
  });
});
