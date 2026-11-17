import Link from "next/link";

export const metadata = { title: "Ton calcul" };

export default function Calcul() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4">
      <p className="text-sm uppercase tracking-wide text-encre-douce">Question 1 sur 3</p>
      <h1 className="mt-3 font-serif text-4xl">Le calcul ouvre très bientôt.</h1>
      <p className="mt-4 text-encre-douce">
        Les trois questions arrivent ici dans la prochaine mise à jour.
      </p>
      <Link href="/" className="mt-8 underline underline-offset-4">
        ← Revenir à l’accueil
      </Link>
    </main>
  );
}
