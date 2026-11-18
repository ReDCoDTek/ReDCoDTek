import "server-only";
import type Stripe from "stripe";
import { supabaseAdmin } from "./supabase/admin";

const id = (x: string | { id: string } | null | undefined) => (typeof x === "string" ? x : x?.id ?? null);

/**
 * Ouvre l'accès à partir d'une session Checkout VÉRIFIÉE auprès de Stripe
 * (reçue par le webhook signé, ou relue côté serveur via l'API Stripe).
 * Idempotent : rejouer la même session ne crée pas de doublon.
 */
export async function accorderAcces(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  const plan = session.metadata?.plan;
  if (!userId || (plan !== "audit" && plan !== "mensuel")) return false;

  const paye =
    session.status === "complete" &&
    (session.payment_status === "paid" || session.payment_status === "no_payment_required");
  if (!paye) return false;

  const email = session.customer_details?.email ?? session.customer_email ?? null;
  const db = supabaseAdmin();
  const { error } = await db.from("access").upsert(
    {
      user_id: userId,
      plan,
      status: plan === "audit" ? "paid" : "active",
      audit_id: plan === "audit" ? session.metadata?.audit_id ?? null : null,
      email,
      stripe_customer_id: id(session.customer),
      stripe_subscription_id: id(session.subscription),
      stripe_payment_intent: id(session.payment_intent),
      stripe_checkout_session_id: session.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "stripe_checkout_session_id" },
  );
  if (error) throw new Error(`Enregistrement de l'accès impossible : ${error.message}`);

  // Rattache l'e-mail au compte anonyme pour pouvoir revenir plus tard (lien magique).
  if (email) {
    await db.auth.admin.updateUserById(userId, { email, email_confirm: true }).catch(() => null);
  }
  return true;
}

export async function majStatutAbonnement(subscriptionId: string, statut: string) {
  await supabaseAdmin()
    .from("access")
    .update({ status: statut, updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscriptionId);
}

export async function marquerRembourse(paymentIntentId: string) {
  await supabaseAdmin()
    .from("access")
    .update({ status: "refunded", updated_at: new Date().toISOString() })
    .eq("stripe_payment_intent", paymentIntentId);
}
