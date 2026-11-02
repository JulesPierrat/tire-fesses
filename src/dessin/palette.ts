/* Les deux palettes de la charte : chaque couleur du jour a sa jumelle de nuit, au même rang. */

import jourHex from '../../assets/palette/grand-beau.hex?raw';
import nuitHex from '../../assets/palette/grand-beau-nuit.hex?raw';

/** Les noms des couleurs, dans l'ordre des fichiers de assets/palette/. */
export const NOMS = [
  'neige-0', 'neige-1', 'neige-2', 'neige-3', 'neige-damee',
  'roche-0', 'roche-1', 'roche-2',
  'sapin-0', 'sapin-1', 'sapin-2', 'tronc',
  'bois-0', 'bois-1', 'toit',
  'ciel-0', 'ciel-1', 'ciel-2',
  'encre', 'cable',
  'piste-verte', 'piste-bleue', 'piste-rouge', 'piste-noire',
  'peau', 'orange-balise', 'jaune-remontee', 'framboise', 'cyan', 'violet',
  'lumiere', 'route',
] as const;

export type Couleur = (typeof NOMS)[number];
export type Phase = 'jour' | 'nuit';
/** Une palette en `#rrggbb`, pour le CSS. */
export type Palette = Record<Couleur, string>;
/** Une palette en pixels, pour le tableau de la carte. */
export type Pixels = Record<Couleur, number>;

/** Lit un fichier `.hex` (une couleur `rrggbb` par ligne) et donne un nom à chaque couleur. */
export function lirePalette(texte: string): Palette {
  const hex = texte.split(/\s+/).filter(Boolean);
  if (hex.length !== NOMS.length) throw new Error(`${hex.length} couleurs au lieu de ${NOMS.length}`);
  const palette = {} as Palette;
  NOMS.forEach((nom, i) => {
    const h = hex[i]!;
    if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`couleur illisible pour ${nom} : ${h}`);
    palette[nom] = `#${h.toLowerCase()}`;
  });
  return palette;
}

/** `#rrggbb` en pixel opaque, dans l'ordre des octets d'un ImageData (r, g, b, a). */
export function versPixel(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return ((255 << 24) | ((n & 0xff) << 16) | (n & 0xff00) | ((n >> 16) & 0xff)) >>> 0;
}

export const PALETTES: Record<Phase, Palette> = {
  jour: lirePalette(jourHex),
  nuit: lirePalette(nuitHex),
};

const enPixels = (p: Palette): Pixels =>
  Object.fromEntries(NOMS.map(nom => [nom, versPixel(p[nom])])) as Pixels;

export const PIXELS: Record<Phase, Pixels> = {
  jour: enPixels(PALETTES.jour),
  nuit: enPixels(PALETTES.nuit),
};
