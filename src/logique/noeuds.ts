/* Les sortes de nœuds, de lieux et de remontées, et la place qu'ils prennent sur la carte. */

export const LIEUX = ['restaurant', 'cafe', 'luge', 'raquettes', 'snowpark', 'chiens', 'parapente', 'patinoire'] as const;
export type TypeLieu = (typeof LIEUX)[number];
export type TypeNoeud = 'station' | 'sommet' | 'vue' | 'intersection' | TypeLieu;

export const REMONTEES = ['teleski', 'telesiege', 'telecabine'] as const;
export type TypeRemontee = (typeof REMONTEES)[number];

export const NOMS: Record<TypeNoeud | TypeRemontee, string> = {
  station: 'Station', sommet: 'Sommet', vue: 'Point de vue', intersection: 'Intersection',
  restaurant: 'Restaurant', cafe: 'Café', luge: 'Luge', raquettes: 'Raquettes', snowpark: 'Snowpark',
  chiens: 'Chiens de traîneau', parapente: 'Parapente', patinoire: 'Patinoire',
  teleski: 'Téléski', telesiege: 'Télésiège', telecabine: 'Télécabine',
};

/** La plateforme damée d'un nœud : une ellipse de demi-axes rx, ry, centrée dy pixels au-dessus de l'ancre. */
export function plateforme(type: TypeNoeud | 'emplacement'): { rx: number; ry: number; dy: number } {
  if (type === 'station') return { rx: 40, ry: 13, dy: 4 };
  if (type === 'intersection') return { rx: 10, ry: 5, dy: 0 };
  return { rx: 19, ry: 7, dy: 2 };
}

/** La hauteur du dessin au-dessus de l'ancre : on peut toucher le nœud sur son dessin aussi. */
export const HAUTEUR_DESSIN: Record<TypeNoeud | 'emplacement', number> = {
  station: 42, sommet: 13, vue: 12, intersection: 19, emplacement: 6,
  restaurant: 19, cafe: 15, luge: 10, raquettes: 11, snowpark: 10, chiens: 9, parapente: 18, patinoire: 16,
};
