/* Le meneur de jeu : il change les gestes en actions sur le domaine, et dit ce qui se passe. */

import type { Phase } from '../dessin/palette';
import type { Vue } from '../dessin/rendu';
import { km, type Domaine, type Noeud, type Resultat } from '../logique/domaine';
import { distance, type Point } from '../logique/geometrie';
import { LIEUX, NOMS, REMONTEES } from '../logique/noeuds';
import { LONGUEUR_REMONTEE_MAX, REMONTEE_PISTE_MAX } from '../logique/reglages';
import type { Contenu, Panneau } from './panneau';

const AIDE: Contenu = {
  texte: 'Glissez d’un nœud vers un nœud plus bas pour tracer une piste. Touchez deux nœuds pour poser une remontée, et un emplacement libre pour ouvrir un lieu.',
};

type Choix =
  | { noeud: string }
  | { emplacement: string }
  | { piste: string }
  | { remontee: string }
  | { bas: string; haut: string };

interface Appui {
  id: number;
  marge: number;
  points: Point[];
  /** Le doigt a bougé : ce n'est plus un simple toucher. */
  bouge: boolean;
  /** Il trace une piste. */
  glisse: boolean;
}

const pct = (p: number) => `${Math.round(p * 100)} %`;
const metres = (m: number) => `${m.toLocaleString('fr-FR')} m`;

export class Jeu {
  phase: Phase = 'jour';
  private choix?: Choix;
  private appui?: Appui;
  private trace?: Vue['trace'];
  private survol = '';

  constructor(
    private readonly domaine: Domaine,
    private readonly panneau: Panneau,
    private readonly enregistrer: () => void,
    /** Redessiner tout de suite, sans attendre l'image suivante. */
    private readonly redessiner: () => void,
  ) {
    panneau.montrer(AIDE);
  }

  /** Ce que le dessin doit montrer en plus du domaine. */
  vue(temps: number): Vue {
    const c = this.choix;
    return {
      phase: this.phase,
      temps,
      noeudChoisi: c && 'noeud' in c ? c.noeud : c && 'bas' in c ? c.bas : undefined,
      emplacementChoisi: c && 'emplacement' in c ? c.emplacement : undefined,
      pisteChoisie: c && 'piste' in c ? c.piste : undefined,
      remonteeChoisie: c && 'remontee' in c ? c.remontee : undefined,
      trace: this.trace,
    };
  }

  passerA(phase: Phase): void {
    this.phase = phase;
    this.panneau.passerA(phase);
    this.redessiner();
  }

  /** Oublie ce qui était choisi et revient à l'aide. */
  annuler(): void {
    this.choix = undefined;
    this.panneau.montrer(AIDE);
    this.redessiner();
  }

  // ---------- les gestes, en pixels du jeu ----------

  appuyer(id: number, p: Point, toucher: boolean): void {
    if (this.appui) return; // un seul doigt à la fois
    this.appui = { id, marge: toucher ? 6 : 2, points: [p], bouge: false, glisse: false };
  }

  bouger(id: number, p: Point, souris: boolean): void {
    const a = this.appui;
    if (!a) { if (souris) this.survoler(p); return; }
    if (a.id !== id) return;
    if (!a.glisse) {
      if (distance(a.points[0], p) < (a.marge > 2 ? 6 : 4)) return;
      a.bouge = true;
      if (!this.domaine.apercu([a.points[0], p], a.marge)) return; // ni nœud ni piste sous le départ
      a.glisse = true;
      this.choix = undefined;
    }
    if (distance(a.points[a.points.length - 1], p) >= 1) a.points.push(p);
    const v = this.domaine.apercu(a.points, a.marge)!;
    this.trace = { chemin: v.chemin, couleur: v.couleur, trop: v.trop };
    this.panneau.montrer(v.trop
      ? { titre: 'Ça remonte', texte: `Ce tracé remonte de ${Math.round(v.remontee)}\u00a0m\u00a0: ${REMONTEE_PISTE_MAX}\u00a0m au plus.` }
      : { titre: `Piste ${v.couleur}`, texte: `Pente la plus forte\u00a0: ${pct(v.pente)}. Lâchez sur un nœud ou sur une piste.` });
    this.redessiner();
  }

