import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { NOMS, PALETTES, lirePalette, versPixel } from './palette';

describe('les palettes', () => {
  it('ont 32 couleurs, chacune avec un nom différent', () => {
    expect(NOMS).toHaveLength(32);
    expect(new Set(NOMS).size).toBe(32);
    expect(Object.keys(PALETTES.jour)).toEqual([...NOMS]);
    expect(Object.keys(PALETTES.nuit)).toEqual([...NOMS]);
  });

  it('sont celles de la charte, couleur par couleur', () => {
    const charte = readFileSync(new URL('../../docs/CHARTE.md', import.meta.url), 'utf8');
    const lignes = [...charte.matchAll(/^\| `([a-z0-9-]+)` \| [^|]+ \| `(#[0-9a-f]{6})` \| `(#[0-9a-f]{6})` \|$/gm)];
    expect(lignes.map(l => l[1])).toEqual([...NOMS]);
    for (const [, nom, jour, nuit] of lignes) {
      expect(PALETTES.jour[nom as (typeof NOMS)[number]]).toBe(jour);
      expect(PALETTES.nuit[nom as (typeof NOMS)[number]]).toBe(nuit);
    }
  });

  it('refusent un fichier incomplet ou illisible', () => {
    expect(() => lirePalette('ffffff\n000000')).toThrow('2 couleurs au lieu de 32');
    expect(() => lirePalette('zzzzzz\n'.repeat(32))).toThrow('couleur illisible pour neige-0');
  });
});

describe('versPixel', () => {
  it('range les octets comme un ImageData : rouge, vert, bleu, opacité', () => {
    const octets = new Uint8Array(new Uint32Array([versPixel('#ff8a1f')]).buffer);
    expect([...octets]).toEqual([0xff, 0x8a, 0x1f, 0xff]);
  });
});
