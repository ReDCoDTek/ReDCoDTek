"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Le paiement vient d'avoir lieu : on attend la confirmation serveur (webhook), sans rien débloquer côté navigateur. */
export function AttenteConfirmation({ contact }: { contact: string }) {
  const router = useRouter();
  const [essais, setEssais] = useState(0);
  const max = 15;

  useEffect(() => {
    if (essais >= max) return;
    const t = setTimeout(() => {
      router.refresh();
      setEssais((n) => n + 1);
    }, 2000);
    return () => clearTimeout(t);
  }, [essais, router]);

  return (
    <div role="status" className="mt-10 rounded-md border-2 border-gain bg-white/60 p-5">
      {essais < max ? (
        <>
          <p className="font-semibold text-gain">Paiement reçu, ouverture de ton plan…</p>
          <p className="mt-1 text-sm text-encre-douce">Quelques secondes, le temps que Stripe nous confirme le paiement.</p>
        </>
      ) : (
        <>
          <p className="font-semibold">La confirmation prend plus de temps que prévu.</p>
          <p className="mt-1 text-sm text-encre-douce">
            Rien n’est perdu : recharge cette page dans une minute.
            {contact ? <> Si ton plan n’apparaît toujours pas, écris à {contact}.</> : null}
          </p>
        </>
      )}
    </div>
  );
}
