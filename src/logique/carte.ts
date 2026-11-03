/* Ce qu'est une carte : son relief, ses nœuds fixes et ses emplacements à construire. */

/**
 * Le relief se décrit par quelques nombres, en coordonnées de 0 à 1 (u vers la droite, v vers
 * le bas), et la hauteur en unités (une unité = HM mètres). C'est la formule de la planche :
 * une pente générale, des bosses (les sommets), des combes, du bruit et un replat en bas.
 */
export interface DescRelief {
  /** La hauteur tout en haut et tout en bas de la carte : la pente générale. */
  haut: number;
  bas: number;
  /** Une bosse : + h · exp(−((u − u0)² / lu + (v − v0)² / lv)). */
  bosses: { u: number; v: number; h: number; lu: number; lv: number }[];
  /** Une combe, qui se creuse vers le haut : − h · exp(−(u − u0)² / l) · (1 − v). */
  combes: { u: number; h: number; l: number }[];
  /** Du bruit : + h · bruit(u · f + du, v · f + dv). */
  bruits: { h: number; f: number; du: number; dv: number }[];
  /** Le replat du village : de v = debut à v = fin, la hauteur glisse vers h. */
  replat: { debut: number; fin: number; h: number };
}

export interface NoeudFixe {
  id: string;
  type: 'station' | 'sommet' | 'vue';
  nom: string;
  /** L'ancre du dessin : le pixel du bas, au milieu, là où il touche la neige. */
  x: number;
  y: number;
}

export interface Carte {
  id: string;
  nom: string;
  largeur: number;
  hauteur: number;
  /** L'altitude du bas de la carte, en mètres. */
  altitudeDuBas: number;
  relief: DescRelief;
  /** La route du village, en bas de la carte : ses lignes de pixels. */
  route: { y: number; epaisseur: number };
  /** La première station est le départ du réseau : un nœud relié à elle est relié au domaine. */
  noeuds: NoeudFixe[];
  emplacements: { id: string; x: number; y: number }[];
}
