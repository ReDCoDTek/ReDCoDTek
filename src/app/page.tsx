import { BoutonCommencer } from "@/components/BoutonCommencer";
import { PiedDePage } from "@/components/PiedDePage";
import { SITE } from "@/lib/site";

const euros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + " €";

// Exemple chiffré : 3 000 € net/mois, ~25 % de cotisations, 300 € de frais/mois.
// CA nécessaire = (36 000 + 3 600) / 0,75 = 52 800 € → 352 €/jour sur 150 jours.
const exemple = {
  tarifActuel: 300,
  tarifPlancher: 352,
  joursReels: 150,
  perte: (352 - 300) * 150,
};

const jours = [
  { libelle: "Une année", valeur: 365 },
  { libelle: "Week-ends", valeur: -104 },
  { libelle: "Congés (5 semaines)", valeur: -25 },
  { libelle: "Jours fériés", valeur: -11 },
  { libelle: "Devis, compta, prospection", valeur: -45 },
  { libelle: "Entre deux clients", valeur: -30 },
];

const benefices = [
  {
    titre: "Ton tarif plancher",
    texte: "Le prix en dessous duquel tu travailles à perte. Calculé avec tes chiffres, pas une moyenne.",
  },
  {
    titre: "Ce que tu perds, en euros par an",
    texte: "Pas un pourcentage. Le montant exact qui manque à la fin de l’année.",
  },
  {
    titre: "Le message pour annoncer ta hausse",
    texte: "Prêt à copier et à envoyer à tes clients, sans te justifier pendant trois paragraphes.",
  },
];

export default function Accueil() {
  return (
    <>
      <main className="pb-28 md:pb-0">
        <header className="px-4 pt-5">
          <div className="mx-auto max-w-3xl font-serif text-2xl">Tarif Juste</div>
        </header>

        {/* Promesse — identique mot pour mot à celle des vidéos */}
        <section className="px-4 pt-10 pb-12 md:pt-20">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-serif text-[2.6rem] leading-[1.05] md:text-7xl">
              Ton tarif te fait <span className="text-perte">perdre de l’argent</span>.
              <br />
              Calcule combien en 60&nbsp;secondes.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-encre-douce">
              Freelances et artisans : trois questions sur ton revenu, tes charges et tes vrais jours
              de travail. Le calcul se fait devant toi.
            </p>
            <div className="mt-8 hidden md:block">
              <BoutonCommencer />
              <p className="mt-3 text-sm text-encre-douce">3 questions · 60 secondes · sans inscription</p>
            </div>
          </div>
        </section>

        {/* La douleur, chiffrée */}
        <section className="bg-papier-fonce px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif text-3xl md:text-4xl">
              Tu ne travailles pas 220 jours par an. Tu en factures 150.
            </h2>
            <ul className="chiffres mt-6 divide-y divide-filet border-y border-filet text-[15px]">
              {jours.map((j) => (
                <li key={j.libelle} className="flex justify-between py-2.5">
                  <span className="font-sans">{j.libelle}</span>
                  <span className={j.valeur < 0 ? "text-encre-douce" : ""}>
                    {j.valeur > 0 ? j.valeur : `− ${Math.abs(j.valeur)}`}
                  </span>
                </li>
              ))}
              <li className="flex justify-between py-3 text-lg font-semibold">
                <span className="font-sans">Jours vraiment facturés</span>
                <span>{exemple.joursReels}</span>
              </li>
            </ul>

            <div className="mt-8 rounded-md border border-filet bg-papier p-5">
              <p className="text-sm uppercase tracking-wide text-encre-douce">
                Exemple : un freelance qui veut se verser 3&nbsp;000&nbsp;€ par mois
              </p>
              <dl className="chiffres mt-4 space-y-2 text-[15px]">
                <div className="flex justify-between">
                  <dt className="font-sans">Ce qu’il facture</dt>
                  <dd className="whitespace-nowrap pl-3">{exemple.tarifActuel} € / jour</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-sans">Ce qu’il devrait facturer, au minimum</dt>
                  <dd className="whitespace-nowrap pl-3">{exemple.tarifPlancher} € / jour</dd>
                </div>
              </dl>
              <p className="mt-5 border-t border-filet pt-4">
                <span className="block text-sm text-encre-douce">Ce qu’il perd chaque année</span>
                <span className="chiffres text-4xl text-perte">− {euros(exemple.perte)}</span>
              </p>
              <p className="mt-3 text-xs text-encre-douce">
                Avec environ 25&nbsp;% de cotisations et 300&nbsp;€ de frais par mois.
              </p>
            </div>
          </div>
        </section>

        {/* Trois bénéfices */}
        <section className="px-4 py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif text-3xl md:text-4xl">Ce que tu obtiens</h2>
            <ol className="mt-6 space-y-6">
              {benefices.map((b, i) => (
                <li key={b.titre} className="flex gap-4">
                  <span className="chiffres pt-0.5 text-gain">0{i + 1}</span>
                  <div>
                    <h3 className="text-lg font-semibold">{b.titre}</h3>
                    <p className="mt-1 text-encre-douce">{b.texte}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-10 hidden md:block">
              <BoutonCommencer />
            </div>
          </div>
        </section>
        <p className="sr-only">{SITE.description}</p>
      </main>

      <PiedDePage />

      {/* Appel à l'action fixe, à portée de pouce sur téléphone */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-filet bg-papier/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden">
        <BoutonCommencer />
        <p className="mt-1.5 text-center text-xs text-encre-douce">
          3 questions · 60 secondes · sans inscription
        </p>
      </div>
    </>
  );
}
