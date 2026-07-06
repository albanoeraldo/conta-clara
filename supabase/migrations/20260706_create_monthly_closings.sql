create table if not exists public.monthly_closings (
  id uuid primary key default gen_random_uuid(),
  financial_space_id uuid not null references public.financial_spaces(id) on delete cascade,
  reference_month text not null,
  total_income numeric(12, 2) not null default 0,
  total_expenses numeric(12, 2) not null default 0,
  final_balance numeric(12, 2) not null default 0,
  biggest_category_name text,
  biggest_category_total numeric(12, 2),
  biggest_expense_description text,
  biggest_expense_amount numeric(12, 2),
  closed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint monthly_closings_reference_month_format_check
    check (reference_month ~ '^[0-9]{4}-[0-9]{2}$'),

  constraint monthly_closings_financial_space_month_unique
    unique (financial_space_id, reference_month)
);

create index if not exists monthly_closings_financial_space_id_idx
  on public.monthly_closings(financial_space_id);

create index if not exists monthly_closings_reference_month_idx
  on public.monthly_closings(reference_month);

alter table public.monthly_closings enable row level security;

create policy "Usuários podem visualizar fechamentos do próprio espaço financeiro"
on public.monthly_closings
for select
to authenticated
using (
  exists (
    select 1
    from public.financial_spaces
    where financial_spaces.id = monthly_closings.financial_space_id
      and financial_spaces.owner_id = auth.uid()
  )
);

create policy "Usuários podem criar fechamentos do próprio espaço financeiro"
on public.monthly_closings
for insert
to authenticated
with check (
  exists (
    select 1
    from public.financial_spaces
    where financial_spaces.id = monthly_closings.financial_space_id
      and financial_spaces.owner_id = auth.uid()
  )
);

create policy "Usuários podem atualizar fechamentos do próprio espaço financeiro"
on public.monthly_closings
for update
to authenticated
using (
  exists (
    select 1
    from public.financial_spaces
    where financial_spaces.id = monthly_closings.financial_space_id
      and financial_spaces.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.financial_spaces
    where financial_spaces.id = monthly_closings.financial_space_id
      and financial_spaces.owner_id = auth.uid()
  )
);

create policy "Usuários podem excluir fechamentos do próprio espaço financeiro"
on public.monthly_closings
for delete
to authenticated
using (
  exists (
    select 1
    from public.financial_spaces
    where financial_spaces.id = monthly_closings.financial_space_id
      and financial_spaces.owner_id = auth.uid()
  )
);

grant select, insert, update, delete on table public.monthly_closings to authenticated;