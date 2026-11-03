import { beforeEach, describe, expect, it } from 'vitest';
import { CHOCARDS } from '../cartes/chocards';
import { Domaine, km } from './domaine';
import type { Point } from './geometrie';
import { Relief } from './relief';

const relief = new Relief(CHOCARDS);
let d: Domaine;
beforeEach(() => { d = new Domaine(CHOCARDS, relief); });

// Du sommet à la station par le couloir noir, le restaurant et l'intersection du bas de la planche.
const GRANDE_DESCENTE: Point[] = [[453, 44], [484, 78], [510, 108], [540, 120], [525, 170], [495, 226], [500, 280], [470, 320], [430, 345], [390, 380], [360, 400], [330, 404]];
// Du sommet au point de vue, puis la combe jusqu'à la station.
const PAR_LA_VUE: Point[] = [[453, 44], [405, 66], [360, 93], [321, 123], [294, 145]];

const pistes = () => [...d.pistes.values()];
const intersections = () => [...d.noeuds.values()].filter(n => n.type === 'intersection');

describe('tracer une piste', () => {
  it('relie deux nœuds par un tronçon de la couleur de son passage le plus raide', () => {
    const r = d.tracerPiste(GRANDE_DESCENTE);
    expect(r.ok).toBe(true);
    expect(pistes()).toHaveLength(1);
    expect(pistes()[0]).toMatchObject({ de: 'sommet', a: 'station', couleur: 'noire' });
    expect(d.estRelie('sommet')).toBe(true);
    expect(d.estRelie('vue')).toBe(false);
  });

  it('refuse un tracé qui remonte de plus de 10 m', () => {
    const r = d.tracerPiste([...GRANDE_DESCENTE].reverse());
    expect(r).toMatchObject({ ok: false });
    expect(!r.ok && r.raison).toMatch(/^Ce tracé remonte de \d+\u00a0m\u00a0: une piste ne remonte jamais de plus de 10\u00a0m\.$/);
    expect(pistes()).toHaveLength(0);
  });

  it('refuse un tracé qui ne part ni n’arrive sur un nœud ou une piste', () => {
    expect(d.tracerPiste([[600, 60], [600, 200]])).toEqual({ ok: false, raison: 'Une piste part d’un nœud ou d’une autre piste.' });
    expect(d.tracerPiste([[453, 44], [470, 150]])).toEqual({ ok: false, raison: 'Une piste finit sur un nœud ou sur une autre piste.' });
  });

  it('crée une intersection quand une piste part du milieu d’une autre, et coupe celle-ci en deux', () => {
    d.tracerPiste(GRANDE_DESCENTE);
    const r = d.tracerPiste([[495, 226], [440, 300], [380, 360], [345, 398]]);
    expect(r.ok).toBe(true);
    expect(intersections()).toHaveLength(1);
    const x = intersections()[0].id;
    expect(pistes().map(p => `${p.de}→${p.a}`).sort()).toEqual([`${x}→station`, `${x}→station`, `sommet→${x}`].sort());
    // Le haut garde le couloir noir ; le bas, plus doux, change de couleur.
    expect(pistes().find(p => p.de === 'sommet')!.couleur).toBe('noire');
    expect(d.liens(x).sortantes.every(p => p.couleur !== 'noire')).toBe(true);
  });

  it('crée une intersection là où deux pistes se croisent, et coupe les deux', () => {
    d.tracerPiste(GRANDE_DESCENTE);
    const park = d.ouvrirLieu('e4', 'snowpark');
    if (!park.ok) throw new Error();
    const r = d.tracerPiste([[453, 44], [440, 100], [460, 160], [520, 190], [580, 250], [588, 295]]);
    expect(r.ok, !r.ok ? r.raison : '').toBe(true);
    expect(intersections()).toHaveLength(1);
    const x = intersections()[0];
    expect(Math.abs(x.x - 512)).toBeLessThan(6);
    expect(pistes().map(p => `${p.de}→${p.a}`).sort()).toEqual(
      ['sommet→' + x.id, 'sommet→' + x.id, x.id + '→station', x.id + '→' + park.valeur.id].sort());
    expect(d.estRelie(park.valeur.id)).toBe(true);
  });

  it('relie les nœuds traversés en chemin', () => {
    d.tracerPiste([...PAR_LA_VUE, [267, 192], [243, 240], [225, 286], [192, 315], [150, 355], [192, 387], [258, 405], [330, 404]]);
    expect(pistes().map(p => `${p.de}→${p.a}`)).toEqual(['sommet→vue', 'vue→station']);
  });
});

