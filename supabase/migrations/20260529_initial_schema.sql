-- Conta Clara V2
-- Initial database schema
-- Tables: profiles, financial_spaces, subscriptions, categories, transactions

create extension if not exists pgcrypto;

-- =========================================================
-- profiles
-- =========================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

grant select, insert, update on table public.profiles to authenticated;

-- =========================================================
-- financial_spaces
-- =========================================================

create table if not exists public.financial_spaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null default 'personal',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  constraint financial_spaces_type_check
    check (type in ('personal', 'couple', 'family', 'business'))
);

alter table public.financial_spaces enable row level security;

create policy "Users can view their own financial spaces"
on public.financial_spaces
for select
to authenticated
using (auth.uid() = owner_id);

create policy "Users can insert their own financial spaces"
on public.financial_spaces
for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "Users can update their own financial spaces"
on public.financial_spaces
for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

grant select, insert, update on table public.financial_spaces to authenticated;

-- =========================================================
-- subscriptions
-- =========================================================

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  financial_space_id uuid not null references public.financial_spaces(id) on delete cascade,

  status text not null default 'trial',
  plan text not null default 'free_trial',

  trial_starts_at timestamp with time zone not null default now(),
  trial_ends_at timestamp with time zone not null default (now() + interval '30 days'),

  current_period_starts_at timestamp with time zone,
  current_period_ends_at timestamp with time zone,

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  constraint subscriptions_status_check
    check (status in ('trial', 'active', 'expired', 'blocked', 'cancelled')),

  constraint subscriptions_plan_check
    check (plan in ('free_trial', 'monthly', 'annual', 'manual')),

  constraint subscriptions_user_unique unique (user_id),
  constraint subscriptions_financial_space_unique unique (financial_space_id)
);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscription"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own trial subscription"
on public.subscriptions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and status = 'trial'
  and plan = 'free_trial'
  and exists (
    select 1
    from public.financial_spaces
    where financial_spaces.id = subscriptions.financial_space_id
    and financial_spaces.owner_id = auth.uid()
  )
);

grant select, insert on table public.subscriptions to authenticated;

-- =========================================================
-- categories
-- =========================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  financial_space_id uuid not null references public.financial_spaces(id) on delete cascade,

  name text not null,
  type text not null,
  color text,
  icon text,
  is_default boolean not null default false,
  active boolean not null default true,

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  constraint categories_type_check
    check (type in ('income', 'expense'))
);

alter table public.categories enable row level security;

create policy "Users can view their own categories"
on public.categories
for select
to authenticated
using (
  exists (
    select 1
    from public.financial_spaces
    where financial_spaces.id = categories.financial_space_id
    and financial_spaces.owner_id = auth.uid()
  )
);

create policy "Users can insert categories in their own financial space"
on public.categories
for insert
to authenticated
with check (
  exists (
    select 1
    from public.financial_spaces
    where financial_spaces.id = categories.financial_space_id
    and financial_spaces.owner_id = auth.uid()
  )
);

create policy "Users can update their own categories"
on public.categories
for update
to authenticated
using (
  exists (
    select 1
    from public.financial_spaces
    where financial_spaces.id = categories.financial_space_id
    and financial_spaces.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.financial_spaces
    where financial_spaces.id = categories.financial_space_id
    and financial_spaces.owner_id = auth.uid()
  )
);

grant select, insert, update on table public.categories to authenticated;

-- =========================================================
-- transactions
-- =========================================================

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  financial_space_id uuid not null references public.financial_spaces(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,

  type text not null,
  description text not null,
  amount numeric(12, 2) not null,
  due_date date not null,
  paid_date date,
  status text not null default 'pending',
  payment_method text not null default 'other',
  notes text,
  is_recurring_generated boolean not null default false,

  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  constraint transactions_type_check
    check (type in ('income', 'expense')),

  constraint transactions_status_check
    check (status in ('pending', 'paid', 'overdue', 'cancelled')),

  constraint transactions_payment_method_check
    check (
      payment_method in (
        'pix',
        'money',
        'debit',
        'credit_card',
        'bank_transfer',
        'boleto',
        'other'
      )
    ),

  constraint transactions_amount_check
    check (amount > 0)
);

alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
on public.transactions
for select
to authenticated
using (
  exists (
    select 1
    from public.financial_spaces
    where financial_spaces.id = transactions.financial_space_id
    and financial_spaces.owner_id = auth.uid()
  )
);

create policy "Users can insert transactions in their own financial space"
on public.transactions
for insert
to authenticated
with check (
  exists (
    select 1
    from public.financial_spaces
    where financial_spaces.id = transactions.financial_space_id
    and financial_spaces.owner_id = auth.uid()
  )
  and (
    category_id is null
    or exists (
      select 1
      from public.categories
      where categories.id = transactions.category_id
      and categories.financial_space_id = transactions.financial_space_id
    )
  )
);

create policy "Users can update their own transactions"
on public.transactions
for update
to authenticated
using (
  exists (
    select 1
    from public.financial_spaces
    where financial_spaces.id = transactions.financial_space_id
    and financial_spaces.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.financial_spaces
    where financial_spaces.id = transactions.financial_space_id
    and financial_spaces.owner_id = auth.uid()
  )
  and (
    category_id is null
    or exists (
      select 1
      from public.categories
      where categories.id = transactions.category_id
      and categories.financial_space_id = transactions.financial_space_id
    )
  )
);

grant select, insert, update on table public.transactions to authenticated;