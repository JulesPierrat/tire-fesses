import { describe, expect, it } from 'vitest';
import { cadrer, echelle } from './ecran';

describe('echelle', () => {
  it('prend le plus grand entier qui fait tenir 720 × 450', () => {
    expect(echelle(1920, 950)).toBe(2);   // fenêtre sur un écran 1 920 × 1 080
    expect(echelle(2940, 1732)).toBe(3);  // MacBook Air, deux vrais pixels par point
    expect(echelle(2402, 1081)).toBe(2);  // téléphone couché
    expect(echelle(1440, 900)).toBe(2);   // juste la place
    expect(echelle(1439, 900)).toBe(1);   // un pixel de moins
  });

  it('ne descend jamais sous 1', () => {
    expect(echelle(500, 300)).toBe(1);
  });
});

describe('cadrer', () => {
  it('centre la carte sur un pixel entier', () => {
    expect(cadrer(1921, 951)).toEqual({ echelle: 2, x: 240, y: 25, largeur: 1440, hauteur: 900 });
  });
});
