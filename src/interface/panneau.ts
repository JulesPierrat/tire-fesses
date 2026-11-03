/* Le panneau de gauche : le nom de la carte, le jour et la nuit, un message et des boutons. */

import type { Phase } from '../dessin/palette';
import { peindrePicto, type NomPicto } from '../dessin/pictos';

export interface Action {
  libelle: string;
  picto?: NomPicto;
  /** Une précision sous le libellé : « 1 km au plus ». */
  detail?: string;
  desactive?: boolean;
  faire: () => void;
}

export interface Contenu {
  titre?: string;
  texte: string;
  actions?: Action[];
}

export class Panneau {
  private phase: Phase = 'jour';
  private readonly titre: HTMLElement;
  private readonly texte: HTMLElement;
  private readonly actions: HTMLElement;
  private readonly boutonsPhase: HTMLButtonElement[];
  private readonly recommencer: HTMLButtonElement;

  constructor(racine: HTMLElement, changerPhase: (p: Phase) => void, recommencer: () => void) {
    this.titre = racine.querySelector('#message-titre')!;
    this.texte = racine.querySelector('#message-texte')!;
    this.actions = racine.querySelector('#actions')!;
    this.boutonsPhase = [...racine.querySelectorAll<HTMLButtonElement>('[data-phase]')];
    for (const b of this.boutonsPhase) b.addEventListener('click', () => changerPhase(b.dataset.phase as Phase));

    // Recommencer efface tout : il faut appuyer deux fois.
    const rec = (this.recommencer = racine.querySelector<HTMLButtonElement>('#recommencer')!);
    let arme: number | undefined;
    rec.addEventListener('click', () => {
      if (arme) { clearTimeout(arme); recommencer(); return; }
      rec.textContent = 'Sûr\u00a0? Tout effacer';
      arme = window.setTimeout(() => { arme = undefined; rec.textContent = 'Recommencer la carte'; }, 3000);
    });
  }

  passerA(phase: Phase): void {
    this.phase = phase;
    for (const b of this.boutonsPhase) b.setAttribute('aria-pressed', String(b.dataset.phase === phase));
    for (const t of this.actions.querySelectorAll<HTMLCanvasElement>('canvas[data-picto]')) peindrePicto(t, t.dataset.picto as NomPicto, phase);
  }

  montrer(c: Contenu): void {
    this.titre.textContent = c.titre ?? '';
    this.titre.hidden = !c.titre;
    this.texte.textContent = c.texte;
    this.actions.replaceChildren(...(c.actions ?? []).map(a => this.bouton(a)));
    // Un menu ouvert prend la place : « Recommencer » attend qu'il se ferme.
    this.recommencer.hidden = !!c.actions?.length;
  }

  private bouton(a: Action): HTMLButtonElement {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'bouton';
    b.disabled = !!a.desactive;
    if (a.picto) {
      const t = document.createElement('canvas');
      t.dataset.picto = a.picto;
      t.className = 'picto';
      t.setAttribute('aria-hidden', 'true');
      peindrePicto(t, a.picto, this.phase);
      b.append(t);
    }
    const l = document.createElement('span');
    l.textContent = a.libelle;
    if (a.detail) {
      const d = document.createElement('small');
      d.textContent = a.detail;
      l.append(d);
    }
    b.append(l);
    b.addEventListener('click', a.faire);
    return b;
  }
}

