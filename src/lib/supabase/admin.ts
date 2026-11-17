import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

/** Client avec la clé SECRÈTE : contourne RLS. Serveur uniquement (webhook, accès). */
export function supabaseAdmin() {
  const cle = process.env.SUPABASE_SECRET_KEY;
  if (!SUPABASE_URL || !cle) throw new Error("Supabase non configuré (clé secrète manquante)");
  return createClient(SUPABASE_URL, cle, { auth: { persistSession: false, autoRefreshToken: false } });
}
