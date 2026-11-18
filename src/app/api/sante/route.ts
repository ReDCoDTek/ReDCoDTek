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

  const sk = process.env.STRIPE_SECRET_KEY ?? "";
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  rapport.stripe_cle_secrete = sk ? (sk.startsWith("sk_test_") ? "ok (mode test)" : sk.startsWith("sk_live_") ? "ok (MODE RÉEL)" : sk.startsWith("rk_") ? "ok (clé restreinte)" : "format inattendu") : "MANQUANTE";
  rapport.stripe_cle_publique = pk ? (pk.startsWith("pk_test_") ? "ok (mode test)" : pk.startsWith("pk_live_") ? "ok (MODE RÉEL)" : "format inattendu") : "MANQUANTE";
  rapport.stripe_webhook = process.env.STRIPE_WEBHOOK_SECRET?.startsWith("whsec_") ? "ok" : "MANQUANT";
  rapport.email_contact = process.env.NEXT_PUBLIC_CONTACT_EMAIL ? "ok" : "MANQUANT";

  return NextResponse.json(rapport, { headers: { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" } });
}
