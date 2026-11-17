"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { enregistrerAudit } from "@/app/actions";
import { EcranResultat } from "@/components/EcranResultat";
import { argumentaire, NB_LIGNES_GRATUITES } from "@/lib/argumentaire";
import {
  calculer,
  euros,
  nettoyer,
  REPONSES_PAR_DEFAUT,
  STATUTS,
  type Reponses,
  type Statut,
} from "@/lib/calcul";

const CLE = "tarif-juste:reponses";
type Etape = 1 | 2 | 3 | "resultat";

/* ---------- Petits éléments réutilisables ---------- */

function ChampEuros({
  id,
  valeur,
  onChange,
  suffixe,
  autoFocus,
}: {
  id: string;
  valeur: number;
  onChange: (n: number) => void;
  suffixe: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="flex items-center rounded-md border-2 border-encre bg-white/60 focus-within:border-gain">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        value={valeur ? String(valeur) : ""}
        placeholder="0"
        onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "").slice(0, 6)))}
        className="chiffres min-h-16 w-full min-w-0 bg-transparent px-4 text-3xl outline-none"
      />
      <span className="shrink-0 pr-4 text-encre-douce">{suffixe}</span>
    </div>
  );
}

function Pastilles({
  options,
  valeur,
  onChange,
  format,
}: {
  options: number[];
  valeur: number;
  onChange: (n: number) => void;
  format: (n: number) => string;
}) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`chiffres min-h-11 rounded-full border px-4 text-sm ${
            valeur === o ? "border-gain bg-gain text-papier" : "border-filet bg-papier"
          }`}
        >
          {format(o)}
        </button>
      ))}
    </div>
  );
}

function Compteur({
  libelle,
  valeur,
  onChange,
  pas,
  min,
  max,
  unite,
}: {
  libelle: string;
  valeur: number;
  onChange: (n: number) => void;
  pas: number;
  min: number;
  max: number;
  unite: string;
}) {
  const bouton =
    "flex size-12 shrink-0 items-center justify-center rounded-md border-2 border-encre text-2xl disabled:opacity-30";
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-[15px]">{libelle}</span>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`Moins — ${libelle}`} className={bouton}
          disabled={valeur <= min} onClick={() => onChange(Math.max(min, valeur - pas))}>−</button>
        <span className="chiffres w-16 text-center text-xl">
          {String(valeur).replace(".", ",")}
          <span className="block font-sans text-xs text-encre-douce">{unite}</span>
        </span>
        <button type="button" aria-label={`Plus — ${libelle}`} className={bouton}
          disabled={valeur >= max} onClick={() => onChange(Math.min(max, valeur + pas))}>+</button>
      </div>
    </div>
  );
}

/** Phrase qui fait prendre conscience du problème, mise à jour en direct. */
function Constat({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 border-l-4 border-perte bg-papier-fonce px-4 py-3 text-[15px] leading-snug">
      {children}
    </p>
  );
}

/* ---------- Le tunnel ---------- */