describe('poser une remontée', () => {
  it('ne permet que la télécabine de la station au sommet, et la fait toujours monter', () => {
    const e = d.etudierRemontee('sommet', 'station');
    expect(e.ok).toBe(true);
    if (!e.ok) return;
    expect(e.valeur).toMatchObject({ bas: 'station', haut: 'sommet', possibles: { teleski: false, telesiege: false, telecabine: true } });
    expect(e.valeur.longueur).toBeGreaterThan(2000);
    expect(d.poserRemontee('sommet', 'station', 'teleski')).toMatchObject({ ok: false, raison: expect.stringMatching(/^Trop long pour un téléski\u00a0: 2,\d\u00a0km, pour 1\u00a0km au plus\.$/) });
    expect(d.poserRemontee('sommet', 'station', 'telecabine')).toMatchObject({ ok: true, valeur: { bas: 'station', haut: 'sommet' } });
    expect(d.estRelie('sommet')).toBe(true);
  });

  it('refuse de relier un nœud à lui-même', () => {
    expect(d.etudierRemontee('station', 'station')).toMatchObject({ ok: false });
  });

  it('peut croiser une piste, même en téléski', () => {
    d.tracerPiste(GRANDE_DESCENTE);
    d.ouvrirLieu('e2', 'cafe');
    const cafe = [...d.noeuds.values()].find(n => n.type === 'cafe')!;
    expect(d.poserRemontee('station', cafe.id, 'teleski').ok).toBe(true);
  });
});

describe('les lieux', () => {
  it('s’ouvrent sur un emplacement libre, une fois', () => {
    expect(d.ouvrirLieu('e1', 'restaurant').ok).toBe(true);
    expect(d.ouvrirLieu('e1', 'cafe')).toEqual({ ok: false, raison: 'Cet emplacement est déjà pris.' });
    expect(d.emplacementSous([495, 226])).toBeUndefined();
    expect(d.emplacementSous([225, 286])?.id).toBe('e2');
  });

  it('se démolissent avec leurs pistes et leurs remontées', () => {
    const resto = d.ouvrirLieu('e1', 'restaurant');
    if (!resto.ok) throw new Error();
    d.tracerPiste([[453, 44], [484, 78], [510, 108], [540, 120], [525, 170], [495, 226]]);
    d.poserRemontee('station', resto.valeur.id, 'telesiege');
    d.demolirLieu(resto.valeur.id);
    expect(pistes()).toHaveLength(0);
    expect(d.remontees.size).toBe(0);
    expect(d.noeuds.has(resto.valeur.id)).toBe(false);
  });
});

describe('démolir une piste', () => {
  it('fond l’intersection qui ne sert plus, et la piste coupée redevient un seul tronçon', () => {
    d.tracerPiste(GRANDE_DESCENTE);
    d.tracerPiste([[495, 226], [440, 300], [380, 360], [345, 398]]);
    const branche = pistes().find(p => p.de.startsWith('i') && p.chemin.some(q => q[0] < 445 && q[1] < 305 && q[1] > 295))!;
    d.demolirPiste(branche.id);
    expect(intersections()).toHaveLength(0);
    expect(pistes()).toHaveLength(1);
    expect(pistes()[0]).toMatchObject({ de: 'sommet', a: 'station', couleur: 'noire' });
  });
});

describe('la sauvegarde', () => {
  it('rend la même partie', () => {
    d.tracerPiste(GRANDE_DESCENTE);
    d.tracerPiste([[495, 226], [440, 300], [380, 360], [345, 398]]);
    d.ouvrirLieu('e2', 'cafe');
    d.poserRemontee('station', 'sommet', 'telecabine');
    const s = JSON.parse(JSON.stringify(d.versSauvegarde()));
    const repris = Domaine.depuisSauvegarde(CHOCARDS, relief, s);
    expect(repris.versSauvegarde()).toEqual(d.versSauvegarde());
    expect([...repris.pistes.values()].map(p => p.couleur)).toEqual(pistes().map(p => p.couleur));
  });

  it('refuse une sauvegarde abîmée', () => {
    d.tracerPiste(GRANDE_DESCENTE);
    const s = d.versSauvegarde();
    expect(() => Domaine.depuisSauvegarde(CHOCARDS, relief, { ...s, version: 2 } as never)).toThrow();
    expect(() => Domaine.depuisSauvegarde(CHOCARDS, relief, { ...s, pistes: [{ ...s.pistes[0], a: 'nulle-part' }] })).toThrow('nœud absent');
  });
});

describe('km', () => {
  it('écrit les longueurs en français', () => {
    expect(km(850)).toBe('850 m');
    expect(km(1000)).toBe('1 km');
    expect(km(1440)).toBe('1,4 km');
  });
});
