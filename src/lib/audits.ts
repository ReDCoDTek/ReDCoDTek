import "server-only";
import type { Reponses, Statut } from "./calcul";
import { supabaseConfigure } from "./supabase/config";
import { supabaseServeur } from "./supabase/server";

type LigneAudit = {
  id: string;
  user_id: string;
  revenu_mensuel: number;
  statut: Statut;
  taux_charges: number;
  frais_mensuels: number;
  jours_par_semaine: number;
  semaines_off: number;
  tarif_actuel: number;
};

export function versLigne(r: Reponses) {
  return {
    revenu_mensuel: r.revenuMensuel,
    statut: r.statut,
    taux_charges: r.tauxCharges,
    frais_mensuels: r.fraisMensuels,
    jours_par_semaine: r.joursParSemaine,
    semaines_off: r.semainesOff,
    tarif_actuel: r.tarifActuel,
  };
}

function depuisLigne(l: LigneAudit): Reponses {
  return {
    revenuMensuel: l.revenu_mensuel,
    statut: l.statut,
    tauxCharges: Number(l.taux_charges),
    fraisMensuels: l.frais_mensuels,
    joursParSemaine: Number(l.jours_par_semaine),
    semainesOff: l.semaines_off,
    tarifActuel: l.tarif_actuel,
  };
}

/** Lit un audit du visiteur connecté (RLS : impossible de lire celui d'un autre). */
export async function lireAudit(id: string) {
  if (!supabaseConfigure) return null;
  const supabase = await supabaseServeur();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("audits").select("*").eq("id", id).maybeSingle<LigneAudit>();
  if (!data) return null;

  const { data: acces } = await supabase
    .from("access")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const actif =
    !!acces &&
    (acces.plan === "audit"
      ? acces.status === "paid"
      : ["active", "trialing"].includes(acces.status) &&
        (!acces.current_period_end || new Date(acces.current_period_end) > new Date()));

  return { reponses: depuisLigne(data), userId: user.id, email: user.email ?? null, debloque: actif };
}
