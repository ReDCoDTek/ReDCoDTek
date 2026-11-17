import type { Resultat } from "./calcul";

const dateFr = (d: Date) => {
  const jour = d.getDate() === 1 ? "1er" : String(d.getDate());
  return `${jour} ${d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
};

/** Le 1er du mois qui suit un préavis d'au moins 30 jours. */
export function dateDeHausse(depuis = new Date()) {
  const d = new Date(depuis);
  d.setDate(d.getDate() + 30);
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

const arrondi10 = (n: number) => Math.ceil(n / 10) * 10;

/** Plan de hausse : au-delà de +15 %, on passe par deux paliers pour les clients existants. */
export function planDeHausse(calc: Resultat, depuis = new Date()) {
  const actuel = calc.reponses.tarifActuel;
  const cible = calc.tarifConseille;
  const date1 = dateDeHausse(depuis);
  const date2 = new Date(date1.getFullYear(), date1.getMonth() + 6, 1);

  if (actuel >= cible) {
    return { paliers: [] as { date: string; tarif: number }[], cible, date1: dateFr(date1) };
  }
  const ecart = (cible - actuel) / actuel;
  const paliers =
    ecart <= 0.15
      ? [{ date: dateFr(date1), tarif: cible }]
      : [
          { date: dateFr(date1), tarif: Math.min(cible, arrondi10(actuel * 1.15)) },
          { date: dateFr(date2), tarif: cible },
        ];
  return { paliers, cible, date1: dateFr(date1) };
}

/** L'argumentaire complet. Les 2 premières lignes de l'email sont l'avant-goût gratuit. */
export function argumentaire(calc: Resultat, depuis = new Date()) {
  const plan = planDeHausse(calc, depuis);
  const actuel = calc.reponses.tarifActuel;
  const premier = plan.paliers[0]?.tarif ?? actuel;

  const objet = `Mes tarifs à partir du ${plan.date1}`;
  const email = [
    "Bonjour [Prénom],",
    `Je vous écris pour vous prévenir suffisamment à l’avance : à partir du ${plan.date1}, mon tarif journalier évolue.`,
    `Il passera de ${actuel} € à ${premier} € par jour.`,
    "Ce nouveau tarif reflète le temps réel que je consacre à chaque mission — préparation, échanges, suivi — et me permet de continuer à vous offrir le même niveau d’exigence et de disponibilité.",
    "Les missions déjà engagées restent bien entendu au tarif actuel jusqu’à leur terme.",
    "Je reste disponible si vous souhaitez en parler, et je vous remercie pour votre confiance.",
    "Bien à vous,",
    "[Ton prénom]",
  ];
  const sms = `Bonjour [Prénom], petite information : à partir du ${plan.date1}, mon tarif journalier passera à ${premier} €. Les missions en cours restent au tarif actuel. Je vous envoie le détail par e-mail. Bonne journée !`;

  return { objet, email, sms, plan };
}

export const NB_LIGNES_GRATUITES = 2;
