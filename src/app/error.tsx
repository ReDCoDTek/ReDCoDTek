"use client";

import Link from "next/link";

export default function Erreur({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4">
      <h1 className="font-serif text-4xl">Un souci de notre côté.</h1>
      <p className="mt-4 text-encre-douce">
        Rien n’est perdu. Réessaie dans un instant ; si ça persiste, repars de l’accueil.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <button
          onClick={reset}
          className="min-h-14 rounded-md bg-gain px-6 font-semibold text-papier"
        >
          Réessayer
        </button>
        <Link href="/" className="text-center underline underline-offset-4">
          Revenir à l’accueil
        </Link>
      </div>
    </main>
  );
}
