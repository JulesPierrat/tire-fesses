/* Points, chemins et croisements, en pixels du jeu. */

export type Point = readonly [number, number];

export const distance = (a: Point, b: Point): number => Math.hypot(b[0] - a[0], b[1] - a[1]);

/** La longueur d'un chemin, en pixels. */
export function longueur(chemin: readonly Point[]): number {
  let l = 0;
  for (let k = 1; k < chemin.length; k++) l += distance(chemin[k - 1], chemin[k]);
  return l;
}

/** Une courbe douce (Catmull-Rom) qui passe par tous les points, un point tous les `pas` pixels environ. */
export function spline(points: readonly Point[], pas: number): Point[] {
  const sortie: Point[] = [], Q = [points[0], ...points, points[points.length - 1]];
  for (let i = 1; i < Q.length - 2; i++) {
    const p0 = Q[i - 1], p1 = Q[i], p2 = Q[i + 1], p3 = Q[i + 2];
    const n = Math.max(2, Math.ceil(distance(p1, p2) / pas));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      sortie.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  sortie.push(points[points.length - 1]);
  return sortie;
}

/** Garde un point tous les `ecart` pixels au moins, pour lisser un tracé à la main. */
export function simplifier(points: readonly Point[], ecart: number): Point[] {
  const gardes: Point[] = [];
  for (const p of points) if (!gardes.length || distance(gardes[gardes.length - 1], p) >= ecart) gardes.push(p);
  return gardes;
}

/** La distance d'un point à un segment. */
export function distanceSegment(p: Point, a: Point, b: Point): number {
  const vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy;
  const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / l2)) : 0;
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vy * t);
}

/** Le point du chemin le plus proche de `p`. */
export function plusProche(chemin: readonly Point[], p: Point): { index: number; distance: number } {
  let index = 0, d = Infinity;
  chemin.forEach((q, k) => {
    const dk = distance(p, q);
    if (dk < d) { d = dk; index = k; }
  });
  return { index, distance: d };
}

/** Le point où les segments [a, b] et [c, d] se croisent, s'ils se croisent. */
export function croisement(a: Point, b: Point, c: Point, d: Point): Point | undefined {
  const rx = b[0] - a[0], ry = b[1] - a[1], sx = d[0] - c[0], sy = d[1] - c[1];
  const den = rx * sy - ry * sx;
  if (Math.abs(den) < 1e-9) return undefined;
  const t = ((c[0] - a[0]) * sy - (c[1] - a[1]) * sx) / den;
  const u = ((c[0] - a[0]) * ry - (c[1] - a[1]) * rx) / den;
  if (t < 0 || t > 1 || u < 0 || u > 1) return undefined;
  return [a[0] + rx * t, a[1] + ry * t];
}
