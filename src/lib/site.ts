// Textes et réglages partagés. La promesse doit être reprise MOT POUR MOT dans les vidéos.
const urlVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE = {
  nom: "Tarif Juste",
  promesse: "Ton tarif te fait perdre de l’argent. Calcule combien en 60 secondes.",
  description:
    "Revenu voulu, charges, jours vraiment facturables : découvre ton tarif plancher et ce que tu perds chaque année. Gratuit, sans inscription.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? (urlVercel ? `https://${urlVercel}` : "http://localhost:3000"),
};
