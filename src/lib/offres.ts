export type Plan = "audit" | "mensuel";

export const OFFRES: Record<Plan, {
  nom: string;
  prix: number; // en euros
  centimes: number;
  accroche: string;
  parJour: string;
  details: string[];
  mention: string;
}> = {
  audit: {
    nom: "Audit",
    prix: 49,
    centimes: 4900,
    accroche: "49 € une fois",
    parJour: "soit 4,08 € par mois sur un an, 0,13 € par jour",
    details: [
      "Ton tarif conseillé, expliqué",
      "L’e-mail complet et la version SMS",
      "Ton calendrier de hausse, daté",
      "Accès à vie à ce plan",
    ],
    mention: "Paiement unique, aucun abonnement",
  },
  mensuel: {
    nom: "Suivi",
    prix: 29,
    centimes: 2900,
    accroche: "29 € par mois",
    parJour: "soit 0,95 € par jour",
    details: [
      "Tout ce que contient l’audit",
      "Un plan complet pour chaque nouveau calcul",
      "Pour chaque client, ou dès que tes charges changent",
    ],
    mention: "Sans engagement, résiliable à tout moment",
  },
};

export const GARANTIE_JOURS = 30;
