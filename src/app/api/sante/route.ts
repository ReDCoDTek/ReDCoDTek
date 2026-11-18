import { NextResponse } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Diagnostic de configuration : n'affiche AUCUNE clé, uniquement des oui / non. */
export async function GET() {
  const rapport: Record<string, unknown> = {
    adresse_supabase: SUPABASE_URL ? (/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(SUPABASE_URL) ? "ok" : "format inattendu") : "MANQUANTE",
    cle_publique: SUPABASE_PUBLISHABLE_KEY ? "ok" : "MANQUANTE",
    cle_secrete: process.env.SUPABASE_SECRET_KEY ? "ok" : "MANQUANTE",
  };

  if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
        cache: "no-store",
      });
      if (!res.ok) rapport.connexion = `refusée (${res.status}) — clé publique incorrecte ?`;
      else {
        rapport.connexion = "ok";
        const s = await res.json();
        const anonyme = s?.external?.anonymous_users ?? s?.anonymous_users;
        rapport.visiteurs_sans_inscription =
          anonyme === true ? "autorisés" : anonyme === false ? "DÉSACTIVÉS (étape C)" : "inconnu";
      }
    } catch {
      rapport.connexion = "impossible — adresse incorrecte ?";
    }
  }

  if (process.env.SUPABASE_SECRET_KEY && SUPABASE_URL) {
    try {
      const db = supabaseAdmin();
      for (const t of ["audits", "access", "stripe_events"]) {
        const { error } = await db.from(t).select("*", { count: "exact", head: true });
        rapport[`table_${t}`] = error ? `ERREUR : ${error.message}` : "ok";
      }
    } catch (e) {
      rapport.tables = `ERREUR : ${(e as Error).message}`;
    }
  }

  return NextResponse.json(rapport, { headers: { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" } });
}
