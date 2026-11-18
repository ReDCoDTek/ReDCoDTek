import Link from "next/link";
import { euros, type Resultat } from "@/lib/calcul";

function Ligne({ libelle, valeur, fort }: { libelle: string; valeur: string; fort?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-2.5 ${fort ? "text-lg font-semibold" : ""}`}>
      <dt>{libelle}</dt>
      <dd className="chiffres whitespace-nowrap">{valeur}</dd>
    </div>
  );
}

/** Barres grises qui remplacent le contenu payant : le texte réel n'est PAS envoyé au navigateur. */
function Masque({ lignes }: { lignes: number[] }) {
  return (
    <div aria-hidden className="space-y-2.5 py-1">
      {lignes.map((l, i) => (
        <div key={i} className="h-3.5 rounded-sm bg-filet" style={{ width: `${l}%` }} />
      ))}
    </div>
  );
}

export type Apercu = { objet: string; premieresLignes: string[] };

export function EcranResultat({
  calc,
  apercu,
  hrefModifier = "/calcul",
  avertissement,
  planDebloque,
  children,
}: {
  calc: Resultat;
  apercu: Apercu;
  hrefModifier?: string;
  avertissement?: string;
  /** Le plan complet, une fois payé : remplace la partie verrouillée. */
  planDebloque?: React.ReactNode;
  /** Le paywall, sous la partie verrouillée. */
  children?: React.ReactNode;
}) {
  const r = calc.reponses;
  const ecartMensuel = r.revenuMensuel - calc.revenuActuelMensuel;

  return (
    <main className="mx-auto max-w-xl px-4 pt-6 pb-16">
      <div className="flex items-center justify-between text-sm">
        <Link href={hrefModifier} className="text-encre-douce underline underline-offset-4">
          ← Modifier mes réponses
        </Link>
        <span className="chiffres text-gain">Calcul terminé</span>
      </div>
      {avertissement && (
        <p className="mt-4 rounded-md bg-papier-fonce px-4 py-3 text-sm">{avertissement}</p>
      )}

      {calc.sousLePlancher ? (
        <section className="mt-8">
          <p className="text-encre-douce">
            À <span className="chiffres">{r.tarifActuel}&nbsp;€</span> par jour, sur{" "}
            <span className="chiffres">{calc.joursFactures}</span> jours facturés, tu perds chaque année :
          </p>
          <p className="chiffres mt-2 text-6xl leading-none text-perte">− {euros(calc.perteAnnuelle)}</p>
          <p className="mt-5 font-serif text-2xl leading-snug">
            Tu voulais te verser <span className="chiffres">{euros(r.revenuMensuel)}</span> par mois.
            Avec ton tarif actuel, tu te verses en réalité{" "}
            <span className="chiffres text-perte">{euros(Math.max(0, calc.revenuActuelMensuel))}</span>.
          </p>
          <p className="mt-3 text-encre-douce">
            Il te manque <strong className="chiffres">{euros(ecartMensuel)}</strong> chaque mois. Ce n’est
            pas un manque de travail : c’est un tarif calculé sans les charges, sans les frais et sur des
            jours que personne ne te paie.
          </p>
        </section>
      ) : (
        <section className="mt-8">
          <p className="text-encre-douce">Bonne nouvelle&nbsp;: ton tarif couvre ton objectif.</p>
          <p className="mt-3 font-serif text-3xl leading-snug">
            À <span className="chiffres">{r.tarifActuel}&nbsp;€</span> par jour, tu te verses environ{" "}
            <span className="chiffres text-gain">{euros(calc.revenuActuelMensuel)}</span> par mois.
          </p>
          <p className="mt-3 text-encre-douce">
            Mais tu n’as aucune marge : un impayé, un mois creux ou une semaine malade, et tu repasses
            sous ton objectif.
          </p>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Ton calcul, ligne par ligne</h2>
        <dl className="mt-3 divide-y divide-filet border-y border-filet text-[15px]">
          <Ligne libelle="Ce que tu veux te verser" valeur={`${euros(calc.revenuAnnuel)} / an`} />
          <Ligne libelle="+ Tes frais professionnels" valeur={`${euros(calc.fraisAnnuels)} / an`} />
          <Ligne
            libelle={`+ Cotisations (≈ ${r.tauxCharges} %)`}
            valeur={`${euros(calc.caNecessaire - calc.revenuAnnuel - calc.fraisAnnuels)} / an`}
          />
          <Ligne libelle="= Chiffre d’affaires nécessaire" valeur={euros(calc.caNecessaire)} fort />
          <Ligne libelle="÷ Jours vraiment facturés" valeur={`${calc.joursFactures} jours`} />
        </dl>
      </section>

      {/* Avant-goût gratuit n°1 : le tarif plancher, utilisable tout de suite */}
      <section className="mt-8 rounded-md border-2 border-encre bg-white/60 p-5">
        <p className="text-sm uppercase tracking-wide text-encre-douce">Ton tarif plancher</p>
        <p className="chiffres mt-1 text-5xl">
          {euros(calc.tarifPlancher)}
          <span className="text-2xl"> / jour</span>
        </p>
        <p className="mt-3 text-[15px]">
          En dessous de ce prix, chaque journée te coûte de l’argent. Ne descends plus jamais en
          dessous, même pour « dépanner » un client.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Et avec une marge de sécurité&nbsp;?</h2>
        <p className="mt-2 text-encre-douce">
          Le plancher te fait juste atteindre ton objectif. Ton <strong>tarif conseillé</strong> y ajoute
          une marge pour les impayés, les mois creux et les imprévus. Appliqué à tes{" "}
          {calc.joursFactures} jours, il te rapporterait par rapport à aujourd’hui&nbsp;:
        </p>
        <p className="chiffres mt-3 text-4xl text-gain">
          + {euros(calc.gainConseille)} <span className="text-xl">par an</span>
        </p>
      </section>

      {planDebloque ?? (
        <>
      {/* Le plan : visible, mais verrouillé au-delà de l'avant-goût */}
      <section className="mt-10" id="plan">
        <h2 className="font-serif text-2xl">Ton plan pour augmenter ton tarif</h2>

        <div className="mt-4 rounded-md border border-filet bg-white/60">
          <div className="flex items-center justify-between border-b border-filet px-5 py-3">
            <span className="text-sm text-encre-douce">Ton tarif conseillé</span>
            <span className="chiffres flex items-center gap-2 text-sm">
              <Cadenas /> ••• € / jour
            </span>
          </div>

          <div className="px-5 py-4">
            <p className="text-sm text-encre-douce">E-mail à envoyer à tes clients</p>
            <p className="mt-2 font-medium">Objet : {apercu.objet}</p>
            <div className="mt-3 space-y-2 text-[15px] leading-relaxed">
              {apercu.premieresLignes.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
            <div className="relative mt-3">
              <Masque lignes={[92, 85, 97, 60, 88, 70, 40]} />
            </div>
          </div>

          <ul className="space-y-2 border-t border-filet px-5 py-4 text-[15px]">
            <ElementVerrouille>Ton tarif conseillé, et pourquoi ce chiffre</ElementVerrouille>
            <ElementVerrouille>L’e-mail complet, prêt à copier</ElementVerrouille>
            <ElementVerrouille>La version SMS, pour tes clients pressés</ElementVerrouille>
            <ElementVerrouille>Ton calendrier de hausse, palier par palier</ElementVerrouille>
          </ul>
        </div>
      </section>

          {children ?? (
        <p className="mt-6 rounded-md border border-dashed border-filet p-5 text-center text-encre-douce">
          Le déblocage de ton plan ouvre très bientôt.
        </p>
      )}
        </>
      )}
    </main>
  );
}

function Cadenas() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function ElementVerrouille({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 text-encre-douce">
      <Cadenas />
      <span>{children}</span>
    </li>
  );
}
