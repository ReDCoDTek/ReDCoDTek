"use server";

import { nettoyer } from "@/lib/calcul";
import { versLigne } from "@/lib/audits";
import { supabaseConfigure } from "@/lib/supabase/config";
import { supabaseServeur } from "@/lib/supabase/server";
import { schemaReponses } from "@/lib/validation";

/** Enregistre les réponses. Crée un compte anonyme si besoin : aucune inscription demandée. */
export async function enregistrerAudit(entree: unknown): Promise<{ id: string } | { erreur: string }> {
  if (!supabaseConfigure) return { erreur: "non-configure" };

  const verif = schemaReponses.safeParse(entree);
  if (!verif.success) return { erreur: "reponses-invalides" };
  const reponses = nettoyer(verif.data);

  const supabase = await supabaseServeur();
  let { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) return { erreur: "session" };
    user = data.user;
  }

  const { data, error } = await supabase
    .from("audits")
    .insert({ user_id: user.id, ...versLigne(reponses) })
    .select("id")
    .single();
  if (error || !data) return { erreur: "enregistrement" };
  return { id: data.id };
}