export function Tunnel() {
  const [etape, setEtape] = useState<Etape>(1);
  const [r, setR] = useState<Reponses>(REPONSES_PAR_DEFAUT);
  const haut = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [enCours, demarrer] = useTransition();
  const [horsLigne, setHorsLigne] = useState(false);

  // Reprend les réponses si la personne recharge la page (confort, pas indispensable).
  useEffect(() => {
    try {
      const sauve = sessionStorage.getItem(CLE);
      if (sauve) setR(nettoyer({ ...REPONSES_PAR_DEFAUT, ...JSON.parse(sauve) }));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(CLE, JSON.stringify(r));
    } catch {}
  }, [r]);

  const maj = (champs: Partial<Reponses>) => setR((p) => ({ ...p, ...champs }));
  const aller = (e: Etape) => {
    setEtape(e);
    haut.current?.scrollIntoView({ block: "start" });
    window.scrollTo({ top: 0 });
  };

  const calc = calculer(r);
  const numero = etape === "resultat" ? 3 : etape;

  const peutContinuer =
    (etape === 1 && r.revenuMensuel >= 500) ||
    (etape === 2 && r.tauxCharges >= 0) ||
    (etape === 3 && r.tarifActuel > 0);

  const message = {
    1: r.revenuMensuel < 500 ? "Indique au moins 500 € par mois." : "",
    2: "",
    3: r.tarifActuel > 0 ? "" : "Indique ton tarif actuel pour voir ce que tu perds.",
  } as const;

  // Secours : si l'enregistrement échoue, on montre quand même le résultat (jamais de cul-de-sac).
  if (etape === "resultat") {
    const arg = argumentaire(calc);
    return (
      <EcranResultat
        calc={calc}
        apercu={{ objet: arg.objet, premieresLignes: arg.email.slice(0, NB_LIGNES_GRATUITES) }}
        avertissement={horsLigne ? "Ton calcul n’a pas pu être enregistré. Tu peux le consulter ici, mais garde cette page ouverte." : undefined}
      />
    );
  }

  const terminer = () =>
    demarrer(async () => {
      try {
        const res = await enregistrerAudit(nettoyer(r));
        if ("id" in res) {
          router.push(`/resultat/${res.id}`);
          return;
        }
        setHorsLigne(res.erreur !== "non-configure");
      } catch {
        setHorsLigne(true);
      }
      aller("resultat");
    });

  return (
    <div ref={haut} className="mx-auto flex min-h-dvh max-w-xl flex-col px-4">
      {/* Progression */}
      <div className="sticky top-0 z-10 -mx-4 bg-papier px-4 pt-4 pb-3">
        <div className="flex items-center justify-between text-sm">
          {etape === 1 ? (
            <Link href="/" className="text-encre-douce underline underline-offset-4">← Accueil</Link>
          ) : (
            <button type="button" onClick={() => aller((etape - 1) as Etape)}
              className="text-encre-douce underline underline-offset-4">← Retour</button>
          )}
          <span className="chiffres text-encre-douce">Question {numero} sur 3</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-filet" role="progressbar"
          aria-valuemin={0} aria-valuemax={3} aria-valuenow={numero} aria-label="Progression">
          <div className="h-full bg-gain transition-all duration-300" style={{ width: `${(numero / 3) * 100}%` }} />
        </div>
      </div>

      <form
        className="flex flex-1 flex-col pt-6 pb-36"
        onSubmit={(e) => {
          e.preventDefault();
          if (!peutContinuer || enCours) return;
          if (etape === 3) terminer();
          else aller((etape + 1) as Etape);
        }}
      >
        {etape === 1 && (
          <>
            <label htmlFor="revenu" className="font-serif text-[2rem] leading-tight">
              Combien veux-tu te verser chaque mois&nbsp;?
            </label>
            <p className="mt-2 text-encre-douce">Ce qui arrive sur ton compte perso, une fois tout payé.</p>
            <div className="mt-6">
              <ChampEuros id="revenu" valeur={r.revenuMensuel} suffixe="€ / mois"
                onChange={(n) => maj({ revenuMensuel: n })} />
              <Pastilles options={[2000, 2500, 3000, 4000]} valeur={r.revenuMensuel}
                onChange={(n) => maj({ revenuMensuel: n })} format={euros} />
            </div>
            {r.revenuMensuel >= 500 && (
              <Constat>
                Soit <strong className="chiffres">{euros(r.revenuMensuel * 12)}</strong> par an.
                Ton tarif doit atteindre ce chiffre <em>après</em> les cotisations, les frais et
                les jours où personne ne te paie.
              </Constat>
            )}
          </>
        )}

        {etape === 2 && (
          <>
            <h1 className="font-serif text-[2rem] leading-tight">Qu’est-ce qui part avant toi&nbsp;?</h1>
            <p className="mt-2 text-encre-douce">Ton statut fixe la part prélevée sur chaque euro facturé.</p>
            <fieldset className="mt-6 space-y-2">
              <legend className="sr-only">Ton statut</legend>
              {(Object.keys(STATUTS) as Statut[]).map((s) => (
                <label key={s}
                  className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-md border-2 px-4 py-3 ${
                    r.statut === s ? "border-gain bg-white/60" : "border-filet"}`}>
                  <input type="radio" name="statut" value={s} checked={r.statut === s}
                    onChange={() => maj({ statut: s, tauxCharges: STATUTS[s].taux })}
                    className="mt-1 size-5 accent-[#1e5a45]" />
                  <span>
                    <span className="block font-medium">{STATUTS[s].libelle}</span>
                    <span className="block text-sm text-encre-douce">
                      {STATUTS[s].detail} · <span className="chiffres">≈ {STATUTS[s].taux} %</span>
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>

            <label htmlFor="frais" className="mt-8 block font-medium">
              Tes frais professionnels par mois
            </label>
            <p className="mt-1 text-sm text-encre-douce">
              Logiciels, assurance, téléphone, matériel, comptable, déplacements, local…
            </p>
            <div className="mt-3">
              <ChampEuros id="frais" valeur={r.fraisMensuels} suffixe="€ / mois"
                onChange={(n) => maj({ fraisMensuels: n })} />
              <Pastilles options={[100, 200, 400, 800]} valeur={r.fraisMensuels}
                onChange={(n) => maj({ fraisMensuels: n })} format={euros} />
            </div>

            <Constat>
              Sur <span className="chiffres">100&nbsp;€</span> facturés, il t’en reste{" "}
              <strong className="chiffres">{calc.gardeSur100}&nbsp;€</strong>. Et avant de te payer,
              tu dois encore couvrir <strong className="chiffres">{euros(calc.fraisAnnuels)}</strong> de
              frais par an.
            </Constat>
          </>
        )}

        {etape === 3 && (
          <>
            <h1 className="font-serif text-[2rem] leading-tight">Combien de jours te paie-t-on vraiment&nbsp;?</h1>
            <p className="mt-2 text-encre-douce">
              Compte uniquement les jours facturés. Devis, compta, prospection et attente entre deux
              clients ne comptent pas.
            </p>
            <div className="mt-4 divide-y divide-filet border-y border-filet">
              <Compteur libelle="Jours facturés par semaine" valeur={r.joursParSemaine}
                onChange={(n) => maj({ joursParSemaine: n })} pas={0.5} min={0.5} max={6} unite="jours" />
              <Compteur libelle="Semaines sans facturer par an" valeur={r.semainesOff}
                onChange={(n) => maj({ semainesOff: n })} pas={1} min={0} max={30} unite="semaines" />
            </div>
            <p className="mt-2 text-sm text-encre-douce">
              Congés, jours fériés, maladie, mois creux : 8 semaines, c’est déjà serré.
            </p>

            <label htmlFor="tarif" className="mt-8 block font-medium">
              Et aujourd’hui, tu factures combien par jour&nbsp;?
            </label>
            <p className="mt-1 text-sm text-encre-douce">
              Tu factures à la prestation&nbsp;? Indique ce qu’une journée te rapporte en moyenne.
            </p>
            <div className="mt-3">
              <ChampEuros id="tarif" valeur={r.tarifActuel} suffixe="€ / jour"
                onChange={(n) => maj({ tarifActuel: n })} />
            </div>

            <Constat>
              Tu factures donc <strong className="chiffres">{calc.joursFactures} jours</strong> par an
              {calc.joursFactures < 220 ? <>, pas 220</> : null}. Ce sont ces jours-là, et eux seuls,
              qui doivent payer toute ton année.
            </Constat>
          </>
        )}

        {/* Bouton principal, à portée de pouce */}
        <div className="fixed inset-x-0 bottom-0 border-t border-filet bg-papier/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
          <div className="mx-auto max-w-xl">
            <button type="submit" disabled={!peutContinuer || enCours}
              className="min-h-14 w-full rounded-md bg-gain px-6 text-lg font-semibold text-papier disabled:bg-filet disabled:text-encre-douce">
              {etape === 3 ? (enCours ? "Calcul en cours…" : "Voir ce que je perds") : "Continuer"}
            </button>
            <p className="mt-1.5 min-h-4 text-center text-xs text-encre-douce" aria-live="polite">
              {message[etape] || "Tes réponses restent sur ton téléphone."}
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

