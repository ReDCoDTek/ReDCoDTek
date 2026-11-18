"use server";

import { headers } from "next/headers";
import { lireAudit } from "@/lib/audits";
import { OFFRES, type Plan } from "@/lib/offres";
import { stripe, stripeConfigure } from "@/lib/stripe";
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

/* ---------- Paiement ---------- */


/** Crée la session de paiement intégrée à la page. Le prix est fixé ICI, jamais par le navigateur. */
export async function creerSessionPaiement(
  auditId: unknown,
  plan: unknown,
): Promise<{ clientSecret: string } | { erreur: string }> {
  if (!stripeConfigure()) return { erreur: "Le paiement n’est pas encore ouvert." };
  if (typeof auditId !== "string" || !/^[0-9a-f-]{36}$/i.test(auditId)) return { erreur: "Calcul introuvable." };
  if (plan !== "audit" && plan !== "mensuel") return { erreur: "Formule inconnue." };

  const audit = await lireAudit(auditId); // vérifie que ce calcul appartient bien au visiteur
  if (!audit) return { erreur: "Ce calcul n’est pas accessible depuis cet appareil." };
  if (audit.debloque) return { erreur: "Ton plan est déjà débloqué : recharge la page." };

  const offre = OFFRES[plan as Plan];
  const h = await headers();
  const origine = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const metadata = { user_id: audit.userId, audit_id: auditId, plan: plan as string };

  try {
    const session = await stripe().checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: plan === "mensuel" ? "subscription" : "payment",
      locale: "fr",
      client_reference_id: audit.userId,
      customer_email: audit.email || undefined,
      metadata,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: offre.centimes,
            product_data: { name: `Tarif Juste — ${offre.nom}` },
            ...(plan === "mensuel" ? { recurring: { interval: "month" as const } } : {}),
          },
        },
      ],
      ...(plan === "mensuel"
        ? { subscription_data: { metadata } }
        : { customer_creation: "always" as const, payment_intent_data: { metadata } }),
      return_url: `${origine}/resultat/${auditId}?session_id={CHECKOUT_SESSION_ID}`,
    });
    if (!session.client_secret) return { erreur: "Le paiement n’a pas pu s’ouvrir." };
    return { clientSecret: session.client_secret };
  } catch (e) {
    console.error("Création de session Stripe impossible", e);
    const base = "Le paiement n’a pas pu s’ouvrir. Ta carte n’a pas été débitée : réessaie dans un instant.";
    // En mode test seulement : on affiche la raison exacte donnée par Stripe, pour diagnostiquer.
    const modeTest = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");
    return { erreur: modeTest ? `${base} [Mode test — Stripe : ${(e as Error).message}]` : base };
  }
}
