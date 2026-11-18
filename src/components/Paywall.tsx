"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { creerSessionPaiement } from "@/app/actions";
import { euros } from "@/lib/calcul";
import { GARANTIE_JOURS, OFFRES, type Plan } from "@/lib/offres";

const CheckoutIntegre = dynamic(() => import("./CheckoutIntegre"), {
  ssr: false,
  loading: () => <p className="py-10 text-center text-encre-douce">Ouverture du paiement sécurisé…</p>,
});

function Garantie({ contact }: { contact: string }) {
  return (
    <div className="rounded-md border-2 border-gain bg-white/60 px-4 py-3 text-[15px]">
      <p className="font-semibold text-gain">Satisfait ou remboursé pendant {GARANTIE_JOURS} jours</p>
      <p className="mt-1">
        Un simple e-mail{contact ? <> à <span className="whitespace-nowrap font-medium">{contact}</span></> : null} suffit,
        sans justification. Le remboursement est lancé sous 48&nbsp;h ouvrées ; ta banque le crédite
        ensuite en 5 à 10 jours.
      </p>
    </div>
  );
}

const FAQ = [
  {
    q: "Est-ce que ça marche pour mon cas ?",
    r: "Si tu factures à la journée ou à la prestation, oui : freelance, artisan, micro-entreprise ou société. Le calcul part de tes propres chiffres, et tu as déjà vu ton tarif plancher gratuitement avant de payer.",
  },
  {
    q: "Combien de temps ça me prend ?",
    r: "Le travail est déjà fait. Compte deux minutes pour relire l’e-mail, mettre le prénom de ton client et l’envoyer.",
  },
  {
    q: "Et si je veux arrêter ?",
    r: "L’audit est un paiement unique : il n’y a rien à résilier. Le suivi mensuel est sans engagement : un e-mail suffit, il s’arrête à la fin du mois payé. Et pendant 30 jours, tu peux être remboursé sans justification.",
  },
  {
    q: "À quoi sert exactement ce que je paie ?",
    r: "À débloquer ton tarif conseillé avec son explication, l’e-mail complet et la version SMS pour annoncer ta hausse, et ton calendrier de hausse daté. Le suivi mensuel te donne la même chose pour chaque nouveau calcul.",
  },
];

export function Paywall({
  auditId,
  gainAnnuel,
  perteAnnuelle,
  contact,
}: {
  auditId: string;
  gainAnnuel: number;
  perteAnnuelle: number;
  contact: string;
}) {
  const [plan, setPlan] = useState<Plan>("audit");
  const [secret, setSecret] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();

  const valeur = gainAnnuel || perteAnnuelle;
  const offre = OFFRES[plan];
  const fois = valeur > 0 ? Math.floor(valeur / OFFRES.audit.prix) : 0;

  const payer = () =>
    demarrer(async () => {
      setErreur(null);
      const res = await creerSessionPaiement(auditId, plan);
      if ("clientSecret" in res) setSecret(res.clientSecret);
      else setErreur(res.erreur);
    });

  return (
    <section id="debloquer" className="mt-10 scroll-mt-4">
      {/* 1. Ce qui a déjà été fait pour elle */}
      <h2 className="font-serif text-3xl leading-tight">Voilà ton plan, prêt.</h2>
      <p className="mt-2 text-encre-douce">
        Ton tarif conseillé est calculé, ton e-mail est rédigé avec tes chiffres, ton calendrier de hausse
        est daté. Il ne te reste qu’à le garder.
      </p>

      {/* 2. Ce que ça rapporte, face au prix */}
      {valeur > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-filet bg-filet">
          <div className="bg-papier p-4">
            <p className="text-xs uppercase tracking-wide text-encre-douce">Ce plan te rapporte</p>
            <p className="chiffres mt-1 text-2xl text-gain">+ {euros(valeur)}</p>
            <p className="text-xs text-encre-douce">par an</p>
          </div>
          <div className="bg-papier p-4">
            <p className="text-xs uppercase tracking-wide text-encre-douce">Il coûte</p>
            <p className="chiffres mt-1 text-2xl">{euros(OFFRES.audit.prix)}</p>
            <p className="text-xs text-encre-douce">{fois > 1 ? `${fois} fois moins` : "une fois"}</p>
          </div>
        </div>
      )}

      {/* 4. La garantie, visible sans défiler */}
      <div className="mt-4">
        <Garantie contact={contact} />
      </div>

      {/* 3. Les formules */}
      {!secret && (
        <fieldset className="mt-6 space-y-3">
          <legend className="sr-only">Choisis ta formule</legend>
          {(["audit", "mensuel"] as Plan[]).map((p) => {
            const o = OFFRES[p];
            const choisi = plan === p;
            return (
              <label key={p}
                className={`relative block cursor-pointer rounded-md border-2 p-4 ${choisi ? "border-gain bg-white/70" : "border-filet"}`}>
                {p === "audit" && (
                  <span className="absolute -top-3 left-4 rounded-sm bg-gain px-2 py-0.5 text-xs font-semibold text-papier">
                    Recommandé
                  </span>
                )}
                <span className="flex items-start gap-3">
                  <input type="radio" name="plan" value={p} checked={choisi} onChange={() => setPlan(p)}
                    className="mt-1.5 size-5 accent-[#1e5a45]" />
                  <span className="flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-lg font-semibold">{o.nom}</span>
                      <span className="chiffres text-lg">{o.accroche}</span>
                    </span>
                    <span className="block text-sm text-encre-douce">{o.parJour}</span>
                    <ul className="mt-2 space-y-1 text-sm">
                      {o.details.map((d) => (
                        <li key={d} className="flex gap-2"><span className="text-gain">✓</span>{d}</li>
                      ))}
                    </ul>
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>
      )}

      {/* 6. Le paiement, sur le même écran */}
      <div className="mt-5">
        {secret ? (
          <div className="overflow-hidden rounded-md border border-filet bg-white">
            <div className="flex items-center justify-between border-b border-filet px-4 py-3 text-sm">
              <span>{offre.nom} · <span className="chiffres">{offre.accroche}</span></span>
              <button type="button" onClick={() => setSecret(null)} className="text-encre-douce underline underline-offset-4">
                Changer
              </button>
            </div>
            <CheckoutIntegre clientSecret={secret} />
          </div>
        ) : (
          <>
            <button type="button" onClick={payer} disabled={enCours}
              className="min-h-14 w-full rounded-md bg-gain px-6 text-lg font-semibold text-papier shadow-[0_2px_0_0_#123a2c] disabled:opacity-60">
              {enCours ? "Ouverture du paiement…" : `Débloquer mon plan · ${plan === "audit" ? "49 €" : "29 €/mois"}`}
            </button>
            {/* 5. Juste à côté du bouton */}
            <p className="mt-2 text-center text-sm text-encre-douce">
              {offre.mention} · Paiement sécurisé par Stripe
            </p>
            {erreur && (
              <p role="alert" className="mt-3 rounded-md border-l-4 border-perte bg-papier-fonce px-4 py-3 text-sm">
                {erreur}
              </p>
            )}
          </>
        )}
      </div>

      {/* 7. Les quatre vraies objections */}
      <div className="mt-10">
        <h3 className="font-serif text-2xl">Questions fréquentes</h3>
        <div className="mt-3 divide-y divide-filet border-y border-filet">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-3">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-medium">
                {f.q}
                <span className="text-xl text-encre-douce transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-1 text-[15px] text-encre-douce">{f.r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
