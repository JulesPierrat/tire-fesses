/* Le hasard du jeu : tout part d'une graine, la même graine redonne la même chose. Repris de la planche. */

/** Un générateur à graine (mulberry32) : chaque appel donne un nombre dans [0, 1). */
export function generateur(graine: number): () => number {
  return () => {
    graine |= 0;
    graine = (graine + 0x6d2b79f5) | 0;
    let t = Math.imul(graine ^ (graine >>> 15), 1 | graine);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Un nombre dans [0, 1) attaché à une case (i, j). */
function hacher(i: number, j: number): number {
  let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** Un bruit doux dans [0, 1). */
function bruitDeValeur(x: number, y: number): number {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hacher(i, j), b = hacher(i + 1, j), c = hacher(i, j + 1), d = hacher(i + 1, j + 1);
  const haut = a + (b - a) * sx, bas = c + (d - c) * sx;
  return haut + (bas - haut) * sy;
}

/** Quatre bruits superposés, de plus en plus fins, dans [-1, 1]. */
export function bruit(x: number, y: number): number {
  let s = 0, a = 0.5, f = 1;
  for (let o = 0; o < 4; o++) {
    s += a * (bruitDeValeur(x * f + o * 17.3, y * f + o * 9.1) * 2 - 1);
    f *= 2;
    a *= 0.5;
  }
  return s;
}
