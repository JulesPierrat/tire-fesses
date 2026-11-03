/* Tous les chiffres du jeu. Pour l'équilibrer, on ne change que ce fichier (docs/TECHNIQUE.md). */

/** La fenêtre de jeu, en pixels du jeu : 30 × 19 cases. */
export const LARGEUR = 720;
export const HAUTEUR = 450;
/** Une case de la grille, en pixels du jeu. */
export const CASE = 24;

/** Mètres par pixel du jeu. */
export const MPX = 6;
/** Mètres par unité de hauteur du relief. */
export const HM = 650;

/** La pente d'un tronçon se mesure sur une fenêtre glissante de 24 px, soit 144 m. */
export const FENETRE_PENTE = 24;
/** Seuils de couleur : verte sous 25 %, bleue sous 40 %, rouge sous 60 %, noire au-delà. */
export const SEUILS = [0.25, 0.40, 0.60] as const;
/** Les pentes à partir de 60 % peuvent partir en avalanche. */
export const PENTE_AVALANCHE = 0.60;

/** Une piste ne remonte jamais de plus de 10 m. */
export const REMONTEE_PISTE_MAX = 10;
/** Une remontée monte d'au moins 10 m. */
export const DENIVELE_REMONTEE_MIN = 10;
/** La longueur d'une remontée, en mètres, au plus. */
export const LONGUEUR_REMONTEE_MAX = { teleski: 1000, telesiege: 2000, telecabine: 4000 } as const;