  lacher(id: number, p: Point): void {
    const a = this.appui;
    if (!a || a.id !== id) return;
    this.appui = undefined;
    if (!a.glisse) { if (!a.bouge) this.toucher(p, a.marge); return; }
    a.points.push(p);
    this.trace = undefined;
    const r = this.domaine.tracerPiste(a.points, a.marge);
    if (r.ok) {
      const couleurs = r.valeur.map(t => t.couleur);
      this.panneau.montrer({
        titre: r.valeur.length > 1 ? `${r.valeur.length} tronçons tracés` : `Piste ${couleurs[0]} tracée`,
        texte: r.valeur.length > 1
          ? `Les intersections coupent la piste\u00a0: ${couleurs.join(', ')}. Chaque tronçon prend la couleur de son passage le plus raide.`
          : `Pente la plus forte\u00a0: ${pct(r.valeur[0].pente)}, sur ${km(this.domaine.longueurPiste(r.valeur[0]))}.`,
      });
      this.enregistrer();
    } else this.panneau.montrer({ titre: 'Pas de piste', texte: r.raison });
    this.redessiner();
  }

  abandonner(id: number): void {
    if (this.appui?.id !== id) return;
    this.appui = undefined;
    this.trace = undefined;
    this.redessiner();
  }

  // ---------- toucher ----------

  private toucher(p: Point, marge: number): void {
    const d = this.domaine, c = this.choix;
    const n = d.noeudSous(p, marge);
    if (n) {
      if (c && 'noeud' in c && c.noeud !== n.id) return this.etudier(c.noeud, n.id);
      if (c && 'noeud' in c && c.noeud === n.id) return this.annuler();
      return this.choisirNoeud(n);
    }
    const e = d.emplacementSous(p, marge);
    if (e) return this.choisirEmplacement(e.id);
    const r = d.remonteeSous(p, marge);
    if (r) return this.choisirRemontee(r.id);
    const s = d.pisteSous(p, marge);
    if (s) return this.choisirPiste(s.piste.id);
    this.annuler();
  }

  private choisirNoeud(n: Noeud): void {
    this.choix = { noeud: n.id };
    const lieu = !!n.emplacement;
    this.panneau.montrer({
      titre: n.nom,
      texte: `${metres(this.domaine.altitude(n))}${this.domaine.estRelie(n.id) ? '' : ', pas encore relié'}. Touchez un autre nœud pour poser une remontée.`,
      actions: [
        ...(lieu ? [{ libelle: 'Démolir', detail: 'avec ses pistes et remontées', faire: () => this.fait(() => this.domaine.demolirLieu(n.id), `Lieu démoli\u00a0: ${n.nom}.`) }] : []),
        { libelle: 'Annuler', faire: () => this.annuler() },
      ],
    });
    this.redessiner();
  }

  private etudier(a: string, b: string): void {
    const e = this.domaine.etudierRemontee(a, b);
    if (!e.ok) { this.panneau.montrer({ titre: 'Pas de remontée', texte: e.raison, actions: [{ libelle: 'Annuler', faire: () => this.annuler() }] }); return; }
    const { bas, haut, longueur, denivele, possibles } = e.valeur, nom = (id: string) => this.domaine.noeuds.get(id)!.nom;
    this.choix = { bas, haut };
    this.panneau.montrer({
      titre: 'Quelle remontée\u00a0?',
      texte: `De ${nom(bas)} à ${nom(haut)}\u00a0: ${km(longueur)} de câble, ${metres(denivele)} de dénivelé.`,
      actions: [
        ...REMONTEES.map(t => ({
          libelle: NOMS[t],
          picto: t,
          detail: `${km(LONGUEUR_REMONTEE_MAX[t])} au plus`,
          desactive: !possibles[t],
          faire: () => this.resultat(this.domaine.poserRemontee(bas, haut, t), `${NOMS[t]} posé${t === 'telecabine' ? 'e' : ''}.`),
        })),
        { libelle: 'Annuler', faire: () => this.annuler() },
      ],
    });
    this.redessiner();
  }

