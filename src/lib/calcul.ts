// Calcul du tarif — fonction pure, réutilisée côté navigateur ET côté serveur.

export type Statut = "micro-liberal" | "micro-artisan" | "societe" | "autre";

export const STATUTS: Record<Statut, { libelle: string; detail: string; taux: number }> = {
  "micro-liberal": {
    libelle: "Micro-entreprise, prestations intellectuelles",
    detail: "Développeur, graphiste, consultant, rédacteur…",
    taux: 26,
  },
  "micro-artisan": {
    libelle: "Micro-entreprise, artisan ou prestations manuelles",
    detail: "Plombier, électricien, coiffeur à domicile…",
    taux: 22,
  },
  societe: {
    libelle: "Société (SASU, EURL)",
    detail: "Cotisations et impôt sur les sociétés, en moyenne",
    taux: 45,
  },
  autre: {
    libelle: "Je ne sais pas",
    detail: "On part sur une estimation prudente",
    taux: 30,
  },
};

export type Reponses = {
  revenuMensuel: number; // net voulu par mois, en €
  statut: Statut;
  tauxCharges: number; // en %, sur le chiffre d'affaires
  fraisMensuels: number; // frais pro par mois, en €
  joursParSemaine: number; // jours vraiment facturés par semaine
  semainesOff: number; // semaines sans facturer par an (congés, fériés, creux)
  tarifActuel: number; // € par jour aujourd'hui
};

export const REPONSES_PAR_DEFAUT: Reponses = {
  revenuMensuel: 3000,
  statut: "micro-liberal",
  tauxCharges: STATUTS["micro-liberal"].taux,
  fraisMensuels: 200,
  joursParSemaine: 4,
  semainesOff: 8,
  tarifActuel: 0,
};

const borne = (n: number, min: number, max: number) =>
  Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;

/** Ramène toute saisie dans des bornes réalistes. Utilisé aussi pour valider côté serveur. */
export function nettoyer(r: Reponses): Reponses {
  return {
    revenuMensuel: Math.round(borne(r.revenuMensuel, 500, 30000)),
    statut: r.statut in STATUTS ? r.statut : "autre",
    tauxCharges: borne(r.tauxCharges, 0, 70),
    fraisMensuels: Math.round(borne(r.fraisMensuels, 0, 20000)),
    joursParSemaine: borne(Math.round(r.joursParSemaine * 2) / 2, 0.5, 6),
    semainesOff: Math.round(borne(r.semainesOff, 0, 30)),
    tarifActuel: Math.round(borne(r.tarifActuel, 0, 5000)),
  };
}

/** Marge de sécurité du tarif conseillé : impayés, imprévus, mois creux, maladie. */
export const MARGE_CONSEILLEE = 0.15;

export function calculer(brut: Reponses) {
  const r = nettoyer(brut);
  const joursFactures = Math.round(r.joursParSemaine * (52 - r.semainesOff));
  const revenuAnnuel = r.revenuMensuel * 12;
  const fraisAnnuels = r.fraisMensuels * 12;
  const garde = 1 - r.tauxCharges / 100; // part qui reste sur 1 € facturé

  const caNecessaire = (revenuAnnuel + fraisAnnuels) / garde;
  const tarifPlancher = Math.ceil(caNecessaire / joursFactures);
  const tarifConseille = Math.ceil((tarifPlancher * (1 + MARGE_CONSEILLEE)) / 10) * 10;

  const caActuel = r.tarifActuel * joursFactures;
  const revenuActuelMensuel = Math.round((caActuel * garde - fraisAnnuels) / 12);
  const perteAnnuelle = Math.max(0, (tarifPlancher - r.tarifActuel) * joursFactures);
  const gainConseille = Math.max(0, (tarifConseille - r.tarifActuel) * joursFactures);

  return {
    reponses: r,
    joursFactures,
    revenuAnnuel,
    fraisAnnuels,
    gardeSur100: Math.round(garde * 100),
    caNecessaire: Math.round(caNecessaire),
    tarifPlancher,
    tarifConseille,
    caActuel,
    revenuActuelMensuel,
    perteAnnuelle,
    gainConseille,
    sousLePlancher: r.tarifActuel < tarifPlancher,
  };
}

export type Resultat = ReturnType<typeof calculer>;

export const euros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " €";
