import Link from "next/link";
import { AttenteConfirmation } from "@/components/AttenteConfirmation";
import { EcranResultat } from "@/components/EcranResultat";
import { Paywall } from "@/components/Paywall";
import { PlanDebloque } from "@/components/PlanDebloque";
import { accorderAcces } from "@/lib/acces";
import { argumentaire, NB_LIGNES_GRATUITES } from "@/lib/argumentaire";
import { lireAudit } from "@/lib/audits";
import { calculer } from "@/lib/calcul";
import { SITE } from "@/lib/site";
import { stripe, stripeConfigure } from "@/lib/stripe";

export const metadata = { title: "Ton résultat", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PageResultat({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { id } = await params;
  const { session_id } = await searchParams;
  let audit = /^[0-9a-f-]{36}$/i.test(id) ? await lireAudit(id) : null;

  if (!audit) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4">
        <h1 className="font-serif text-4xl">Ce calcul n’est pas accessible ici.</h1>
        <p className="mt-4 text-encre-douce">
          Il a peut-être été fait sur un autre appareil ou un autre navigateur. Refaire le calcul prend
          60&nbsp;secondes.
        </p>
        <Link href="/calcul"
          className="mt-8 flex min-h-14 items-center justify-center rounded-md bg-gain px-6 font-semibold text-papier">
          Refaire mon calcul
        </Link>
      </main>
    );
  }

  // Retour de paiement : on relit la session DIRECTEMENT chez Stripe (jamais la seule URL).
  // Le webhook reste la source principale ; ceci rend juste la livraison instantanée.
  let retourPaiement = false;
  if (!audit.debloque && session_id?.startsWith("cs_") && stripeConfigure()) {
    retourPaiement = true;
    try {
      const session = await stripe().checkout.sessions.retrieve(session_id);
      if (session.client_reference_id === audit.userId && session.metadata?.audit_id === id) {
        if (await accorderAcces(session)) audit = (await lireAudit(id)) ?? audit;
      }
    } catch (e) {
      console.error("Vérification du retour de paiement impossible", e);
    }
  }

  const calc = calculer(audit.reponses);
  const arg = argumentaire(calc);

  // Tant que le plan n'est pas payé, seul l'aperçu gratuit part vers le navigateur.
  return (
    <EcranResultat
      calc={calc}
      apercu={{ objet: arg.objet, premieresLignes: arg.email.slice(0, NB_LIGNES_GRATUITES) }}
      planDebloque={
        audit.debloque ? (
          <PlanDebloque
            tarifPlancher={calc.tarifPlancher}
            tarifConseille={calc.tarifConseille}
            tarifActuel={calc.reponses.tarifActuel}
            gainAnnuel={calc.gainConseille}
            objet={arg.objet}
            email={arg.email}
            sms={arg.sms}
            paliers={arg.plan.paliers}
          />
        ) : undefined
      }
    >
      {retourPaiement ? (
        <AttenteConfirmation contact={SITE.contact} />
      ) : (
        <Paywall auditId={id} gainAnnuel={calc.gainConseille} perteAnnuelle={calc.perteAnnuelle} contact={SITE.contact} />
      )}
    </EcranResultat>
  );
}
