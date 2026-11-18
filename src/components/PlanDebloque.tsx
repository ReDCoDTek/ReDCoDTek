"use client";

import { useState } from "react";
import { euros } from "@/lib/calcul";

function BoutonCopier({ texte, libelle }: { texte: string; libelle: string }) {
  const [copie, setCopie] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texte);
          setCopie(true);
          setTimeout(() => setCopie(false), 2500);
        } catch {}
      }}
      className="min-h-12 w-full rounded-md border-2 border-encre px-4 font-semibold"
    >
      {copie ? "Copié ✓" : libelle}
    </button>
  );
}

export function PlanDebloque({
  tarifPlancher,
  tarifConseille,
  tarifActuel,
  gainAnnuel,
  objet,
  email,
  sms,
  paliers,
}: {
  tarifPlancher: number;
  tarifConseille: number;
  tarifActuel: number;
  gainAnnuel: number;
  objet: string;
  email: string[];
  sms: string;
  paliers: { date: string; tarif: number }[];
}) {
  const texteEmail = `Objet : ${objet}\n\n${email.join("\n\n")}`;

  return (
    <section className="mt-10" id="plan">
      <p className="chiffres text-sm text-gain">Plan débloqué</p>
      <h2 className="mt-1 font-serif text-3xl">Ton plan pour augmenter ton tarif</h2>

      <div className="mt-5 rounded-md border-2 border-gain bg-white/60 p-5">
        <p className="text-sm uppercase tracking-wide text-encre-douce">Ton tarif conseillé</p>
        <p className="chiffres mt-1 text-5xl text-gain">
          {euros(tarifConseille)}<span className="text-2xl"> / jour</span>
        </p>
        <p className="mt-3 text-[15px]">
          C’est ton plancher de <span className="chiffres">{euros(tarifPlancher)}</span>, plus 15&nbsp;% de marge pour les
          impayés, les mois creux et les jours de maladie, arrondi à la dizaine. À ce tarif, tu gagnes{" "}
          <strong className="chiffres">{euros(gainAnnuel)}</strong> de plus par an qu’aujourd’hui.
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold">Ton calendrier</h3>
        <ol className="mt-3 space-y-3 border-l-2 border-gain pl-4 text-[15px]">
          <li>
            <span className="font-medium">Dès aujourd’hui</span> — tout nouveau client paie{" "}
            <span className="chiffres">{euros(tarifConseille)}</span> par jour. Aucun préavis nécessaire.
          </li>
          {paliers.length > 0 && (
            <li>
              <span className="font-medium">Cette semaine</span> — envoie l’e-mail ci-dessous à tes clients actuels.
            </li>
          )}
          {paliers.map((p, i) => (
            <li key={p.date}>
              <span className="font-medium">{p.date}</span> — tes clients actuels passent à{" "}
              <span className="chiffres">{euros(p.tarif)}</span>
              {i === 0 && paliers.length > 1 ? " (premier palier, pour ne brusquer personne)." : "."}
            </li>
          ))}
          {paliers.length === 0 && (
            <li>Ton tarif actuel ({euros(tarifActuel)}) dépasse déjà le conseillé : garde-le, et augmente-le chaque année.</li>
          )}
        </ol>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold">L’e-mail à envoyer</h3>
        <div className="mt-3 rounded-md border border-filet bg-white/60 p-4 text-[15px] leading-relaxed">
          <p className="font-medium">Objet : {objet}</p>
          <div className="mt-3 space-y-3">
            {email.map((l) => <p key={l}>{l}</p>)}
          </div>
        </div>
        <div className="mt-3"><BoutonCopier texte={texteEmail} libelle="Copier l’e-mail" /></div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold">La version SMS</h3>
        <p className="mt-3 rounded-md border border-filet bg-white/60 p-4 text-[15px] leading-relaxed">{sms}</p>
        <div className="mt-3"><BoutonCopier texte={sms} libelle="Copier le SMS" /></div>
      </div>

      <p className="mt-8 text-sm text-encre-douce">
        Remplace [Prénom] par le prénom de ton client et [Ton prénom] par le tien. Garde cette page dans tes
        favoris : ton plan reste accessible ici.
      </p>
    </section>
  );
}
