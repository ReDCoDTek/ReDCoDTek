import Link from "next/link";
import { EcranResultat } from "@/components/EcranResultat";
import { argumentaire, NB_LIGNES_GRATUITES } from "@/lib/argumentaire";
import { lireAudit } from "@/lib/audits";
import { calculer } from "@/lib/calcul";

export const metadata = { title: "Ton résultat", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function PageResultat({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = /^[0-9a-f-]{36}$/i.test(id) ? await lireAudit(id) : null;

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

  const calc = calculer(audit.reponses);
  const arg = argumentaire(calc);

  // Seul l'aperçu gratuit part vers le navigateur tant que le plan n'est pas débloqué.
  return (
    <EcranResultat
      calc={calc}
      apercu={{ objet: arg.objet, premieresLignes: arg.email.slice(0, NB_LIGNES_GRATUITES) }}
    />
  );
}
