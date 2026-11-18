-- Tarif Juste — un accès par achat (un audit débloque UN calcul, le mensuel débloque tout).
-- À coller une seule fois dans Supabase : SQL Editor → New query → Run.

alter table public.access drop constraint if exists access_pkey;
alter table public.access add column if not exists id uuid not null default gen_random_uuid();
alter table public.access add primary key (id);
alter table public.access add column if not exists audit_id uuid references public.audits (id) on delete set null;
alter table public.access add column if not exists stripe_payment_intent text;
create unique index if not exists access_session_unique on public.access (stripe_checkout_session_id);
create index if not exists access_user_idx on public.access (user_id);
create index if not exists access_subscription_idx on public.access (stripe_subscription_id);
