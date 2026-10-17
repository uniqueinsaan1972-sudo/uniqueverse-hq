-- Run ONCE in Supabase (after admin.sql): SQL Editor -> New query -> paste -> Run. Safe to run again.
-- Adds user accounts support: tokens wallet, top-up requests, coupons, categories, template prices.

alter table public.websites add column if not exists owner_id uuid;
create index if not exists websites_owner_idx on public.websites (owner_id);
alter table public.template_overrides add column if not exists price int;

create table if not exists public.wallets (
  user_id uuid primary key,
  balance int not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.token_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  delta int not null,
  reason text not null,
  ref text,
  created_at timestamptz not null default now()
);
create index if not exists token_ledger_user_idx on public.token_ledger (user_id, created_at desc);

create table if not exists public.categories (
  id text primary key,
  label text not null,
  sort int not null default 0,
  hidden boolean not null default false
);

create table if not exists public.coupons (
  code text primary key,
  kind text not null check (kind in ('percent', 'flat')),
  value int not null check (value > 0),
  max_uses int,
  used int not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.topups (
  id text primary key,
  user_id uuid not null,
  email text not null,
  tokens int not null check (tokens between 1 and 100000),
  payable int not null,
  sent_amount int not null,
  coupon text,
  txn_id text,
  screenshot text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists topups_status_idx on public.topups (status, created_at desc);
create index if not exists topups_user_idx on public.topups (user_id, created_at desc);

alter table public.wallets enable row level security;
alter table public.token_ledger enable row level security;
alter table public.categories enable row level security;
alter table public.coupons enable row level security;
alter table public.topups enable row level security;
revoke all on public.wallets, public.token_ledger, public.categories, public.coupons, public.topups from anon, authenticated;
grant select, insert, update, delete on public.wallets, public.token_ledger, public.categories, public.coupons, public.topups to service_role;

-- Spend tokens in one atomic step. Returns false when the balance is too low.
create or replace function public.spend_tokens(p_user uuid, p_amount int, p_reason text, p_ref text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if p_amount <= 0 then return true; end if;
  update wallets set balance = balance - p_amount, updated_at = now() where user_id = p_user and balance >= p_amount;
  if not found then return false; end if;
  insert into token_ledger (user_id, delta, reason, ref) values (p_user, -p_amount, p_reason, p_ref);
  return true;
end $$;

-- Add (or, with a negative number, remove) tokens. Returns the new balance.
create or replace function public.grant_tokens(p_user uuid, p_amount int, p_reason text, p_ref text)
returns int language plpgsql security definer set search_path = public as $$
declare b int;
begin
  if p_amount = 0 then raise exception 'amount must not be zero'; end if;
  if p_amount < 0 then
    update wallets set balance = balance + p_amount, updated_at = now()
      where user_id = p_user and balance + p_amount >= 0 returning balance into b;
    if not found then raise exception 'not enough tokens to remove'; end if;
  else
    insert into wallets (user_id, balance) values (p_user, p_amount)
      on conflict (user_id) do update set balance = wallets.balance + p_amount, updated_at = now()
      returning balance into b;
  end if;
  insert into token_ledger (user_id, delta, reason, ref) values (p_user, p_amount, p_reason, p_ref);
  return b;
end $$;

-- Count one use of a coupon if it is valid. Returns its details, or null if it cannot be used.
create or replace function public.redeem_coupon(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r coupons;
begin
  update coupons set used = used + 1
    where code = upper(p_code) and active and (expires_at is null or expires_at > now()) and (max_uses is null or used < max_uses)
    returning * into r;
  if not found then return null; end if;
  return jsonb_build_object('code', r.code, 'kind', r.kind, 'value', r.value);
end $$;

create or replace function public.release_coupon(p_code text)
returns void language sql security definer set search_path = public as $$
  update coupons set used = greatest(used - 1, 0) where code = upper(p_code);
$$;

revoke all on function public.spend_tokens(uuid, int, text, text) from public, anon, authenticated;
revoke all on function public.grant_tokens(uuid, int, text, text) from public, anon, authenticated;
revoke all on function public.redeem_coupon(text) from public, anon, authenticated;
revoke all on function public.release_coupon(text) from public, anon, authenticated;
grant execute on function public.spend_tokens(uuid, int, text, text) to service_role;
grant execute on function public.grant_tokens(uuid, int, text, text) to service_role;
grant execute on function public.redeem_coupon(text) to service_role;
grant execute on function public.release_coupon(text) to service_role;

-- Make the API see the new tables right away.
notify pgrst, 'reload schema';
