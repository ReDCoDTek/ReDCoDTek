import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

export const stripeConfigure = () => Boolean(process.env.STRIPE_SECRET_KEY);

export function stripe() {
  const cle = process.env.STRIPE_SECRET_KEY;
  if (!cle) throw new Error("Stripe non configuré (STRIPE_SECRET_KEY manquante)");
  client ??= new Stripe(cle);
  return client;
}