  private choisirEmplacement(id: string): void {
    this.choix = { emplacement: id };
    const e = this.domaine.carte.emplacements.find(x => x.id === id)!;
    this.panneau.montrer({
      titre: 'Emplacement libre',
      texte: `${metres(Math.round(this.domaine.relief.altitude([e.x, e.y - 2])))}. Quel lieu ouvrir ici\u00a0?`,
      actions: [
        ...LIEUX.map(t => ({
          libelle: NOMS[t],
          picto: t,
          faire: () => this.resultat(this.domaine.ouvrirLieu(id, t), `Lieu ouvert\u00a0: ${NOMS[t]}. Reliez-le au domaine par une piste ou une remontée.`),
        })),
        { libelle: 'Annuler', faire: () => this.annuler() },
      ],
    });
    this.redessiner();
  }

  private choisirPiste(id: string): void {
    this.choix = { piste: id };
    const p = this.domaine.pistes.get(id)!, nom = (x: string) => this.domaine.noeuds.get(x)!.nom;
    this.panneau.montrer({
      titre: `Piste ${p.couleur}`,
      texte: `Pente la plus forte\u00a0: ${pct(p.pente)}. ${km(this.domaine.longueurPiste(p))}, de ${nom(p.de)} à ${nom(p.a)}.`,
      actions: [
        { libelle: 'Démolir', faire: () => this.fait(() => this.domaine.demolirPiste(id), 'Piste démolie.') },
        { libelle: 'Annuler', faire: () => this.annuler() },
      ],
    });
    this.redessiner();
  }

  private choisirRemontee(id: string): void {
    this.choix = { remontee: id };
    const r = this.domaine.remontees.get(id)!, nom = (x: string) => this.domaine.noeuds.get(x)!.nom;
    const e = this.domaine.etudierRemontee(r.bas, r.haut);
    this.panneau.montrer({
      titre: NOMS[r.type],
      texte: e.ok ? `${km(e.valeur.longueur)}, ${metres(e.valeur.denivele)} de dénivelé, de ${nom(r.bas)} à ${nom(r.haut)}.` : '',
      actions: [
        { libelle: 'Démolir', faire: () => this.fait(() => this.domaine.demolirRemontee(id), `${NOMS[r.type]} démoli${r.type === 'telecabine' ? 'e' : ''}.`) },
        { libelle: 'Annuler', faire: () => this.annuler() },
      ],
    });
    this.redessiner();
  }

  /** Au survol de la souris, sans rien de choisi : dit ce qu'il y a sous le pointeur. */
  private survoler(p: Point): void {
    if (this.choix) return;
    const d = this.domaine, n = d.noeudSous(p), e = n ? undefined : d.emplacementSous(p);
    const r = n || e ? undefined : d.remonteeSous(p), s = n || e || r ? undefined : d.pisteSous(p);
    const cle = n?.id ?? e?.id ?? r?.id ?? s?.piste.id ?? '';
    if (cle === this.survol) return;
    this.survol = cle;
    if (n) this.panneau.montrer({ titre: n.nom, texte: `${metres(d.altitude(n))}${d.estRelie(n.id) ? '' : ', pas encore relié'}.` });
    else if (e) this.panneau.montrer({ titre: 'Emplacement libre', texte: 'Touchez-le pour ouvrir un lieu.' });
    else if (r) this.panneau.montrer({ titre: NOMS[r.type], texte: 'Touchez-la pour la voir ou la démolir.' });
    else if (s) this.panneau.montrer({ titre: `Piste ${s.piste.couleur}`, texte: `Pente la plus forte\u00a0: ${pct(s.piste.pente)}.` });
    else this.panneau.montrer(AIDE);
  }

  private resultat<T>(r: Resultat<T>, reussite: string): void {
    this.choix = undefined;
    if (r.ok) { this.panneau.montrer({ texte: reussite }); this.enregistrer(); }
    else this.panneau.montrer({ titre: 'Impossible', texte: r.raison });
    this.redessiner();
  }

  private fait(action: () => void, message: string): void {
    action();
    this.choix = undefined;
    this.panneau.montrer({ texte: message });
    this.enregistrer();
    this.redessiner();
  }
}
