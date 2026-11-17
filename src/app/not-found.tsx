import Link from "next/link";

export default function PageIntrouvable() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4">
      <p className="chiffres text-perte">404</p>
      <h1 className="mt-2 font-serif text-4xl">Cette page n’existe pas.</h1>
      <p className="mt-4 text-encre-douce">Le lien est peut-être incomplet. Ton calcul, lui, t’attend.</p>
      <Link
        href="/"
        className="mt-8 flex min-h-14 items-center justify-center rounded-md bg-gain px-6 font-semibold text-papier"
      >
        Revenir à l’accueil
      </Link>
    </main>
  );
}
