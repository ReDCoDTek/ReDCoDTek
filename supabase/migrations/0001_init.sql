-- Tarif Juste — schéma initial.
-- À coller une seule fois dans Supabase : SQL Editor → New query → Run.

-- 1. Les réponses aux 3 questions (les tarifs sont recalculés, jamais stockés)
create table if not exists public.audits (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  revenu_mensuel    integer not null check (revenu_mensuel between 500 and 30000),
  statut            text    not null check (statut in ('micro-liberal', 'micro-artisan', 'societe', 'autre')),
  taux_charges      numeric(4,1) not null check (taux_charges between 0 and 70),
  frais_mensuels    integer not null check (frais_mensuels between 0 and 20000),
  jours_par_semaine numeric(3,1) not null check (jours_par_semaine between 0.5 and 6),
  semaines_off      integer not null check (semaines_off between 0 and 30),
  tarif_actuel      integer not null check (tarif_actuel between 0 and 5000),
  created_at        timestamptz not null default now()
);
create index if not exists audits_user_idx on public.audits (user_id, created_at desc);

alter table public.audits enable row level security;
create policy "Chacun lit ses audits" on public.audits
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Chacun crée ses audits" on public.audits
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- 2. L'accès payant — écrit UNIQUEMENT par le webhook Stripe (clé secrète serveur)
create table if not exists public.access (
  user_id                    uuid primary key references auth.users (id) on delete cascade,
  plan                       text not null check (plan in ('audit', 'mensuel')),
  status                     text not null,
  email                      text,
  stripe_customer_id         text,
  stripe_subscription_id     text,
  stripe_checkout_session_id text,
  current_period_end         timestamptz,
  updated_at                 timestamptz not null default now()
);

alter table public.access enable row level security;
create policy "Chacun lit son accès" on public.access
  for select to authenticated using ((select auth.uid()) = user_id);
-- Aucune politique d'écriture : seul le serveur (clé secrète) peut écrire.

-- 3. Les événements Stripe déjà traités (un paiement n'est jamais compté deux fois)
create table if not exists public.stripe_events (
  id          text primary key,
  type        text not null,
  received_at timestamptz not null default now()
);
alter table public.stripe_events enable row level security;
-- Aucune politique : invisible pour les visiteurs, accessible au seul serveur.
