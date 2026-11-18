import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { accorderAcces, majStatutAbonnement, marquerRembourse } from "@/lib/acces";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Seule source de vérité des paiements : chaque appel est signé par Stripe et vérifié ici. */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ erreur: "non configuré" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ erreur: "signature invalide" }, { status: 400 });
  }

  // Un même événement n'est traité qu'une fois.
  const db = supabaseAdmin();
  const { error: dejaVu } = await db.from("stripe_events").insert({ id: event.id, type: event.type });
  if (dejaVu?.code === "23505") return NextResponse.json({ recu: true, doublon: true });

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await accorderAcces(event.data.object);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await majStatutAbonnement(event.data.object.id, event.data.object.status);
        break;
      case "charge.refunded": {
        const pi = event.data.object.payment_intent;
        if (pi) await marquerRembourse(typeof pi === "string" ? pi : pi.id);
        break;
      }
    }
  } catch (e) {
    // On libère l'événement pour que Stripe le renvoie plus tard.
    await db.from("stripe_events").delete().eq("id", event.id);
    console.error("Webhook Stripe en échec", event.type, e);
    return NextResponse.json({ erreur: "traitement impossible" }, { status: 500 });
  }

  return NextResponse.json({ recu: true });
}
